import type { ComponentProps } from "react";
import type ReportComponent from "../diagnosis/report";

export const REPORT_STORAGE_KEY = "suprema_diagnosis_report_v1";
export type ReportPayload = Pick<ComponentProps<typeof ReportComponent>, "studentInfo" | "results">;
export type ReportSnapshot = { version: 1; createdAt: string; profileSignature: string; payload: ReportPayload };
const levels = new Set(["매우 안정", "안정", "적정", "도전", "상향/위험", "판단 보류"]);
const object = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
function numeric(value: unknown): number | null {
  if (typeof value !== "number" && (typeof value !== "string" || !/^\d+(?:\.\d+)?$/.test(value.trim()))) return null;
  const result = Number(value);
  return Number.isFinite(result) ? result : null;
}

export function makeReportSnapshot(profile: unknown, results: unknown, createdAt = new Date().toISOString()): ReportSnapshot | null {
  if (!object(profile) || !Array.isArray(results) || results.length < 1 || results.length > 6 || !Number.isFinite(Date.parse(createdAt))) return null;
  const name = text(profile.studentName), grade = text(profile.grade);
  const gradingSystem = profile.gradingSystem === undefined || profile.gradingSystem === "9-level" ? "9-level" : profile.gradingSystem === "5-level" ? "5-level" : null;
  const score = numeric(profile.studentIndex);
  if (!name || !grade || !gradingSystem || score === null || score < 1 || score > (gradingSystem === "5-level" ? 5 : 9)) return null;
  const cleanResults: ReportPayload["results"] = [];
  for (const item of results) {
    if (!object(item)) return null;
    const university = text(item.university), department = text(item.department), track_name = text(item.track_name), level = text(item.level), comment = text(item.comment);
    if (!university || !department || !track_name || !levels.has(level) || !comment) return null;
    const entry: ReportPayload["results"][number] = { university, department, track_name, level, comment };
    for (const year of ["y24", "y25", "y26"] as const) {
      const value = item[year];
      if (value === undefined) continue;
      if (typeof value !== "string") return null;
      entry[year] = value;
    }
    if (typeof item.trend === "string") entry.trend = item.trend;
    cleanResults.push(entry);
  }
  const parsedSubjects: NonNullable<ReportPayload["studentInfo"]["parsedSubjects"]> = [];
  if (Array.isArray(profile.parsedSubjects)) {
    for (const item of profile.parsedSubjects) {
      if (!object(item) || !text(item.subject)) continue;
      const unit = numeric(item.unit), subjectGrade = numeric(item.grade);
      if (unit === null || unit < 0 || subjectGrade === null || subjectGrade < 1 || subjectGrade > 9) continue;
      parsedSubjects.push({ subject: text(item.subject), unit, grade: subjectGrade });
    }
  }
  return {
    version: 1, createdAt, profileSignature: JSON.stringify(profile),
    payload: { studentInfo: { name, grade, score: String(score), gradingSystem, parsedSubjects }, results: cleanResults },
  };
}

export function readReportSnapshot(value: unknown, currentProfile: unknown): ReportSnapshot | null {
  if (!object(value) || value.version !== 1 || typeof value.createdAt !== "string" || typeof value.profileSignature !== "string" || !object(value.payload)) return null;
  if (value.profileSignature !== JSON.stringify(currentProfile)) return null;
  // Rebuild student fields from the matching real profile, rather than trusting report display values.
  return makeReportSnapshot(currentProfile, value.payload.results, value.createdAt);
}
