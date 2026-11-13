import { NextResponse } from "next/server";
import { gzipSync } from "node:zlib";
import { getActiveAdmissions } from "@/lib/admissions/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const rows = await getActiveAdmissions();
    const compressed = gzipSync(JSON.stringify({ success: true, rows }));
    if (compressed.byteLength > 4 * 1024 * 1024) throw new Error("Dataset response too large");
    return new NextResponse(new Uint8Array(compressed), { headers: { "Content-Type": "application/json; charset=utf-8", "Content-Encoding": "gzip", "Vary": "Accept-Encoding", "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ success: false, error: "입시 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
