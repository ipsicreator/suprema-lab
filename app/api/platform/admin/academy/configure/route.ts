import { NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/http/same-origin";
import { requireAdminOrThrow } from "@/lib/server-auth";
import { hasPocketBaseAdmin, pbAdmin } from "@/lib/pocketbaseAdmin";
import { configureAcademySecurity } from "@/lib/academy/security";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const actor = await requireAdminOrThrow();
    if (!hasPocketBaseAdmin()) throw new Error("STORAGE_NOT_CONFIGURED");
    return NextResponse.json(await configureAcademySecurity(await pbAdmin(), actor.email), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "SERVER_ERROR";
    const status = ["UNAUTHORIZED"].includes(code) ? 401 : ["FORBIDDEN", "CROSS_ORIGIN"].includes(code) ? 403 : ["STORAGE_NOT_CONFIGURED", "AUTH_NOT_CONFIGURED", "ADMIN_NOT_CONFIGURED"].includes(code) ? 503 : code === "ACADEMY_SCHEMA_REQUIRES_REVIEW" || code === "ACADEMY_BACKUP_REQUIRES_REVIEW" ? 409 : 500;
    const detail = code === "ACADEMY_RESTORE_REQUIRED" ? "일부 설정을 복원하지 못했습니다. 비공개 이전 설정에서 복원이 필요합니다." : code === "ACADEMY_CONFIGURATION_ROLLED_BACK" ? "설정을 적용하지 못해 이전 상태로 복원했습니다." : status === 409 ? "기존 소속·담당자 관계가 예상 구조와 다릅니다. 자료를 바꾸지 않고 중단했습니다." : status === 401 ? "로그인이 필요합니다." : status === 403 ? "본사 관리자 권한과 올바른 요청 주소가 필요합니다." : "학원 권한 설정을 완료하지 못했습니다. 저장소 연결을 확인해 주세요.";
    const diagnostic = error && typeof error === "object" ? error as { phase?: string; collection?: string; backendStatus?: number; invalidFields?: string[]; validationCodes?: string[] } : {};
    return NextResponse.json({ success: false, error: detail, code: code.startsWith("ACADEMY_") ? code : undefined, phase: diagnostic.phase, collection: diagnostic.collection, backendStatus: diagnostic.backendStatus, invalidFields: diagnostic.invalidFields, validationCodes: diagnostic.validationCodes }, { status, headers: { "Cache-Control": "no-store" } });
  }
}



