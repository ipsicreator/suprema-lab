import type PocketBase from "pocketbase";
import { AcademyBridgeError } from "@/lib/academy/bridge";

export const ASSIGNMENT_FIELD = "assigned_consultant";
type Actor = { userId: string; academyId: string; role: string };
type Row = Record<string, unknown>;
const options = () => ({ requestKey: null, signal: AbortSignal.timeout(10_000) });
function fail(status: number, message: string): never { throw new AcademyBridgeError(status, message); }
export function requireAssignmentManager(actor: Actor) {
  if (!actor.userId || !actor.academyId || !["admin", "master"].includes(actor.role)) fail(403, "학생 배정은 소속 학원 관리자만 변경할 수 있습니다.");
}
function text(value: unknown) { return typeof value === "string" ? value : ""; }
function schemaFields(collection: unknown): Row[] {
  if (!collection || typeof collection !== "object") return [];
  const model = collection as Row;
  const fields = Array.isArray(model.fields) ? model.fields : Array.isArray(model.schema) ? model.schema : [];
  return fields.filter((field): field is Row => Boolean(field && typeof field === "object" && !Array.isArray(field))).map(field => ({ ...(field.options && typeof field.options === "object" && !Array.isArray(field.options) ? field.options as Row : {}), ...field }));
}
export async function requireAssignmentSchema(db: PocketBase) {
  const [students, profiles, users] = await Promise.all([db.collections.getOne("suprima_students", options()), db.collections.getOne("suprima_profiles", options()), db.collections.getOne("users", options())]);
  const field = schemaFields(students).find(item => item.name === ASSIGNMENT_FIELD);
  if (!field || field.type !== "relation" || field.collectionId !== profiles.id || field.maxSelect !== 1) fail(503, "담당 학생 배정 저장소 설정을 확인해 주세요.");
  const owner = schemaFields(profiles).find(item => item.name === "user");
  if (!owner || owner.type !== "relation" || owner.collectionId !== users.id || owner.maxSelect !== 1) fail(503, "담당자 계정 연결 설정을 확인해 주세요.");
  const links = ["user"];
  return { field: ASSIGNMENT_FIELD, maxSelect: 1, links };
}
async function linkedConsultant(db: PocketBase, profile: Row, academyId: string, links: string[]) {
  if (profile.academy_id !== academyId || profile.role !== "consultant") fail(403, "같은 학원의 실행 담당자만 배정할 수 있습니다.");
  const ids = [...new Set(links.map(field => text(profile[field])).filter(Boolean))];
  if (ids.length !== 1) fail(403, "담당자의 로그인 계정 연결을 확인해 주세요.");
  const user = await db.collection("users").getOne(ids[0], { ...options(), fields: "id" });
  if (user.id !== ids[0]) fail(403, "담당자의 로그인 계정 연결을 확인해 주세요.");
  // A user with another linked profile would fail the ordinary login bridge too.
  const matches = new Set<string>();
  for (const field of links) {
    const result = await db.collection("suprima_profiles").getList(1, 2, { ...options(), filter: db.filter(`${field}={:user}`, { user: ids[0] }), fields: "id" });
    if (result.totalItems > 1) fail(403, "담당자의 학원 프로필이 중복되어 있습니다.");
    result.items.forEach(item => matches.add(item.id));
  }
  if (matches.size !== 1 || !matches.has(text(profile.id))) fail(403, "담당자의 학원 프로필 연결을 확인해 주세요.");
}
export async function readAcademyAssignments(db: PocketBase, actor: Actor) {
  requireAssignmentManager(actor);
  const schema = await requireAssignmentSchema(db);
  const filter = db.filter("academy_id={:academy}", { academy: actor.academyId });
  const [students, profiles] = await Promise.all([
    db.collection("suprima_students").getFullList({ ...options(), filter, fields: `id,name,academy_id,${ASSIGNMENT_FIELD},updated`, sort: "name" }),
    db.collection("suprima_profiles").getFullList({ ...options(), filter: `${filter} && role="consultant"`, fields: `id,name,full_name,academy_id,role,${schema.links.join(",")}` }),
  ]);
  if (students.some(item => item.academy_id !== actor.academyId) || profiles.some(item => item.academy_id !== actor.academyId || item.role !== "consultant")) fail(503, "학원 자료 범위를 확인하지 못했습니다.");
  const staff = [];
  for (const profile of profiles) {
    try { await linkedConsultant(db, profile, actor.academyId, schema.links); staff.push({ id: profile.id, name: text(profile.name) || text(profile.full_name), role: "consultant" }); }
    catch (error) { if (!(error instanceof AcademyBridgeError) || error.status !== 403) throw error; }
  }
  return { assignmentField: schema.field, maxSelect: schema.maxSelect, students: students.map(item => ({ id: item.id, name: text(item.name), assigned_consultant: text(item[ASSIGNMENT_FIELD]), updated: text(item.updated) })), consultants: staff };
}
export function parseAssignmentInput(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(400, "배정 요청을 확인해 주세요.");
  const input = value as Row;
  if (Object.keys(input).some(key => !["studentId", "consultantId", "expectedUpdated"].includes(key))) fail(400, "학생과 담당자 배정 항목만 변경할 수 있습니다.");
  if (typeof input.studentId !== "string" || !/^[a-z0-9]{15}$/.test(input.studentId) || typeof input.consultantId !== "string" || (input.consultantId !== "" && !/^[a-z0-9]{15}$/.test(input.consultantId)) || typeof input.expectedUpdated !== "string" || !input.expectedUpdated || input.expectedUpdated.length > 64) fail(400, "학생·담당자와 최신 저장 상태를 확인해 주세요.");
  return { studentId: input.studentId, consultantId: input.consultantId, expectedUpdated: input.expectedUpdated };
}
export async function assignAcademyStudent(db: PocketBase, actor: Actor, input: ReturnType<typeof parseAssignmentInput>) {
  requireAssignmentManager(actor);
  const schema = await requireAssignmentSchema(db);
  const student = await db.collection("suprima_students").getOne(input.studentId, { ...options(), fields: "id,academy_id,updated" });
  if (student.academy_id !== actor.academyId) fail(403, "다른 학원의 학생 배정은 변경할 수 없습니다.");
  if (student.updated !== input.expectedUpdated) fail(409, "다른 변경이 반영되었습니다. 목록을 새로 확인해 주세요.");
  if (input.consultantId) {
    const profile = await db.collection("suprima_profiles").getOne(input.consultantId, { ...options(), fields: `id,academy_id,role,${schema.links.join(",")}` });
    await linkedConsultant(db, profile, actor.academyId, schema.links);
  }
  const updated = await db.collection("suprima_students").update(input.studentId, { [ASSIGNMENT_FIELD]: input.consultantId }, { ...options(), fields: `id,academy_id,${ASSIGNMENT_FIELD},updated` });
  if (updated.academy_id !== actor.academyId || updated[ASSIGNMENT_FIELD] !== input.consultantId) fail(503, "배정 저장 결과를 확인하지 못했습니다. 목록을 다시 확인해 주세요.");
  return { id: updated.id, assigned_consultant: input.consultantId, updated: text(updated.updated) };
}
