import React from "react";
import Image from "next/image";
import Link from "next/link";
import ProgramGuideTour from "../components/ProgramGuideTour";
import OfficialFooter from "../components/OfficialFooter";

export const metadata = {
  title: "프로그램 소개 · 나의 입시멘토 (대치수프리마)",
  description: "대치수프리마 「나의 입시멘토」 시스템 소개, 왜 선택해야 하는지, 탐구주제 매칭 4단계 아키텍처 및 어마어마한 3대 혜택 총정리",
};

export default function IntroductionPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1a1a1a] selection:bg-[#7a1212] selection:text-white font-sans antialiased">
      {/* Top Header */}
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

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-xl border border-[#d8c7b2] bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:text-[#8b1a1a] transition"
            >
              홈으로
            </Link>
            <Link
              href="/diagnosis/step1"
              className="rounded-xl bg-[#6ca94c] px-4 py-1.5 text-xs font-black text-white shadow-xs hover:bg-[#5b933d] transition"
            >
              진단 시작
            </Link>
          </div>
        </div>
      </header>

      {/* Main Tour Component */}
      <main>
        <ProgramGuideTour />
      </main>

      {/* Official Footer */}
      <OfficialFooter />
    </div>
  );
}
