"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import ReportComponent from "../diagnosis/report";
import { readReportSnapshot, REPORT_STORAGE_KEY, type ReportSnapshot } from "./snapshot";

export default function ReportPage() {
  const [snapshot, setSnapshot] = useState<ReportSnapshot | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    const load = () => {
      if (!active) return;
      let report: ReportSnapshot | null = null;
      try {
        const saved = sessionStorage.getItem(REPORT_STORAGE_KEY);
        const profile = sessionStorage.getItem("suprema_user_info");
        report = readReportSnapshot(saved ? JSON.parse(saved) : null, profile ? JSON.parse(profile) : null);
        if (saved && !report) sessionStorage.removeItem(REPORT_STORAGE_KEY);
      } catch {
        try { sessionStorage.removeItem(REPORT_STORAGE_KEY); } catch { /* Storage may be disabled by the browser. */ }
      }
      setSnapshot(report); setReady(true);
    };
    const onStorage = (event: StorageEvent) => { if (event.key === REPORT_STORAGE_KEY || event.key === "suprema_user_info" || event.key === null) load(); };
    Promise.resolve().then(load);
    window.addEventListener("storage", onStorage); window.addEventListener("pageshow", load);
    return () => { active = false; window.removeEventListener("storage", onStorage); window.removeEventListener("pageshow", load); };
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--suprima-cream)", display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 0", boxSizing: "border-box", fontFamily: "Pretendard, -apple-system, sans-serif" }}>
      <div id="standalone-report-wrapper" style={{ width: "100%", maxWidth: "1150px", backgroundColor: "white", borderRadius: "40px", border: "1px solid #ECE0D1", boxShadow: "0 30px 80px rgba(44, 26, 10, 0.05)", padding: "40px 48px", boxSizing: "border-box", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "8px", background: "linear-gradient(to right, var(--suprima-burgundy), var(--suprima-gold))", borderTopLeftRadius: "40px", borderTopRightRadius: "40px" }} />
        <div className="no-print" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "16px", alignItems: "center", borderBottom: "1px solid #ECE0D1", paddingBottom: "24px", marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <Link href="/diagnosis/step4" style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6B7280", fontSize: "12px", fontWeight: "bold", textDecoration: "none", backgroundColor: "#F9FAFB", padding: "8px 16px", borderRadius: "10px", border: "1px solid #E5E7EB" }}><ArrowLeft className="w-4 h-4" /> 진단 화면</Link>
            <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}><Image src="/suprema-logo.svg" alt="수프리마랩" width={140} height={38} priority style={{ objectFit: "contain" }} /></Link>
          </div>
          <span style={{ fontSize: "11px", fontWeight: 900, color: "#9CA3AF", letterSpacing: "0.2em", textTransform: "uppercase" }}>Diagnosis Report</span>
        </div>
        {!ready ? <p role="status">저장된 진단 결과를 확인하고 있습니다.</p> : snapshot ? <>
          <p style={{ marginBottom: "20px", color: "#6b7280", fontSize: "13px" }}>진단 시각: {new Date(snapshot.createdAt).toLocaleString("ko-KR")}</p>
          <ReportComponent studentInfo={snapshot.payload.studentInfo} results={snapshot.payload.results} />
        </> : <section style={{ padding: "40px 12px", textAlign: "center" }}>
          <h1 style={{ fontSize: "26px", fontWeight: 900, color: "#1a0f08" }}>아직 저장된 진단 결과가 없습니다</h1>
          <p style={{ margin: "16px auto 24px", maxWidth: "580px", color: "#6b7280", lineHeight: 1.8 }}>학생 정보를 확인하고 4단계에서 희망대학 진단을 실행하면 이곳에서 실제 결과를 확인할 수 있습니다. 학생 정보나 희망 전형을 변경했다면 진단을 다시 실행해 주세요.</p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px" }}>
            <Link href="/diagnosis/step1" className="rounded-full border border-[#8b1a1a] bg-white px-6 py-3 font-bold text-[#8b1a1a]">학생 정보 입력</Link>
            <Link href="/diagnosis/step4" className="rounded-full bg-[#8b1a1a] px-6 py-3 font-bold text-white">입시 진단 실행</Link>
          </div>
        </section>}
      </div>
    </div>
  );
}
