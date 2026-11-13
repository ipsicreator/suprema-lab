"use client";

import PersonalActivityHistory from "../components/PersonalActivityHistory";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import StepProgress from "../components/StepProgress";
import styles from "./page.module.css";
import { UserInfo } from "../components/UserInfoForm";
import Step1 from "./step1/Step1";
import Step2 from "./step2/Step2";
import Step3 from "./step3/Step3";
import Step4 from "./step4/Step4";

const steps = ["학생 정보 입력", "탐구 활동 입력", "AI 세특 추천"];

export default function SetukPage() {
  const [step, setStep] = useState(1);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [activity, setActivity] = useState("");
  const [isMajorRelated, setIsMajorRelated] = useState(true);
  
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (loading) return;
    setLoading(true);
    setStep(3);
    try {
      const res = await fetch("/api/solution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userKeywords: [subject, topic, isMajorRelated ? "전공 연계 심화" : "자기주도적 탐구"],
          department: userInfo?.hopeDepartment || "자율전공",
          studentRecord: activity
        })
      });

      if (!res.ok) {
        throw new Error("서버 에러가 발생했습니다.");
      }

      const data = await res.json();

      // 인위적 지연을 통해 프리미엄 로딩 애니메이션이 안정적으로 표출되도록 보장
      setTimeout(() => {
        if (data.specialRecord) {
          setResult(data.specialRecord);
        } else {
          setResult("AI가 분석을 완료했으나 문장을 생성하지 못했습니다. 내용을 구체적으로 작성해주세요.");
        }
        setStep(4);
        window.scrollTo({ top: 0, behavior: "smooth" });
        setLoading(false);
      }, 1500);
      
    } catch (err) {
      alert(`분석 중 오류가 발생했습니다: ${err instanceof Error ? err.message : "알 수 없는 오류"}`);
      setStep(2);
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <PersonalActivityHistory defaultKind="setuk"/>
      
      {/* Screen Frame Template Card - Centered, Symmetrical, and Highly Compact */}
      <div id="setuk-wrapper" style={{
        width: "100%",
        maxWidth: "1150px",
        backgroundColor: "white",
        borderRadius: "40px",
        border: "1px solid #ECE0D1",
        boxShadow: "0 30px 80px rgba(44, 26, 10, 0.05)",
        padding: "20px 36px",
        boxSizing: "border-box",
        position: "relative"
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "6px", backgroundColor: "var(--suprima-burgundy)" }} />
        
        {/* Frame Header with Brand Logo */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ECE0D1", paddingBottom: "12px", marginBottom: "16px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <Image 
              src="/suprema-logo.svg" 
              alt="대치 수프리마 Su-Prima 입시&코칭 센터" 
              width={160} 
              height={44} 
              priority
              style={{ objectFit: "contain" }}
            />
          </Link>
          <span style={{ fontSize: "10px", fontWeight: "bold", color: "#9CA3AF", letterSpacing: "0.15em" }}>PREMIUM SETUK MAKER</span>
        </div>

        {/* Multi-step progress bar integrated directly in the Frame */}
        {step <= 4 && step !== 3 && (
          <div style={{ marginBottom: "20px" }}>
            <StepProgress
              steps={steps}
              currentStep={step === 4 ? 3 : step}
            />
          </div>
        )}

        {/* Title & Description Section (Compact & Unified) */}
        {step < 3 && (
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <h1 className="heading-premium" style={{ fontSize: "2rem", fontWeight: 950, marginBottom: "8px", color: "#1a0f08", letterSpacing: "-0.05em" }}>
              탐구·세특 메이커
            </h1>
            <p style={{ color: "#5D4D3D", fontWeight: 700, fontSize: "0.95rem", maxWidth: "800px", margin: "0 auto", lineHeight: "1.5" }}>
              학생의 탐구 활동을 분석하여 입시 전문가 수준의 세부능력 및 특기사항 문장을 생성합니다.
            </p>
          </div>
        )}

        {/* Content Slot */}
        <div style={{ position: "relative" }}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
              >
                <Step1 
                  onNext={(info) => {
                    setUserInfo(info);
                    setStep(2);
                  }}
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }} 
              >
                <Step2
                  subject={subject}
                  setSubject={setSubject}
                  topic={topic}
                  setTopic={setTopic}
                  activity={activity}
                  setActivity={setActivity}
                  isMajorRelated={isMajorRelated}
                  setIsMajorRelated={setIsMajorRelated}
                  onPrev={() => setStep(1)}
                  onAnalyze={handleAnalyze}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
              >
                <Step3 />
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4" 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
              >
                <Step4
                  subject={subject}
                  topic={topic}
                  isMajorRelated={isMajorRelated}
                  result={result}
                  onReset={() => setStep(2)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
