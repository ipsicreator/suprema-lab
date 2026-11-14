const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('c:/Users/chris/Desktop/수프리마랩/학원용앱/node_modules/docx');

async function buildDocx() {
  const mdPath = path.join(__dirname, '../docs/사회과학_AI_심화탐구_컨설턴트_활용가이드.md');
  const mdContent = fs.readFileSync(mdPath, 'utf8');

  const children = [];

  // Title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 140 },
      children: [
        new TextRun({
          text: '[대치수프리마] 사회·과학 AI 심화탐구 및 학생 매칭 컨설턴트 실무 가이드북',
          bold: true,
          size: 34,
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
          text: '대치수프리마 입시&코칭센터 | 문서번호: SUPRIMA-MANUAL-2026-03 (2026. 11. 14 발행)',
          size: 19,
          color: '666666',
        }),
      ],
    })
  );

  const lines = mdContent.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('---') || trimmed.startsWith('# [대치수프리마]')) continue;

    if (trimmed.startsWith('## ')) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 280, after: 120 },
          children: [
            new TextRun({
              text: trimmed.replace(/^##\s+/, ''),
              bold: true,
              size: 26,
              color: '8B1A1A',
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
              color: '1E293B',
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
              text: trimmed.replace(/^[\*\-]\s+/, ''),
              size: 20,
              color: '333333',
            }),
          ],
        })
      );
    } else if (trimmed.startsWith('1. ') || trimmed.startsWith('2. ') || trimmed.startsWith('3. ') || trimmed.startsWith('4. ')) {
      children.push(
        new Paragraph({
          spacing: { after: 70 },
          children: [
            new TextRun({
              text: trimmed,
              size: 20,
              color: '222222',
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
              text: trimmed,
              size: 20,
              color: '444444',
            }),
          ],
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1200,
              right: 1200,
              bottom: 1200,
              left: 1200,
            },
          },
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, '../docs/사회과학_AI_심화탐구_컨설턴트_활용가이드.docx');
  fs.writeFileSync(outPath, buffer);
  console.log(`Successfully generated DOCX at ${outPath} (${buffer.length} bytes)`);

  // Copy to 학원용앱/public/guides
  const publicGuidesDir = path.join(__dirname, '../학원용앱/public/guides');
  if (!fs.existsSync(publicGuidesDir)) {
    fs.mkdirSync(publicGuidesDir, { recursive: true });
  }
  const publicDocxPath = path.join(publicGuidesDir, '사회과학_AI_심화탐구_컨설턴트_활용가이드.docx');
  const publicMdPath = path.join(publicGuidesDir, '사회과학_AI_심화탐구_컨설턴트_활용가이드.md');
  fs.writeFileSync(publicDocxPath, buffer);
  fs.copyFileSync(mdPath, publicMdPath);
  console.log(`Copied downloadable guide to ${publicDocxPath} and ${publicMdPath}`);
}

buildDocx().catch((err) => {
  console.error('Error generating DOCX:', err);
  process.exit(1);
});
