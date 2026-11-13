import { NextResponse } from "next/server";
import { requireAdminOrThrow } from "@/lib/server-auth";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    await requireAdminOrThrow();
    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNAUTHORIZED";
    const status = code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : 503;
    const message = status === 401 ? "로그인이 필요합니다." : status === 403 ? "관리자 권한이 필요합니다." : "관리자 인증 설정을 확인해 주세요.";
    return NextResponse.json({ success: false, error: message }, { status, headers: { "Cache-Control": "no-store" } });
  }
}
