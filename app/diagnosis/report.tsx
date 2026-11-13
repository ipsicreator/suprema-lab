"use client";

import Image from "next/image";
import { reportBadgeStyle } from "./reportPresentation";
import Link from "next/link";
import { Minus, Printer, TrendingDown, TrendingUp } from "lucide-react";

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

  return (
    <div style={{ color: "#111827", padding: 0 }} className="print-p-0">
      <div className="print-hidden" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "20px" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center" }}>
          <Image src="/suprema-logo.svg" alt="수프리마" width={160} height={48} priority style={{ width: "160px", height: "auto" }} />
        </Link>
        <span style={{ fontSize: "11px", fontWeight: 900, color: "#9CA3AF", letterSpacing: "0.2em" }}>SUPREMA REPORT</span>
      </div>

      <div style={{ width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px" }} className="print-mb-6">
          <div>
            <div style={{ display: "inline-block", padding: "6px 14px", backgroundColor: "rgba(139, 26, 26, 0.05)", color: "var(--suprima-burgundy)", borderRadius: "9999px", fontSize: "10px", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "12px" }} className="print-hidden">
              Analysis Report
            </div>
            <h1 className="heading-premium" style={{ fontSize: "2rem", fontWeight: 950, letterSpacing: "-0.05em", marginBottom: "6px", color: "#1a0f08" }}>
              입시 위치 진단 보고서
            </h1>
            <p style={{ color: "#6B7280", fontSize: "12px", fontWeight: 600, margin: 0 }}>
              선택한 대학·전형의 확인 가능한 입결과 입력 성적을 비교한 보고서입니다.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px" }} className="print-hidden">
            {onBack && (
              <button onClick={onBack} style={{ padding: "12px 24px", backgroundColor: "white", border: "1px solid #D1D5DB", color: "#4B5563", borderRadius: "14px", fontWeight: 800, fontSize: "13px", cursor: "pointer" }}>
                돌아가기
              </button>
            )}
            <button onClick={handlePrint} className="btn-premium" style={{ padding: "12px 24px", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <Printer className="w-4 h-4" /> PDF 출력
            </button>
          </div>
        </div>

        <div style={{ backgroundColor: "white", padding: "20px 32px", borderRadius: "20px", border: "1px solid #ECE0D1", boxShadow: "0 10px 30px rgba(44, 26, 10, 0.03)", marginBottom: "24px", display: "flex", flexWrap: "wrap", gap: "36px", alignItems: "center" }}>
          <div>
            <span style={{ color: "#9CA3AF", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "6px" }}>학생명</span>
            <span style={{ fontSize: "1.4rem", fontWeight: 950, color: "#111827" }}>{studentInfo.name}</span>
          </div>
          <div style={{ width: "1px", height: "30px", backgroundColor: "#ECE0D1" }} className="print-hidden" />
          <div>
            <span style={{ color: "#9CA3AF", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "4px" }}>평균 점수</span>
            <span style={{ fontSize: "1.4rem", fontWeight: 950, color: "var(--suprima-burgundy)" }}>{studentInfo.score}</span>
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
