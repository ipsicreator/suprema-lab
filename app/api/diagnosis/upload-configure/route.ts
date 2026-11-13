import { NextResponse } from "next/server";
import type { CollectionModel } from "pocketbase";
import { hasPocketBaseAdmin, pbAdmin } from "@/lib/pocketbaseAdmin";
import { requireAdminOrThrow } from "@/lib/server-auth";

export const runtime = "nodejs";
const COLLECTION = "suprema_pdf_uploads";
function missing(error: unknown) { return !!error && typeof error === "object" && "status" in error && error.status === 404; }

export async function POST() {
  try {
    await requireAdminOrThrow();
    if (!hasPocketBaseAdmin()) return NextResponse.json({ ok: false, error: "pocketbase_admin_not_configured" }, { status: 503 });
    const pb = await pbAdmin();
    let col: CollectionModel;
    try { col = await pb.collections.getOne(COLLECTION); }
    catch (error) {
      if (!missing(error)) throw error;
      col = await pb.collections.create({
        name: COLLECTION, type: "base",
        listRule: null, viewRule: null, createRule: "", updateRule: null, deleteRule: null,
        fields: [
          { name: "file", type: "file", required: true, maxSelect: 1, maxSize: 50 * 1024 * 1024, mimeTypes: ["application/pdf"], protected: true },
          { name: "student_name", type: "text", required: false },
          { name: "school_name", type: "text", required: false },
        ],
      });
    }
    // Public create permits direct PDF upload; records and protected files remain private.
    const fileFields = col.fields.map(field => field.name === "file" ? { ...field, protected: true } : field);
    await pb.collections.update(col.id, { listRule: null, viewRule: null, createRule: "", updateRule: null, deleteRule: null, fields: fileFields });
    return NextResponse.json({ ok: true, collection: COLLECTION, rules: { listRule: null, viewRule: null, createRule: "", updateRule: null, deleteRule: null } });
  } catch (error: unknown) {
    const code = error instanceof Error ? error.message : "server_error";
    const status = code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : ["ADMIN_NOT_CONFIGURED", "AUTH_NOT_CONFIGURED"].includes(code) ? 503 : 500;
    return NextResponse.json({ ok: false, error: status === 500 ? "pocketbase_admin_configure_failed" : code }, { status });
  }
}
