import type PocketBase from "pocketbase";
import { createHash, randomBytes } from "node:crypto";
import { ActivityError } from "./personal-activities";
export const LINK_COLLECTION = "suprema_activity_links";
type Staff = { userId: string; academyId: string; role: string };
const options = () => ({ requestKey: null, signal: AbortSignal.timeout(15_000) });
const hash = (text: string) => createHash("sha256").update(text).digest("hex");
const codeHash = (code: string) => hash("activity-invitation:" + code);
const dbStatus = (error: unknown) => error && typeof error === "object" && "status" in error ? Number(error.status) : 0;
export async function ensureActivityLinks(db: PocketBase) {
  const rules = ["listRule", "viewRule", "createRule", "updateRule", "deleteRule"] as const;
  let collection;
  try { collection = await db.collections.getOne(LINK_COLLECTION, options()); }
  catch (error) {
    if (dbStatus(error) !== 404) throw error;
    const legacy = Array.isArray((await db.collections.getOne("users", options())).schema);
    if (legacy) await new Promise(resolve => setTimeout(resolve, 1200));
    const text = (name: string, max: number, required = false) => ({ name, type: "text", required, ...(legacy ? { options: { max } } : { max }) });
    const fields = [text("entry_type", 20, true), text("owner_key", 64, true), text("code_hash", 64), text("expires_at", 30), text("student_id", 15), text("academy_id", 160), text("recorded_at", 30, true), { name: "active", type: "bool" }];
    try { collection = await db.collections.create({ name: LINK_COLLECTION, type: "base", ...Object.fromEntries(rules.map(rule => [rule, null])), [legacy ? "schema" : "fields"]: fields, indexes: [`CREATE INDEX idx_activity_link_owner ON ${LINK_COLLECTION} (owner_key, entry_type)`] }, options()); }
    catch (createError) { collection = await db.collections.getOne(LINK_COLLECTION, options()).catch(() => { throw createError; }); }
  }
  const fields = collection.schema ?? collection.fields;
  const expected: Record<string,string> = {entry_type:"text", owner_key:"text",code_hash:"text",expires_at:"text",student_id:"text",academy_id:"text",recorded_at:"text",active:"bool"};
  if (collection.type !== "base" || rules.some(rule => collection[rule] !== null) || !Array.isArray(fields) || Object.entries(expected).some(([name,type]) => !fields.some((field: {name:string;type:string}) => field.name===name && field.type===type))) throw new ActivityError(503, "학원 연결 저장소 설정을 확인해 주세요.");
}
export async function issueActivityCode(db: PocketBase, owner: string) {
  const code = randomBytes(16).toString("hex"), digest = codeHash(code);
  const expiresAt = new Date(Date.now() + 15 * 60_000).toISOString();
  await db.collection(LINK_COLLECTION).create({ id: digest.slice(0, 15), entry_type: "invite", owner_key: owner, code_hash: digest, expires_at: expiresAt, recorded_at: new Date().toISOString(), active: false }, options());
  return { code, expiresAt };
}
export async function requireActivityStudent(db: PocketBase, studentId: string, actor: Staff | { role: "master" }) {
  if (!/^[a-z0-9]{15}$/.test(studentId)) throw new ActivityError(400, "학생을 선택해 주세요.");
  let student;
  try { student = await db.collection("suprima_students").getOne(studentId, { ...options(), fields: "id,name,academy_id,assigned_consultant" }); }
  catch (error) { if (dbStatus(error) === 404) throw new ActivityError(404, "학생을 찾을 수 없습니다."); throw error; }
  if (actor.role === "master") return student;
  if (!("academyId" in actor) || !actor.academyId || student.academy_id !== actor.academyId || !["admin", "consultant"].includes(actor.role)) throw new ActivityError(403, "해당 학생의 기록을 확인할 권한이 없습니다.");
  if (actor.role === "consultant") {
    const profiles = await db.collection("suprima_profiles").getList(1, 2, { ...options(), filter: db.filter("user = {:user}", { user: actor.userId }), fields: "id,user,role,academy_id" });
    const profile = profiles.items[0];
    if (profiles.totalItems !== 1 || !profile || profile.user !== actor.userId || profile.role !== "consultant" || profile.academy_id !== actor.academyId || student.assigned_consultant !== profile.id) throw new ActivityError(403, "본인에게 배정된 학생의 기록만 확인할 수 있습니다.");
  }
  return student;
}
export async function registerActivityLink(db: PocketBase, studentId: string, code: unknown, actor: Staff | { role: "master" }) {
  const student = await requireActivityStudent(db, studentId, actor);
  if (typeof code !== "string" || !/^[a-f0-9]{32}$/.test(code.trim())) throw new ActivityError(400, "개인 사용자가 발급한 연결 코드를 입력해 주세요.");
  const digest = codeHash(code.trim());
  const invite = await db.collection(LINK_COLLECTION).getOne(digest.slice(0, 15), options()).catch(error => { if (dbStatus(error) === 404) throw new ActivityError(400, "연결 코드가 올바르지 않습니다."); throw error; });
  if (invite.entry_type !== "invite" || invite.code_hash !== digest || !/^[a-f0-9]{64}$/.test(invite.owner_key) || !Number.isFinite(Date.parse(invite.expires_at)) || Date.parse(invite.expires_at) <= Date.now()) throw new ActivityError(400, "연결 코드가 만료되었거나 올바르지 않습니다.");
  const linkId = hash("activity-student:" + studentId).slice(0, 15);
  const existing = await db.collection(LINK_COLLECTION).getOne(linkId, options()).catch(error => { if (dbStatus(error) === 404) return null; throw error; });
  if (existing && (existing.entry_type !== "link" || existing.student_id !== studentId || existing.owner_key !== invite.owner_key)) throw new ActivityError(409, "다른 개인 계정이 이미 연결된 학생입니다. 마스터에게 계정 확인을 요청해 주세요.");
  try { await db.collection(LINK_COLLECTION).create({ id: hash("activity-claim:" + digest).slice(0,15), entry_type: "claim", owner_key: invite.owner_key, code_hash: digest, student_id: studentId, academy_id: student.academy_id, recorded_at: new Date().toISOString() }, options()); }
  catch (error) { if (dbStatus(error) === 400) throw new ActivityError(409, "이미 사용한 연결 코드입니다. 새 코드를 발급해 주세요."); throw error; }
  const body = { entry_type: "link", owner_key: invite.owner_key, student_id: studentId, academy_id: student.academy_id, recorded_at: new Date().toISOString(), active: true };
  try { if (existing) await db.collection(LINK_COLLECTION).update(linkId, body, options()); else await db.collection(LINK_COLLECTION).create({ id: linkId, ...body }, options()); }
  catch (error) { if (dbStatus(error) === 400) throw new ActivityError(409, "학생 연결 상태가 변경되었습니다. 새로고침 후 확인해 주세요."); throw error; }
  return { linked: true, studentName: student.name };
}
export async function studentActivityOwner(db: PocketBase, studentId: string, actor: Staff | { role: "master" }) {
  const student = await requireActivityStudent(db, studentId, actor);
  const id = hash("activity-student:" + studentId).slice(0, 15);
  const link = await db.collection(LINK_COLLECTION).getOne(id, options()).catch(error => { if (dbStatus(error) === 404) throw new ActivityError(404, "개인 계정 연결 등록이 필요합니다."); throw error; });
  if (link.entry_type !== "link" || link.student_id !== studentId || link.academy_id !== student.academy_id || link.active !== true) throw new ActivityError(404, "연결이 해제되었거나 소속이 변경되었습니다. 개인 계정을 다시 연결해 주세요.");
  return { owner: String(link.owner_key), studentName: String(student.name || "학생") };
}
export async function ownActivityLinks(db: PocketBase, owner: string) {
  const records = await db.collection(LINK_COLLECTION).getFullList({ ...options(), filter: db.filter('owner_key = {:owner} && entry_type = "link" && active = true', { owner }) });
  return Promise.all(records.map(async link => {
    const student = await db.collection("suprima_students").getOne(link.student_id, { ...options(), fields: "id,name,academy_id" }).catch(() => null);
    return { id: link.id, academyId: String(link.academy_id), studentName: student?.academy_id === link.academy_id ? String(student?.name || "학생") : "소속 확인 필요" };
  }));
}
export async function revokeActivityLink(db: PocketBase, owner: string, id: unknown) {
  if (typeof id !== "string" || !/^[a-z0-9]{15}$/.test(id)) throw new ActivityError(400, "연결 항목을 선택해 주세요.");
  const link = await db.collection(LINK_COLLECTION).getOne(id, options());
  if (link.entry_type !== "link" || link.owner_key !== owner) throw new ActivityError(404, "연결을 찾을 수 없습니다.");
  await db.collection(LINK_COLLECTION).update(id, { active: false }, options());
}

