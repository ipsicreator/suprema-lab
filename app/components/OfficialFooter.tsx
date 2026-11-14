"use client";

import Image from "next/image";

interface OfficialFooterProps {
  className?: string;
}

export default function OfficialFooter({ className = "" }: OfficialFooterProps) {
  return (
    <footer
      className={`border-t border-[#eadfce] bg-white py-10 text-xs text-slate-600 print:bg-white print:py-4 ${className}`}
      aria-label="공식 회사 정보"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
          {/* 좌측: 센터 및 대표 정보 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <Image
                src="/suprema-official-logo.png"
                alt="대치수프리마 입시&코칭센터"
                width={120}
                height={36}
                className="h-7 w-auto object-contain"
              />
              <span className="text-sm font-black text-[#1a0f08]">
                대치수프리마 입시&코칭센터
              </span>
            </div>
            <div className="space-y-1 text-slate-600">
              <p>
                <strong className="text-slate-800">대표 :</strong> 이기욱 대표컨설턴트
                <span className="mx-2 text-slate-300">|</span>
                <strong className="text-slate-800">메일 :</strong>{" "}
                <a
                  href="mailto:suprimalab@gmail.com"
                  className="text-slate-700 hover:text-[#8b1a1a] hover:underline"
                >
                  suprimalab@gmail.com
                </a>
              </p>
              <p>
                <strong className="text-slate-800">연락처 :</strong>{" "}
                <a
                  href="tel:010-2370-1077"
                  className="font-bold text-[#8b1a1a] hover:underline"
                >
                  010-2370-1077
                </a>
                <span className="ml-1 text-[11px] text-slate-400">(문자전송)</span>
                <span className="mx-2 text-slate-300">|</span>
                <strong className="text-slate-800">소재지 :</strong> 서울시 강남구 테헤란로 326 B1F
              </p>
            </div>
          </div>

          {/* 우측: SNS & 커뮤니티 채널 */}
          <div className="space-y-2 md:text-right">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Official Channels & SNS
            </p>
            <div className="flex flex-wrap items-center gap-3 md:justify-end text-xs font-semibold">
              <a
                href="https://band.us/@suprima"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-[#e2d5c3] bg-[#faf6f0] px-2.5 py-1 text-slate-700 transition hover:border-[#00c73c] hover:text-[#00c73c]"
              >
                <span>네이버 밴드 :</span>
                <span className="font-bold text-slate-900">band.us/@suprima</span>
              </a>
              <a
                href="https://blog.naver.com/gouniv_hifive"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-[#e2d5c3] bg-[#faf6f0] px-2.5 py-1 text-slate-700 transition hover:border-[#03cf5d] hover:text-[#03cf5d]"
              >
                <span>블로그 :</span>
                <span className="font-bold text-slate-900">blog.naver.com/gouniv_hifive</span>
              </a>
              <a
                href="https://www.instagram.com/suprima_ipsicreator"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-[#e2d5c3] bg-[#faf6f0] px-2.5 py-1 text-slate-700 transition hover:border-[#e1306c] hover:text-[#e1306c]"
              >
                <span>인스타그램 :</span>
                <span className="font-bold text-slate-900">suprima_ipsicreator</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-[#f0e4d4] pt-4 text-center text-[11px] text-slate-400">
          © 2026 대치수프리마 입시&코칭센터. All rights reserved. 164개 대학 26,295개 전형 컷오프 데이터 및 AI 입시 진단 솔루션
        </div>
      </div>
    </footer>
  );
}
