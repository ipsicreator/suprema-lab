"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Target,
  BookOpen,
  ClipboardList,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Award,
  Layers,
  BarChart3,
  Mail,
  Printer,
  ShieldCheck,
  TrendingUp,
  School,
  UserCheck,
  Cpu,
  Compass,
  FileCheck,
  Zap,
  GraduationCap,
  HeartHandshake,
  DollarSign,
  Clock,
  Flame,
  Check,
} from "lucide-react";

export default function ProgramGuideTour() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const slides = [
    {
      id: "slide-1",
      badge: "01 · 시스템 소개",
      title: "대치동 1:1 대입 연구소를 내 손안에",
      subtitle: "학생용 자가진단 웹과 학원용 컨설턴트 앱이 결합된 대한민국 표준 올인원 입시 솔루션",
      theme: "burgundy",
      icon: <Award className="w-6 h-6 text-[#8b1a1a]" />,
      content: (
        <div className="grid gap-6 md:grid-cols-2 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#8b1a1a]/10 px-3.5 py-1 text-xs font-black text-[#8b1a1a]">
              <Sparkles size={13} /> 대치 수프리마 3대 브랜드 철학
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#1a0f08] leading-tight">
              “생각이 있으면, 방법은 따라옵니다.”<br />
              <span className="text-[#8b1a1a]">정교한 시스템으로 따라만 해도 완성되는 학생부</span>
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed break-keep">
              대치수프리마 「나의 입시멘토」는 수십~수백만 원을 호가하던 대치동 1:1 대면 컨설팅의 실전 노하우를 전국 164개 대학 입결 DB와 AI 기술로 완벽히 디지털화한 국내 유일의 올인원 입시 솔루션입니다.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl border border-[#ebdcca] bg-white p-3 shadow-2xs">
                <span className="text-xs font-black text-[#8b1a1a] block mb-1">📱 학생 & 학부모용</span>
                <p className="text-[11px] font-bold text-slate-600">나이스 10초 간편 연동, 4단계 세특 완성, 6개 대학 실시간 합격선 산출</p>
              </div>
              <div className="rounded-xl border border-[#ebdcca] bg-white p-3 shadow-2xs">
                <span className="text-xs font-black text-[#1e40af] block mb-1">🏛️ 학원 & 컨설턴트용</span>
                <p className="text-[11px] font-bold text-slate-600">주차별 플래너, 학교 퀘스트 피드백, 월간 보고서 A4출력 & 학부모 메일링</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-[#eadfcf] bg-gradient-to-br from-[#fffdfa] via-[#faf4eb] to-[#f4e9db] p-5 shadow-inner space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#e5d5c0] pb-2">
              <span className="font-extrabold text-[#2a1b12]">⚡ 시스템 핵심 인프라 스펙</span>
              <span className="font-black text-[#8b1a1a]">Official Live</span>
            </div>
            <ul className="space-y-2 text-slate-700 font-semibold">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>전국 164개 4년제 대학 · 26,295개 수시 전형</strong> 3개년 실제 컷오프 알고리즘</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>2028 개편 5등급제 ⟷ 현행 9등급제</strong> 실시간 양방향 자동 변환 엔진</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>수프리마랩 공식 도서 DB 연동</strong> 기반 교과 연계 필독서 100% 실명 매칭</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>교육부 NEIS 기재 규정</strong>(금지어 필터링, 동기-과정-변화) 3단계 완성형 문장</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "slide-2",
      badge: "02 · 왜 지금인가?",
      title: "2028 내신 5등급제 개편, 왜 세특과 독서인가?",
      subtitle: "1등급 비율 4% ➔ 10% 확대! 순수 내신 점수만으로는 상위권 대학에 갈 수 없습니다.",
      theme: "amber",
      icon: <TrendingUp className="w-6 h-6 text-amber-700" />,
      content: (
        <div className="space-y-4 text-xs sm:text-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4.5 space-y-2">
              <span className="rounded-md bg-red-600 px-2.5 py-0.5 text-[11px] font-black text-white">변화 1</span>
              <h4 className="font-black text-[#1a0f08] text-sm">내신 1등급 인플레 발생</h4>
              <p className="text-slate-600 font-semibold leading-relaxed text-xs">
                1등급이 10%로 대폭 늘어나며 주요 상위권 대학들은 학생부종합전형은 물론 교과전형에서도 <strong>‘교과 정성평가(세특)’</strong>를 의무 반영합니다.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4.5 space-y-2">
              <span className="rounded-md bg-amber-600 px-2.5 py-0.5 text-[11px] font-black text-white">변화 2</span>
              <h4 className="font-black text-[#1a0f08] text-sm">일반 챗GPT의 한계</h4>
              <p className="text-slate-600 font-semibold leading-relaxed text-xs">
                일반 AI는 나이스 기재 금지어를 알지 못해 허위 문장(할루시네이션)을 양산하며, 실제 대학 합불 컷오프를 전혀 계산할 수 없습니다.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4.5 space-y-2">
              <span className="rounded-md bg-emerald-600 px-2.5 py-0.5 text-[11px] font-black text-white">대치수프리마 해법</span>
              <h4 className="font-black text-[#1a0f08] text-sm">검증된 컷오프와 수프리마랩 도서 DB</h4>
              <p className="text-slate-600 font-semibold leading-relaxed text-xs">
                실제 합격선 컷오프와 수프리마랩 공식 입시 도서 데이터베이스를 결합하여, 대학 입학사정관이 신뢰하는 공신력 있는 포트폴리오를 도출합니다.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-[#ebdcca] bg-white p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-slate-700">
            <span className="text-[#8b1a1a]">📌 결론: 이제 입시의 승패는 "어떤 책을 읽고, 어떤 가설로 깊이 있게 탐구했는가"에서 결정됩니다.</span>
            <span className="rounded-lg bg-slate-100 px-3 py-1 text-slate-600">대치동 입시 1번지 검증 공식</span>
          </div>
        </div>
      ),
    },
    {
      id: "slide-3",
      badge: "03 · 핵심 매칭 아키텍처",
      title: "키워드 ➔ 과목 ➔ 탐구 가설 ➔ 수프리마랩 도서 세특",
      subtitle: "교과 개념을 대학이 주목하는 탐구 질문으로 바꾸는 시각적 연결 파이프라인 (핵심 엔진)",
      theme: "blue",
      icon: <Layers className="w-6 h-6 text-blue-700" />,
      content: (
        <div className="space-y-3.5">
          {/* 4단계 가로 프로세스 바 */}
          <div className="grid gap-2.5 sm:grid-cols-4">
            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-center space-y-1">
              <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-100 px-2 py-0.5 rounded">STEP 01</span>
              <h4 className="font-black text-slate-900 text-xs sm:text-sm">1. 관심 키워드</h4>
              <p className="text-[10.5px] font-semibold text-slate-600">진로·관심사에서 1~3개 핵심 키워드 추출</p>
              <span className="inline-block text-[10px] font-extrabold text-blue-800 bg-white px-2 py-0.5 rounded-full border border-blue-200">미세플라스틱, AI윤리</span>
            </div>
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-3 text-center space-y-1">
              <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">STEP 02</span>
              <h4 className="font-black text-slate-900 text-xs sm:text-sm">2. 교과목 & 수준 매핑</h4>
              <p className="text-[10.5px] font-semibold text-slate-600">국·수·영·사·과·정보 × 6단계 심화 사다리</p>
              <span className="inline-block text-[10px] font-extrabold text-indigo-800 bg-white px-2 py-0.5 rounded-full border border-indigo-200">기초·개념·심화·융합·연구·도구</span>
            </div>
            <div className="rounded-xl border border-purple-200 bg-purple-50/70 p-3 text-center space-y-1">
              <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-100 px-2 py-0.5 rounded">STEP 03</span>
              <h4 className="font-black text-slate-900 text-xs sm:text-sm">3. 연구 가설 도출</h4>
              <p className="text-[10.5px] font-semibold text-slate-600">변인 통제 기반 구체적 연구 질문 확립</p>
              <span className="inline-block text-[10px] font-extrabold text-purple-800 bg-white px-2 py-0.5 rounded-full border border-purple-200">독립변인 vs 측정 종속변인</span>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-center space-y-1">
              <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">STEP 04</span>
              <h4 className="font-black text-slate-900 text-xs sm:text-sm">4. 도서 & 3단계 세특</h4>
              <p className="text-[10.5px] font-semibold text-slate-600">수프리마랩 도서 DB 실명 매칭 및 세특 완성</p>
              <span className="inline-block text-[10px] font-extrabold text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-200">동기 ➔ 과정 ➔ 성장변화</span>
            </div>
          </div>

          {/* 실제 교과별 세부 매칭 실증 사례 3선 */}
          <div className="rounded-2xl border border-[#ebdcca] bg-white p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="font-black text-[#8b1a1a]">실제 교과별 세부 매칭 실증 사례 (3대 핵심 교과)</span>
              <span className="text-[11px] font-bold text-slate-500">10초 만에 도출되는 고품격 탐구안</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-3 text-[11px]">
              <div className="rounded-lg bg-blue-50/50 p-2.5 border border-blue-100 space-y-1">
                <strong className="text-blue-900 block font-bold">🧪 과학(화학Ⅰ): 미세플라스틱 키워드</strong>
                <p className="text-slate-600 leading-tight"><strong>가설:</strong> 키토산 바이오필터 소재의 흡착 효율 비교 실험</p>
                <p className="text-slate-800 font-bold">📖 필독서: 《침묵의 봄》 (레이첼 카슨)</p>
              </div>
              <div className="rounded-lg bg-purple-50/50 p-2.5 border border-purple-100 space-y-1">
                <strong className="text-purple-900 block font-bold">⚖️ 사회(통합사회): 기후불평등 키워드</strong>
                <p className="text-slate-600 leading-tight"><strong>가설:</strong> 탄소국경세 도입이 개도국에 미치는 영향과 정의로운 전환</p>
                <p className="text-slate-800 font-bold">📖 필독서: 《정의란 무엇인가》 (마이클 샌델)</p>
              </div>
              <div className="rounded-lg bg-emerald-50/50 p-2.5 border border-emerald-100 space-y-1">
                <strong className="text-emerald-900 block font-bold">🤖 정보(인공지능): NLP 감성분석 키워드</strong>
                <p className="text-slate-600 leading-tight"><strong>가설:</strong> BERT 모델을 활용한 소셜 빅데이터 감성 어휘 사전 구축</p>
                <p className="text-slate-800 font-bold">📖 필독서: 《인공지능의 충격》 (현대지성)</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "slide-4",
      badge: "04 · 학생 주도 퀘스트 & 넛지",
      title: "1순위 학생 주도 등록 ➔ 시스템 자동 재촉(Nudge)",
      subtitle: "학생이 학교 일정의 주인이 되고, 시스템이 마감 잔소리를 100% 대행합니다.",
      theme: "teal",
      icon: <Target className="w-6 h-6 text-teal-700" />,
      content: (
        <div className="grid gap-6 md:grid-cols-2 items-center text-xs sm:text-sm">
          <div className="space-y-3">
            <h4 className="font-black text-slate-900 text-base">
              학생은 주도적으로 참여하고,<br />
              <span className="text-teal-700">선생님은 일정 챙기는 잔소리에서 해방됩니다.</span>
            </h4>
            <ul className="space-y-2 text-slate-600 font-semibold text-xs">
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-black shrink-0">1.</span>
                <span><strong>1순위 학생 등록</strong>: 학교 시험범위, 수행평가 주제, 자기평가서 마감일을 스마트폰으로 30초 등록</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-black shrink-0">2.</span>
                <span><strong>D-3, D-Day 자동 넛지</strong>: 안 적거나 마감이 임박한 학생에게 알림톡/문자로 자동 독려 발송</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-600 font-black shrink-0">3.</span>
                <span><strong>2순위 컨설턴트 보완</strong>: 발화성 없는 학생은 컨설턴트 화면에서 10초 만에 보완 입력 지원</span>
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-4.5 space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-teal-200 pb-2">
              <span className="font-extrabold text-teal-900">🔔 지능형 넛지(Nudge) 라이프사이클</span>
              <span className="font-bold text-teal-700 text-[11px]">자동 발송</span>
            </div>
            <div className="space-y-2 text-slate-700">
              <div className="rounded-lg bg-white p-2.5 border border-teal-100">
                <strong className="text-teal-800 text-[11px]">D-3일 전 부드러운 알림:</strong>
                <p className="text-[11px] text-slate-500 mt-0.5">“OO 학생, 이달의 수행평가 마감이 3일 남았습니다. 선생님의 추천도서 피드백을 확인하세요!”</p>
              </div>
              <div className="rounded-lg bg-white p-2.5 border border-teal-100">
                <strong className="text-red-700 text-[11px]">D-Day 오늘 마감 긴급 알럿:</strong>
                <p className="text-[11px] text-slate-500 mt-0.5">“🚨 [오늘 마감] 오늘 밤 12시까지 완료 체크해야 이달 월간 보고서에 100% 반영됩니다!”</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "slide-5",
      badge: "05 · 학생 그레이트 베네핏",
      title: "막막함은 제로! 자신감과 합격률은 최고치로",
      subtitle: "고민할 시간에 시스템을 따라가면 대치동 최상위권 생기부가 손에 쥐어집니다.",
      theme: "blue",
      icon: <GraduationCap className="w-6 h-6 text-blue-700" />,
      content: (
        <div className="space-y-3.5 text-xs sm:text-sm">
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div className="rounded-2xl border border-blue-200 bg-white p-4.5 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-blue-700 font-black text-sm">
                <Flame size={16} /> 1. 수행평가 & 세특 막막함 100% 해소
              </div>
              <p className="text-slate-600 font-semibold text-xs leading-relaxed">
                "선생님이 세특 써오라는데 도대체 뭘 써야 할지 모르겠어요" ➔ 학교 과제 주제만 넣으면 수프리마랩 추천 도서와 3단계 완성형 문장이 10초 만에 도출됩니다.
              </p>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-white p-4.5 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-blue-700 font-black text-sm">
                <Target size={16} /> 2. 미루지 않는 자기주도 학습 습관 형성
              </div>
              <p className="text-slate-600 font-semibold text-xs leading-relaxed">
                스스로 시험범위와 수행평가 퀘스트를 올리고, 시스템의 D-Day 카운트다운과 자동 넛지(Nudge) 덕분에 벼락치기 없이 제때 완수하는 성취감을 얻습니다.
              </p>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-white p-4.5 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-blue-700 font-black text-sm">
                <BookOpen size={16} /> 3. 독서와 탐구가 자연스럽게 엮인 명품 생기부
              </div>
              <p className="text-slate-600 font-semibold text-xs leading-relaxed">
                단순 암기형 학생이 아닌, 책의 핵심 이론을 바탕으로 연구 가설을 세우고 실험한 '지적 탐구 역량'이 입학사정관에게 강력하게 어필됩니다.
              </p>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-white p-4.5 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-blue-700 font-black text-sm">
                <BarChart3 size={16} /> 4. 전국 164개 대학 내 실시간 위치 파악
              </div>
              <p className="text-slate-600 font-semibold text-xs leading-relaxed">
                내신 등급뿐만 아니라 26,295개 전형 컷오프를 비교하여 수시 6개 대학(상향·적정·안정) 최적 지원선이 손에 잡히므로 학습 동기가 폭발합니다.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "slide-6",
      badge: "06 · 학원 그레이트 베네핏",
      title: "재원생 이탈 0% & 강사 피로도 90% 절감",
      subtitle: "단 하루 만에 원내에 대치동 1:1 대입 전략 연구소를 구축하는 효과를 누립니다.",
      theme: "burgundy",
      icon: <School className="w-6 h-6 text-[#8b1a1a]" />,
      content: (
        <div className="space-y-3.5 text-xs sm:text-sm">
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div className="rounded-2xl border border-red-200 bg-white p-4.5 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-[#8b1a1a] font-black text-sm">
                <ShieldCheck size={16} /> 1. 중간·기말 직후 수강생 이탈 0% 락인(Retention)
              </div>
              <p className="text-slate-600 font-semibold text-xs leading-relaxed">
                시험이 끝나자마자 학원을 그만두는 학생을 원천 차단합니다. 시험 직후 즉시 세특·독서 연계 탐구와 [월간 활동 보고서]가 발송되어 수강 유지가 당연해집니다.
              </p>
            </div>
            <div className="rounded-2xl border border-red-200 bg-white p-4.5 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-[#8b1a1a] font-black text-sm">
                <Clock size={16} /> 2. 강사진의 야근과 첨삭 피로도 90% 이상 절감
              </div>
              <p className="text-slate-600 font-semibold text-xs leading-relaxed">
                세특 문장 다듬고 도서 찾느라 밤새던 선생님들의 고통이 끝납니다. 시스템이 10초 만에 초안과 도서를 매칭하므로 선생님은 본 수업과 학생 관리에만 전념합니다.
              </p>
            </div>
            <div className="rounded-2xl border border-red-200 bg-white p-4.5 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-[#8b1a1a] font-black text-sm">
                <TrendingUp size={16} /> 3. 신규 원생 모집 설명회 등록 전환율 300% 급증
              </div>
              <p className="text-slate-600 font-semibold text-xs leading-relaxed">
                단순 강의 홍보 대신 "대치동 본원 공신력 기반 우리 학원 전용 164개 대학 정밀 진단 설명회"를 열 수 있어 신규 등록 상담이 쇄도합니다.
              </p>
            </div>
            <div className="rounded-2xl border border-red-200 bg-white p-4.5 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-[#8b1a1a] font-black text-sm">
                <Award size={16} /> 4. "대치동 입시 연구소 직영 학원" 브랜드 격상
              </div>
              <p className="text-slate-600 font-semibold text-xs leading-relaxed">
                동네 보습학원에서 "학생부종합전형까지 원스톱으로 책임지는 지역 1등 프리미엄 입시 명문"으로 학원의 브랜드 위상이 완벽히 업그레이드됩니다.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "slide-7",
      badge: "07 · 학부모 그레이트 베네핏",
      title: "매월 눈으로 확인하는 안심과 절대적 신뢰",
      subtitle: "고액 컨설팅 비용 불안은 사라지고, 아이의 성장을 매달 리포트로 확인합니다.",
      theme: "purple",
      icon: <HeartHandshake className="w-6 h-6 text-purple-700" />,
      content: (
        <div className="space-y-3.5 text-xs sm:text-sm">
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div className="rounded-2xl border border-purple-200 bg-white p-4.5 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-purple-700 font-black text-sm">
                <Mail size={16} /> 1. 매월 정기 발송되는 품격 있는 월간 활동 보고서
              </div>
              <p className="text-slate-600 font-semibold text-xs leading-relaxed">
                "학원에서 우리 아이가 뭘 하는지" 답답하셨던 학부모님께, 매월 말 플래너 완수율, 필독서 내역, 수행평가 실적이 담긴 A4 리포트와 공식 이메일이 직발송됩니다.
              </p>
            </div>
            <div className="rounded-2xl border border-purple-200 bg-white p-4.5 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-purple-700 font-black text-sm">
                <DollarSign size={16} /> 2. 수백만 원 대치동 컨설팅 사교육비 대폭 절감
              </div>
              <p className="text-slate-600 font-semibold text-xs leading-relaxed">
                강남 대치동 본원에 오지 않고도, 재원 중인 학원에서 대치동 최정상급 1:1 입시 연구소의 모든 관리 서비스를 합리적으로 완벽히 누릴 수 있습니다.
              </p>
            </div>
            <div className="rounded-2xl border border-purple-200 bg-white p-4.5 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-purple-700 font-black text-sm">
                <CheckCircle2 size={16} /> 3. 자녀와의 잔소리 갈등 종식
              </div>
              <p className="text-slate-600 font-semibold text-xs leading-relaxed">
                "숙제했니? 수행평가 언제 낼래?" 부모님이 직접 다그칠 필요 없이, 시스템의 자동 넛지와 학원 선생님이 빈틈없이 챙겨주어 가정의 평화가 찾아옵니다.
              </p>
            </div>
            <div className="rounded-2xl border border-purple-200 bg-white p-4.5 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-purple-700 font-black text-sm">
                <Compass size={16} /> 4. 2028 대입 개편안에 대한 막연한 불안 완벽 해소
              </div>
              <p className="text-slate-600 font-semibold text-xs leading-relaxed">
                5등급제로 바뀌어 내 아이가 불이익을 받지 않을까 불안해하던 학부모님께, 오차 없는 164개 대학 모의 합불 데이터로 명쾌한 수시 로드맵을 제시합니다.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "slide-8",
      badge: "08 · 원클릭 리포트 & 메일링",
      title: "컨설턴트 원클릭 피드백 ➔ 학부모 즉시 메일링",
      subtitle: "단순 관리 피로도 제로! 컨설턴트는 고부가가치 첨삭에 몰입하고, 학부모에게 보고서 직발송",
      theme: "indigo",
      icon: <Mail className="w-6 h-6 text-indigo-700" />,
      content: (
        <div className="space-y-4 text-xs sm:text-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#ebdcca] bg-white p-4.5 space-y-2">
              <div className="flex items-center gap-2 text-indigo-700 font-black text-sm">
                <Zap size={16} /> ⚡ [탐구·도서 매칭] 원클릭 브릿지
              </div>
              <p className="text-slate-600 font-semibold text-xs leading-relaxed">
                학생이 올린 퀘스트 항목 옆의 버튼을 누르면 1초 만에 [탐구·세특 추천] 탭으로 과목과 과제명이 자동 전달되어, 수프리마랩 도서 DB 매칭과 AI 세특 생성을 10초 만에 끝마칩니다.
              </p>
            </div>
            <div className="rounded-2xl border border-[#ebdcca] bg-white p-4.5 space-y-2">
              <div className="flex items-center gap-2 text-[#8b1a1a] font-black text-sm">
                <Printer size={16} /> 🖨️ A4 프리미엄 인쇄 & ✉️ 학부모 메일링
              </div>
              <p className="text-slate-600 font-semibold text-xs leading-relaxed">
                월말에 <strong>[⚡ 실행 데이터 자동 집계 (Auto-Fill)]</strong> 클릭 한 번으로 한 달간의 플래너 완수율, 독서 실적, 퀘스트 성실도가 보고서로 완성되어 학부모 이메일로 직발송됩니다.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-3.5 text-center text-xs font-bold text-indigo-900">
            대치수프리마 공식 버건디 품격 서식(#7a1212)과 공식 직인([인])이 날인된 최고급 월간 성장 평가서가 발행됩니다.
          </div>
        </div>
      ),
    },
    {
      id: "slide-9",
      badge: "09 · 지금 바로 시작하기",
      title: "단 하루 만에 완성되는 대치동 프리미엄 입시 인프라",
      subtitle: "지금 바로 10초 무료 자가진단을 시작하거나, 학원 제휴 안내를 확인해 보세요.",
      theme: "burgundy",
      icon: <Sparkles className="w-6 h-6 text-[#8b1a1a]" />,
      content: (
        <div className="space-y-6 text-center py-2">
          <div className="max-w-xl mx-auto space-y-2">
            <h4 className="text-xl sm:text-2xl font-black text-[#1a0f08]">
              “생각이 있으면, 방법은 따라옵니다.”
            </h4>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 break-keep">
              대치수프리마와 함께라면 학생은 자신감을 얻고, 학원은 지역 1등 입시 명문으로 도약합니다.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              href="/diagnosis/step1"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#6ca94c] to-[#4e8d30] px-8 py-3.5 text-sm sm:text-base font-black text-white shadow-md hover:scale-102 transition"
            >
              <span>학생부 AI 진단 시작하기</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/admin"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#8b1a1a] bg-white px-8 py-3.5 text-sm sm:text-base font-black text-[#8b1a1a] shadow-xs hover:bg-red-50 transition"
            >
              <span>총괄 관리자 홈 바로가기</span>
            </Link>
          </div>
        </div>
      ),
    },
  ];

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPlaying, slides.length]);

  const active = slides[currentSlide];

  return (
    <section className="border-b border-[#e9dfd2] bg-gradient-to-b from-[#fffefc] via-[#fbf7f0] to-[#f7eee2] py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* 상단 타이틀 바 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#8b1a1a]/10 px-3 py-1 text-xs font-black text-[#8b1a1a]">
                PROGRAM TOUR GUIDE · 한눈에 보는 프로그램 소개
              </span>
              <span className="text-xs font-bold text-slate-500">
                ({currentSlide + 1} / {slides.length})
              </span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black text-[#1a0f08]">
              대치수프리마 「나의 입시멘토」 완벽 가이드
            </h2>
          </div>

          {/* 슬라이드 컨트롤러 */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#d8c7b2] bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
              <span>{isPlaying ? "자동넘김 정지" : "자동재생"}</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentSlide((prev) => (prev > 0 ? prev - 1 : slides.length - 1))}
              className="rounded-xl border border-[#d8c7b2] bg-white p-2 text-slate-700 shadow-2xs hover:bg-slate-50 transition"
              aria-label="이전 화면"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              className="rounded-xl border border-[#d8c7b2] bg-white p-2 text-slate-700 shadow-2xs hover:bg-slate-50 transition"
              aria-label="다음 화면"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* 9개 슬라이드 탭 바 (Pills Navigator) */}
        <div className="flex flex-wrap gap-2 mb-6">
          {slides.map((s, idx) => {
            const isCurrent = currentSlide === idx;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-[#8b1a1a] text-white shadow-md scale-102"
                    : "border border-[#e2d5c3] bg-white/80 text-slate-600 hover:bg-white hover:text-[#8b1a1a]"
                }`}
              >
                <span>{s.badge.split(" · ")[0]}</span>
                <span className="hidden sm:inline ml-1.5 opacity-90">{s.badge.split(" · ")[1]}</span>
              </button>
            );
          })}
        </div>

        {/* 메인 슬라이드 카드 쇼케이스 */}
        <div className="rounded-3xl border-2 border-[#ebdcca] bg-white p-6 sm:p-8 shadow-sm transition-all duration-300">
          {/* 슬라이드 헤더 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f0e4d4] pb-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#faf4eb] border border-[#ebdcca]">
                {active.icon}
              </div>
              <div>
                <span className="text-[11px] font-black text-[#8b1a1a] uppercase tracking-wider block">
                  {active.badge}
                </span>
                <h3 className="text-lg sm:text-2xl font-black text-[#1a0f08]">
                  {active.title}
                </h3>
              </div>
            </div>
            <p className="text-xs font-bold text-slate-500 max-w-sm sm:text-right break-keep">
              {active.subtitle}
            </p>
          </div>

          {/* 슬라이드 본문 컨텐츠 */}
          <div className="min-h-[260px] flex items-center">
            <div className="w-full">{active.content}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
