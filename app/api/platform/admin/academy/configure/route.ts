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
    const detail = code === "ACADEMY_CONFIGURATION_LOCKED" ? "기존 자료는 보존했습니다. 학원 접근을 임시 차단했으며 설정 보완이 필요합니다." : code === "ACADEMY_LOCKDOWN_REQUIRED" ? "기존 자료는 보존했습니다. 일부 학원 접근 차단을 확인하지 못해 관리자 점검이 필요합니다." : status === 409 ? "기존 소속·담당자 관계가 예상 구조와 다릅니다. 자료를 바꾸지 않고 중단했습니다." : status === 401 ? "로그인이 필요합니다." : status === 403 ? "본사 관리자 권한과 올바른 요청 주소가 필요합니다." : "학원 권한 설정을 완료하지 못했습니다. 저장소 연결을 확인해 주세요.";
    const diagnostic = error && typeof error === "object" ? error as Record<string, unknown> : {};
    return NextResponse.json({ success: false, error: detail, code: code.startsWith("ACADEMY_") ? code : undefined, phase: diagnostic.phase, collection: diagnostic.collection, backendStatus: diagnostic.backendStatus, invalidFields: diagnostic.invalidFields, validationCodes: diagnostic.validationCodes, backendMessage: diagnostic.backendMessage, validationDetails: diagnostic.validationDetails, attemptedDetachedProfiles: diagnostic.attemptedDetachedProfiles, remainingDuplicates: diagnostic.remainingDuplicates, quarantined: diagnostic.quarantined, schemaKind: diagnostic.schemaKind, studentFieldPresentAfterRelationAdd: diagnostic.studentFieldPresentAfterRelationAdd, locked: diagnostic.locked, linksRestored: diagnostic.linksRestored, verifyCheck: diagnostic.verifyCheck, lockWriteErrors: diagnostic.lockWriteErrors }, { status, headers: { "Cache-Control": "no-store" } });
  }
}






