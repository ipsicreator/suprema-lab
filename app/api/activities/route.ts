import { activityContext, activityBody, activityFailure, activityResponse } from "@/lib/personal-activities-server";
import { activityKind, createActivity, listActivities, parseActivity } from "@/lib/personal-activities";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const kind = activityKind(url.searchParams.get("kind"));
    const page = Number(url.searchParams.get("page") ?? "1");
    const { db, owner } = await activityContext(request);
    return activityResponse(await listActivities(db, owner, kind, page));
  } catch (error) { return activityFailure(error); }
}
export async function POST(request: Request) {
  try {
    const { db, owner } = await activityContext(request, true);
    const input = parseActivity(await activityBody(request));
    return activityResponse({ item: await createActivity(db, owner, input) }, 201);
  } catch (error) { return activityFailure(error); }
}

export const maxDuration = 60;
