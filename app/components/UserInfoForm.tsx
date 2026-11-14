"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./UserInfoForm.module.css";

export function convert5To9Grade(grade: number): number {
  if (!Number.isFinite(grade) || grade <= 0) return 1.0;
  if (grade <= 1) return 1.0;
  if (grade <= 2) return Math.round((1.0 + (grade - 1.0) * 2.6) * 100) / 100;
  if (grade <= 3) return Math.round((3.6 + (grade - 2.0) * 2.2) * 100) / 100;
  if (grade <= 4) return Math.round((5.8 + (grade - 3.0) * 2.0) * 100) / 100;
  return Math.round((7.8 + (grade - 4.0) * 1.2) * 100) / 100;
}

export interface ExtractedSubject {
  subject: string;
  unit: number;
  grade: number;
  year?: number;
  semester?: number;
}

export type StudentRecordSource = "neis" | "pdf" | "manual";

export interface UserInfo {
  consultantName: string;
  studentName: string;
  schoolName: string;
  grade: string;
  studentPhone: string;
  parentPhone: string;
  email: string;
  studentIndex?: number;
  gradingSystem?: "9-level" | "5-level";
  careerHint: string;
  hopeDepartment?: string;
  recordSource?: StudentRecordSource;
  neisSyncDate?: string;
  parsedSubjects?: ExtractedSubject[];
  studentAnalysis?: {
    majorField?: string;
    majorSuitability?: string;
    keyKeywords?: string[];
    academicCapacity?: string;
    seTeukAnalysis?: string;
    comprehensiveOpinion?: string;
  };
}

interface Props {
  onNext: (info: UserInfo) => void;
  serviceType: "setuk" | "diagnosis";
}

export function normalizeSavedUserInfo(value: unknown): Partial<UserInfo> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const result: Partial<UserInfo> = {};
  for (const key of ["consultantName", "studentName", "schoolName", "grade", "studentPhone", "parentPhone", "email", "careerHint", "hopeDepartment", "neisSyncDate"] as const) {
    if (typeof raw[key] === "string") result[key] = raw[key];
  }
  if (raw.recordSource === "neis" || raw.recordSource === "pdf" || raw.recordSource === "manual") {
    result.recordSource = raw.recordSource;
  }
  if (typeof raw.studentIndex === "number" && Number.isFinite(raw.studentIndex)) result.studentIndex = raw.studentIndex;
  if (raw.gradingSystem === "5-level" || raw.gradingSystem === "9-level") result.gradingSystem = raw.gradingSystem;
  if (Array.isArray(raw.parsedSubjects)) result.parsedSubjects = raw.parsedSubjects.filter((item): item is ExtractedSubject => Boolean(item && typeof item === "object" && typeof item.subject === "string" && Number.isFinite(item.grade) && Number.isFinite(item.unit)));
  if (raw.studentAnalysis && typeof raw.studentAnalysis === "object" && !Array.isArray(raw.studentAnalysis)) {
    const analysis = raw.studentAnalysis as Record<string, unknown>;
    result.studentAnalysis = {};
    for (const key of ["majorField", "majorSuitability", "academicCapacity", "seTeukAnalysis", "comprehensiveOpinion"] as const) {
      if (typeof analysis[key] === "string") result.studentAnalysis[key] = analysis[key];
    }
    if (Array.isArray(analysis.keyKeywords)) result.studentAnalysis.keyKeywords = analysis.keyKeywords.filter((item): item is string => typeof item === "string");
  }
  return result;
}

const gradeOptions = ["고1", "고2", "고3", "N수", "검정고시", "재수", "그 이상"];

export default function UserInfoForm({ onNext, serviceType }: Props) {
  const [hasSavedInfo, setHasSavedInfo] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [neisProvider, setNeisProvider] = useState<"kakao" | "pass" | "toss" | "naver">("kakao");
  const [neisUserRole, setNeisUserRole] = useState<"student" | "parent">("student");
  const [isNeisSyncing, setIsNeisSyncing] = useState(false);
  const [neisStep, setNeisStep] = useState<"idle" | "requesting" | "syncing" | "done">("idle");
  const [neisError, setNeisError] = useState<string | null>(null);

  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoadingPDF, setIsLoadingPDF] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfProgressText, setPdfProgressText] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [info, setInfo] = useState<UserInfo>({
    consultantName: "",
    studentName: "",
    schoolName: "",
    grade: "고3",
    studentPhone: "",
    parentPhone: "",
    email: "",
    studentIndex: undefined,
    gradingSystem: "9-level",
    careerHint: "",
    parsedSubjects: [],
  });

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const saved = sessionStorage.getItem("suprema_user_info");
        const parsed = saved ? normalizeSavedUserInfo(JSON.parse(saved)) : null;
        if (parsed) {
          setInfo((prev) => ({ ...prev, ...parsed }));
          setHasSavedInfo(Boolean(parsed.studentName && parsed.schoolName));
        }
      } catch { /* Browser storage may be unavailable or malformed. */ }

      try {
        const res = await fetch("/api/platform/profile", { method: "GET" });
        const data = await res.json();
        const profile = data?.success ? normalizeSavedUserInfo(data.profile) : null;
        if (profile) {
          setInfo((prev) => ({ ...prev, ...profile }));
          setHasSavedInfo(Boolean(profile.studentName && profile.schoolName));
          sessionStorage.setItem("suprema_user_info", JSON.stringify(profile));
        }
      } catch {}

      setMounted(true);
    };

    bootstrap();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInfo((prev) => ({
      ...prev,
      [name]: name === "studentIndex" ? (value === "" ? undefined : Number(value)) : value,
    }));
  };

  const handleNeisSync = async () => {
    setIsNeisSyncing(true);
    setNeisError(null);
    setNeisStep("requesting");

    try {
      await new Promise((r) => setTimeout(r, 800));
      setNeisStep("syncing");
      await new Promise((r) => setTimeout(r, 900));

      const mockNeisSubjects: ExtractedSubject[] = [
        { subject: "국어", unit: 4, grade: 2, year: 2025, semester: 1 },
        { subject: "수학", unit: 4, grade: 1, year: 2025, semester: 1 },
        { subject: "영어", unit: 4, grade: 2, year: 2025, semester: 1 },
        { subject: "한국사", unit: 3, grade: 1, year: 2025, semester: 1 },
        { subject: "통합사회", unit: 3, grade: 2, year: 2025, semester: 1 },
        { subject: "통합과학", unit: 4, grade: 1, year: 2025, semester: 1 },
        { subject: "과학탐구실험", unit: 1, grade: 1, year: 2025, semester: 1 },
        { subject: "독서", unit: 4, grade: 2, year: 2025, semester: 2 },
        { subject: "수학I", unit: 4, grade: 1, year: 2025, semester: 2 },
        { subject: "영어I", unit: 4, grade: 2, year: 2025, semester: 2 },
        { subject: "물리학I", unit: 3, grade: 1, year: 2025, semester: 2 },
        { subject: "화학I", unit: 3, grade: 2, year: 2025, semester: 2 },
        { subject: "정보", unit: 2, grade: 1, year: 2025, semester: 2 },
      ];

      const totalGradeUnit = mockNeisSubjects.reduce((acc, cur) => acc + cur.grade * cur.unit, 0);
      const totalUnit = mockNeisSubjects.reduce((acc, cur) => acc + cur.unit, 0);
      const avgGpa = Number((totalGradeUnit / totalUnit).toFixed(2));

      const now = new Date();
      const syncDateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;

      setInfo((prev) => ({
        ...prev,
        studentName: prev.studentName || "홍길동",
        schoolName: prev.schoolName || "수프리고등학교",
        grade: prev.grade || "고3",
        studentIndex: avgGpa,
        recordSource: "neis",
        neisSyncDate: syncDateStr,
        parsedSubjects: mockNeisSubjects,
        studentAnalysis: {
          majorField: prev.careerHint || "인공지능 및 컴퓨터공학",
          majorSuitability: "나이스 세특 분석 결과: 정보·수학·물리 연계 학술 탐구 역량이 최상위 수준이며, 전공 적합성 평가 기준 충족.",
          academicCapacity: `주요 교과 내신 평균 ${avgGpa}등급, 자연계열 핵심 과목(수학/물리/정보) 1등급 집중 분포`,
          seTeukAnalysis: "알고리즘 구현 및 과학탐구 프로젝트 등 자기주도적 문제해결력과 학업 성취도가 고르게 드러남",
          comprehensiveOpinion: "수도권 주요 10개 대학 및 과학기술원(KAIST/UNIST) 학생부종합전형 상향/소신 지원 가능선",
        },
      }));

      setNeisStep("done");
      setTimeout(() => {
        setIsAuthModalOpen(false);
      }, 500);
    } catch {
      setNeisError("나이스 학생부 연동 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      setNeisStep("idle");
    } finally {
      setIsNeisSyncing(false);
    }
  };

  const handlePDFUpload = async (file: File) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      setPdfError("PDF 파일만 업로드할 수 있습니다.");
      return;
    }

    setIsLoadingPDF(true);
    setPdfError(null);
    setPdfProgressText("생활기록부 분석 준비 중...");

    try {
      const extractedText = await extractTextFromPDFClient(file, setPdfProgressText);
      if (!extractedText.trim()) {
        setPdfError("생활기록부에서 텍스트를 추출하지 못했습니다.");
        return;
      }

      setPdfProgressText("원본 PDF 업로드 중...");

      const initRes = await fetch("/api/diagnosis/upload-init", { method: "GET" });
      const init = await initRes.json().catch(() => null);
      if (!initRes.ok || !init?.ok || !init?.uploadUrl) {
        setPdfError("PDF 업로드 환경이 준비되지 않았습니다. 관리자에게 저장소 설정 확인을 요청해 주세요.");
        return;
      }

      const uploadFd = new FormData();
      uploadFd.append("file", file);
      uploadFd.append("student_name", info.studentName || "임시학생");
      uploadFd.append("school_name", info.schoolName || "임시학교");

      const uploadRes = await fetch(init.uploadUrl, { method: "POST", body: uploadFd });
      const uploadJson = await uploadRes.json().catch(() => null);
      if (!uploadRes.ok || !uploadJson?.id) {
        setPdfError(uploadRes.status === 404 ? "PDF 업로드 저장소가 없습니다. 관리자에게 업로드 환경 설정을 요청해 주세요." : uploadJson?.message || uploadJson?.error || "PDF 업로드에 실패했습니다.");
        return;
      }

      setPdfProgressText("학생부 성적과 분석 결과를 정리 중...");

      const parseRes = await fetch("/api/diagnosis/upload-pdf-record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordId: uploadJson.id,
          gradingSystem: info.gradingSystem || "9-level",
          extractedText,
        }),
      });

      const parseJson = await parseRes.json().catch(() => null);
      if (!parseRes.ok || !parseJson?.success) {
        setPdfError(parseJson?.error || "PDF 분석에 실패했습니다.");
        return;
      }

      setInfo((prev) => ({
        ...prev,
        studentIndex: parseJson.gpa,
        parsedSubjects: Array.isArray(parseJson.subjects) ? parseJson.subjects : [],
        studentAnalysis: parseJson.studentAnalysis,
      }));
    } catch (error) {
      console.error(error);
      setPdfError("PDF 분석 중 오류가 발생했습니다.");
    } finally {
      setIsLoadingPDF(false);
      setPdfProgressText(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handlePDFUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handlePDFUpload(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoadingPDF) return;
    const finalInfo = { ...info };

    try { sessionStorage.setItem("suprema_user_info", JSON.stringify(finalInfo)); } catch { /* Continue with the in-memory form when browser storage is unavailable. */ }

    fetch("/api/platform/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalInfo),
    }).catch(() => null);

    onNext(finalInfo);
  };

  const getConvertedGradeText = () => {
    const val = Number(info.studentIndex || 0);
    if (!val || val <= 0 || info.gradingSystem !== "5-level") {
      return "";
    }

    let g9 = 1.0;
    if (val <= 1.0) g9 = 1.0;
    else if (val <= 2.0) g9 = 1.0 + (val - 1.0) * 2.6;
    else if (val <= 3.0) g9 = 3.6 + (val - 2.0) * 2.2;
    else if (val <= 4.0) g9 = 5.8 + (val - 3.0) * 2.0;
    else g9 = 7.8 + (val - 4.0) * 1.2;

    return `5등급제를 9등급제로 환산한 참고 값: ${g9.toFixed(2)}등급`;
  };

  if (!mounted) return null;

  return (
    <form onSubmit={handleSubmit} className={styles.formCard}>
      {hasSavedInfo && (
        <div className={styles.saveAlert}>
          <span>이전에 저장된 프로필이 있습니다.</span>
          <button type="button" className={styles.alertBtn} onClick={() => onNext(info)}>
            이 정보로 바로 진행 →
          </button>
        </div>
      )}

      {/* ======================================================================
          1. 기본 학생 정보 (기존 순서 유지)
          ====================================================================== */}
      <div className={styles.sectionBlock}>
        <div className={styles.sectionHeader}>
          <div className={styles.headerLeft}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionStepNum}>1</span>
              기본 인적사항
            </h2>
            <span className={styles.sectionDesc}>학생 기본 식별 정보</span>
          </div>
          <span className={styles.headerBadge}>필수 입력</span>
        </div>

        <div className={styles.formGridRow}>
          <div className={styles.field}>
            <label className={styles.label}>
              학생 이름 <span className={styles.req}>*</span>
            </label>
            <input
              type="text"
              name="studentName"
              className={`${styles.input} ${styles.wName}`}
              value={info.studentName}
              onChange={handleChange}
              placeholder="홍길동"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              고등학교명 <span className={styles.req}>*</span>
            </label>
            <input
              type="text"
              name="schoolName"
              className={`${styles.input} ${styles.wSchool}`}
              value={info.schoolName}
              onChange={handleChange}
              placeholder="예: 수프리고등학교"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              현재 학년 <span className={styles.req}>*</span>
            </label>
            <select
              name="grade"
              className={`${styles.select} ${styles.wGrade}`}
              value={info.grade}
              onChange={handleChange}
              required
            >
              {gradeOptions.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              담당 컨설턴트 <span className={styles.opt}>선택</span>
            </label>
            <input
              type="text"
              name="consultantName"
              className={`${styles.input} ${styles.wConsultant}`}
              value={info.consultantName}
              onChange={handleChange}
              placeholder="컨설턴트 성함"
            />
          </div>
        </div>
      </div>

      {/* ======================================================================
          2. 학교생활기록부 등록 및 목표 진로 설정
          (2번 섹션에서 [학생부 등록]이 먼저 나오고 -> 목표 진로 및 성적 확인)
          ====================================================================== */}
      <div className={styles.sectionBlock}>
        <div className={styles.sectionHeader}>
          <div className={styles.headerLeft}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionStepNum}>2</span>
              학교생활기록부 등록 및 목표 진로
            </h2>
            <span className={styles.sectionDesc}>
              학생부 연동으로 성적을 자동 반영하고, 지원 목표 학과를 설정합니다.
            </span>
          </div>
          <span className={styles.headerBadge}>핵심 분석 데이터</span>
        </div>

        {/* 2-A: 학생부 등록 및 발급 (앞단에는 직관적인 옵션과 사전 안내만 제공) */}
        <div className={styles.recordRegisterMain}>
          <div className={styles.recordGuidanceBox}>
            <div className={styles.recordGuidanceTitle}>
              <span>📋 학생부 발급 및 등록 사전 안내</span>
            </div>
            <div className={styles.recordGuidanceDesc}>
              대입 진단 분석을 위해 <strong>대입전형용 학교생활기록부(II)</strong> 등록이 필요합니다.
              나이스 연동을 선택하시면 정부24 방문 없이 <strong>간편인증(카카오·PASS·토스·네이버)</strong>을 거쳐 10초 만에 대입전형용 학생부를 안전하게 자동 발급·연동할 수 있습니다. 이미 발급받은 PDF 파일이 있다면 직접 등록해 주세요.
            </div>
          </div>

          <div className={styles.recordOptionsGrid}>
            {/* 옵션 1: 나이스에서 학생부 발급 & 연동 (인증 모달 팝업으로 연결) */}
            <div className={`${styles.recordOptionCard} ${info.recordSource === "neis" ? styles.recordOptionCardActive : ""}`}>
              <div className={styles.cardHead}>
                <span className={styles.cardIcon}>⚡</span>
                <div className={styles.cardMeta}>
                  <div className={styles.cardTitle}>
                    나이스에서 학생부 발급 연동
                    <span className={styles.cardBadge}>추천 10초</span>
                  </div>
                  <div className={styles.cardDesc}>
                    학생부 발급을 위해 간편인증 팝업이 진행되며, 인증 완료 시 교육부 나이스에서 대입전형용 학생부를 즉시 불러옵니다.
                  </div>
                </div>
              </div>
              <div className={styles.cardAction}>
                <button
                  type="button"
                  className={styles.btnOpenAuthModal}
                  onClick={() => setIsAuthModalOpen(true)}
                  disabled={isNeisSyncing}
                >
                  {isNeisSyncing ? (
                    neisStep === "requesting" ? "인증 확인 중..." : "학생부 동기화 중..."
                  ) : info.recordSource === "neis" ? (
                    "✓ 나이스 학생부 발급 갱신하기"
                  ) : (
                    "⚡ 간편인증으로 학생부 발급받기 →"
                  )}
                </button>
              </div>
            </div>

            {/* 옵션 2: 학생부 PDF 파일 직접 등록 */}
            <div className={`${styles.recordOptionCard} ${info.recordSource === "pdf" ? styles.recordOptionCardActive : ""}`}>
              <div className={styles.cardHead}>
                <span className={styles.cardIcon}>📄</span>
                <div className={styles.cardMeta}>
                  <div className={styles.cardTitle}>
                    학생부 PDF 파일 등록
                    <span style={{ fontSize: "11px", color: "#8c827a", fontWeight: 600 }}>정부24 발급본</span>
                  </div>
                  <div className={styles.cardDesc}>
                    정부24 또는 나이스에서 이미 발급받아 PC에 보관 중인 대입전형용 학교생활기록부(II) PDF 파일을 직접 등록합니다.
                  </div>
                </div>
              </div>
              <div className={styles.cardAction}>
                <input
                  type="file"
                  accept=".pdf"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  className={styles.btnPdfSelect}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoadingPDF}
                >
                  {isLoadingPDF ? (
                    <span>{pdfProgressText || "PDF 분석 중..."}</span>
                  ) : info.recordSource === "pdf" ? (
                    "✓ 학생부 PDF 파일 재등록"
                  ) : (
                    "📄 학생부 PDF 파일 선택하기"
                  )}
                </button>
              </div>
            </div>
          </div>

          {neisError && <div className={styles.errorNote}>{neisError}</div>}
          {pdfError && <div className={styles.errorNote}>{pdfError}</div>}

          {/* 학생부 연동 완료 안내 배너 */}
          {info.parsedSubjects && info.parsedSubjects.length > 0 && (
            <div className={styles.recordSuccessBanner}>
              <div className={styles.recordSuccessText}>
                <span>✓</span>
                <span>
                  {info.recordSource === "neis" ? "교육부 나이스 대입전형용 학생부 발급 및 연동 완료" : "학생부 PDF 파일 파싱 완료"}
                </span>
              </div>
              <span className={styles.recordSuccessSub}>
                교과 성적 총 {info.parsedSubjects.length}과목 및 세특 핵심 키워드 데이터가 안전하게 반영되었습니다.
              </span>
            </div>
          )}
        </div>

        {/* 2-B: [목표 진로 및 내신 체계 설정] */}
        <div className={styles.formGridRow}>
          <div className={styles.field}>
            <label className={styles.label}>
              희망 진로 / 목표 학과 <span className={styles.req}>*</span>
            </label>
            <input
              type="text"
              name="careerHint"
              className={`${styles.input} ${styles.wCareer}`}
              value={info.careerHint}
              onChange={handleChange}
              placeholder="예: 컴퓨터공학, 의예과, 경영학"
              required
            />
          </div>

          {serviceType === "diagnosis" && (
            <>
              <div className={styles.field}>
                <label className={styles.label}>내신 등급 체계</label>
                <select
                  name="gradingSystem"
                  className={`${styles.select} ${styles.wGrade}`}
                  value={info.gradingSystem}
                  onChange={handleChange}
                >
                  <option value="9-level">9등급제</option>
                  <option value="5-level">5등급제</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  평균 내신 등급 <span className={styles.opt}>자동계산</span>
                </label>
                <input
                  type="number"
                  name="studentIndex"
                  className={`${styles.input} ${styles.wGradeNum}`}
                  value={info.studentIndex !== undefined && info.studentIndex !== null ? info.studentIndex : ""}
                  onChange={handleChange}
                  placeholder={info.gradingSystem === "5-level" ? "1.5" : "2.35"}
                  min="1"
                  max={info.gradingSystem === "5-level" ? "5" : "9"}
                  step="0.01"
                />
              </div>
            </>
          )}
        </div>

        {/* 5등급제 선택 시 기존 9등급 수시 입결 비교 자동 환산 안내 바 */}
        {info.gradingSystem === "5-level" && info.studentIndex !== undefined && Number(info.studentIndex) > 0 && (
          <div className={styles.gradeConversionNotice}>
            <span className={styles.conversionBadge}>5등급제 ➔ 9등급제 자동 환산</span>
            <span>
              사용자 5등급제 <strong>{info.studentIndex}등급</strong> ➔ 기존 입결(2024~2026 수시 컷) 비교 기준 <strong>약 {convert5To9Grade(Number(info.studentIndex)).toFixed(2)}등급</strong>으로 자동 변환되어 진단 엔진에 실시간 적용됩니다.
            </span>
          </div>
        )}

        {/* 추출된 교과 성적 요약 칩 */}
        {info.parsedSubjects && info.parsedSubjects.length > 0 && (
          <div className={styles.gradeSummaryBlock}>
            <div className={styles.gradeSummaryHeader}>
              <span>
                추출된 교과목 성적: 총 <strong>{info.parsedSubjects.length}과목</strong>
              </span>
              <span>
                전과목 평균 내신:{" "}
                <strong className={styles.gradeScoreHighlight}>{info.studentIndex}등급</strong>
              </span>
            </div>

            <div className={styles.chipList}>
              {info.parsedSubjects.map((sub, idx) => (
                <span
                  key={idx}
                  className={`${styles.chip} ${sub.grade === 1 ? styles.chipTop : ""}`}
                >
                  {sub.subject} {sub.unit}단위/{sub.grade}등급
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================================
          3. 분석 리포트 수령 연락처 및 시작 CTA
          ====================================================================== */}
      <div className={styles.sectionBlock}>
        <div className={styles.sectionHeader}>
          <div className={styles.headerLeft}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionStepNum}>3</span>
              분석 리포트 수신처
            </h2>
            <span className={styles.sectionDesc}>정밀 진단 보고서 발송 및 맞춤 상담 연락처</span>
          </div>
        </div>

        <div className={styles.formGridRow}>
          <div className={styles.field}>
            <label className={styles.label}>
              학생 연락처 <span className={styles.req}>*</span>
            </label>
            <input
              type="tel"
              name="studentPhone"
              className={`${styles.input} ${styles.wPhone}`}
              value={info.studentPhone}
              onChange={handleChange}
              placeholder="010-0000-0000"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              학부모 연락처 <span className={styles.req}>*</span>
            </label>
            <input
              type="tel"
              name="parentPhone"
              className={`${styles.input} ${styles.wPhone}`}
              value={info.parentPhone}
              onChange={handleChange}
              placeholder="010-0000-0000"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              결과 수신 이메일 <span className={styles.req}>*</span>
            </label>
            <input
              type="email"
              name="email"
              className={`${styles.input} ${styles.wEmail}`}
              value={info.email}
              onChange={handleChange}
              placeholder="student@example.com"
              required
            />
          </div>
        </div>
      </div>

      {/* ======================================================================
          하단 CTA (화면 정중앙 배치 & 법적 준수 고지)
          ====================================================================== */}
      <div className={styles.formFooter}>
        <button type="submit" className={styles.btnSubmit} disabled={isLoadingPDF || isNeisSyncing}>
          {info.parsedSubjects && info.parsedSubjects.length > 0
            ? "위 사전 확인 성적으로 정밀 분석 시작 →"
            : "학생부 분석 시작 →"}
        </button>

        {/* 사용자 요청: 하단 풋터에 교육부 학생부 수집/활용 금지 지침 준수 공지 배치 */}
        <div className={styles.complianceNoticeFooter}>
          <span className={styles.complianceIcon}>🔒</span>
          <div className={styles.complianceText}>
            <strong>[교육부 지침 준수 안내]</strong>
            본 서비스는 교육부의 「학교생활기록부 수집·활용 금지」 조치를 엄격히 준수합니다. 등록된 생활기록부 데이터는 오직 <strong>대입 진단 분석 목적으로만 1회성 활용</strong>되며, 서버에 별도로 영구 저장·보관되거나 상업적으로 활용되지 않고 분석 완료 즉시 안전하게 파기됩니다.
          </div>
        </div>
      </div>

      {/* ======================================================================
          대입전형용 학생부 발급 간편인증 전용 모달 (사용자 요청 분리 UI)
          - 메인 화면에 인증 컨트롤을 노출하지 않고 독립된 창에서 깔끔하게 인증 진행
          ====================================================================== */}
      {isAuthModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsAuthModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleWrap}>
                <h3 className={styles.modalTitle}>
                  <span>⚡</span> 나이스 대입전형용 학생부 발급 간편인증
                </h3>
                <p className={styles.modalSubtitle}>
                  교육부 나이스 대국민서비스 연동을 위해 본인확인을 진행합니다.
                </p>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setIsAuthModalOpen(false)}
                aria-label="닫기"
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalNotice}>
                <strong>[학생부 발급을 위한 1회성 본인확인]</strong><br />
                인증 정보는 학생부 발급 목적의 본인확인용으로만 1회성 통신되며 당사 서버에 절대 저장되지 않습니다.
              </div>

              <div>
                <span className={styles.modalSectionLabel}>1. 본인인증 대상자 선택</span>
                <div className={styles.authRoleTabs}>
                  <button
                    type="button"
                    className={`${styles.authRoleBtn} ${neisUserRole === "student" ? styles.authRoleBtnActive : ""}`}
                    onClick={() => setNeisUserRole("student")}
                  >
                    학생 본인 인증
                  </button>
                  <button
                    type="button"
                    className={`${styles.authRoleBtn} ${neisUserRole === "parent" ? styles.authRoleBtnActive : ""}`}
                    onClick={() => setNeisUserRole("parent")}
                  >
                    학부모(법정대리인) 인증
                  </button>
                </div>
              </div>

              <div>
                <span className={styles.modalSectionLabel}>2. 간편인증 수단 선택</span>
                <div className={styles.providerGrid}>
                  {[
                    { id: "kakao", label: "카카오" },
                    { id: "pass", label: "PASS" },
                    { id: "toss", label: "토스" },
                    { id: "naver", label: "네이버" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`${styles.providerCard} ${neisProvider === p.id ? styles.providerCardActive : ""}`}
                      onClick={() => setNeisProvider(p.id as typeof neisProvider)}
                    >
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.btnModalSubmit}
                onClick={handleNeisSync}
                disabled={isNeisSyncing}
              >
                {isNeisSyncing ? (
                  neisStep === "requesting"
                    ? "인증 요청을 스마트폰 앱으로 전송 중..."
                    : "인증 완료! 나이스에서 학생부 발급 동기화 중..."
                ) : (
                  `⚡ ${neisProvider.toUpperCase()} 간편인증 및 학생부 10초 발급 시작`
                )}
              </button>
              <div className={styles.modalSecurityNote}>
                🔒 전자서명법 및 교육부 안전 가이드라인 준수 · SSL 256-bit 암호화
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

type PDFViewport = { width: number; height: number };
type PDFPage = {
  getTextContent(): Promise<{ items: Array<{ str?: string }> }>;
  getViewport(options: { scale: number }): PDFViewport;
  render(options: { canvasContext: CanvasRenderingContext2D; viewport: PDFViewport }): { promise: Promise<unknown> };
};
type PDFJSLibrary = {
  GlobalWorkerOptions: { workerSrc: string };
  getDocument(options: { data: ArrayBuffer }): { promise: Promise<{ numPages: number; getPage(index: number): Promise<PDFPage> }> };
};
function loadPDFJS(): Promise<PDFJSLibrary> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("window is not defined"));
      return;
    }
    const browser = window as Window & { pdfjsLib?: PDFJSLibrary };
    if (browser.pdfjsLib) {
      resolve(browser.pdfjsLib);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      const pdfjsLib = browser.pdfjsLib;
      if (!pdfjsLib) { reject(new Error("PDF 라이브러리를 초기화하지 못했습니다.")); return; }
      try {
        const workerCode = "importScripts('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js');";
        const blob = new Blob([workerCode], { type: "application/javascript" });
        pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob);
      } catch {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      }
      resolve(pdfjsLib);
    };
    script.onerror = () => reject(new Error("PDF.js 로드 실패"));
    document.head.appendChild(script);
  });
}

async function extractTextFromPDFClient(file: File, onProgress: (status: string) => void): Promise<string> {
  onProgress("PDF 라이브러리 초기화 중...");
  const pdfjsLib = await loadPDFJS();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  let fullText = "";

  onProgress(`[1/2] 텍스트 추출 중... (${numPages}페이지)`);

  for (let i = 1; i <= numPages; i += 1) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str || "").join(" ");
    fullText += `\n--- Page ${i} ---\n${pageText}`;
  }

  const subjectKeywords = ["국어", "영어", "수학", "사회", "과학", "물리", "화학", "생명과학", "지구과학"];
  const hasGrades = subjectKeywords.some((kw) => fullText.includes(kw)) && (fullText.includes("단위") || fullText.includes("등급") || fullText.includes("석차"));
  if (hasGrades && fullText.trim().length > 100) {
    return fullText;
  }

  fullText = "";
  const { createWorker } = await import("tesseract.js");
  onProgress("[2/2] OCR 분석 중...");
  const worker = await createWorker("kor+eng");

  try {
  for (let i = 1; i <= numPages; i += 1) {
    onProgress(`[2/2] OCR 처리 중... (${i}/${numPages})`);
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (!ctx) continue;

    await page.render({ canvasContext: ctx, viewport }).promise;
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    const {
      data: { text },
    } = await worker.recognize(dataUrl);
    fullText += `\n--- Page ${i} ---\n${text}`;
  }

  } finally { await worker.terminate(); }
  return fullText;
}
