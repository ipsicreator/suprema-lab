"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  Database,
  CreditCard,
  Link2,
  ShieldCheck,
  HelpCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Download,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Calendar,
  Layers,
  FileSpreadsheet,
  Presentation,
  Compass,
} from "lucide-react";
import PdfStorageSetup from "./PdfStorageSetup";

interface AdminDashboardHubProps {
  academyAppUrl: string;
}

export default function AdminDashboardHub({ academyAppUrl }: AdminDashboardHubProps) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const toggleExpand = (cardKey: string) => {
    setExpandedCard(prev => (prev === cardKey ? null : cardKey));
  };

  return (
    <div className="space-y-8">
      {/* 1. 상단 마스터 헤더 & 신뢰 배지 */}
      <div className="rounded-3xl border border-[#e8dfd3] bg-gradient-to-br from-[#ffffff] via-[#fdfbf7] to-[#f9f4ec] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ebdcca] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#8b1a1a]/10 px-3 py-1 text-xs font-black text-[#8b1a1a]">
                <ShieldCheck size={14} /> 대치 수프리마 대입전략연구소 마스터 관제 센터
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                ● 시스템 정상 가동 중
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1a0f08] tracking-tight">
              총괄 관리자 홈 (Master Admin Hub)
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-600 break-keep">
              전국 제휴 학원 B2B 계정 발급, 164개 대학 입결 컷오프 DB, 수강생 탐구·세특 활동 이력 및 결제 정책을 총괄 통제합니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={academyAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#8b1a1a] to-[#a01c1c] px-4 py-2.5 text-xs font-black text-white shadow-xs transition hover:brightness-110"
            >
              <span>학원용 관리 앱 바로가기</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* 마스터 권한 핵심 알림 바 */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold text-slate-700">
          <div className="flex items-center gap-2 rounded-xl border border-[#eadfcf] bg-white p-3 shadow-2xs">
            <CheckCircle2 size={16} className="text-[#8b1a1a]" />
            <span>마스터 로그인 시 학원 관리자/컨설턴트 전 권한 오픈</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-[#eadfcf] bg-white p-3 shadow-2xs">
            <CheckCircle2 size={16} className="text-teal-700" />
            <span>164개 대학 26,295개 수시 전형 컷오프 DB 실시간 연동</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-[#eadfcf] bg-white p-3 shadow-2xs">
            <CheckCircle2 size={16} className="text-blue-700" />
            <span>학생 개인 식별 코드 기반 안전 암호화 통신 적용</span>
          </div>
        </div>

        {/* 2. 관리자 실무 매뉴얼 4종 즉시 다운로드 바 */}
        <div className="mt-6 rounded-2xl border border-[#ebdcca] bg-[#fffaf5] p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-[#8b1a1a]" />
              <h2 className="text-sm font-black text-[#1a0f08]">
                관리자 홈 전 메뉴 실무 매뉴얼 다운로드 (공식 가이드)
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              어떤 메뉴를 써야 할지 모를 때 아래 매뉴얼을 열어보세요.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="/guides/대치수프리마_관리자홈_전메뉴_사용매뉴얼_및_운영가이드.pptx"
              download="대치수프리마_관리자홈_전메뉴_사용매뉴얼_및_운영가이드.pptx"
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3.5 py-2 text-xs font-bold text-red-700 shadow-2xs transition hover:bg-red-50"
            >
              <Presentation size={14} />
              <span>매뉴얼 Slide(PPTX)</span>
            </a>
            <a
              href="/guides/대치수프리마_관리자홈_전메뉴_사용매뉴얼_및_운영가이드.docx"
              download="대치수프리마_관리자홈_전메뉴_사용매뉴얼_및_운영가이드.docx"
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-white px-3.5 py-2 text-xs font-bold text-blue-700 shadow-2xs transition hover:bg-blue-50"
            >
              <FileText size={14} />
              <span>매뉴얼 Word(DOCX)</span>
            </a>
            <a
              href="/guides/대치수프리마_관리자홈_전메뉴_사용매뉴얼_및_운영가이드.xlsx"
              download="대치수프리마_관리자홈_전메뉴_사용매뉴얼_및_운영가이드.xlsx"
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-3.5 py-2 text-xs font-bold text-emerald-700 shadow-2xs transition hover:bg-emerald-50"
            >
              <FileSpreadsheet size={14} />
              <span>매뉴얼 Excel(XLSX)</span>
            </a>
            <a
              href="/guides/대치수프리마_관리자홈_전메뉴_사용매뉴얼_및_운영가이드.md"
              download="대치수프리마_관리자홈_전메뉴_사용매뉴얼_및_운영가이드.md"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50"
            >
              <FileText size={14} />
              <span>매뉴얼 Markdown(MD)</span>
            </a>
          </div>
        </div>
      </div>

      {/* 3. 3대 기능 섹션 및 카드 그리드 */}

      {/* SECTION 1: 🏛️ 학원 및 입시 컨설팅 실무 (Academy & Consulting Operations) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#e8dfd3] pb-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#8b1a1a] text-xs font-black text-white">
            1
          </span>
          <h2 className="text-lg font-black text-[#1a0f08]">
            학원 및 입시 컨설팅 실무 운영 (Academy & Consulting Operations)
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            — 제휴 학원 재원생 코칭 및 B2B 계정 발급 관제
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Card 1: 학원용 관리 앱 */}
          <div className="rounded-2xl border border-[#e8dfd3] bg-white p-6 shadow-2xs transition hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#8b1a1a]/10 text-[#8b1a1a]">
                  <Building2 size={24} />
                </div>
                <div>
                  <span className="rounded-md bg-[#8b1a1a]/10 px-2 py-0.5 text-[11px] font-black text-[#8b1a1a]">
                    실무 코칭 작업대
                  </span>
                  <h3 className="text-lg font-black text-[#1a0f08] mt-0.5">
                    학원용 관리 앱 (컨설턴트 앱 Pro)
                  </h3>
                </div>
              </div>
              <a
                href={academyAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-xl bg-[#8b1a1a] px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs transition hover:brightness-110"
              >
                <span>앱 열기</span>
                <ExternalLink size={12} />
              </a>
            </div>

            <p className="mt-3 text-xs font-bold text-slate-700">
              📌 <strong>핵심 용도</strong>: 원장·컨설턴트·마스터가 재원생을 1:1로 밀착 관리하고, 나이스 3단계 세특 검수 및 A4 추천서/평가서를 인쇄하는 현장 워크스페이스입니다.
            </p>

            <div className="mt-3 rounded-xl border border-[#ebdcca] bg-[#fffaf5] p-3 text-xs font-semibold text-slate-600 space-y-1">
              <div className="font-bold text-[#8b1a1a]">💡 마스터 권한 오픈:</div>
              <div>마스터로 로그인 시 학원 관리자(원장) 및 컨설턴트 권한이 모두 활성화되어, 모든 학원 재원생의 성적 분석, 플래너, 세특 추천서 발행, 강사 배정을 직접 실행할 수 있습니다.</div>
            </div>

            <button
              type="button"
              onClick={() => toggleExpand("academyApp")}
              className="mt-4 flex w-full items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-[#8b1a1a] hover:underline"
            >
              <span>{expandedCard === "academyApp" ? "▲ 상세 사용 매뉴얼 접기" : "▼ 상세 사용 매뉴얼 펼치기"}</span>
              {expandedCard === "academyApp" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {expandedCard === "academyApp" && (
              <div className="mt-3 space-y-2 border-t border-dashed border-slate-200 pt-3 text-xs font-medium text-slate-600">
                <div className="font-bold text-slate-800">🛠️ 표준 실무 순서:</div>
                <ol className="list-decimal pl-4 space-y-1">
                  <li><strong>학생 CRM 등록</strong>: 상단 `[+ 신규 학생 등록]`에서 이름, 학교, 학년, 연락처를 등록합니다.</li>
                  <li><strong>학생부 및 성적 분석</strong>: 5등급제 ⟷ 9등급제 자동 환산 성적과 학종 취약 과목을 확인합니다.</li>
                  <li><strong>독서·세특 배정</strong>: 카카오 도서 DB 연계 전공 필독서와 3단계 완성형 문장을 검수합니다.</li>
                  <li><strong>추천서/평가서 인쇄</strong>: 학원 로고가 들어간 맞춤 추천서 및 학기 평가서를 A4로 즉시 출력합니다.</li>
                  <li><strong>강사 배정</strong>: `학원 관리자` 탭에서 담당 강사별로 학생을 1:1로 배정합니다.</li>
                </ol>
              </div>
            )}
          </div>

          {/* Card 2: 학원 권한 및 계정 발급 */}
          <div className="rounded-2xl border border-[#e8dfd3] bg-white p-6 shadow-2xs transition hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
                  <Users size={24} />
                </div>
                <div>
                  <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-black text-blue-800">
                    B2B 계정 관제
                  </span>
                  <h3 className="text-lg font-black text-[#1a0f08] mt-0.5">
                    학원 권한 · 계정 발급 & 배정 점검
                  </h3>
                </div>
              </div>
              <Link
                href="/admin/academy"
                className="inline-flex items-center gap-1 rounded-xl bg-[#1e40af] px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs transition hover:brightness-110"
              >
                <span>계정 관리</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <p className="mt-3 text-xs font-bold text-slate-700">
              📌 <strong>핵심 용도</strong>: 전국 제휴 학원의 원장(admin) 및 강사(consultant) 계정을 신규 발급하고, 비밀번호를 초기화하며, 학생 배정 상태를 점검하는 마스터 전용 관제소입니다.
            </p>

            <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-xs font-semibold text-slate-600 space-y-1">
              <div className="font-bold text-blue-900">💡 이런 상황에 사용하세요:</div>
              <div>신규 학원 B2B 계약 시 원장/강사 계정 즉시 발급, 강사의 비밀번호 분실 시 1초 초기화, 퇴사한 강사의 학생 미배정 여부 감사.</div>
            </div>

            <button
              type="button"
              onClick={() => toggleExpand("academyAccounts")}
              className="mt-4 flex w-full items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-blue-800 hover:underline"
            >
              <span>{expandedCard === "academyAccounts" ? "▲ 상세 사용 매뉴얼 접기" : "▼ 상세 사용 매뉴얼 펼치기"}</span>
              {expandedCard === "academyAccounts" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {expandedCard === "academyAccounts" && (
              <div className="mt-3 space-y-2 border-t border-dashed border-slate-200 pt-3 text-xs font-medium text-slate-600">
                <div className="font-bold text-slate-800">🛠️ 표준 실무 순서:</div>
                <ol className="list-decimal pl-4 space-y-1">
                  <li><strong>학원 선택</strong>: 상단 드롭다운에서 계정을 발급할 제휴 학원을 선택합니다.</li>
                  <li><strong>신규 계정 발급</strong>: 이름, 이메일, 역할(학원 관리자 vs 실행 담당자), 초기 비밀번호 입력 후 발급합니다.</li>
                  <li><strong>비밀번호 재설정</strong>: 목록에서 `[비밀번호 재설정]` 클릭 후 즉시 새 암호를 부여합니다.</li>
                  <li><strong>학생 배정 감사</strong>: 미배정 학생 수 및 중복 배정 여부를 하단 감사 테이블에서 확인합니다.</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: 📊 입시 빅데이터 & 학생 활동 관리 (Big Data & Student Records) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#e8dfd3] pb-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-700 text-xs font-black text-white">
            2
          </span>
          <h2 className="text-lg font-black text-[#1a0f08]">
            입시 빅데이터 & 학생 활동 관리 (Big Data & Student Records)
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            — 164개 대학 입결 컷오프 DB 갱신 및 학생 탐구 활동 이력
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Card 3: 입시 데이터 관리 */}
          <div className="rounded-2xl border border-[#e8dfd3] bg-white p-6 shadow-2xs transition hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
                  <Database size={24} />
                </div>
                <div>
                  <span className="rounded-md bg-teal-100 px-2 py-0.5 text-[11px] font-black text-teal-800">
                    164개 대학 컷오프 DB
                  </span>
                  <h3 className="text-lg font-black text-[#1a0f08] mt-0.5">
                    입시 데이터 관리 (컷오프 DB)
                  </h3>
                </div>
              </div>
              <Link
                href="/admin/admissions"
                className="inline-flex items-center gap-1 rounded-xl bg-teal-800 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs transition hover:brightness-110"
              >
                <span>DB 관리</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <p className="mt-3 text-xs font-bold text-slate-700">
              📌 <strong>핵심 용도</strong>: 전국 164개 대학 26,295개 수시 전형 컷오프(입결) 원본 엑셀/CSV를 대량 업로드하고, 유효성을 검증하여 실서비스에 배포하거나 비상 시 롤백합니다.
            </p>

            <div className="mt-3 rounded-xl border border-teal-100 bg-teal-50/50 p-3 text-xs font-semibold text-slate-600 space-y-1">
              <div className="font-bold text-teal-900">💡 이런 상황에 사용하세요:</div>
              <div>대학별 최신 수시 컷오프 공시 시 엑셀 파일 대량 업데이트, 전형 신설/통폐합 반영, 잘못된 데이터 입력 시 1초 원상복구(Rollback).</div>
            </div>

            <button
              type="button"
              onClick={() => toggleExpand("admissionsDb")}
              className="mt-4 flex w-full items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-teal-800 hover:underline"
            >
              <span>{expandedCard === "admissionsDb" ? "▲ 상세 사용 매뉴얼 접기" : "▼ 상세 사용 매뉴얼 펼치기"}</span>
              {expandedCard === "admissionsDb" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {expandedCard === "admissionsDb" && (
              <div className="mt-3 space-y-2 border-t border-dashed border-slate-200 pt-3 text-xs font-medium text-slate-600">
                <div className="font-bold text-slate-800">🛠️ 표준 실무 순서:</div>
                <ol className="list-decimal pl-4 space-y-1">
                  <li><strong>엑셀 템플릿 작성</strong>: 대학명, 캠퍼스, 학과, 전형유형, 컷오프 수치를 작성합니다.</li>
                  <li><strong>파일 드래그 업로드</strong>: CSV/XLSX 업로드 시 5등급/9등급 값의 유효성을 자동 검증합니다.</li>
                  <li><strong>실서비스 반영 (`Publish`)</strong>: 검증 확인 후 클릭 즉시 진단 엔진에 실시간 적용됩니다.</li>
                  <li><strong>비상 롤백 (`Rollback`)</strong>: 이전 버전 복원 버튼으로 불변 리비전으로 되돌립니다.</li>
                </ol>
              </div>
            )}
          </div>

          {/* Card 4: 학생 개인 활동 및 계정 연결 */}
          <div className="rounded-2xl border border-[#e8dfd3] bg-white p-6 shadow-2xs transition hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-800">
                  <Link2 size={24} />
                </div>
                <div>
                  <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[11px] font-black text-purple-800">
                    학생 활동 & 연결 코드
                  </span>
                  <h3 className="text-lg font-black text-[#1a0f08] mt-0.5">
                    학생 개인 활동 · 계정 연결
                  </h3>
                </div>
              </div>
              <Link
                href="/admin/activities"
                className="inline-flex items-center gap-1 rounded-xl bg-purple-800 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs transition hover:brightness-110"
              >
                <span>활동 조회</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <p className="mt-3 text-xs font-bold text-slate-700">
              📌 <strong>핵심 용도</strong>: 학생이 「나의 입시멘토」 모바일/웹에서 수행한 탐구 과제, 읽은 도서, 작성한 세특 초안의 실시간 이력 조회 및 학원-학생 1:1 암호화 연결 코드를 관리합니다.
            </p>

            <div className="mt-3 rounded-xl border border-purple-100 bg-purple-50/50 p-3 text-xs font-semibold text-slate-600 space-y-1">
              <div className="font-bold text-purple-900">💡 이런 상황에 사용하세요:</div>
              <div>학생의 학원 연동 코드 확인/재발급, 학생이 제출한 탐구 보고서의 버전별(1차➔2차➔최종) 수정 내역 비교 검토.</div>
            </div>

            <button
              type="button"
              onClick={() => toggleExpand("studentActivities")}
              className="mt-4 flex w-full items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-purple-800 hover:underline"
            >
              <span>{expandedCard === "studentActivities" ? "▲ 상세 사용 매뉴얼 접기" : "▼ 상세 사용 매뉴얼 펼치기"}</span>
              {expandedCard === "studentActivities" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {expandedCard === "studentActivities" && (
              <div className="mt-3 space-y-2 border-t border-dashed border-slate-200 pt-3 text-xs font-medium text-slate-600">
                <div className="font-bold text-slate-800">🛠️ 표준 실무 순서:</div>
                <ol className="list-decimal pl-4 space-y-1">
                  <li><strong>학생 검색</strong>: 이름 또는 식별 번호로 학생 계정을 찾습니다.</li>
                  <li><strong>연결 코드 확인</strong>: 학생이 학원 앱과 연동할 6자리 암호화 코드를 발급합니다.</li>
                  <li><strong>활동 이력 검토</strong>: 자·동·진·특 영역별 탐구 활동 타임라인과 최신 세특을 열람합니다.</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: ⚙️ 비즈니스 결제 & 인프라 보관소 (Business & Infrastructure) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#e8dfd3] pb-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-700 text-xs font-black text-white">
            3
          </span>
          <h2 className="text-lg font-black text-[#1a0f08]">
            비즈니스 결제 & 인프라 설정 (Business & Infrastructure)
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            — 서비스 이용권 요금제 관리 및 학생부 PDF 보안 스토리지
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Card 5: 가격 및 결제 관리 */}
          <div className="rounded-2xl border border-[#e8dfd3] bg-white p-6 shadow-2xs transition hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
                  <CreditCard size={24} />
                </div>
                <div>
                  <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-black text-amber-800">
                    요금제 & 매출 정산
                  </span>
                  <h3 className="text-lg font-black text-[#1a0f08] mt-0.5">
                    가격 · 결제 관리
                  </h3>
                </div>
              </div>
              <Link
                href="/admin/pricing"
                className="inline-flex items-center gap-1 rounded-xl bg-amber-800 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs transition hover:brightness-110"
              >
                <span>결제 관리</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <p className="mt-3 text-xs font-bold text-slate-700">
              📌 <strong>핵심 용도</strong>: 1개월 단기속성, 3~4개월 학기 집중 케어, 6개월 풀코스 케어 등 서비스 요금제 설정 및 카드/계좌 결제 승인 내역을 대조합니다.
            </p>

            <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50/50 p-3 text-xs font-semibold text-slate-600 space-y-1">
              <div className="font-bold text-amber-900">💡 이런 상황에 사용하세요:</div>
              <div>학기별 프로모션 할인 요금제 변경, 유료 가입 학생의 결제 승인 내역 확인, 환불 요청 처리.</div>
            </div>

            <button
              type="button"
              onClick={() => toggleExpand("pricing")}
              className="mt-4 flex w-full items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-amber-800 hover:underline"
            >
              <span>{expandedCard === "pricing" ? "▲ 상세 사용 매뉴얼 접기" : "▼ 상세 사용 매뉴얼 펼치기"}</span>
              {expandedCard === "pricing" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {expandedCard === "pricing" && (
              <div className="mt-3 space-y-2 border-t border-dashed border-slate-200 pt-3 text-xs font-medium text-slate-600">
                <div className="font-bold text-slate-800">🛠️ 표준 실무 순서:</div>
                <ol className="list-decimal pl-4 space-y-1">
                  <li><strong>요금제 설정</strong>: 서비스 과정별 정가와 프로모션 할인가를 설정합니다.</li>
                  <li><strong>결제 내역 모니터링</strong>: 일자별 주문 건수와 카드 승인 내역을 확인합니다.</li>
                  <li><strong>매출 정산</strong>: 학원 B2B 라이선스 및 개인 B2C 결제액을 대조 정산합니다.</li>
                </ol>
              </div>
            )}
          </div>

          {/* Card 6: 학생부 PDF 안전 보관소 점검 (PdfStorageSetup) */}
          <div className="rounded-2xl border border-[#e8dfd3] bg-white p-6 shadow-2xs">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-800">
                    클라우드 암호화 보안
                  </span>
                  <h3 className="text-lg font-black text-[#1a0f08] mt-0.5">
                    학생부 PDF 안전 보관소 점검
                  </h3>
                </div>
              </div>
            </div>

            <p className="mt-2 text-xs font-bold text-slate-700">
              📌 <strong>핵심 용도</strong>: 정부24 나이스 생활기록부 PDF의 비공개 클라우드 암호화 저장소 및 OCR/AI 텍스트 추출 엔진의 통신 상태를 점검합니다.
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <PdfStorageSetup />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
