"use client";

import Image from "next/image";

import Link from "next/link";
import { useMemo } from "react";
import { getEngineTypeFromUrl, getLastPrismEngineType } from "../../../lib/ipsidna/storage";
import styles from "../prism.module.css";

export default function PrismFullIntroPage() {
  const type = useMemo(() => getEngineTypeFromUrl() ?? getLastPrismEngineType(), []);
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brandRow}>
          <Image width={320} height={96} className={styles.logo} src="/suprema-logo.svg" alt="대치수프리마" />
          <div className={styles.brandText}>입시DNA프리즘 · 본 진단</div>
        </div>
      </header>

      <section className={styles.card}>
        <div className={styles.resultHeader}>
          <div className={styles.kicker}>추가 문항</div>
          <h1 className={styles.resultTitle}>본 진단(추가 24문항)</h1>
          <div className={styles.note}>
            약식진단은 “유형”을 잡습니다. 본 진단은 “병목”을 잡습니다.
            <br />
            끝나면 상담에서 바로 쓰는 4주 플랜이 나옵니다.
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelTitle}>진행 안내</div>
          <ul className={styles.list}>
            <li>소요 시간: 7~8분</li>
            <li>결과: 병목 상위 2~3개 + 2주 액션 + 상담 툴킷 연결</li>
            <li>권장: 아이/부모가 함께 체크(관찰 기준)</li>
          </ul>
        </div>

        <div className={styles.actions}>
          <Link className={styles.primary} href={type ? `/ipsidna-prism/full/questions?type=${type}` : "/ipsidna-prism/full/questions"}>
            본 진단 시작
          </Link>
          <Link className={styles.secondary} href="/ipsidna-prism/result">
            결과 리포트로 돌아가기
          </Link>
        </div>
      </section>
    </main>
  );
}
