"use client";

import Image from "next/image";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ENGINE_LABEL,
  ENGINE_TAGLINE,
  EngineType,
  PrismAnswers,
  PrismScore,
  scoreAnswers,
  resolveEngineType,
} from "../../../lib/ipsidna/questions";
import { fetchPrismResult, hasPrismApi } from "../../../lib/ipsidna/api";
import styles from "../prism.module.css";

type Payload = { answers: PrismAnswers; score: PrismScore; type: EngineType };

function parsePayload(): Payload | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const p = params.get("p");
  if (!p) return null;
  try {
    return JSON.parse(decodeURIComponent(p)) as Payload;
  } catch {
    return null;
  }
}

function normalize(payload: Payload | null): Payload | null {
  if (!payload?.answers) return null;
  const score = scoreAnswers(payload.answers);
  const type = resolveEngineType(score);
  return { answers: payload.answers, score, type };
}

const REPORT: Record<
  EngineType,
  {
    lead: string;
    strengths: string[];
    risks: string[];
    next: string[];
    recommendedChapters: string[];
    cases: Array<{
      title: string;
      situation: string;
      pattern: string;
      fix: string;
    }>;
  }
> = {
  SEDAN: {
    lead: "안정적으로 쌓아 올리는 힘이 큽니다. ‘기본기’가 엔진의 연료가 됩니다.",
    strengths: ["루틴과 반복 학습에 강함", "정확·정돈·재현 능력이 좋음", "기록/오답 정리가 비교적 탄탄함"],
    risks: ["새 형식(서술·비정형)에 적응이 늦어질 수 있음", "과잉 확인으로 시간 손해", "속도 불안이 자신감 저하로 이어질 수 있음"],
    next: ["표상 전환 훈련(그림↔표↔식)을 ‘루틴’으로", "문장제는 ‘조건 표시 → 표상 만들기 → 식화 → 검산’ 순서 고정", "수행평가는 ‘핵심요약 박스’ 방식으로 구조화"],
    recommendedChapters: ["01", "03", "04"],
    cases: [
      {
        title: "케이스 1) ‘정확한데 느린’ 아이",
        situation: "시험은 시간에 쫓기고, 마지막에 몰려 실수가 나요.",
        pattern: "조건을 완벽히 정리하려다 ‘착수’가 늦어집니다.",
        fix: "문장제는 30초 내 ‘조건 표시→표상’까지만, 이후 진행. 검산은 마지막이 아니라 중간 체크로 분산.",
      },
      {
        title: "케이스 2) 서술형에서 점수가 비는 아이",
        situation: "정답은 맞는데 과정 점수가 약해요.",
        pattern: "풀이가 ‘머리 속’에서 끝나 글로 남지 않습니다.",
        fix: "서술형 템플릿 3줄 고정: ‘조건→식/그림→결론’으로 매번 같은 틀을 사용.",
      },
      {
        title: "케이스 3) 새 유형에 당황하는 아이",
        situation: "처음 보는 문제 형식에 멈춰요.",
        pattern: "기존 루틴이 깨지면 리듬이 무너집니다.",
        fix: "주 2회 ‘변형 문제’만 모아 연습. 목표는 정답이 아니라 ‘표상 전환’ 성공률.",
      },
    ],
  },
  SUV: {
    lead: "맥락을 이해하고 연결하는 힘이 큽니다. 확장과 응용이 성장의 레버입니다.",
    strengths: ["의미/목적이 분명할 때 몰입", "교과 간 연결·융합에 강함", "탐구 발화(질문 만들기)가 빠름"],
    risks: ["정리/압축 단계가 허술해 점수 손해", "과정 기록이 산만해질 수 있음", "시간 관리가 흔들리면 성취가 들쭉날쭉"],
    next: ["요약-식화-검산 3단 고정 루틴", "탐구는 ‘질문 1개를 깊게’(범위 좁히기)", "수행평가: 결과보다 ‘근거/과정’ 체크리스트"],
    recommendedChapters: ["01", "04", "06"],
    cases: [
      {
        title: "케이스 1) ‘이해는 되는데 점수는 애매’",
        situation: "설명은 잘하는데 시험에서 손해를 봐요.",
        pattern: "풀이가 길어지고, 식으로 압축하는 단계가 약합니다.",
        fix: "매 문제 ‘한 줄 요약→핵심식 1개’만 남기는 훈련. 길면 줄이는 게 실력.",
      },
      {
        title: "케이스 2) 탐구는 많은데 기록이 남지 않음",
        situation: "아이디어는 많은데 제출물이 약해요.",
        pattern: "범위를 넓게 잡고 마무리가 늦습니다.",
        fix: "질문 1개 고정 + ‘가설 1개’만. 결과는 5문장 제한으로 정리.",
      },
      {
        title: "케이스 3) 컨디션에 따라 성적이 출렁임",
        situation: "잘할 때와 못할 때 차이가 커요.",
        pattern: "상황에 따라 전략이 바뀌며 시간 관리가 흔들립니다.",
        fix: "시험 전략을 ‘고정’(순서/시간/검산). 변동은 마지막 10%만 허용.",
      },
    ],
  },
  SPORTS: {
    lead: "도전 과제가 있을 때 폭발합니다. ‘고속 주행’ 전에 ‘안전 장치’가 필요합니다.",
    strengths: ["짧은 시간에 고난도 돌파", "경쟁/승부 과제에서 집중", "핵심을 압축해 처리하는 능력"],
    risks: ["조건/단위 누락, 검산 생략", "기반이 비면 고난도에서 사고(급락)", "과열·번아웃 위험"],
    next: ["검산 구조를 ‘필수’로(시간이 아니라 습관)", "기초 리빌드: 빈 구멍을 찾아 ‘짧게-자주’ 메우기", "대회/심화는 ‘점수’가 아니라 ‘엔진 보완’ 중심으로 설계"],
    recommendedChapters: ["02", "03", "05"],
    cases: [
      {
        title: "케이스 1) ‘어려운 건 푸는데 쉬운 걸 틀림’",
        situation: "난도 높은 문제는 맞고, 기본에서 점수를 잃어요.",
        pattern: "속도로 밀어붙이며 조건/단위 누락이 반복됩니다.",
        fix: "쉬운 문제도 ‘조건 체크 2개’(단위/범위) 후 착수. 체크 없이 시작 금지.",
      },
      {
        title: "케이스 2) 급상승 후 급락",
        situation: "한동안 잘하다가 어느 순간 무너져요.",
        pattern: "기초 빈틈이 누적된 상태에서 난도만 올립니다.",
        fix: "2주 ‘리빌드 기간’ 고정: 기초 60%, 심화 40%. 빈틈 메우기 우선.",
      },
      {
        title: "케이스 3) 번아웃이 빠른 아이",
        situation: "몰입은 강한데 지속이 어려워요.",
        pattern: "고강도-고속 패턴으로 체력이 소진됩니다.",
        fix: "훈련을 ‘짧게-자주’로 분할. 주 1회는 완전 회복일로 고정.",
      },
    ],
  },
  OFFROAD: {
    lead: "새로운 길을 찾는 힘이 큽니다. ‘탐색’이 장점이 되려면 ‘정리’가 붙어야 합니다.",
    strengths: ["비정형 과제·프로젝트형 활동에 강함", "호기심 기반의 탐색·실험", "창의적 표상(그림/도식) 능력"],
    risks: ["표준화(정답형)에서 손해", "기록/정리 부족으로 평가에서 누락", "흥미가 꺼지면 지속이 어렵다"],
    next: ["보고서형 루틴(질문-가설-실행-결과-성찰) 고정", "수학은 ‘표준 풀이로 정리’까지 마무리", "과제는 ‘끝내는 습관’(마감 구조 만들기)"],
    recommendedChapters: ["02", "04", "07"],
    cases: [
      {
        title: "케이스 1) ‘아이디어는 좋은데 점수가 안 남음’",
        situation: "설명은 흥미로운데 평가에서 손해를 봐요.",
        pattern: "과정/결과가 문서로 정리되지 않습니다.",
        fix: "결과물을 ‘한 장 템플릿’으로 고정(요약-근거-결론-다음 질문).",
      },
      {
        title: "케이스 2) 시작은 빠른데 끝이 약함",
        situation: "초반 몰입 후 마무리가 느려요.",
        pattern: "흥미 중심으로 이동하며 마감이 흔들립니다.",
        fix: "마감 구조를 먼저 정하고 시작(제출 형태/분량/시간). 체크포인트 2개만 운영.",
      },
      {
        title: "케이스 3) 수학에서 풀이가 ‘자유로운데’ 불안정",
        situation: "그림은 잘 그리는데 정답이 흔들려요.",
        pattern: "표준 풀이로 ‘정리’가 끝나지 않습니다.",
        fix: "마지막 3줄은 표준식/정리문으로 고정. 자유로운 풀이 후 표준화로 착지.",
      },
    ],
  },
};

export default function PrismResultPage() {
  const [remotePayload, setRemotePayload] = useState<Payload | null>(null);
  const normalized = useMemo(() => normalize(remotePayload ?? parsePayload()), [remotePayload]);

  useEffect(() => {
    if (!hasPrismApi()) return;
    const params = new URLSearchParams(window.location.search);
    const rid = params.get("rid");
    const id = rid ? Number(rid) : NaN;
    if (!Number.isFinite(id) || id <= 0) return;
    fetchPrismResult({ resultId: id }).then((data) => {
      if (!data?.ok) return;
      const answers = data.answers as PrismAnswers;
      const score = data.score as PrismScore;
      const type = data.engine_type as EngineType;
      if (!answers) return;
      setRemotePayload({ answers, score, type });
    });
  }, []);

  if (!normalized) {
    return (
      <main className={styles.page}>
        <section className={styles.card}>
          <h1 className={styles.qTitle}>결과를 불러올 수 없습니다.</h1>
          <div className={styles.caption}>진단을 다시 진행해 주세요.</div>
          <div className={styles.actions}>
            <Link className={styles.primary} href="/ipsidna-prism/diagnosis">
              약식진단 다시 시작
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const { type, score } = normalized;
  const report = REPORT[type];

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brandRow}>
          <Image width={320} height={96} className={styles.logo} src="/suprema-logo.svg" alt="대치수프리마" />
          <div className={styles.brandText}>입시DNA프리즘 · 결과 리포트</div>
        </div>
      </header>

      <section className={styles.card}>
        <div className={styles.resultHeader}>
          <div className={styles.kicker}>결과 유형</div>
          <h1 className={styles.resultTitle}>{ENGINE_LABEL[type]}</h1>
          <div className={styles.resultSub}>{ENGINE_TAGLINE[type]}</div>
          <div className={styles.note}>{report.lead}</div>
        </div>

        <div className={styles.grid}>
          <div className={styles.panel}>
            <div className={styles.panelTitle}>강점</div>
            <ul className={styles.list}>
              {report.strengths.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <div className={styles.panel}>
            <div className={styles.panelTitle}>주의 포인트</div>
            <ul className={styles.list}>
              {report.risks.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <div className={styles.panel}>
            <div className={styles.panelTitle}>다음 2주 액션</div>
            <ul className={styles.list}>
              {report.next.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <div className={styles.panel}>
            <div className={styles.panelTitle}>추천 읽기</div>
            <div className={styles.reading}>
              {report.recommendedChapters.map((c) => (
                <div key={c} className={styles.badge}>
                  CH {c}
                </div>
              ))}
            </div>
            <div className={styles.caption}>이북에서 해당 챕터를 먼저 읽고, 실행 루틴을 맞춥니다.</div>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelTitle}>상담 툴킷(내부용)</div>
          <div className={styles.caption}>유형별 질문/4주 플랜/클로징 문장을 한 페이지로 정리했습니다.</div>
          <div className={styles.actions} style={{ marginTop: 10 }}>
            <Link className={styles.secondary} href={`/ipsidna-prism/toolkit?type=${type}`}>
              상담 툴킷 열기
            </Link>
          </div>
        </div>

        <div className={styles.scoreRow}>
          <div className={styles.scoreItem}>
            <div className={styles.scoreKey}>세단형</div>
            <div className={styles.scoreVal}>{score.SEDAN}</div>
          </div>
          <div className={styles.scoreItem}>
            <div className={styles.scoreKey}>SUV형</div>
            <div className={styles.scoreVal}>{score.SUV}</div>
          </div>
          <div className={styles.scoreItem}>
            <div className={styles.scoreKey}>스포츠카형</div>
            <div className={styles.scoreVal}>{score.SPORTS}</div>
          </div>
          <div className={styles.scoreItem}>
            <div className={styles.scoreKey}>오프로드형</div>
            <div className={styles.scoreVal}>{score.OFFROAD}</div>
          </div>
        </div>

        <div className={styles.actions}>
          <a className={styles.primary} href="/ebooks/입시DNA프리즘_학습엔진분석_출판형.pdf" target="_blank" rel="noreferrer">
            이북(PDF) 열기
          </a>
          <Link className={styles.primary} href="/ipsidna-prism/full">
            본 진단(추가 24문항)
          </Link>
          <Link className={styles.primary} href="/intro">
            심층진단/상담 연결
          </Link>
          <Link className={styles.secondary} href="/ipsidna-prism/diagnosis">
            다시 진단하기
          </Link>
        </div>

        <div className={styles.footerNote}>
          심층진단/상담은 내부 경로(`/intro`, `/leaflet`)로 연결됩니다. 랜딩 확정 시 외부 링크로 교체합니다.
        </div>
      </section>
    </main>
  );
}
