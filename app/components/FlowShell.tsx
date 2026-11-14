import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { diagnosisContent } from "@/app/diagnosis/content";
import OfficialFooter from "./OfficialFooter";

export type FlowStep = {
  no: string;
  title: string;
  description?: string;
  icon?: ReactNode;
};

type FlowShellProps = {
  badge?: string;
  title: string;
  subtitle: string;
  steps?: FlowStep[];
  currentStep?: number;
  footer?: ReactNode;
  children: ReactNode;
};

export default function FlowShell({
  badge = diagnosisContent.badge,
  title,
  subtitle,
  steps = diagnosisContent.steps,
  currentStep = 1,
  footer,
  children,
}: FlowShellProps) {
  return (
    <main className="min-h-screen bg-[#f7f4ee] px-4 py-4 text-[#1a0f08] md:px-6 md:py-6">
      <div className="mx-auto max-w-[820px] overflow-hidden rounded-[24px] md:rounded-[28px] border border-[#eadfce] bg-white shadow-[0_20px_60px_rgba(44,26,10,0.06)]">
        {/* Top Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#ebdcd0] px-6 py-4 md:px-10 bg-white">
          <div className="flex items-center gap-4">
            <Link href="/" className="shrink-0 flex items-center">
              <Image
                src="/suprema-official-logo.png"
                alt="대치 수프리마 공식 로고"
                width={130}
                height={45}
                priority
                className="h-10 w-auto object-contain"
              />
            </Link>

            {/* 서비스 네임: 나의 입시멘토 대폭 강조 */}
            <div className="border-l-2 border-[#8b1a1a]/30 pl-4 py-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[17px] md:text-[19px] font-black text-[#8b1a1a] tracking-tight">
                  나의 입시멘토
                </span>
                <span className="hidden sm:inline-block rounded bg-[#8b1a1a] px-1.5 py-0.5 text-[10px] font-bold text-white">
                  공식 서비스
                </span>
              </div>
              <div className="text-[11px] md:text-[12px] text-[#5c4e43] font-semibold mt-0.5">
                탐구 · 세특 · 대입 합격선 정밀 진단
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-full border border-[#f0ded6] bg-[#fbf5f2] px-3.5 py-1 text-[11px] font-extrabold tracking-wider text-[#8b1a1a]">
              {badge}
            </span>
            <Link
              href="/activities"
              className="text-xs md:text-sm font-bold text-[#1a0f08] hover:text-[#8b1a1a] transition-colors shrink-0 flex items-center gap-1"
            >
              내 활동 기록 · 학원 연결 →
            </Link>
          </div>
        </header>

        {/* Steps Breadcrumbs */}
        {steps.length ? (
          <section className="border-b border-[#f3ede4] bg-[#faf8f5]/60 px-6 py-6 md:px-8">
            <div className="relative mx-auto max-w-4xl">
              <div className="absolute left-[10%] right-[10%] top-[19px] h-0.5 bg-[#e8ded2] -z-0" />
              <ol className={`relative z-10 grid gap-2 ${steps.length === 4 ? "grid-cols-4" : "grid-cols-3"}`}>
                {steps.map((step, index) => {
                  const stepNumber = index + 1;
                  const active = stepNumber === currentStep;
                  const completed = stepNumber < currentStep;
                  return (
                    <li key={step.no} className="flex flex-col items-center text-center">
                      <div
                        className={[
                          "flex h-10 w-10 items-center justify-center rounded-full text-sm font-extrabold transition-all",
                          active
                            ? "border-2 border-[#8b1a1a] bg-[#8b1a1a] text-white shadow-md ring-4 ring-[#8b1a1a]/15"
                            : completed
                            ? "border-2 border-[#8b1a1a] bg-[#fffaf4] text-[#8b1a1a]"
                            : "border-2 border-[#eadfce] bg-white text-[#9ca3af]",
                        ].join(" ")}
                      >
                        {step.no}
                      </div>
                      <div
                        className={`mt-2 text-xs md:text-sm font-bold tracking-tight ${
                          active ? "text-[#8b1a1a]" : completed ? "text-[#1a0f08]" : "text-[#706b65]"
                        }`}
                      >
                        {step.title}
                      </div>
                      {step.description ? (
                        <div className="mt-0.5 hidden sm:block text-[11px] text-[#8a8177] leading-snug max-w-[130px]">
                          {step.description}
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>
        ) : null}

        {/* Page Hero Title & Subtitle */}
        <section className="px-6 pt-8 pb-4 text-center md:px-8 md:pt-10">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-2xl md:text-3xl font-black text-[#1a0f08] tracking-tight">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-2 text-sm md:text-base text-[#706b65] leading-relaxed">
                {subtitle}
              </p>
            ) : null}
          </div>
        </section>

        {/* Main Content */}
        <section className="px-6 pt-4 pb-8 md:px-8 md:pb-12">{children}</section>

        {footer ? <div className="border-t border-[#ece0d1] px-6 py-6 md:px-8">{footer}</div> : null}
      </div>
      <div className="mt-8">
        <OfficialFooter className="rounded-2xl border border-[#eadfce] shadow-xs" />
      </div>
    </main>
  );
}
