import { createHash, randomBytes } from "node:crypto";
import type PocketBase from "pocketbase";
import type { RecordModel } from "pocketbase";

export const ACTIVITY_COLLECTION = "suprema_personal_activities";
export const ACTIVITY_KINDS = ["exploration", "setuk", "reading"] as const;
export type ActivityKind = typeof ACTIVITY_KINDS[number];
export type ActivityInput = { kind: ActivityKind; title: string; content: string; activityDate: string };
export type ActivityPatch = Omit<ActivityInput, "kind"> & { version: number };
export type ActivityItem = ActivityInput & { id: string; version: number; created: string; updated: string };
export class ActivityError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
const options = () => ({ requestKey: null, signal: AbortSignal.timeout(15_000) });
function status(error: unknown): number { return error && typeof error === "object" && "status" in error ? Number(error.status) : 0; }
export function activityOwner(session: unknown): string {
  const user = (session as { user?: { id?: string; provider?: string; providerId?: string } } | null)?.user;
  if (!user) throw new ActivityError(401, "로그인 후 활동을 저장할 수 있습니다.");
  const identity = user.providerId || user.id ? [user.provider || "account", user.providerId || user.id] : null;
  if (!identity) throw new ActivityError(401, "계정 확인을 위해 다시 로그인해 주세요.");
  return createHash("sha256").update(JSON.stringify(identity)).digest("hex");
}
export function activityKind(value: unknown): ActivityKind {
  if (!ACTIVITY_KINDS.includes(value as ActivityKind)) throw new ActivityError(400, "활동 구분을 확인해 주세요.");
  return value as ActivityKind;
}
export function parseActivity(value: unknown): ActivityInput;
export function parseActivity(value: unknown, editing: true): ActivityPatch;
export function parseActivity(value: unknown, editing = false): ActivityInput | ActivityPatch {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ActivityError(400, "활동 내용을 확인해 주세요.");
  const data = value as Record<string, unknown>;
  const allowed = editing ? ["title", "content", "activityDate", "version"] : ["title", "content", "activityDate", "kind"];
  if (Object.keys(data).some(key => !allowed.includes(key))) throw new ActivityError(400, "허용되지 않은 입력 항목입니다.");
  const text = (name: string, max: number) => {
    const v = data[name];
    if (typeof v !== "string" || !v.trim() || v.length > max || v.includes("\u0000")) throw new ActivityError(400, "제목과 활동 내용을 입력 범위에 맞게 작성해 주세요.");
    return v.trim();
  };
  const title = text("title", 160), content = text("content", 20_000), activityDate = text("activityDate", 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(activityDate) || !Number.isFinite(Date.parse(activityDate)) || new Date(activityDate).toISOString().slice(0, 10) !== activityDate) throw new ActivityError(400, "올바른 활동 날짜를 입력해 주세요.");
  if (editing) {
    if (!Number.isSafeInteger(data.version) || Number(data.version) < 1) throw new ActivityError(400, "수정할 기록을 다시 선택해 주세요.");
    return { title, content, activityDate, version: Number(data.version) };
  }
  return { title, content, activityDate, kind: activityKind(data.kind) };
}
function item(record: RecordModel): ActivityItem {
  return { id: record.activity_key, kind: record.kind, title: record.title, content: record.content, activityDate: record.activity_date, version: record.revision, created: record.started_at, updated: record.recorded_at };
}
function validateKey(id: string) { if (!/^[a-f0-9]{24}$/.test(id)) throw new ActivityError(400, "활동 번호가 올바르지 않습니다."); }
function recordId(owner: string, key: string, revision: number) { return createHash("sha256").update(JSON.stringify([owner, key, revision])).digest("hex").slice(0, 15); }
export async function createActivity(db: PocketBase, owner: string, input: ActivityInput): Promise<ActivityItem> {
  const key = randomBytes(12).toString("hex"), now = new Date().toISOString();
  const record = await db.collection(ACTIVITY_COLLECTION).create({ id: recordId(owner, key, 1), owner_key: owner, activity_key: key, revision: 1, kind: input.kind, title: input.title, content: input.content, activity_date: input.activityDate, started_at: now, recorded_at: now }, options());
  return item(record);
}
export async function listActivities(db: PocketBase, owner: string, kind: ActivityKind, page: number) {
  if (!Number.isSafeInteger(page) || page < 1 || page > 100_000) throw new ActivityError(400, "페이지 번호를 확인해 주세요.");
  const records = await db.collection(ACTIVITY_COLLECTION).getFullList({ ...options(), filter: db.filter("owner_key = {:owner} && kind = {:kind}", { owner, kind }), sort: "-revision,-recorded_at" });
  const latest = new Map<string, ActivityItem>();
  for (const row of records) if (!latest.has(row.activity_key) || latest.get(row.activity_key)!.version < row.revision) latest.set(row.activity_key, item(row));
  const all = [...latest.values()].sort((a, b) => b.updated.localeCompare(a.updated) || b.id.localeCompare(a.id));
  return { items: all.slice((page - 1) * 20, page * 20), page, totalPages: Math.max(1, Math.ceil(all.length / 20)), totalItems: all.length };
}
export async function activityRevisions(db: PocketBase, owner: string, id: string): Promise<ActivityItem[]> {
  validateKey(id);
  const result = await db.collection(ACTIVITY_COLLECTION).getList(1, 100, { ...options(), filter: db.filter("owner_key = {:owner} && activity_key = {:id}", { owner, id }), sort: "-revision" });
  if (!result.items.length) throw new ActivityError(404, "활동을 찾을 수 없습니다.");
  return result.items.map(item);
}
export async function editActivity(db: PocketBase, owner: string, id: string, input: ActivityPatch): Promise<ActivityItem> {
  const [previous] = await activityRevisions(db, owner, id);
  if (previous.version !== input.version) throw new ActivityError(409, "다른 화면에서 수정된 기록입니다. 최신 기록을 다시 불러와 주세요.");
  const revision = previous.version + 1;
  const nextId = recordId(owner, id, revision);
  try {
    const record = await db.collection(ACTIVITY_COLLECTION).create({ id: nextId, owner_key: owner, activity_key: id, revision, kind: previous.kind, title: input.title, content: input.content, activity_date: input.activityDate, started_at: previous.created, recorded_at: new Date().toISOString() }, options());
    return item(record);
  } catch (error) {
    if (status(error) === 400) {
      const existing = await db.collection(ACTIVITY_COLLECTION).getOne(nextId, options()).catch(() => null);
      if (existing?.owner_key === owner && existing.activity_key === id && existing.revision === revision) throw new ActivityError(409, "다른 화면에서 수정된 기록입니다. 최신 기록을 다시 불러와 주세요.");
    }
    throw error;
  }
}

export async function ensureActivityCollection(db: PocketBase) {
  const rules = ["listRule", "viewRule", "createRule", "updateRule", "deleteRule"] as const;
  let collection;
  try { collection = await db.collections.getOne(ACTIVITY_COLLECTION, options()); }
  catch (error) {
    if (status(error) !== 404) throw error;
    const users = await db.collections.getOne("users", options());
    const legacy = Array.isArray(users.schema);
    const text = (name: string, max: number) => ({ name, type: "text", required: true, ...(legacy ? { options: { max } } : { max }) });
    const fields = [text("owner_key", 64), text("activity_key", 24), { name: "revision", type: "number", required: true, ...(legacy ? { options: { min: 1, noDecimal: true } } : { min: 1, onlyInt: true }) }, text("kind", 20), text("title", 160), text("content", 20_000), text("activity_date", 10), text("started_at", 30), text("recorded_at", 30)];
    try {
      collection = await db.collections.create({ name: ACTIVITY_COLLECTION, type: "base", ...Object.fromEntries(rules.map(rule => [rule, null])), [legacy ? "schema" : "fields"]: fields, indexes: [`CREATE INDEX idx_personal_activity_owner ON ${ACTIVITY_COLLECTION} (owner_key, kind, recorded_at)`] }, options());
    } catch (createError) {
      // Another first request may already have created the collection.
      collection = await db.collections.getOne(ACTIVITY_COLLECTION, options()).catch(() => { throw createError; });
    }
  }
  const fields = (collection.schema ?? collection.fields) as { name: string; type: string; required?: boolean }[] | undefined;
  const required = ["owner_key", "activity_key", "revision", "kind", "title", "content", "activity_date", "started_at", "recorded_at"];
  if (collection.type !== "base" || rules.some(rule => collection[rule] !== null) || !Array.isArray(fields) || required.some(name => !fields.some(field => field.name === name && field.type === (name === "revision" ? "number" : "text") && field.required))) throw new ActivityError(503, "활동 저장소 설정을 확인해야 합니다.");
}

