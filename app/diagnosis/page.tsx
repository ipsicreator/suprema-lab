"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Search, Activity } from "lucide-react";
import { EvaluationSimulation, PositionDiagnosis } from "../components/admission";

export default function DiagnosisPage() {
  const [activeTab, setActiveTab] = useState<"search" | "simulation">("search");

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", padding: "2rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginBottom: "2rem" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center" }}>
            <Image
              src="/suprema-logo.svg"
              alt="수프리마"
              width={160}
              height={48}
              priority
              style={{ width: "160px", height: "auto" }}
            />
          </Link>
          <span style={{ fontSize: "12px", fontWeight: 900, color: "#94a3b8", letterSpacing: "0.18em" }}>
            SUPREMA DIAGNOSIS
          </span>
        </div>

        <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>입시위치 진단</h1>
        <p style={{ color: "#64748b", marginBottom: "2rem" }}>
          학생부/성적분석 결과를 바탕으로 입시 위치를 진단하고 학년/진로/지원 가능성까지 연결합니다.
        </p>

        <div style={{ display: "flex", gap: "1rem", borderBottom: "2px solid #e2e8f0", paddingBottom: "1rem" }}>
          <button
            onClick={() => setActiveTab("search")}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              backgroundColor: activeTab === "search" ? "#3b82f6" : "#f1f5f9",
              color: activeTab === "search" ? "#fff" : "#475569",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "all 0.2s",
            }}
          >
            <Search size={18} /> 입시위치 진단
          </button>

          <button
            onClick={() => setActiveTab("simulation")}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              backgroundColor: activeTab === "simulation" ? "#4f46e5" : "#f1f5f9",
              color: activeTab === "simulation" ? "#fff" : "#475569",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "all 0.2s",
            }}
          >
            <Activity size={18} /> 입학전략 시뮬레이션
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {activeTab === "search" ? <PositionDiagnosis /> : <EvaluationSimulation />}
      </div>
    </div>
  );
}
