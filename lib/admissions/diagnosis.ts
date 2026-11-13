import type { YearCutoff } from "@/lib/utils/admission/admissionDiagnosis";

export type AdmissionEvidenceRow = {
  univ: string; dept?: string; type?: string; name?: string;
  cutoff26?: number | null; cutoff26_50?: number | null; cutoff26_70?: number | null;
  cutoff25?: number | null; cutoff24?: number | null;
  reference26?: string; reference25?: string; reference24?: string;
};
export type DiagnosisChoice = { university: string; department: string; admission_type: string; track_name: string };
const normalized = (s: string) => s.trim().replace(/\s/g, "");
const gradeValue = (v: unknown): number | null => typeof v === "number" && Number.isFinite(v) && v >= 1 && v <= 9 ? v : null;
export function buildYearCutoffs(row: AdmissionEvidenceRow): YearCutoff[] {
  return [26, 25, 24].map(year => {
    const value = gradeValue(row[`cutoff${year}` as keyof AdmissionEvidenceRow]);
    const reference = String(row[`reference${year}` as keyof AdmissionEvidenceRow] || "");
    return {
      year: 2000 + year,
      cutoff50: (year === 26 ? gradeValue(row.cutoff26_50) : null) ?? (/50\s*%/.test(reference) ? value : null),
      cutoff70: (year === 26 ? gradeValue(row.cutoff26_70) : null) ?? (/70\s*%/.test(reference) ? value : null),
    };
  });
}
export function resolveAdmissionRow(choice: DiagnosisChoice, rows: AdmissionEvidenceRow[]): AdmissionEvidenceRow | null {
  const matches = rows.filter(row => normalized(row.univ) === normalized(choice.university) &&
    normalized(row.dept || "") === normalized(choice.department) && normalized(row.type || "") === normalized(choice.admission_type) && normalized(row.name || "") === normalized(choice.track_name));
  if (!matches.length) return null;
  const evidence = JSON.stringify(buildYearCutoffs(matches[0]));
  return matches.every(row => JSON.stringify(buildYearCutoffs(row)) === evidence) ? matches[0] : null;
}
export function validateDiagnosisInput(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("진단 요청 형식이 올바르지 않습니다.");
  const body = input as Record<string, unknown>;
  const raw = body.studentIndex;
  if ((typeof raw !== "number" && typeof raw !== "string") || (typeof raw === "string" && !/^\d+(?:\.\d+)?$/.test(raw.trim()))) throw new Error("내신 등급을 숫자로 입력해 주세요.");
  const studentIndex = Number(raw);
  const gradingSystem = body.gradingSystem ?? (["5", "five", "5-level"].includes(String(body.grade)) ? "5-level" : "9-level");
  if (gradingSystem !== "5-level" && gradingSystem !== "9-level") throw new Error("등급 체계를 선택해 주세요.");
  if (!Number.isFinite(studentIndex) || studentIndex < 1 || studentIndex > (gradingSystem === "5-level" ? 5 : 9)) throw new Error("내신 등급 범위를 확인해 주세요.");
  if (!Array.isArray(body.choices) || body.choices.length < 1 || body.choices.length > 20) throw new Error("진단할 대학은 1~20개를 선택해 주세요.");
  const choices: DiagnosisChoice[] = body.choices.map((value: unknown) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("대학 선택 형식이 올바르지 않습니다.");
    const choice = value as Record<string, unknown>;
    const aliases = { university: choice.university ?? choice.univ, department: choice.department ?? choice.dept, admission_type: choice.admission_type ?? choice.type, track_name: choice.track_name ?? choice.track };
    for (const v of Object.values(aliases)) if (typeof v !== "string" || !v.trim() || v.length > 300) throw new Error("대학·모집단위·전형유형·전형명을 모두 선택해 주세요.");
    return Object.fromEntries(Object.entries(aliases).map(([k,v]) => [k, String(v).trim()])) as DiagnosisChoice;
  });
  return { studentIndex, gradingSystem, choices, academyId: typeof body.academyId === "string" ? body.academyId.trim() : "" };
}
