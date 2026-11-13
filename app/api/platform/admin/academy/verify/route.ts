import { NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/http/same-origin";
import { requireAdminOrThrow } from "@/lib/server-auth";
import { hasPocketBaseAdmin, pbAdmin } from "@/lib/pocketbaseAdmin";
import { verifyAcademyAccess } from "@/lib/academy/verify";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  try {
    assertSameOrigin(request); await requireAdminOrThrow();
    if (!hasPocketBaseAdmin()) throw new Error("STORAGE_NOT_CONFIGURED");
    const result = await verifyAcademyAccess(await pbAdmin());
    return NextResponse.json(result, { status: result.success ? 200 : 409, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "SERVER_ERROR";
    const status = code === "UNAUTHORIZED" ? 401 : ["FORBIDDEN", "CROSS_ORIGIN"].includes(code) ? 403 : ["STORAGE_NOT_CONFIGURED", "AUTH_NOT_CONFIGURED", "ADMIN_NOT_CONFIGURED"].includes(code) ? 503 : 500;
    return NextResponse.json({ success: false, error: status === 401 ? "로그인이 필요합니다." : status === 403 ? "본사 관리자 권한과 올바른 요청 주소가 필요합니다." : "권한 검증을 실행하지 못했습니다. 저장소 설정을 확인해 주세요." }, { status, headers: { "Cache-Control": "no-store" } });
  }
}
