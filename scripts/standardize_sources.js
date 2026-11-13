const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

// 사용자님의 명령: 동일한 포맷의 검색 가능한 원천 소스 문서 생성
const OUTPUT_DIR = 'C:\\Users\\chris\\Desktop\\수프리마랩\\outputs\\unified_sources';
const keywords = ["모집인원", "최저학력기준", "전형방법", "모집단위", "지원자격", "반영비율", "진로선택"];

async function buildStandardizedSource(univName, pdfPath) {
    console.log(`${univName} 문서화 시작...`);
    try {
        const dataBuffer = fs.readFileSync(pdfPath);
        const data = await pdf(dataBuffer);
        const pages = data.text.split(/\f/);
        
        let outputContent = `# ${univName} 2028학년도 원천 소스 (필수 페이지 추출)\n\n`;
        let count = 0;

        pages.forEach((text, i) => {
            if (keywords.some(kw => text.includes(kw))) {
                outputContent += `## [PAGE ${i + 1}]\n\n${text.trim()}\n\n---\n\n`;
                count++;
            }
        });

        const safeName = univName.replace(/\s+/g, '_');
        fs.writeFileSync(path.join(OUTPUT_DIR, `${safeName}_Source.md`), outputContent);
        console.log(`[완료] ${univName}: ${count}개 핵심 페이지 저장됨.`);
    } catch (e) {
        console.error(`[에러] ${univName}: ${e.message}`);
    }
}

// 예시: 서울대 처리 (실제 실행 시 모든 대학 순차 처리)
// buildStandardizedSource("서울대학교", "public/uploads/서울대_2028.pdf");
