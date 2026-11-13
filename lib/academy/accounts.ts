import type PocketBase from "pocketbase";
import { randomInt } from "node:crypto";

type Row = Record<string, unknown>;
export class AcademyAccountError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
const options = () => ({ requestKey: null, signal: AbortSignal.timeout(10_000) });
function fail(status: number, message: string): never { throw new AcademyAccountError(status, message); }
const idPattern = /^[a-z0-9]{15}$/;
function password(value: unknown) {
  if (typeof value !== "string" || value.length < 12 || value.length > 128 || /[\r\n\u0000]/.test(value)) fail(400, "비밀번호는 줄바꿈 없이 12~128자로 입력해 주세요.");
  return value;
}
export function parseAcademyAccountInput(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(400, "계정 요청 형식을 확인해 주세요.");
  const input = value as Row;
  if (input.action === "change-password") {
    if (Object.keys(input).some(key => !["action", "profileId", "newPassword"].includes(key)) || typeof input.profileId !== "string" || !idPattern.test(input.profileId)) fail(400, "비밀번호 변경 항목을 확인해 주세요.");
    return { action: "change-password" as const, profileId: input.profileId, newPassword: password(input.newPassword) };
  }
  if (input.action !== "provision" || Object.keys(input).some(key => !["action", "academyId", "profileId", "name", "role", "email", "password"].includes(key))) fail(400, "지원하지 않는 계정 요청입니다.");
  if (typeof input.academyId !== "string" || !input.academyId.trim() || input.academyId.length > 200 || typeof input.name !== "string" || !input.name.trim() || input.name.length > 100 || !["admin", "consultant"].includes(String(input.role)) || typeof input.email !== "string" || input.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email) || (input.profileId !== undefined && (typeof input.profileId !== "string" || !idPattern.test(input.profileId)))) fail(400, "학원·이름·역할·로그인 이메일을 확인해 주세요.");
  return { action: "provision" as const, academyId: input.academyId, profileId: input.profileId as string | undefined, name: input.name.trim(), role: input.role as "admin" | "consultant", email: input.email.toLowerCase(), password: password(input.password) };
}
type Input = ReturnType<typeof parseAcademyAccountInput>;
async function accountSchema(db: PocketBase) {
  const [users, profiles] = await Promise.all([db.collections.getOne("users", options()), db.collections.getOne("suprima_profiles", options())]);
  const model = profiles as unknown as Row;
  const fields = Array.isArray(model.fields) ? model.fields : Array.isArray(model.schema) ? model.schema : [];
  const owner = fields.find(field => field && typeof field === "object" && field.name === "user") as Row | undefined;
  const config = owner?.options && typeof owner.options === "object" ? owner.options as Row : owner;
  if (owner?.type !== "relation" || config?.collectionId !== users.id || config?.maxSelect !== 1) fail(503, "학원 계정의 사용자 관계 설정을 확인해 주세요.");
}
async function availableId(db: PocketBase, collection: string) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const id = Array.from({ length: 15 }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[randomInt(36)]).join("");
    try { await db.collection(collection).getOne(id, { ...options(), fields: "id" }); }
    catch (error) { if (error && typeof error === "object" && "status" in error && error.status === 404) return id; throw error; }
  }
  return fail(503, "새 계정 식별자를 준비하지 못했습니다.");
}
async function academyIds(db: PocketBase) {
  const records = await Promise.all(["suprima_profiles", "suprima_licenses", "suprima_students"].map(name => db.collection(name).getFullList({ ...options(), fields: "academy_id" })));
  return new Set(records.flat().map(record => record.academy_id).filter((id): id is string => typeof id === "string" && Boolean(id.trim())));
}
async function uniqueAccount(db: PocketBase, profile: Row) {
  if (profile.role === "master") fail(403, "마스터 계정은 학원 비밀번호 관리 대상이 아닙니다.");
  if (!["admin", "consultant"].includes(String(profile.role)) || typeof profile.user !== "string" || !idPattern.test(profile.user)) fail(409, "학원 계정 연결을 먼저 확인해 주세요.");
  const linked = await db.collection("suprima_profiles").getList(1, 2, { ...options(), filter: db.filter("user={:user}", { user: profile.user }), fields: "id" });
  if (linked.items.length !== 1 || linked.totalItems !== 1 || linked.items[0].id !== profile.id) fail(409, "여러 프로필이 공유하는 계정은 비밀번호를 변경할 수 없습니다.");
  return db.collection("users").getOne(profile.user, { ...options(), fields: "id,email" });
}
export async function readAcademyAccounts(db: PocketBase) {
  const [ids, profiles, users] = await Promise.all([
    academyIds(db),
    db.collection("suprima_profiles").getFullList({ ...options(), fields: "id,name,full_name,role,academy_id,user" }),
    db.collection("users").getFullList({ ...options(), fields: "id,email" }),
  ]);
  const accounts = new Map(users.map(user => [user.id, user]));
  const counts = new Map<string, number>();
  profiles.forEach(profile => { if (typeof profile.user === "string" && profile.user) counts.set(profile.user, (counts.get(profile.user) || 0) + 1); });
  return {
    academies: [...ids].sort().map(id => ({ id, label: id })),
    profiles: profiles.map(profile => {
      const userId = typeof profile.user === "string" ? profile.user : "";
      const account = accounts.get(userId);
      const status = profile.role === "master" ? "master" : !userId ? "unlinked" : !account ? "invalid" : counts.get(userId) !== 1 ? "ambiguous" : "linked";
      return { id: profile.id, name: typeof profile.name === "string" ? profile.name : typeof profile.full_name === "string" ? profile.full_name : "", role: typeof profile.role === "string" ? profile.role : "", academyId: typeof profile.academy_id === "string" ? profile.academy_id : "", userId, email: typeof account?.email === "string" ? account.email : "", status };
    }),
  };
}
export async function manageAcademyAccount(db: PocketBase, input: Input) {
  await accountSchema(db);
  if (input.action === "change-password") {
    const profile = await db.collection("suprima_profiles").getOne(input.profileId, { ...options(), fields: "id,role,academy_id,user" });
    const ids = await academyIds(db);
    if (typeof profile.academy_id !== "string" || !ids.has(profile.academy_id)) fail(409, "실제 학원 소속을 확인해 주세요.");
    const account = await uniqueAccount(db, profile);
    await db.collection("users").update(account.id, { password: input.newPassword, passwordConfirm: input.newPassword }, { ...options(), fields: "id" });
    return { ok: true };
  }
  const ids = await academyIds(db);
  if (!ids.has(input.academyId)) fail(400, "등록된 학원만 선택할 수 있습니다.");
  let target: Row | undefined;
  if (input.profileId) {
    const selected = await db.collection("suprima_profiles").getOne(input.profileId, { ...options(), fields: "id,role,academy_id,user" });
    if (selected.role === "master") fail(403, "마스터 계정은 학원 계정으로 변경할 수 없습니다.");
    if (selected.academy_id !== input.academyId) fail(403, "선택한 프로필의 학원 소속이 다릅니다.");
    if (selected.role !== "consultant" || input.role !== "consultant" || selected.user) fail(409, "계정이 연결되지 않은 실행 담당자만 선택할 수 있습니다.");
    target = selected;
  }
  const existing = await db.collection("users").getList(1, 1, { ...options(), filter: db.filter("email={:email}", { email: input.email }), fields: "id" });
  if (existing.totalItems || existing.items.length) fail(409, "이미 등록된 이메일입니다. 기존 계정 연결을 확인해 주세요.");
  const accountId = await availableId(db, "users");
  const newProfileId = target ? "" : await availableId(db, "suprima_profiles");
  try {
    await db.collection("users").create({ id: accountId, email: input.email, password: input.password, passwordConfirm: input.password }, { ...options(), fields: "id" });
    if (target) await db.collection("suprima_profiles").update(String(target.id), { user: accountId }, { ...options(), fields: "id" });
    else await db.collection("suprima_profiles").create({ id: newProfileId, name: input.name, role: input.role, academy_id: input.academyId, user: accountId }, { ...options(), fields: "id" });
    return { ok: true };
  } catch {
    // Delete only this newly created account, and only after confirming no profile linked it.
    // A lost write response must never delete an account that was actually connected.
    try {
      const linked = await db.collection("suprima_profiles").getList(1, 2, { ...options(), filter: db.filter("user={:user}", { user: accountId }), fields: "id,user,academy_id,role" });
      const confirmed = linked.items[0];
      if (linked.totalItems === 1 && confirmed?.id === (target?.id || newProfileId) && confirmed.user === accountId && confirmed.academy_id === input.academyId && confirmed.role === input.role) return { ok: true };
      if (linked.totalItems === 0 && linked.items.length === 0) {
        const created = await db.collection("users").getOne(accountId, { ...options(), fields: "id,email" });
        if (created.id === accountId && created.email === input.email) await db.collection("users").delete(accountId, options());
      }
    } catch { /* Preserve uncertain records for administrator reconciliation. */ }
    fail(503, "계정 연결을 완료하지 못했습니다. 계정 목록을 새로 확인해 주세요.");
  }
}
