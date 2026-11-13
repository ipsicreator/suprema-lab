const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const TRUTH_DIR = 'C:\\Users\\chris\\Desktop\\수프리마랩\\outputs\\source_truth';
const NOTEBOOK_LM_DIR = 'C:\\Users\\chris\\Desktop\\수프리마랩\\outputs\\for_notebook_lm';

if (!fs.existsSync(NOTEBOOK_LM_DIR)) fs.mkdirSync(NOTEBOOK_LM_DIR, { recursive: true });

async function extractPages(pdfPath, pages) {
    const dataBuffer = fs.readFileSync(pdfPath);
    
    // We can filter pages during extraction
    const options = {
        pagerender: function(pageData) {
            // Only render requested pages
            if (pages.includes(pageData.pageIndex + 1)) {
                return pageData.getTextContent().then(function(textContent) {
                    return textContent.items.map(s => s.str).join(' ');
                });
            }
            return '';
        }
    };

    try {
        const data = await pdf(dataBuffer, options);
        return data.text.trim();
    } catch (err) {
        console.error(`Error reading ${pdfPath}: ${err.message}`);
        return "";
    }
}

async function main() {
    const schoolDirs = fs.readdirSync(TRUTH_DIR, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => path.join(TRUTH_DIR, d.name));

    console.log(`Extracting raw text from ${schoolDirs.length} schools for NotebookLM...`);
    
    let masterIndex = "# 2028학년도 대입 시행계획 통합 인덱스\n\n";

    for (const dir of schoolDirs) {
        const school = path.basename(dir);
        const infoPath = path.join(dir, 'source_info.json');
        if (!fs.existsSync(infoPath)) continue;

        const info = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
        console.log(`Processing: ${school} (Pages: ${info.keyword_pages.join(', ')})`);

        const text = await extractPages(info.original_file, info.keyword_pages);
        
        if (text) {
            const fileName = `${school}_2028_시행계획_핵심추출.txt`;
            fs.writeFileSync(path.join(NOTEBOOK_LM_DIR, fileName), text, 'utf8');
            masterIndex += `- [${school}](file:///${path.join(NOTEBOOK_LM_DIR, fileName).replace(/\\/g, '/')})\n`;
        }
    }

    fs.writeFileSync(path.join(NOTEBOOK_LM_DIR, '00_MASTER_INDEX.txt'), masterIndex, 'utf8');
    console.log(`\n--- EXTRACTION COMPLETED ---`);
    console.log(`NotebookLM ready files saved in: ${NOTEBOOK_LM_DIR}`);
}

main();
