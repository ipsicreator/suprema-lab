"use client";

import Image from "next/image";
import Link from "next/link";
import OfficialFooter from "./OfficialFooter";
import {
  Sparkles,
  BookOpen,
  Compass,
  FileText,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  Users,
  Layers,
  ChevronRight,
  Clock,
  ExternalLink,
} from "lucide-react";

export default function IntroScreen() {
  return (
    <div className="min-h-screen bg-[#fcfaf7] text-[#1f1720] selection:bg-[#8b1a1a] selection:text-white">
      {/* 1. 최상단 글로벌 헤더 */}
      <header className="sticky top-0 z-50 border-b border-[#eadfce] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/suprema-official-logo.png"
              alt="대치 수프리마 로고"
              width={160}
              height={44}
              priority
              className="h-9 w-auto object-contain"
            />
            <div className="hidden border-l border-[#d8c8b4] pl-3 sm:block">
              <span className="block text-xs font-black tracking-widest text-[#8b1a1a]">
                대치 수프리마 대입전략연구소
              </span>
              <span className="block text-sm font-extrabold text-[#2a1b12]">
                나의 입시멘토
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="#flow"
              className="text-xs font-bold text-slate-600 transition hover:text-[#8b1a1a]"
            >
              4단계 진단 프로세스
            </Link>
            <Link
              href="#b2b"
              className="text-xs font-bold text-slate-600 transition hover:text-[#8b1a1a]"
            >
              학원 B2B 컨설팅
            </Link>
            <Link
              href="/activities"
              className="text-xs font-bold text-slate-600 transition hover:text-[#8b1a1a]"
            >
              내 활동 기록 · 학원 연결
            </Link>
            <Link
              href="/report"
              className="text-xs font-bold text-slate-600 transition hover:text-[#8b1a1a]"
            >
              진단 결과 확인
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/activities"
              className="hidden rounded-full border border-[#d9c9b5] bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 transition hover:border-[#8b1a1a] hover:text-[#8b1a1a] sm:inline-flex"
            >
              학원 연결
            </Link>
            <Link
              href="/diagnosis/step1"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#8b1a1a] px-4 py-2 text-xs font-black text-white shadow-sm transition hover:bg-[#721515]"
            >
              <span>진단 시작하기</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. 히어로 섹션 */}
      <section className="relative overflow-hidden border-b border-[#ebdcca] bg-gradient-to-b from-[#fffaf3] via-[#fcf6ee] to-[#fbf2e5] py-16 sm:py-24">
        {/* 장식용 배경 블러 원 */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-[#8b1a1a]/5 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-20 h-96 w-96 rounded-full bg-[#d4af37]/10 blur-3xl" />

        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#e5d4be] bg-white/80 px-4 py-1.5 shadow-xs backdrop-blur-xs">
            <Sparkles size={14} className="text-[#8b1a1a]" />
            <span className="text-xs font-black tracking-wider text-[#8b1a1a]">
              2026 · 2027 · 2028 수시 올인원 AI 진단 솔루션
            </span>
          </div>

          <h1 className="text-3xl font-black leading-tight tracking-tight text-[#1a0f08] sm:text-5xl sm:leading-tight">
            성적만 보는 입시는 끝났습니다.
            <br />
            <span className="bg-gradient-to-r from-[#8b1a1a] via-[#a82424] to-[#c2410c] bg-clip-text text-transparent">
              탐구제안 ➔ 세특완성 ➔ 연계 독서 ➔ 164개 대학 진단
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base font-semibold leading-relaxed text-slate-600 sm:text-lg">
            2028 대입 개편 <strong>5등급제 · 9등급제 자동 환산</strong>과 전국 <strong>164개 대학 26,295개 전형</strong> 최신 컷오프를 탑재하여, 학생부 정밀 분석부터 나이스 기재용 세특 문장과 연계 추천 도서까지 한 번에 완성합니다.
          </p>

          {/* 핵심 CTA 버튼 그룹 */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/diagnosis/step1"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#8b1a1a] px-7 py-4 text-sm font-black text-white shadow-md transition hover:bg-[#721515] hover:shadow-lg sm:text-base"
            >
              <span>무료 학생부 진단 시작하기</span>
              <ArrowRight size={18} />
            </Link>
            <Link
              href="#b2b"
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-[#8b1a1a] bg-white px-6 py-3.5 text-sm font-black text-[#8b1a1a] shadow-xs transition hover:bg-[#8b1a1a]/5 sm:text-base"
            >
              <Users size={18} />
              <span>학원 B2B 컨설팅 서비스 안내</span>
            </Link>
          </div>

          {/* 신뢰 지표 카드 4종 */}
          <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <div className="rounded-2xl border border-[#eadfce] bg-white/90 p-4 shadow-xs">
              <div className="text-2xl font-black text-[#8b1a1a]">164개</div>
              <div className="mt-1 text-xs font-bold text-slate-600">전국 주요 대학 DB</div>
            </div>
            <div className="rounded-2xl border border-[#eadfce] bg-white/90 p-4 shadow-xs">
              <div className="text-2xl font-black text-[#8b1a1a]">26,295개</div>
              <div className="mt-1 text-xs font-bold text-slate-600">수시 전형 컷오프</div>
            </div>
            <div className="rounded-2xl border border-[#eadfce] bg-white/90 p-4 shadow-xs">
              <div className="text-2xl font-black text-[#0f766e]">5등급 ⟷ 9등급</div>
              <div className="mt-1 text-xs font-bold text-slate-600">개편안 자동 환산</div>
            </div>
            <div className="rounded-2xl border border-[#eadfce] bg-white/90 p-4 shadow-xs">
              <div className="text-2xl font-black text-[#1e5a84]">1·3·6개월</div>
              <div className="mt-1 text-xs font-bold text-slate-600">학원 컨설팅 연계</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 정교화된 4단계 마스터 플로우 */}
      <section id="flow" className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <span className="text-xs font-black tracking-widest text-[#8b1a1a]">
              THE 4-STEP MASTER JOURNEY
            </span>
            <h2 className="mt-2 text-2xl font-black text-[#1a0f08] sm:text-4xl">
              원스톱 입시 설계 플로우
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm font-semibold text-slate-600">
              학생부 입력부터 최적의 수시 지원 라인업까지, 빈틈없이 연결된 4단계 입시 내비게이션
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Step 1 */}
            <div className="relative flex flex-col justify-between rounded-3xl border border-[#eadfce] bg-white p-6 shadow-xs transition hover:shadow-md">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-xl bg-[#8b1a1a]/10 px-3 py-1 text-xs font-black text-[#8b1a1a]">
                    STEP 01
                  </span>
                  <FileText size={20} className="text-[#8b1a1a]" />
                </div>
                <h3 className="text-lg font-black text-[#1f1720]">학생부 업로드 & 등급 변환</h3>
                <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-600">
                  나이스 생활기록부 PDF 자동 추출 또는 성적 직접 입력. 2028 개편 5등급제를 9등급제로 실시간 자동 변환합니다.
                </p>
              </div>
              <Link
                href="/diagnosis/step1"
                className="mt-6 inline-flex items-center gap-1 text-xs font-black text-[#8b1a1a] hover:underline"
              >
                <span>Step 1 바로가기</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col justify-between rounded-3xl border border-[#eadfce] bg-white p-6 shadow-xs transition hover:shadow-md">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-xl bg-[#8b1a1a]/10 px-3 py-1 text-xs font-black text-[#8b1a1a]">
                    STEP 02
                  </span>
                  <Sparkles size={20} className="text-[#8b1a1a]" />
                </div>
                <h3 className="text-lg font-black text-[#1f1720]">학생부 AI 정밀 분석</h3>
                <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-600">
                  교과 성적 추이, 이수 과목 적합도, 세특 활동 키워드를 AI가 정밀 분석하여 학생의 강점과 보완점을 추출합니다.
                </p>
              </div>
              <Link
                href="/diagnosis/step2"
                className="mt-6 inline-flex items-center gap-1 text-xs font-black text-[#8b1a1a] hover:underline"
              >
                <span>Step 2 바로가기</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* Step 3 (핵심 정교화 강조) */}
            <div className="relative flex flex-col justify-between rounded-3xl border-2 border-[#8b1a1a] bg-[#fffaf4] p-6 shadow-sm transition hover:shadow-md">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-xl bg-[#8b1a1a] px-3 py-1 text-xs font-black text-white">
                    STEP 03 · 정교화
                  </span>
                  <BookOpen size={20} className="text-[#8b1a1a]" />
                </div>
                <h3 className="text-lg font-black text-[#1f1720]">독서 필수 연계 탐구 & 세특</h3>
                <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-700">
                  모든 탐구활동은 핵심 권장 도서 탐독에서 출발합니다. 도서의 학술 이론을 기반으로 심화 탐구 가설을 세우고, 도서명이 녹아든 나이스 세특 문장을 완성합니다.
                </p>
              </div>
              <Link
                href="/diagnosis/step3"
                className="mt-6 inline-flex items-center gap-1 text-xs font-black text-[#8b1a1a] hover:underline"
              >
                <span>Step 3 바로가기</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* Step 4 */}
            <div className="relative flex flex-col justify-between rounded-3xl border border-[#eadfce] bg-white p-6 shadow-xs transition hover:shadow-md">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-xl bg-[#8b1a1a]/10 px-3 py-1 text-xs font-black text-[#8b1a1a]">
                    STEP 04
                  </span>
                  <Compass size={20} className="text-[#8b1a1a]" />
                </div>
                <h3 className="text-lg font-black text-[#1f1720]">164개 대학 입시위치 진단</h3>
                <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-600">
                  26,295개 전형 컷오프를 기반으로 학생의 모의 합격 가능성을 상향·적정·안정으로 분류해 종합 리포트를 발행합니다.
                </p>
              </div>
              <Link
                href="/diagnosis/step4"
                className="mt-6 inline-flex items-center gap-1 text-xs font-black text-[#8b1a1a] hover:underline"
              >
                <span>Step 4 바로가기</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. B2B 학원 서비스 및 1·3·6개월 컨설팅 모델 안내 */}
      <section id="b2b" className="border-t border-[#eadfce] bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-3xl border border-[#eadfce] bg-gradient-to-br from-[#fffdfa] via-[#fcf8f2] to-[#f8f1e6] p-8 sm:p-12">
            <div className="max-w-3xl">
              <span className="rounded-full bg-[#1e5a84]/10 px-3.5 py-1 text-xs font-black text-[#1e5a84]">
                B2B ACADEMY SOLUTION
              </span>
              <h2 className="mt-3 text-2xl font-black text-[#1a0f08] sm:text-4xl">
                컨설턴트 앱 + 나의 입시멘토
                <br />
                학원 수강생을 위한 정기 입시 케어 서비스
              </h2>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-600">
                학생은 「나의 입시멘토」에서 자가진단과 활동 기록을 누적하고, 학원 원장과 전담 컨설턴트는 「컨설턴트 앱」에서 32자리 고유 코드로 연결되어 맞춤형 정기 지도를 진행합니다.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {/* 1개월 */}
              <div className="rounded-2xl border border-[#e4d6c3] bg-white p-5 shadow-xs">
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded-full bg-[#8b1a1a]/10 px-3 py-1 text-xs font-black text-[#8b1a1a]">
                    1개월 과정
                  </span>
                  <Clock size={16} className="text-[#8b1a1a]" />
                </div>
                <h4 className="text-base font-black text-[#1f1720]">속성 진단 코칭</h4>
                <p className="mt-1 text-xs font-semibold text-slate-600">
                  수시 원서 라인업 확정 및 생기부 5등급제 정밀 진단 1회 단기 집중
                </p>
                <ul className="mt-3 space-y-1 text-xs font-semibold text-slate-600">
                  <li>• 164개 대학 모의 합불 분석</li>
                  <li>• 수시 6개 대학 라인업 확정</li>
                  <li>• 1:1 대면/비대면 킥오프 컨설팅</li>
                </ul>
              </div>

              {/* 3개월 */}
              <div className="rounded-2xl border-2 border-[#1e5a84] bg-white p-5 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded-full bg-[#1e5a84] px-3 py-1 text-xs font-black text-white">
                    3개월 과정 · 추천
                  </span>
                  <Clock size={16} className="text-[#1e5a84]" />
                </div>
                <h4 className="text-base font-black text-[#1f1720]">학기 집중 관리</h4>
                <p className="mt-1 text-xs font-semibold text-slate-600">
                  중간·기말 내신 추이 반영 및 과목별 세특·연계 도서 탐구 첨삭
                </p>
                <ul className="mt-3 space-y-1 text-xs font-semibold text-slate-600">
                  <li>• 학기별 성적 추이 심층 분석</li>
                  <li>• 탐구보고서 첨삭 (월 2회)</li>
                  <li>• 나이스 기재용 세특 초안 검수</li>
                </ul>
              </div>

              {/* 6개월 */}
              <div className="rounded-2xl border border-[#e4d6c3] bg-white p-5 shadow-xs">
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded-full bg-[#d97706]/10 px-3 py-1 text-xs font-black text-[#d97706]">
                    6개월 과정
                  </span>
                  <Clock size={16} className="text-[#d97706]" />
                </div>
                <h4 className="text-base font-black text-[#1f1720]">수시 올인원 풀케어</h4>
                <p className="mt-1 text-xs font-semibold text-slate-600">
                  생활기록부 전 영역 상시 관리 및 모의 면접 대비 파이널 완성
                </p>
                <ul className="mt-3 space-y-1 text-xs font-semibold text-slate-600">
                  <li>• 생기부 전 영역(자·동·진·특) 코칭</li>
                  <li>• 최신 컷오프 기반 파이널 원서 전략</li>
                  <li>• 서류/제시문 기반 실전 모의 면접</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#e8dac8] pt-6">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <ShieldCheck size={16} className="text-[#0f766e]" />
                <span>학생 개인 계정 연결 코드는 암호화되어 안전하게 학원 컨설턴트에게만 공유됩니다.</span>
              </div>
              <Link
                href="/activities"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#1e5a84] px-4 py-2 text-xs font-black text-white transition hover:bg-[#154160]"
              >
                <span>학원 연결 코드 발급하기</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 최종 하단 전환 CTA */}
      <section className="border-t border-[#eadfce] bg-gradient-to-b from-[#fffaf4] to-[#f7eedf] py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-2xl font-black text-[#1a0f08] sm:text-4xl">
            합격을 완성하는 단 하나의 입시 파트너
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm font-semibold text-slate-600">
            지금 바로 나의 학생부를 분석하고, 2026/2027 맞춤형 탐구 주제와 합격선 진단을 확인하세요.
          </p>
          <div className="mt-8">
            <Link
              href="/diagnosis/step1"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#8b1a1a] px-8 py-4 text-base font-black text-white shadow-md transition hover:bg-[#721515] hover:shadow-lg"
            >
              <span>1단계 학생부 업로드부터 시작하기</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. 공식 푸터 */}
      <OfficialFooter />
    </div>
  );
}
