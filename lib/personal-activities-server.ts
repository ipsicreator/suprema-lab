import { assertSameOrigin } from "./http/same-origin";
import { NextResponse } from "next/server";
import { auth } from "../auth";
import { pbAdmin } from "./pocketbaseAdmin";
import { ActivityError, activityOwner, ensureActivityCollection } from "./personal-activities";

export async function activityContext(request: Request, writing = false) {
  if (writing) verifyActivityOrigin(request);
  const owner = activityOwner(await auth());
  const db = await pbAdmin();
  await ensureActivityCollection(db);
  return { owner, db };
}
export function verifyActivityOrigin(request: Request) {
  try { if (request.headers.get("sec-fetch-site") === "cross-site") throw new Error("CROSS_ORIGIN"); assertSameOrigin(request); }
  catch { throw new ActivityError(403, "현재 사이트에서 다시 저장해 주세요."); }
}
export async function activityBody(request: Request): Promise<unknown> {
  if (!(request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() === "application/json")) throw new ActivityError(415, "올바른 형식으로 활동을 전송해 주세요.");
  if (!request.body) throw new ActivityError(400, "활동 내용을 입력해 주세요.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 100_000) { await reader.cancel(); throw new ActivityError(413, "활동 내용이 너무 깁니다."); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw new ActivityError(400, "활동 내용을 확인해 주세요."); }
}
export function activityResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "private, no-store", "Vary": "Cookie" } });
}
export function activityFailure(error: unknown) {
  if (error instanceof ActivityError) return activityResponse({ error: error.message }, error.status);
  console.error("Personal activity storage failed", error instanceof Error ? error.name : "backend_error");
  return activityResponse({ error: "활동을 저장하거나 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." }, 503);
}
