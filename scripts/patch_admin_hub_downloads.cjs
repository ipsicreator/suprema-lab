const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../app/admin/AdminDashboardHub.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

const oldDownloadBox = `        {/* 2. 관리자 실무 매뉴얼 4종 즉시 다운로드 바 */}
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
        </div>`;

const newDownloadBox = `        {/* 2. 관리자 실무 매뉴얼 4종 즉시 다운로드 바 */}
        <div className="mt-6 rounded-2xl border border-[#ebdcca] bg-[#fffaf5] p-4 sm:p-5 space-y-3.5">
          {/* Row 1: 총괄 관리자 홈 실무 매뉴얼 */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-[#8b1a1a]" />
                <h2 className="text-sm font-black text-[#1a0f08]">
                  🏛️ 총괄 관리자 홈 실무 매뉴얼 (Admin Hub 전 메뉴 공식 가이드)
                </h2>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                마스터 전용 메뉴 권한, 컷오프 DB 관리, 계정 발급, 가격 결제 총괄 지침서
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="/guides/대치수프리마_관리자홈_전메뉴_사용매뉴얼_및_운영가이드.pptx"
                download="대치수프리마_관리자홈_전메뉴_사용매뉴얼_및_운영가이드.pptx"
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-700 shadow-2xs transition hover:bg-red-50"
              >
                <Presentation size={13} />
                <span>관리자 Slide(PPTX)</span>
              </a>
              <a
                href="/guides/대치수프리마_관리자홈_전메뉴_사용매뉴얼_및_운영가이드.docx"
                download="대치수프리마_관리자홈_전메뉴_사용매뉴얼_및_운영가이드.docx"
                className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-bold text-blue-700 shadow-2xs transition hover:bg-blue-50"
              >
                <FileText size={13} />
                <span>관리자 Word(DOCX)</span>
              </a>
              <a
                href="/guides/대치수프리마_관리자홈_전메뉴_사용매뉴얼_및_운영가이드.xlsx"
                download="대치수프리마_관리자홈_전메뉴_사용매뉴얼_및_운영가이드.xlsx"
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-2xs transition hover:bg-emerald-50"
              >
                <FileSpreadsheet size={13} />
                <span>관리자 Excel(XLSX)</span>
              </a>
              <a
                href="/guides/대치수프리마_관리자홈_전메뉴_사용매뉴얼_및_운영가이드.md"
                download="대치수프리마_관리자홈_전메뉴_사용매뉴얼_및_운영가이드.md"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50"
              >
                <FileText size={13} />
                <span>관리자 Markdown(MD)</span>
              </a>
            </div>
          </div>

          <hr className="border-[#ebdcca]" />

          {/* Row 2: 컨설턴트 업무 매뉴얼 및 실무 가이드 */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Compass size={16} className="text-blue-800" />
                <h2 className="text-sm font-black text-[#1a0f08]">
                  🎓 컨설턴트 업무 매뉴얼 및 실무 가이드 (4대 실행 ➔ 월간 보고서 연계 지침서)
                </h2>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                진단 ➔ 플래너 ➔ 카카오 도서 세특 ➔ 월간 보고서 A4출력 & 학부모 메일링 표준 절차
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="/guides/대치수프리마_컨설턴트_업무매뉴얼_및_실무가이드.pptx"
                download="대치수프리마_컨설턴트_업무매뉴얼_및_실무가이드.pptx"
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-white px-3 py-1.5 text-xs font-bold text-amber-800 shadow-2xs transition hover:bg-amber-50"
              >
                <Presentation size={13} />
                <span>컨설턴트 Slide(PPTX)</span>
              </a>
              <a
                href="/guides/대치수프리마_컨설턴트_업무매뉴얼_및_실무가이드.docx"
                download="대치수프리마_컨설턴트_업무매뉴얼_및_실무가이드.docx"
                className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-white px-3 py-1.5 text-xs font-bold text-indigo-800 shadow-2xs transition hover:bg-indigo-50"
              >
                <FileText size={13} />
                <span>컨설턴트 Word(DOCX)</span>
              </a>
              <a
                href="/guides/대치수프리마_컨설턴트_업무매뉴얼_및_실무가이드.xlsx"
                download="대치수프리마_컨설턴트_업무매뉴얼_및_실무가이드.xlsx"
                className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-white px-3 py-1.5 text-xs font-bold text-teal-800 shadow-2xs transition hover:bg-teal-50"
              >
                <FileSpreadsheet size={13} />
                <span>컨설턴트 Excel(XLSX)</span>
              </a>
              <a
                href="/guides/대치수프리마_컨설턴트_업무매뉴얼_및_실무가이드.md"
                download="대치수프리마_컨설턴트_업무매뉴얼_및_실무가이드.md"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50"
              >
                <FileText size={13} />
                <span>컨설턴트 Markdown(MD)</span>
              </a>
            </div>
          </div>
        </div>`;

content = content.replace(/\r\n/g, '\n');
content = content.replace(oldDownloadBox.replace(/\r\n/g, '\n'), newDownloadBox.replace(/\r\n/g, '\n'));

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully updated AdminDashboardHub.tsx with dual manual download bars!');
