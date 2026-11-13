import { NextResponse } from "next/server";
import { gzipSync } from "node:zlib";
import { getActiveAdmissions } from "@/lib/admissions/store";
import { AcademyBridgeError, academyCors } from "@/lib/academy/bridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function OPTIONS(request: Request) {
  try { return new NextResponse(null, { status: 204, headers: academyCors(request) }); }
  catch { return NextResponse.json({ success: false, error: "허용되지 않은 요청 출처입니다." }, { status: 403, headers: { "Vary": "Origin", "Cache-Control": "no-store" } }); }
}
export async function GET(request: Request) {
  let headers = new Headers({ "Vary": "Accept-Encoding, Origin", "Cache-Control": "no-store" });
  try {
    headers = academyCors(request);
    headers.set("Vary", "Accept-Encoding, Origin");
    const rows = await getActiveAdmissions();
    const compressed = gzipSync(JSON.stringify({ success: true, rows }));
    if (compressed.byteLength > 4 * 1024 * 1024) throw new Error("Dataset response too large");
    headers.set("Content-Type", "application/json; charset=utf-8");
    headers.set("Content-Encoding", "gzip");
    return new NextResponse(new Uint8Array(compressed), { headers });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof AcademyBridgeError ? error.message : "입시 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." }, { status: error instanceof AcademyBridgeError ? error.status : 503, headers });
  }
}
