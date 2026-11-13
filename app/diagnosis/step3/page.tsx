import Link from "next/link";
import FlowShell from "@/app/components/FlowShell";
import { diagnosisSteps } from "../steps";
import Step3 from "./Step3";

export default function DiagnosisStep3Page() {
  return <FlowShell title="탐구·독서·세특" subtitle="학생부와 관심 분야를 바탕으로 탐구 주제를 정리하고 입시 진단으로 이어갑니다." steps={diagnosisSteps} currentStep={3}
    footer={<nav aria-label="진단 단계 이동" className="flex flex-wrap items-center justify-between gap-3"><Link href="/diagnosis/step2" className="rounded-full border border-[#d9c8b3] px-5 py-3 text-sm font-bold">이전 단계 · 학생부 분석</Link><Link href="/diagnosis/step4" className="rounded-full bg-[#8b1a1a] px-5 py-3 text-sm font-bold text-white">다음 단계 · 입시 위치 진단</Link></nav>}>
    <Step3 />
  </FlowShell>;
}
