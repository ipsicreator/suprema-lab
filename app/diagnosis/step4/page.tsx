"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import FlowShell from "@/app/components/FlowShell";
import { diagnosisScreenText } from "@/app/diagnosis/content";
import { diagnosisSteps } from "../steps";
import { makeReportSnapshot, readReportSnapshot, REPORT_STORAGE_KEY } from "@/app/report/snapshot";
import { isPublishedChoice, judgmentFromLevel, targetOptions, profileFromValue, type Step4Profile, type DiagnosisJudgment, type PublishedAdmission, type TargetChoice } from "./targetLogic";

type UniversityTarget = TargetChoice & { id: string; judgment: DiagnosisJudgment; reason: string };
type Step3Topic = { id: string; topic_title: string; setuk_sentence: string };
type Step3Bundle = { topics?: Step3Topic[] };
type Profile = Step4Profile;
const blankTarget = (id: string): UniversityTarget => ({ id, university: "", department: "", trackType: "", admissionName: "", judgment: "미진단", reason: "" });
const judgmentStyle: Record<DiagnosisJudgment, string> = {
  미진단: "bg-slate-50 text-slate-600 border-slate-200", "매우 안정": "bg-sky-50 text-sky-700 border-sky-200",
  안정: "bg-emerald-50 text-emerald-700 border-emerald-200", 적정: "bg-teal-50 text-teal-700 border-teal-200",
  도전: "bg-amber-50 text-amber-700 border-amber-200", "상향/위험": "bg-rose-50 text-rose-700 border-rose-200",
  "판단 보류": "bg-slate-50 text-slate-600 border-slate-200",
};

export default function DiagnosisStep4Page() {
  const [targets, setTargets] = useState<UniversityTarget[]>([blankTarget("target-1")]);
  const [openId, setOpenId] = useState("target-1");
  const [rows, setRows] = useState<PublishedAdmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [step3Bundle, setStep3Bundle] = useState<Step3Bundle | null>(null);
  const [email, setEmail] = useState("");
  const [mailOpen, setMailOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [diagnosing, setDiagnosing] = useState(false);
  const request = useRef<AbortController | null>(null);
  const sequence = useRef(0);
  const nextId = useRef(2);
  const profileSignature = useRef<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/api/admissions", { cache: "no-store", signal: controller.signal });
        const data = await response.json();
        if (!response.ok || !data.success || !Array.isArray(data.rows)) throw new Error(data.error || "입시 데이터를 불러오지 못했습니다.");
        if (!controller.signal.aborted) setRows(data.rows);
      } catch (error) {
        if (!controller.signal.aborted) setDataError(error instanceof Error ? error.message : "입시 데이터 조회 오류");
      } finally {
        if (!controller.signal.aborted) {
          try {
            const saved = sessionStorage.getItem("suprema_user_info");
            const rawProfile: unknown = saved ? JSON.parse(saved) : null;
            profileSignature.current = JSON.stringify(rawProfile);
            try {
              const savedReport = sessionStorage.getItem(REPORT_STORAGE_KEY);
              if (savedReport && !readReportSnapshot(JSON.parse(savedReport), rawProfile)) sessionStorage.removeItem(REPORT_STORAGE_KEY);
            } catch { try { sessionStorage.removeItem(REPORT_STORAGE_KEY); } catch { /* Browser storage can be unavailable. */ } }
            const info = profileFromValue(rawProfile);
            if (info && typeof info === "object" && !Array.isArray(info)) {
              setProfile(info); setEmail(typeof info.email === "string" ? info.email : "");
            }
            const topics = sessionStorage.getItem("diagnosis_step3_topics");
            const bundle = topics ? JSON.parse(topics) as Step3Bundle : null;
            if (bundle && Array.isArray(bundle.topics)) setStep3Bundle({ topics: bundle.topics.filter(topic => topic && typeof topic === "object" && typeof topic.topic_title === "string" && typeof topic.setuk_sentence === "string").map((topic, index) => ({ id: typeof topic.id === "string" ? topic.id : String(index), topic_title: topic.topic_title, setuk_sentence: topic.setuk_sentence })) });
          } catch { setStatus("저장된 학생 정보를 읽지 못했습니다. 1단계에서 정보를 다시 확인해 주세요."); }
          setLoading(false);
        }
      }
    }
    void load();
    return () => { controller.abort(); request.current?.abort(); sequence.current += 1; };
  }, []);

  const grade = Number(profile?.studentIndex);
  const hasGrade = Number.isFinite(grade) && grade >= 1 && grade <= (profile?.gradingSystem === "5-level" ? 5 : 9);
  const complete = targets.length > 0 && targets.every(target => target.judgment !== "미진단" && Boolean(target.reason));
  const canDiagnose = !loading && !dataError && rows.length > 0 && hasGrade && targets.every(target => isPublishedChoice(rows, target));
  const summary = useMemo(() => {
    const diagnosed = targets.filter(target => target.judgment !== "미진단");
    if (!diagnosed.length) return "희망대학과 전형을 선택한 뒤 진단을 실행해 주세요.";
    const counts = diagnosed.reduce<Record<string, number>>((acc, target) => { acc[target.judgment] = (acc[target.judgment] || 0) + 1; return acc; }, {});
    return Object.entries(counts).map(([label, count]) => `${label} ${count}`).join(" · ");
  }, [targets]);

  function clearStoredReport() {
    try { sessionStorage.removeItem(REPORT_STORAGE_KEY); } catch { /* The current page can still show a completed result if browser storage is unavailable. */ }
  }
  function invalidate() {
    request.current?.abort(); sequence.current += 1; setDiagnosing(false); setStatus(""); clearStoredReport();
  }
  function checkProfileUnchanged() {
    try {
      const saved = sessionStorage.getItem("suprema_user_info");
      const raw: unknown = saved ? JSON.parse(saved) : null;
      const signature = JSON.stringify(raw);
      if (signature === profileSignature.current) return true;
      invalidate(); profileSignature.current = signature; setProfile(profileFromValue(raw));
      setTargets(previous => previous.map(target => ({ ...target, judgment: "미진단", reason: "" })));
      setStatus("학생 정보가 변경되었습니다. 새 정보로 진단을 다시 실행해 주세요.");
      return false;
    } catch {
      invalidate(); setTargets(previous => previous.map(target => ({ ...target, judgment: "미진단", reason: "" })));
      setStatus("저장된 학생 정보를 읽지 못했습니다. 1단계에서 정보를 확인해 주세요.");
      return false;
    }
  }
  function updateTarget(id: string, field: keyof TargetChoice, value: string) {
    invalidate();
    setTargets(previous => previous.map(target => {
      const clean = { ...target, judgment: "미진단" as const, reason: "" };
      if (target.id !== id) return clean;
      if (field === "university") return { ...clean, university: value, department: "", trackType: "", admissionName: "" };
      if (field === "department") return { ...clean, department: value, trackType: "", admissionName: "" };
      if (field === "trackType") return { ...clean, trackType: value, admissionName: "" };
      return { ...clean, admissionName: value };
    }));
  }
  function addTarget() {
    if (targets.length >= 6) return;
    invalidate(); const next = blankTarget(`target-${nextId.current++}`);
    setTargets(previous => [...previous.map(target => ({ ...target, judgment: "미진단" as const, reason: "" })), next]); setOpenId(next.id);
  }
  function removeTarget(id: string) {
    invalidate(); setTargets(previous => previous.filter(target => target.id !== id).map(target => ({ ...target, judgment: "미진단", reason: "" })));
  }
  async function diagnose() {
    if (!canDiagnose || diagnosing || !checkProfileUnchanged()) return;
    invalidate(); const current = sequence.current; const controller = new AbortController(); request.current = controller;
    const input = targets.map(target => ({ ...target }));
    setDiagnosing(true); setTargets(previous => previous.map(target => ({ ...target, judgment: "미진단", reason: "" })));
    try {
      const response = await fetch("/api/diagnosis", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal,
        body: JSON.stringify({ studentIndex: grade, gradingSystem: profile?.gradingSystem || "9-level", choices: input.map(target => ({ university: target.university, department: target.department, admission_type: target.trackType, track_name: target.admissionName })) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "진단에 실패했습니다.");
      if (!Array.isArray(data.results) || data.results.length !== input.length) throw new Error("진단 결과 형식이 올바르지 않습니다.");
      const result: UniversityTarget[] = input.map((target, index) => {
        const item = data.results[index];
        if (!item || item.university !== target.university || item.department !== target.department || item.admission_type !== target.trackType || item.track_name !== target.admissionName) throw new Error("선택한 전형과 진단 결과가 일치하지 않습니다.");
        return { ...target, judgment: judgmentFromLevel(item.level), reason: typeof item.comment === "string" && item.comment ? item.comment : "비교 가능한 근거가 없어 판단을 보류합니다." };
      });
      if (current === sequence.current && !controller.signal.aborted) {
        if (!checkProfileUnchanged()) return;
        setTargets(result);
        let message = "선택한 전형의 실제 입결 근거로 진단했습니다. 근거가 부족한 항목은 판단을 보류합니다.";
        try {
          const saved = sessionStorage.getItem("suprema_user_info");
          const snapshot = makeReportSnapshot(saved ? JSON.parse(saved) : null, data.results);
          if (snapshot) sessionStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(snapshot));
          else { clearStoredReport(); message += " 결과 보고서를 저장하려면 학생 이름과 학년 정보를 확인해 주세요."; }
        } catch { clearStoredReport(); message += " 브라우저 저장 공간을 사용할 수 없어 결과 보기 페이지에 저장하지 못했습니다. 현재 화면에서 결과를 확인해 주세요."; }
        setStatus(message);
      }
    } catch (error) {
      if (current === sequence.current && !controller.signal.aborted) setStatus(error instanceof Error ? error.message : "진단 중 오류가 발생했습니다.");
    } finally { if (current === sequence.current) setDiagnosing(false); }
  }
  async function handleSendMail() {
    if (!checkProfileUnchanged()) return;
    if (!complete || diagnosing || sending) { setStatus("진단을 완료한 뒤 결과를 보낼 수 있습니다."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setStatus("올바른 메일주소를 입력해 주세요."); return; }
    setSending(true); setStatus("");
    try {
      const response = await fetch("/api/send-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim(), subject: "[수프리마 랩] 전체 진단 결과", reportData: { service: "수프리마 랩", type: "admission-position-diagnosis", studentIndex: grade, gradingSystem: profile?.gradingSystem || "9-level", targets } }) });
      const result = await response.json().catch(() => ({}));
      setStatus(result?.message || (response.ok ? "메일 발송 완료" : "메일 발송 실패"));
    } catch { setStatus("메일 발송 중 오류가 발생했습니다."); } finally { setSending(false); }
  }

  return (
    <FlowShell badge="PREMIUM DIAGNOSIS" title={diagnosisScreenText.step4.title} subtitle={diagnosisScreenText.step4.subtitle} currentStep={4} steps={diagnosisSteps}>
      <div className="mx-auto max-w-[980px] rounded-[28px] border border-[#eadfce] bg-white p-6 text-left shadow-[0_18px_50px_rgba(44,26,10,0.04)]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-[#eadfce] bg-[#fffaf4] p-5 print:hidden">
          <div><div className="text-xs font-black tracking-[0.18em] text-[#8b1a1a]">{complete ? "FINAL RESULT" : "SELECT TARGETS"}</div><h2 className="mt-2 text-xl font-black text-[#1a0f08]">희망대학 {targets.length}개 진단</h2><p className="mt-1 text-sm font-semibold text-[#6c6256]">{summary}</p></div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={diagnose} disabled={!canDiagnose || diagnosing || sending} className="rounded-full bg-[#8b1a1a] px-5 py-3 text-sm font-black text-white disabled:opacity-50">{diagnosing ? "진단 중…" : "진단 실행"}</button>
            <button type="button" onClick={() => { if (checkProfileUnchanged()) window.print(); }} disabled={!complete || diagnosing} className="rounded-full border border-[#8b1a1a] px-5 py-3 text-sm font-black text-[#8b1a1a] disabled:opacity-50">인쇄</button>
            <button type="button" onClick={() => setMailOpen(previous => !previous)} disabled={!complete || diagnosing} className="rounded-full border border-[#8b1a1a] bg-white px-5 py-3 text-sm font-black text-[#8b1a1a] disabled:opacity-50">메일 보내기</button>
          </div>
          {mailOpen && complete && <div className="mt-4 flex w-full flex-wrap gap-2"><input type="email" aria-label="결과 받을 메일주소" value={email} onChange={event => setEmail(event.target.value)} placeholder="메일주소 입력" className="min-w-[240px] flex-1 rounded-xl border border-[#d9c8b3] bg-white px-4 py-3" /><button type="button" onClick={handleSendMail} disabled={sending} className="rounded-xl bg-[#0f766e] px-5 py-3 font-black text-white disabled:opacity-50">{sending ? "발송 중" : "전체 결과 발송"}</button></div>}
        </div>
        {loading && <p role="status" className="mb-4 rounded-xl bg-slate-50 p-4">입시 데이터를 불러오는 중입니다.</p>}
        {dataError && <p role="alert" className="mb-4 rounded-xl bg-rose-50 p-4 text-rose-700">{dataError}</p>}
        {!loading && !dataError && !rows.length && <p role="alert" className="mb-4 rounded-xl bg-amber-50 p-4">반영된 입시 데이터가 없습니다. 관리자가 입결 파일을 반영한 뒤 다시 이용해 주세요.</p>}
        {!loading && !hasGrade && <p role="alert" className="mb-4 rounded-xl bg-amber-50 p-4">진단할 성적이 없습니다. <Link href="/diagnosis/step1" className="underline">1단계에서 학생 성적을 확인해 주세요.</Link></p>}
        {status && <p role="status" className="mb-4 rounded-xl bg-[#8b1a1a]/10 px-4 py-3 text-sm font-bold text-[#8b1a1a] print:hidden">{status}</p>}
        <section className="mb-4 rounded-[24px] border border-[#eadfce] bg-[#fffaf4] p-5">
          <h3 className="text-lg font-black text-[#1f1720]">전 단계 요약</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Summary title="1단계 학생정보입력">{profile?.studentName || "학생명 없음"} · {profile?.schoolName || "학교명 없음"}</Summary>
            <Summary title="2단계 학생부 분석">희망 진로 {profile?.careerHint || "정보 없음"} · 내신 {hasGrade ? grade : "—"}등급 ({profile?.gradingSystem === "5-level" ? "5등급제" : "9등급제"})</Summary>
            <Summary title="3단계 탐구활동/독서/세특">총 {step3Bundle?.topics?.length || 0}개 주제</Summary>
          </div>
          {step3Bundle?.topics?.length ? <div className="mt-4 grid gap-3 md:grid-cols-2">{step3Bundle.topics.slice(0, 6).map((topic, index) => <div key={topic.id || index} className="rounded-2xl border border-[#eadfce] bg-white p-4"><div className="text-xs font-black text-[#8b1a1a]">주제 {index + 1}</div><div className="mt-2 font-black">{topic.topic_title}</div><p className="mt-2 text-sm leading-6 text-slate-600">{topic.setuk_sentence}</p></div>)}</div> : null}
        </section>
        <div className="space-y-4">{targets.map((target, index) => {
          const options = targetOptions(rows, target);
          return <section key={target.id} className="overflow-hidden rounded-[24px] border border-[#eadfce] bg-[#fffdf8]">
            <button type="button" onClick={() => setOpenId(previous => previous === target.id ? "" : target.id)} aria-expanded={openId === target.id} className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left"><div><div className="text-xs font-black tracking-[0.16em] text-[#8b1a1a]">UNIVERSITY {index + 1}</div><h3 className="mt-1 text-lg font-black">{target.university || "희망대학 선택"} · {target.department || "모집단위 선택"}</h3></div><span className={`rounded-full border px-4 py-2 text-sm font-black ${judgmentStyle[target.judgment]}`}>{target.judgment}</span></button>
            {openId === target.id && <div className="border-t border-[#eadfce] p-5"><div className="grid gap-3 md:grid-cols-2 print:grid-cols-2">
              <ChoiceField label="대학" value={target.university} options={options.universities} disabled={loading || diagnosing || sending} onChange={value => updateTarget(target.id, "university", value)} />
              <ChoiceField label="모집단위" value={target.department} options={options.departments} disabled={!target.university || diagnosing || sending} onChange={value => updateTarget(target.id, "department", value)} />
              <ChoiceField label="전형유형" value={target.trackType} options={options.types} disabled={!target.department || diagnosing || sending} onChange={value => updateTarget(target.id, "trackType", value)} />
              <ChoiceField label="전형명" value={target.admissionName} options={options.names} disabled={!target.trackType || diagnosing || sending} onChange={value => updateTarget(target.id, "admissionName", value)} />
              <div className="rounded-xl border border-[#eadfce] bg-white p-4 md:col-span-2"><strong className="text-sm">진단 근거</strong><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{target.reason || "진단 실행 후 실제 입결 기준과 판단 근거가 표시됩니다."}</p></div>
            </div>{targets.length > 1 && <button type="button" disabled={diagnosing || sending} onClick={() => removeTarget(target.id)} className="mt-4 text-sm font-bold text-rose-700 underline print:hidden">이 희망대학 삭제</button>}</div>}
          </section>;
        })}</div>
        <div className="mt-5 flex flex-wrap justify-between gap-3 print:hidden"><button type="button" onClick={addTarget} disabled={targets.length >= 6 || diagnosing || sending} className="rounded-full border border-[#8b1a1a] bg-white px-6 py-4 text-sm font-black text-[#8b1a1a] disabled:opacity-50">희망대학 추가 ({targets.length}/6)</button><div className="flex flex-wrap gap-3">{complete && <Link href="/report" className="rounded-full border border-[#8b1a1a] bg-white px-6 py-4 text-sm font-black text-[#8b1a1a]">결과 보고서 보기</Link>}<Link href="/diagnosis/step3" className="rounded-full border border-[#d9c8b3] bg-[#fff8f0] px-6 py-4 text-sm font-black">이전 단계</Link><Link href="/diagnosis" className="rounded-full bg-[#9f2420] px-6 py-4 text-sm font-black text-white">입시 데이터 검색</Link></div></div>
      </div>
    </FlowShell>
  );
}
function Summary({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-2xl border border-[#eadfce] bg-white p-4"><div className="text-sm font-black text-[#8b1a1a]">{title}</div><p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{children}</p></div>;
}
function ChoiceField({ label, value, options, disabled, onChange }: { label: string; value: string; options: string[]; disabled?: boolean; onChange: (value: string) => void }) {
  return <label className="text-sm font-black text-[#1f1720]">{label}<select value={value} disabled={disabled} onChange={event => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-[#d9c8b3] bg-white px-4 py-3 text-sm font-bold disabled:bg-slate-50 print:hidden"><option value="">{label} 선택</option>{options.map(option => <option key={option} value={option}>{option}</option>)}</select><span className="mt-2 hidden rounded-xl border border-[#eadfce] bg-white px-4 py-3 print:block">{value || "—"}</span></label>;
}
