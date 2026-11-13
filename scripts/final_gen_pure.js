const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const TRUTH_DIR = 'C:\\Users\\chris\\Desktop\\수프리마랩\\outputs\\source_truth';
const OUTPUT_FILE = 'C:\\Users\\chris\\Desktop\\수프리마랩\\outputs\\university_admissions_2028_integrated.xlsx';
const NOTEBOOK_LM_DIR = 'C:\\Users\\chris\\Desktop\\수프리마랩\\outputs\\for_notebook_lm';

if (!fs.existsSync(NOTEBOOK_LM_DIR)) fs.mkdirSync(NOTEBOOK_LM_DIR, { recursive: true });

// Read API key manually from .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
const apiKeyMatch = envContent.match(/GEMINI_API_KEY=(.*)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim().replace(/^["']|["']$/g, '') : "";

const genAI = new GoogleGenerativeAI(apiKey);
// Use gemini-1.5-pro which was confirmed working in lib/ai/gemini.ts
const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

async function extractUniversityData(schoolDir) {
  const infoPath = path.join(schoolDir, 'source_info.json');
  if (!fs.existsSync(infoPath)) return null;

  const info = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
  const pdfBuffer = fs.readFileSync(info.original_file);

  const prompt = `
    이 PDF 파일(${info.school} 2028학년도 대입 시행계획)의 ${info.keyword_pages.join(', ')} 페이지들을 분석해서 '모집단위별 모집인원' 표 데이터를 추출해줘.
    결과는 반드시 JSON 배열 형식이어야 해. 각 객체는 다음 18개 키를 가져야 해:
    광역, 기초, 대학교, 계열, 모집단위명, 전형유형, 전형명, 지원자격, 모집인원, 전년대비, 전년대비 변경사항, 최저학력기준, 전형방법, 필요서류, 복수지원, 학년별반영비율, 반영과목, 진로선택과목
    
    데이터가 없는 항목은 ""로 채워줘.
    JSON 데이터만 출력해줘.
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
    console.error(`Error ${info.school}: ${error.message}`);
    return null;
  }
}

async function main() {
  const schoolDirs = fs.readdirSync(TRUTH_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => path.join(TRUTH_DIR, d.name));

  console.log(`Generating data for ${schoolDirs.length} schools...`);
  let allData = [];

  for (const dir of schoolDirs) {
    const school = path.basename(dir);
    console.log(`Processing: ${school}`);
    const data = await extractUniversityData(dir);
    
    if (data && Array.isArray(data)) {
      allData = allData.concat(data);
      const summaryText = data.map(row => 
        Object.entries(row).map(([k, v]) => `${k}: ${v}`).join('\n')
      ).join('\n---\n');
      fs.writeFileSync(path.join(NOTEBOOK_LM_DIR, `${school}_요약.txt`), summaryText, 'utf8');
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  if (allData.length > 0) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(allData);
    XLSX.utils.book_append_sheet(wb, ws, "2028 대입통합");
    XLSX.writeFile(wb, OUTPUT_FILE);
    console.log(`SUCCESS: ${OUTPUT_FILE} (${allData.length} records)`);
    console.log(`NotebookLM files ready in: ${NOTEBOOK_LM_DIR}`);
  } else {
    console.log("FAILED: No records extracted.");
  }
}

main();
