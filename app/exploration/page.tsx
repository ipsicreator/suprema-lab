/* eslint-disable react-hooks/set-state-in-effect, react/no-unescaped-entities, @typescript-eslint/no-explicit-any */
"use client";

import PersonalActivityHistory from "../components/PersonalActivityHistory";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, FileSearch, BookOpen, Target } from "lucide-react";
import FlowShell from "../components/FlowShell";
import RequireAuth from "../components/auth/RequireAuth";
import pb from "@/lib/pocketbase";

interface ExplorationRecord {
  id: string;
  subject: string;
  topic_title: string;
  topic_direction: string;
  books: string[];
  papers: string[];
  data_sources: string[];
  expected_conclusion: string;
  tip?: string;
  created: string;
}

type SourceMaterial = {
  title: string;
  path: string;
  subjects: string[];
};

function getAladinSearchUrl(title: string) {
  return `https://www.aladin.co.kr/search/wsearchresult.aspx?KeyWord=${encodeURIComponent(title)}&SearchTarget=Book`;
}

export default function ExplorationPage() {
  const [subject, setSubject] = useState("국어");
  const [grade, setGrade] = useState<"middle" | "high">("high");
  const [autoKeywords, setAutoKeywords] = useState<string[]>([]);
  const [studentSignals, setStudentSignals] = useState<string[]>([]);
  const [manualKeywords, setManualKeywords] = useState("");
  const [careerHint, setCareerHint] = useState("");
  const [targetGoal, setTargetGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ExplorationRecord[]>([]);
  const [history, setHistory] = useState<ExplorationRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<any>(null);
  const [sourceMaterials, setSourceMaterials] = useState<SourceMaterial[]>([]);

  const subjects = ["국어", "영어", "수학", "사회", "과학", "정보(IT)"];

  const loadHistoryAndKeywords = async () => {
    const user = pb.authStore.model;
    if (!user) return;

    try {
      const historyResp = await fetch(`/api/platform/topics?userId=${user.id}`);
      const historyData = await historyResp.json();
      if (Array.isArray(historyData)) setHistory(historyData);

      const keywordResp = await fetch(`/api/platform/keywords?userId=${user.id}`);
      const keywordData = await keywordResp.json();
      if (Array.isArray(keywordData?.keywords)) setAutoKeywords(keywordData.keywords);

      const diagnosisSession = await pb.collection("suprema_diagnosis_sessions").getFirstListItem(`student_name = "${user.name}"`, { sort: "-created" }).catch(() => null);
      if (diagnosisSession?.target_university) {
        setTargetGoal(`${diagnosisSession.target_university} ${diagnosisSession.target_department || ""}`.trim());
      }
    } catch (error) {
      console.error("Failed to fetch history or keywords:", error);
    }
  };

  const loadStudentSignals = () => {
    try {
      const saved = sessionStorage.getItem("suprema_user_info");
      if (!saved) return;
      const info = JSON.parse(saved);
      const subjectSignals = Array.isArray(info?.parsedSubjects)
        ? info.parsedSubjects.slice(0, 3).map((item: any) => item.subject).filter(Boolean)
        : [];
      const analysisSignals = Array.isArray(info?.studentAnalysis?.keyKeywords)
        ? info.studentAnalysis.keyKeywords.slice(0, 3)
        : [];
      setStudentSignals(Array.from(new Set([...subjectSignals, ...analysisSignals])).slice(0, 3));
      if (info?.careerHint) setCareerHint(info.careerHint);
    } catch {
      setStudentSignals([]);
    }
  };

  const loadSourceMaterials = async (selectedSubject: string) => {
    try {
      const resp = await fetch(`/api/platform/materials?subject=${encodeURIComponent(selectedSubject)}`);
      const data = await resp.json();
      if (Array.isArray(data?.materials)) {
        setSourceMaterials(data.materials);
      } else {
        setSourceMaterials([]);
      }
    } catch (error) {
      console.error("Failed to load source materials:", error);
      setSourceMaterials([]);
    }
  };

  useEffect(() => {
    loadHistoryAndKeywords();
    loadStudentSignals();
  }, []);

  useEffect(() => {
    loadSourceMaterials(subject);
  }, [subject]);

  const handleOpenGuide = async (univName: string) => {
    try {
      const resp = await fetch("/data/university_guides.json");
      const data = await resp.json();
      const key = Object.keys(data.universities).find((name) => name.includes(univName.substring(0, 3)));
      if (key) setSelectedGuide({ ...data.universities[key], name: key });
    } catch (error) {
      console.error("Failed to load guide:", error);
    }
  };

  const handleGenerate = async () => {
    const user = pb.authStore.model;
    if (!user) return;

    setLoading(true);
    try {
      const manualSignals = manualKeywords
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 3);

      const response = await fetch("/api/platform/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          subject,
          interests: [...studentSignals.slice(0, 3), ...manualSignals].slice(0, 6).join(","),
          studentSignals: studentSignals.slice(0, 3),
          careerHint,
          targetGoal,
          grade,
          count: 5,
        }),
      });

      const data = await response.json();
      if (Array.isArray(data?.topics)) {
        setResults(data.topics);
        loadHistoryAndKeywords();
      }
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const manualCount = useMemo(() => manualKeywords.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 3).length, [manualKeywords]);

  return (
    <FlowShell
      badge="AI 학생부/성적분석 · 탐구/독서 제안"
      title="탐구/독서 제안"
      subtitle="학생부 3개 신호와 직접 입력 3개를 결합해 탐구/독서 제안을 생성하고, 자료 파일과 API 결과를 함께 보여줍니다."
      steps={[
        { no: "01", title: "학생부/성적분석", description: "학생부에서 추출한 핵심 신호를 확인합니다.", icon: <Brain className="h-5 w-5" /> },
        { no: "02", title: "직접 입력", description: "개인이 직접 넣는 키워드와 진로 힌트를 받습니다.", icon: <FileSearch className="h-5 w-5" /> },
        { no: "03", title: "자료 추천", description: "과목별 자료 파일과 연결합니다.", icon: <BookOpen className="h-5 w-5" /> },
        { no: "04", title: "탐구/독서 제안", description: "주제, 개요, 책 제안으로 이어집니다.", icon: <Target className="h-5 w-5" /> },
      ]}
      footer={
        <div className="rounded-[28px] border border-[#0f172a] bg-[#0f1e3b] px-6 py-5 text-center text-white shadow-[0_18px_44px_rgba(15,23,42,0.18)]">
          <p className="text-lg font-extrabold">탐구 주제 발굴부터 보고서 생성까지 하나의 흐름으로 연결합니다.</p>
        </div>
      }
    >
      <div className="max-w-5xl mx-auto">
      <PersonalActivityHistory defaultKind="exploration"/>
        <header className="mb-10 text-center">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="v-badge">학생부/성적분석 → 탐구/독서 제안</div>
            <h1 className="text-5xl font-black tracking-tight">
              AI <span className="v-highlight">탐구/독서 제안</span>
            </h1>
          </div>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
            학생부 3개 신호와 직접 입력 3개를 결합해 탐구/독서 제안을 만들고, 자료 파일과 API 결과를 함께 보여줍니다.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Link href="/diagnosis/step1/evaluation" className="text-sm font-bold text-[var(--accent-color)] hover:underline">
              학생부/성적분석 결과 보기
            </Link>
            <span className="text-slate-400">·</span>
            <span className="text-sm text-slate-500">학생부 3개 + 직접 입력 3개로 추천</span>
          </div>
        </header>

        <RequireAuth>
          <div className="flex items-center justify-between mb-6 gap-3">
            <div className="text-sm text-[var(--text-secondary)]">학생부 신호 {studentSignals.length}/3 · 직접 입력 {manualCount}/3</div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-sm text-[var(--accent-color)] hover:underline"
            >
              {showHistory ? "추천 입력 화면 보기" : "최근 추천 이력 보기"}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {!showHistory ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="glass-card p-8 mb-12"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <label className="block text-sm font-medium">탐구 과목</label>
                    <div className="flex flex-wrap gap-2">
                      {subjects.map((item) => (
                        <button
                          key={item}
                          onClick={() => setSubject(item)}
                          className={`px-4 py-2 rounded-full text-sm transition-all ${subject === item ? "bg-[var(--accent-color)] text-white" : "bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--accent-color)]"}`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-medium">학급/학년</label>
                    <div className="flex gap-4">
                      {["high", "middle"].map((value) => (
                        <label key={value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="grade"
                            checked={grade === value}
                            onChange={() => setGrade(value as "middle" | "high")}
                            className="accent-[var(--accent-color)]"
                          />
                          <span className="text-sm">{value === "high" ? "고등학생" : "중학생"}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6 mb-8">
                  {studentSignals.length > 0 && (
                    <div className="p-4 bg-[var(--accent-color)] bg-opacity-5 rounded-lg border border-dashed border-[var(--accent-color)] border-opacity-30">
                      <label className="block text-xs font-bold text-[var(--accent-color)] mb-2 uppercase">학생부 신호 3개</label>
                      <div className="flex flex-wrap gap-2">
                        {studentSignals.map((signal) => (
                          <span key={signal} className="px-3 py-1 bg-white bg-opacity-10 rounded text-sm">#{signal}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {autoKeywords.length > 0 && (
                    <div className="p-4 bg-[var(--accent-color)] bg-opacity-5 rounded-lg border border-dashed border-[var(--accent-color)] border-opacity-30">
                      <label className="block text-xs font-bold text-[var(--accent-color)] mb-2 uppercase">자동 추출 키워드</label>
                      <div className="flex flex-wrap gap-2">
                        {autoKeywords.map((keyword) => (
                          <span key={keyword} className="px-3 py-1 bg-white bg-opacity-10 rounded text-sm">#{keyword}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {sourceMaterials.length > 0 && (
                    <div className="p-4 bg-[var(--accent-color)] bg-opacity-5 rounded-lg border border-dashed border-[var(--accent-color)] border-opacity-30">
                      <label className="block text-xs font-bold text-[var(--accent-color)] mb-3 uppercase">자료 파일 추천</label>
                      <div className="grid gap-3 md:grid-cols-2">
                        {sourceMaterials.map((material) => (
                          <div key={material.path} className="rounded-xl border border-[var(--card-border)] bg-white p-3">
                            <div className="font-semibold text-sm">{material.title}</div>
                            <div className="mt-1 text-xs text-[var(--text-secondary)]">{Array.isArray(material.subjects) ? material.subjects.join(" · ") : ""}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">목표 대학 / 학과</label>
                      <input
                        type="text"
                        value={targetGoal}
                        onChange={(e) => setTargetGoal(e.target.value)}
                        placeholder="예: 서울대 컴퓨터공학과"
                        className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-3 focus:outline-none focus:border-[var(--accent-color)]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">희망 진로 힌트</label>
                      <input
                        type="text"
                        value={careerHint}
                        onChange={(e) => setCareerHint(e.target.value)}
                        placeholder="예: 환경공학, 의예과"
                        className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-3 focus:outline-none focus:border-[var(--accent-color)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">직접 입력 키워드 3개</label>
                    <input
                      type="text"
                      value={manualKeywords}
                      onChange={(e) => setManualKeywords(e.target.value)}
                      placeholder="예: 환경 보호, 지역 사회, 데이터 분석"
                      className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-3 focus:outline-none focus:border-[var(--accent-color)]"
                    />
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full py-4 bg-[var(--accent-color)] hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50"
                >
                  {loading ? "AI가 탐구/독서 제안을 생성하는 중입니다..." : "탐구/독서 제안 생성하기"}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold mb-6">최근 추천 받은 주제</h2>
                {history.length > 0 ? history.map((item) => (
                  <TopicCard key={item.id} topic={item} onGuideClick={handleOpenGuide} />
                )) : (
                  <div className="glass-card p-12 text-center text-[var(--text-secondary)]">
                    아직 추천 이력이 없습니다.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {!showHistory && results.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[var(--accent-color)] flex items-center justify-center text-white text-sm">AI</span>
                AI가 제안한 탐구/독서 제안
              </h2>
              <div className="space-y-6">
                {results.map((topic, idx) => (
                  <TopicCard key={idx} topic={topic} onGuideClick={handleOpenGuide} />
                ))}
              </div>
            </motion.section>
          )}
        </RequireAuth>
      </div>

      <AnimatePresence>
        {selectedGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card max-w-2xl w-full p-8 relative overflow-hidden"
            >
              <button
                onClick={() => setSelectedGuide(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white bg-opacity-10 hover:bg-opacity-20"
              >
                ×
              </button>

              <div className="mb-6">
                <span className="text-[var(--accent-color)] font-bold text-sm tracking-widest uppercase">UNIVERSITY ADMISSION GUIDE</span>
                <h2 className="text-3xl font-bold mt-1">{selectedGuide.name}</h2>
              </div>

              <div className="space-y-6 text-left">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-secondary)] mb-2">핵심 포인트</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedGuide.focus.map((item: string) => (
                      <span key={item} className="px-3 py-1 bg-[var(--accent-color)] bg-opacity-10 text-[var(--accent-color)] rounded-md text-sm">#{item}</span>
                    ))}
                  </div>
                </div>

                <p className="text-[var(--text-primary)] leading-relaxed italic">"{selectedGuide.description}"</p>

                <div className="bg-white bg-opacity-5 p-6 rounded-xl border border-white border-opacity-10">
                  <h3 className="text-sm font-bold mb-4">공식 가이드 요약</h3>
                  <ul className="space-y-3">
                    {selectedGuide.official_guide_summary.map((item: string, index: number) => (
                      <li key={index} className="text-sm flex gap-3 text-[var(--text-secondary)]">
                        <span className="text-[var(--accent-color)]">•</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={selectedGuide.official_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full py-3 text-center bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg text-sm font-medium transition-all"
                >
                  공식 입학처 가이드 보기
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </FlowShell>
  );
}

function TopicCard({ topic, onGuideClick }: { topic: any; onGuideClick?: (univ: string) => void }) {
  const createdLabel = topic.created ? new Date(topic.created).toLocaleDateString() : "미등록";

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="glass-card p-8 border-l-4 border-l-[var(--accent-color)] text-left"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-md bg-[var(--accent-color)] bg-opacity-10 text-[var(--accent-color)] text-xs font-bold">
            {topic.subject}
          </span>
          {topic.tip && onGuideClick && (
            <button
              onClick={() => {
                const univ = topic.tip.match(/\[(.*?) /)?.[1];
                if (univ) onGuideClick(univ);
              }}
              className="px-3 py-1 rounded-md bg-white bg-opacity-10 text-xs hover:bg-opacity-20 transition-all border border-white border-opacity-10"
            >
              대학 가이드 확인
            </button>
          )}
        </div>
        <span className="text-[var(--text-secondary)] text-xs">{createdLabel}</span>
      </div>

      <h3 className="text-xl font-bold mb-4">{topic.topic_title}</h3>
      <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">{topic.topic_direction}</p>

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href={`/solution?topic=${encodeURIComponent(topic.topic_title || "")}&keywords=${encodeURIComponent(Array.isArray(topic.books) ? topic.books.slice(0, 3).join(",") : "")}`}
          className="px-3 py-2 rounded-md bg-[var(--accent-color)] text-white text-xs font-bold hover:opacity-90 transition-all"
        >
          보고서 작성
        </Link>
        <span className="px-3 py-2 rounded-md bg-white bg-opacity-5 text-xs text-[var(--text-secondary)] border border-white border-opacity-10">
          주제 → 개요 → 보고서 → 독서 제안
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h4 className="text-sm font-bold flex items-center gap-2">추천 자료</h4>
          <ul className="text-sm text-[var(--text-secondary)] space-y-2">
            {Array.isArray(topic.books) ? topic.books.map((book: string) => (
              <li key={book} className="flex items-start justify-between gap-3">
                <span>• {book}</span>
                <a
                  href={getAladinSearchUrl(book)}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 text-xs font-bold text-[var(--accent-color)] hover:underline"
                >
                  알라딘
                </a>
              </li>
            )) : <li>정보 없음</li>}
          </ul>
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-bold flex items-center gap-2">관련 논문/자료</h4>
          <ul className="text-sm text-[var(--text-secondary)] space-y-1">
            {Array.isArray(topic.papers) ? topic.papers.map((paper: string) => <li key={paper}>• {paper}</li>) : <li>정보 없음</li>}
          </ul>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {topic.tip && (
          <div className="p-4 bg-[var(--accent-color)] bg-opacity-10 rounded-lg border border-[var(--accent-color)] border-opacity-30 flex items-start gap-3">
            <span className="text-lg">💡</span>
            <div>
              <h4 className="text-xs font-bold text-[var(--accent-color)] mb-1 uppercase tracking-wider">University Target Guide</h4>
              <p className="text-sm text-[var(--text-primary)] font-medium">{topic.tip}</p>
            </div>
          </div>
        )}

        <div className="p-4 bg-white bg-opacity-5 rounded-lg border border-white border-opacity-10">
          <h4 className="text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Expected Conclusion</h4>
          <p className="text-sm italic">"{topic.expected_conclusion}"</p>
        </div>
      </div>
    </motion.div>
  );
}


