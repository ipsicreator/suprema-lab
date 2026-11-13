import { auth } from "@/auth";
import { assertSameOrigin } from "@/lib/http/same-origin";
import { NextResponse } from "next/server";
import { gzipSync, gunzipSync } from "node:zlib";
import { MAX_EXPANDED_BYTES, MAX_UPLOAD_BYTES, normalizeRows } from "@/lib/admissions/import";
import { getAdmissionRevisions, publishAdmissions, stageAdmissions } from "@/lib/admissions/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function requireAdmin() {
  if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET) throw new Error("AUTH_NOT_CONFIGURED");
  const session = await auth();
  if (!session?.user?.email) throw new Error("UNAUTHORIZED");
  const emails = (process.env.ADMIN_EMAILS || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  if (!emails.length) throw new Error("ADMIN_NOT_CONFIGURED");
  if (!emails.includes(session.user.email.toLowerCase())) throw new Error("FORBIDDEN");
  return session.user.email;
}
function failure(error: unknown) {
  const message = error instanceof Error ? error.message : "파일을 처리하지 못했습니다.";
  const known: Record<string, [number, string]> = {
    CROSS_ORIGIN: [403, "올바른 서비스 주소에서 다시 시도해 주세요."],
    UNAUTHORIZED: [401, "로그인이 필요합니다."], FORBIDDEN: [403, "입시 데이터는 본사 관리자만 반영할 수 있습니다."],
    AUTH_NOT_CONFIGURED: [503, "서버의 AUTH_SECRET을 설정해 주세요."],
    ADMIN_NOT_CONFIGURED: [503, "서버의 ADMIN_EMAILS에 관리자 이메일을 설정해 주세요."],
    ADMISSIONS_STORAGE_NOT_CONFIGURED: [503, "배포 환경의 영구 저장소를 설정해 주세요. PB_URL, PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD가 필요합니다."],
    TOO_LARGE: [413, "반영할 데이터가 너무 큽니다. 불필요한 열을 줄여 주세요."],
  };
  const [status, detail] = known[message] || [400, message];
  // Infrastructure errors must not reveal backend details or credentials.
  const safeDetail = /https?:\/\/|ECONN|fetch failed|ENOSPC|EACCES|ENOENT/i.test(detail) ? "저장소에 연결하지 못했습니다. 기존 데이터는 유지됩니다." : detail;
  return NextResponse.json({ success: false, error: safeDetail }, { status, headers: { "Cache-Control": "no-store" } });
}
async function readBody(req: Request, limit: number) {
  const reader = req.body?.getReader();
  if (!reader) throw new Error("업로드 내용이 없습니다.");
  const chunks: Uint8Array[] = []; let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      length += value.byteLength;
      if (length > limit) { await reader.cancel(); throw new Error("TOO_LARGE"); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks);
}
export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json({ success: true, ...await getAdmissionRevisions() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return failure(error); }
}
export async function POST(req: Request) {
  try {
    assertSameOrigin(req); const actor = await requireAdmin();
    const bytes = await readBody(req, MAX_UPLOAD_BYTES + 64 * 1024);
    const form = await new Response(bytes, { headers: { "Content-Type": req.headers.get("content-type") || "" } }).formData();
    if (form.get("action") !== "preview") throw new Error("지원하지 않는 요청입니다.");
    const file = form.get("file");
    if (!(file instanceof File) || !file.size || file.size > MAX_UPLOAD_BYTES) throw new Error("TOO_LARGE");
    const fileName = String(form.get("fileName") || "").split(/[\\/]/).pop() || "";
    if (fileName.length > 200 || !/\.(xlsx|xls|csv|tsv)$/i.test(fileName)) throw new Error("엑셀(.xlsx, .xls), CSV 또는 TSV 파일을 선택해 주세요.");
    const sheetName = String(form.get("sheetName") || "");
    if (!sheetName || sheetName.length > 128) throw new Error("시트를 선택해 주세요.");
    let raw: unknown;
    try { raw = JSON.parse(gunzipSync(Buffer.from(await file.arrayBuffer()), { maxOutputLength: MAX_EXPANDED_BYTES }).toString("utf8")); }
    catch { throw new Error("업로드 내용이 올바르지 않거나 압축 해제 크기를 초과했습니다."); }
    if (!Array.isArray(raw)) throw new Error("행 데이터 형식이 올바르지 않습니다.");
    const { rows, ...preview } = normalizeRows(raw);
    if (gzipSync(JSON.stringify(rows)).byteLength > MAX_UPLOAD_BYTES) throw new Error("TOO_LARGE");
    const revision = await stageAdmissions(rows, { fileName, sheetName, actor });
    return NextResponse.json({ success: true, draftId: revision.id, preview }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return failure(error); }
}
export async function PUT(req: Request) {
  try {
    assertSameOrigin(req); const actor = await requireAdmin();
    const body = JSON.parse((await readBody(req, 4096)).toString("utf8")) as {action?: string; id?: string};
    if (!["publish", "rollback"].includes(body.action || "") || typeof body.id !== "string" || !/^[a-zA-Z0-9_-]{1,80}$/.test(body.id)) throw new Error("반영할 버전을 선택해 주세요.");
    if (body.action === "rollback") {
      const { history } = await getAdmissionRevisions();
      if (!history.some(item => item.id === body.id)) throw new Error("반영 이력이 있는 버전만 복원할 수 있습니다.");
    }
    const current = await publishAdmissions(body.id, actor);
    return NextResponse.json({ success: true, current }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return failure(error); }
}
