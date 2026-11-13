import { NextResponse } from "next/server";
import { requireAdminOrThrow } from "@/lib/server-auth";
import { hasPocketBaseAdmin, pbAdmin } from "@/lib/pocketbaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 45;
type ObjectValue = Record<string, unknown>;
const object = (value: unknown): ObjectValue => value && typeof value === "object" && !Array.isArray(value) ? value as ObjectValue : {};
const options = () => ({ requestKey: null, signal: AbortSignal.timeout(10_000) });
function safe(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  if (/password|secret|authorization|bearer|api.?key|access.?token|refresh.?token/i.test(value)) return "[redacted]";
  return value.replace(/https?:\/\/\S+/gi, "[redacted-url]").replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]").replace(/\beyJ[A-Za-z0-9_-]{20,}(?:\.[A-Za-z0-9_-]+){1,2}\b/g, "[redacted-token]").replace(/'(?:''|[^']+)'/g, "'[redacted]'").replace(/\b\d{9,}\b/g, "[redacted-number]").slice(0, 1000);
}
function origin(value: string | undefined): string | null {
  try { const parsed = new URL(value || ""); return ["https:", "http:"].includes(parsed.protocol) && !parsed.username && !parsed.password ? parsed.origin : null; } catch { return null; }
}
export async function GET() {
  try {
    await requireAdminOrThrow();
    if (!hasPocketBaseAdmin()) throw new Error("STORAGE_NOT_CONFIGURED");
    const db = await pbAdmin();
    const schema = await db.collections.getOne("suprima_students", options());
    const raw: unknown[] = Array.isArray(schema.fields) ? schema.fields : Array.isArray(schema.schema) ? schema.schema : [];
    const fields = raw.map(value => { const item = object(value), config = { ...object(item.options), ...item }; return { id: typeof item.id === "string" ? item.id : null, name: typeof item.name === "string" ? item.name : "", type: typeof item.type === "string" ? item.type : "", ...(typeof config.collectionId === "string" ? { collectionId: config.collectionId } : {}), ...(typeof config.maxSelect === "number" ? { maxSelect: config.maxSelect } : {}) }; });
    const duplicates = (values: string[]) => [...new Set(values.filter((value, index) => value && values.indexOf(value) !== index))];
    let endpoint = "/api/logs", logData: ObjectValue = {}, logsAvailable = false, logStatus: number | undefined;
    try { logData = object(await db.send(endpoint, { ...options(), method: "GET", query: { page: 1, perPage: 50, sort: "-created" } })); logsAvailable = true; }
    catch (error) {
      logStatus = typeof object(error).status === "number" ? object(error).status as number : undefined;
      if (logStatus === 404) {
        endpoint = "/api/logs/requests";
        try { logData = object(await db.send(endpoint, { ...options(), method: "GET", query: { page: 1, perPage: 50, sort: "-created" } })); logsAvailable = true; logStatus = undefined; }
        catch (reason) { logStatus = typeof object(reason).status === "number" ? object(reason).status as number : undefined; }
      }
    }
    const entries = Array.isArray(logData.items) ? logData.items : [];
    const errors = entries.flatMap(rawEntry => {
      const entry = object(rawEntry), data = object(entry.data);
      const detail: ObjectValue = {};
      for (const key of ["error", "sql", "code", "message"]) {
        const value = data[key];
        if (typeof value === "string") detail[key] = safe(value);
        else if (value && typeof value === "object") { const nested = object(value); for (const nestedKey of ["error", "sql", "code", "message"]) if (typeof nested[nestedKey] === "string") detail[key + "." + nestedKey] = safe(nested[nestedKey]); }
      }
      const message = typeof entry.message === "string" ? entry.message : "";
      const related = /collection|schema|rule|migration|sqlite|constraint|index|alter table|suprima_students/i.test(message + " " + JSON.stringify(detail));
      const failure = Object.keys(detail).length > 0 || typeof entry.level === "number" && entry.level >= 8 || typeof data.status === "number" && data.status >= 400;
      if (!related || !failure) return [];
      return [{ created: typeof entry.created === "string" && /^[\d .:+TZ-]{1,40}$/.test(entry.created) ? entry.created : undefined, level: typeof entry.level === "number" ? entry.level : undefined, message: /^(GET|POST|PATCH|PUT|DELETE|OPTIONS|HEAD)\s+/i.test(message) ? undefined : safe(message), ...detail }];
    }).slice(0, 20);
    let latestSecurityState: { state: string; version?: string; created?: string } | null = null;
    try {
      const result = await db.collection("suprema_academy_security_revisions").getList(1, 1, { ...options(), sort: "-created", fields: "state,version,created" });
      const latest = result.items[0];
      if (latest && ["prepared", "applied", "rolled_back", "restore_required", "locked_failed", "locked_link_restore_required", "lockdown_required"].includes(latest.state)) latestSecurityState = { state: latest.state, version: typeof latest.version === "string" && /^academy-[a-z0-9-]{1,60}$/.test(latest.version) ? latest.version : undefined, created: typeof latest.created === "string" && /^[\d .:+TZ-]{1,40}$/.test(latest.created) ? latest.created : undefined };
    } catch { /* The backup may not exist; never return its raw content or errors. */ }
    const serverOrigin = origin(process.env.PB_URL), publicOrigin = origin(process.env.NEXT_PUBLIC_PB_URL);
    return NextResponse.json({ success: true, checkedAt: new Date().toISOString(), samePocketBaseOrigin: !!serverOrigin && !!publicOrigin && serverOrigin === publicOrigin, expectedPocketBaseOrigin: serverOrigin === "https://suprima-platform-pb.fly.dev", schemaKind: Array.isArray(schema.fields) ? "fields" : "schema", students: { collectionId: schema.id, fields, duplicateFieldIds: duplicates(fields.map(item => item.id || "")), duplicateFieldNames: duplicates(fields.map(item => item.name)), indexes: Array.isArray(schema.indexes) ? schema.indexes.map(safe) : [], rules: Object.fromEntries(["listRule", "viewRule", "createRule", "updateRule", "deleteRule"].map(key => [key, typeof schema[key] === "string" ? safe(schema[key]) : null])) }, latestSecurityState, logs: { available: logsAvailable, endpoint, status: logStatus, inspected: entries.length, errors } }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "SERVER_ERROR";
    const status = code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : ["AUTH_NOT_CONFIGURED", "ADMIN_NOT_CONFIGURED", "STORAGE_NOT_CONFIGURED"].includes(code) ? 503 : 500;
    return NextResponse.json({ success: false, error: status === 401 ? "로그인이 필요합니다." : status === 403 ? "본사 관리자 권한이 필요합니다." : "저장소 진단을 읽지 못했습니다. 기존 자료는 변경하지 않았습니다." }, { status, headers: { "Cache-Control": "no-store" } });
  }
}

