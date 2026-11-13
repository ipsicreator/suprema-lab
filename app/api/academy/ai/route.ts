import { NextResponse } from "next/server";
import { AcademyBridgeError, academyCors, requireAcademyUser, readAcademyJson, parseAcademyInput, generateAcademyResult } from "@/lib/academy/bridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function OPTIONS(request: Request) {
  try { return new NextResponse(null, { status: 204, headers: academyCors(request) }); }
  catch { return NextResponse.json({ error: "허용되지 않은 요청 출처입니다." }, { status: 403, headers: { "Vary": "Origin", "Cache-Control": "no-store" } }); }
}
export async function POST(request: Request) {
  let headers = new Headers({ "Vary": "Origin", "Cache-Control": "no-store" });
  try {
    headers = academyCors(request);
    await requireAcademyUser(request);
    const input = parseAcademyInput(await readAcademyJson(request));
    return NextResponse.json(await generateAcademyResult(input, request.headers.get("authorization") || undefined), { headers });
  } catch (error) {
    const known = error instanceof AcademyBridgeError;
    return NextResponse.json({ error: known ? error.message : "학원 분석 요청을 처리하지 못했습니다." }, { status: known ? error.status : 503, headers });
  }
}
