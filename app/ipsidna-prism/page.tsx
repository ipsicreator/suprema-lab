"use client";

import Image from "next/image";

import Link from "next/link";
import styles from "./prism.module.css";

export default function IpsiDnaPrismLanding() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brandRow}>
          <Image width={320} height={96} className={styles.logo} src="/suprema-logo.svg" alt="대치수프리마" />
          <div className={styles.brandText}>대치수프리마</div>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.title}>입시DNA프리즘</h1>
          <p className={styles.subtitle}>학습엔진 분석</p>
          <p className={styles.tagline}>
            대학입시와 진로를 결정하는
            <br />
            아이 성장 분석 시스템
          </p>

          <div className={styles.note}>
            <strong>성격검사가 아닙니다.</strong> 학습 반응 구조를 분석해, 선행보다 먼저 “엔진”을 정돈합니다.
          </div>

          <div className={styles.actions}>
            <Link className={styles.primary} href="/ipsidna-prism/diagnosis">
              24문항 약식진단 시작
            </Link>
            <a className={styles.secondary} href="/ebooks/입시DNA프리즘_학습엔진분석_출판형.pdf" target="_blank" rel="noreferrer">
              이북(PDF) 보기
            </a>
          </div>

          <div className={styles.meta}>
            대상: 초등 3~6 중심 · 초6~중1 전환기 학부모
            <br />
            결과 유형: 세단형 · SUV형 · 스포츠카형 · 오프로드형
          </div>
        </div>
      </section>
    </main>
  );
}
