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
export function buildAcademySecurityPlan(collections: CollectionModel[], quarantine = false, includeUnchanged = false): Patch[] {
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
  const manager = `${actor}.role ?= "admin"`;
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
  }).filter(patch => includeUnchanged || !equal(patch.before, patch.after));
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
type SecurityContext = { phase: string; collection?: string; schemaKind?: string; attemptedDetachedProfiles?: number; remainingDuplicates?: number; quarantined?: boolean; studentFieldPresentAfterRelationAdd?: boolean; verifyCheck?: Record<string, unknown>; lockWriteErrors?: { collection: string; status?: number }[] };
async function lockCollections(db: PocketBase, collections: CollectionModel[], context?: SecurityContext): Promise<boolean> {
  const locked = Object.fromEntries(rules.map(rule => [rule, null]));
  const writeErrors: { collection: string; status?: number }[] = [];
  for (const collection of collections.filter(item => targets.includes(item.name as typeof targets[number]))) {
    try { await db.collections.update(collection.id, locked, options()); } catch (error) { const failure = error && typeof error === "object" ? error as { status?: number } : {}; writeErrors.push({ collection: collection.name, status: typeof failure.status === "number" ? failure.status : undefined }); }
  }
  if (context) context.lockWriteErrors = writeErrors;
  let complete = true;
  // Only the fresh, exact metadata determines the final state; a response may fail after commit.
  for (const collection of collections.filter(item => targets.includes(item.name as typeof targets[number]))) {
    try { const current = await db.collections.getOne(collection.id, options()); if (rules.some(rule => current[rule] !== null)) complete = false; } catch { complete = false; }
  }
  return complete;
}
async function configureAcademySecurityInner(db: PocketBase, context: SecurityContext, actorEmail: string) {
  context.phase = "schema";
  const collections = await Promise.all(["users", ...targets].map(name => db.collections.getOne(name, options())));
  buildAcademySecurityPlan(collections);
  context.schemaKind = key(collections.find(item => item.name === "suprima_students")!);
  context.phase = "profile-links";
  const { ambiguous: ambiguousProfiles, repairs } = await canonicalLinkRepair(db, collections.find(item => item.name === "suprima_profiles")!, actorEmail);
  context.attemptedDetachedProfiles = repairs.length; context.remainingDuplicates = ambiguousProfiles; context.quarantined = ambiguousProfiles > 0;
  const changed = buildAcademySecurityPlan(collections, ambiguousProfiles > 0);
  const result = { success: true, version: SECURITY_VERSION, ambiguousProfiles, quarantined: ambiguousProfiles > 0, detachedProfiles: repairs.length };
  if (!changed.length && !repairs.length) return { ...result, changedCollections: 0, alreadyConfigured: true };
  // Full plan is needed because lockdown temporarily locks even unchanged collections.
  const patches = buildAcademySecurityPlan(collections, ambiguousProfiles > 0, true);
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
  const repaired: ProfileRepair[] = [];
  try {
    // null means locked/superuser-only. Confirm minimal lockdown BEFORE schema/index/link updates.
    context.phase = "lockdown"; context.collection = undefined;
    if (!await lockCollections(db, collections, context)) throw new Error("ACADEMY_LOCKDOWN_REQUIRED");
    for (const repair of repairs) {
      context.phase = "profile-link-repair"; context.collection = "suprima_profiles";
      const current = await db.collection("suprima_profiles").getOne(repair.profileId, { ...options(), fields: "id,user,role,admin_id" });
      if (current.user !== repair.user || current.role !== "consultant" || current.admin_id !== repair.user) throw new Error("ACADEMY_PROFILE_CHANGED");
      await db.collection("suprima_profiles").update(repair.profileId, { user: "" }, options()); repaired.push(repair);
    }
    const studentPatch = patches.find(patch => patch.name === "suprima_students")!;
    const structure = "fields" in studentPatch.after ? "fields" : "schema";
    if (!equal(studentPatch.before[structure], studentPatch.after[structure])) {
      context.phase = "relation-add"; context.collection = studentPatch.name;
      await db.collections.update(studentPatch.id, { [structure]: studentPatch.after[structure] }, options());
      const refreshed = await db.collections.getOne(studentPatch.id, options()); studentPatch.after[structure] = rawFields(refreshed);
    }
    const actualStudents = await db.collections.getOne(studentPatch.id, options());
    context.studentFieldPresentAfterRelationAdd = !!field(actualStudents, SECURITY_ASSIGNMENT_FIELD);
    singleRelation(actualStudents, SECURITY_ASSIGNMENT_FIELD, collections.find(item => item.name === "suprima_profiles")!.id);
    for (const patch of patches) { context.phase = "rules"; context.collection = patch.name; await db.collections.update(patch.id, patch.after, options()); }
    for (const patch of patches) {
      context.phase = "verify"; context.collection = patch.name;
      const current = await db.collections.getOne(patch.id, options());
      for (const rule of rules) if (current[rule] !== patch.after[rule]) {
        const expected = patch.after[rule], actual = current[rule];
        context.verifyCheck = { kind: "rule", ruleName: rule, expectedType: expected === null ? "null" : typeof expected, actualType: actual === null ? "null" : typeof actual, actualKeyPresent: Object.hasOwn(current, rule), expectedLength: typeof expected === "string" ? expected.length : undefined, actualLength: typeof actual === "string" ? actual.length : undefined, whitespaceNormalizedEqual: typeof expected === "string" && typeof actual === "string" && expected.replace(/\s+/g, " ").trim() === actual.replace(/\s+/g, " ").trim() };
        throw new Error("ACADEMY_VERIFY_FAILED");
      }
      if (patch.name === "suprima_students") singleRelation(current, SECURITY_ASSIGNMENT_FIELD, collections.find(item => item.name === "suprima_profiles")!.id);
      if (patch.name === "suprima_profiles" && Array.isArray(patch.after.indexes)) {
        const expected = patch.after.indexes.find(index => !current.indexes?.includes(index));
        if (typeof expected === "string") {
          const normalize = (sql: string) => sql.replace(/["`\[\]]/g, "").replace(/\s+/g, " ").trim().replace(/;$/, "");
          context.verifyCheck = { kind: "index", indexName: /\bINDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?["`\[]?([a-zA-Z0-9_]+)/i.exec(expected)?.[1], actualKeyPresent: Object.hasOwn(current, "indexes"), actualType: Array.isArray(current.indexes) ? "array" : typeof current.indexes, expectedType: "array", actualIndexesCount: current.indexes?.length, normalizedIndexMatch: current.indexes?.some(sql => normalize(sql) === normalize(expected)) || false };
          throw new Error("ACADEMY_VERIFY_FAILED");
        }
      }
      if (patch.name === "suprima_pdf_analyses" && fields(current).some(item => item.type === "file" && item.protected !== true)) throw new Error("ACADEMY_VERIFY_FAILED");
    }
    for (const repair of repaired) { const current = await db.collection("suprima_profiles").getOne(repair.profileId, { ...options(), fields: "id,user" }); if (current.user) throw new Error("ACADEMY_VERIFY_FAILED"); }
    context.phase = "revision-finalize"; context.collection = SECURITY_REVISION_COLLECTION;
    await db.collection(SECURITY_REVISION_COLLECTION).update(backup.id, { state: "applied" }, options());
    return { ...result, changedCollections: changed.length, alreadyConfigured: false };
  } catch (cause) {
    // Never restore known-public rules after a failed configuration. Keep ordinary access locked.
    const locked = await lockCollections(db, collections, context);
    let linksRestored = true;
    const profilePatch = patches.find(patch => patch.name === "suprima_profiles");
    if (repaired.length && profilePatch) { try { await db.collections.update(profilePatch.id, { indexes: profilePatch.before.indexes }, options()); } catch { linksRestored = false; } }
    for (const repair of [...repaired].reverse()) { try { await db.collection("suprima_profiles").update(repair.profileId, { user: repair.user }, options()); } catch { linksRestored = false; } }
    try { await db.collection(SECURITY_REVISION_COLLECTION).update(backup.id, { state: locked ? linksRestored ? "locked_failed" : "locked_link_restore_required" : "lockdown_required" }, options()); } catch { /* Private backup remains available. */ }
    throw Object.assign(new Error(locked ? "ACADEMY_CONFIGURATION_LOCKED" : "ACADEMY_LOCKDOWN_REQUIRED"), { cause, locked, linksRestored });
  }
}
function safeBackendMessage(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  if (/password|secret|authorization|bearer|api.?key|access.?token|refresh.?token/i.test(value)) return "[redacted]";
  return value.replace(/https?:\/\/\S+/gi, "[redacted-url]").replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]").replace(/\beyJ[A-Za-z0-9_-]{20,}(?:\.[A-Za-z0-9_-]+){1,2}\b/g, "[redacted-token]").slice(0, 512);
}
export async function configureAcademySecurity(db: PocketBase, actorEmail = "") {
  const context: SecurityContext = { phase: "start" };
  try { return await configureAcademySecurityInner(db, context, actorEmail); }
  catch (error) {
    const source = error && typeof error === "object" && "cause" in error ? error.cause : error;
    const object = source && typeof source === "object" ? source as Data : {};
    const response = object.response && typeof object.response === "object" ? object.response as Data : object;
    const data = response.data && typeof response.data === "object" ? response.data : {};
    const invalidFields = Object.keys(data).filter(name => /^[a-zA-Z0-9_.-]{1,70}$/.test(name));
    const validationCodes: string[] = [];
    const validationDetails: { field: string; code?: string; message?: string }[] = [];
    const collect = (value: unknown, path: string, depth: number) => {
      if (depth > 5 || !value || typeof value !== "object") return;
      const item = value as Data;
      const code = typeof item.code === "string" && /^[a-zA-Z0-9_.-]{1,70}$/.test(item.code) ? item.code : undefined;
      if (code) validationCodes.push(code);
      if (/^(schema|fields|listRule|viewRule|createRule|updateRule|deleteRule|indexes)(\.|$)/.test(path) && (code || typeof item.message === "string")) validationDetails.push({ field: path, code, message: safeBackendMessage(item.message) });
      for (const [name, nested] of Object.entries(item)) if (!["message", "code"].includes(name) && /^[a-zA-Z0-9_.-]{1,70}$/.test(name)) collect(nested, path ? path + "." + name : name, depth + 1);
    };
    collect(data, "", 0);
    const rawCode = error instanceof Error ? error.message : "";
    const code = ["ACADEMY_SCHEMA_REQUIRES_REVIEW", "ACADEMY_BACKUP_REQUIRES_REVIEW", "ACADEMY_CONFIGURATION_LOCKED", "ACADEMY_LOCKDOWN_REQUIRED"].includes(rawCode) ? rawCode : "ACADEMY_CONFIGURE_FAILED";
    const recovery = error && typeof error === "object" ? error as { locked?: boolean; linksRestored?: boolean } : {};
    throw Object.assign(new Error(code), { ...context, locked: recovery.locked, linksRestored: recovery.linksRestored, backendStatus: typeof object.status === "number" ? object.status : undefined, backendMessage: safeBackendMessage(response.message ?? object.message), invalidFields, validationCodes: [...new Set(validationCodes)], validationDetails });
  }
}



