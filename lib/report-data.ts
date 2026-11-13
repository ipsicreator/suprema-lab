import type { UserInfo } from "@/lib/user-info";

type StudentRecordSection = {
  title: string;
  items: string[];
};

export type StudentRecordReportData = {
  studentName: string;
  schoolName: string;
  grade: string;
  careerHint: string;
  parsedSubjects: Array<{
    subject: string;
    grade: number;
    rawScore: number | null;
    scoreAverage: number | null;
    year?: number;
    semester?: number;
  }>;
  studentRecord: {
    schoolInfo?: StudentRecordSection;
    curriculum?: StudentRecordSection;
    grades?: StudentRecordSection;
    sepec?: StudentRecordSection;
    creativeActivities?: StudentRecordSection;
    behaviorSummary?: StudentRecordSection;
  };
  studentAnalysis?: NonNullable<UserInfo["studentAnalysis"]>;
};

const section = (title: string, items: string[]): StudentRecordSection => ({ title, items });

type ReportInput = Omit<Partial<UserInfo>, "parsedSubjects"> & {
  parsedSubjects?: Array<NonNullable<UserInfo["parsedSubjects"]>[number] & { rawScore?: unknown; scoreAverage?: unknown }>;
};

function suppliedScore(value: unknown): number | null {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && !value.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function toStudentRecordReportData(info: ReportInput | null): StudentRecordReportData {
  const parsedSubjects = (info?.parsedSubjects ?? []).map((subject, index) => {
    const grade = Number(subject.grade ?? 0);
    const rawScore = suppliedScore(subject.rawScore);
    const scoreAverage = suppliedScore(subject.scoreAverage);
    return {
      subject: subject.subject || `과목 ${index + 1}`,
      grade,
      rawScore,
      scoreAverage,
      year: subject.year,
      semester: subject.semester,
    };
  });

  const schoolName = info?.schoolName?.trim() || "학교 정보 없음";
  const grade = info?.grade?.trim() || "학년 정보 없음";
  const studentName = info?.studentName?.trim() || "학생명 없음";
  const careerHint = info?.careerHint?.trim() || info?.hopeDepartment?.trim() || "희망 진로 정보 없음";
  const keywords = info?.studentAnalysis?.keyKeywords ?? [];

  return {
    studentName,
    schoolName,
    grade,
    careerHint,
    parsedSubjects,
    studentAnalysis: {
      majorField: info?.studentAnalysis?.majorField || careerHint,
      majorSuitability: info?.studentAnalysis?.majorSuitability || "전공 적합성 분석 대기",
      keyKeywords: keywords,
      academicCapacity: info?.studentAnalysis?.academicCapacity || "학업 역량 분석 대기",
      seTeukAnalysis: info?.studentAnalysis?.seTeukAnalysis || "세특 분석 대기",
      comprehensiveOpinion: info?.studentAnalysis?.comprehensiveOpinion || "종합 의견 분석 대기",
    },
    studentRecord: {
      schoolInfo: section("학교 정보", [`학교명: ${schoolName}`, `학년: ${grade}`, `학생명: ${studentName}`]),
      curriculum: section("교육과정", [careerHint, parsedSubjects.length ? `과목 수: ${parsedSubjects.length}개` : "과목 정보 없음"]),
      grades: section("성적 정보", parsedSubjects.length ? parsedSubjects.map((item) => `${item.subject}: ${item.grade}등급`) : ["성적 정보 없음"]),
      sepec: section("세특", keywords.length ? keywords.map((item) => `핵심 키워드: ${item}`) : ["세특 키워드 없음"]),
      creativeActivities: section("창체", ["창의적 체험활동 요약 정보 없음"]),
      behaviorSummary: section("행동특성", ["행동특성 및 종합의견 요약 정보 없음"]),
    },
  };
}
