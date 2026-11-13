"use client";

import { useEffect, useMemo, useState } from "react";
import pb from "../../../../lib/pocketbase";
import { MOCK_CANDIDATE, SUCCESSFUL_CANDIDATES, UNIVERSITIES } from "../../../../lib/utils/evaluationLogic";
import { parseGpaTextToNumber } from "../../../../lib/utils/admission/admissionLines";
import { useAdmissionData } from "../data/useAdmissionData";
import RadarEvaluationChart from "../charts/RadarEvaluationChart";
import RubricPanel from "../evaluation/RubricPanel";
import SepecViewer from "../evaluation/SepecViewer";
import { ArrowLeft, Save, CheckCircle2, Target, Printer, Trophy, Activity } from "lucide-react";

interface EvaluationSimulationProps {
  onBack?: () => void;
  studentData?: { id: string; name: string } | null;
}

type CandidateEntry = { tag: string; text: string };
type CandidateRecord = {
  id?: string;
  schoolLine?: string;
  track?: string;
  takenCourses?: string[];
  gradesBySubject?: Record<string, unknown>;
  realGpa?: string | number;
  sepec?: { term: string; subject: string; text: string }[];
  ca?: {
    autonomous?: CandidateEntry[];
    club?: CandidateEntry[];
    career?: CandidateEntry[];
  };
};

type AnalysisContent = {
  gradeAnalysis?: { subject: string }[];
  summary?: string;
  finalRecordDraft?: string;
  strengths?: string[];
  detectedActivities?: string;
  improvements?: string[];
  detectedGpa?: string | number;
};

const RUBRIC_KEYS = ["academic", "career", "community", "inquiry", "attitude", "growth"] as const;

function buildRubricState(labels: string[]) {
  return labels.reduce<Record<string, string>>((state, _, index) => {
    state[RUBRIC_KEYS[index] ?? RUBRIC_KEYS[0]] = "B";
    return state;
  }, {});
}

export default function EvaluationSimulation({ onBack, studentData }: EvaluationSimulationProps) {
  const { rows: ADMISSION_DATA, loading: dataLoading, error: dataError } = useAdmissionData();
  const [candidate, setCandidate] = useState<CandidateRecord>(MOCK_CANDIDATE as CandidateRecord);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUnivId, setSelectedUnivId] = useState<string>("snu");
  const [keyword, setKeyword] = useState("");
  const [rubricState, setRubricState] = useState<Record<string, string>>(() => buildRubricState(UNIVERSITIES[0]?.labels ?? []));
  const [parsedGpa, setParsedGpa] = useState<number | null>(null);
  const [targetDeptIdx, setTargetDeptIdx] = useState<number>(0);
  const [hsType, setHsType] = useState<string>("일반고");

  useEffect(() => {
    const loadRealData = async () => {
      setIsLoading(true);
      try {
        if (!studentData?.id) {
          setCandidate(MOCK_CANDIDATE as CandidateRecord);
          return;
        }

        const savedInfo = JSON.parse(localStorage.getItem(`student_info_${studentData.id}`) || "{}");
        if (savedInfo.gpa) {
          setParsedGpa(parseGpaTextToNumber(savedInfo.gpa));
        }

        const records = await pb.collection("suprima_pdf_analyses").getFullList({
          filter: `student_id = "${studentData.id}"`,
          sort: "-created",
        });
        const analysis = records.find((record) => !record.content.dataType || record.content.dataType === "analysis");

        if (analysis?.content) {
          const content = analysis.content as AnalysisContent;
          setCandidate({
            id: studentData.id,
            schoolLine: `학생 데이터 · ${studentData.name}`,
            track: "학생부 종합 · 교과 기준",
            takenCourses: content.gradeAnalysis?.map((grade) => grade.subject) || ["국어", "영어", "수학Ⅰ", "물리학Ⅰ"],
            gradesBySubject: {},
            realGpa: content.detectedGpa || "데이터 없음",
            sepec: [
              { term: "종합", subject: "분석 요약", text: content.summary || "" },
              { term: "종합", subject: "최종 초안", text: content.finalRecordDraft || "" },
            ],
            ca: {
              autonomous: [{ tag: "강점", text: content.strengths?.join("\n") || "" }],
              club: [{ tag: "활동", text: content.detectedActivities || "" }],
              career: [{ tag: "보완", text: content.improvements?.join("\n") || "" }],
            },
          });
        } else {
          setCandidate({ ...(MOCK_CANDIDATE as CandidateRecord), schoolLine: `분석 데이터 부족 · ${studentData.name}` });
        }
      } catch (error) {
        console.error("DB 로드 실패", error);
        setCandidate(MOCK_CANDIDATE as CandidateRecord);
      } finally {
        setIsLoading(false);
      }
    };

    loadRealData();
  }, [studentData]);

  const selectedUniv = useMemo(() => UNIVERSITIES.find((university) => university.id === selectedUnivId) ?? UNIVERSITIES[0], [selectedUnivId]);

  const matchingTargets = useMemo(() => {
    return ADMISSION_DATA.filter((admission) => {
      const cutoff = admission.cutoff26 ?? admission.cutoff25 ?? admission.cutoff24;
      return String(admission.univ || '').includes(selectedUniv.name) && cutoff !== null;
    });
  }, [selectedUniv.name, ADMISSION_DATA]);

  const activeTarget = targetDeptIdx >= 0 ? matchingTargets[targetDeptIdx] ?? matchingTargets[0] ?? null : null;
  const cutoff = activeTarget ? (activeTarget.cutoff26 ?? activeTarget.cutoff25 ?? activeTarget.cutoff24 ?? 0) : 0;

  const rubricScore = useMemo(() => {
    const values = Object.values(rubricState);
    if (values.length === 0) return 0;
    const total = values.reduce((sum, value) => sum + (value === "A" ? 100 : value === "B" ? 80 : 60), 0);
    return Math.round(total / values.length);
  }, [rubricState]);

  const resetForUniversity = (nextUniversityId: string) => {
    const nextUniversity = UNIVERSITIES.find((university) => university.id === nextUniversityId) ?? UNIVERSITIES[0];
    setSelectedUnivId(nextUniversityId);
    setRubricState(buildRubricState(nextUniversity.labels));
    setTargetDeptIdx(0);
  };

  const successfulCase = (SUCCESSFUL_CANDIDATES as Record<string, { keywords?: string[]; sepecSnippet?: string }>)[`${selectedUnivId}_default`] ??
    (SUCCESSFUL_CANDIDATES as Record<string, { keywords?: string[]; sepecSnippet?: string }>).default ??
    { keywords: [], sepecSnippet: "" };

  const synthesis = useMemo(() => {
    if (parsedGpa === null || !cutoff || !activeTarget) return null;
    const gpaGap = parsedGpa - cutoff;
    const maxReversalGap = hsType === "특목고" ? 1.0 : 0.5;

    if (gpaGap <= -0.1 && rubricScore >= 80) return { title: "최초 안정권", desc: "학업과 비교과가 모두 적합한 상태입니다.", color: "#16a34a", bg: "#dcfce7" };
    if (gpaGap <= 0.1 && rubricScore >= 85) return { title: "안정 합격권", desc: "해당 전형에서 합격 가능성이 높습니다.", color: "#2563eb", bg: "#dbeafe" };
    if (gpaGap > 0.1 && gpaGap <= maxReversalGap && rubricScore >= 95) return { title: "역전 가능권", desc: `현재 전형(${hsType}) 기준 비교과 강점으로 역전을 노릴 수 있습니다.`, color: "#d97706", bg: "#fef3c7" };
    if (gpaGap > maxReversalGap) return { title: "위험권", desc: `현재 전형(${hsType})에서 점수 격차가 큽니다.`, color: "#dc2626", bg: "#fee2e2" };
    if (gpaGap > 0.1 && rubricScore < 85) return { title: "부합성 위험", desc: "교과 점수 대비 비교과 설계가 부족합니다.", color: "#dc2626", bg: "#fee2e2" };
    if (gpaGap <= 0 && rubricScore < 80) return { title: "상향 주의", desc: "점수는 적합하지만 비교과 보완이 필요합니다.", color: "#ca8a04", bg: "#fef9c3" };
    return { title: "추가 보완 필요", desc: "현재 점수와 비교과를 함께 점검하는 것이 좋습니다.", color: "#0f766e", bg: "#ccfbf1" };
  }, [activeTarget, cutoff, hsType, parsedGpa, rubricScore]);

  const coreCheckResults = (selectedUniv.labels || []).map((label) => ({
    group: label,
    required: [label],
    taken: (candidate.takenCourses ?? []).slice(0, 1),
    status: "충족",
  }));

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  if (isLoading) return <div style={{ padding: "2rem", textAlign: "center" }}>데이터를 불러오는 중입니다...</div>;

  return (
    <div className="p-6 min-h-screen" style={{ padding: "1.5rem", backgroundColor: "#f8fafc", minHeight: "100vh", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {dataLoading && <p role="status">입시 데이터를 불러오는 중입니다.</p>}
      {dataError && <p role="alert" style={{ color: "#b91c1c" }}>{dataError}</p>}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#fff", padding: "1.25rem 1.5rem", borderRadius: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          {onBack && (
            <button onClick={onBack} style={{ padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0", backgroundColor: "#f1f5f9", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <ArrowLeft size={18} /> <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>뒤로가기</span>
            </button>
          )}
          <div>
            <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Target size={24} color="#4f46e5" /> 목표 대학 합격 시뮬레이션
            </h1>
            <p style={{ margin: "0.25rem 0 0 0", color: "#64748b", fontSize: "0.95rem" }}>
              {studentData ? `${studentData.name} 학생의 데이터를 기준으로 ${selectedUniv?.name} 전형을 분석합니다.` : "학생 비교과 데이터를 입력하면 전형 기준으로 시뮬레이션합니다."}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <label style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>고교 유형</label>
            <select value={hsType} onChange={(e) => setHsType(e.target.value)} style={{ padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", backgroundColor: "#fff", fontWeight: 600, color: "#1e293b" }}>
              <option value="일반고">일반고</option>
              <option value="특목고">특목고</option>
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <label style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>목표 대학</label>
            <select value={selectedUnivId} onChange={(e) => resetForUniversity(e.target.value)} style={{ padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", backgroundColor: "#fff", fontWeight: 600, color: "#1e293b" }}>
              {UNIVERSITIES.map((university) => (
                <option key={university.id} value={university.id}>
                  {university.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <label style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>세부 전형</label>
            <select value={targetDeptIdx} onChange={(e) => setTargetDeptIdx(parseInt(e.target.value, 10))} style={{ padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", backgroundColor: "#fff", fontWeight: 600, color: "#1e293b", width: "350px" }}>
              {matchingTargets.length === 0 ? <option value="-1">데이터 없음</option> : null}
              {matchingTargets.map((target, index) => (
                <option key={index} value={index}>
                  {target.dept} ({target.type} - {target.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={() => window.print()} style={{ padding: "0.5rem 1rem", display: "flex", alignItems: "center", gap: "0.5rem", borderRadius: "0.5rem", backgroundColor: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", cursor: "pointer", fontWeight: 600 }}>
            <Printer size={18} /> 출력
          </button>
          <button onClick={handleSave} style={{ padding: "0.5rem 1rem", display: "flex", alignItems: "center", gap: "0.5rem", borderRadius: "0.5rem", backgroundColor: isSaved ? "#10b981" : "#3b82f6", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600, transition: "all 0.2s" }}>
            {isSaved ? (
              <>
                <CheckCircle2 size={18} /> 저장됨
              </>
            ) : (
              <>
                <Save size={18} /> 저장
              </>
            )}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)", gap: "1.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ backgroundColor: "#fff", padding: "1.5rem", borderRadius: "0.75rem", border: "1px solid #e0e7ff", boxShadow: "0 4px 6px -1px rgba(79, 70, 229, 0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <Trophy size={20} color="#f59e0b" />
              <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#1e293b" }}>합격 패턴 비교 ({selectedUniv.name})</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div style={{ padding: "1rem", backgroundColor: "#f1f5f9", borderRadius: "0.5rem" }}>
                <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "0.875rem", color: "#64748b" }}>현재 학생 키워드</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {(candidate.ca?.autonomous?.[0]?.text?.split("\n").filter(Boolean).slice(0, 3) || ["정보 부족"]).map((item, index) => (
                    <span key={index} style={{ padding: "0.25rem 0.5rem", backgroundColor: "#e2e8f0", color: "#334155", borderRadius: "0.25rem", fontSize: "0.8rem" }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ padding: "1rem", backgroundColor: "#fef3c7", borderRadius: "0.5rem", border: "1px solid #fde68a" }}>
                <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "0.875rem", color: "#b45309" }}>합격 패턴 키워드</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {(successfulCase.keywords || []).map((item: string, index: number) => (
                    <span key={index} style={{ padding: "0.25rem 0.5rem", backgroundColor: "#f59e0b", color: "#fff", borderRadius: "0.25rem", fontSize: "0.8rem", fontWeight: 600 }}>
                      {item}
                    </span>
                  ))}
                </div>
                <p style={{ margin: "0.75rem 0 0 0", fontSize: "0.85rem", color: "#92400e", lineHeight: "1.5" }}>
                  {successfulCase.sepecSnippet || ""}
                </p>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: "#fff", padding: "1.5rem", borderRadius: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#1e293b" }}>학생부 문항 분석</h2>
              <input type="text" placeholder="키워드 검색" value={keyword} onChange={(e) => setKeyword(e.target.value)} style={{ width: "250px", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }} />
            </div>

            <SepecViewer sepecData={candidate.sepec || []} keyword={keyword} />

            {candidate.ca && (
              <>
                <h3 style={{ margin: "1.5rem 0 1rem 0", fontSize: "1.1rem", color: "#334155" }}>활동 요약</h3>
                <SepecViewer
                  sepecData={[
                    ...(candidate.ca.autonomous || []),
                    ...(candidate.ca.club || []),
                    ...(candidate.ca.career || []),
                  ].map((entry) => ({ term: "활동", subject: entry.tag, text: entry.text }))}
                  keyword={keyword}
                />
              </>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ backgroundColor: "#fff", padding: "1.5rem", borderRadius: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <h2 style={{ margin: "0 0 1rem 0", fontSize: "1.25rem", color: "#1e293b" }}>과목 충족 여부</h2>
            <div style={{ marginBottom: "1rem", padding: "0.75rem", backgroundColor: "#dcfce7", borderRadius: "0.5rem", color: "#166534", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CheckCircle2 size={20} /> 충족 상태 확인
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                  <th style={{ padding: "0.5rem" }}>영역</th>
                  <th style={{ padding: "0.5rem" }}>상태</th>
                  <th style={{ padding: "0.5rem" }}>학생 과목</th>
                </tr>
              </thead>
              <tbody>
                {coreCheckResults.map((row) => (
                  <tr key={row.group} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "0.5rem", fontWeight: 600, color: "#475569" }}>{row.group}</td>
                    <td style={{ padding: "0.5rem", color: "#16a34a", fontWeight: 600 }}>{row.status}</td>
                    <td style={{ padding: "0.5rem", color: "#64748b" }}>{row.taken.join(", ") || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
            <div style={{ backgroundColor: "#fff", padding: "1.5rem", borderRadius: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#1e293b" }}>{selectedUniv.name} 합격 루브릭</h2>
                <span style={{ fontSize: "0.75rem", backgroundColor: "#e2e8f0", padding: "0.25rem 0.5rem", borderRadius: "0.25rem" }}>기본 비교</span>
              </div>
              <RubricPanel rubricState={rubricState} setRubricState={setRubricState} labels={selectedUniv.labels} />
            </div>

            <div style={{ backgroundColor: "#fff", padding: "1.5rem", borderRadius: "0.75rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <h2 style={{ margin: "0 0 1rem 0", fontSize: "1.25rem", color: "#1e293b", textAlign: "center" }}>종합 판정</h2>
              <RadarEvaluationChart rubricState={rubricState} labels={selectedUniv.labels} />
            </div>
          </div>
        </div>
      </div>

      {synthesis && (
        <div style={{ backgroundColor: synthesis.bg, border: `2px solid ${synthesis.color}`, borderRadius: "1rem", padding: "2rem", marginTop: "1rem", display: "flex", flexDirection: "column", gap: "1.5rem", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Activity size={32} color={synthesis.color} />
            <h2 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 800, color: synthesis.color }}>최종 판단: {synthesis.title}</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div style={{ backgroundColor: "#fff", padding: "1.5rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0" }}>
              <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", color: "#475569", borderBottom: "2px solid #f1f5f9", paddingBottom: "0.5rem" }}>1. GPA Gap</h3>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.9rem", color: "#64748b" }}>학생 점수: <strong>{parsedGpa?.toFixed(2)}</strong></span>
                <span style={{ fontSize: "0.9rem", color: "#64748b" }}>기준 컷: <strong>{cutoff?.toFixed(2)}</strong></span>
              </div>
              <div style={{ marginTop: "1rem", textAlign: "center", fontSize: "1.5rem", fontWeight: 800, color: (parsedGpa ?? 0) - cutoff <= 0 ? "#16a34a" : "#dc2626" }}>
                {(parsedGpa ?? 0) - cutoff <= 0 ? "↓" : "↑"} {Math.abs((parsedGpa ?? 0) - cutoff).toFixed(2)} 점
              </div>
            </div>

            <div style={{ backgroundColor: "#fff", padding: "1.5rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0" }}>
              <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", color: "#475569", borderBottom: "2px solid #f1f5f9", paddingBottom: "0.5rem" }}>2. Rubric Score</h3>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.9rem", color: "#64748b" }}>비교과 점수</span>
              </div>
              <div style={{ marginTop: "1rem", textAlign: "center", fontSize: "1.5rem", fontWeight: 800, color: rubricScore >= 85 ? "#2563eb" : "#d97706" }}>
                {rubricScore} / 100
              </div>
            </div>
          </div>

          <div style={{ padding: "1.5rem", backgroundColor: "#fff", borderRadius: "0.75rem", borderLeft: `6px solid ${synthesis.color}` }}>
            <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", color: "#1e293b" }}>AI 판단 요약</h3>
            <p style={{ margin: 0, fontSize: "1.05rem", color: "#334155", lineHeight: "1.6" }}>{synthesis.desc}</p>
          </div>
        </div>
      )}
    </div>
  );
}
