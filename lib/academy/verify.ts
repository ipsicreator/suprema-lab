import PocketBase from "pocketbase";
import { randomBytes } from "node:crypto";
import { assignAcademyStudent, requireAssignmentSchema } from "@/lib/academy/assignments";
import { requireAcademyUser } from "@/lib/academy/bridge";

type Check = { name: string; passed: boolean };
type Created = { collection: string; id: string };
type ClientFactory = (url: string) => PocketBase;
class VerificationFailure extends Error {}
const denied = (error: unknown) => !!error && typeof error === "object" && "status" in error && [400, 403, 404].includes(Number(error.status));
const collections = ["suprima_profiles", "suprima_licenses", "suprima_students", "suprima_pdf_analyses"];

export async function verifyAcademyAccess(db: PocketBase, makeClient: ClientFactory = url => new PocketBase(url)) {
  const started = Date.now(), checks: Check[] = [], created: Created[] = [];
  let cleanupFailures = 0, setupComplete = false, setupStep = "schema";
  let failure: { setupStep: string; backendStatus: number | null; invalidFieldNames: string[] } | undefined;
  const options = () => {
    const remaining = 35_000 - (Date.now() - started);
    if (remaining <= 0) throw new VerificationFailure("verification_timeout");
    return { requestKey: null, signal: AbortSignal.timeout(Math.max(1, Math.min(6000, remaining))) };
  };
  const check = async (name: string, operation: () => Promise<void>) => {
    try { await operation(); checks.push({ name, passed: true }); }
    catch { checks.push({ name, passed: false }); throw new VerificationFailure(name); }
  };
  const equalIds = (actual: { id: string }[], expected: string[]) => {
    if (actual.length !== expected.length || actual.some(row => !expected.includes(row.id))) throw new VerificationFailure("unexpected_records");
  };
  const reject = async (operation: () => Promise<unknown>) => {
    try { await operation(); } catch (error) { if (denied(error)) return; throw error; }
    throw new VerificationFailure("access_not_denied");
  };
  const group = async <T>(operations: Promise<T>[]) => {
    const results = await Promise.allSettled(operations);
    const rejected = results.find(result => result.status === "rejected");
    if (rejected?.status === "rejected") throw rejected.reason;
    return results.map(result => (result as PromiseFulfilledResult<T>).value);
  };
  const create = async (collection: string, data: Record<string, unknown>) => {
    const id = randomBytes(8).toString("hex").slice(0, 15);
    created.push({ collection, id });
    const row = await db.collection(collection).create({ ...data, id }, options());
    if (row.id !== id) throw new VerificationFailure("fixture_identity_mismatch");
    return row;
  };
  try {
    await requireAssignmentSchema(db);
    const schemas = await group(collections.map(name => db.collections.getOne(name, options())));
    if (schemas.some(schema => !schema.listRule || !schema.viewRule)) throw new VerificationFailure("security_not_configured");
    const tag = "verify_" + randomBytes(10).toString("hex"), academyA = tag + "_a", academyB = tag + "_b";
    const identities = ["admin_a", "consultant_a1", "consultant_a2", "admin_b", "consultant_b1"].map(suffix => ({ email: `${tag}_${suffix}@example.invalid`, password: randomBytes(32).toString("base64url") }));
    setupStep = "users";
    const users = await group(identities.map(identity => create("users", { ...identity, passwordConfirm: identity.password, verified: true, emailVisibility: false, name: "자동 권한 검증" })));
    setupStep = "profiles";
    const profiles = await group(users.map((user, index) => create("suprima_profiles", { name: "자동 권한 검증", user: user.id, academy_id: index < 3 ? academyA : academyB, role: index === 0 || index === 3 ? "admin" : "consultant" })));
    setupStep = "licenses";
    const licenses = await group([academyA, academyB].map(academy_id => create("suprima_licenses", { academy_id, active: true })));
    setupStep = "students";
    const students = await group([
      { academy_id: academyA, assigned_consultant: profiles[1].id },
      { academy_id: academyA, assigned_consultant: profiles[2].id },
      { academy_id: academyA, assigned_consultant: "" },
      { academy_id: academyB, assigned_consultant: profiles[4].id },
    ].map(data => create("suprima_students", { ...data, name: "자동 검증 학생", school: "검증용 가상학교", grade: "1", enrollment_status: "미등록" })));
    setupStep = "analyses";
    const analyses = await group([0, 1, 3].map(index => create("suprima_pdf_analyses", { student_id: students[index].id, content: { verification: true } })));
    setupStep = "ordinary_login";
    const clients = await group(identities.map(async identity => { const client = makeClient(db.baseURL); await client.collection("users").authWithPassword(identity.email, identity.password, options()); return client; }));
    const manager = clients[0], worker = clients[1], peer = clients[2], foreignManager = clients[3];
    setupComplete = true; setupStep = "access_checks";
    const list = (client: PocketBase, name: string) => client.collection(name).getFullList({ ...options(), fields: "id" });
    const view = (client: PocketBase, name: string, id: string) => client.collection(name).getOne(id, { ...options(), fields: "id" });
    await check("anonymous_records_blocked", async () => {
      const anonymous = makeClient(db.baseURL);
      for (const name of collections) { try { equalIds(await list(anonymous, name), []); } catch (error) { if (!denied(error)) throw error; } }
      await reject(() => view(anonymous, "suprima_students", students[0].id));
    });
    await check("managers_only_own_academy", async () => {
      equalIds(await list(manager, "suprima_students"), students.slice(0, 3).map(row => row.id));
      equalIds(await list(foreignManager, "suprima_students"), [students[3].id]);
      await reject(() => view(manager, "suprima_students", students[3].id));
    });
    await check("consultants_only_assigned_students", async () => {
      equalIds(await list(worker, "suprima_students"), [students[0].id]);
      equalIds(await list(peer, "suprima_students"), [students[1].id]);
      await view(worker, "suprima_students", students[0].id);
      for (const index of [1, 2, 3]) await reject(() => view(worker, "suprima_students", students[index].id));
    });
    await check("analyses_follow_student_scope", async () => {
      equalIds(await list(worker, "suprima_pdf_analyses"), [analyses[0].id]);
      equalIds(await list(manager, "suprima_pdf_analyses"), [analyses[0].id, analyses[1].id]);
      await reject(() => view(worker, "suprima_pdf_analyses", analyses[2].id));
      await reject(() => view(worker, "suprima_pdf_analyses", analyses[1].id));
    });
    await check("staff_and_license_academy_scope", async () => {
      equalIds(await list(manager, "suprima_profiles"), profiles.slice(0, 3).map(row => row.id));
      equalIds(await list(worker, "suprima_profiles"), [profiles[1].id]);
      equalIds(await list(manager, "suprima_licenses"), [licenses[0].id]);
      await reject(() => view(manager, "suprima_profiles", profiles[4].id));
    });
    await check("direct_privilege_and_assignment_changes_blocked", async () => {
      await reject(() => worker.collection("suprima_profiles").update(profiles[1].id, { role: "admin" }, options()));
      await reject(() => worker.collection("suprima_students").update(students[0].id, { assigned_consultant: profiles[2].id }, options()));
      await reject(() => manager.collection("suprima_students").update(students[0].id, { academy_id: academyB }, options()));
    });
    const actor = await requireAcademyUser(new Request("https://suprema-lab.vercel.app/api/academy/assignments", { headers: { authorization: "Bearer " + manager.authStore.token } }));
    const assign = async (studentIndex: number, consultantId: string) => {
      const current = await db.collection("suprima_students").getOne(students[studentIndex].id, { ...options(), fields: "id,updated" });
      return assignAcademyStudent(db, actor, { studentId: current.id, consultantId, expectedUpdated: current.updated });
    };
    await check("manager_assignment_and_removal_change_visibility", async () => {
      await assign(2, profiles[1].id);
      equalIds(await list(worker, "suprima_students"), [students[0].id, students[2].id]);
      await assign(2, "");
      equalIds(await list(worker, "suprima_students"), [students[0].id]);
      await reject(() => view(worker, "suprima_students", students[2].id));
    });
    await check("manager_reassignment_revokes_previous_consultant", async () => {
      await assign(0, profiles[2].id);
      await reject(() => view(worker, "suprima_students", students[0].id));
      equalIds(await list(peer, "suprima_students"), [students[0].id, students[1].id]);
      equalIds(await list(worker, "suprima_pdf_analyses"), []);
    });
    await check("foreign_and_consultant_assignment_rejected", async () => {
      const current = await db.collection("suprima_students").getOne(students[2].id, { ...options(), fields: "id,updated" });
      await reject(() => assignAcademyStudent(db, actor, { studentId: current.id, consultantId: profiles[4].id, expectedUpdated: current.updated }));
      await reject(() => assignAcademyStudent(db, { ...actor, role: "consultant" }, { studentId: current.id, consultantId: profiles[1].id, expectedUpdated: current.updated }));
    });
  } catch (error) {
    const value = error && typeof error === "object" ? error as { status?: unknown; data?: { data?: unknown } } : {};
    const allowedFields = ["id", "email", "password", "passwordConfirm", "verified", "name", "user", "academy_id", "role", "active", "school", "grade", "enrollment_status", "assigned_consultant", "student_id", "content"];
    const fieldErrors = value.data?.data;
    failure = { setupStep, backendStatus: typeof value.status === "number" && value.status >= 0 && value.status <= 599 ? value.status : null, invalidFieldNames: fieldErrors && typeof fieldErrors === "object" ? Object.keys(fieldErrors).filter(key => allowedFields.includes(key)) : [] };
    if (!checks.some(check => !check.passed)) checks.push({ name: setupComplete ? "verification_interrupted" : "fixture_setup", passed: false });
  } finally {
    for (const collection of ["suprima_pdf_analyses", "suprima_students", "suprima_profiles", "suprima_licenses", "users"]) {
      const results = await Promise.allSettled(created.filter(row => row.collection === collection).map(async row => { try { return await db.collection(collection).delete(row.id, { requestKey: null, signal: AbortSignal.timeout(3000) }); } catch (error) { if (error && typeof error === "object" && "status" in error && error.status === 404) return true; throw error; } }));
      cleanupFailures += results.filter(result => result.status === "rejected" || result.value !== true).length;
    }
  }
  const cleanup = { attempted: created.length, failed: cleanupFailures, complete: cleanupFailures === 0 };
  return { success: checks.length > 0 && checks.every(check => check.passed) && cleanup.complete, checkedAt: new Date().toISOString(), checks, cleanup, ...(failure ? { failure } : {}), isolatedSyntheticFixtures: true };
}


