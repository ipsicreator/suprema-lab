import { NextResponse } from "next/server";
import { requireAdminOrThrow } from "@/lib/server-auth";
import { assertSameOrigin } from "@/lib/http/same-origin";
import { hasPocketBaseAdmin, pbAdmin } from "@/lib/pocketbaseAdmin";
import { AcademyAccountError, manageAcademyAccount, parseAcademyAccountInput, readAcademyAccounts } from "@/lib/academy/accounts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const headers = { "Cache-Control": "no-store" };
function failure(error: unknown) {
  const code = error instanceof Error ? error.message : "";
  if (error instanceof AcademyAccountError) return NextResponse.json({ ok: false, error: error.message }, { status: error.status, headers });
  const known: Record<string, [number, string]> = {
    UNAUTHORIZED: [401, "마스터 로그인이 필요합니다."], FORBIDDEN: [403, "마스터만 학원 계정을 관리할 수 있습니다."], CROSS_ORIGIN: [403, "올바른 서비스 주소에서 다시 시도해 주세요."],
    AUTH_NOT_CONFIGURED: [503, "마스터 인증 설정을 확인해 주세요."], ADMIN_NOT_CONFIGURED: [503, "마스터 권한 설정을 확인해 주세요."],
  };
  const [status, message] = known[code] || [503, "학원 계정 요청을 완료하지 못했습니다. 계정 목록을 다시 확인해 주세요."];
  return NextResponse.json({ ok: false, error: message }, { status, headers });
}
async function database() {
  const actor = await requireAdminOrThrow();
  if (!actor.userId.endsWith(":google")) throw new AcademyAccountError(403, "기존 Google 마스터 계정으로 로그인해 주세요.");
  if (!hasPocketBaseAdmin()) throw new AcademyAccountError(503, "학원 계정 저장소가 설정되지 않았습니다.");
  return pbAdmin();
}
async function body(request: Request) {
  const maxBytes = 16 * 1024;
  if (Number(request.headers.get("content-length")) > maxBytes) throw new AcademyAccountError(413, "요청 크기가 너무 큽니다.");
  if (!request.body) throw new AcademyAccountError(400, "계정 요청을 입력해 주세요.");
  const reader = request.body.getReader(); const chunks: Uint8Array[] = []; let length = 0;
  try {
    while (true) { const { value, done } = await reader.read(); if (done) break; length += value.byteLength; if (length > maxBytes) { await reader.cancel(); throw new AcademyAccountError(413, "요청 크기가 너무 큽니다."); } chunks.push(value); }
  } finally { reader.releaseLock(); }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { throw new AcademyAccountError(400, "올바른 계정 요청을 입력해 주세요."); }
}
export async function GET() {
  try { return NextResponse.json(await readAcademyAccounts(await database()), { headers }); }
  catch (error) { return failure(error); }
}
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const db = await database();
    const input = parseAcademyAccountInput(await body(request));
    return NextResponse.json(await manageAcademyAccount(db, input), { headers });
  } catch (error) { return failure(error); }
}
