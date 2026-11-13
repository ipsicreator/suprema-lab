"use client";

import Image from "next/image";

import { 
  TrendingUp, 
  Zap, 
  Search, 
  Brain, 
  Target, 
  Compass, 
  Award, 
  Star,
  Quote,
  ArrowRight,
  Download
} from "lucide-react";

export default function LeafletPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-sky-100">
      
      {/* Printable Area (A4 style or Digital Spread) */}
      <div className="max-w-5xl mx-auto py-20 px-10 space-y-32">
        
        {/* [SECTION 1] COVER & MASTER PROFILE */}
        <div className="grid md:grid-cols-2 gap-16 items-center border-b-4 border-sky-500 pb-20">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500 text-white text-[10px] font-black tracking-widest uppercase rounded">
              Official Service Guide
            </div>
            <div className="flex items-center gap-4 mb-8">
              <Image src="/suprema-logo.svg" alt="Suprima Logo" width={160} height={48} className="h-12 w-auto" />
              <div className="w-px h-8 bg-sky-500/30 mx-2"></div>
              <h1 className="text-6xl font-black tracking-tighter leading-none">
                SUPRIMA<br />
                <span className="text-sky-500">ADMISSION</span><br />
                STRATEGY
              </h1>
            </div>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">
              데이터와 진심이 만드는 합격의 지름길,<br />
              수프리마 입시 전략 센터가 당신과 함께합니다.
            </p>
            <div className="pt-10 space-y-4">
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">The Master</h4>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-slate-200 overflow-hidden border-4 border-sky-500/20 grayscale">
                    <div className="w-full h-full bg-[url('/about_master/leekiwook_shake.jpg')] bg-cover bg-center" />
                </div>
                <div>
                  <p className="text-2xl font-black">이기욱 소장</p>
                  <p className="text-sky-600 font-bold text-sm">Daechi Suprima CEO</p>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    현) 네이버 엑스퍼트 입시 전문가<br />
                    전) 대치 명인학원 입시연구소 컨설턴트<br />
                    연 150명 이상의 의치한수 및 상위권 대학 합격 설계
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 p-12 rounded-[3rem] border-2 border-slate-100 shadow-inner">
             <Quote className="w-12 h-12 text-sky-200 mb-6" />
             <h3 className="text-3xl font-black leading-tight mb-6">
               &quot;입시는 데이터라는 나침반과 <br />
               기록이라는 지도가 필요한 <br />
               여정입니다.&quot;
             </h3>
             <p className="text-slate-500 leading-relaxed italic">
               단순한 합불 판정을 넘어, 학생의 고유한 스토리를 입체적으로 분석하여 
               가장 정교한 합격의 로드맵을 설계합니다.
             </p>
          </div>
        </div>

        {/* [SECTION 2] CORE SERVICE 1: 정밀 입시위치 진단 */}
        <div className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black tracking-tight">01. 정밀 입시위치 진단</h2>
            <div className="w-20 h-1.5 bg-sky-500 mx-auto rounded-full" />
            <p className="text-slate-50">2023-2025 3개년 실결 빅데이터 기반 정밀 대조 분석</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <TrendingUp className="w-8 h-8" />, title: "3개년 실결 추이", desc: "2023-2025학년도 실제 입학 결과(70% 컷) 기반 안정/적정/도전 판정" },
              { icon: <Target className="w-8 h-8" />, title: "5/9등급 통합 환산", desc: "고1, 2학년 5등급제 세대를 위한 9등급 지표 표준 변환 시스템 적용" },
              { icon: <Search className="w-8 h-8" />, title: "대학별 전형 시뮬레이션", desc: "학생부 교과, 종합, 논술 중 가장 유리한 전형 추천 및 합격선 분석" }
            ].map((item, i) => (
              <div key={i} className="p-10 rounded-3xl bg-slate-50 border border-slate-100 space-y-6 hover:shadow-xl transition-all">
                <div className="text-sky-500">{item.icon}</div>
                <h4 className="text-xl font-bold">{item.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* [SECTION 3] CORE SERVICE 2: AI SOLUTION */}
        <div className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black tracking-tight">02. AI 융합 세특 솔루션</h2>
            <div className="w-20 h-1.5 bg-indigo-500 mx-auto rounded-full" />
            <p className="text-slate-500">당신의 관심사가 생기부의 기록과 만날 때 독보적인 탐구가 시작됩니다.</p>
          </div>

          <div className="bg-indigo-600 rounded-[3.5rem] p-12 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <Brain className="w-64 h-64" />
            </div>
            <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h3 className="text-3xl font-black leading-tight">AI 탐구_세특 플랫폼<br />융합 엔진 솔루션</h3>
                <ul className="space-y-4">
                  {[
                    "학생부 텍스트 정밀 파싱을 통한 학술 키워드 추출",
                    "관심 키워드와 생기부 기록의 논리적 융합 주제 도출",
                    "입학 사정관이 주목하는 탐구의 연속성 확보",
                    "생활기록부 기재 규칙을 준수한 교사용 예시 생성"
                  ].map((text, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-medium opacity-90">
                      <Zap className="w-4 h-4 text-amber-400" /> {text}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <div className="p-6 rounded-2xl bg-white/10 border border-white/20 text-center backdrop-blur-md">
                   <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Success Case</p>
                   <p className="text-lg font-bold">#인공지능 + #확률과통계 ➔</p>
                   <p className="text-xl font-black mt-2 text-amber-300">&quot;알고리즘 공정성 검증 탐구&quot;</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* [SECTION 4] THE REPORT & TRUST */}
        <div className="grid md:grid-cols-2 gap-20 items-center border-t-2 border-slate-100 pt-20">
          <div className="space-y-10">
            <h2 className="text-4xl font-black tracking-tight">수프리마가 약속하는<br /><span className="text-sky-500">네 가지 가치</span></h2>
            <div className="grid grid-cols-2 gap-6">
              {[
                { title: "정밀(Precision)", icon: <Compass className="w-5 h-5" /> },
                { title: "지능(Intelligence)", icon: <Brain className="w-5 h-5" /> },
                { title: "성공(Success)", icon: <Star className="w-5 h-5" /> },
                { title: "진심(Sincerity)", icon: <Award className="w-5 h-5" /> }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <div className="text-sky-500">{item.icon}</div>
                  <span className="font-bold text-sm">{item.title}</span>
                </div>
              ))}
            </div>
            <div className="p-8 rounded-3xl bg-sky-50 border border-sky-100">
              <p className="text-sm text-sky-800 leading-relaxed font-medium">
                &quot;수프리마의 최종 보고서는 단순한 결과지가 아닙니다. 
                그것은 학생의 3년 과정을 합격이라는 마침표로 이끄는 가장 완벽한 설계도입니다.&quot;
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-sky-500 rounded flex items-center justify-center text-[10px] font-black text-white">S</div>
                <span className="text-xs font-black uppercase tracking-widest text-sky-700">Admission Report</span>
              </div>
            </div>
          </div>
          <div className="relative">
             <div className="absolute inset-0 bg-sky-500/10 blur-[100px] rounded-full" />
             <div className="relative glass p-10 rounded-[2.5rem] border-2 border-slate-100 shadow-2xl space-y-8">
                <div className="flex justify-between items-center pb-6 border-b border-slate-100">
                  <h4 className="text-lg font-black tracking-tight">수시 지원 전략 보고서</h4>
                  <Download className="w-5 h-5 text-slate-400" />
                </div>
                <div className="space-y-4">
                  {[
                    { uni: "성균관대", status: "적정", grade: "1.92" },
                    { uni: "중앙대", status: "도전", grade: "1.85" },
                    { uni: "경희대", status: "안정", grade: "2.20" }
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-white border border-slate-50 rounded-2xl shadow-sm">
                      <span className="font-bold text-sm">{item.uni}</span>
                      <div className="flex gap-4 items-center">
                        <span className="text-xs font-mono text-slate-400">{item.grade}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          item.status === '안정' ? 'bg-emerald-100 text-emerald-600' :
                          item.status === '적정' ? 'bg-sky-100 text-sky-600' : 'bg-amber-100 text-amber-600'
                        }`}>{item.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center gap-2">
                  지금 바로 진단 받기 <ArrowRight className="w-4 h-4" />
                </button>
             </div>
          </div>
        </div>

        {/* [FOOTER] CONTACT & BRAND */}
        <div className="pt-20 border-t-4 border-slate-900 flex flex-col md:flex-row justify-between items-start gap-10">
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-sky-500 rounded flex items-center justify-center font-black text-white text-xs">S</div>
              <span className="text-xl font-black uppercase tracking-tighter">Suprima Center</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">데이터와 진심이 결합된 대한민국 No.1 입시 전략 플랫폼</p>
            <p className="text-[11px] text-slate-400">
              서울시 강남구 테헤란로 326 B1F (이기욱 대표컨설턴트)
            </p>
          </div>
          <div className="text-left md:text-right space-y-4">
            <p className="text-sm font-black tracking-widest text-slate-400 uppercase">Contact & SNS</p>
            <p className="text-2xl font-black text-sky-600">010-2370-1077 <span className="text-xs text-slate-400 font-normal">(문자전송)</span></p>
            <div className="flex gap-4 justify-start md:justify-end text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <a href="https://band.us/@suprima" className="hover:text-sky-500">Band</a>
                <a href="https://blog.naver.com/gouniv_hifive" className="hover:text-sky-500">Blog</a>
                <a href="https://www.instagram.com/suprima_ipsicreator" className="hover:text-sky-500">Instagram</a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
