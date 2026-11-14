export type YearCutoff = {
  year: number;
  cutoff50: number | null;
  cutoff70: number | null;
};

export type YearFeedback = YearCutoff & {
  status: "very_safe" | "safe" | "fit" | "challenge" | "risky" | "unknown";
  gap50: number | null;
  gap70: number | null;
  summary: string;
};

export type AdmissionDiagnosisResult = {
  finalLevel: string;
  finalComment: string;
  safeCutoff: number | null;
  reachCutoff: number | null;
  spread: number | null;
  yearly: YearFeedback[];
};

export const YEAR_ORDER = [2026, 2025, 2024];
export const YEAR_WEIGHTS: Record<number, number> = { 2026: 0.5, 2025: 0.3, 2024: 0.2 };

/**
 * 2028 개편 5등급제 성적을 기존 9등급제(2024~2026 입결 데이터) 비교용 등급으로 비례 변환합니다.
 * - 5등급제 1등급(누적 10%) -> 9등급제 1.0 ~ 3.6 (중심 1.83)
 * - 5등급제 2등급(누적 34%) -> 9등급제 3.6 ~ 5.8
 * - 5등급제 3등급(누적 66%) -> 9등급제 5.8 ~ 7.8
 * - 5등급제 4등급(누적 90%) -> 9등급제 7.8 ~ 9.0
 */
export function convert5To9Grade(grade: number): number {
  if (!Number.isFinite(grade) || grade <= 0) return 1.0;
  if (grade <= 1) return 1.0;
  if (grade <= 2) return Math.round((1.0 + (grade - 1.0) * 2.6) * 100) / 100;
  if (grade <= 3) return Math.round((3.6 + (grade - 2.0) * 2.2) * 100) / 100;
  if (grade <= 4) return Math.round((5.8 + (grade - 3.0) * 2.0) * 100) / 100;
  return Math.round((7.8 + (grade - 4.0) * 1.2) * 100) / 100;
}

const validGrade = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && value >= 1 && value <= 9;

function roundToTwo(value: number) {
  return Math.round(value * 100) / 100;
}

function weightedAverage(entries: Array<{ value: number; weight: number }>) {
  const usable = entries.filter((entry) => Number.isFinite(entry.value));
  if (!usable.length) return null;
  const totalWeight = usable.reduce((sum, entry) => sum + entry.weight, 0);
  if (!totalWeight) return null;
  const total = usable.reduce((sum, entry) => sum + entry.value * entry.weight, 0);
  return roundToTwo(total / totalWeight);
}

function classifyYear(studentIndex: number, cutoff50: number | null, cutoff70: number | null): YearFeedback["status"] {
  if (cutoff50 === null && cutoff70 === null) return "unknown";
  const safeThreshold = cutoff50 ?? cutoff70 ?? null;
  const reachThreshold = cutoff70 ?? cutoff50 ?? null;
  if (safeThreshold === null || reachThreshold === null) return "unknown";
  if (studentIndex <= safeThreshold - 0.15) return "very_safe";
  if (studentIndex <= safeThreshold + 0.05) return "safe";
  if (studentIndex <= reachThreshold + 0.05) return "fit";
  if (studentIndex <= reachThreshold + 0.35) return "challenge";
  return "risky";
}

function statusScore(status: YearFeedback["status"]) {
  switch (status) {
    case "very_safe":
      return 0;
    case "safe":
      return 1;
    case "fit":
      return 2;
    case "challenge":
      return 3;
    case "risky":
      return 4;
    default:
      return 2;
  }
}

function statusLabel(status: YearFeedback["status"]) {
  switch (status) {
    case "very_safe":
      return "매우 안정";
    case "safe":
      return "안정";
    case "fit":
      return "적정";
    case "challenge":
      return "도전";
    case "risky":
      return "상향/위험";
    default:
      return "기준 없음";
  }
}

export function diagnoseAdmissionRange(studentIndex: number, rows: YearCutoff[]): AdmissionDiagnosisResult {
  const normalizedRows = YEAR_ORDER.map((year) => {
    const source = rows.find((row) => row.year === year) ?? { year, cutoff50: null, cutoff70: null };
    let cutoff50 = validGrade(studentIndex) && validGrade(source.cutoff50) ? source.cutoff50 : null;
    let cutoff70 = validGrade(studentIndex) && validGrade(source.cutoff70) ? source.cutoff70 : null;
    if (cutoff50 !== null && cutoff70 !== null && cutoff50 > cutoff70) { cutoff50 = null; cutoff70 = null; }
    const status = classifyYear(studentIndex, cutoff50, cutoff70);
    return {
      year,
      cutoff50,
      cutoff70,
      status,
      gap50: cutoff50 === null ? null : roundToTwo(studentIndex - cutoff50),
      gap70: cutoff70 === null ? null : roundToTwo(studentIndex - cutoff70),
      summary: `${year}학년도 ${statusLabel(status)}`,
    } satisfies YearFeedback;
  });

  const weightedSafe = weightedAverage(
    normalizedRows
      .filter((row) => row.cutoff50 !== null)
      .map((row) => ({ value: row.cutoff50 as number, weight: YEAR_WEIGHTS[row.year] })),
  );
  const weightedReach = weightedAverage(
    normalizedRows
      .filter((row) => row.cutoff70 !== null)
      .map((row) => ({ value: row.cutoff70 as number, weight: YEAR_WEIGHTS[row.year] })),
  );

  const spread = weightedAverage(
    normalizedRows
      .filter((row) => row.cutoff50 !== null && row.cutoff70 !== null)
      .map((row) => ({
        value: (row.cutoff70 as number) - (row.cutoff50 as number),
        weight: YEAR_WEIGHTS[row.year],
      })),
  );

  const score = weightedAverage(
    normalizedRows.filter(row => row.status !== "unknown").map((row) => ({
      value: statusScore(row.status),
      weight: YEAR_WEIGHTS[row.year],
    })),
  );

  const safeCutoff = weightedSafe;
  const reachCutoff = weightedReach;
  const safeMargin = spread !== null ? Math.max(0.12, Math.min(0.25, spread * 0.12)) : 0.15;
  const challengeMargin = spread !== null ? Math.max(0.25, Math.min(0.5, spread * 0.35)) : 0.35;

  let finalLevel = "판단 보류";
  if (score !== null) {
    if (score <= 0.6) finalLevel = "매우 안정";
    else if (score <= 1.3) finalLevel = "안정";
    else if (score <= 2.2) finalLevel = "적정";
    else if (score <= 3.1) finalLevel = "도전";
    else finalLevel = "상향/위험";
  }

  if (safeCutoff !== null && reachCutoff !== null) {
    if (studentIndex <= safeCutoff - safeMargin) finalLevel = "매우 안정";
    else if (studentIndex <= safeCutoff + safeMargin * 0.5) finalLevel = "안정";
    else if (studentIndex <= reachCutoff + safeMargin * 0.5) finalLevel = "적정";
    else if (studentIndex <= reachCutoff + challengeMargin) finalLevel = "도전";
    else finalLevel = "상향/위험";
  }

  const yearlySummary = normalizedRows
    .map((row) => `${row.year}학년도 ${statusLabel(row.status)}${row.cutoff50 !== null ? ` (50% ${row.cutoff50.toFixed(2)})` : ""}${row.cutoff70 !== null ? ` / 70% ${row.cutoff70.toFixed(2)}` : ""}`)
    .join(" · ");

  return {
    finalLevel,
    finalComment: score === null ? "비교 가능한 입결 근거가 없어 판단을 보류합니다. 대학·전형·입결 기준을 확인해 주세요." : `${yearlySummary}을 순서대로 반영한 결과 ${finalLevel}으로 판단했습니다.`,
    safeCutoff,
    reachCutoff,
    spread,
    yearly: normalizedRows,
  };
}
