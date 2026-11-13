import { NextRequest, NextResponse } from "next/server";
import { diagnoseAdmissionRange } from "@/lib/utils/admission/admissionDiagnosis";
import { getActiveAdmissions } from "@/lib/admissions/store";
import { buildYearCutoffs, resolveAdmissionRow, validateDiagnosisInput } from "@/lib/admissions/diagnosis";

export const runtime = "nodejs";
function convert5To9Grade(grade: number) {
  if (grade <= 2) return 1 + (grade - 1) * 2.6;
  if (grade <= 3) return 3.6 + (grade - 2) * 2.2;
  if (grade <= 4) return 5.8 + (grade - 3) * 2;
  return 7.8 + (grade - 4) * 1.2;
}
export async function POST(req: NextRequest) {
  let input: ReturnType<typeof validateDiagnosisInput>;
  try { input = validateDiagnosisInput(await req.json()); }
  catch (error) { return NextResponse.json({ error: error instanceof SyntaxError ? "올바른 진단 요청을 보내 주세요." : error instanceof Error ? error.message : "진단 입력을 확인해 주세요." }, { status: 400 }); }
  try {
    const { checkLicense } = await import("@/lib/auth");
    if (process.env.NODE_ENV !== "development" && !await checkLicense(input.academyId || "demo_academy")) return NextResponse.json({ error: "유효한 이용권을 확인하지 못했습니다." }, { status: 403 });
    const rows = await getActiveAdmissions();
    const evalIndex = input.gradingSystem === "5-level" ? convert5To9Grade(input.studentIndex) : input.studentIndex;
    const results = input.choices.map(choice => {
      const row = resolveAdmissionRow(choice, rows);
      const diagnosis = diagnoseAdmissionRange(evalIndex, row ? buildYearCutoffs(row) : []);
      const yearText = (year: number) => {
        const entry = diagnosis.yearly.find(item => item.year === year);
        const value = entry?.cutoff70 ?? entry?.cutoff50;
        return value == null ? "-" : value.toFixed(2);
      };
      return {
        ...choice, matched: Boolean(row), level: diagnosis.finalLevel,
        comment: `${!row ? "선택한 대학·캠퍼스·전형에 일치하는 유일한 근거를 찾지 못했습니다. " : ""}${diagnosis.finalComment}${input.gradingSystem === "5-level" ? " 5등급제 환산은 참고용 비교값이며 대학의 공식 환산점수가 아닙니다." : ""}`,
        safeCutoff: diagnosis.safeCutoff, reachCutoff: diagnosis.reachCutoff, spread: diagnosis.spread,
        y26: yearText(2026), y25: yearText(2025), y24: yearText(2024), yearly: diagnosis.yearly,
      };
    });
    return NextResponse.json({ results, studentIndex: input.studentIndex, comparisonIndex: evalIndex, gradingSystem: input.gradingSystem }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "입시 근거를 불러오지 못했습니다. 기존 결과를 유지하고 잠시 후 다시 시도해 주세요." }, { status: 503 });
  }
}
