const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } = require('c:/Users/chris/Desktop/수프리마랩/학원용앱/node_modules/docx');
const XLSX = require('xlsx');

async function buildDocx() {
  const mdPath = path.join(__dirname, '../docs/대치수프리마_브랜드철학_및_서비스소개.md');
  const mdContent = fs.readFileSync(mdPath, 'utf8');

  const children = [];

  // Title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 140 },
      children: [
        new TextRun({
          text: '[대치수프리마] 대입전략연구소 브랜드 철학 및 서비스 소개서',
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
          text: '대치수프리마 대입전략연구소 | 문서번호: SUPRIMA-PHILOSOPHY-2026-01 (대표: 이기욱 대표컨설턴트)',
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
            size: idx === 0 ? 2500 : idx === 1 ? 4000 : 4500,
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
  const outPath = path.join(__dirname, '../docs/대치수프리마_브랜드철학_및_서비스소개.docx');
  fs.writeFileSync(outPath, buffer);
  console.log(`Saved philosophy docx: ${outPath} (${buffer.length} bytes)`);

  const publicOut = path.join(__dirname, '../학원용앱/public/guides/대치수프리마_브랜드철학_및_서비스소개.docx');
  fs.writeFileSync(publicOut, buffer);
}

function buildXlsx() {
  const wb = XLSX.utils.book_new();

  // Sheet 1: 3대 핵심 철학
  const s1Data = [
    {
      "철학 키워드": '1. "정교한 시스템으로"',
      "제정 의도 및 본질적 가치": '입시는 막연한 감이나 운이 아닙니다. 164개 대학 입결 데이터와 카카오 도서 DB, AI 엔진이 결합된 오차 없는 탄탄한 설계 인프라가 학생 뒤를 든든하게 받치고 있다는 전문성의 선언입니다.',
      "시스템 구현 기능": '164개 대학 26,295개 전형 컷오프 DB 탑재, 2028 개편 5등급-9등급 자동 환산'
    },
    {
      "철학 키워드": '2. "따라만 해도"',
      "제정 의도 및 본질적 가치": '학부모와 학생의 가장 큰 고통은 막막함(어디서부터 뭘 해야 할지 모름)입니다. 고민할 필요 없이 시스템이 이끄는 4단계를 물 흐르듯 따라가기만 하면 최고 수준의 완성본이 손에 쥐어지는 극도의 실행력을 뜻합니다.',
      "시스템 구현 기능": 'Step 1 분석 ➔ Step 2 가설 ➔ Step 3 독서·세특 ➔ Step 4 대학 진단 원클릭 가이드'
    },
    {
      "철학 키워드": '3. "생각이 있으면 방법은 따라온다"',
      "제정 의도 및 본질적 가치": '합격이라는 결과론적 과장 광고가 아니라, 학생이 가진 작은 호기심과 고민(생각)만 가져오면 그것을 완벽한 세특과 탐구로 만들어내는 실질적 해결책(방법)을 시스템이 반드시 찾아준다는 본질적 가치입니다.',
      "시스템 구현 기능": '학생 흥미 키워드 기반 탐구 가설 제안, 카카오 도서 매칭, 3단계 완성형 세특 문장'
    }
  ];
  const ws1 = XLSX.utils.json_to_sheet(s1Data);
  ws1['!cols'] = [{ wch: 25 }, { wch: 75 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(wb, ws1, '3대 핵심 철학');

  // Sheet 2: 연구소 개요 및 소통 채널
  const s2Data = [
    { "구분": '기관명', "항목": '대치수프리마 입시&코칭센터', "상세 정보": '대치수프리마 대입전략연구소' },
    { "구분": '대표자', "항목": '이기욱 대표컨설턴트', "상세 정보": '대치동 1:1 대입 컨설팅 현장 10여 년 실전 지도 노하우 집대성' },
    { "구분": '소재지', "항목": '본원 주소', "상세 정보": '서울특별시 강남구 테헤란로 326 B1F (선릉·역삼 중심)' },
    { "구분": '고객지원', "항목": '연락처 및 메일', "상세 정보": '010-2370-1077 (문자전송 전용) | suprimalab@gmail.com' },
    { "구분": '소통채널', "항목": '네이버 밴드', "상세 정보": 'band.us/@suprima (실시간 입시 브리핑 및 학부모 소통)' },
    { "구분": '소통채널', "항목": '네이버 블로그', "상세 정보": 'blog.naver.com/gouniv_hifive (대치동 심층 탐구 칼럼)' },
    { "구분": '소통채널', "항목": '인스타그램', "상세 정보": '@suprima_ipsicreator (주요 대학별 입결 카드뉴스)' }
  ];
  const ws2 = XLSX.utils.json_to_sheet(s2Data);
  ws2['!cols'] = [{ wch: 15 }, { wch: 30 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, ws2, '연구소 소개 및 채널');

  const outXlsx = path.join(__dirname, '../docs/대치수프리마_브랜드철학_및_서비스소개.xlsx');
  XLSX.writeFile(wb, outXlsx);
  console.log(`Saved philosophy xlsx: ${outXlsx}`);

  const publicXlsx = path.join(__dirname, '../학원용앱/public/guides/대치수프리마_브랜드철학_및_서비스소개.xlsx');
  XLSX.writeFile(wb, publicXlsx);
}

async function main() {
  await buildDocx();
  await buildXlsx();

  // Also copy markdown
  const mdSrc = path.join(__dirname, '../docs/대치수프리마_브랜드철학_및_서비스소개.md');
  const mdDest = path.join(__dirname, '../학원용앱/public/guides/대치수프리마_브랜드철학_및_서비스소개.md');
  fs.copyFileSync(mdSrc, mdDest);
  console.log(`Copied philosophy md to ${mdDest}`);
}

main().catch(console.error);
