import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { diagnosisContent } from "@/app/diagnosis/content";
import StudentContext from "./StudentContext";
import styles from "./FlowShell.module.css";

export type FlowStep = { no: string; title: string; description?: string; icon?: ReactNode };
type FlowShellProps = { badge?: string; title: string; subtitle: string; steps?: FlowStep[]; currentStep?: number; footer?: ReactNode; children: ReactNode };

export default function FlowShell({ badge = diagnosisContent.badge, title, subtitle, steps = diagnosisContent.steps, currentStep = 1, footer, children }: FlowShellProps) {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <Link href="/intro" className={styles.brand} aria-label="수프리마랩 홈">
            <Image src="/suprema-logo.svg" alt="" width={140} height={42} priority className={styles.logo} />
            <span>수프리마랩</span>
          </Link>
          <nav className={styles.shortcuts} aria-label="공통 메뉴">
            <Link href="/diagnosis">입시 자료 검색</Link>
            <Link href="/intro">홈</Link>
          </nav>
        </header>
        {steps.length > 0 && (
          <nav className={styles.progress} aria-label="진단 진행 단계">
            <ol className={styles.steps}>
              {steps.map((step, index) => {
                const stepNumber = index + 1;
                const label = <><span className={styles.number}>{step.no}</span><span className={styles.stepText}><strong>{step.title}</strong><span>{step.description}</span></span></>;
                return <li key={step.no} className={stepNumber === currentStep ? styles.current : stepNumber < currentStep ? styles.previous : undefined} aria-current={stepNumber === currentStep ? "step" : undefined}>
                  {stepNumber < currentStep && steps.length === 4 ? <Link href={"/diagnosis/step" + stepNumber} aria-label={stepNumber + "단계 " + step.title + "로 돌아가기"}>{label}</Link> : <div className={styles.stepLabel}>{label}</div>}
                </li>;
              })}
            </ol>
          </nav>
        )}
        {currentStep > 1 && <StudentContext />}
        <section className={styles.heading}>
          <p className={styles.badge}>{badge}</p>
          <h1>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </section>
        <section className={styles.content}>{children}</section>
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </main>
  );
}
