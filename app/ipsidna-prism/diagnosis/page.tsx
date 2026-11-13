"use client";

import Image from "next/image";

import { useMemo, useState } from "react";
import { PRISM_QUESTIONS, PrismAnswers, scoreAnswers, resolveEngineType } from "../../../lib/ipsidna/questions";
import styles from "../prism.module.css";

function clampIndex(index: number, max: number) {
  return Math.min(Math.max(index, 0), max);
}

export default function PrismDiagnosisPage() {
  const total = PRISM_QUESTIONS.length;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<PrismAnswers>({});
  const [submitting, setSubmitting] = useState(false);
  const [leadId, setLeadId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    try { return window.localStorage.getItem("prism_lead_id") || ""; } catch { return ""; }
  });
  const [leadForm, setLeadForm] = useState({
    name: "",
    school: "",
    grade: "",
    student_phone: "",
    parent_phone: "",
    email: "",
  });

  const current = PRISM_QUESTIONS[index];
  const progress = useMemo(() => Math.round(((index + 1) / total) * 100), [index, total]);

  const setChoice = (choice: "A" | "B" | "C" | "D") => {
    setAnswers((prev) => ({ ...prev, [current.id]: choice }));
  };

  const canNext = Boolean(answers[current.id]);

  const goPrev = () => setIndex((v) => clampIndex(v - 1, total - 1));
  const goNext = () => setIndex((v) => clampIndex(v + 1, total - 1));

  const finish = async () => {
    const score = scoreAnswers(answers);
    const type = resolveEngineType(score);
    const payload = encodeURIComponent(JSON.stringify({ answers, score, type }));

    try {
      window.localStorage.setItem("prism_last_payload", payload);
    } catch {
      // ignore
    }

    setSubmitting(true);
    const submitted = await fetch("/api/ipsidna-prism/assessment", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ lead_id: leadId, answers }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
    setSubmitting(false);
    if (submitted?.ok && submitted?.id) {
      window.location.href = `/ipsidna-prism/result?rid=${submitted.id}&p=${payload}`;
      return;
    }
    window.location.href = `/ipsidna-prism/result?p=${payload}`;
  };

  const submitLead = async () => {
    setSubmitting(true);
    const res = await fetch("/api/ipsidna-prism/lead", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(leadForm),
    })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
    setSubmitting(false);
    if (res?.ok && res?.id) {
      setLeadId(res.id as string);
      try {
        window.localStorage.setItem("prism_lead_id", res.id as string);
      } catch {
        // ignore
      }
      return;
    }
    alert("정보 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.");
  };

  if (!leadId) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <div className={styles.brandRow}>
            <Image width={320} height={96} className={styles.logo} src="/suprema-logo.svg" alt="대치수프리마" />
            <div className={styles.brandText}>입시DNA프리즘 · 약식진단</div>
          </div>
        </header>

        <section className={styles.card}>
          <div className={styles.resultHeader}>
            <div className={styles.kicker}>시작하기</div>
            <h1 className={styles.resultTitle}>기본 정보 입력</h1>
            <div className={styles.caption}>진단 결과 리포트와 심층 상담 연결을 위해 필요한 최소 정보입니다.</div>
          </div>

          <div className={styles.formGrid}>
            <label className={styles.field}>
              <div className={styles.fieldLabel}>이름</div>
              <input className={styles.input} value={leadForm.name} onChange={(e) => setLeadForm((p) => ({ ...p, name: e.target.value }))} />
            </label>
            <label className={styles.field}>
              <div className={styles.fieldLabel}>학교</div>
              <input className={styles.input} value={leadForm.school} onChange={(e) => setLeadForm((p) => ({ ...p, school: e.target.value }))} />
            </label>
            <label className={styles.field}>
              <div className={styles.fieldLabel}>학년</div>
              <input className={styles.input} value={leadForm.grade} onChange={(e) => setLeadForm((p) => ({ ...p, grade: e.target.value }))} />
            </label>
            <label className={styles.field}>
              <div className={styles.fieldLabel}>학생 전화(선택)</div>
              <input
                className={styles.input}
                value={leadForm.student_phone}
                onChange={(e) => setLeadForm((p) => ({ ...p, student_phone: e.target.value }))}
              />
            </label>
            <label className={styles.field}>
              <div className={styles.fieldLabel}>학부모 전화</div>
              <input
                className={styles.input}
                value={leadForm.parent_phone}
                onChange={(e) => setLeadForm((p) => ({ ...p, parent_phone: e.target.value }))}
              />
            </label>
            <label className={styles.field}>
              <div className={styles.fieldLabel}>이메일</div>
              <input className={styles.input} value={leadForm.email} onChange={(e) => setLeadForm((p) => ({ ...p, email: e.target.value }))} />
            </label>
          </div>

          <div className={styles.actions} style={{ marginTop: 14 }}>
            <button className={styles.navBtnPrimary} onClick={submitLead} disabled={submitting}>
              {submitting ? "저장 중..." : "약식진단 시작"}
            </button>
            <div className={styles.caption}>저장 후 바로 24문항 진단이 시작됩니다.</div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brandRow}>
          <Image width={320} height={96} className={styles.logo} src="/suprema-logo.svg" alt="대치수프리마" />
          <div className={styles.brandText}>입시DNA프리즘 · 약식진단</div>
        </div>
        <div className={styles.progressWrap}>
          <div className={styles.progressBar} style={{ width: `${progress}%` }} aria-label={`진행률 ${progress}%`} />
        </div>
      </header>

      <section className={styles.card}>
        <div className={styles.cardTop}>
          <div className={styles.kicker}>
            {index + 1}/{total}
          </div>
          <h1 className={styles.qTitle}>{current.prompt}</h1>
        </div>

        <div className={styles.choices}>
          {(["A", "B", "C", "D"] as const).map((k) => {
            const picked = answers[current.id] === k;
            return (
              <button key={k} className={`${styles.choice} ${picked ? styles.choicePicked : ""}`} onClick={() => setChoice(k)}>
                <div className={styles.choiceKey}>{k}</div>
                <div className={styles.choiceText}>{current.choices[k]}</div>
              </button>
            );
          })}
        </div>

        <div className={styles.nav}>
          <button className={styles.navBtn} onClick={goPrev} disabled={index === 0}>
            이전
          </button>
          {index < total - 1 ? (
            <button className={styles.navBtnPrimary} onClick={goNext} disabled={!canNext}>
              다음
            </button>
          ) : (
            <button className={styles.navBtnPrimary} onClick={finish} disabled={!canNext || submitting}>
              {submitting ? "저장 중..." : "결과 보기"}
            </button>
          )}
        </div>

        <div className={styles.caption}>성격검사가 아니라, 학습 반응 구조를 보는 진단입니다.</div>
      </section>
    </main>
  );
}
