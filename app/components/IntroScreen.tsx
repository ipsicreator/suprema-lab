"use client";

import Image from "next/image";
import Link from "next/link";
import OfficialFooter from "./OfficialFooter";
import ProgramGuideTour from "./ProgramGuideTour";
import {
  Sparkles,
  BookOpen,
  Compass,
  FileText,
  ArrowRight,
  ShieldCheck,
  Users,
  ChevronRight,
  Clock,
  Check,
  Building2,
  MapPin,
  ExternalLink,
  Award,
} from "lucide-react";

export default function IntroScreen() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1a1a1a] selection:bg-[#7a1212] selection:text-white font-sans antialiased">
      {/* 1. 최상단 헤더 (첨부 시안 준수: 로고 + 대치 수프리마 대입전략연구소/나의 입시멘토 + 학원연결) */}
      <header className="sticky top-0 z-50 border-b border-[#e8dfd3] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/suprema-official-logo.png"
              alt="대치 수프리마 대입전략연구소"
              width={155}
              height={42}
              priority
              className="h-9 w-auto object-contain"
            />
            <div className="border-l border-[#d8c8b4] pl-3">
              <span className="block text-[11px] font-black tracking-wider text-[#8b1a1a]">
                대치 수프리마 대입전략연구소
              </span>
              <span className="block text-sm font-extrabold text-[#2a1b12]">
                나의 입시멘토
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2.5">
            <a
              href="#program-tour"
              className="rounded-xl border border-[#8b1a1a]/30 bg-[#8b1a1a]/5 px-3.5 py-1.5 text-xs font-bold text-[#8b1a1a] shadow-2xs transition hover:bg-[#8b1a1a] hover:text-white"
            >
              🌟 프로그램 소개 (9대 핵심 가이드)
            </a>
            <Link
              href="/activities"
              className="rounded-xl border border-[#d8c7b2] bg-white px-4 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-[#8b1a1a] hover:text-[#8b1a1a]"
            >
              학원연결
            </Link>
          </div>
        </div>
      </header>

      {/* 2. 히어로 섹션 (첨부 시안 100% 충실 반영) */}
      <section className="relative overflow-hidden border-b border-[#ebdcca] bg-gradient-to-b from-[#fffefc] via-[#fbf7f0] to-[#f6efe4] pt-14 pb-16 sm:pt-20 sm:pb-24">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          {/* 상단 뱃지: 2026 · 2027 · 2028 수시 올인원 AI 진단 솔루션 */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e4d4bf] bg-white/90 px-4 py-1.5 shadow-2xs backdrop-blur-sm">
            <Sparkles size={14} className="text-[#8b1a1a]" />
            <span className="text-xs font-black tracking-wide text-[#8b1a1a]">
              2026 · 2027 · 2028 수시 올인원 AI 진단 솔루션
            </span>
          </div>

          {/* 메인 헤드라인: AI Mentor와 함께하는 학생부 탐구·세특 Maker */}
          <div className="mt-2">
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1a1a1a]">
              AI Mentor와 함께하는
            </p>
            <h1 className="mt-2 text-4xl sm:text-6xl lg:text-[62px] font-black tracking-tight text-[#1a1a1a]">
              학생부 탐구·세특 Maker
            </h1>
          </div>

          {/* 대표님 철학 슬로건 */}
          <p className="mx-auto mt-6 max-w-4xl text-base sm:text-xl font-extrabold text-[#222222] tracking-tight break-keep">
            나의 입시 멘토 “생각이 있으면, 방법은 따라 옵니다” 정교한 시스템으로, 따라만 해도 완성되는 학생부.
          </p>

          {/* 설명 문구 (2단 줄바꿈 완벽 적용) */}
          <div className="mx-auto mt-6 max-w-3xl text-xs sm:text-sm font-semibold leading-relaxed text-[#4b5563] break-keep">
            <p>
              2028 대입 개편 <strong>5등급제·9등급제 자동 환산</strong>과 전국 <strong>164개 대학 26,295개 전형</strong> 최신 컷오프를 탑재
            </p>
            <p className="mt-1">
              하여, 학생부 정밀 분석부터 나이스 기재용 세특 문장과 연계 추천 도서까지 한 번에 완성합니다.
            </p>
          </div>

          {/* CTA 버튼 컨테이너 (첨부 시안의 연한 박스 + 초록색 [AI Mentor 시작하기] 버튼) */}
          <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-[#e6dbc9] bg-white/70 p-4 shadow-2xs backdrop-blur-xs">
            <Link
              href="/diagnosis/step1"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#6ca94c] to-[#4e8d30] px-12 py-3.5 text-base sm:text-lg font-black text-white shadow-md shadow-emerald-950/20 transition-all hover:scale-102 hover:from-[#629d44] hover:to-[#447d2a] hover:shadow-lg"
            >
              <span>AI Mentor 시작하기</span>
            </Link>
          </div>

          {/* 4대 핵심 지표 카드 (첨부 시안과 색상/텍스트 100% 일치) */}
          <div className="mt-12 grid grid-cols-2 gap-3.5 sm:grid-cols-4 sm:gap-4 text-center">
            {/* 카드 1 */}
            <div className="rounded-2xl border border-[#e8decb] bg-white p-5 shadow-2xs">
              <div className="text-2xl sm:text-3xl font-black text-[#8b1a1a]">
                164개
              </div>
              <div className="mt-1.5 text-xs font-extrabold text-slate-700">
                전국 주요대학 DB
              </div>
            </div>

            {/* 카드 2 */}
            <div className="rounded-2xl border border-[#e8decb] bg-white p-5 shadow-2xs">
              <div className="text-2xl sm:text-3xl font-black text-[#8b1a1a]">
                26,295개
              </div>
              <div className="mt-1.5 text-xs font-extrabold text-slate-700">
                수시 전형 컷오프
              </div>
            </div>

            {/* 카드 3 */}
            <div className="rounded-2xl border border-[#e8decb] bg-white p-5 shadow-2xs">
              <div className="text-xl sm:text-2xl font-black text-[#0e7070]">
                5등급 ⟷ 9등급
              </div>
              <div className="mt-1.5 text-xs font-extrabold text-slate-700">
                개편안 자동 환산
              </div>
            </div>

            {/* 카드 4 */}
            <div className="rounded-2xl border border-[#e8decb] bg-white p-5 shadow-2xs">
              <div className="text-xl sm:text-2xl font-black text-[#1a1a1a]">
                6개월(학기별)
              </div>
              <div className="mt-1.5 text-xs font-extrabold text-slate-700">
                연계학원관리
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2.5 [신규 탑재] 「나의 입시멘토」 9단계 비주얼 프로그램 소개 투어 */}
      <div id="program-tour">
        <ProgramGuideTour />
      </div>

      {/* 3. 대치 수프리마 대입전략연구소 소개 & 3대 철학 */}
      <section id="about" className="border-b border-[#e9dfd2] bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <span className="rounded-full bg-[#8b1a1a]/10 px-4 py-1 text-xs font-black text-[#8b1a1a]">
              ABOUT DAECHI SUPRIMA · 연구소 소개
            </span>
            <h2 className="mt-3 text-2xl font-black text-[#1a0f08] sm:text-4xl break-keep">
              입시는 막연한 ‘감’이 아닌, 오차 없는 체계와 방법입니다
            </h2>
            <p className="mx-auto mt-2.5 max-w-2xl text-sm sm:text-base font-semibold leading-relaxed text-slate-600 break-keep">
              대치수프리마 대입전략연구소는 강남 대치동 최전선에서 수많은 최상위권 학생들의 수시 합격 로드맵을 구축해 온 실전 컨설팅 노하우를 가장 정밀한 디지털 입시 솔루션으로 구현합니다.
            </p>
          </div>

          <div className="mt-12 rounded-3xl border border-[#ebdcca] bg-gradient-to-br from-[#fffdfa] via-[#fbf7f0] to-[#f7eee2] p-8 sm:p-10 shadow-2xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-[#e8d9c5] pb-8">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#8b1a1a] text-white shadow-md shadow-red-950/20">
                  <Award size={32} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black tracking-wider text-[#8b1a1a] uppercase">
                      HEAD CONSULTANT & FOUNDER
                    </span>
                    <span className="rounded-full bg-[#8b1a1a]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#8b1a1a]">
                      대치 본원
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#1a0f08]">
                    이기욱 대표컨설턴트
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-0.5">
                    대치수프리마 입시&코칭센터 · 대입전략연구소 대표
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs font-bold text-slate-700">
                <div className="flex items-center gap-1.5 rounded-xl border border-[#dfceba] bg-white px-3.5 py-2 shadow-2xs">
                  <MapPin size={15} className="text-[#8b1a1a]" />
                  <span>서울시 강남구 테헤란로 326 B1F</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-xl border border-[#dfceba] bg-white px-3.5 py-2 shadow-2xs">
                  <Building2 size={15} className="text-[#8b1a1a]" />
                  <span>대치수프리마 대입전략연구소</span>
                </div>
              </div>
            </div>

            {/* 3대 핵심 철학 카드 */}
            <div className="mt-8">
              <div className="text-center mb-6">
                <span className="text-xs font-extrabold tracking-widest text-[#8a725f] uppercase">
                  OUR PHILOSOPHY & VALUES
                </span>
                <h4 className="text-lg sm:text-xl font-black text-[#1a0f08] mt-1">
                  「나의 입시멘토」를 관통하는 3대 핵심 철학
                </h4>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {/* 1. 정교한 시스템으로 */}
                <div className="rounded-2xl border border-[#e5d6c2] bg-white p-6 shadow-2xs">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#8b1a1a] text-xs font-black text-white">
                      1
                    </span>
                    <h5 className="text-base font-black text-[#1a0f08]">
                      “정교한 시스템으로”
                    </h5>
                  </div>
                  <p className="text-xs font-bold text-[#8b1a1a] mb-2">
                    입시는 막연한 '감'이나 '운'이 아닙니다.
                  </p>
                  <p className="text-xs font-semibold leading-relaxed text-slate-600 break-keep">
                    전국 164개 대학 입결 데이터와 카카오 도서 DB, AI 엔진이 결합된 <strong>‘오차 없는 탄탄한 설계 인프라’</strong>가 학생 뒤를 든든하게 받치고 있다는 전문성의 선언입니다.
                  </p>
                </div>

                {/* 2. 따라만 해도 */}
                <div className="rounded-2xl border-2 border-[#8b1a1a] bg-[#fffaf5] p-6 shadow-xs relative">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#8b1a1a] text-xs font-black text-white">
                      2
                    </span>
                    <h5 className="text-base font-black text-[#8b1a1a]">
                      “따라만 해도”
                    </h5>
                  </div>
                  <p className="text-xs font-bold text-[#8b1a1a] mb-2">
                    학부모와 학생의 가장 큰 고통은 ‘막막함’입니다.
                  </p>
                  <p className="text-xs font-semibold leading-relaxed text-slate-700 break-keep">
                    고민할 필요 없이 시스템이 이끄는 4단계(분석 ➔ 가설 ➔ 독서·세특 ➔ 대학 진단)를 물 흐르듯 따라가기만 하면 <strong>최고 수준의 완성본이 손에 쥐어지는 극도의 실행력</strong>을 뜻합니다.
                  </p>
                </div>

                {/* 3. 생각이 있으면 방법은 따라온다 */}
                <div className="rounded-2xl border border-[#e5d6c2] bg-white p-6 shadow-2xs">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#8b1a1a] text-xs font-black text-white">
                      3
                    </span>
                    <h5 className="text-base font-black text-[#1a0f08]">
                      “생각이 있으면 방법은 따라온다”
                    </h5>
                  </div>
                  <p className="text-xs font-bold text-[#8b1a1a] mb-2">
                    과장 광고가 아닌 실질적 해결책의 약속입니다.
                  </p>
                  <p className="text-xs font-semibold leading-relaxed text-slate-600 break-keep">
                    ‘합격’이라는 결과론적 과장 광고가 아니라, 학생이 가진 작은 호기심과 고민(생각)만 가져오면 그것을 완벽한 세특과 탐구로 만들어내는 <strong>실질적 해결책(방법)을 시스템이 반드시 찾아준다</strong>는 본질적 가치입니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 공식 연구소 소통 채널 바로가기 */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#e8d9c5] pt-6">
              <span className="text-xs font-extrabold text-slate-700">
                대치수프리마 공식 연구소 소통 채널
              </span>
              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href="https://band.us/@suprima"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#d8c8b4] bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-[#8b1a1a] hover:text-[#8b1a1a]"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>네이버 밴드</span>
                  <ExternalLink size={12} />
                </a>
                <a
                  href="https://blog.naver.com/gouniv_hifive"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#d8c8b4] bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-[#8b1a1a] hover:text-[#8b1a1a]"
                >
                  <span className="h-2 w-2 rounded-full bg-[#03c75a]" />
                  <span>공식 블로그</span>
                  <ExternalLink size={12} />
                </a>
                <a
                  href="https://instagram.com/suprima_ipsicreator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#d8c8b4] bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-[#8b1a1a] hover:text-[#8b1a1a]"
                >
                  <span className="h-2 w-2 rounded-full bg-pink-500" />
                  <span>인스타그램</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 4단계 진단 프로세스 가이드 */}
      <section id="flow" className="py-16 sm:py-24 bg-[#fbf9f6] border-b border-[#ebdcca]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <span className="text-xs font-black tracking-widest text-[#8b1a1a]">
              THE 4-STEP MASTER JOURNEY
            </span>
            <h2 className="mt-2 text-2xl font-black text-[#1a0f08] sm:text-4xl">
              원스톱 입시 설계 4단계 플로우
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm font-semibold text-slate-600 break-keep">
              학생부 등록부터 최적의 수시 지원 라인업까지, 유기적으로 연결된 정밀 입시 내비게이션
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Step 1 */}
            <div className="relative flex flex-col justify-between rounded-3xl border border-[#e8dfd3] bg-white p-6 shadow-2xs transition hover:shadow-md">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-xl bg-[#8b1a1a]/10 px-3 py-1 text-xs font-black text-[#8b1a1a]">
                    STEP 01
                  </span>
                  <FileText size={20} className="text-[#8b1a1a]" />
                </div>
                <h3 className="text-lg font-black text-[#1a0f08]">학생부 간편 등록 & 환산</h3>
                <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-600 break-keep">
                  나이스 10초 간편인증 연동 또는 정부24 PDF 직접 등록. 2028 개편 5등급제를 9등급제로 실시간 자동 변환합니다.
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
            <div className="relative flex flex-col justify-between rounded-3xl border border-[#e8dfd3] bg-white p-6 shadow-2xs transition hover:shadow-md">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-xl bg-[#8b1a1a]/10 px-3 py-1 text-xs font-black text-[#8b1a1a]">
                    STEP 02
                  </span>
                  <Sparkles size={20} className="text-[#8b1a1a]" />
                </div>
                <h3 className="text-lg font-black text-[#1a0f08]">학생부 AI 정밀 분석</h3>
                <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-600 break-keep">
                  교과 성적 추이, 이수 과목 적합도, 세특 활동 키워드를 AI가 정밀 분석하여 학생의 전공 경쟁력을 도출합니다.
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

            {/* Step 3 */}
            <div className="relative flex flex-col justify-between rounded-3xl border-2 border-[#8b1a1a] bg-[#fffaf4] p-6 shadow-sm transition hover:shadow-md">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-xl bg-[#8b1a1a] px-3 py-1 text-xs font-black text-white">
                    STEP 03 · 핵심
                  </span>
                  <BookOpen size={20} className="text-[#8b1a1a]" />
                </div>
                <h3 className="text-lg font-black text-[#1a0f08]">독서 연계 탐구 & 세특</h3>
                <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-700 break-keep">
                  모든 탐구는 필독서에서 출발합니다. 카카오 도서 DB와 AI가 도서명과 핵심 이론이 녹아든 완성형 세특 문장을 작성합니다.
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
            <div className="relative flex flex-col justify-between rounded-3xl border border-[#e8dfd3] bg-white p-6 shadow-2xs transition hover:shadow-md">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-xl bg-[#8b1a1a]/10 px-3 py-1 text-xs font-black text-[#8b1a1a]">
                    STEP 04
                  </span>
                  <Compass size={20} className="text-[#8b1a1a]" />
                </div>
                <h3 className="text-lg font-black text-[#1a0f08]">164개 대학 위치 진단</h3>
                <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-600 break-keep">
                  26,295개 수시 전형 컷오프를 바탕으로 학생의 모의 지원 가능성을 상향·적정·안정으로 분류해 종합 리포트를 발행합니다.
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

      {/* 5. B2B 학원 솔루션 및 학기제 관리형 컨설팅 모델 (~8월/~2월 종료 기준) */}
      <section id="b2b" className="bg-white py-16 sm:py-24 border-b border-[#ebdcca]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-3xl border border-[#eadfce] bg-gradient-to-br from-[#fffdfa] via-[#fcf8f2] to-[#f8f1e6] p-8 sm:p-12 shadow-sm">
            <div className="max-w-3xl">
              <span className="rounded-full bg-[#1e5a84]/10 px-3.5 py-1 text-xs font-black text-[#1e5a84]">
                B2B ACADEMY SOLUTION
              </span>
              <h2 className="mt-3 text-2xl font-black text-[#1a0f08] sm:text-4xl">
                컨설턴트 앱 + 나의 입시멘토
                <br />
                학원 수강생을 위한 1개 학기 단위 밀착 입시 관리
              </h2>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-600 break-keep">
                고교 학사 일정에 맞추어 <strong>~8월(1학기 마감) 및 ~2월(2학기/학년말 마감)</strong> 종료 시점을 기준으로 잔여 개월 수를 유연하게 계산(종료시점 - 가입시점)하여 학원별 맞춤 관리를 지원합니다.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {/* 1개월 */}
              <div className="rounded-2xl border border-[#e4d6c3] bg-white p-5 shadow-2xs">
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded-full bg-[#8b1a1a]/10 px-3 py-1 text-xs font-black text-[#8b1a1a]">
                    수시 직전 (1개월)
                  </span>
                  <Clock size={16} className="text-[#8b1a1a]" />
                </div>
                <h4 className="text-base font-black text-[#1a0f08]">단기 속성 진단</h4>
                <p className="mt-1 text-xs font-semibold text-slate-600">
                  수시 원서 접수 직전 6개 대학 파이널 라인업 확정
                </p>
                <ul className="mt-3 space-y-1.5 text-xs font-semibold text-slate-600">
                  <li className="flex items-center gap-1.5"><Check size={13} className="text-emerald-600" /> 164개 대학 모의 지원선 분석</li>
                  <li className="flex items-center gap-1.5"><Check size={13} className="text-emerald-600" /> 수시 6개 대학 최적 라인업 제안</li>
                  <li className="flex items-center gap-1.5"><Check size={13} className="text-emerald-600" /> 1:1 대면/비대면 킥오프 컨설팅</li>
                </ul>
              </div>

              {/* 3~4개월 */}
              <div className="rounded-2xl border-2 border-[#1e5a84] bg-white p-5 shadow-2xs relative">
                <div className="absolute -top-3 right-4 rounded-full bg-[#1e5a84] px-2.5 py-0.5 text-[10px] font-black text-white">
                  가장 추천
                </div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded-full bg-[#1e5a84] px-3 py-1 text-xs font-black text-white">
                    학기 집중 (3~4개월)
                  </span>
                  <Clock size={16} className="text-[#1e5a84]" />
                </div>
                <h4 className="text-base font-black text-[#1a0f08]">학기 집중 케어</h4>
                <p className="mt-1 text-xs font-semibold text-slate-600">
                  5월 가입 ➔ 8월 종료 / 12월 가입 ➔ 2월 종료
                </p>
                <ul className="mt-3 space-y-1.5 text-xs font-semibold text-slate-600">
                  <li className="flex items-center gap-1.5"><Check size={13} className="text-emerald-600" /> 시험 직후 집중 탐구활동 설계 (월 2회)</li>
                  <li className="flex items-center gap-1.5"><Check size={13} className="text-emerald-600" /> 카카오 도서 DB 연계 심화 탐구</li>
                  <li className="flex items-center gap-1.5"><Check size={13} className="text-emerald-600" /> 나이스 마감 대비 3단계 세특 문장 검수</li>
                </ul>
              </div>

              {/* 6개월 */}
              <div className="rounded-2xl border border-[#e4d6c3] bg-white p-5 shadow-2xs">
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded-full bg-[#d97706]/10 px-3 py-1 text-xs font-black text-[#d97706]">
                    학기 풀코스 (6개월)
                  </span>
                  <Clock size={16} className="text-[#d97706]" />
                </div>
                <h4 className="text-base font-black text-[#1a0f08]">수시 올인원 풀케어</h4>
                <p className="mt-1 text-xs font-semibold text-slate-600">
                  3월 가입 ➔ 8월 종료 / 9월 가입 ➔ 2월 종료
                </p>
                <ul className="mt-3 space-y-1.5 text-xs font-semibold text-slate-600">
                  <li className="flex items-center gap-1.5"><Check size={13} className="text-emerald-600" /> 생기부 전 영역(자·동·진·특) 상시 코칭</li>
                  <li className="flex items-center gap-1.5"><Check size={13} className="text-emerald-600" /> 최신 컷오프 기반 파이널 원서 전략</li>
                  <li className="flex items-center gap-1.5"><Check size={13} className="text-emerald-600" /> 서류/제시문 기반 실전 모의 면접</li>
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

      {/* 6. 최종 하단 전환 CTA */}
      <section className="bg-gradient-to-b from-[#fffefc] to-[#f7eedf] py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="mb-3 inline-block rounded-full bg-[#8b1a1a]/10 px-3.5 py-1 text-xs font-black text-[#8b1a1a]">
            대치 수프리마 「나의 입시멘토」
          </div>
          <h2 className="text-2xl font-black text-[#1a0f08] sm:text-4xl break-keep">
            나만의 학생부 경쟁력을 완성하는 입시 파트너
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm font-semibold text-slate-600 break-keep">
            학생부를 정밀 분석하고, 맞춤형 탐구 가설과 세특 문장, 164개 대학 입시 위치 진단을 확인하세요.
          </p>
          <div className="mt-8">
            <Link
              href="/diagnosis/step1"
              className="group inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#8b1a1a] via-[#a01c1c] to-[#751313] px-8 py-4 text-base font-black text-white shadow-md shadow-red-950/20 transition-all hover:scale-102 hover:shadow-lg"
            >
              <span>1단계 학생부 업로드부터 시작하기</span>
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. 전사 공식 풋터 */}
      <OfficialFooter />
    </div>
  );
}
