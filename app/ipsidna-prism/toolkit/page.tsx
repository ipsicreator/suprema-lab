"use client";

import Image from "next/image";

import Link from "next/link";
import { useMemo } from "react";
import { ENGINE_LABEL, type EngineType } from "../../../lib/ipsidna/questions";
import { TOOLKIT_BY_TYPE } from "../../../lib/ipsidna/toolkit";
import styles from "../prism.module.css";

function parseType(): EngineType {
  if (typeof window === "undefined") return "SEDAN";
  const t = new URLSearchParams(window.location.search).get("type");
  if (t === "SEDAN" || t === "SUV" || t === "SPORTS" || t === "OFFROAD") return t;
  return "SEDAN";
}

export default function PrismToolkitPage() {
  const type = useMemo(() => parseType(), []);
  const kit = TOOLKIT_BY_TYPE[type];

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brandRow}>
          <Image width={320} height={96} className={styles.logo} src="/suprema-logo.svg" alt="대치수프리마" />
          <div className={styles.brandText}>입시DNA프리즘 · 상담 툴킷</div>
        </div>
      </header>

      <section className={styles.card}>
        <div className={styles.resultHeader}>
          <div className={styles.kicker}>대상 유형</div>
          <h1 className={styles.resultTitle}>{ENGINE_LABEL[type]}</h1>
          <div className={styles.note}>{kit.goal}</div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelTitle}>포지셔닝(설명 한 문장)</div>
          <div className={styles.caseTextStrong}>{kit.positioning}</div>
        </div>

        <div className={styles.grid}>
          <div className={styles.panel}>
            <div className={styles.panelTitle}>상담 포커스</div>
            <ul className={styles.list}>
              {kit.focus.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <div className={styles.panel}>
            <div className={styles.panelTitle}>레드플래그</div>
            <ul className={styles.list}>
              {kit.redFlags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelTitle}>질문 5개(바로 쓰는 질문)</div>
          <ol className={styles.ordered}>
            {kit.questions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ol>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelTitle}>대표 케이스 3(사례 → 코칭 제안)</div>
          <div className={styles.caption}>상담에서 “이 케이스 맞나요?”로 확인한 뒤, 처방/전환 문장을 그대로 사용하세요.</div>
          <div className={styles.caseGrid}>
            {kit.cases.map((c) => (
              <div key={c.title} className={styles.caseCard}>
                <div className={styles.caseCardTitle}>{c.title}</div>
                <div className={styles.caseRow}>
                  <div className={styles.caseLabel}>징후</div>
                  <div className={styles.caseText}>
                    <ul className={styles.list} style={{ margin: 0 }}>
                      {c.signals.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className={styles.caseRow}>
                  <div className={styles.caseLabel}>진단</div>
                  <div className={styles.caseText}>{c.diagnosis}</div>
                </div>
                <div className={styles.caseRow}>
                  <div className={styles.caseLabel}>코칭</div>
                  <div className={styles.caseTextStrong}>{c.coaching}</div>
                </div>
                <div className={styles.caseRow}>
                  <div className={styles.caseLabel}>전환</div>
                  <div className={styles.caseText}>{c.transitionLine}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelTitle}>4주 실행 플랜(요약)</div>
          <div className={styles.caseGrid}>
            {kit.plan4w.map((w) => (
              <div key={w.week} className={styles.caseCard}>
                <div className={styles.caseCardTitle}>{w.week}</div>
                <ul className={styles.list}>
                  {w.actions.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelTitle}>클로징(상담 전환 문장)</div>
          <ul className={styles.list}>
            {kit.closing.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>

        <div className={styles.actions}>
          <Link className={styles.primary} href="/ipsidna-prism/diagnosis">
            진단 다시 보기
          </Link>
          <Link className={styles.secondary} href="/intro">
            상담/랜딩으로 이동
          </Link>
        </div>
      </section>
    </main>
  );
}
