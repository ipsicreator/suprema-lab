const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } = require('c:/Users/chris/Desktop/수프리마랩/학원용앱/node_modules/docx');

async function buildDocx() {
  const mdPath = path.join(__dirname, '../docs/2026-11-14_전면개편_종합_신구대조표_보고서.md');
  const mdContent = fs.readFileSync(mdPath, 'utf8');

  const children = [];

  // Title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 140 },
      children: [
        new TextRun({
          text: '[대치수프리마] 플랫폼 전면 개편 종합 신·구 대조표 보고서',
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
          text: '대치수프리마 입시&코칭센터 | 문서번호: SUPRIMA-COMPARE-2026-01 (2026. 11. 14 최종 확정본)',
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
      if (trimmed.includes('---')) {
        // separator row, skip
        continue;
      }
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
            size: idx === 0 ? 2000 : idx === 1 ? 3000 : idx === 2 ? 3500 : 2500,
            type: WidthType.DXA,
          },
          shading: {
            fill: isHeader ? '8B1A1A' : (tableRows.length % 2 === 1 ? 'F8FAFC' : 'FFFFFF'),
          },
          margins: { top: 120, bottom: 120, left: 140, right: 140 },
          children: textRuns,
        });
      });

      tableRows.push(new TableRow({ children: cells }));
      continue;
    } else if (inTable) {
      // Table ended, flush
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
      children.push(new Paragraph({ spacing: { after: 160 } }));
      inTable = false;
      tableRows = [];
    }

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
          spacing: { before: 200, after: 80 },
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
              text: trimmed.replace(/^[\*\-]\s+/, '').replace(/\*\*/g, ''),
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
              text: trimmed.replace(/\*\*/g, ''),
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
              text: trimmed.replace(/\*\*/g, ''),
              size: 20,
              color: '444444',
            }),
          ],
        })
      );
    }
  }

  // Flush any trailing table
  if (inTable && tableRows.length > 0) {
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
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              right: 1000,
              bottom: 1000,
              left: 1000,
            },
          },
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, '../docs/2026-11-14_전면개편_종합_신구대조표_보고서.docx');
  fs.writeFileSync(outPath, buffer);
  console.log(`Successfully generated comparison DOCX at ${outPath} (${buffer.length} bytes)`);

  // Copy to 학원용앱/public/guides
  const publicGuidesDir = path.join(__dirname, '../학원용앱/public/guides');
  if (!fs.existsSync(publicGuidesDir)) {
    fs.mkdirSync(publicGuidesDir, { recursive: true });
  }
  const publicDocx = path.join(publicGuidesDir, '2026-11-14_전면개편_종합_신구대조표_보고서.docx');
  const publicMd = path.join(publicGuidesDir, '2026-11-14_전면개편_종합_신구대조표_보고서.md');
  fs.writeFileSync(publicDocx, buffer);
  fs.copyFileSync(mdPath, publicMd);
  console.log(`Copied to public guides: ${publicDocx}`);
}

buildDocx().catch((err) => {
  console.error('Error generating comparison DOCX:', err);
  process.exit(1);
});
