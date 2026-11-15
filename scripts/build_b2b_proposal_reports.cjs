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
}

function buildXlsx() {
  const wb = XLSX.utils.book_new();

  // Sheet 1: 2-Track 맞춤 모델
  const s1Data = [
    {
      "구분": "[Track A] 학원에 입시 담당자가 있는 경우",
      "운영 모델": "시스템 라이선스 + 정기 교육형",
      "대상 학원": "입시 상담실장, 부원장, 생기부 전담 강사가 상주하는 학원",
      "제공 서비스": "• 컨설턴트 앱 마스터/서브 계정 부여\n• 월 1회 최신 수시 전형 및 컷오프 변동 브리핑\n• 분기별 2028 개편 및 고교학점제 세특 지도법 워크숍\n• 카카오 도서 DB 기반 탐구 가이드북 및 설명회 PPT 템플릿 제공",
      "학원 이점": "원내 자체 입시 컨설턴트 역량 내재화, 선생님들의 업무 효율 극대화",
      "비용": "상호 협의 (원생 규모 및 계정 수 연동)"
    },
    {
      "구분": "[Track B] 학원에 입시 담당자가 없는 경우",
      "운영 모델": "올인원 실전 업무대행 풀패키지형",
      "대상 학원": "1인 원장 체제, 과목 강사 중심, 입시 전담 인력이 전무한 학원",
      "제공 서비스": "• 대치수프리마 전문 연구원이 실제 학원 입시 연구소로 100% 업무 대행\n• 학생부 등록 및 암호화 코드 연동 전담\n• 학생별 희망 전공 맞춤 심화 탐구 가설 및 필수 도서 1-Click 배정 대행\n• 나이스 기재용 3단계 완성형 세특 검수 및 최종 리포트 학원 로고로 발행\n• 학부모 입시 질의 시 전문 스크립트 서면 지원",
      "학원 이점": "추가 인건비 부담 없이 원내 대치동 입시 연구소 즉시 보유, 원장님은 영업/수업에만 집중",
      "비용": "상호 협의 (원생 규모 및 관리 학생 수 연동)"
    }
  ];
  const ws1 = XLSX.utils.json_to_sheet(s1Data);
  ws1['!cols'] = [{ wch: 32 }, { wch: 28 }, { wch: 35 }, { wch: 60 }, { wch: 45 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, ws1, '2-Track 운영 모델');

  // Sheet 2: 프로그램 특장점 및 도입 효과
  const s2Data = [
    { "분류": "프로그램 특장점", "항목": "164개 대학 입결 DB", "상세 내용": "26,295개 수시 전형 최신 입결 컷오프 기반 실시간 6개 대학 모의 합불 산출" },
    { "분류": "프로그램 특장점", "항목": "2028 개편안 완벽 대응", "상세 내용": "5등급제 ⟷ 9등급제 실시간 양방향 자동 환산 및 이수 과목 적합도 정밀 분석" },
    { "분류": "프로그램 특장점", "항목": "독서 필수 연계 세특", "상세 내용": "카카오 도서 DB 공식 연계 + 제미나이 AI 기반 나이스 기재용 3단계 완성형 세특 도출" },
    { "분류": "프로그램 특장점", "항목": "1초 코드 동기화", "상세 내용": "학생 계정 암호화 코드를 컨설턴트 앱에 1초 연동, 1-Click 사회/과학 AI 탐구 배정" },
    { "분류": "학원 도입 효과", "항목": "원생 모집 무기 확보", "상세 내용": "대치동 공신력 기반 학생부 정밀 진단 설명회 개최로 신규 등록 전환율 300% 증대" },
    { "분류": "학원 도입 효과", "항목": "수강 유지율 극대화", "상세 내용": "시험 직후 세특/독서 연계 보고서 발급으로 시험 후 이탈 방지(Lock-in)" },
    { "분류": "학원 도입 효과", "항목": "선생님 피로도 90% 절감", "상세 내용": "도서 탐색 및 세특 첨삭 시간 10초로 단축, 본 수업과 학생 관리에 집중" },
    { "분류": "학원 도입 효과", "항목": "학원 브랜드 가치 격상", "상세 내용": "단순 점수 보습학원에서 학생부종합전형까지 케어하는 프리미엄 입시 명문으로 전환" }
  ];
  const ws2 = XLSX.utils.json_to_sheet(s2Data);
  ws2['!cols'] = [{ wch: 20 }, { wch: 25 }, { wch: 65 }];
  XLSX.utils.book_append_sheet(wb, ws2, '특장점 및 도입 효과');

  // Sheet 3: 관리 기간 모델 (1, 3, 6개월)
  const s3Data = [
    { "기간 모델": "1개월 과정 (단기 속성)", "추천 대상": "수시 원서 직전 수험생, 신규 입학 진단용", "주요 케어 내용": "2028 5등급 환산, 164개 대학 모의 합불, 6개 대학 라인업 제안", "제공 결과물": "수시 6개 대학 최종 지원 전략서 (A4)" },
    { "기간 모델": "3개월 과정 (학기 집중)", "추천 대상": "정규 학기 수강생 (★ 가장 추천)", "주요 케어 내용": "중간/기말 성적 추이 분석, 과목별 탐구 첨삭 및 도서 매칭(월 2회), 세특 초안 검수", "제공 결과물": "학기별 교과 세특 완성 포트폴리오, 독서 기록장" },
    { "기간 모델": "6개월 과정 (수시 풀케어)", "추천 대상": "고1·고2 상시 학종반, 고3 파이널 수시 대비", "주요 케어 내용": "생기부 전 영역(자·동·진·특) 상시 코칭, 파이널 원서 전략, 서류/제시문 모의 면접", "제공 결과물": "학생부종합 마스터 리포트, 모의면접 예상 질문집" }
  ];
  const ws3 = XLSX.utils.json_to_sheet(s3Data);
  ws3['!cols'] = [{ wch: 25 }, { wch: 35 }, { wch: 55 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, ws3, '1·3·6개월 관리 모델');

  const outXlsx = path.join(__dirname, '../docs/대치수프리마_나의입시멘토_컨설턴트앱_B2B_제안서.xlsx');
  XLSX.writeFile(wb, outXlsx);
  console.log(`Saved B2B proposal xlsx: ${outXlsx}`);

  const publicXlsx = path.join(__dirname, '../학원용앱/public/guides/대치수프리마_나의입시멘토_컨설턴트앱_B2B_제안서.xlsx');
  XLSX.writeFile(wb, publicXlsx);
}

async function main() {
  await buildDocx();
  buildXlsx();

  // Also copy markdown
  const mdSrc = path.join(__dirname, '../docs/대치수프리마_나의입시멘토_컨설턴트앱_B2B_제안서.md');
  const mdDest = path.join(__dirname, '../학원용앱/public/guides/대치수프리마_나의입시멘토_컨설턴트앱_B2B_제안서.md');
  fs.copyFileSync(mdSrc, mdDest);
  console.log(`Copied proposal md to ${mdDest}`);
}

main().catch(console.error);
