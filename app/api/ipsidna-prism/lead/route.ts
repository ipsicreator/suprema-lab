import { NextResponse } from "next/server";
import { pbAdmin, hasPocketBaseAdmin } from "@/lib/pocketbaseAdmin";

export async function POST(req: Request) {
  if (!hasPocketBaseAdmin()) {
    return NextResponse.json({ ok: false, error: "pocketbase_not_configured" }, { status: 500 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const name = String(body?.name ?? "").trim();
  const school = String(body?.school ?? "").trim();
  const grade = String(body?.grade ?? "").trim();
  const student_phone = String(body?.student_phone ?? "").trim();
  const parent_phone = String(body?.parent_phone ?? "").trim();
  const email = String(body?.email ?? "").trim();

  if (!name || !school || !grade || !parent_phone || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || [name, school, grade, student_phone, parent_phone, email].some(value => value.length > 254)) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  const pb = await pbAdmin();
  const created = await pb.collection("suprema_prism_leads").create({
    name,
    school,
    grade,
    student_phone,
    parent_phone,
    email,
    source: "web",
  });

  return NextResponse.json({ ok: true, id: created.id });
}

