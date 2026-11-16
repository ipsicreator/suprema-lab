const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } = require('c:/Users/chris/Desktop/수프리마랩/학원용앱/node_modules/docx');
const XLSX = require('xlsx');
const pptxgen = require('pptxgenjs');

async function buildDocx() {
  const mdPath = path.join(__dirname, '../docs/대치수프리마_관리자홈_전메뉴_사용매뉴얼_및_운영가이드.md');
  const mdContent = fs.readFileSync(mdPath, 'utf8');

  const children = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 140 },
      children: [
        new TextRun({
          text: '대치 수프리마 대입전략연구소 관리자 홈(Admin Hub) 전 메뉴 실무 매뉴얼',
          bold: true,
          size: 32,
          color: '7A1212',
        }),
      ],
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 360 },
      children: [
        new TextRun({
          text: '대치수프리마 대입전략연구소 | 문서번호: SUPRIMA-MANUAL-ADMIN-2026-V1 | 대표: 이기욱 대표컨설턴트',
          size: 19,
          color: '666666',
        }),
      ],
    })
  );

  const lines = mdContent.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('---') || trimmed.startsWith('# 대치 수프리마')) continue;

    if (trimmed.startsWith('## ')) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 260, after: 120 },
          children: [
            new TextRun({
              text: trimmed.replace(/^##\s*/, ''),
              bold: true,
              size: 24,
              color: '7A1212',
            }),
          ],
        })
      );
    } else if (trimmed.startsWith('### ')) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({
              text: trimmed.replace(/^###\s*/, ''),
              bold: true,
              size: 21,
              color: '1E3A8A',
            }),
          ],
        })
      );
    } else if (trimmed.startsWith('#### ')) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 140, after: 70 },
          children: [
            new TextRun({
              text: trimmed.replace(/^####\s*/, ''),
              bold: true,
              size: 19,
              color: '222222',
            }),
          ],
        })
      );
    } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      const text = trimmed.replace(/^[*•-]\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1');
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: text,
              size: 18,
              color: '333333',
            }),
          ],
        })
      );
    } else if (!trimmed.startsWith('|') && !trimmed.startsWith('```')) {
      const cleanText = trimmed.replace(/\*\*(.*?)\*\*/g, '$1');
      children.push(
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: cleanText,
              size: 18,
              color: '333333',
            }),
          ],
        })
      );
    }
  }

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  const outPath = path.join(__dirname, '../docs/대치수프리마_관리자홈_전메뉴_사용매뉴얼_및_운영가이드.docx');
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outPath, buffer);
  console.log(`Saved Admin manual docx: ${outPath} (${buffer.length} bytes)`);

  const copyPath = path.join(__dirname, '../학원용앱/public/guides/대치수프리마_관리자홈_전메뉴_사용매뉴얼_및_운영가이드.docx');
  fs.writeFileSync(copyPath, buffer);
  console.log(`Copied docx to ${copyPath}`);
}

function buildXlsx() {
  const wb = XLSX.utils.book_new();

  // Sheet 1: 6대 메뉴 기능 요약표
  const s1Data = [
    ['대치수프리마 관리자 홈(Admin Hub) 6대 메뉴 실무 기능 대조표'],
    ['문서번호', 'SUPRIMA-MANUAL-ADMIN-2026-V1', '발행일', '2026-11-16', '책임자', '이기욱 대표컨설턴트'],
    [],
    ['메뉴 번호', '메뉴명', '접속 경로', '담당 대상', '핵심 용도', '주요 실무 시나리오', '핵심 작업 단계'],
    ['메뉴 01', '학원용 관리 앱 (컨설턴트 앱 Pro)', 'consultantapp.vercel.app', '총괄 마스터 / 원장 / 컨설턴트', '재원생 1:1 밀착 코칭 및 세특/추천서 발행', '신규 원생 등록, 5/9등급 분석, 카카오 도서 DB 매칭, 추천서 출력', '1.CRM 등록 ➔ 2.생기부 분석 ➔ 3.탐구 배정 ➔ 4.추천서 인쇄'],
    ['메뉴 02', '학원 권한·계정 발급 & 배정 점검', '/admin/academy', '총괄 마스터 전용', '전국 제휴 학원 원장/강사 계정 발급 및 배정 감사', '신규 B2B 학원 계정 발급, 강사 비밀번호 초기화, 학생 배정 점검', '1.학원 선택 ➔ 2.계정 발급 ➔ 3.비밀번호 전달 ➔ 4.감사 리포트'],
    ['메뉴 03', '입시 데이터 관리 (164개 대학 DB)', '/admin/admissions', '총괄 마스터 전용', '전국 164개 대학 26,295개 수시 컷오프 DB 업데이트', '최신 수시 결과 반영, 엑셀 대량 업로드, 오류 검증, 즉각 롤백', '1.엑셀 준비 ➔ 2.드래그 업로드 ➔ 3.유효성 검증 ➔ 4.실서비스 반영'],
    ['메뉴 04', '학생 개인 활동 · 계정 연결', '/admin/activities', '총괄 마스터 / 수석 컨설턴트', '학생 탐구/세특/독서 활동 이력 추적 및 6자리 연결 코드 관리', '학원-학생 연동 코드 확인/재발급, 과제 수정 버전별 이력 비교', '1.학생 조회 ➔ 2.연결 코드 확인 ➔ 3.활동 타임라인 검토'],
    ['메뉴 05', '가격 · 결제 관리', '/admin/pricing', '총괄 마스터 전용', 'B2C/B2B 이용 요금제 설정 및 카드/계좌 결제 내역 확인', '1/3/6개월 학기제 요금제 변경, 결제 승인 확인, 환불 처리', '1.요금제 설정 ➔ 2.결제 내역 모니터링 ➔ 3.매출 대조'],
    ['메뉴 06', '학생부 PDF 안전 보관소 점검', '인라인 설정 컴포넌트', '총괄 마스터 전용', '정부24 나이스 생활기록부 PDF 비공개 암호화 저장소 점검', '정기 시스템 점검, PDF OCR 파서 통신 진단, 암호화 상태 확인', '1.저장소 상태 확인 ➔ 2.통신 테스트 ➔ 3.보안 상태 유지'],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(s1Data);
  XLSX.utils.book_append_sheet(wb, ws1, '6대메뉴_실무대조표');

  // Sheet 2: 마스터 일간/주간/월간 운영 체크리스트
  const s2Data = [
    ['대치수프리마 마스터 관리자 운영 체크리스트'],
    [],
    ['점검 주기', '점검 항목', '실행 메뉴', '상세 작업 내용', '완료 기준 및 주의사항'],
    ['매일 (Daily)', '신규 결제 내역 대조', '가격·결제 관리 (/admin/pricing)', '당일 유료 가입 학생 결제 승인 내역 확인', '누락 결제 0건, 승인 오류 즉시 처리'],
    ['매일 (Daily)', '신규 제휴 학원 계정 발급', '학원 계정 관리 (/admin/academy)', '신규 B2B 학원 원장/강사 계정 생성 및 전달', '당일 접수 건 100% 당일 발급 완료'],
    ['매주 (Weekly)', '학원별 학생 배정 감사', '학원 계정 관리 (/admin/academy)', '미배정 학생 및 중복 배정 여부 감사 리포트 점검', '미배정 학생 0명 유지'],
    ['매주 (Weekly)', '컨설턴트 앱 활동 모니터링', '컨설턴트 앱 (consultantapp.vercel.app)', '학원별 탐구 배정 및 추천서 발행 진도 확인', '장기 미활동 학원 대상 지원 브리핑'],
    ['매월 (Monthly)', '최신 입결 컷오프 DB 갱신', '입시 데이터 관리 (/admin/admissions)', '대교협/대학별 발표 컷오프 엑셀 업로드 및 검증', '164개 대학 26,295개 전형 무결성 100%'],
    ['매월 (Monthly)', '학기제 관리 기간 정산', '가격 및 학기 관리', '~8월/~2월 마감 기준 잔여 개월수 산정 확인', '학기별 수강 기간 정확도 100%'],
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(s2Data);
  XLSX.utils.book_append_sheet(wb, ws2, '마스터_운영체크리스트');

  const xlsxPath = path.join(__dirname, '../docs/대치수프리마_관리자홈_전메뉴_사용매뉴얼_및_운영가이드.xlsx');
  XLSX.writeFile(wb, xlsxPath);
  console.log(`Saved Admin manual xlsx: ${xlsxPath}`);

  const copyXlsx = path.join(__dirname, '../학원용앱/public/guides/대치수프리마_관리자홈_전메뉴_사용매뉴얼_및_운영가이드.xlsx');
  XLSX.writeFile(wb, copyXlsx);
  console.log(`Copied xlsx to ${copyXlsx}`);

  // Copy MD
  const mdSrc = path.join(__dirname, '../docs/대치수프리마_관리자홈_전메뉴_사용매뉴얼_및_운영가이드.md');
  const mdCopy = path.join(__dirname, '../학원용앱/public/guides/대치수프리마_관리자홈_전메뉴_사용매뉴얼_및_운영가이드.md');
  fs.copyFileSync(mdSrc, mdCopy);
  console.log(`Copied md to ${mdCopy}`);
}

async function buildPptx() {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';

  const COLORS = {
    bgLight: 'FAF8F5',
    cardBg: 'FFFFFF',
    burgundy: '8B1A1A',
    navy: '1E3A8A',
    blueNavy: '1E5A84',
    teal: '0E7070',
    darkText: '1A1A1A',
    charcoal: '2A1B12',
    slateText: '475569',
    borderBeige: 'EADFCE',
    lightBeige: 'F4EFE6',
    white: 'FFFFFF',
    badgeBg: 'FFF5F5',
    amber: 'D97706',
  };

  const FONT_TITLE = 'Malgun Gothic';
  const FONT_BODY = 'Malgun Gothic';

  function addHeader(slide, cat, title, sub) {
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 0.5, w: 2.2, h: 0.35, rectRadius: 0.15,
      fill: { color: COLORS.badgeBg }, line: { color: COLORS.burgundy, width: 1 },
    });
    slide.addText(cat, {
      x: 0.8, y: 0.5, w: 2.2, h: 0.35, fontSize: 10, fontFace: FONT_BODY,
      color: COLORS.burgundy, bold: true, align: 'center', valign: 'middle',
    });
    slide.addText(title, {
      x: 0.8, y: 0.95, w: 11.7, h: 0.55, fontSize: 22, fontFace: FONT_TITLE,
      color: COLORS.darkText, bold: true,
    });
    if (sub) {
      slide.addText(sub, {
        x: 0.8, y: 1.5, w: 11.7, h: 0.35, fontSize: 12, fontFace: FONT_BODY,
        color: COLORS.slateText,
      });
    }
    slide.addText('대치수프리마 대입전략연구소 | 관리자 홈 매뉴얼', {
      x: 7.5, y: 0.5, w: 5.0, h: 0.35, fontSize: 10, fontFace: FONT_BODY,
      color: COLORS.burgundy, bold: true, align: 'right', valign: 'middle',
    });
    slide.addShape(pres.ShapeType.line, {
      x: 0.8, y: 6.9, w: 11.733, h: 0, line: { color: COLORS.borderBeige, width: 1 },
    });
    slide.addText('대치수프리마 대입전략연구소 · 서울시 강남구 테헤란로 326 B1F · 최고 관리자 지침서', {
      x: 0.8, y: 6.95, w: 11.733, h: 0.35, fontSize: 9, fontFace: FONT_BODY, color: COLORS.slateText,
    });
  }

  // Slide 1: Cover
  {
    const s1 = pres.addSlide();
    s1.background = { color: COLORS.bgLight };

    const logoPath = path.resolve('public/suprema-official-logo.png');
    if (fs.existsSync(logoPath)) {
      s1.addImage({ path: logoPath, x: 0.8, y: 0.45, w: 1.6, h: 0.5 });
    }
    s1.addShape(pres.ShapeType.line, { x: 2.55, y: 0.45, w: 0, h: 0.5, line: { color: 'D8C8B4', width: 1.5 } });
    s1.addText([
      { text: '대치 수프리마 대입전략연구소\n', options: { fontSize: 9.5, bold: true, color: COLORS.burgundy } },
      { text: '관리자 홈 실무 매뉴얼', options: { fontSize: 11.5, bold: true, color: COLORS.charcoal } },
    ], { x: 2.7, y: 0.42, w: 3.5, h: 0.55, fontFace: FONT_BODY, margin: 0 });

    s1.addShape(pres.ShapeType.roundRect, {
      x: 4.4, y: 1.5, w: 4.5, h: 0.38, rectRadius: 0.19,
      fill: { color: COLORS.white }, line: { color: 'E4D4BF', width: 1 },
    });
    s1.addText('✦ 마스터 관리자(Admin Hub) 실무 매뉴얼', {
      x: 4.4, y: 1.5, w: 4.5, h: 0.38, fontSize: 11, fontFace: FONT_BODY,
      color: COLORS.burgundy, bold: true, align: 'center', valign: 'middle',
    });

    s1.addText('관리자 홈(Admin Hub) 전 메뉴 상세 매뉴얼', {
      x: 1.0, y: 2.1, w: 11.333, h: 0.55, fontSize: 26, fontFace: FONT_TITLE,
      color: COLORS.darkText, bold: true, align: 'center',
    });
    s1.addText('마스터 권한 및 6대 핵심 관리자 기능 완전 가이드', {
      x: 1.0, y: 2.65, w: 11.333, h: 0.75, fontSize: 36, fontFace: FONT_TITLE,
      color: COLORS.burgundy, bold: true, align: 'center',
    });

    s1.addText('학원용 관리 앱 전 기능 오픈부터 164개 대학 입결 DB 관리, 학원 계정 발급, 결제 정책 총괄 가이드', {
      x: 1.0, y: 3.5, w: 11.333, h: 0.45, fontSize: 13, fontFace: FONT_BODY,
      color: '222222', bold: true, align: 'center',
    });

    const cards = [
      { num: '학원용 관리 앱', label: '학생 CRM & 세특 코칭', color: COLORS.burgundy },
      { num: '학원 계정 관리', label: '원장/강사 발급 & 감사', color: COLORS.blueNavy },
      { num: '164개 대학 DB', label: '26,295개 컷오프 배포', color: COLORS.teal },
      { num: '학생 활동/결제', label: '연결 코드 & 결제 대조', color: COLORS.darkText },
    ];
    cards.forEach((c, idx) => {
      const cx = 0.85 + idx * 3.0;
      s1.addShape(pres.ShapeType.roundRect, {
        x: cx, y: 4.8, w: 2.65, h: 1.5, rectRadius: 0.15,
        fill: { color: COLORS.white }, line: { color: 'E8DECB', width: 1 },
      });
      s1.addText(c.num, {
        x: cx, y: 5.0, w: 2.65, h: 0.6, fontSize: 16, fontFace: FONT_TITLE,
        color: c.color, bold: true, align: 'center', valign: 'middle',
      });
      s1.addText(c.label, {
        x: cx, y: 5.65, w: 2.65, h: 0.45, fontSize: 11, fontFace: FONT_BODY,
        color: '334155', bold: true, align: 'center', valign: 'middle',
      });
    });
  }

  // Slide 2: 6대 메뉴 구조도
  {
    const s2 = pres.addSlide();
    s2.background = { color: COLORS.bgLight };
    addHeader(s2, '01. MENU STRUCTURE', '관리자 홈(Admin Hub) 6대 핵심 메뉴 전체 구조도', '학원 코칭 실무부터 계정 발급, 입결 빅데이터, 결제 정책까지 3대 영역으로 체계화되어 있습니다.');

    const menus = [
      { num: '01', title: '학원용 관리 앱 (컨설턴트 앱)', cat: '학원 코칭 실무', desc: '재원생 CRM 등록, 5/9등급 분석, 카카오 도서 DB 매칭, 세특 검수 및 A4 추천서/평가서 1-Click 출력', color: COLORS.burgundy },
      { num: '02', title: '학원 권한·계정 발급 & 배정 점검', cat: '제휴 계정 관제', desc: '제휴 학원 원장(admin) 및 강사(consultant) 계정 신규 발급, 비밀번호 즉시 초기화, 학생 배정 상태 감사', color: COLORS.blueNavy },
      { num: '03', title: '입시 데이터 관리 (164개 대학)', cat: '입시 빅데이터', desc: '164개 대학 26,295개 수시 전형 최신 입결 컷오프 엑셀 업로드, 유효성 자동 검증, 실서비스 배포 및 롤백', color: COLORS.teal },
      { num: '04', title: '학생 개인 활동 · 계정 연결', cat: '학생 활동 추적', desc: '학생-학원 6자리 암호화 연결 코드 조회, 탐구 보고서/도서/세특 버전별 수정 이력 실시간 모니터링', color: COLORS.charcoal },
      { num: '05', title: '가격 · 결제 관리', cat: '비즈니스 정산', desc: '1개월/3개월/6개월 서비스 플랜별 정가/할인가 설정, 카드/계좌 결제 승인 내역 대조, B2B 정산 관리', color: COLORS.amber },
      { num: '06', title: '학생부 PDF 안전 보관소 점검', cat: '인프라 보안', desc: '나이스 학교생활기록부 PDF 비공개 파일 암호화 버킷 연결 상태 및 AI 텍스트 파서 통신 무결성 점검', color: COLORS.slateText },
    ];

    menus.forEach((m, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const x = 0.8 + col * 4.0;
      const y = 2.1 + row * 2.35;

      s2.addShape(pres.ShapeType.roundRect, {
        x, y, w: 3.733, h: 2.15, rectRadius: 0.15,
        fill: { color: COLORS.white }, line: { color: COLORS.borderBeige, width: 1 },
      });
      s2.addShape(pres.ShapeType.roundRect, {
        x: x + 0.25, y: y + 0.2, w: 0.65, h: 0.35, rectRadius: 0.08, fill: { color: m.color },
      });
      s2.addText(m.num, {
        x: x + 0.25, y: y + 0.2, w: 0.65, h: 0.35, fontSize: 11, fontFace: FONT_BODY,
        color: COLORS.white, bold: true, align: 'center', valign: 'middle',
      });
      s2.addText(m.title, {
        x: x + 1.0, y: y + 0.2, w: 2.5, h: 0.35, fontSize: 12, fontFace: FONT_TITLE,
        color: COLORS.darkText, bold: true, valign: 'middle',
      });
      s2.addText(m.cat, {
        x: x + 0.25, y: y + 0.6, w: 3.2, h: 0.25, fontSize: 9.5, fontFace: FONT_BODY,
        color: m.color, bold: true,
      });
      s2.addText(m.desc, {
        x: x + 0.25, y: y + 0.9, w: 3.233, h: 1.1, fontSize: 9.5, fontFace: FONT_BODY,
        color: COLORS.slateText, lineSpacingMultiple: 1.2,
      });
    });
  }

  // Slide 3: 마스터의 컨설턴트 앱 전 기능 오픈 권한
  {
    const s3 = pres.addSlide();
    s3.background = { color: COLORS.bgLight };
    addHeader(s3, '02. MASTER PRIVILEGE', '마스터 로그인 시 학원 관리자·컨설턴트 전 기능 오픈', '마스터 계정은 단일 학원의 한계를 넘어 전체 제휴 학원의 관리자 및 컨설턴트 권한을 무제한으로 행사합니다.');

    // 2-Column: 학원 관리자 액션 vs 컨설턴트 액션
    s3.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 2.1, w: 5.65, h: 4.5, rectRadius: 0.15,
      fill: { color: COLORS.white }, line: { color: COLORS.burgundy, width: 1.5 },
    });
    s3.addShape(pres.ShapeType.roundRect, {
      x: 1.1, y: 2.35, w: 5.05, h: 0.55, rectRadius: 0.1, fill: { color: COLORS.burgundy },
    });
    s3.addText('마스터의 학원 관리자(Admin) 권한 범위', {
      x: 1.1, y: 2.35, w: 5.05, h: 0.55, fontSize: 13, fontFace: FONT_TITLE,
      color: COLORS.white, bold: true, align: 'center', valign: 'middle',
    });
    const adminActions = [
      '• 학원 내 등록된 전체 강사/컨설턴트 계정 및 재원생 현황 조회',
      '• 학생별 담당 컨설턴트 1-Click 배정, 변경 및 회수',
      '• 소속 학원 프로필 정보 및 B2B 라이선스 상태 관리',
      '• 학원 관리자 홈 (`AdminDashboard`) 및 환경설정 (`Settings`) 접근',
      '• 미배정 학생 및 중복 배정 오류 즉각 정리 권한',
    ];
    s3.addText(adminActions.join('\n\n'), {
      x: 1.1, y: 3.15, w: 5.05, h: 3.2, fontSize: 11, fontFace: FONT_BODY,
      color: '334155', lineSpacingMultiple: 1.2,
    });

    s3.addShape(pres.ShapeType.roundRect, {
      x: 6.883, y: 2.1, w: 5.65, h: 4.5, rectRadius: 0.15,
      fill: { color: COLORS.white }, line: { color: COLORS.blueNavy, width: 1.5 },
    });
    s3.addShape(pres.ShapeType.roundRect, {
      x: 7.183, y: 2.35, w: 5.05, h: 0.55, rectRadius: 0.1, fill: { color: COLORS.blueNavy },
    });
    s3.addText('마스터의 담당 컨설턴트(Consultant) 권한 범위', {
      x: 7.183, y: 2.35, w: 5.05, h: 0.55, fontSize: 13, fontFace: FONT_TITLE,
      color: COLORS.white, bold: true, align: 'center', valign: 'middle',
    });
    const consultantActions = [
      '• 모든 학생의 5등급/9등급 내신 성적 추이 및 취약 과목 정밀 분석',
      '• 카카오 도서 DB 연계 심화 탐구 주제 및 추천 도서 1-Click 배정',
      '• 나이스 기재 기준에 부합하는 3단계 완성형 세특 문장 검수/수정',
      '• 중간·기말고사 직후 학부모 상담용 학기별 종합 성장평가서 작성/출력',
      '• 164개 대학 26,295개 전형 컷오프 기반 모의 위치 진단 및 추천서 발행',
    ];
    s3.addText(consultantActions.join('\n\n'), {
      x: 7.183, y: 3.15, w: 5.05, h: 3.2, fontSize: 11, fontFace: FONT_BODY,
      color: '334155', lineSpacingMultiple: 1.2,
    });
  }

  // Slide 4: 1일 / 주간 / 월간 운영 체크리스트
  {
    const s4 = pres.addSlide();
    s4.background = { color: COLORS.bgLight };
    addHeader(s4, '03. MASTER CHECKLIST', '마스터 관리자 일간·주간·월간 운영 루틴 체크리스트', '체계적인 주기별 점검 루틴으로 오차 없는 전국 입시 솔루션을 유지합니다.');

    const cycles = [
      {
        cycle: '일간 (Daily)',
        title: '신규 결제 확인 & 계정 발급',
        tasks: '• 당일 접수된 개인(B2C) 유료 결제 승인 내역 대조\n• 신규 제휴 학원(B2B) 원장/강사 계정 생성 및 전달\n• 로그인 장애 및 비밀번호 초기화 요청 즉시 처리',
        color: COLORS.burgundy,
      },
      {
        cycle: '주간 (Weekly)',
        title: '학원별 배정 점검 & 코칭 지원',
        tasks: '• 학원별 미배정/중복 배정 학생 감사 리포트 점검\n• 컨설턴트 앱 내 학생 상담 및 세특 추천서 발행 진도 확인\n• 코칭 미진행 학원 대상 실무 브리핑 지원',
        color: COLORS.blueNavy,
      },
      {
        cycle: '월간 (Monthly)',
        title: '입결 DB 갱신 & 학기 정산',
        tasks: '• 대교협/대학별 발표 최신 컷오프 엑셀 검증 및 실서비스 배포\n• ~8월/~2월 학기 마감 기준 잔여 개월수 산정 확인\n• 월간 B2B 라이선스 비용 정산 및 서버 보안 점검',
        color: COLORS.teal,
      },
    ];

    cycles.forEach((cy, idx) => {
      const x = 0.8 + idx * 4.0;
      s4.addShape(pres.ShapeType.roundRect, {
        x, y: 2.1, w: 3.733, h: 4.5, rectRadius: 0.15,
        fill: { color: COLORS.white }, line: { color: COLORS.borderBeige, width: 1 },
      });
      s4.addShape(pres.ShapeType.roundRect, {
        x: x + 0.3, y: 2.4, w: 1.6, h: 0.38, rectRadius: 0.08, fill: { color: cy.color },
      });
      s4.addText(cy.cycle, {
        x: x + 0.3, y: 2.4, w: 1.6, h: 0.38, fontSize: 11, fontFace: FONT_BODY,
        color: COLORS.white, bold: true, align: 'center', valign: 'middle',
      });
      s4.addText(cy.title, {
        x: x + 0.3, y: 2.95, w: 3.133, h: 0.45, fontSize: 15, fontFace: FONT_TITLE,
        color: COLORS.darkText, bold: true,
      });
      s4.addText(cy.tasks, {
        x: x + 0.3, y: 3.5, w: 3.133, h: 2.8, fontSize: 11, fontFace: FONT_BODY,
        color: COLORS.slateText, lineSpacingMultiple: 1.3,
      });
    });
  }

  const outPptx = path.join(__dirname, '../docs/대치수프리마_관리자홈_전메뉴_사용매뉴얼_및_운영가이드.pptx');
  await pres.writeFile({ fileName: outPptx });
  console.log(`Saved Admin manual pptx: ${outPptx}`);

  const copyPptx = path.join(__dirname, '../학원용앱/public/guides/대치수프리마_관리자홈_전메뉴_사용매뉴얼_및_운영가이드.pptx');
  fs.copyFileSync(outPptx, copyPptx);
  console.log(`Copied pptx to ${copyPptx}`);
}

async function main() {
  await buildDocx();
  buildXlsx();
  await buildPptx();
}

main().catch(console.error);
