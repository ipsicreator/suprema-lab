const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const RAW_PDF_DIR = 'C:\\Users\\chris\\Desktop\\수프리마랩\\public\\uploads';
const OUTPUT_DIR = 'C:\\Users\\chris\\Desktop\\수프리마랩\\outputs\\unified_sources';

// 18개 항목 추출을 위한 핵심 키워드
const keywords = ["모집인원", "모집단위", "최저학력기준", "전형방법", "지원자격", "반영비율", "진로선택", "배점"];

async function processUniversities() {
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    const files = fs.readdirSync(RAW_PDF_DIR).filter(f => f.endsWith('.pdf'));
    console.log(`총 ${files.length}개 대학 분석 시작...`);

    for (const file of files) {
        const univName = file.replace(/_2028.*\.pdf$/, "").replace(/_2028.*/, "");
        const pdfPath = path.join(RAW_PDF_DIR, file);
        const dataBuffer = fs.readFileSync(pdfPath);

        console.log(`처리 중: ${univName}`);
        
        try {
            const data = await pdf(dataBuffer);
            const pages = data.text.split(/\f/); // 페이지 구분자로 분할
            
            let unifiedMarkdown = `# ${univName} 2028학년도 대입 시행계획 (원천 소스)\n\n`;
            let foundPages = 0;

            pages.forEach((pageText, index) => {
                const pageNum = index + 1;
                // 키워드 중 하나라도 포함된 페이지만 선택
                const hasKeyword = keywords.some(kw => pageText.includes(kw));
                
                if (hasKeyword) {
                    unifiedMarkdown += `## [Page ${pageNum}]\n\n${pageText.trim()}\n\n---\n\n`;
                    foundPages++;
                }
            });

            const outputPath = path.join(OUTPUT_DIR, `${univName}_Unified.md`);
            fs.writeFileSync(outputPath, unifiedMarkdown);
            console.log(`완료: ${univName} (${foundPages}페이지 추출)`);
        } catch (err) {
            console.error(`에러 (${univName}): ${err.message}`);
        }
    }
    console.log("\n모든 대학의 원천 소스 문서화 완료.");
}

processUniversities();
