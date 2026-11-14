const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } = require('c:/Users/chris/Desktop/수프리마랩/학원용앱/node_modules/docx');

async function buildDocx() {
  const mdPath = path.join(__dirname, '../docs/2026-11-14_진단플로우_변경_수정내역_보고서.md');
  const mdContent = fs.readFileSync(mdPath, 'utf8');

  const children = [];

  // Title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: '대치수프리마 「나의 입시멘토」 진단 플로우 전면 개편 보고서',
          bold: true,
          size: 36,
          color: '8B1A1A',
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
          text: '작성일자: 2026년 11월 14일 | 시스템: 대치 수프리마 대입 심층 진단 플랫폼 (수프리마랩)',
          size: 20,
          color: '666666',
        }),
      ],
    })
  );

  const lines = mdContent.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('---') || trimmed.startsWith('# 대치수프리마')) continue;

    if (trimmed.startsWith('## ')) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
          children: [
            new TextRun({
              text: trimmed.replace(/^##\s+/, ''),
              bold: true,
              size: 26,
              color: '1A0F08',
            }),
          ],
        })
      );
    } else if (trimmed.startsWith('### ')) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 180, after: 80 },
          children: [
            new TextRun({
              text: trimmed.replace(/^###\s+/, ''),
              bold: true,
              size: 22,
              color: '8B1A1A',
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
              text: trimmed.replace(/^[*\-]\s+/, '').replace(/\*\*/g, '').replace(/`/g, ''),
              size: 20,
              color: '333333',
            }),
          ],
        })
      );
    } else if (trimmed.startsWith('> ')) {
      children.push(
        new Paragraph({
          spacing: { before: 120, after: 120 },
          children: [
            new TextRun({
              text: trimmed.replace(/^>\s+/, '').replace(/\*\*/g, '').replace(/`/g, ''),
              size: 20,
              color: '555555',
              italics: true,
            }),
          ],
        })
      );
    } else if (!trimmed.startsWith('|')) {
      children.push(
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: trimmed.replace(/\*\*/g, '').replace(/`/g, ''),
              size: 20,
              color: '222222',
            }),
          ],
        })
      );
    }
  }

  // Official Footer Block
  children.push(
    new Paragraph({
      spacing: { before: 400, after: 100 },
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          color: 'EADFCE',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: '대치수프리마 입시&코칭센터',
          bold: true,
          size: 22,
          color: '1A0F08',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: '대표 : 이기욱 대표컨설턴트 | 메일 : suprimalab@gmail.com | 연락처 : 010-2370-1077(문자전송)',
          size: 18,
          color: '666666',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: '소재지 : 서울시 강남구 테헤란로 326 B1F',
          size: 18,
          color: '666666',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: '네이버 밴드 : band.us/@suprima | 블로그 : blog.naver.com/gouniv_hifive | 인스타그램 : suprima_ipsicreator',
          size: 18,
          color: '666666',
        }),
      ],
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, '../docs/2026-11-14_진단플로우_변경_수정내역_보고서.docx');
  fs.writeFileSync(outPath, buffer);
  console.log(`Successfully generated DOCX at ${outPath} (${buffer.length} bytes)`);
}

buildDocx().catch((err) => {
  console.error(err);
  process.exit(1);
});
