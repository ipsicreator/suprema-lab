import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { buildTextSvg, diagnosisContent } from "@/app/diagnosis/content";

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
      <div className="mx-auto max-w-[1120px] overflow-hidden rounded-[32px] border border-[#eadfce] bg-white shadow-[0_28px_90px_rgba(44,26,10,0.08)]">
        <header className="grid grid-cols-[1fr_auto_1fr] items-start gap-4 px-6 pt-6 md:px-8 md:pt-7">
          <Link href="/" className="shrink-0">
            <Image
              src="/suprema-logo.svg"
              alt="수프리마"
              width={160}
              height={48}
              priority
              className="h-11 w-auto object-contain"
            />
          </Link>
          <div className="pt-2 text-left leading-tight" spellCheck={false}>
            <Image
              src={buildTextSvg("나의 입시멘토")}
              alt="나의 입시멘토"
              width={280}
              height={40}
              unoptimized
              className="h-7 w-auto"
            />
            <Image
              src={buildTextSvg("탐구·세특 입시위치진단")}
              alt="탐구 세특 입시위치진단"
              width={360}
              height={40}
              unoptimized
              className="mt-1 h-7 w-auto"
            />
          </div>
          <div className="justify-self-end pt-2">
            <Image
              src={buildTextSvg(badge)}
              alt={badge}
              width={240}
              height={36}
              unoptimized
              className="h-7 w-auto"
            />
          </div>
        </header>

        {steps.length ? (
          <section className="px-6 pt-6 md:px-8 md:pt-7">
            <div className="relative">
              <div className="absolute left-[5%] right-[5%] top-[20px] h-px bg-[#eadfce]" />
              <ol className={`relative grid gap-3 ${steps.length === 4 ? "grid-cols-4" : "grid-cols-3"}`}>
                {steps.map((step, index) => {
                  const active = index + 1 === currentStep;
                  return (
                    <li key={step.no} className="flex flex-col items-center text-center">
                      <div
                        className={[
                          "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold",
                          active
                            ? "border-[#8b1a1a] bg-[#8b1a1a] text-white shadow-[0_8px_18px_rgba(139,26,26,0.18)]"
                            : "border-[#eadfce] bg-white text-[#9ca3af]",
                        ].join(" ")}
                      >
                        {step.no}
                      </div>
                      <div className="mt-3">
                        <Image
                          src={buildTextSvg(step.title)}
                          alt={step.title}
                          width={220}
                          height={32}
                          unoptimized
                          className="h-6 w-auto"
                        />
                      </div>
                      {step.description ? (
                        <div className="mt-1 max-w-[13rem]">
                          <Image
                            src={buildTextSvg(step.description)}
                            alt={step.description}
                            width={240}
                            height={40}
                            unoptimized
                            className="h-8 w-auto"
                          />
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>
        ) : null}

        <section className="px-6 pt-8 text-center md:px-8 md:pt-10">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-3">
            <Image
              src={buildTextSvg(title)}
              alt={title}
              width={980}
              height={120}
              unoptimized
              className="h-auto w-full"
            />
            <Image
              src={buildTextSvg(subtitle)}
              alt={subtitle}
              width={980}
              height={80}
              unoptimized
              className="h-auto w-full"
            />
          </div>
        </section>

        <section className="px-6 pt-8 pb-6 md:px-8 md:pt-10 md:pb-8">{children}</section>

        {footer ? <div className="border-t border-[#ece0d1] px-6 py-6 md:px-8">{footer}</div> : null}
      </div>
    </main>
  );
}
