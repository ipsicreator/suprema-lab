import { NextResponse } from "next/server";
import { hasPocketBaseAdmin, pbAdmin } from "@/lib/pocketbaseAdmin";
import { requireAdminOrThrow } from "@/lib/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const names = ["users", "suprima_profiles", "suprima_licenses", "suprima_students", "suprima_pdf_analyses"] as const;
const ruleNames = ["listRule", "viewRule", "createRule", "updateRule", "deleteRule"] as const;
const options = { requestKey: null, timeout: 15_000 };
const safeRule = (value: unknown) => typeof value === "string" ? value.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]").replace(/(["'])[^"']{80,}\1/g, '"[redacted-literal]"') : null;
const object = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};

export async function GET() {
  try {
    await requireAdminOrThrow();
    if (!hasPocketBaseAdmin()) throw new Error("STORAGE_NOT_CONFIGURED");
    const pb = await pbAdmin();
    const collections = await Promise.all(names.map(async name => {
      try {
        const collection = await pb.collections.getOne(name, options);
        const fields = (Array.isArray(collection.fields) ? collection.fields : Array.isArray(collection.schema) ? collection.schema : []).map((raw: unknown) => {
          const field = object(raw), config = { ...object(field.options), ...field };
          return { name: String(field.name || ""), type: String(field.type || ""), required: config.required === true,
            ...(typeof config.collectionId === "string" ? { collectionId: config.collectionId } : {}),
            ...(typeof config.maxSelect === "number" ? { maxSelect: config.maxSelect } : {}) };
        });
        const count = await pb.collection(name).getList(1, 1, { ...options, fields: "id" });
        return { name, id: collection.id, exists: true as const, count: count.totalItems, fields,
          rules: Object.fromEntries(ruleNames.map(key => [key, safeRule(collection[key])])) };
      } catch (error) {
        if (object(error).status === 404) return { name, exists: false as const, count: 0, fields: [], rules: {} };
        throw error;
      }
    }));
    const profilesSchema = collections.find(item => item.name === "suprima_profiles");
    const studentsSchema = collections.find(item => item.name === "suprima_students");
    const profileFields = new Set(profilesSchema?.fields.map(field => field.name));
    const studentFields = new Set(studentsSchema?.fields.map(field => field.name));
    const relationFields = studentsSchema?.fields.filter(field => field.type === "relation" && "collectionId" in field && field.collectionId === profilesSchema?.id).map(field => field.name) || [];
    const configuredAssignment = process.env.ACADEMY_STUDENT_CONSULTANT_FIELD || "";
    const profiles = profilesSchema?.exists ? await pb.collection("suprima_profiles").getFullList({ ...options, fields: ["id", "academy_id", "role", "admin_id", "user"].filter(name => name === "id" || profileFields.has(name)).join(",") }) : [];
    const students = studentsSchema?.exists ? await pb.collection("suprima_students").getFullList({ ...options, fields: ["id", "academy_id", ...relationFields].filter(name => name === "id" || studentFields.has(name)).join(",") }) : [];
    const academies = new Map<string, { academyId: string; profiles: number; roles: Record<string, number>; students: number; assignedStudents: Record<string, number> }>();
    const academy = (value: unknown) => {
      const id = typeof value === "string" && value.trim() ? value : "(미지정)";
      if (!academies.has(id)) academies.set(id, { academyId: id, profiles: 0, roles: {}, students: 0, assignedStudents: Object.fromEntries(relationFields.map(name => [name, 0])) });
      return academies.get(id)!;
    };
    for (const profile of profiles) {
      const entry = academy(profile.academy_id); entry.profiles++;
      const role = ["master", "admin", "consultant"].includes(profile.role) ? profile.role : "미확인";
      entry.roles[role] = (entry.roles[role] || 0) + 1;
    }
    const usersSchema = collections.find(item => item.name === "users");
    const users = usersSchema?.exists ? await pb.collection("users").getFullList({ ...options, fields: "id" }) : [];
    const userIds = new Set(users.map(user => user.id));
    const linkCounts = new Map<string, number>();
    let unlinkedProfiles = 0, unknownUserLinks = 0, conflictingProfileLinks = 0;
    for (const profile of profiles) {
      const links = [...new Set([profile.admin_id, profile.user].filter((value): value is string => typeof value === "string" && !!value))];
      if (!links.length) unlinkedProfiles++;
      if (links.length > 1) conflictingProfileLinks++;
      for (const id of links) {
        if (!userIds.has(id)) unknownUserLinks++;
        linkCounts.set(id, (linkCounts.get(id) || 0) + 1);
      }
    }
    const ambiguousUsers = [...linkCounts.values()].filter(count => count > 1).length;
    let invalidAssignments = 0;
    const profileById = new Map(profiles.map(profile => [profile.id, profile]));
    for (const student of students) {
      const entry = academy(student.academy_id); entry.students++;
      for (const field of relationFields) {
        const values = Array.isArray(student[field]) ? student[field] : student[field] ? [student[field]] : [];
        if (values.length) entry.assignedStudents[field]++;
        for (const id of values) {
          const profile = profileById.get(id);
          if (!profile || profile.academy_id !== student.academy_id || profile.role !== "consultant") invalidAssignments++;
        }
      }
    }
    return NextResponse.json({ success: true, checkedAt: new Date().toISOString(), collections,
      assignment: { configuredField: configuredAssignment || null, relationCandidates: relationFields, configuredFieldVerified: !!configuredAssignment && relationFields.includes(configuredAssignment), invalidAssignments },
      profileLinks: { unlinkedProfiles, unknownUserLinks, conflictingProfileLinks, ambiguousUsers },
      academies: [...academies.values()].sort((a, b) => a.academyId.localeCompare(b.academyId)).map((entry, index) => ({ ...entry, academyId: entry.academyId === "(미지정)" ? "소속 미지정" : "학원 " + (index + 1) })) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "SERVER_ERROR";
    const status = code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : ["AUTH_NOT_CONFIGURED", "ADMIN_NOT_CONFIGURED", "STORAGE_NOT_CONFIGURED"].includes(code) ? 503 : 500;
    return NextResponse.json({ success: false, error: status === 401 ? "로그인이 필요합니다." : status === 403 ? "본사 관리자 권한이 필요합니다." : status === 503 ? "관리자 또는 저장소 연결 설정을 확인해 주세요." : "학원 운영 상태를 확인하지 못했습니다. 기존 설정은 유지됩니다." }, { status, headers: { "Cache-Control": "no-store" } });
  }
}
