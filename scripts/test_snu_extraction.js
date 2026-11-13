const fs = require('fs');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');

// Load API key from .env.local manually for the script
const envContent = fs.readFileSync('.env.local', 'utf8');
const apiKeyMatch = envContent.match(/GEMINI_API_KEY=(.*)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : "";

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function run() {
  const pdfPath = "C:\\Users\\chris\\Desktop\\수프리마랩\\outputs\\seoul_priority1_exact_raw\\서울대학교\\서울대학교[서울][본교]_2028_시행계획(1차수).pdf";
  
  if (!fs.existsSync(pdfPath)) {
    console.error("PDF not found at:", pdfPath);
    return;
  }

  console.log("Reading PDF...");
  const pdfBuffer = fs.readFileSync(pdfPath);

  const prompt = `
    이 PDF 파일(서울대학교 2028학년도 대입 시행계획)에서 '모집단위별 모집인원' 또는 '전형별 모집인원' 표를 찾아 다음 18개 항목을 추출해줘.
    결과는 반드시 JSON 형식의 배열로 반환해줘. 각 객체는 다음 키를 가져야 해:
    
    1. 광역 (예: 서울)
    2. 기초 (예: 관악구 또는 서울)
    3. 대학교 (예: 서울대학교)
    4. 계열 (예: 인문, 자연 등)
    5. 모집단위명 (예: 국어국문학과, 수리과학부 등)
    6. 전형유형 (예: 학생부종합, 실기/실적 등)
    7. 전형명 (예: 지역균형전형, 일반전형 등)
    8. 지원자격 (요약)
    9. 모집인원 (숫자만 또는 숫자(외) 형식)
    10. 전년대비 (증감 수치)
    11. 전년대비 변경사항 (요약)
    12. 최저학력기준 (수능 최저 등)
    13. 전형방법 (예: 1단계 서류 100, 2단계 1단계 70+면접 30 등)
    14. 필요서류 (요약)
    15. 복수지원 (가능 여부)
    16. 학년별반영비율
    17. 반영과목
    18. 진로선택과목
    
    데이터가 없는 항목은 빈 문자열("")로 채워줘.
    표가 여러 페이지에 걸쳐 있다면 최대한 많이 추출해줘.
    JSON 데이터만 출력해줘.
  `;

  console.log("Sending to Gemini 1.5 Pro... (This might take a minute)");
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

    const text = result.response.text();
    console.log("--- EXTRACTION RESULT ---");
    console.log(text);
    
    // Save result
    fs.writeFileSync("scratch/snu_2028_extracted.json", text, "utf8");
    console.log("Saved to scratch/snu_2028_extracted.json");
  } catch (error) {
    console.error("Error during extraction:", error);
  }
}

run();
