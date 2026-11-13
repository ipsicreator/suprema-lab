import type PocketBase from "pocketbase";
import type { CollectionModel } from "pocketbase";

export const SECURITY_REVISION_COLLECTION = "suprema_academy_security_revisions";
export const SECURITY_VERSION = "academy-assignment-v1";
export const SECURITY_ASSIGNMENT_FIELD = "assigned_consultant";
const rules = ["listRule", "viewRule", "createRule", "updateRule", "deleteRule"] as const;
const targets = ["suprima_profiles", "suprima_licenses", "suprima_students", "suprima_pdf_analyses"] as const;
type Data = Record<string, unknown>;
type Patch = { name: string; id: string; before: Data; after: Data };
const options = () => ({ requestKey: null, signal: AbortSignal.timeout(12_000) });
function bad(): never { throw new Error("ACADEMY_SCHEMA_REQUIRES_REVIEW"); }
function rawFields(collection: CollectionModel): Data[] {
  const values: unknown = Array.isArray(collection.fields) ? collection.fields : collection.schema;
  if (!Array.isArray(values)) bad();
  return values as Data[];
}
function fields(collection: CollectionModel) { return rawFields(collection).map(item => ({ ...(item.options && typeof item.options === "object" ? item.options : {}), ...item })); }
function key(collection: CollectionModel): "fields" | "schema" { return Array.isArray(collection.fields) ? "fields" : "schema"; }
function field(collection: CollectionModel, name: string) { return fields(collection).find(value => value.name === name); }
function singleRelation(collection: CollectionModel, name: string, destination: string) {
  const value = field(collection, name);
  if (!value || value.type !== "relation" || value.collectionId !== destination || value.maxSelect !== 1) bad();
}
function equal(a: unknown, b: unknown): boolean { return JSON.stringify(a) === JSON.stringify(b); }
export function buildAcademySecurityPlan(collections: CollectionModel[], quarantine = false): Patch[] {
  const find = (name: string) => { const value = collections.find(item => item.name === name); if (!value) bad(); return value; };
  const users = find("users"), profiles = find("suprima_profiles"), licenses = find("suprima_licenses"), students = find("suprima_students"), analyses = find("suprima_pdf_analyses");
  if (users.type !== "auth" || [profiles, licenses, students, analyses].some(item => item.type !== "base")) bad();
  // A real users relation is authoritative; the historical admin_id text can be unrelated ownership metadata.
  const links = field(profiles, "user") ? ["user"] : [];
  if (!links.length || !field(profiles, "role") || !field(licenses, "active")) bad();
  for (const name of links) { const value = field(profiles, name)!; if (value.type === "relation") singleRelation(profiles, name, users.id); else if (name === "user" || value.type !== "text") bad(); }
  const academyFields = [profiles, licenses, students].map(item => field(item, "academy_id"));
  if (academyFields.some(item => !item || !["text", "relation"].includes(String(item.type)))) bad();
  if (academyFields.some(item => item!.type !== academyFields[0]!.type)) bad();
  if (academyFields[0]!.type === "relation" && academyFields.some(item => item!.collectionId !== academyFields[0]!.collectionId || item!.maxSelect !== 1)) bad();
  const analysisStudent = field(analyses, "student_id");
  if (!analysisStudent || !["text", "relation"].includes(String(analysisStudent.type))) bad();
  if (analysisStudent.type === "relation") singleRelation(analyses, "student_id", students.id);
  const existing = field(students, SECURITY_ASSIGNMENT_FIELD);
  if (fields(students).some(item => item.type === "relation" && item.collectionId === profiles.id && item.name !== SECURITY_ASSIGNMENT_FIELD)) bad();
  if (existing) singleRelation(students, SECURITY_ASSIGNMENT_FIELD, profiles.id);
  const relation = { collectionId: profiles.id, maxSelect: 1, cascadeDelete: false };
  const newField = key(students) === "fields" ? { name: SECURITY_ASSIGNMENT_FIELD, type: "relation", required: false, ...relation } : { name: SECURITY_ASSIGNMENT_FIELD, type: "relation", required: false, options: { ...relation, minSelect: null } };
  const studentFields = existing ? rawFields(students) : [...rawFields(students), newField];
  const legacy = key(students) === "schema";
  const submitted = legacy ? "@request.data" : "@request.body";
  const immutable = (name: string) => `(${submitted}.${name}:isset = false || ${submitted}.${name} = ${name})`;
  const auth = '@request.auth.collectionName = "users" && @request.auth.id != ""';
  const actor = "@collection.suprima_profiles:actor";
  const linked = "(" + links.map(name => `${actor}.${name} ?= @request.auth.id`).join(" || ") + ")";
  const own = "(" + links.map(name => `${name} ?= @request.auth.id`).join(" || ") + ")";
  const manager = `(${actor}.role ?= "master" || ${actor}.role ?= "admin")`;
  const active = (academy: string) => `@collection.suprima_licenses:license.academy_id ?= ${academy} && @collection.suprima_licenses:license.active ?= true`;
  const base = (academy: string) => `${auth} && ${linked} && ${actor}.academy_id ?= ${academy} && ${academy} != "" && ${active(academy)}`;
  const allowed = (prefix = "") => `${base(prefix + "academy_id")} && (${manager} || (${actor}.role ?= "consultant" && ${prefix}${SECURITY_ASSIGNMENT_FIELD} ?= ${actor}.id))`;
  const profileRead = `${auth} && (${own} || (${base("academy_id")} && ${manager}))`;
  const licenseRead = `${auth} && ${linked} && ${actor}.academy_id ?= academy_id && academy_id != ""`;
  const studentRead = allowed();
  const studentCreate = `${base("academy_id")} && ((${manager} && ${SECURITY_ASSIGNMENT_FIELD} = "") || (${actor}.role ?= "consultant" && ${SECURITY_ASSIGNMENT_FIELD} ?= ${actor}.id))`;
  const studentUpdate = `${studentRead} && ${immutable("academy_id")} && ${immutable(SECURITY_ASSIGNMENT_FIELD)}`;
  const analysisAlias = "@collection.suprima_students:student";
  const analysisRead = analysisStudent.type === "relation" ? allowed("student_id.") : `${analysisAlias}.id ?= student_id && ${allowed(analysisAlias + ".")}`;
  const analysisFields = rawFields(analyses).map(item => item.type === "file" ? key(analyses) === "fields" ? { ...item, protected: true } : { ...item, options: { ...(item.options as Data || {}), protected: true } } : item);
  // PocketBase null is locked (superuser-only), NOT public. Empty string means public.
  // https://pocketbase.io/docs/api-rules-and-filters/#api-rules
  const existingIndexes = Array.isArray(profiles.indexes) ? profiles.indexes : [];
  const canonicalIndex = `CREATE UNIQUE INDEX idx_suprema_profiles_user ON suprima_profiles (user) WHERE user != ''`;
  if (!quarantine && links[0] === "user" && existingIndexes.some(index => /\bidx_suprema_profiles_user\b/.test(index) && index !== canonicalIndex)) bad();
  const profileIndexes = !quarantine && links[0] === "user" && !existingIndexes.includes(canonicalIndex) ? [...existingIndexes, canonicalIndex] : existingIndexes;
  const newRules: Record<string, Data> = {
    suprima_profiles: { listRule: profileRead, viewRule: profileRead, createRule: null, updateRule: null, deleteRule: null, indexes: profileIndexes },
    suprima_licenses: { listRule: licenseRead, viewRule: licenseRead, createRule: null, updateRule: null, deleteRule: null },
    suprima_students: { listRule: studentRead, viewRule: studentRead, createRule: studentCreate, updateRule: studentUpdate, deleteRule: null, [key(students)]: studentFields },
    suprima_pdf_analyses: { listRule: analysisRead, viewRule: analysisRead, createRule: analysisRead, updateRule: `${analysisRead} && ${immutable("student_id")}`, deleteRule: null, [key(analyses)]: analysisFields },
  };
  return targets.map(name => {
    const collection = find(name);
    const after: Data = quarantine ? { ...newRules[name], ...Object.fromEntries(rules.map(rule => [rule, '@request.auth.id = "" && @request.auth.id != ""'])) } : newRules[name];
    const before: Data = Object.fromEntries(rules.map(rule => [rule, collection[rule] ?? null]));
    for (const structure of ["fields", "schema"]) if (structure in after) before[structure] = rawFields(collection);
    if ("indexes" in after) before.indexes = Array.isArray(collection.indexes) ? collection.indexes : [];
    return { name, id: collection.id, before, after };
  }).filter(patch => !equal(patch.before, patch.after));
}
type ProfileRepair = { profileId: string; user: string };
async function canonicalLinkRepair(db: PocketBase, profiles: CollectionModel, actorEmail: string) {
  const values = await db.collection(profiles.name).getFullList({ ...options(), fields: "id,user,role,admin_id" });
  const groups = new Map<string, typeof values>();
  let ambiguous = 0;
  const repairs: ProfileRepair[] = [];
  for (const value of values) {
    if (!value.user) continue;
    if (typeof value.user !== "string") { ambiguous++; continue; }
    const group = groups.get(value.user) || []; group.push(value); groups.set(value.user, group);
  }
  for (const [userId, group] of groups) {
    if (group.length < 2) continue;
    const masters = group.filter(value => value.role === "master");
    const others = group.filter(value => value.role !== "master");
    const candidate = actorEmail.trim() && masters.length === 1 && others.length === group.length - 1 && others.every(value => value.role === "consultant" && value.admin_id === userId);
    let confirmedOwner = false;
    if (candidate) {
      const user = await db.collection("users").getOne(userId, { ...options(), fields: "id,email" });
      confirmedOwner = user.id === userId && typeof user.email === "string" && user.email.trim().toLowerCase() === actorEmail.trim().toLowerCase();
    }
    if (confirmedOwner) repairs.push(...others.map(value => ({ profileId: value.id, user: userId })));
    else ambiguous += group.length - 1;
  }
  return { ambiguous, repairs };
}
async function configureAcademySecurityInner(db: PocketBase, context: { phase: string; collection?: string }, actorEmail: string) {
  context.phase = "schema";
  const collections = await Promise.all(["users", ...targets].map(name => db.collections.getOne(name, options())));
  // Validate all schema assumptions before creating a revision collection or changing any setting.
  buildAcademySecurityPlan(collections);
  context.phase = "profile-links";
  const { ambiguous: ambiguousProfiles, repairs } = await canonicalLinkRepair(db, collections.find(item => item.name === "suprima_profiles")!, actorEmail);
  const patches = buildAcademySecurityPlan(collections, ambiguousProfiles > 0);
  const result = { success: true, version: SECURITY_VERSION, ambiguousProfiles, quarantined: ambiguousProfiles > 0, detachedProfiles: repairs.length };
  if (!patches.length && !repairs.length) return { ...result, changedCollections: 0, alreadyConfigured: true };
  context.phase = "backup-schema";
  let revisionCollection: CollectionModel;
  try { revisionCollection = await db.collections.getOne(SECURITY_REVISION_COLLECTION, options()); }
  catch (error) {
    if (!error || typeof error !== "object" || !("status" in error) || error.status !== 404) throw error;
    const legacy = key(collections[0]) === "schema";
    const backupFields = [{ name: "version", type: "text", required: true }, { name: "snapshot", type: "json", required: true, ...(legacy ? { options: { maxSize: 2_000_000 } } : { maxSize: 2_000_000 }) }, { name: "state", type: "text", required: true }];
    revisionCollection = await db.collections.create({ name: SECURITY_REVISION_COLLECTION, type: "base", listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null, [legacy ? "schema" : "fields"]: backupFields }, options());
  }
  if (revisionCollection.type !== "base" || rules.some(rule => revisionCollection[rule] !== null)) throw new Error("ACADEMY_BACKUP_REQUIRES_REVIEW");
  context.phase = "backup-save";
  const backup = await db.collection(SECURITY_REVISION_COLLECTION).create({ version: SECURITY_VERSION, state: "prepared", snapshot: { collections: patches.map(({ name, id, before }) => ({ name, id, before })), profileLinks: repairs } }, options());
  const applied: Patch[] = [];
  const repaired: ProfileRepair[] = [];
  try {
    for (const repair of repairs) {
      context.phase = "profile-link-repair"; context.collection = "suprima_profiles";
      const current = await db.collection("suprima_profiles").getOne(repair.profileId, { ...options(), fields: "id,user,role,admin_id" });
      if (current.user !== repair.user || current.role !== "consultant" || current.admin_id !== repair.user) throw new Error("ACADEMY_PROFILE_CHANGED");
      await db.collection("suprima_profiles").update(repair.profileId, { user: "" }, options()); repaired.push(repair);
    }
    const studentPatch = patches.find(patch => patch.name === "suprima_students");
    const structure = studentPatch && ("fields" in studentPatch.after ? "fields" : "schema");
    // Add only the optional relation first so later rules can reference it; no student is assigned here.
    if (studentPatch && structure && !equal(studentPatch.before[structure], studentPatch.after[structure])) { context.phase = "relation-add"; context.collection = studentPatch.name; await db.collections.update(studentPatch.id, { [structure]: studentPatch.after[structure] }, options()); applied.push(studentPatch);
      // PocketBase assigns IDs/defaults to new fields; reuse its canonical schema for the rules update.
      const refreshed = await db.collections.getOne(studentPatch.id, options()); studentPatch.after[structure] = rawFields(refreshed); }
    for (const patch of patches) { context.phase = "rules"; context.collection = patch.name; await db.collections.update(patch.id, patch.after, options()); if (!applied.includes(patch)) applied.push(patch); }
    for (const patch of patches) { context.phase = "verify"; context.collection = patch.name; const current = await db.collections.getOne(patch.id, options()); for (const rule of rules) if (current[rule] !== patch.after[rule]) throw new Error("ACADEMY_VERIFY_FAILED");
      if (patch.name === "suprima_students") singleRelation(current, SECURITY_ASSIGNMENT_FIELD, collections.find(item => item.name === "suprima_profiles")!.id);
      if (patch.name === "suprima_profiles" && Array.isArray(patch.after.indexes) && patch.after.indexes.some(index => !current.indexes?.includes(index))) throw new Error("ACADEMY_VERIFY_FAILED");
      if (patch.name === "suprima_pdf_analyses" && fields(current).some(item => item.type === "file" && item.protected !== true)) throw new Error("ACADEMY_VERIFY_FAILED");
    }
    for (const repair of repaired) { const current = await db.collection("suprima_profiles").getOne(repair.profileId, { ...options(), fields: "id,user" }); if (current.user) throw new Error("ACADEMY_VERIFY_FAILED"); }
    context.phase = "revision-finalize"; context.collection = SECURITY_REVISION_COLLECTION;
    await db.collection(SECURITY_REVISION_COLLECTION).update(backup.id, { state: "applied" }, options());
    return { ...result, changedCollections: patches.length, alreadyConfigured: false };
  } catch (cause) {
    let restored = true;
    for (const patch of [...applied].reverse()) { try { await db.collections.update(patch.id, patch.before, options()); } catch { restored = false; } }
    for (const repair of [...repaired].reverse()) { try { await db.collection("suprima_profiles").update(repair.profileId, { user: repair.user }, options()); } catch { restored = false; } }
    try { await db.collection(SECURITY_REVISION_COLLECTION).update(backup.id, { state: restored ? "rolled_back" : "restore_required" }, options()); } catch { /* Private backup remains available to the operator. */ }
    throw Object.assign(new Error(restored ? "ACADEMY_CONFIGURATION_ROLLED_BACK" : "ACADEMY_RESTORE_REQUIRED"), { cause });
  }
}

export async function configureAcademySecurity(db: PocketBase, actorEmail = "") {
  const context: { phase: string; collection?: string } = { phase: "start" };
  try { return await configureAcademySecurityInner(db, context, actorEmail); }
  catch (error) {
    const source = error && typeof error === "object" && "cause" in error ? error.cause : error;
    const object = source && typeof source === "object" ? source as Record<string, unknown> : {};
    const response = object.response && typeof object.response === "object" ? object.response as Record<string, unknown> : object;
    const data = response.data && typeof response.data === "object" ? response.data : {};
    const invalidFields = Object.keys(data).filter(name => /^[a-zA-Z0-9_.-]{1,70}$/.test(name));
    const validationCodes: string[] = [];
    const collectCodes = (value: unknown, depth: number) => { if (depth > 5 || !value || typeof value !== "object") return; for (const [name, item] of Object.entries(value)) { if (name === "code" && typeof item === "string" && /^[a-zA-Z0-9_.-]{1,70}$/.test(item)) validationCodes.push(item); else if (name !== "message") collectCodes(item, depth + 1); } }; collectCodes(data, 0);
    const rawCode = error instanceof Error ? error.message : "";
    const code = ["ACADEMY_SCHEMA_REQUIRES_REVIEW", "ACADEMY_BACKUP_REQUIRES_REVIEW", "ACADEMY_CONFIGURATION_ROLLED_BACK", "ACADEMY_RESTORE_REQUIRED"].includes(rawCode) ? rawCode : "ACADEMY_CONFIGURE_FAILED";
    throw Object.assign(new Error(code), { phase: context.phase, collection: context.collection, backendStatus: typeof object.status === "number" ? object.status : undefined, invalidFields, validationCodes: [...new Set(validationCodes)] });
  }
}





