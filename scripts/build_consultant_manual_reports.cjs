const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('c:/Users/chris/Desktop/수프리마랩/학원용앱/node_modules/docx');
const XLSX = require('xlsx');
const pptxgen = require('pptxgenjs');

async function buildDocx() {
  const mdPath = path.join(__dirname, '../docs/대치수프리마_컨설턴트_업무매뉴얼_및_실무가이드.md');
  const mdContent = fs.readFileSync(mdPath, 'utf8');

  const children = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 140 },
      children: [
        new TextRun({
          text: '대치 수프리마 대입전략연구소 컨설턴트 업무 매뉴얼 및 실무 가이드',
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
          text: '대치수프리마 대입전략연구소 | 문서번호: SUPRIMA-MANUAL-CONSULTANT-2026-V1 | 대표: 이기욱 대표컨설턴트',
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
              text,
              size: 18,
              color: '333333',
            }),
          ],
        })
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      const text = trimmed.replace(/^\d+\.\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1');
      children.push(
        new Paragraph({
          spacing: { after: 60 },
          indent: { left: 360 },
          children: [
            new TextRun({
              text: `${trimmed.match(/^\d+\./)[0]} ${text}`,
              size: 18,
              color: '333333',
            }),
          ],
        })
      );
    } else {
      children.push(
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: trimmed.replace(/\*\*(.*?)\*\*/g, '$1'),
              size: 18,
              color: '444444',
            }),
          ],
        })
      );
    }
  }

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  const outPath = path.join(__dirname, '../docs/대치수프리마_컨설턴트_업무매뉴얼_및_실무가이드.docx');
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outPath, buffer);
  console.log(`Saved Consultant manual docx: ${outPath} (${buffer.length} bytes)`);

  const copyPath = path.join(__dirname, '../학원용앱/public/guides/대치수프리마_컨설턴트_업무매뉴얼_및_실무가이드.docx');
  fs.writeFileSync(copyPath, buffer);
  console.log(`Copied docx to ${copyPath}`);
}

function buildXlsx() {
  const wb = XLSX.utils.book_new();

  // Sheet 1: 4대 실행 항목 실무 대조표
  const s1Data = [
    ['대치수프리마 컨설턴트 4대 실행 사이클 실무 대조표'],
    ['문서번호', 'SUPRIMA-MANUAL-CONSULTANT-2026-V1', '발행일', '2026-11-16', '작성자', '이기욱 대표컨설턴트'],
    [],
    ['실행 단계', '실행 항목명', '실행 화면 경로', '핵심 도구 및 기능', '주요 실무 시나리오', '월간 활동 보고서 연계 항목', '최종 산출물'],
    ['01단계', '학생부·성적 정밀 진단', 'StudentDetail > 1.학생부분석', '5/9등급 자동 환산, 164개 대학 컷오프 DB', '신규 등록 원생 성적 분석, 취약 과목 도출, 수시 학종/교과 적합도 판별', '보고서 상단 학생 진단 프로필 & 목표 대학 라인', '성적 분석 리포트'],
    ['02단계', '주차별 밀착 플래너 관리', 'StudentDetail > 2.밀착플래너', '주차별 과제 부여, 체크리스트, 피드백 노트', '1~4주차 탐구 과제 출제, 과제 이행률(%) 자동 집계, 주간 피드백 기록', '1. 학습 태도 및 수업 참여도 분석 (과제 달성률 % 및 성실성 자동 반영)', '주차별 플래너 타임라인'],
    ['03단계', '카카오 도서 & 3단계 세특', 'StudentDetail > 3.세특추천&AI', '카카오 도서 DB 검색, 4단계 가이드, 3단계 세특', '희망 진로 맞춤 필독서 배정, 가설 수립, 나이스 동기-과정-변화 문장 검수', '2. 주제 탐구 및 과제 수행 역량 평가 (배정 도서명, 탐구 가설, 세특 완성도)', 'A4 맞춤 세특 추천서'],
    ['04단계', '월간 활동 보고서 발행', 'StudentDetail > 4.월간활동보고서', '[⚡실행 데이터 자동 집계], 3대 영역 평가서, 메일링', '월말 실행 데이터 1초 요약, 차월 계획 작성, A4 인쇄 및 학부모 메일 발송', '3. 향후 학습 및 입시 코칭 중점 계획 (차월 오답 클리닉 & 학기 로드맵)', '🖨️ A4 인쇄본 + ✉️ HTML 이메일'],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(s1Data);
  XLSX.utils.book_append_sheet(wb, ws1, '4대실행항목_실무대조표');

  // Sheet 2: 컨설턴트 운영 체크리스트
  const s2Data = [
    ['대치수프리마 컨설턴트 일간 · 주간 · 월말 운영 체크리스트'],
    [],
    ['점검 주기', '업무 항목', '실행 화면', '상세 작업 내용', '완료 기준 (DoD)'],
    ['매일 (Daily)', '신규 배정 학생 확인', '학생 CRM (Dashboard)', '원장/마스터가 배정한 신규 원생 확인 및 초기 학생 카드 생성', '배정 원생 100% 당일 확인'],
    ['매일 (Daily)', '과제 질문 답변 & 체크', '밀착 플래너 (planner)', '학생이 제출한 탐구 과제 검토, 체크박스 체크, 질문 답변', '당일 질문 100% 답변 완료'],
    ['매주 (Weekly)', '주차별 과제 달성률 갱신', '밀착 플래너 (planner)', '1~4주차 과제 이행률 집계 및 컨설턴트 관찰 코멘트 작성', '주차별 달성률 80% 이상 견인'],
    ['격주 (Bi-Weekly)', '카카오 도서 & 세특 배정', '세특 추천 (recommendation)', '카카오 도서 DB 연계 필독서 배정 및 3단계 세특 문장 검수', '과목별 추천서 1건 이상 발행'],
    ['매월 말 (Monthly)', '월간 활동 보고서 자동 집계', '월간 활동 보고서 (evaluation)', '[⚡실행 데이터 자동 집계] 클릭 ➔ 3대 영역 평가서 완성', '당월 수강생 100% 작성 완료'],
    ['매월 말 (Monthly)', 'A4 인쇄 & 학부모 메일링', '월간 활동 보고서 (evaluation)', '대면 상담용 A4 출력 및 [✉️ 학부모 메일 발송] 전송', '당월 수강생 학부모 100% 발송 완료'],
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(s2Data);
  XLSX.utils.book_append_sheet(wb, ws2, '컨설턴트_운영체크리스트');

  // Sheet 3: 학기제 기간 산정 & 지원 모델
  const s3Data = [
    ['대치수프리마 학기제 관리 기간 산정 공식 및 학원 지원 모델'],
    [],
    ['가입 시점', '목표 종료 시점', '관리 개월 수', '프로그램 성격', '컨설턴트 중점 과업'],
    ['12월 가입', '익년 2월 말 종료', '3개월', '겨울방학 학년 전환기 집중 케어', '전년도 학생부 세특 최종 보완 및 1학기 선행 독서 탐구'],
    ['5월 가입', '당해 8월 말 종료', '3개월', '1학기 기말고사 및 여름방학 집중 케어', '기말고사 내신 반등 및 1학기 세특 심화 보고서 완성'],
    ['3월 가입', '당해 8월 말 종료', '6개월', '1학기 풀코스 정규 케어', '중간·기말고사 대비 + 나이스 세특 3단계 최종 입력'],
    ['9월 가입', '익년 2월 말 종료', '6개월', '2학기 풀코스 정규 케어', '2학기 내신 관리 + 학년말 최종 세특 및 학년 총괄 평가서'],
    [],
    ['학원 유형', '지원 형태', '대치 수프리마 본사 지원 범위', '비용 정책'],
    ['유형 A (담당자 있음)', '정기 실무 교육 & 코칭', '컨설턴트 앱 Pro 전 기능 사용법 교육, 나이스 3단계 세특 검수 노하우 전수, 최신 입시 동향 정기 브리핑', 'B2B 정규 라이선스 비용'],
    ['유형 B (담당자 없음)', '전면 업무 대행 (풀 아웃소싱)', '본사 수석 컨설턴트가 실제 학원 담당자로 1:1 배치되어 진단, 플래너, 세특 검수, 월간 보고서 및 메일링 전체 대행', '도입 규모 및 원생 수 협의'],
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(s3Data);
  XLSX.utils.book_append_sheet(wb, ws3, '학기제기간산정_지원모델');

  const xlsxPath = path.join(__dirname, '../docs/대치수프리마_컨설턴트_업무매뉴얼_및_실무가이드.xlsx');
  XLSX.writeFile(wb, xlsxPath);
  console.log(`Saved Consultant manual xlsx: ${xlsxPath}`);

  const copyXlsx = path.join(__dirname, '../학원용앱/public/guides/대치수프리마_컨설턴트_업무매뉴얼_및_실무가이드.xlsx');
  XLSX.writeFile(wb, copyXlsx);
  console.log(`Copied xlsx to ${copyXlsx}`);

  // Copy MD
  const mdSrc = path.join(__dirname, '../docs/대치수프리마_컨설턴트_업무매뉴얼_및_실무가이드.md');
  const mdCopy = path.join(__dirname, '../학원용앱/public/guides/대치수프리마_컨설턴트_업무매뉴얼_및_실무가이드.md');
  fs.copyFileSync(mdSrc, mdCopy);
  console.log(`Copied md to ${mdCopy}`);
}

async function buildPptx() {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';

  const COLORS = {
    burgundy: '7A1212',
    burgundyDark: '4A0B0B',
    bgLight: 'FAF7F2',
    blueNavy: '1E3A8A',
    teal: '0F766E',
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
    slide.addText('대치수프리마 대입전략연구소 | 컨설턴트 업무 매뉴얼', {
      x: 7.5, y: 0.5, w: 5.0, h: 0.35, fontSize: 10, fontFace: FONT_BODY,
      color: COLORS.burgundy, bold: true, align: 'right', valign: 'middle',
    });
    slide.addShape(pres.ShapeType.line, {
      x: 0.8, y: 6.9, w: 11.733, h: 0, line: { color: COLORS.borderBeige, width: 1 },
    });
    slide.addText('대치수프리마 대입전략연구소 · 서울시 강남구 대치동 906-22 동관빌딩 4층 · 컨설턴트 표준 실무 지침서', {
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
      { text: '컨설턴트 실무 매뉴얼', options: { fontSize: 11.5, bold: true, color: COLORS.charcoal } },
    ], { x: 2.7, y: 0.42, w: 3.5, h: 0.55, fontFace: FONT_BODY, margin: 0 });

    s1.addShape(pres.ShapeType.roundRect, {
      x: 4.2, y: 1.5, w: 4.9, h: 0.38, rectRadius: 0.19,
      fill: { color: COLORS.white }, line: { color: 'E4D4BF', width: 1 },
    });
    s1.addText('✦ 컨설턴트 4대 실행 사이클 & 월간 보고서 가이드', {
      x: 4.2, y: 1.5, w: 4.9, h: 0.38, fontSize: 11, fontFace: FONT_BODY,
      color: COLORS.burgundy, bold: true, align: 'center', valign: 'middle',
    });

    s1.addText('컨설턴트 업무 매뉴얼 및 실무 가이드', {
      x: 1.0, y: 2.1, w: 11.333, h: 0.55, fontSize: 26, fontFace: FONT_TITLE,
      color: COLORS.darkText, bold: true, align: 'center',
    });
    s1.addText('실행 항목 정리 ➔ 밀착 코칭 ➔ 월간 보고서 출력 & 메일링', {
      x: 1.0, y: 2.65, w: 11.333, h: 0.75, fontSize: 34, fontFace: FONT_TITLE,
      color: COLORS.burgundy, bold: true, align: 'center',
    });

    s1.addText('진단부터 주차별 플래너, 카카오 도서 연계 3단계 세특, 월간 활동 보고서 자동 집계 및 학부모 메일링 완전 지침서', {
      x: 1.0, y: 3.5, w: 11.333, h: 0.45, fontSize: 13, fontFace: FONT_BODY,
      color: '222222', bold: true, align: 'center',
    });

    const cards = [
      { num: 'STEP 01', label: '학생부·성적 분석', desc: '5/9등급 환산 & 164개 대학 진단', color: COLORS.burgundy },
      { num: 'STEP 02', label: '주차별 밀착 플래너', desc: '1~4주차 과제 & 달성률 체크', color: COLORS.blueNavy },
      { num: 'STEP 03', label: '카카오 도서 & 세특', desc: '필독서 배정 & 3단계 세특 검수', color: COLORS.teal },
      { num: 'STEP 04', label: '월간 보고서 & 메일링', desc: 'Auto-Fill 자동집계 & A4/메일링', color: COLORS.amber },
    ];
    cards.forEach((c, idx) => {
      const cx = 0.85 + idx * 3.0;
      s1.addShape(pres.ShapeType.roundRect, {
        x: cx, y: 4.8, w: 2.65, h: 1.5, rectRadius: 0.15,
        fill: { color: COLORS.white }, line: { color: 'E8DECB', width: 1 },
      });
      s1.addText(c.num, {
        x: cx, y: 4.95, w: 2.65, h: 0.35, fontSize: 11, fontFace: FONT_BODY,
        color: c.color, bold: true, align: 'center', valign: 'middle',
      });
      s1.addText(c.label, {
        x: cx, y: 5.3, w: 2.65, h: 0.45, fontSize: 14, fontFace: FONT_TITLE,
        color: COLORS.darkText, bold: true, align: 'center', valign: 'middle',
      });
      s1.addText(c.desc, {
        x: cx, y: 5.75, w: 2.65, h: 0.45, fontSize: 9.5, fontFace: FONT_BODY,
        color: COLORS.slateText, align: 'center', valign: 'middle',
      });
    });
  }

  // Slide 2: 4대 실행 사이클 구조도
  {
    const s2 = pres.addSlide();
    s2.background = { color: COLORS.bgLight };
    addHeader(s2, '01. SYSTEM ARCHITECTURE', '컨설턴트 4대 실행 사이클 ➔ 보고서 연계 아키텍처', '일상에서 수행한 진단-플래닝-세특 코칭 결과가 [월간 활동 보고서]로 1초 만에 자동 집계됩니다.');

    const cycles = [
      {
        num: '01',
        title: '학생부·성적 정밀 진단',
        acts: '• 5등급제 ⟷ 9등급제 자동 환산\n• 164개 대학 26,295개 수시 컷오프 비교\n• 학종/교과 적합도 & 취약 과목 도출',
        out: '➔ 산출물: 학생 진단 프로필 & 목표 대학 라인',
        color: COLORS.burgundy,
      },
      {
        num: '02',
        title: '주차별 밀착 플래너 관리',
        acts: '• 1~4주차별 탐구 과제 부여\n• 학생 과제 완료 체크리스트 관리\n• 주차별 컨설턴트 관찰 피드백 기록',
        out: '➔ 산출물: 주차별 과제 달성률 (%) 실시간 산출',
        color: COLORS.blueNavy,
      },
      {
        num: '03',
        title: '카카오 도서 & 3단계 세특',
        acts: '• 학생 희망 진로 맞춤 카카오 필독서 배정\n• 4단계 프로세스 가이드 탐구 가설 수립\n• 3단계(동기-과정-변화) 나이스 세특 완성',
        out: '➔ 산출물: A4 규격 심화탐구·세특 맞춤 추천서',
        color: COLORS.teal,
      },
      {
        num: '04',
        title: '월간 활동 보고서 발행',
        acts: '• [⚡실행 데이터 자동 집계] 1-Click 실행\n• 3대 영역(태도/탐구/향후계획) 평가 완성\n• 학부모 대면/원격 전달 완료',
        out: '➔ 전달: 🖨️ A4 즉시 인쇄 + ✉️ 원클릭 메일링',
        color: COLORS.amber,
      },
    ];

    cycles.forEach((cy, idx) => {
      const x = 0.8 + idx * 3.0;
      s2.addShape(pres.ShapeType.roundRect, {
        x, y: 2.1, w: 2.8, h: 4.5, rectRadius: 0.15,
        fill: { color: COLORS.white }, line: { color: COLORS.borderBeige, width: 1 },
      });
      s2.addShape(pres.ShapeType.roundRect, {
        x: x + 0.2, y: 2.3, w: 1.1, h: 0.32, rectRadius: 0.08, fill: { color: cy.color },
      });
      s2.addText(`STEP ${cy.num}`, {
        x: x + 0.2, y: 2.3, w: 1.1, h: 0.32, fontSize: 10, fontFace: FONT_BODY,
        color: COLORS.white, bold: true, align: 'center', valign: 'middle',
      });
      s2.addText(cy.title, {
        x: x + 0.2, y: 2.75, w: 2.4, h: 0.45, fontSize: 13, fontFace: FONT_TITLE,
        color: COLORS.darkText, bold: true,
      });
      s2.addText(cy.acts, {
        x: x + 0.2, y: 3.25, w: 2.4, h: 1.7, fontSize: 10, fontFace: FONT_BODY,
        color: COLORS.slateText, lineSpacingMultiple: 1.25,
      });
      s2.addShape(pres.ShapeType.roundRect, {
        x: x + 0.15, y: 5.1, w: 2.5, h: 1.3, rectRadius: 0.08,
        fill: { color: 'F8FAFC' }, line: { color: 'E2E8F0', width: 1 },
      });
      s2.addText(cy.out, {
        x: x + 0.2, y: 5.15, w: 2.4, h: 1.2, fontSize: 9.5, fontFace: FONT_BODY,
        color: cy.color, bold: true, lineSpacingMultiple: 1.2,
      });
    });
  }

  // Slide 3: 월간 보고서 Auto-Fill 및 출력/메일링 상세
  {
    const s3 = pres.addSlide();
    s3.background = { color: COLORS.bgLight };
    addHeader(s3, '02. REPORT & MAILING', '월간 활동 보고서 자동 집계(Auto-Fill) & 전달 채널', 'Auto-Fill 버튼 1-Click으로 3대 평가 영역을 완성하고, A4 인쇄 및 정규 메일링으로 전달합니다.');

    // 2-Column: Auto-Fill 집계 영역 vs 전달 채널 (인쇄/메일링)
    s3.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 2.1, w: 5.65, h: 4.5, rectRadius: 0.15,
      fill: { color: COLORS.white }, line: { color: COLORS.burgundy, width: 1.5 },
    });
    s3.addShape(pres.ShapeType.roundRect, {
      x: 1.1, y: 2.35, w: 5.05, h: 0.55, rectRadius: 0.1, fill: { color: COLORS.burgundy },
    });
    s3.addText('⚡ [실행 데이터 자동 집계] 3대 평가 영역 구성', {
      x: 1.1, y: 2.35, w: 5.05, h: 0.55, fontSize: 13, fontFace: FONT_TITLE,
      color: COLORS.white, bold: true, align: 'center', valign: 'middle',
    });
    const reportFields = [
      '1. 학습 태도 및 수업 참여도 분석:\n   • 플래너 과제 달성률 % 실시간 집계 (예: 92% 달성)\n   • 성실성, 출결 및 컨설턴트 관찰 코멘트 자동 요약',
      '2. 주제 탐구 및 과제 수행 역량 평가:\n   • 카카오 도서 DB 배정 필독서명 자동 연동\n   • 4단계 프로세스 가이드 탐구 가설 및 3단계 세특 성취도',
      '3. 향후 학습 및 입시 코칭 중점 계획:\n   • 차월 취약 교과 오답 클리닉 및 모의고사 대비책\n   • 나이스 최종 기재 대비 3단계 문장 다듬기 로드맵',
    ];
    s3.addText(reportFields.join('\n\n'), {
      x: 1.1, y: 3.1, w: 5.05, h: 3.3, fontSize: 10.5, fontFace: FONT_BODY,
      color: '334155', lineSpacingMultiple: 1.25,
    });

    s3.addShape(pres.ShapeType.roundRect, {
      x: 6.883, y: 2.1, w: 5.65, h: 4.5, rectRadius: 0.15,
      fill: { color: COLORS.white }, line: { color: COLORS.blueNavy, width: 1.5 },
    });
    s3.addShape(pres.ShapeType.roundRect, {
      x: 7.183, y: 2.35, w: 5.05, h: 0.55, rectRadius: 0.1, fill: { color: COLORS.blueNavy },
    });
    s3.addText('🖨️ A4 즉시 인쇄 vs ✉️ 원클릭 메일링 전달 채널', {
      x: 7.183, y: 2.35, w: 5.05, h: 0.55, fontSize: 13, fontFace: FONT_TITLE,
      color: COLORS.white, bold: true, align: 'center', valign: 'middle',
    });
    const channels = [
      '채널 1. [🖨️ 즉시 인쇄 (A4)] (대면 상담용):\n• 대치수프리마 공식 직인("대치수프리마 입시&코칭센터 [인]") 날인\n• 공식 사업자 정보 푸터가 포함된 고품격 A4 단면 출력\n• 학부모 방문 상담 시 즉시 브리핑 자료로 활용',
      '채널 2. [✉️ 학부모/학생 메일 발송] (원격 전송용):\n• 수신자 이메일(학부모) 및 컨설턴트 전달 메모 입력\n• 본사 발송 서버(Resend) 연동 버건디 테마 정규 HTML 리포트\n• 모바일/PC 어디서나 최적화된 반응형 보고서 열람',
      '💡 핵심 효과:\n• 과제 수행률과 세특 문장이 투명하게 증명되어 학부모 신뢰도 극대화',
    ];
    s3.addText(channels.join('\n\n'), {
      x: 7.183, y: 3.1, w: 5.05, h: 3.3, fontSize: 10.5, fontFace: FONT_BODY,
      color: '334155', lineSpacingMultiple: 1.25,
    });
  }

  // Slide 4: 학기제 기간 공식 & 학원 지원 모델
  {
    const s4 = pres.addSlide();
    s4.background = { color: COLORS.bgLight };
    addHeader(s4, '03. TERM & SUPPORT MODEL', '1개 학기 관리 공식 & 학원 유형별(담당자 유/무) 지원', '종료시점-가입시점 잔여 개월수 공식과 학원 상황에 맞춘 이원화 지원 체계를 운영합니다.');

    // 2-Column: 학기제 공식 vs 학원 지원 모델
    s4.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: 2.1, w: 5.65, h: 4.5, rectRadius: 0.15,
      fill: { color: COLORS.white }, line: { color: COLORS.borderBeige, width: 1 },
    });
    s4.addShape(pres.ShapeType.roundRect, {
      x: 1.1, y: 2.35, w: 5.05, h: 0.45, rectRadius: 0.08, fill: { color: COLORS.burgundy },
    });
    s4.addText('1개 학기 단위 관리 기간 산정 공식', {
      x: 1.1, y: 2.35, w: 5.05, h: 0.45, fontSize: 12, fontFace: FONT_TITLE,
      color: COLORS.white, bold: true, align: 'center', valign: 'middle',
    });
    const termCases = [
      '• 산정 공식: 관리 개월 수 = 학기 종료 시점 - 가입 시점',
      '• 1학기 종료: 8월 말 / 2학기 종료: 익년 2월 말',
      '• 12월 가입 ➔ 2월 종료: 3개월 (겨울방학 선행 집중 코칭)',
      '• 5월 가입 ➔ 8월 종료: 3개월 (기말고사 & 여름 세특 완성)',
      '• 3월 가입 ➔ 8월 종료: 6개월 (1학기 정규 풀코스 케어)',
      '• 9월 가입 ➔ 2월 종료: 6개월 (2학기 정규 풀코스 케어)',
      '• 엄격한 100% 유료 프리미엄 모델 (무료 플랜 없음)',
    ];
    s4.addText(termCases.join('\n'), {
      x: 1.1, y: 3.0, w: 5.05, h: 3.4, fontSize: 11, fontFace: FONT_BODY,
      color: '334155', lineSpacingMultiple: 1.3,
    });

    s4.addShape(pres.ShapeType.roundRect, {
      x: 6.883, y: 2.1, w: 5.65, h: 4.5, rectRadius: 0.15,
      fill: { color: COLORS.white }, line: { color: COLORS.borderBeige, width: 1 },
    });
    s4.addShape(pres.ShapeType.roundRect, {
      x: 7.183, y: 2.35, w: 5.05, h: 0.45, rectRadius: 0.08, fill: { color: COLORS.blueNavy },
    });
    s4.addText('학원 유형별(담당자 유/무) 실무 지원 모델', {
      x: 7.183, y: 2.35, w: 5.05, h: 0.45, fontSize: 12, fontFace: FONT_TITLE,
      color: COLORS.white, bold: true, align: 'center', valign: 'middle',
    });
    const supportCases = [
      'Case A. 학원에 입시 담당자가 있는 경우:\n• 컨설턴트 앱 Pro 전 기능 사용법 1:1 실무 교육\n• 나이스 3단계 세특 검수 및 카카오 도서 매칭 코칭 전수\n• 수시 모집요강 변화 및 의치약한/상위권 정기 입시 교육\n• 월간 보고서 A4 출력 및 메일링 운영 시스템 완전 이식',
      'Case B. 학원에 입시 담당자가 없는 경우:\n• 대치 수프리마 본사 전문가가 실제 학원 담당자로 1:1 배치\n• 학생 진단, 플래너 관리, 세특 검수 전 과정 직접 수행\n• 월간 활동 보고서 A4 인쇄 및 학부모 메일링 100% 대행\n• 비용: 도입 규모 및 원생 수에 따라 별도 협의',
    ];
    s4.addText(supportCases.join('\n\n'), {
      x: 7.183, y: 3.0, w: 5.05, h: 3.4, fontSize: 10.5, fontFace: FONT_BODY,
      color: '334155', lineSpacingMultiple: 1.25,
    });
  }

  // Slide 5: 컨설턴트 체크리스트 & 학부모 상담 가이드
  {
    const s5 = pres.addSlide();
    s5.background = { color: COLORS.bgLight };
    addHeader(s5, '04. CHECKLIST & COUNSELING', '컨설턴트 운영 체크리스트 & 학부모 상담 화법 가이드', '일간/주간/월말 체크리스트를 준수하고, 데이터 기반 화법으로 학부모 만족도를 극대화합니다.');

    const cycles = [
      {
        cycle: '일간 (Daily)',
        title: '신규 배정 & 과제 체크',
        tasks: '• 신규 배정 학생 CRM 확인\n• 학생 과제 질문 당일 100% 응답\n• 플래너 과제 체크박스 갱신',
        color: COLORS.burgundy,
      },
      {
        cycle: '주간 (Weekly)',
        title: '플래너 달성률 & 피드백',
        tasks: '• 1~4주차 과제 달성률 업데이트\n• 컨설턴트 관찰 코멘트 작성\n• 진도 지연 학생 1:1 유선 독려',
        color: COLORS.blueNavy,
      },
      {
        cycle: '월말 (Monthly)',
        title: 'Auto-Fill & 메일링 발송',
        tasks: '• [⚡자동집계] 월간 보고서 완성\n• 차월 입시 로드맵 및 총평 작성\n• A4 인쇄 & 학부모 메일링 100%',
        color: COLORS.teal,
      },
    ];

    cycles.forEach((cy, idx) => {
      const x = 0.8 + idx * 4.0;
      s5.addShape(pres.ShapeType.roundRect, {
        x, y: 2.1, w: 3.733, h: 4.5, rectRadius: 0.15,
        fill: { color: COLORS.white }, line: { color: COLORS.borderBeige, width: 1 },
      });
      s5.addShape(pres.ShapeType.roundRect, {
        x: x + 0.3, y: 2.4, w: 1.6, h: 0.38, rectRadius: 0.08, fill: { color: cy.color },
      });
      s5.addText(cy.cycle, {
        x: x + 0.3, y: 2.4, w: 1.6, h: 0.38, fontSize: 11, fontFace: FONT_BODY,
        color: COLORS.white, bold: true, align: 'center', valign: 'middle',
      });
      s5.addText(cy.title, {
        x: x + 0.3, y: 2.95, w: 3.133, h: 0.45, fontSize: 15, fontFace: FONT_TITLE,
        color: COLORS.darkText, bold: true,
      });
      s5.addText(cy.tasks, {
        x: x + 0.3, y: 3.5, w: 3.133, h: 2.8, fontSize: 11, fontFace: FONT_BODY,
        color: COLORS.slateText, lineSpacingMultiple: 1.3,
      });
    });
  }

  const outPptx = path.join(__dirname, '../docs/대치수프리마_컨설턴트_업무매뉴얼_및_실무가이드.pptx');
  await pres.writeFile({ fileName: outPptx });
  console.log(`Saved Consultant manual pptx: ${outPptx}`);

  const copyPptx = path.join(__dirname, '../학원용앱/public/guides/대치수프리마_컨설턴트_업무매뉴얼_및_실무가이드.pptx');
  fs.copyFileSync(outPptx, copyPptx);
  console.log(`Copied pptx to ${copyPptx}`);
}

async function main() {
  await buildDocx();
  buildXlsx();
  await buildPptx();
}

main().catch(console.error);
