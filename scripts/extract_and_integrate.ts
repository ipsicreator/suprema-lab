import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from "@google/generative-ai";
import XLSX from 'xlsx';

const TRUTH_DIR = 'C:\\Users\\chris\\Desktop\\수프리마랩\\outputs\\source_truth';
const OUTPUT_FILE = 'C:\\Users\\chris\\Desktop\\수프리마랩\\outputs\\university_admissions_2028_integrated.xlsx';

// Load API key
const envContent = fs.readFileSync('.env.local', 'utf8');
const apiKeyMatch = envContent.match(/GEMINI_API_KEY=(.*)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : "";

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

async function extractUniversityData(schoolDir: string) {
  const infoPath = path.join(schoolDir, 'source_info.json');
  if (!fs.existsSync(infoPath)) return null;

  const info = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
  const pdfBuffer = fs.readFileSync(info.original_file);

  const prompt = `
    이 PDF 파일(${info.school} 2028학년도 대입 시행계획)의 ${info.keyword_pages.join(', ')} 페이지들을 분석해서 '모집단위별 모집인원' 표 데이터를 추출해줘.
    결과는 반드시 JSON 배열 형식이어야 해. 각 객체는 다음 18개 키를 가져야 해:
    광역, 기초, 대학교, 계열, 모집단위명, 전형유형, 전형명, 지원자격, 모집인원, 전년대비, 전년대비 변경사항, 최저학력기준, 전형방법, 필요서류, 복수지원, 학년별반영비율, 반영과목, 진로선택과목
    
    주의사항:
    - 대학교 이름은 '${info.school}'로 채워줘.
    - 데이터가 없는 항목은 ""로 채워줘.
    - JSON 데이터만 출력해줘 (마크다운 코드 블록 제외).
  `;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: pdfBuffer.toString("base64"),
          mimeType: "application/pdf",
        },
      },
    ]);

    const text = result.response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch (error) {
    console.error(`Error extracting ${info.school}:`, error);
    return null;
  }
}

async function main() {
  const schoolDirs = fs.readdirSync(TRUTH_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => path.join(TRUTH_DIR, d.name));

  console.log(`Starting extraction for ${schoolDirs.length} schools...`);
  
  let allData: any[] = [];

  for (const dir of schoolDirs) {
    console.log(`Extracting: ${path.basename(dir)}`);
    const data = await extractUniversityData(dir);
    if (data && Array.isArray(data)) {
      allData = allData.concat(data);
    }
  }

  if (allData.length === 0) {
    console.error("No data extracted.");
    return;
  }

  // Create Workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(allData);

  // Apply some basic styling hints (xlsx library limitations apply, but we can set column widths)
  const cols = [
    { wch: 10 }, { wch: 10 }, { wch: 20 }, { wch: 10 }, { wch: 25 },
    { wch: 15 }, { wch: 20 }, { wch: 30 }, { wch: 10 }, { wch: 10 },
    { wch: 30 }, { wch: 40 }, { wch: 40 }, { wch: 20 }, { wch: 10 },
    { wch: 15 }, { wch: 20 }, { wch: 20 }
  ];
  ws['!cols'] = cols;

  XLSX.utils.book_append_sheet(wb, ws, "2028 대입통합");
  XLSX.writeFile(wb, OUTPUT_FILE);

  console.log(`--- INTEGRATION COMPLETED ---`);
  console.log(`File saved at: ${OUTPUT_FILE}`);
}

main();
