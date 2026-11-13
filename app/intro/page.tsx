import Image from "next/image";
import Link from "next/link";
import styles from "./intro.module.css";

const steps = [
  { no: "01", title: "학생부 업로드", desc: "학생부를 안전하게 업로드", href: "/diagnosis/step1" },
  { no: "02", title: "학생부 분석", desc: "핵심 역량과 개선점 분석", href: "/diagnosis/step2" },
  { no: "03", title: "탐구 주제", desc: "관심 기반 탐구 주제 설정", href: "/diagnosis/step3" },
  { no: "04", title: "입시 위치 진단", desc: "지원 가능 대학 위치 진단", href: "/diagnosis/step4" },
];

const features = [
  { title: "정확한 분석", desc: "데이터 기반 평가" },
  { title: "맞춤형 전략", desc: "학생별 최적 로드맵" },
  { title: "검증된 전문가", desc: "입시 · 진로 전문 코칭" },
];

export default function IntroPage() {
  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <Image
              src="/대치수프리마_2025-removebg-preview.png"
              alt="Su·Prima 입시&코칭센터"
              width={390}
              height={106}
              priority
              className={styles.brandLogo}
            />
          </div>
        </header>

        <section className={styles.hero} aria-label="intro hero">
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>Su·Prima 입시&코칭센터</p>
            <h1>나의 입시멘토</h1>
            <div className={styles.rule} />
            <p className={styles.subhead}>정확한 진단, 맞춤형 코칭으로 합격까지</p>
            <p className={styles.support}>
              학생부 분석, 탐구 주제 설계, 입시 위치 진단을 한 화면에서 연결해
              현재 위치와 다음 행동을 분명하게 보여줍니다.
            </p>

            <div className={styles.features}>
              {features.map((feature) => (
                <div className={styles.feature} key={feature.title}>
                  <div className={styles.featureIcon} aria-hidden="true">
                    <span />
                  </div>
                  <div>
                    <strong>{feature.title}</strong>
                    <span>{feature.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.heroVisual} aria-hidden="true">
            <div className={styles.visualPane}>
              <div className={styles.visualBrandText}>
                <strong>Su·Prima</strong>
                <span>입시&코칭센터</span>
              </div>
              <div className={styles.compass}>
                <div className={styles.compassInner}>
                  <div className={styles.compassNeedle} />
                  <div className={styles.compassNeedleAlt} />
                </div>
              </div>

              <div className={styles.floatingCardA}>
                <span className={styles.cardTitle}>학생부 분석</span>
                <span className={styles.cardLine} />
                <span className={styles.cardLineShort} />
                <span className={styles.cardLine} />
              </div>

              <div className={styles.floatingCardB}>
                <span className={styles.cardTitle}>탐구 주제</span>
                <span className={styles.cardLine} />
                <span className={styles.cardLineShort} />
                <span className={styles.cardLine} />
              </div>

              <div className={styles.floatingCardC}>
                <span className={styles.cardTitle}>입시 위치 진단</span>
                <span className={styles.cardLine} />
                <span className={styles.cardLineShort} />
                <span className={styles.cardLine} />
              </div>
              <div className={styles.pathDot} />
              <div className={styles.pathDot2} />
              <div className={styles.pathDot3} />
            </div>
          </div>
        </section>

        <section className={styles.steps} aria-label="intro steps">
          {steps.map((step) => (
            <article className={styles.step} key={step.no}>
              <span className={styles.stepNo}>{step.no}</span>
              <div className={styles.stepIcon} aria-hidden="true">
                <span />
              </div>
              <div className={styles.stepBody}>
                <h2>{step.title}</h2>
                <p>{step.desc}</p>
              </div>
              <span className={styles.stepArrow} aria-hidden="true" />
            </article>
          ))}
        </section>

        <footer className={styles.footer}>
          <div>
            <strong>Su·Prima 입시&코칭센터</strong>
            <p>정확한 분석과 맞춤형 전략으로 입시 여정을 돕습니다.</p>
          </div>
            <div className={styles.footerActions}>
            <Link href="/diagnosis" className={styles.footerButtonPrimary}>
              진단 시작하기
            </Link>
            <Link href="/report" className={styles.footerButtonSecondary}>
              결과 보기
            </Link>
          </div>
        </footer>
      </section>
    </main>
  );
}
