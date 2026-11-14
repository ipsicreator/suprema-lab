"use client";

import Image from "next/image";
import { reportBadgeStyle } from "./reportPresentation";
import Link from "next/link";
import { useState } from "react";
import { Minus, Printer, TrendingDown, TrendingUp, Mail, CheckCircle2 } from "lucide-react";
import { convert5To9Grade } from "@/lib/utils/admission/admissionDiagnosis";
import OfficialFooter from "../components/OfficialFooter";

type ParsedSubject = {
  subject: string;
  unit: string | number;
  grade: string | number;
};

type StudentAnalysis = {
  parsedSubjects?: ParsedSubject[];
  gradingSystem?: string;
};

type ReportResult = {
  university: string;
  track_name?: string;
  department: string;
  y24?: string;
  y25?: string;
  y26?: string;
  trend?: string;
  level: string;
  comment: string;
};

interface ReportProps {
  studentInfo: {
    name: string;
    grade: string;
    score: string;
    email?: string;
    parsedSubjects?: ParsedSubject[];
    studentAnalysis?: StudentAnalysis;
    gradingSystem?: string;
  };
  results: ReportResult[];
  onBack?: () => void;
  onReset?: () => void;
}

export default function ReportComponent({ studentInfo, results, onBack }: ReportProps) {
  const handlePrint = () => window.print();
  const parsedSubjects = studentInfo.parsedSubjects || [];
  const is5Level = studentInfo.gradingSystem === "5-level" || studentInfo.grade === "5" || studentInfo.grade === "5단계";

  // 개인 메일 보내기 상태
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [targetEmail, setTargetEmail] = useState(() => {
    if (studentInfo.email) return studentInfo.email;
    try {
      const saved = sessionStorage.getItem("suprema_user_info");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email) return parsed.email;
      }
    } catch {}
    return "";
  });
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "success" | "error">("idle");
  const [emailMessage, setEmailMessage] = useState("");

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmail.trim()) return;

    setIsSendingEmail(true);
    setEmailStatus("idle");
    setEmailMessage("");

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: targetEmail.trim(),
          subject: `[수프리마 나의 입시멘토] ${studentInfo.name} 학생 대입 위치 진단 보고서`,
          reportData: {
            studentName: studentInfo.name,
            grade: studentInfo.grade,
            averageScore: studentInfo.score,
            diagnosisDate: new Date().toLocaleDateString("ko-KR"),
            targetUniversityResults: results.map((r) => ({
              university: r.university,
              department: r.department,
              track: r.track_name || "일반",
              pastCutoffs: { "2024": r.y24, "2025": r.y25, "2026_expected": r.y26 },
              evaluationLevel: r.level,
              consultantComment: r.comment,
            })),
            parsedSubjectsCount: parsedSubjects.length,
          },
        }),
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok) {
        setEmailStatus("success");
        setEmailMessage(`보고서가 ${targetEmail} 로 성공적으로 발송되었습니다.`);
        setTimeout(() => setShowEmailModal(false), 3000);
      } else {
        setEmailStatus("error");
        setEmailMessage(data?.message || data?.error || "이메일 발송에 실패했습니다.");
      }
    } catch {
      setEmailStatus("error");
      setEmailMessage("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div style={{ color: "#111827", padding: 0 }} className="print-p-0">
      <div className="print-hidden" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "20px" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center" }}>
          <Image src="/suprema-official-logo.png" alt="대치 수프리마 공식 로고" width={140} height={48} priority style={{ width: "140px", height: "auto" }} />
        </Link>
        <span style={{ fontSize: "11px", fontWeight: 900, color: "#8b1a1a", letterSpacing: "0.15em" }}>나의 입시멘토 리포트</span>
      </div>

      <div style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px" }} className="print-mb-6">
          <div>
            <div style={{ display: "inline-block", padding: "5px 12px", backgroundColor: "#fbf5f2", color: "#8b1a1a", borderRadius: "4px", fontSize: "11px", fontWeight: 800, letterSpacing: "0.05em", marginBottom: "8px", border: "1px solid #ebdcd0" }} className="print-hidden">
              대입 심층 진단 보고서
            </div>
            <h1 className="heading-premium" style={{ fontSize: "1.85rem", fontWeight: 950, letterSpacing: "-0.04em", marginBottom: "6px", color: "#1a0f08" }}>
              입시 위치 진단 결과 보고서
            </h1>
            <p style={{ color: "#796e65", fontSize: "13px", fontWeight: 600, margin: 0 }}>
              목표 대학·전형의 누적 입결 데이터와 입력된 학생부 성적을 정밀 교차 분석한 공식 진단서입니다.
            </p>
          </div>

          {/* 상단 액션 바: 메일 보내기 탭 신설 */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }} className="print-hidden">
            {onBack && (
              <button onClick={onBack} style={{ padding: "10px 18px", backgroundColor: "white", border: "1px solid #D1D5DB", color: "#4B5563", borderRadius: "6px", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>
                ← 이전 단계
              </button>
            )}

            {/* 신설: 개인 메일로 보내기 탭 버튼 */}
            <button
              onClick={() => setShowEmailModal((prev) => !prev)}
              style={{
                padding: "10px 18px",
                backgroundColor: showEmailModal ? "#741515" : "#8b1a1a",
                border: "none",
                color: "white",
                borderRadius: "6px",
                fontWeight: 800,
                fontSize: "13px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(139, 26, 26, 0.2)",
              }}
            >
              <Mail className="w-4 h-4" /> 개인 메일로 보내기
            </button>

            <button onClick={handlePrint} className="btn-premium" style={{ padding: "10px 18px", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer", backgroundColor: "#1a0f08", color: "white", borderRadius: "6px", border: "none", fontWeight: 700 }}>
              <Printer className="w-4 h-4" /> PDF 출력
            </button>
          </div>
        </div>

        {/* 신설: 개인 메일로 보내기 인라인 폼 패널 */}
        {showEmailModal && (
          <div
            className="print-hidden"
            style={{
              backgroundColor: "#fcfaf7",
              border: "1.5px solid #ebdcd0",
              borderRadius: "8px",
              padding: "16px 20px",
              marginBottom: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "14px" }}>✉️</span>
                <strong style={{ fontSize: "13px", color: "#1a0f08", fontWeight: 800 }}>진단 결과보고서 개인 이메일 발송</strong>
                <span style={{ fontSize: "11px", color: "#796e65" }}>- 입력하신 이메일로 암호화 리포트가 즉시 전송됩니다.</span>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                style={{ background: "none", border: "none", fontSize: "16px", color: "#8c827a", cursor: "pointer", padding: "0 4px" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendEmail} style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <input
                type="email"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                placeholder="수신할 이메일 주소를 입력하세요 (예: student@example.com)"
                required
                style={{
                  flex: 1,
                  minWidth: "260px",
                  height: "38px",
                  padding: "0 12px",
                  border: "1.5px solid #d4c7b8",
                  borderRadius: "5px",
                  fontSize: "13px",
                  fontWeight: 600,
                  outline: "none",
                  backgroundColor: "#ffffff",
                }}
              />
              <button
                type="submit"
                disabled={isSendingEmail}
                style={{
                  height: "38px",
                  padding: "0 20px",
                  backgroundColor: "#8b1a1a",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  fontSize: "13px",
                  fontWeight: 800,
                  cursor: isSendingEmail ? "wait" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  opacity: isSendingEmail ? 0.7 : 1,
                }}
              >
                {isSendingEmail ? "보고서 발송 중..." : "리포트 즉시 발송 →"}
              </button>
            </form>

            {emailStatus === "success" && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#15803d", fontWeight: 700 }}>
                <CheckCircle2 className="w-4 h-4" /> {emailMessage}
              </div>
            )}
            {emailStatus === "error" && (
              <div style={{ fontSize: "12px", color: "#dc2626", fontWeight: 700 }}>
                오류: {emailMessage}
              </div>
            )}
          </div>
        )}

        <div style={{ backgroundColor: "white", padding: "20px 32px", borderRadius: "20px", border: "1px solid #ECE0D1", boxShadow: "0 10px 30px rgba(44, 26, 10, 0.03)", marginBottom: "24px", display: "flex", flexWrap: "wrap", gap: "36px", alignItems: "center" }}>
          <div>
            <span style={{ color: "#9CA3AF", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "6px" }}>학생명</span>
            <span style={{ fontSize: "1.4rem", fontWeight: 950, color: "#111827" }}>{studentInfo.name}</span>
          </div>
          <div style={{ width: "1px", height: "30px", backgroundColor: "#ECE0D1" }} className="print-hidden" />
          <div>
            <span style={{ color: "#9CA3AF", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "4px" }}>
              {is5Level ? "내신 성적 (5등급제 원성적)" : "평균 내신 등급 (9등급제)"}
            </span>
            <span style={{ fontSize: "1.4rem", fontWeight: 950, color: "var(--suprima-burgundy)" }}>
              {studentInfo.score}등급
            </span>
            {is5Level && Number(studentInfo.score) > 0 && (
              <span style={{ display: "block", fontSize: "11px", color: "#8b1a1a", fontWeight: 800, marginTop: "2px" }}>
                ➔ 기존 입결 비교 9등급 환산: 약 {convert5To9Grade(Number(studentInfo.score)).toFixed(2)}등급
              </span>
            )}
          </div>
          <div style={{ width: "1px", height: "30px", backgroundColor: "#ECE0D1" }} className="print-hidden" />
          <div>
            <span style={{ color: "#9CA3AF", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "4px" }}>학년</span>
            <span style={{ fontSize: "1.4rem", fontWeight: 950, color: "#111827" }}>{studentInfo.grade}</span>
          </div>
        </div>

        {parsedSubjects.length > 0 && (
          <div style={{ backgroundColor: "#FAF6F0", borderRadius: "20px", padding: "20px 28px", border: "1px solid #ECE0D1", marginBottom: "24px" }}>
            <h3 style={{ fontSize: "13px", fontWeight: 900, color: "var(--suprima-burgundy)", margin: "0 0 12px 0" }}>
              학생부 과목 목록 ({parsedSubjects.length})
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {parsedSubjects.map((subject, index) => (
                <div key={index} style={{ backgroundColor: "white", border: "1px solid rgba(139, 26, 26, 0.15)", borderRadius: "8px", padding: "6px 12px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "11.5px", fontWeight: 900, color: "#111827" }}>{subject.subject}</span>
                  <span style={{ width: "1px", height: "12px", backgroundColor: "#ECE0D1" }} />
                  <span style={{ fontSize: "10.5px", fontWeight: 800, color: "#7C7267" }}>{subject.unit}단위</span>
                  <span style={{ fontSize: "10.5px", fontWeight: 900, color: "var(--suprima-burgundy)", backgroundColor: "rgba(139, 26, 26, 0.05)", padding: "1px 5px", borderRadius: "4px" }}>
                    {subject.grade}등급
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ background: "linear-gradient(135deg, #FFFDFB 0%, #F5EFEB 100%)", borderRadius: "20px", padding: "20px 28px", border: "1px solid #E3D5C5", marginBottom: "24px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: 900, color: "var(--suprima-burgundy)", margin: 0 }}>분석 요약</h3>
          <p style={{ margin: "8px 0 0 0", fontSize: "12px", lineHeight: "1.5", color: "#4B5563", fontWeight: 700 }}>
            {is5Level
              ? "5단계 기준 자료를 함께 반영한 결과입니다. 학생부/성적/진로 데이터를 바탕으로 결과를 정리합니다."
              : "9단계 기준 자료를 함께 반영한 결과입니다. 2024~2026년 추이를 함께 확인할 수 있도록 구성했습니다."}
          </p>
        </div>

        <div style={{ backgroundColor: "white", borderRadius: "20px", border: "1px solid #ECE0D1", boxShadow: "0 10px 30px rgba(44, 26, 10, 0.03)", overflow: "hidden", marginBottom: "20px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr style={{ backgroundColor: "#F9FAFB", borderBottom: "1px solid #ECE0D1" }}>
                <th style={{ padding: "12px 20px", fontSize: "10px", fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "left", width: "28%" }}>대학 / 학과 / 전형</th>
                <th style={{ padding: "12px", fontSize: "10px", fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center", width: "10%" }}>2024</th>
                <th style={{ padding: "12px", fontSize: "10px", fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center", width: "10%" }}>2025</th>
                <th style={{ padding: "12px", fontSize: "10px", fontWeight: 800, color: "var(--suprima-burgundy)", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center", width: "10%", backgroundColor: "rgba(139, 26, 26, 0.03)" }}>2026</th>
                <th style={{ padding: "12px", fontSize: "10px", fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center", width: "8%" }}>추세</th>
                <th style={{ padding: "12px 20px", fontSize: "10px", fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "left", width: "34%" }}>판정 / 코멘트</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item, index) => {
                const badgeStyle = reportBadgeStyle(item.level);

                return (
                  <tr key={index} style={{ borderBottom: index === results.length - 1 ? "none" : "1px solid #ECE0D1" }}>
                    <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                      <p style={{ fontSize: "1.05rem", fontWeight: 950, color: "#111827", margin: "0 0 4px 0" }}>{item.university}</p>
                      <p style={{ fontSize: "11px", color: "#6B7280", fontWeight: 800, margin: 0 }}>
                        {item.track_name || "일반전형"} <span style={{ color: "#D1D5DB", margin: "0 4px" }}>|</span> {item.department}
                      </p>
                    </td>
                    <td style={{ padding: "16px 12px", textAlign: "center", fontFamily: "monospace", fontSize: "13px", color: "#9CA3AF", fontWeight: 700 }}>{item.y24 || "-"}</td>
                    <td style={{ padding: "16px 12px", textAlign: "center", fontFamily: "monospace", fontSize: "13px", color: "#9CA3AF", fontWeight: 700 }}>{item.y25 || "-"}</td>
                    <td style={{ padding: "16px 12px", textAlign: "center", fontFamily: "monospace", fontSize: "14px", fontWeight: 900, color: "var(--suprima-burgundy)", backgroundColor: "rgba(139, 26, 26, 0.03)" }}>{item.y26 || "-"}</td>
                    <td style={{ padding: "16px 12px", textAlign: "center", verticalAlign: "middle" }}>
                      {item.trend === "up" ? <TrendingUp className="w-5 h-5 mx-auto" style={{ color: "#EF4444" }} /> : item.trend === "down" ? <TrendingDown className="w-5 h-5 mx-auto" style={{ color: "#3B82F6" }} /> : item.trend === "flat" ? <Minus className="w-5 h-5 mx-auto" style={{ color: "#D1D5DB" }} /> : <span aria-label="추세 자료 없음">—</span>}
                    </td>
                    <td style={{ padding: "16px 20px", verticalAlign: "middle" }}>
                      <div style={{ marginBottom: "6px" }}>
                        <span style={{ display: "inline-block", padding: "3px 8px", borderRadius: "9999px", fontSize: "12px", fontWeight: 900, ...badgeStyle }}>
                          {item.level}
                        </span>
                      </div>
                      <p style={{ fontSize: "13px", color: "#4B5563", lineHeight: "1.6", fontWeight: 700, margin: 0, wordBreak: "keep-all" }}>{item.comment}</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 12px" }}>
          <div style={{ display: "flex", gap: "24px", fontSize: "10px", fontWeight: "bold", color: "#9CA3AF" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <TrendingUp className="w-3.5 h-3.5" style={{ color: "#EF4444" }} /> 상승 추세
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <TrendingDown className="w-3.5 h-3.5" style={{ color: "#3B82F6" }} /> 하락 추세
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Minus className="w-3.5 h-3.5" style={{ color: "#D1D5DB" }} /> 보합
            </div>
          </div>
          <div style={{ fontSize: "10px", fontWeight: "bold", color: "#9CA3AF" }}>
            결과는 진단용이며 최종 판단은 상담 기준을 따릅니다.
          </div>
        </div>
      </div>

      <div className="mt-8 print-mb-6">
        <OfficialFooter className="rounded-2xl border border-[#eadfce]" />
      </div>

      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .print-hidden { display: none !important; }
          .print-mb-6 { margin-bottom: 24px !important; }
          .print-p-0 { padding: 0 !important; }
          tr { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}
