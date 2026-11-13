"use client";

import PersonalActivityHistory from "../components/PersonalActivityHistory";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, FileSearch, User, Brain, ArrowRight, Loader2, BookOpen, Quote, X, Plus, Book } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function getAladinSearchUrl(title: string) {
  return `https://www.aladin.co.kr/search/wsearchresult.aspx?KeyWord=${encodeURIComponent(title)}&SearchTarget=Book`;
}

type ReportResult = {
  proposedTopic?: string;
  extractedKeywords?: string[];
  explorationPath?: string;
  recommendedBooks?: Array<{
    title: string;
    author?: string;
    reason?: string;
  }>;
  specialRecord?: string;
};

export default function SolutionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617]" />}>
      <SolutionContent />
    </Suspense>
  );
}

function SolutionContent() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get("topic") || "";
  const initialKeywords = (searchParams.get("keywords") || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
  const initialRecord = searchParams.get("studentRecord") || "";

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [keywordInput, setKeywordInput] = useState("");
  const [userKeywords, setUserKeywords] = useState<string[]>(initialTopic ? [initialTopic, ...initialKeywords].slice(0, 6) : initialKeywords);
  const [studentRecord, setStudentRecord] = useState(initialRecord);
  const [department, setDepartment] = useState("사회과학계열");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<ReportResult | null>(null);

  const addKeyword = () => {
    const keyword = keywordInput.trim();
    if (keyword && !userKeywords.includes(keyword)) {
      setUserKeywords([...userKeywords, keyword]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (tag: string) => {
    setUserKeywords(userKeywords.filter((item) => item !== tag));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setStep(2);

    try {
      const response = await fetch("/api/solution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userKeywords, department, studentRecord }),
      });
      const data = await response.json();
      setResult(data);
      setTimeout(() => setStep(3), 1200);
    } catch (error) {
      console.error("AI Error:", error);
      setStep(1);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 pt-20 px-6 pb-20">
      <PersonalActivityHistory defaultKind="reading"/>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-black mb-4 tracking-tighter">
              AI <span className="text-indigo-500">탐구 · 세특 · 보고서</span> 흐름
            </h1>
            <p className="text-slate-400">
              탐구 주제 선택 → 개요 → 보고서 → 책 제안까지 한 번에 연결합니다.
            </p>
          </motion.div>
        </div>

        <div className="glass rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-8 md:p-12 space-y-10">
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-indigo-400 font-bold">
                      <User className="w-5 h-5" /> 키워드 입력
                    </div>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={keywordInput}
                          onChange={(e) => setKeywordInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addKeyword()}
                          placeholder="탐구 키워드 입력 후 Enter"
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                        />
                        <button onClick={addKeyword} className="p-3 bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-colors">
                          <Plus className="w-6 h-6" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 min-h-[40px]">
                        {userKeywords.map((item) => (
                          <span key={item} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg border border-indigo-500/30 text-xs font-bold">
                            {item}
                            <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => removeKeyword(item)} />
                          </span>
                        ))}
                      </div>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none text-slate-300"
                      >
                        <option value="사회과학계열">사회과학계열</option>
                        <option value="인문계열">인문계열</option>
                        <option value="공학계열">공학계열</option>
                        <option value="자연계열">자연계열</option>
                        <option value="의학/보건계열">의학/보건계열</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-emerald-400 font-bold">
                      <FileSearch className="w-5 h-5" /> 학생부 기록
                    </div>
                    <textarea
                      value={studentRecord}
                      onChange={(e) => setStudentRecord(e.target.value)}
                      placeholder="학생부 핵심 내용, 활동, 성취를 입력하세요"
                      className="w-full h-44 bg-white/5 border border-white/10 rounded-xl p-5 outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm leading-relaxed"
                    />
                  </div>
                </div>

                <button
                  disabled={userKeywords.length < 2 || !studentRecord || isGenerating}
                  onClick={handleGenerate}
                  className="w-full py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 font-black text-xl flex items-center justify-center gap-3 shadow-[0_10px_40px_rgba(79,70,229,0.3)]"
                >
                  {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <>보고서 생성 <ArrowRight className="w-6 h-6" /></>}
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-20 text-center space-y-8">
                <Brain className="w-24 h-24 text-indigo-400 mx-auto animate-pulse" />
                <h3 className="text-2xl font-bold">탐구 흐름과 보고서를 생성하는 중입니다...</h3>
                <div className="max-w-md mx-auto bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full animate-progress" />
                </div>
              </motion.div>
            )}

            {step === 3 && result && (
              <motion.div key="s3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 md:p-12 space-y-12">
                <div className="flex justify-between items-center border-b border-white/5 pb-6">
                  <h2 className="text-3xl font-black">탐구 보고서</h2>
                  <button onClick={() => setStep(1)} className="text-slate-500 hover:text-white transition-colors text-sm">
                    다시 만들기
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-indigo-400 font-bold uppercase tracking-widest text-xs">
                    <BookOpen className="w-4 h-4" /> 01. 탐구 개요
                  </div>
                  <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
                    <h4 className="text-2xl font-black text-white">{result.proposedTopic || result.extractedKeywords?.join(" · ") || "추천 주제"}</h4>
                    <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">{result.explorationPath || "탐구 방향 설명이 없습니다."}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-sky-400 font-bold uppercase tracking-widest text-xs">
                    <Book className="w-4 h-4" /> 02. 독서 제안
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {result.recommendedBooks?.map((book, index) => (
                      <div key={index} className="p-6 rounded-2xl bg-sky-500/5 border border-sky-500/10 hover:bg-sky-500/10 transition-all">
                        <p className="text-sky-300 font-black mb-1">{book.title}</p>
                        <p className="text-slate-500 text-xs mb-3">{book.author || "저자 정보 없음"}</p>
                        <p className="text-slate-300 text-xs leading-relaxed">{book.reason || "추천 이유 없음"}</p>
                        <a
                          href={getAladinSearchUrl(book.title)}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 inline-flex text-xs font-bold text-sky-300 hover:text-sky-200 underline"
                        >
                          알라딘에서 보기
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-emerald-400 font-bold uppercase tracking-widest text-xs">
                    <Sparkles className="w-4 h-4" /> 03. 보고서 초안
                  </div>
                  <div className="p-8 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 relative">
                    <Quote className="absolute top-6 right-8 w-12 h-12 text-indigo-500/10" />
                    <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                      {result.specialRecord || "보고서 초안이 없습니다."}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

