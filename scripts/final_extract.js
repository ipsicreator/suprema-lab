const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const XLSX = require('xlsx');

const TRUTH_DIR = 'C:\\Users\\chris\\Desktop\\수프리마랩\\outputs\\source_truth';
const OUTPUT_FILE = 'C:\\Users\\chris\\Desktop\\수프리마랩\\outputs\\university_admissions_2028_integrated.xlsx';

// Manual env loading to avoid dependencies
const envContent = fs.readFileSync('.env.local', 'utf8');
const apiKeyMatch = envContent.match(/GEMINI_API_KEY=(.*)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : "";

const genAI = new GoogleGenerativeAI(apiKey);
// Use exactly what's in lib/ai/gemini.ts
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }, { apiVersion: "v1" });

async function extractUniversityData(schoolDir) {
  const infoPath = path.join(schoolDir, 'source_info.json');
  if (!fs.existsSync(infoPath)) return null;

  const info = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
  if (!fs.existsSync(info.original_file)) return null;
  
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

  console.log(`Extracting ${schoolDirs.length} schools...`);
  let allData = [];

  for (const dir of schoolDirs) {
    const school = path.basename(dir);
    console.log(`Processing: ${school}`);
    const data = await extractUniversityData(dir);
    if (data && Array.isArray(data)) {
      allData = allData.concat(data);
    }
    // Rate limit buffer
    await new Promise(r => setTimeout(r, 1000));
  }

  if (allData.length > 0) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(allData);
    XLSX.utils.book_append_sheet(wb, ws, "2028 대입통합");
    XLSX.writeFile(wb, OUTPUT_FILE);
    console.log(`SUCCESS: ${OUTPUT_FILE} (${allData.length} records)`);
  } else {
    console.log("FAILED: No data extracted.");
  }
}

main();
