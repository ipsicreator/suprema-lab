import fs from 'node:fs/promises';
import path from 'node:path';
import { Workbook, SpreadsheetFile } from '@oai/artifact-tool';

const ROOT = 'C:\\Users\\chris\\Desktop\\수프리마랩';
const SOURCE_XLSX = path.join(ROOT, 'outputs', '2028_입시계획', '2028_최종결과.xlsx');
const OUTPUT_DIR = path.join(ROOT, 'outputs', '대학별파일');
const MANIFEST_PATH = path.join(OUTPUT_DIR, '_manifest.json');

function safeFileName(name) {
  return String(name)
    .replace(/[<>:"/\\|?*]+/g, '_')
    .replace(/[\u0000-\u001f]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[. ]+$/g, '');
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const source = await SpreadsheetFile.importXlsx(await fs.readFile(SOURCE_XLSX));
  const sheet = source.worksheets.getItem('Sheet1');
  const inspected = await source.inspect({ kind: 'sheet', sheetId: sheet.id });
  const summary = JSON.parse(inspected.ndjson);
  const values = sheet.getRange(summary.address).values;

  const header = values[0];
  const rows = values.slice(1);
  const byUniversity = new Map();

  for (const row of rows) {
    const university = String(row?.[2] ?? '').trim();
    if (!university) continue;
    if (!byUniversity.has(university)) byUniversity.set(university, []);
    byUniversity.get(university).push(row);
  }

  const universities = [...byUniversity.keys()].sort((a, b) => a.localeCompare(b, 'ko'));
  const manifest = [];

  let index = 1;
  for (const university of universities) {
    const universityRows = byUniversity.get(university) ?? [];
    const workbook = Workbook.create();
    const outSheet = workbook.worksheets.add('Sheet1');
    const grid = [header, ...universityRows];
    const endRow = grid.length;
    const endCol = header.length;
    outSheet.getRange(`A1:${String.fromCharCode(64 + endCol)}${endRow}`).values = grid;

    const fileName = `${String(index).padStart(3, '0')}_${safeFileName(university)}.xlsx`;
    const filePath = path.join(OUTPUT_DIR, fileName);
    const xlsx = await SpreadsheetFile.exportXlsx(workbook);
    await xlsx.save(filePath);

    manifest.push({
      university,
      fileName,
      filePath,
      rows: universityRows.length,
    });
    index += 1;
  }

  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(JSON.stringify({
    source: SOURCE_XLSX,
    outputDir: OUTPUT_DIR,
    files: manifest.length,
  }, null, 2));
}

await main();
