export type DiagnosisJudgment = "미진단" | "매우 안정" | "안정" | "적정" | "도전" | "상향/위험" | "판단 보류";
export type TargetChoice = { university: string; department: string; trackType: string; admissionName: string };
export type PublishedAdmission = { univ: string; dept: string; type: string; name: string };

export function judgmentFromLevel(level: unknown): DiagnosisJudgment {
  return typeof level === "string" && ["매우 안정", "안정", "적정", "도전", "상향/위험", "판단 보류"].includes(level)
    ? level as DiagnosisJudgment : "판단 보류";
}

export function targetOptions(rows: PublishedAdmission[], target: TargetChoice) {
  return {
    universities: [...new Set(rows.map(row => row.univ))].sort(),
    departments: [...new Set(rows.filter(row => row.univ === target.university).map(row => row.dept))].sort(),
    types: [...new Set(rows.filter(row => row.univ === target.university && row.dept === target.department).map(row => row.type))].sort(),
    names: [...new Set(rows.filter(row => row.univ === target.university && row.dept === target.department && row.type === target.trackType).map(row => row.name))].sort(),
  };
}

export function isPublishedChoice(rows: PublishedAdmission[], target: TargetChoice) {
  return rows.some(row => row.univ === target.university && row.dept === target.department && row.type === target.trackType && row.name === target.admissionName);
}

export type Step4Profile = { studentName?: string; schoolName?: string; careerHint?: string; studentIndex?: number; gradingSystem?: "9-level" | "5-level"; email?: string };
export function profileFromValue(value: unknown): Step4Profile | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const text = (field: string) => typeof raw[field] === "string" ? raw[field] as string : undefined;
  const gradingSystem = raw.gradingSystem === undefined || raw.gradingSystem === "9-level" ? "9-level" : raw.gradingSystem === "5-level" ? "5-level" : undefined;
  const numeric = typeof raw.studentIndex === "number" ? raw.studentIndex : typeof raw.studentIndex === "string" && /^\d+(?:\.\d+)?$/.test(raw.studentIndex.trim()) ? Number(raw.studentIndex) : NaN;
  return {
    studentName: text("studentName"), schoolName: text("schoolName"), careerHint: text("careerHint"), email: text("email"), gradingSystem,
    studentIndex: gradingSystem && Number.isFinite(numeric) && numeric >= 1 && numeric <= (gradingSystem === "5-level" ? 5 : 9) ? numeric : undefined,
  };
}
