import { NextResponse } from "next/server";
import { AcademyBridgeError, academyCors, readAcademyJson, requireAcademyUser } from "@/lib/academy/bridge";
import { pbAdmin } from "@/lib/pocketbaseAdmin";
import { ActivityError, activityKind, activityRevisions, ensureActivityCollection, listActivities } from "@/lib/personal-activities";
import { ensureActivityLinks, registerActivityLink, studentActivityOwner } from "@/lib/activity-links";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
function failure(error:unknown,headers:Headers){const known=error instanceof ActivityError || error instanceof AcademyBridgeError;return NextResponse.json({error:known?error.message:"활동 기록 연결을 확인하지 못했습니다."},{status:known?error.status:503,headers});}
export async function OPTIONS(request:Request){try{return new NextResponse(null,{status:204,headers:academyCors(request)});}catch{return NextResponse.json({error:"허용되지 않은 출처입니다."},{status:403});}}
export async function GET(request:Request){let headers=new Headers({Vary:"Origin","Cache-Control":"no-store"});try{headers=academyCors(request);const actor=await requireAcademyUser(request),db=await pbAdmin();await ensureActivityLinks(db);const url=new URL(request.url),studentId=url.searchParams.get("studentId")||"";const {owner,studentName}=await studentActivityOwner(db,studentId,actor);await ensureActivityCollection(db);const activityId=url.searchParams.get("activityId");const data=activityId?{items:await activityRevisions(db,owner,activityId)}:await listActivities(db,owner,activityKind(url.searchParams.get("kind")),Number(url.searchParams.get("page")||1));return NextResponse.json({...data,studentName},{headers});}catch(error){return failure(error,headers);}}
export async function POST(request:Request){let headers=new Headers({Vary:"Origin","Cache-Control":"no-store"});try{headers=academyCors(request);const actor=await requireAcademyUser(request),db=await pbAdmin();const body=await readAcademyJson(request) as {studentId?:unknown;code?:unknown};if(!body||typeof body.studentId!=="string"||Object.keys(body).some(k=>!["studentId","code"].includes(k)))throw new ActivityError(400,"학생과 연결 코드를 확인해 주세요.");await ensureActivityLinks(db);return NextResponse.json(await registerActivityLink(db,body.studentId,body.code,actor),{headers});}catch(error){return failure(error,headers);}}

export const maxDuration = 60;
