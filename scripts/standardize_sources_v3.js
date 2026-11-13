const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const OUTPUT_DIR = 'C:\\Users\\chris\\Desktop\\수프리마랩\\outputs\\unified_sources';
const SEARCH_ROOTS = [
    'C:\\Users\\chris\\Desktop\\수프리마랩\\.tmp',
    'C:\\Users\\chris\\Desktop\\수프리마랩\\public'
];

const keywords = ["모집인원", "최저학력기준", "전형방법", "모집단위", "지원자격", "반영비율", "진로선택", "배점"];

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

async function getPdfFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            await getPdfFiles(filePath, fileList);
        } else if (filePath.toLowerCase().endsWith('.pdf')) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

async function processAll() {
    let allPdfs = [];
    for (const root of SEARCH_ROOTS) {
        if (fs.existsSync(root)) {
            await getPdfFiles(root, allPdfs);
        }
    }

    console.log(`총 ${allPdfs.length}개의 PDF 파일을 찾았습니다.`);

    for (const pdfPath of allPdfs) {
        try {
            const dataBuffer = fs.readFileSync(pdfPath);
            const data = await pdf(dataBuffer);
            
            // 대학 이름 추출 (첫 500자에서 검색)
            const firstChunk = data.text.substring(0, 500);
            let univName = "Unknown";
            const univMatch = firstChunk.match(/([가-힣]+대학교)/);
            if (univMatch) {
                univName = univMatch[1];
            } else {
                // 파일명에서 추출 시도
                const base = path.basename(pdfPath);
                const baseMatch = base.match(/([가-힣]+대학교)/);
                if (baseMatch) univName = baseMatch[1];
            }

            if (univName === "Unknown") {
                univName = path.basename(pdfPath, '.pdf');
            }

            console.log(`처리 중: ${univName} (${path.basename(pdfPath)})`);

            const pages = data.text.split(/\f/);
            let outputContent = `# ${univName} 2028학년도 원천 소스 (필수 페이지 추출)\n\n`;
            let count = 0;

            pages.forEach((text, i) => {
                if (keywords.some(kw => text.includes(kw))) {
                    outputContent += `## [PAGE ${i + 1}]\n\n${text.trim()}\n\n---\n\n`;
                    count++;
                }
            });

            if (count > 0) {
                const safeName = univName.replace(/[\s\\/:*?"<>|]+/g, '_');
                fs.writeFileSync(path.join(OUTPUT_DIR, `${safeName}_Source.md`), outputContent);
                console.log(`[완료] ${univName}: ${count}개 핵심 페이지 저장됨.`);
            }
        } catch (e) {
            console.error(`[에러] ${path.basename(pdfPath)}: ${e.message}`);
        }
    }
    console.log("모든 작업이 완료되었습니다.");
}

processAll();
