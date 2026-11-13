import { auth } from "../../../../../auth";
import { requireAdminOrThrow } from "@/lib/server-auth";
import { pbAdmin } from "@/lib/pocketbaseAdmin";
import { ActivityError, activityKind, activityRevisions, ensureActivityCollection, listActivities } from "@/lib/personal-activities";
import { ensureActivityLinks, registerActivityLink, studentActivityOwner } from "@/lib/activity-links";
import { activityBody, activityFailure, activityResponse, verifyActivityOrigin } from "@/lib/personal-activities-server";
export const runtime="nodejs";
export const dynamic="force-dynamic";
async function master(request:Request,write=false){if(write)verifyActivityOrigin(request);try{await requireAdminOrThrow();const session=await auth();if((session?.user as {provider?:string}|undefined)?.provider!=="google")throw new Error("FORBIDDEN");}catch(error){const message=error instanceof Error?error.message:"";throw new ActivityError(message==="UNAUTHORIZED"?401:message==="FORBIDDEN"?403:503,"마스터 관리자로 로그인해 주세요.");}const db=await pbAdmin();await ensureActivityLinks(db);return db;}
export async function GET(request:Request){try{const db=await master(request);const url=new URL(request.url);if(url.searchParams.get("roster")==="1"){const students=await db.collection("suprima_students").getFullList({requestKey:null,fields:"id,name,academy_id",sort:"name",signal:AbortSignal.timeout(15000)});return activityResponse({students});}const {owner,studentName}=await studentActivityOwner(db,url.searchParams.get("studentId")||"",{role:"master"});await ensureActivityCollection(db);const id=url.searchParams.get("activityId");const data=id?{items:await activityRevisions(db,owner,id)}:await listActivities(db,owner,activityKind(url.searchParams.get("kind")),Number(url.searchParams.get("page")||1));return activityResponse({...data,studentName});}catch(error){return activityFailure(error);}}
export async function POST(request:Request){try{const db=await master(request,true);const body=await activityBody(request) as {studentId?:unknown;code?:unknown};if(!body||typeof body.studentId!=="string"||Object.keys(body).some(k=>!["studentId","code"].includes(k)))throw new ActivityError(400,"학생과 연결 코드를 확인해 주세요.");return activityResponse(await registerActivityLink(db,body.studentId,body.code,{role:"master"}));}catch(error){return activityFailure(error);}}

export const maxDuration = 60;
