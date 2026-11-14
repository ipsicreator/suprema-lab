"use client";

import PersonalActivityHistory from "../../components/PersonalActivityHistory";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Check, Copy, ExternalLink, Sparkles, FileText, ArrowRight, Compass } from "lucide-react";

export type MandatoryBook = {
  title: string;
  author: string;
  publisher?: string;
  core_concept?: string;
};

export type TopicResult = {
  id: string;
  subject: string;
  keyword: string;
  mandatory_book?: MandatoryBook;
  topic_title: string;
  topic_direction: string;
  books: string[];
  papers: string[];
  data_sources: string[];
  expected_conclusion: string;
  setuk_sentence: string;
  tip?: string;
};

const fallbackKeywords: string[] = [];
const subjectOptions = ["국어", "영어", "수학", "사회탐구", "과학탐구", "정보(IT)"];
const initialBaseTopics: TopicResult[] = [];

function normalizeSubject(value: unknown) {
  const text = typeof value === "string" ? value : "";
  if (subjectOptions.includes(text)) return text;
  if (text.includes("사회")) return "사회탐구";
  if (text.includes("정보") || text.toLowerCase().includes("it")) return "정보(IT)";
  return "과학탐구";
}

function readUserContext() {
  try {
    const raw = sessionStorage.getItem("suprema_user_info");
    if (!raw) {
      return { keywords: fallbackKeywords, subject: "과학탐구", careerHint: "", email: "" };
    }
    const info = JSON.parse(raw);
    const analysisKeywords: string[] = Array.isArray(info?.studentAnalysis?.keyKeywords) ? info.studentAnalysis.keyKeywords.filter((item: unknown): item is string => typeof item === "string") : [];
    const keywords = analysisKeywords.length ? analysisKeywords.slice(0, 3) : fallbackKeywords;
    return {
      keywords,
      subject: normalizeSubject(info?.supportTrack),
      careerHint: typeof info?.careerHint === "string" ? info.careerHint : typeof info?.hopeDepartment === "string" ? info.hopeDepartment : "",
      email: typeof info?.email === "string" ? info.email : "",
    };
  } catch {
    return { keywords: fallbackKeywords, subject: "과학탐구", careerHint: "", email: "" };
  }
}

async function requestTopics(payload: { subject: string; keywords: string[]; careerHint: string; count: number }) {
  const response = await fetch("/api/diagnosis/exploration-topics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || "탐구 주제 생성 실패");
  return Array.isArray(data?.topics) ? (data.topics as TopicResult[]) : [];
}


export default function Step3() {
  const [baseTopics, setBaseTopics] = useState<TopicResult[]>(initialBaseTopics);
  const [customTopics, setCustomTopics] = useState<TopicResult[]>([]);
  const [subject, setSubject] = useState("과학탐구");
  const [customKeyword, setCustomKeyword] = useState("");
  const [careerHint, setCareerHint] = useState("");
  const [email, setEmail] = useState("");
  const [mailOpen, setMailOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [mailSending, setMailSending] = useState(false);

  const allTopics = useMemo(() => [...baseTopics, ...customTopics], [baseTopics, customTopics]);
  const canAdd = customTopics.length < 3;

  useEffect(() => {
    if (loading) return;
    try {
      sessionStorage.setItem(
        "diagnosis_step3_topics",
        JSON.stringify({
          subject,
          careerHint,
          topics: allTopics,
        }),
      );
    } catch {}
  }, [allTopics, careerHint, subject, loading]);

  useEffect(() => {
    let active = true;
    const context = readUserContext();
    const hasContext = context.keywords.length > 0 || Boolean(context.careerHint);
    const pending = hasContext ? requestTopics({ subject: context.subject, keywords: context.keywords.length ? context.keywords : [context.careerHint], careerHint: context.careerHint, count: 3 }) : Promise.resolve([]);
    pending.then((topics) => {
      if (!active) return;
      setSubject(context.subject);
      setCareerHint(context.careerHint);
      setEmail(context.email);
      setBaseTopics(topics.slice(0, 3));
      if (!hasContext) setStatus("학생정보에서 희망 진로나 분석 키워드를 입력한 뒤 주제를 생성해 주세요.");
    }).catch((error: unknown) => {
      if (active) setStatus(error instanceof Error ? error.message : "기본 주제 생성 실패");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function handleAddCustomTopic() {
    const keyword = customKeyword.trim();
    if (!keyword || !canAdd) return;
    setLoading(true);
    setStatus("");
    try {
      const topics = await requestTopics({
        subject,
        keywords: [keyword, careerHint].filter(Boolean),
        careerHint,
        count: 1,
      });
      if (topics[0]) {
        setCustomTopics((prev) => [...prev, { ...topics[0], id: `custom-${prev.length + 1}`, keyword }].slice(0, 3));
        setCustomKeyword("");
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "추가 주제 생성 실패");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMail() {
    const trimmed = email.trim();
    if (!trimmed) {
      setStatus("메일주소를 입력하세요.");
      return;
    }
    if (allTopics.length < 3) {
      setStatus("메일 발송은 최소 3개 주제 생성 후 가능합니다.");
      return;
    }

    setMailSending(true);
    setStatus("");
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          subject: "[나의 입시멘토] 탐구활동/독서/세특 결과",
          reportData: {
            service: "나의 입시멘토",
            type: "exploration-setuk",
            subject,
            careerHint,
            topics: allTopics,
          },
        }),
      });
      const result = await response.json().catch(() => ({}));
      setStatus(result?.message || (response.ok ? "메일 발송 완료" : "메일 발송 실패"));
    } catch {
      setStatus("메일 발송 중 오류가 발생했습니다.");
    } finally {
      setMailSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-[980px] rounded-[28px] border border-[#eadfce] bg-white p-6 text-left shadow-[0_18px_50px_rgba(44,26,10,0.04)]">
      <PersonalActivityHistory defaultKind="exploration"/>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-[#eadfce] bg-[#fffaf4] p-5 print:hidden">
        <div>
          <div className="text-xs font-black tracking-[0.18em] text-[#8b1a1a]">RESULT ACTION</div>
          <h2 className="mt-2 text-xl font-black text-[#1a0f08]">총 {allTopics.length}개 주제 결과</h2>
          <p className="mt-1 text-sm font-semibold text-[#6c6256]">
            기본 3개와 추가 최대 3개를 한 번에 인쇄/메일 발송합니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => window.print()} className="rounded-full bg-[#8b1a1a] px-5 py-3 text-sm font-black text-white">
            인쇄
          </button>
          <button onClick={() => setMailOpen((prev) => !prev)} className="rounded-full border border-[#8b1a1a] bg-white px-5 py-3 text-sm font-black text-[#8b1a1a]">
            메일 보내기
          </button>
        </div>
        {mailOpen ? (
          <div className="mt-4 flex w-full flex-wrap gap-2">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="메일주소 입력"
              className="min-w-[260px] flex-1 rounded-xl border border-[#d9c8b3] bg-white px-4 py-3 text-sm font-semibold text-slate-700"
            />
            <button onClick={handleSendMail} disabled={mailSending} className="rounded-xl bg-[#0f766e] px-5 py-3 text-sm font-black text-white disabled:opacity-60">
              {mailSending ? "발송 중" : "현재 3~6개 전체 발송"}
            </button>
          </div>
        ) : null}
      </div>

      {status ? <div className="mb-4 rounded-xl bg-[#8b1a1a]/10 px-4 py-3 text-sm font-bold text-[#8b1a1a] print:hidden">{status}</div> : null}

      <section className="mb-6">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <div className="text-xs font-black tracking-[0.16em] text-[#8b1a1a]">MANDATORY READING LINKAGE</div>
            <h3 className="mt-1 text-2xl font-black text-[#1f1720]">독서 필수 연계 맞춤형 탐구활동 & 세특 (3선)</h3>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              학종 및 고교학점제 평가 기준을 반영하여, 모든 탐구활동은 핵심 권장 도서 탐독을 출발점으로 설계됩니다.
            </p>
          </div>
          {loading ? <span className="text-sm font-bold text-[#8b1a1a]">생성 중</span> : null}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {baseTopics.map((topic, index) => <TopicCard key={topic.id} topic={topic} index={index + 1} />)}
        </div>
      </section>

      <section className="mb-6 rounded-[24px] border border-[#eadfce] bg-[#fffaf4] p-5 print:hidden">
        <div className="mb-4">
          <div className="text-xs font-black tracking-[0.16em] text-[#8b1a1a]">CUSTOM TOPICS</div>
          <h3 className="mt-1 text-xl font-black text-[#1f1720]">개인 주제 추가 검색</h3>
          <p className="mt-1 text-sm font-semibold text-[#6c6256]">
            과목과 주제를 설정해 검색하면 최대 3개까지 추가됩니다.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-[180px_1fr_1fr_auto]">
          <select value={subject} onChange={(event) => setSubject(event.target.value)} className="rounded-xl border border-[#d9c8b3] bg-white px-4 py-3 text-sm font-bold">
            {subjectOptions.map((item) => <option key={item}>{item}</option>)}
          </select>
          <input value={customKeyword} onChange={(event) => setCustomKeyword(event.target.value)} placeholder="추가 주제 입력" className="rounded-xl border border-[#d9c8b3] bg-white px-4 py-3 text-sm font-semibold" />
          <input value={careerHint} onChange={(event) => setCareerHint(event.target.value)} placeholder="진로/학과 힌트" className="rounded-xl border border-[#d9c8b3] bg-white px-4 py-3 text-sm font-semibold" />
          <button onClick={handleAddCustomTopic} disabled={!canAdd || loading} className="rounded-xl bg-[#8b1a1a] px-5 py-3 text-sm font-black text-white disabled:opacity-40">
            검색
          </button>
        </div>
        <div className="mt-3 text-xs font-bold text-slate-500">추가 {customTopics.length}/3 · 총 {allTopics.length}/6</div>
      </section>

      {customTopics.length ? (
        <section>
          <div className="mb-3 text-xs font-black tracking-[0.16em] text-[#8b1a1a]">ADDED TOPICS</div>
          <div className="grid gap-4 lg:grid-cols-3">
            {customTopics.map((topic, index) => <TopicCard key={topic.id} topic={topic} index={baseTopics.length + index + 1} />)}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function TopicCard({ topic, index }: { topic: TopicResult; index: number }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!topic.setuk_sentence) return;
    navigator.clipboard.writeText(topic.setuk_sentence).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  const primaryBook = topic.mandatory_book?.title || topic.books?.[0] || "추천 도서";

  return (
    <article className="break-inside-avoid flex flex-col justify-between rounded-[24px] border-2 border-[#e8d9c5] bg-[#fffdf8] p-5 shadow-sm transition-all hover:border-[#8b1a1a] hover:shadow-md">
      <div>
        {/* 상단 뱃지 & 과목 */}
        <div className="mb-3.5 flex items-center justify-between border-b border-[#f0e4d2] pb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-[#8b1a1a] px-2.5 py-0.5 text-[11px] font-black text-white">
              {index}번 탐구 설계
            </span>
            <span className="rounded-full bg-[#1e5a84]/10 px-2 py-0.5 text-[11px] font-black text-[#1e5a84]">
              독서 필수 연계
            </span>
          </div>
          <span className="text-xs font-bold text-slate-500">{topic.subject}</span>
        </div>

        {/* 1단계: 필수 연계 독서 (Reading Foundation - 탐구의 출발점) */}
        <div className="mb-4 rounded-[18px] border border-[#b9d5e6] bg-[#f2f8fc] p-3.5">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-[#1e5a84]">
              <BookOpen size={14} className="text-[#1e5a84]" />
              <span>STEP 1. 필수 연계 독서 · 핵심 요약</span>
            </div>
            <span className="rounded-md bg-[#1e5a84] px-1.5 py-0.5 text-[9px] font-black text-white">
              탐구 출발점
            </span>
          </div>
          <BookSummaryItem bookTitle={primaryBook} />
        </div>

        {/* 2단계: 도서 기반 심화 탐구활동 (Inquiry Deep Dive) */}
        <div className="mb-4 rounded-[18px] border border-[#f0dfcc] bg-[#fdfaf5] p-3.5">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-[#8b1a1a]">
              <Compass size={14} className="text-[#8b1a1a]" />
              <span>STEP 2. 도서 기반 심화 탐구활동</span>
            </div>
            <span className="text-[10px] font-bold text-slate-500">실험/분석</span>
          </div>

          <h4 className="mb-2 text-sm font-black leading-snug text-[#1f1720]">
            {topic.topic_title}
          </h4>
          <p className="rounded-xl border border-[#efe5d6] bg-white p-2.5 text-xs font-semibold leading-relaxed text-slate-700">
            {topic.topic_direction}
          </p>

          {(topic.papers?.length > 0 || topic.data_sources?.length > 0) && (
            <div className="mt-2.5 space-y-1.5 rounded-lg bg-[#faf6f0] p-2.5 text-xs">
              {topic.papers?.length > 0 && (
                <div className="flex items-start gap-1.5 text-slate-600">
                  <span className="shrink-0 font-bold text-[#8b1a1a]">논문:</span>
                  <span className="font-medium text-slate-700">{topic.papers.slice(0, 2).join(", ")}</span>
                </div>
              )}
              {topic.data_sources?.length > 0 && (
                <div className="flex items-start gap-1.5 text-slate-600">
                  <span className="shrink-0 font-bold text-[#8b1a1a]">자료:</span>
                  <span className="font-medium text-slate-700">{topic.data_sources.slice(0, 2).join(", ")}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3단계: 독서-탐구 일체형 세특 문장 (Output for School Record) */}
      <div className="rounded-[18px] border border-[#d7c2a5] bg-[#fff8ee] p-3.5 shadow-xs">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-black text-[#8b1a1a]">
            <Sparkles size={14} className="text-[#8b1a1a]" />
            <span>STEP 3. 독서 연계 세특 문장 (나이스 기재용)</span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-md border border-[#dfceb7] bg-white px-2.5 py-1 text-[11px] font-bold text-[#8b1a1a] shadow-xs transition-colors hover:bg-[#8b1a1a] hover:text-white"
            title="세특 문장 클립보드 복사"
          >
            {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
            <span>{copied ? "복사완료!" : "세특 복사"}</span>
          </button>
        </div>
        <p className="rounded-lg bg-white/80 p-2.5 text-xs font-bold leading-relaxed text-[#1f1720]">
          {topic.setuk_sentence}
        </p>
      </div>
    </article>
  );
}

function BookSummaryItem({ bookTitle }: { bookTitle: string }) {
  const [data, setData] = useState<{
    title: string;
    authors: string[];
    publisher: string;
    thumbnail: string;
    contents: string;
    summary?: string;
    inquiryPoints?: string[];
    setukRecommendation?: string;
    source?: string;
  } | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/books?query=${encodeURIComponent(bookTitle)}`)
      .then((res) => res.json())
      .then((json) => {
        if (!active) return;
        if (json?.documents?.[0]) {
          setData(json.documents[0]);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [bookTitle]);

  const title = data?.title || bookTitle;
  const authors = data?.authors?.length ? data.authors.join(", ") : "";
  const publisher = data?.publisher || "";
  const contents =
    data?.contents ||
    data?.summary ||
    `『${bookTitle}』는 해당 분야의 핵심 개념을 체계적으로 다룬 도서로, 학생부 탐구활동의 이론적 근거와 심화 배경 지식으로 유용하게 인용할 수 있습니다.`;

  return (
    <div className="rounded-xl border border-[#d2e4ee] bg-white p-2.5 shadow-2xs transition hover:border-[#1e5a84]/40">
      <div className="flex items-start gap-2.5">
        {data?.thumbnail ? (
          <img
            src={data.thumbnail}
            alt={title}
            className="h-14 w-10 shrink-0 rounded object-cover shadow-2xs"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-14 w-10 shrink-0 items-center justify-center rounded bg-[#e8f1f6] text-sm">
            📚
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-1">
            <h5 className="truncate text-xs font-black text-slate-800" title={title}>
              {title}
            </h5>
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="shrink-0 text-[10px] font-bold text-[#1e5a84] hover:underline"
            >
              {expanded ? "요약 닫기" : "핵심 요약 보기"}
            </button>
          </div>

          {(authors || publisher) && (
            <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-500">
              {authors} {publisher ? `· ${publisher}` : ""}
            </p>
          )}

          <p className={`mt-1 text-[11px] leading-relaxed text-slate-600 ${expanded ? "" : "line-clamp-2"}`}>
            {contents}
          </p>
        </div>
      </div>

      {expanded && (
        <div className="mt-2.5 space-y-2 rounded-lg border border-[#e0ecf3] bg-[#f7fafc] p-2.5 text-[11px] text-slate-700">
          <div>
            <strong className="block font-black text-[#1e5a84] mb-1">💡 탐구활동 연계 논점 & 가설:</strong>
            <ul className="space-y-1 pl-1">
              {(data?.inquiryPoints || [
                "핵심 개념을 고교 교과 단원과 결합하여 탐구 가설 설정 및 데이터 분석",
                "이론적 모델을 현대 사회 및 과학기술 이슈에 적용하여 심층 리포트 작성",
              ]).map((pt, pIdx) => (
                <li key={pIdx} className="leading-relaxed text-slate-600">• {pt}</li>
              ))}
            </ul>
          </div>
          {data?.setukRecommendation && (
            <div className="border-t border-[#e2edf4] pt-2">
              <strong className="block font-black text-[#8b1a1a] mb-0.5">✍️ 추천 독서 세특 기재 문장:</strong>
              <p className="leading-relaxed text-[#1a0f08] font-medium bg-white/80 p-1.5 rounded border border-[#e5dcd0]">
                {data.setukRecommendation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
