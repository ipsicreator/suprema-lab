const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const XLSX = require('xlsx');

function parseArgs(args) {
  let workbookPath;
  let sheetName;
  let writeBundled = false;
  let dryRun = false;
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === '--write-bundled') writeBundled = true;
    else if (arg === '--dry-run') dryRun = true;
    else if (arg === '--sheet') {
      sheetName = args[++index];
      if (!sheetName || sheetName.startsWith('--')) throw new Error('--sheet 다음에 시트명을 입력해 주세요.');
    } else if (arg.startsWith('--sheet=')) {
      sheetName = arg.slice('--sheet='.length);
      if (!sheetName) throw new Error('시트명을 입력해 주세요.');
    } else if (arg.startsWith('-')) throw new Error(`지원하지 않는 옵션: ${arg}`);
    else if (workbookPath) throw new Error('한 번에 원본 파일 하나만 지정해 주세요.');
    else workbookPath = arg;
  }
  if (!workbookPath) throw new Error('원본 파일 경로를 지정해 주세요. 예: npm run update:admissions -- "C:/자료/입결.xlsx"');
  if (writeBundled && dryRun) throw new Error('--dry-run과 --write-bundled는 함께 사용할 수 없습니다.');
  return { workbookPath, sheetName, writeBundled };
}
function base(row) {
  return { year: 2026, university: row.univ, department: row.dept, admission_type: row.type, track_name: row.name };
}
function buildDiagnosisRows(rows) {
  return rows.map(row => ({
    ...base(row), cutoff_score_50: row.cutoff26_50 ?? '', cutoff_score_70: row.cutoff26_70 ?? '',
  }));
}
function buildCutoffRows(rows) {
  return rows.flatMap(row => [
    ...(row.cutoff26_50 == null ? [] : [{ ...base(row), percentile_type: 50, cutoff_score: row.cutoff26_50 }]),
    ...(row.cutoff26_70 == null ? [] : [{ ...base(row), percentile_type: 70, cutoff_score: row.cutoff26_70 }]),
  ]);
}
async function main(args = process.argv.slice(2)) {
  if (args.length === 1 && ['--help', '-h'].includes(args[0])) {
    console.log('npm run update:admissions -- "원본.xlsx" [--sheet="전체"] [--dry-run | --write-bundled]');
    console.log('기본 동작은 검증만 수행합니다. 운영 반영은 관리자 파일 업로드 화면을 사용하세요.');
    return;
  }
  const options = parseArgs(args);
  const file = path.resolve(options.workbookPath);
  if (!/\.(xlsx|xls|csv|tsv)$/i.test(file)) throw new Error('엑셀(.xlsx, .xls), CSV 또는 TSV 파일을 지정해 주세요.');
  const { parseWorkbook, MAX_IMPORT_FILE_BYTES } = await import(pathToFileURL(path.join(__dirname, '../lib/admissions/import.ts')).href);
  if (fs.statSync(file).size > MAX_IMPORT_FILE_BYTES) throw new Error('20MB 이하의 파일을 사용해 주세요.');
  const buffer = fs.readFileSync(file);
  let workbook;
  if (/\.(csv|tsv)$/i.test(file)) {
    let text = new TextDecoder('utf-8').decode(buffer);
    if (text.includes('\uFFFD')) text = new TextDecoder('euc-kr').decode(buffer);
    workbook = XLSX.read(text, { type: 'string', raw: true, cellFormula: false });
  } else workbook = XLSX.read(buffer, { type: 'buffer', cellFormula: false });
  const result = parseWorkbook(workbook, options.sheetName);
  const summary = {
    mode: options.writeBundled ? 'write-bundled' : 'dry-run',
    source: file, sheet: options.sheetName || (workbook.SheetNames.includes('전체') ? '전체' : workbook.SheetNames[0]),
    rowCount: result.rowCount, universityCount: result.universityCount, cutoffCount: result.cutoffCount,
    warningCount: result.warningCount, warnings: result.warnings,
  };
  if (options.writeBundled) {
    const root = path.resolve(__dirname, '..');
    const outputs = [
      ['data/admission/admissionData.json', JSON.stringify(result.rows, null, 2)],
      ['data/susi_explorer_fixed.csv', XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(buildDiagnosisRows(result.rows)))],
      ['data/admission_cutoffs_2026.csv', XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(buildCutoffRows(result.rows)))],
    ];
    // Validate and prepare every output before replacing any bundled file.
    const pending = outputs.map(([relative, content]) => {
      const target = path.join(root, relative);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      return { relative, target, temporary: `${target}.${process.pid}.tmp`, content };
    });
    try {
      for (const output of pending) fs.writeFileSync(output.temporary, output.content, 'utf8');
      for (const output of pending) fs.renameSync(output.temporary, output.target);
    } finally {
      for (const output of pending) if (fs.existsSync(output.temporary)) fs.unlinkSync(output.temporary);
    }
    summary.files = pending.map(output => output.relative);
  }
  console.log(JSON.stringify(summary, null, 2));
}
if (require.main === module) main().catch(error => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
module.exports = { parseArgs, buildDiagnosisRows, buildCutoffRows, main };
