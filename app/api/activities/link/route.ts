import { ActivityError } from "@/lib/personal-activities";
import { activityBody, activityContext, activityFailure, activityResponse } from "@/lib/personal-activities-server";
import { ensureActivityLinks, issueActivityCode, ownActivityLinks, revokeActivityLink } from "@/lib/activity-links";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try { const {db,owner} = await activityContext(request); await ensureActivityLinks(db); return activityResponse({links:await ownActivityLinks(db,owner)}); }
  catch(error) { return activityFailure(error); }
}
export async function POST(request: Request) {
  try { const {db,owner} = await activityContext(request,true); await ensureActivityLinks(db); return activityResponse(await issueActivityCode(db,owner),201); }
  catch(error) { return activityFailure(error); }
}
export async function DELETE(request: Request) {
  try { const {db,owner} = await activityContext(request,true); const input=await activityBody(request) as {id?:unknown}; if (!input || Object.keys(input).some(k=>k!=="id")) throw new ActivityError(400,"연결 항목을 확인해 주세요."); await ensureActivityLinks(db); await revokeActivityLink(db,owner,input.id); return activityResponse({revoked:true}); }
  catch(error) { return activityFailure(error); }
}

export const maxDuration = 60;
