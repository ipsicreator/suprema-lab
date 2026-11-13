"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { normalizeSavedUserInfo } from "@/app/components/UserInfoForm";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import FlowShell from "@/app/components/FlowShell";
import { diagnosisScreenText } from "@/app/diagnosis/content";
import { toStudentRecordReportData } from "@/lib/report-data";
import { buildStudentRecordMappingRows } from "@/lib/student-record-mapping";
import type { UserInfo } from "@/lib/user-info";
import { diagnosisSteps } from "../steps";

type SubjectRow = {
  subject: string;
  grade: number;
  term: string;
  rawScore: number | null;
  scoreAverage: number | null;
};

function subscribeToStoredInfo(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}
function readStoredInfo() { try { return sessionStorage.getItem("suprema_user_info"); } catch { return null; } }

export default function DiagnosisStep2Page() {
  const storedInfo = useSyncExternalStore(subscribeToStoredInfo, readStoredInfo, () => null);
  const info = useMemo<Partial<UserInfo> | null>(() => {
    try { return storedInfo ? normalizeSavedUserInfo(JSON.parse(storedInfo)) : null; } catch { return null; }
  }, [storedInfo]);
  const [keyword, setKeyword] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const emailValue = email ?? info?.email ?? "";
  const [mailOpen, setMailOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);


  const reportData = useMemo(() => toStudentRecordReportData(info), [info]);
  const subjects = useMemo<SubjectRow[]>(() => {
    return reportData.parsedSubjects.map((item) => ({
      subject: item.subject,
      grade: Number(item.grade ?? 3),
      term: item.year && item.semester ? `${item.year}-${item.semester}` : "학기 미입력",
      rawScore: typeof item.rawScore === "number" && Number.isFinite(item.rawScore) ? item.rawScore : null,
      scoreAverage: typeof item.scoreAverage === "number" && Number.isFinite(item.scoreAverage) ? item.scoreAverage : null,
    }));
  }, [reportData.parsedSubjects]);

  const trendData = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    for (const subject of subjects) {
      const row = map.get(subject.term) || { total: 0, count: 0 };
      row.total += subject.grade;
      row.count += 1;
      map.set(subject.term, row);
    }
    return [...map.entries()].map(([term, row]) => ({
      term,
      student: Number((row.total / row.count).toFixed(2)),
    }));
  }, [subjects]);

  const distributionData = subjects.flatMap((item) =>
    item.rawScore !== null && item.scoreAverage !== null
      ? [{ subject: item.subject, diff: Number((item.rawScore - item.scoreAverage).toFixed(1)) }]
      : [],
  );

  const keywords = reportData.studentAnalysis?.keyKeywords || [];
  const mappingRows = useMemo(
    () =>
      buildStudentRecordMappingRows({
        structured: reportData.studentRecord,
        studentName: reportData.studentName,
        schoolName: reportData.schoolName,
        grade: reportData.grade,
        parsedSubjectCount: reportData.parsedSubjects.length,
      }),
    [reportData],
  );

  const sourceSections = useMemo(
    () =>
      [
        reportData.studentRecord?.schoolInfo,
        reportData.studentRecord?.curriculum,
        reportData.studentRecord?.grades,
        reportData.studentRecord?.sepec,
        reportData.studentRecord?.creativeActivities,
        reportData.studentRecord?.behaviorSummary,
      ].filter((section): section is NonNullable<typeof section> => Boolean(section)),
    [reportData.studentRecord],
  );

  async function handleSendEmail() {
    const trimmed = emailValue.trim();
    if (!trimmed) {
      setStatus("메일주소를 입력하세요.");
      return;
    }
    setSending(true);
    setStatus("");
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          subject: "[나의 입시멘토] 학생부 분석 결과",
          reportData: {
            service: "나의 입시멘토",
            type: "student-record-analysis",
            data: reportData,
            subjects,
            keywords,
          },
        }),
      });
      const result = await response.json().catch(() => ({}));
      setStatus(result?.message || (response.ok ? "메일 발송 완료" : "메일 발송 실패"));
    } catch {
      setStatus("메일 발송 중 오류가 발생했습니다.");
    } finally {
      setSending(false);
    }
  }

  return (
    <FlowShell
      badge="PREMIUM DIAGNOSIS"
      title={diagnosisScreenText.step2.title}
      subtitle={diagnosisScreenText.step2.subtitle}
      currentStep={2}
      steps={diagnosisSteps}
    >
      <div className="mx-auto max-w-[1040px] overflow-hidden rounded-[28px] border border-[#eadfce] bg-[#eef2f7] text-left shadow-[0_18px_50px_rgba(44,26,10,0.04)]">
        <section className="bg-gradient-to-r from-[#345f7a] to-[#4b4278] p-6 text-white">
          <h2 className="text-2xl font-black">모두의 학생부종합전형 평가 가상 화면</h2>
          <p className="mt-2 text-sm font-bold opacity-90">학생부 분석, 요약·비교, 평가 피드백을 한 화면에서 연결합니다.</p>
          <div className="mt-5 rounded-2xl border border-white/20 bg-white/10 p-4 text-sm leading-7">
            본 화면은 학생부종합전형 준비를 위해 학생부 원문, 교과 추이, 핵심 키워드, 입학사정관 관점 피드백을 연결한 분석 화면입니다. 실제 대학 평가 결과가 아니라 준비 전략 수립용 시뮬레이션입니다.
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full bg-white/15 px-4 py-2">지원자: {reportData.schoolName || "학교 정보 없음"} · {reportData.grade || "학년 정보 없음"} · {reportData.studentName || "학생명 없음"}</span>
            <span className="rounded-full bg-white/15 px-4 py-2">체험판(로컬 저장 지원)</span>
          </div>
        </section>

        <section className="grid gap-4 p-4 lg:grid-cols-[260px_1fr_1fr]">
          <div className="col-span-full grid gap-3 md:grid-cols-3">
            <section className="rounded-2xl border border-[#d8cfbf] bg-white px-5 py-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#8b1a1a] bg-[#8b1a1a] text-sm font-black text-white">
                  1
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">학생부 원문</h3>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                    원문 확인, 키워드 검색, 모집단위 기준 선택을 진행합니다.
                  </p>
                </div>
              </div>
            </section>
            <section className="rounded-2xl border border-[#d8cfbf] bg-white px-5 py-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#8b1a1a] bg-[#8b1a1a] text-sm font-black text-white">
                  2
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">요약·비교 분석</h3>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                    학기별 추이, 성취도, 핵심 키워드를 중앙 영역에서 확인합니다.
                  </p>
                </div>
              </div>
            </section>
            <section className="rounded-2xl border border-[#d8cfbf] bg-white px-5 py-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#8b1a1a] bg-[#8b1a1a] text-sm font-black text-white">
                  3
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">비교·평가</h3>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                    유사집단 비교, 분포, 평가 메모를 우측 영역에서 확인합니다.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">1분면 · 생활기록부 원문</h3>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">검색, 모집단위, 학생 선택으로 원문과 분석을 연결합니다.</p>
            </div>
            <Panel title="키워드 검색" action="세특·창체·행발 하이라이트">
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="예: 내진 / 모델링 / 전공"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold"
              />
              <p className="mt-3 text-xs font-semibold text-slate-500">입력하면 좌측 원문 카드에 강조가 적용됩니다.</p>
            </Panel>
            <Panel title="모집단위(기준 전환)" action="핵심과목·평가축 자동">
              <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold">
                <option>{reportData.careerHint || "희망 진로/학과 정보 없음"}</option>
              </select>
              <button className="mt-3 rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-900 shadow-sm">불러오기</button>
            </Panel>
            <Panel title="학생부 매핑">
              <ul className="space-y-2 text-sm font-semibold leading-6 text-slate-700">
                {mappingRows.map((row) => (
                  <li key={row.source}>
                    <span className="font-black text-slate-900">{row.source}</span>
                    <br />
                    <span className="text-slate-500">{row.target}</span>
                    <br />
                    <HighlightText text={keyword.trim() && row.value.includes(keyword.trim()) ? row.value.replace(keyword.trim(), `[[${keyword.trim()}]]`) : row.value} />
                  </li>
                ))}
              </ul>
            </Panel>
            {sourceSections.length ? sourceSections.map((section) => (
              <Panel key={section.title} title={section.title}>
                <ul className="space-y-2 text-sm font-semibold leading-6 text-slate-700">
                  {section.items.map((item) => (
                    <li key={item}>· <HighlightText text={keyword.trim() && item.includes(keyword.trim()) ? item.replace(keyword.trim(), `[[${keyword.trim()}]]`) : item} /></li>
                  ))}
                </ul>
              </Panel>
            )) : (
              <Panel title="학생부 원문">
                <p className="text-sm font-semibold leading-6 text-slate-500">학생부 PDF 업로드 및 분석 후 원문 섹션이 표시됩니다.</p>
              </Panel>
            )}
          </aside>

          <main className="space-y-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">2분면 · 요약·비교 분석</h3>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">학기/과목/키워드/핵심과목/역량 평가를 중앙에서 연결합니다.</p>
            </div>
            <ChartPanel title="학기별 등급추이" badge="성장형">
              <ResponsiveContainer width="100%" height={210}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="term" />
                  <YAxis domain={[1, 9]} reversed />
                  <Tooltip />
                  <Line type="monotone" dataKey="student" name="학생 평균" stroke="#38a3e8" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
              {!trendData.length ? <EmptyChartMessage text="교과 성적 데이터가 없습니다." /> : null}
            </ChartPanel>
            <ChartPanel title="역량 정량 평가" badge="평가 자료 필요">
              <EmptyChartMessage text="검증된 역량 점수 자료가 없습니다. 학생부 분석 의견과 핵심 키워드를 참고해 주세요." />
            </ChartPanel>
            <Panel title="핵심 키워드">
              <div className="flex flex-wrap gap-2">
                {keywords.length ? keywords.map((item) => (
                  <span key={item} className="rounded-full bg-[#8b1a1a]/10 px-3 py-1 text-xs font-black text-[#8b1a1a]">#{item}</span>
                )) : <span className="text-sm font-semibold text-slate-500">학생부 분석 후 핵심 키워드가 표시됩니다.</span>}
              </div>
            </Panel>
          </main>

          <aside className="space-y-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">3분면 · 비교·분포·평가</h3>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">입력 성적의 추이와 실제 비교 자료, 평가 메모를 표시합니다.</p>
            </div>
            <ChartPanel title="전체 과목 평균 추이" badge="입력 성적 기준">
              <ResponsiveContainer width="100%" height={210}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="term" />
                  <YAxis domain={[1, 9]} reversed />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="student" name="학생 평균" stroke="#38a3e8" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
              {!trendData.length ? <EmptyChartMessage text="비교 가능한 과목 조합 데이터가 없습니다." /> : null}
            </ChartPanel>
            <ChartPanel title="과목별 원점수·평균 차이" badge="실제 비교 자료 기준">
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={distributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="diff" name="원점수-평균" fill="#7dd3fc" stroke="#38a3e8" />
                </BarChart>
              </ResponsiveContainer>
              {!distributionData.length ? <EmptyChartMessage text="원점수와 평균 점수가 추출된 과목이 없습니다." /> : null}
            </ChartPanel>
            <Panel title="입학사정관 평가 메모">
              <p className="text-sm font-semibold leading-7 text-slate-700">
                {reportData.studentAnalysis?.comprehensiveOpinion ||
                  "전공 관련 과목의 흐름은 안정적이며, 학생부 키워드가 진로 희망과 연결됩니다. 탐구 결과물과 세특 서술의 깊이를 강화하면 평가 설득력이 높아집니다."}
              </p>
            </Panel>
          </aside>
        </section>

        <section className="border-t border-slate-200 bg-white p-4 print:hidden">
          {status ? <div className="mb-3 rounded-xl bg-[#8b1a1a]/10 px-4 py-3 text-sm font-bold text-[#8b1a1a]">{status}</div> : null}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => window.print()} className="rounded-full bg-[#8b1a1a] px-5 py-3 text-sm font-black text-white">인쇄</button>
              <button onClick={() => setMailOpen((prev) => !prev)} className="rounded-full border border-[#8b1a1a] bg-white px-5 py-3 text-sm font-black text-[#8b1a1a]">메일 보내기</button>
            </div>
            <div className="flex gap-3">
              <Link href="/diagnosis/step1" className="rounded-full border border-[#d9c8b3] bg-[#fff8f0] px-6 py-4 text-sm font-black text-[#3f3f46]">이전 단계</Link>
              <Link href="/diagnosis/step3" className="rounded-full bg-[#9f2420] px-6 py-4 text-sm font-black text-white">다음 단계로 이동</Link>
            </div>
          </div>
          {mailOpen ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <input
                type="email"
                value={emailValue}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="메일주소 입력"
                className="min-w-[260px] flex-1 rounded-xl border border-[#d9c8b3] bg-white px-4 py-3 text-sm font-semibold text-slate-700"
              />
              <button onClick={handleSendEmail} disabled={sending} className="rounded-xl bg-[#0f766e] px-5 py-3 text-sm font-black text-white disabled:opacity-60">
                {sending ? "발송 중" : "학생부 분석 전체 발송"}
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </FlowShell>
  );
}

function Panel({ title, action, children }: { title: string; action?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="text-sm font-black text-slate-900">{title}</h4>
        {action ? <span className="text-xs font-black text-slate-400">{action}</span> : null}
      </div>
      {children}
    </section>
  );
}

function ChartPanel({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="text-sm font-black text-slate-900">{title}</h4>
        {badge ? <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-600">{badge}</span> : null}
      </div>
      {children}
    </section>
  );
}

function EmptyChartMessage({ text }: { text: string }) {
  return (
    <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-500">
      {text}
    </div>
  );
}

function HighlightText({ text }: { text: string }) {
  const parts = text.split(/(\[\[.*?\]\])/g);
  return (
    <>
      {parts.map((part) =>
        part.startsWith("[[") && part.endsWith("]]") ? (
          <mark key={part} className="rounded bg-yellow-200 px-1 text-slate-900">{part.slice(2, -2)}</mark>
        ) : (
          <span key={part}>{part}</span>
        ),
      )}
    </>
  );
}
