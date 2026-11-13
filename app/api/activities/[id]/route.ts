import { activityContext, activityBody, activityFailure, activityResponse } from "@/lib/personal-activities-server";
import { activityRevisions, editActivity, parseActivity } from "@/lib/personal-activities";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, context: Context) {
  try {
    const { db, owner } = await activityContext(request);
    const { id } = await context.params;
    return activityResponse({ items: await activityRevisions(db, owner, id) });
  } catch (error) { return activityFailure(error); }
}
export async function PATCH(request: Request, context: Context) {
  try {
    const { db, owner } = await activityContext(request, true);
    const { id } = await context.params;
    const input = parseActivity(await activityBody(request), true);
    return activityResponse({ item: await editActivity(db, owner, id, input) });
  } catch (error) { return activityFailure(error); }
}

export const maxDuration = 60;
