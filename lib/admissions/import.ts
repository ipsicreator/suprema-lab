import * as XLSX from "xlsx";

export const MAX_IMPORT_ROWS = 50_000;
export const MAX_IMPORT_FILE_BYTES = 20 * 1024 * 1024;
export const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;
export const MAX_EXPANDED_BYTES = 64 * 1024 * 1024;

const textFields = {
  region: ["광역", "region"], subRegion: ["기초", "subRegion"],
  univ: ["대학교", "대학명", "대학", "univ", "university"],
  track: ["계열", "track"], dept: ["모집단위명", "모집단위", "학과명", "학과", "dept", "department"],
  type: ["전형유형", "type", "admission_type"], name: ["전형명", "name", "track_name"],
  req: ["지원자격", "req"], method: ["전형방법", "method"],
  reference26: ["2026학년도 기준", "reference26"],
  reference25: ["2025학년도 기준2", "2025학년도 기준", "reference25"],
  reference24: ["2024학년도 기준2", "2024학년도 기준", "reference24"],
  supportNotes: ["지원시 유의사항", "supportNotes"], remarks: ["비고", "remarks"],
  verificationStatus: ["검증상태", "verificationStatus"], verificationMemo: ["검증메모", "verificationMemo"],
  verificationAt: ["검증일시", "verificationAt"],
} as const;
const numberFields = {
  cutoff26: ["2026학년도 입결(등급)", "cutoff26"],
  cutoff26_original: ["2026학년도 입결(등급)_원본", "cutoff26_original"],
  cutoff26_50: ["2026학년도 입결(50%)", "입결(50%)", "cutoff26_50"],
  cutoff26_70: ["2026학년도 입결(70%)", "입결(70%)", "cutoff26_70"],
  cutoff25: ["2025학년도 입결(등급)", "cutoff25"], cutoff24: ["2024학년도 입결(등급)", "cutoff24"],
  competition26: ["2026학년도 경쟁률", "competition26"],
  competition25: ["2025학년도 경쟁률", "competition25"], competition24: ["2024학년도 경쟁률", "competition24"],
} as const;
type TextKey = keyof typeof textFields;
type NumberKey = keyof typeof numberFields;
export type AdmissionImportRow = Record<TextKey, string> & Record<NumberKey, number | null> & {
  cutoff26_text: string; cutoff25_text: string; cutoff24_text: string; sourceRow: number;
};
export type AdmissionPreview = {
  rows: AdmissionImportRow[]; rowCount: number; universityCount: number; cutoffCount: number;
  warningCount: number; warnings: string[]; sample: AdmissionImportRow[];
};
const required = ["univ", "dept", "type", "name"] as const;
const normalizeHeader = (value: unknown) => String(value ?? "").replace(/[\s_\u00a0\uFEFF]/g, "").toLowerCase();
function asText(value: unknown, label: string): string {
  if (value === null || value === undefined) return "";
  if (typeof value !== "string" && typeof value !== "number") throw new Error(`${label}: 문자 또는 숫자만 입력할 수 있습니다.`);
  const text = String(value).trim();
  if (text.length > 10_000) throw new Error(`${label}: 셀 내용이 너무 깁니다.`);
  return text;
}
function field(lookup: Map<string, unknown>, aliases: readonly string[]) {
  for (const name of aliases) {
    const value = lookup.get(normalizeHeader(name));
    if (value !== undefined && value !== null && String(value).trim() !== "") return value;
  }
  return null;
}

/** Validate on both browser preview and server; never silently drop incomplete records. */
export function normalizeRows(raw: unknown[]): AdmissionPreview {
  if (!Array.isArray(raw) || !raw.length) throw new Error("반영할 데이터가 없습니다.");
  if (raw.length > MAX_IMPORT_ROWS) throw new Error(`한 번에 ${MAX_IMPORT_ROWS.toLocaleString()}행까지 반영할 수 있습니다.`);
  const warnings: string[] = [];
  let warningCount = 0;
  const warn = (message: string) => { warningCount++; if (warnings.length < 30) warnings.push(message); };
  const rows = raw.map((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) throw new Error(`${index + 1}번째 데이터 형식이 올바르지 않습니다.`);
    const source = item as Record<string, unknown>;
    const lookup = new Map(Object.entries(source).map(([key, value]) => [normalizeHeader(key), value]));
    const sourceRow = typeof source.sourceRow === "number" && Number.isInteger(source.sourceRow) && source.sourceRow > 0 ? source.sourceRow : index + 1;
    const row = { sourceRow } as AdmissionImportRow;
    for (const key of Object.keys(textFields) as TextKey[]) row[key] = asText(field(lookup, textFields[key]), `${sourceRow}행 ${key}`);
    for (const key of required) if (!row[key]) throw new Error(`${sourceRow}행: 대학명·모집단위·전형유형·전형명은 필수입니다. (${key})`);
    for (const key of Object.keys(numberFields) as NumberKey[]) {
      const value = field(lookup, numberFields[key]);
      const text = asText(value, `${sourceRow}행 ${key}`);
      if (!text || /^(?:-|–|—|n\/?a|미공개|없음)$/i.test(text)) { row[key] = null; continue; }
      const number = typeof value === "number" ? value : /^\d+(?:\.\d+)?$/.test(text.replace(/,/g, "")) ? Number(text.replace(/,/g, "")) : NaN;
      if (!Number.isFinite(number)) { row[key] = null; warn(`${sourceRow}행 ${key}: 복합 값 '${text.slice(0, 70)}'은 수치 판정에서 제외합니다.`); continue; }
      if (key.startsWith("cutoff") && (number < 1 || number > 9)) {
        if (key.endsWith("_50") || key.endsWith("_70")) throw new Error(`${sourceRow}행 ${key}: 내신 등급은 1~9 범위여야 합니다.`);
        row[key] = null; warn(`${sourceRow}행 ${key}: 등급 범위 밖의 값 '${text}'은 원문으로 보존하며 수치 판정에서 제외합니다.`); continue;
      }
      if (number < 0) throw new Error(`${sourceRow}행 ${key}: 음수는 사용할 수 없습니다.`);
      row[key] = number;
    }
    for (const year of [26, 25, 24] as const) {
      const textKey = `cutoff${year}_text` as const;
      row[textKey] = asText(source[textKey] ?? field(lookup, numberFields[`cutoff${year}`]), `${sourceRow}행 입결 원문`);
      if (source[textKey] && row[`cutoff${year}`] === null && !/^(?:-|–|—|n\/?a|미공개|없음)$/i.test(row[textKey])) warn(`${sourceRow}행: 입결 복합 값은 원문으로 보존하며 수치 판정에서 제외합니다.`);
    }
    row.cutoff26 ??= row.cutoff26_original;
    if (/50\s*%/.test(row.reference26)) row.cutoff26_50 ??= row.cutoff26;
    if (/70\s*%/.test(row.reference26)) row.cutoff26_70 ??= row.cutoff26;
    return row;
  });
  const cutoffCount = rows.filter(row => row.cutoff26 !== null || row.cutoff25 !== null || row.cutoff24 !== null || row.cutoff26_50 !== null || row.cutoff26_70 !== null).length;
  if (!cutoffCount) warn("입결 수치가 없는 파일입니다. 대학·전형 목록만 반영되며 수치 비교 근거는 제공되지 않습니다.");
  return { rows, rowCount: rows.length, universityCount: new Set(rows.map(row => row.univ)).size, cutoffCount, warningCount, warnings, sample: rows.slice(0, 10) };
}

export function parseWorkbook(workbook: XLSX.WorkBook, sheetName?: string): AdmissionPreview {
  const name = sheetName || (workbook.SheetNames.includes("전체") ? "전체" : workbook.SheetNames[0]);
  const sheet = workbook.Sheets[name];
  if (!sheet?.["!ref"]) throw new Error("선택한 시트에 데이터가 없습니다.");
  const bounds = XLSX.utils.decode_range(String(sheet["!fullref"] || sheet["!ref"]));
  if (bounds.e.r - bounds.s.r > MAX_IMPORT_ROWS + 30 || bounds.e.c > 250) throw new Error("파일의 행 또는 열 수가 너무 많습니다. 필요한 시트 범위를 줄여 주세요.");
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: null, blankrows: true });
  const headerIndex = matrix.slice(0, 30).findIndex(cells => {
    const headers = new Set(cells.map(normalizeHeader));
    return required.every(key => textFields[key].some(alias => headers.has(normalizeHeader(alias))));
  });
  if (headerIndex < 0) throw new Error("첫 30행에서 대학명·모집단위·전형유형·전형명 열을 찾을 수 없습니다.");
  const headers = matrix[headerIndex].map((cell, i) => String(cell ?? `미사용열${i}`));
  const raw = matrix.slice(headerIndex + 1).flatMap((cells, index) => {
    if (cells.every(cell => cell === null || cell === undefined || String(cell).trim() === "")) return [];
    const row: Record<string, unknown> = { sourceRow: bounds.s.r + headerIndex + index + 2 };
    headers.forEach((header, column) => { row[header] = cells[column] ?? null; });
    return [row];
  });
  return normalizeRows(raw);
}
