const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const SOURCE_TRUTH_DIR = 'C:\\Users\\chris\\Desktop\\수프리마랩\\outputs\\source_truth';
const RAW_PDF_DIR = 'C:\\Users\\chris\\Desktop\\수프리마랩\\public\\uploads';
const UNIFIED_OUTPUT_DIR = 'C:\\Users\\chris\\Desktop\\수프리마랩\\outputs\\unified_source';

async function createUnifiedSource(univName) {
    const configPath = path.join(SOURCE_TRUTH_DIR, univName, 'source_info.json');
    if (!fs.existsSync(configPath)) return;

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const pdfPath = path.join(RAW_PDF_DIR, config.original_file);
    
    if (!fs.existsSync(pdfPath)) {
        console.log(`PDF not found: ${pdfPath}`);
        return;
    }

    const dataBuffer = fs.readFileSync(pdfPath);
    
    let markdownContent = `# ${univName} 2028학년도 대입 시행계획 (원천 소스)\n\n`;
    markdownContent += `> 본 문서는 키워드 검색을 위해 추출된 핵심 페이지들의 통합본입니다.\n\n`;

    // Sort keywords for consistent format
    for (const [keyword, pages] of Object.entries(config.keywords)) {
        if (pages.length === 0) continue;
        
        markdownContent += `## 🔑 키워드: ${keyword}\n`;
        markdownContent += `**추출 페이지:** ${pages.join(', ')}p\n\n`;

        for (const pageNum of pages) {
            const data = await pdf(dataBuffer, {
                pagerender: function(pageData) {
                    return pageData.getTextContent().then(function(textContent) {
                        return textContent.items.map(s => s.str).join(' ');
                    });
                },
                max: pageNum // Just a way to get specific pages in this basic lib
            });
            
            // Note: pdf-parse is a bit limited for single page extraction in a loop, 
            // but we will refine this to get EXACT pages.
            markdownContent += `### [Page ${pageNum}]\n${data.text}\n\n`;
        }
        markdownContent += `---\n\n`;
    }

    if (!fs.existsSync(UNIFIED_OUTPUT_DIR)) fs.mkdirSync(UNIFIED_OUTPUT_DIR, { recursive: true });
    fs.writeFileSync(path.join(UNIFIED_OUTPUT_DIR, `${univName}_Unified_Source.md`), markdownContent);
    console.log(`Unified source created: ${univName}`);
}

// Sample for one university to check format
createUnifiedSource('가톨릭대학교');
