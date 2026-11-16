const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } = require('c:/Users/chris/Desktop/수프리마랩/학원용앱/node_modules/docx');
const XLSX = require('xlsx');

async function buildDocx() {
  const mdPath = path.join(__dirname, '../docs/대치수프리마_나의입시멘토_컨설턴트앱_B2B_제안서.md');
  const mdContent = fs.readFileSync(mdPath, 'utf8');

  const children = [];

  // Title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 140 },
      children: [
        new TextRun({
          text: '[대치수프리마] 「나의 입시멘토 + 컨설턴트 앱」 학원 전용 B2B 제안서',
          bold: true,
          size: 34,
          color: '7A1212',
        }),
      ],
    })
  );

  // Subtitle
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 360 },
      children: [
        new TextRun({
          text: '대치수프리마 대입전략연구소 | 문서번호: SUPRIMA-B2B-PROPOSAL-2026-01 (대표: 이기욱 대표컨설턴트)',
          size: 19,
          color: '666666',
        }),
      ],
    })
  );

  const lines = mdContent.split('\n');
  let inTable = false;
  let tableRows = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('---') || trimmed.startsWith('# [대치수프리마]')) continue;

    // Handle Markdown Tables
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (trimmed.includes('---')) continue;
      const rawCols = trimmed.split('|').slice(1, -1).map(c => c.trim().replace(/<br>/g, '\n').replace(/&nbsp;/g, ' ').replace(/\*\*/g, ''));
      const isHeader = !inTable;
      inTable = true;

      const cells = rawCols.map((colText, idx) => {
        const textRuns = colText.split('\n').map(p => new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: p.trim(),
              bold: isHeader,
              size: isHeader ? 19 : 18,
              color: isHeader ? 'FFFFFF' : '333333',
            })
          ]
        }));

        return new TableCell({
          width: {
            size: idx === 0 ? 2500 : idx === 1 ? 4000 : idx === 2 ? 4500 : 2500,
            type: WidthType.DXA,
          },
          shading: {
            fill: isHeader ? '7A1212' : (tableRows.length % 2 === 1 ? 'F8FAFC' : 'FFFFFF'),
          },
          margins: { top: 120, bottom: 120, left: 140, right: 140 },
          children: textRuns,
        });
      });

      tableRows.push(new TableRow({ children: cells }));
      continue;
    } else if (inTable) {
      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
            left: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
            right: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: 'E2E8F0' },
            insideVertical: { style: BorderStyle.SINGLE, size: 2, color: 'E2E8F0' },
          },
          rows: tableRows,
        })
      );
      children.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
      inTable = false;
      tableRows = [];
    }

    if (trimmed.startsWith('## ')) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 120 },
          children: [
            new TextRun({
              text: trimmed.replace('## ', ''),
              bold: true,
              size: 26,
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
              text: trimmed.replace('### ', ''),
              bold: true,
              size: 22,
              color: '1A0F08',
            }),
          ],
        })
      );
    } else if (trimmed.startsWith('> ')) {
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 120 },
          children: [
            new TextRun({
              text: trimmed.replace('> ', '').replace(/\*\*/g, ''),
              bold: true,
              size: 19,
              color: '7A1212',
            }),
          ],
        })
      );
    } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: trimmed.replace(/^[\*\-]\s+/, '').replace(/\*\*/g, ''),
              size: 19,
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
              text: trimmed.replace(/\*\*/g, ''),
              size: 19,
              color: '222222',
            }),
          ],
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, '../docs/대치수프리마_나의입시멘토_컨설턴트앱_B2B_제안서.docx');
  fs.writeFileSync(outPath, buffer);
  console.log(`Saved B2B proposal docx: ${outPath} (${buffer.length} bytes)`);

  const publicOut = path.join(__dirname, '../학원용앱/public/guides/대치수프리마_나의입시멘토_컨설턴트앱_B2B_제안서.docx');
  fs.writeFileSync(publicOut, buffer);
  const rootPublicOut = path.join(__dirname, '../public/guides/대치수프리마_나의입시멘토_컨설턴트앱_B2B_제안서.docx');
  fs.writeFileSync(rootPublicOut, buffer);
}

function buildXlsx() {
  const wb = XLSX.utils.book_new();

  // Sheet 1: 2-Track 맞춤 모델
  const s1Data = [
    {
      "구분": "[Track A] 학원에 입시 담당자가 있는 경우",
      "운영 모델": "시스템 라이선스 + 정기 교육형",
      "대상 학원": "입시 상담실장, 부원장, 생기부 전담 강사가 상주하는 학원",
      "제공 서비스": "• 컨설턴트 앱 마스터/서브 계정 부여\n• 주차별 플래너, 시기별 시험기간 D-Day 설정, 수행평가 연계 기능 전면 개방\n• 월간 활동 보고서 자동 생성(Auto-Fill) 및 학부모 이메일 직발송 엔진 제공\n• 월 1회 최신 수시 전형 및 컷오프 변동 브리핑\n• 분기별 2028 개편 및 고교학점제 세특 지도법 워크숍\n• 카카오 도서 DB 기반 탐구 가이드북 및 설명회 PPT 템플릿 제공",
      "학원 이점": "원내 자체 입시 컨설턴트 역량 내재화, 매월 학부모 보고서 발송으로 원생 이탈 0% 달성, 선생님 업무 90% 절감",
      "비용": "상호 협의 (원생 규모 및 계정 수 연동)"
    },
    {
      "구분": "[Track B] 학원에 입시 담당자가 없는 경우",
      "운영 모델": "올인원 실전 업무대행 풀패키지형",
      "대상 학원": "1인 원장 체제, 과목 강사 중심, 입시 전담 인력이 전무한 학원",
      "제공 서비스": "• 대치수프리마 전문 연구원이 실제 학원 입시 연구소로 100% 업무 대행\n• 학생부 등록 및 암호화 코드 연동 전담\n• 주차별 학습 플래너 및 시기별 시험 D-Day 집중 케어\n• 학교 수행평가 주제 첨삭 및 카카오 도서 DB 연계 1-Click 배정 대행\n• 나이스 기재용 3단계 완성형 세특 검수 및 최종 리포트 학원 로고로 발행\n• 매월 학부모 발송용 월간 활동 보고서 작성, A4 출력본 전달 및 학부모 이메일 직발송 대행\n• 학부모 입시 질의 시 전문 스크립트 서면 지원",
      "학원 이점": "추가 인건비 부담 없이 원내 대치동 입시 연구소 즉시 보유, 원장님은 영업/수업에만 집중",
      "비용": "상호 협의 (원생 규모 및 관리 학생 수 연동)"
    }
  ];
  const ws1 = XLSX.utils.json_to_sheet(s1Data);
  ws1['!cols'] = [{ wch: 32 }, { wch: 28 }, { wch: 35 }, { wch: 65 }, { wch: 55 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, ws1, '2-Track 운영 모델');

  // Sheet 2: 프로그램 특장점 및 도입 효과
  const s2Data = [
    { "분류": "7대 핵심 특장점", "항목": "164개 대학 입결 DB", "상세 내용": "26,295개 수시 전형 최신 입결 컷오프 기반 실시간 6개 대학 모의 합불 산출" },
    { "분류": "7대 핵심 특장점", "항목": "2028 개편안 완벽 대응", "상세 내용": "5등급제 ⟷ 9등급제 실시간 양방향 자동 환산 및 이수 과목 적합도 정밀 분석" },
    { "분류": "7대 핵심 특장점", "항목": "독서 필수 연계 세특", "상세 내용": "카카오 도서 DB 공식 연계 + 제미나이 AI 기반 나이스 기재용 3단계 완성형 세특 도출" },
    { "분류": "7대 핵심 특장점", "항목": "1초 코드 동기화", "상세 내용": "학생 계정 암호화 코드를 컨설턴트 앱에 1초 연동, 1-Click 사회/과학 AI 탐구 배정" },
    { "분류": "7대 핵심 특장점", "항목": "주차별 플래너 & 시험 D-Day", "상세 내용": "시기별 시험기간(중간/기말/모평/수능) D-Day 실시간 카운트다운 배너 및 주차별 완수율 추적" },
    { "분류": "7대 핵심 특장점", "항목": "학교 수행평가 연계 탐구", "상세 내용": "NEIS 세특의 핵심 근거인 학교 수행평가 주제를 기입하고 카카오 도서 연계 3단계 세특 초안 완성" },
    { "분류": "7대 핵심 특장점", "항목": "월간 활동 보고서 & 메일링", "상세 내용": "한 달간의 실행 데이터를 [Auto-Fill] 1클릭으로 집계, A4 원클릭 인쇄 및 학부모 이메일 직발송" },
    { "분류": "학원 도입 5대 효과", "항목": "재원생 이탈 0% 달성", "상세 내용": "매월 정기 발송되는 고품격 학부모 월간 활동 보고서로 신뢰도 및 수강 유지율(Retention) 극대화" },
    { "분류": "학원 도입 5대 효과", "항목": "원생 모집 무기 확보", "상세 내용": "대치동 공신력 기반 학생부 정밀 진단 설명회 개최로 신규 등록 전환율 300% 증대" },
    { "분류": "학원 도입 5대 효과", "항목": "선생님 피로도 90% 절감", "상세 내용": "도서 탐색, 세특 첨삭, 월간 보고서 작성 시간 10초로 단축, 본 수업과 학생 관리에만 집중" },
    { "분류": "학원 도입 5대 효과", "항목": "수행평가 시즌 완벽 방어", "상세 내용": "학교 수행평가 과제 맞춤 도서 및 나이스 세특 초안을 즉각 지원하여 학생 만족도 극대화" },
    { "분류": "학원 도입 5대 효과", "항목": "학원 브랜드 가치 격상", "상세 내용": "단순 점수 보습학원에서 학생부종합전형까지 케어하는 프리미엄 입시 명문으로 전환" }
  ];
  const ws2 = XLSX.utils.json_to_sheet(s2Data);
  ws2['!cols'] = [{ wch: 20 }, { wch: 25 }, { wch: 75 }];
  XLSX.utils.book_append_sheet(wb, ws2, '특장점 및 도입 효과');

  // Sheet 3: 학기제 기반 관리 기간 모델 (종료 시점 - 가입 시점 = 잔여 개월 수)
  const s3Data = [
    {
      "관리 과정": "학기 정규 풀케어 (6개월 과정)",
      "기간 산정 공식": "학기 종료 시점(~8월 또는 ~2월) - 가입 시점",
      "가입 시점 예시": "• 1학기: 3월 가입 ➔ 8월 종료 (6개월 풀코스)\n• 2학기: 9월 가입 ➔ 2월 종료 (6개월 풀코스)",
      "주요 케어 내용": "학기 전 과정 교과 성적 추이 심층 분석, 주차별 밀착 플래너 관리 및 시험기간 D-Day 코칭, 학교 수행평가 첨삭 및 카카오 도서 매칭, 생기부 전 영역 밀착 코칭",
      "제공 결과물": "매월 대치수프리마 월간 활동 보고서 (A4 인쇄 & 학부모 이메일 발송), 학기별 교과 세특 완성 포트폴리오, 독서 기록장, 학기 종합 리포트"
    },
    {
      "관리 과정": "학기 집중 케어 (3~4개월 과정) ★ 추천",
      "기간 산정 공식": "학기 종료 시점(~8월 또는 ~2월) - 가입 시점",
      "가입 시점 예시": "• 1학기: 5월 가입 ➔ 8월 종료 (3~4개월 기말/여름집중)\n• 2학기: 12월 가입 ➔ 2월 종료 (3개월 겨울방학/학년말집중)",
      "주요 케어 내용": "중간·기말고사 직후 집중 탐구활동 설계 및 도서 연계, 시기별 시험기간 D-Day 집중 대비, 학교 수행평가 집중 연계 세특 문장 완성, 나이스 마감 대비 3단계 세특 문장 감수",
      "제공 결과물": "매월 대치수프리마 월간 활동 보고서 (A4 인쇄 & 학부모 이메일 발송), 집중 세특 완성본 (A4), 방학 과제 연계 탐구보고서"
    },
    {
      "관리 과정": "단기 속성 진단 (1개월 과정)",
      "기간 산정 공식": "수시 원서 직전 단기 집중 (8~9월)",
      "가입 시점 예시": "수시 원서 접수 직전 수험생 또는 신규 유입 원생 입학 진단용",
      "주요 케어 내용": "2028 개편 5등급 환산 정밀 진단, 164개 대학 26,295개 전형 실시간 모의 컷오프 분석, 수시 6개 대학 최적 라인업 확정",
      "제공 결과물": "수시 6개 대학 파이널 지원 전략서 (A4), 입학 진단 종합 평가표"
    }
  ];
  const ws3 = XLSX.utils.json_to_sheet(s3Data);
  ws3['!cols'] = [{ wch: 28 }, { wch: 35 }, { wch: 45 }, { wch: 65 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, ws3, '학기제 관리 기간 모델');

  // Sheet 4: 4단계 완결형 실행 사이클
  const s4Data = [
    {
      "단계": "STEP 01",
      "프로세스명": "학생부·성적 정밀 진단",
      "실행 내용": "나이스 간편인증 또는 정부24 PDF 업로드, 2028 개편 5등급제 ⟷ 9등급제 자동 환산, 164개 대학 26,295개 전형 최적 지원선 산출",
      "산출물": "정밀 진단 종합 분석표 (A4)"
    },
    {
      "단계": "STEP 02",
      "프로세스명": "주차별 밀착 플래너 & 시험 D-Day",
      "실행 내용": "시기별 시험기간(중간/기말/모평/수능) D-Day 실시간 카운트다운 배너 설정, 주차별 실천 과제 부여 및 완료율(%) 실시간 추적",
      "산출물": "주차별 학습 플래너 관리대장"
    },
    {
      "단계": "STEP 03",
      "프로세스명": "카카오 도서 세특 & 수행평가 연계",
      "실행 내용": "학교 수행평가 과제 내용 다이렉트 기입, 희망 전공 맞춤 카카오 도서 DB 연계 도서 매칭, NEIS 기재 규정에 맞춘 3단계 완성형 세특 초안 생성",
      "산출물": "과목별 세특 및 독서 탐구 카드"
    },
    {
      "단계": "STEP 04",
      "프로세스명": "월간 활동 보고서 Auto-Fill & 메일링",
      "실행 내용": "[⚡ 실행 항목 데이터 자동 집계 및 반영 (Auto-Fill)] 클릭으로 한 달간 실적 즉시 취합, A4 원클릭 인쇄 및 공식 이메일 엔진을 통한 학부모 직발송",
      "산출물": "대치수프리마 월간 학생 활동 보고서 (A4/HTML)"
    }
  ];
  const ws4 = XLSX.utils.json_to_sheet(s4Data);
  ws4['!cols'] = [{ wch: 15 }, { wch: 30 }, { wch: 70 }, { wch: 35 }];
  XLSX.utils.book_append_sheet(wb, ws4, '4단계 실행 사이클');

  const outXlsx = path.join(__dirname, '../docs/대치수프리마_나의입시멘토_컨설턴트앱_B2B_제안서.xlsx');
  XLSX.writeFile(wb, outXlsx);
  console.log(`Saved B2B proposal xlsx: ${outXlsx}`);

  const publicXlsx = path.join(__dirname, '../학원용앱/public/guides/대치수프리마_나의입시멘토_컨설턴트앱_B2B_제안서.xlsx');
  XLSX.writeFile(wb, publicXlsx);
  const rootPublicXlsx = path.join(__dirname, '../public/guides/대치수프리마_나의입시멘토_컨설턴트앱_B2B_제안서.xlsx');
  XLSX.writeFile(wb, rootPublicXlsx);
}

async function main() {
  await buildDocx();
  buildXlsx();

  // Also copy markdown
  const mdSrc = path.join(__dirname, '../docs/대치수프리마_나의입시멘토_컨설턴트앱_B2B_제안서.md');
  const mdDest = path.join(__dirname, '../학원용앱/public/guides/대치수프리마_나의입시멘토_컨설턴트앱_B2B_제안서.md');
  fs.copyFileSync(mdSrc, mdDest);
  const rootMdDest = path.join(__dirname, '../public/guides/대치수프리마_나의입시멘토_컨설턴트앱_B2B_제안서.md');
  fs.copyFileSync(mdSrc, rootMdDest);
  console.log(`Copied proposal md to ${mdDest} and ${rootMdDest}`);
}

main().catch(console.error);
