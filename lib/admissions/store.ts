import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { gzipSync, gunzipSync } from "node:zlib";
import type PocketBase from "pocketbase";
import type { RecordModel } from "pocketbase";
import bundledData from "@/data/admission/admissionData.json";
import { hasPocketBaseAdmin, pbAdmin } from "@/lib/pocketbaseAdmin";
import { normalizeRows, type AdmissionImportRow } from "./import";

export type RevisionMeta = {
  id: string;
  fileName: string;
  sheetName: string;
  rowCount: number;
  universityCount: number;
  createdAt: string;
  actor: string;
};

type Snapshot = { meta: RevisionMeta; rows: AdmissionImportRow[] };
type ActivePointer = { id: string; history: string[]; updatedAt: string; actor: string };
const REVISIONS = "suprema_admission_revisions";
const ACTIVE = "suprema_admission_active";
const CURRENT_ID = "admissionslive1";
const MAX_UNCOMPRESSED = 64 * 1024 * 1024;
const requestOptions = { requestKey: null };

function isMissing(error: unknown) {
  return typeof error === "object" && error !== null && "status" in error && error.status === 404;
}

function isFileMissing(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}

function localRoot() {
  if (process.env.VERCEL) throw new Error("ADMISSIONS_STORAGE_NOT_CONFIGURED");
  return process.env.ADMISSIONS_STORAGE_DIR
    ? path.resolve(process.env.ADMISSIONS_STORAGE_DIR)
    : path.join(process.cwd(), ".cache", "admissions");
}

function validId(id: string) {
  if (!/^[a-z0-9]{15}$/.test(id)) throw new Error("INVALID_ADMISSION_REVISION_ID");
  return id;
}

function bundledRows(): AdmissionImportRow[] {
  return (bundledData as unknown as AdmissionImportRow[]).filter((row) =>
    row && row.univ && row.dept && row.type && row.name,
  );
}

function validatedRows(value: unknown): AdmissionImportRow[] {
  if (!Array.isArray(value)) throw new Error("INVALID_ADMISSION_DATA");
  const result = normalizeRows(value);
  if (!result.rows.length || result.rows.length !== value.length) throw new Error("INVALID_ADMISSION_DATA");
  return result.rows;
}

async function readPointer(): Promise<ActivePointer | null> {
  try {
    const value = JSON.parse(await fs.readFile(path.join(localRoot(), "active.json"), "utf8")) as ActivePointer;
    validId(value.id);
    if (!Array.isArray(value.history)) throw new Error("INVALID_ADMISSION_POINTER");
    value.history.forEach(validId);
    return value;
  } catch (error) {
    if (isFileMissing(error)) return null;
    throw error;
  }
}

async function readLocalSnapshot(id: string): Promise<Snapshot> {
  const compressed = await fs.readFile(path.join(localRoot(), `${validId(id)}.json.gz`));
  const snapshot = JSON.parse(gunzipSync(compressed, { maxOutputLength: MAX_UNCOMPRESSED }).toString("utf8")) as Snapshot;
  if (!snapshot.meta || snapshot.meta.id !== id) throw new Error("INVALID_ADMISSION_REVISION");
  return { meta: snapshot.meta, rows: validatedRows(snapshot.rows) };
}

function recordMeta(record: RecordModel): RevisionMeta {
  return {
    id: record.id,
    fileName: String(record.file_name),
    sheetName: String(record.sheet_name),
    rowCount: Number(record.row_count),
    universityCount: Number(record.university_count),
    createdAt: String(record.created_at),
    actor: String(record.actor),
  };
}

async function getPocketPointer(pb: PocketBase): Promise<RecordModel | null> {
  try {
    return await pb.collection(ACTIVE).getOne(CURRENT_ID, requestOptions);
  } catch (error) {
    if (isMissing(error)) return null;
    throw error;
  }
}

function pocketHistory(pointer: RecordModel): string[] {
  const value: unknown = JSON.parse(String(pointer.history || JSON.stringify([pointer.revision])));
  if (!Array.isArray(value) || !value.every((id) => typeof id === "string")) throw new Error("INVALID_ADMISSION_POINTER");
  return value.slice(0, 20).map(validId);
}

async function readPocketSnapshot(pb: PocketBase, id: string): Promise<Snapshot> {
  const revision = await pb.collection(REVISIONS).getOne(validId(id), requestOptions);
  if (typeof revision.file !== "string" || !revision.file) throw new Error("INVALID_ADMISSION_REVISION_FILE");
  const token = await pb.files.getToken(requestOptions);
  const url = pb.files.getURL(revision, revision.file, { token });
  const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error("ADMISSION_REVISION_DOWNLOAD_FAILED");
  const compressed = Buffer.from(await response.arrayBuffer());
  if (compressed.length > 50 * 1024 * 1024) throw new Error("ADMISSION_REVISION_TOO_LARGE");
  const snapshot = JSON.parse(gunzipSync(compressed, { maxOutputLength: MAX_UNCOMPRESSED }).toString("utf8")) as Snapshot;
  if (!snapshot.meta || snapshot.meta.id !== revision.id) throw new Error("INVALID_ADMISSION_REVISION");
  return { meta: recordMeta(revision), rows: validatedRows(snapshot.rows) };
}

async function ensureCollections(pb: PocketBase) {
  const definitions = [
    {
      name: REVISIONS,
      type: "base",
      listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null,
      fields: [
        { name: "key", type: "text", required: true },
        { name: "file", type: "file", required: true, maxSelect: 1, maxSize: 50 * 1024 * 1024, protected: true, mimeTypes: [] },
        { name: "file_name", type: "text", required: true },
        { name: "sheet_name", type: "text", required: true },
        { name: "actor", type: "text", required: true },
        { name: "row_count", type: "number", required: true, min: 1 },
        { name: "university_count", type: "number", required: true, min: 1 },
        { name: "created_at", type: "text", required: true },
      ],
      indexes: ["CREATE UNIQUE INDEX idx_suprema_admission_revision_key ON suprema_admission_revisions (key)"],
    },
    {
      name: ACTIVE,
      type: "base",
      listRule: null, viewRule: null, createRule: null, updateRule: null, deleteRule: null,
      fields: [
        { name: "key", type: "text", required: true },
        { name: "revision", type: "text", required: true },
        { name: "history", type: "text", required: true, max: 10000 },
        { name: "actor", type: "text", required: true },
        { name: "activated_at", type: "text", required: true },
      ],
      indexes: ["CREATE UNIQUE INDEX idx_suprema_admission_current_key ON suprema_admission_active (key)"],
    },
  ];
  for (const definition of definitions) {
    try {
      await pb.collections.getOne(definition.name, requestOptions);
    } catch (error) {
      if (!isMissing(error)) throw error;
      try {
        await pb.collections.create(definition, requestOptions);
      } catch (creationError) {
        // A concurrent administrator may have created this private collection.
        try { await pb.collections.getOne(definition.name, requestOptions); } catch { throw creationError; }
      }
    }
  }
}

export async function getActiveAdmissions(): Promise<AdmissionImportRow[]> {
  if (!hasPocketBaseAdmin()) {
    // Bundled data is read-only and remains usable before cloud storage is configured.
    if (process.env.VERCEL) return bundledRows();
    const pointer = await readPointer();
    return pointer ? (await readLocalSnapshot(pointer.id)).rows : bundledRows();
  }
  const pb = await pbAdmin();
  const pointer = await getPocketPointer(pb);
  if (!pointer) return bundledRows();
  return (await readPocketSnapshot(pb, String(pointer.revision))).rows;
}

export async function getAdmissionRevisions(): Promise<{ current: RevisionMeta | null; history: RevisionMeta[]; storage: "pocketbase" | "local" }> {
  if (!hasPocketBaseAdmin()) {
    const pointer = await readPointer();
    const current = pointer ? (await readLocalSnapshot(pointer.id)).meta : null;
    const history = pointer ? await Promise.all(pointer.history.slice(0, 20).map(async (id) => (await readLocalSnapshot(id)).meta)) : [];
    return { current, history, storage: "local" };
  }
  const pb = await pbAdmin();
  const pointer = await getPocketPointer(pb);
  if (!pointer) return { current: null, history: [], storage: "pocketbase" };
  const current = recordMeta(await pb.collection(REVISIONS).getOne(validId(String(pointer.revision)), requestOptions));
  const historyIds = pocketHistory(pointer);
  const history = await Promise.all(historyIds.map(async (id) => recordMeta(await pb.collection(REVISIONS).getOne(id, requestOptions))));
  return { current, history, storage: "pocketbase" };
}

export async function stageAdmissions(rows: AdmissionImportRow[], meta: { fileName: string; sheetName: string; actor: string }): Promise<RevisionMeta> {
  const cleanRows = validatedRows(rows);
  const id = randomBytes(8).toString("hex").slice(0, 15);
  const metadata: RevisionMeta = {
    id, fileName: meta.fileName, sheetName: meta.sheetName, actor: meta.actor,
    rowCount: cleanRows.length,
    universityCount: new Set(cleanRows.map((row) => row.univ)).size,
    createdAt: new Date().toISOString(),
  };
  const serialized = JSON.stringify({ meta: metadata, rows: cleanRows } satisfies Snapshot);
  if (Buffer.byteLength(serialized) > MAX_UNCOMPRESSED) throw new Error("ADMISSION_REVISION_TOO_LARGE");
  const compressed = gzipSync(serialized);
  if (!hasPocketBaseAdmin()) {
    const root = localRoot();
    await fs.mkdir(root, { recursive: true });
    await fs.writeFile(path.join(root, `${id}.json.gz`), compressed, { flag: "wx" });
    return metadata;
  }
  const pb = await pbAdmin();
  await ensureCollections(pb);
  const body = new FormData();
  body.set("id", id);
  body.set("key", id);
  body.set("file_name", metadata.fileName);
  body.set("sheet_name", metadata.sheetName);
  body.set("actor", metadata.actor);
  body.set("row_count", String(metadata.rowCount));
  body.set("university_count", String(metadata.universityCount));
  body.set("created_at", metadata.createdAt);
  body.set("file", new Blob([new Uint8Array(compressed)], { type: "application/gzip" }), "admissions.json.gz");
  await pb.collection(REVISIONS).create(body, requestOptions);
  return metadata;
}

export async function publishAdmissions(id: string, actor: string): Promise<RevisionMeta> {
  validId(id);
  if (!hasPocketBaseAdmin()) {
    const snapshot = await readLocalSnapshot(id);
    const previous = await readPointer();
    const pointer: ActivePointer = { id, actor, updatedAt: new Date().toISOString(), history: [id, ...(previous?.history ?? []).filter((entry) => entry !== id)].slice(0, 20) };
    const root = localRoot();
    const temporary = path.join(root, `active-${randomBytes(8).toString("hex")}.tmp`);
    await fs.writeFile(temporary, JSON.stringify(pointer), { flag: "wx" });
    try { await fs.rename(temporary, path.join(root, "active.json")); } catch (error) { await fs.unlink(temporary).catch(() => undefined); throw error; }
    return snapshot.meta;
  }
  const pb = await pbAdmin();
  const snapshot = await readPocketSnapshot(pb, id);
  await ensureCollections(pb);
  const publishedAt = new Date().toISOString();
  const previous = await getPocketPointer(pb);
  const history = [id, ...(previous ? pocketHistory(previous) : []).filter((entry) => entry !== id)].slice(0, 20);
  const pointer = { key: "current", revision: id, history: JSON.stringify(history), actor, activated_at: publishedAt };
  if (previous) {
    await pb.collection(ACTIVE).update(CURRENT_ID, pointer, requestOptions);
  } else {
    try {
      await pb.collection(ACTIVE).create({ id: CURRENT_ID, ...pointer }, requestOptions);
    } catch (error) {
      if (!(await getPocketPointer(pb))) throw error;
      await pb.collection(ACTIVE).update(CURRENT_ID, pointer, requestOptions);
    }
  }
  return snapshot.meta;
}
