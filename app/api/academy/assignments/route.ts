import { NextResponse } from "next/server";
import { AcademyBridgeError, academyCors, requireAcademyUser, readAcademyJson } from "@/lib/academy/bridge";
import { assignAcademyStudent, parseAssignmentInput, readAcademyAssignments, requireAssignmentManager } from "@/lib/academy/assignments";
import { hasPocketBaseAdmin, pbAdmin } from "@/lib/pocketbaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
function cors(request: Request) {
  const headers = academyCors(request);
  headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  return headers;
}
function failure(error: unknown, headers: Headers) {
  const known = error instanceof AcademyBridgeError;
  return NextResponse.json({ error: known ? error.message : "학생 배정 요청을 처리하지 못했습니다." }, { status: known ? error.status : 503, headers });
}
export async function OPTIONS(request: Request) {
  try { return new NextResponse(null, { status: 204, headers: cors(request) }); }
  catch { return NextResponse.json({ error: "허용되지 않은 요청 출처입니다." }, { status: 403, headers: { Vary: "Origin", "Cache-Control": "no-store" } }); }
}
async function context(request: Request) {
  const actor = await requireAcademyUser(request);
  requireAssignmentManager(actor);
  if (!hasPocketBaseAdmin()) throw new AcademyBridgeError(503, "학원 배정 저장소가 설정되지 않았습니다.");
  return { actor, db: await pbAdmin() };
}
export async function GET(request: Request) {
  let headers = new Headers({ Vary: "Origin", "Cache-Control": "no-store" });
  try {
    headers = cors(request);
    const { actor, db } = await context(request);
    return NextResponse.json(await readAcademyAssignments(db, actor), { headers });
  } catch (error) { return failure(error, headers); }
}
export async function PATCH(request: Request) {
  let headers = new Headers({ Vary: "Origin", "Cache-Control": "no-store" });
  try {
    headers = cors(request);
    const { actor, db } = await context(request);
    const input = parseAssignmentInput(await readAcademyJson(request));
    return NextResponse.json(await assignAcademyStudent(db, actor, input), { headers });
  } catch (error) { return failure(error, headers); }
}
export const POST = PATCH;
