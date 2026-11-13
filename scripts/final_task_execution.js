const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const XLSX = require('xlsx');

const SOURCE_TRUTH_DIR = 'C:\\Users\\chris\\Desktop\\수프리마랩\\outputs\\source_truth';
const RAW_PDF_DIR = 'C:\\Users\\chris\\Desktop\\수프리마랩\\public\\uploads';
const UNIFIED_OUTPUT_DIR = 'C:\\Users\\chris\\Desktop\\수프리마랩\\outputs\\unified_source';
const FINAL_EXCEL_PATH = 'C:\\Users\\chris\\Desktop\\수프리마랩\\outputs\\final_admission_data_2028.xlsx';

async function extractPageText(pdfBuffer, pageNum) {
    try {
        const data = await pdf(pdfBuffer, {
            max: pageNum
        });
        // This is a simple way to get text, might need more refinement for specific pages
        return data.text;
    } catch (e) {
        return "";
    }
}

async function processAllUniversities() {
    const univs = fs.readdirSync(SOURCE_TRUTH_DIR);
    console.log(`Starting processing for ${univs.length} universities...`);
    
    let allRecords = [];

    for (const univName of univs) {
        const configPath = path.join(SOURCE_TRUTH_DIR, univName, 'source_info.json');
        if (!fs.existsSync(configPath)) continue;

        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const pdfPath = path.join(RAW_PDF_DIR, config.original_file);
        if (!fs.existsSync(pdfPath)) continue;

        console.log(`Processing Source Truth for: ${univName}`);
        const dataBuffer = fs.readFileSync(pdfPath);
        
        let unifiedText = "";
        
        // 1. Collect all relevant text first
        for (const [keyword, pages] of Object.entries(config.keywords)) {
            for (const pageNum of pages) {
                const pageText = await extractPageText(dataBuffer, pageNum);
                unifiedText += `\n[Keyword: ${keyword}, Page: ${pageNum}]\n${pageText}\n`;
            }
        }

        // 2. Save Unified Source (The "Source Truth" requested)
        if (!fs.existsSync(UNIFIED_OUTPUT_DIR)) fs.mkdirSync(UNIFIED_OUTPUT_DIR, { recursive: true });
        fs.writeFileSync(path.join(UNIFIED_OUTPUT_DIR, `${univName}_source.txt`), unifiedText);

        // 3. Extract 18 items using structural logic
        const lines = unifiedText.split('\n');
        let currentType = "";
        
        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.includes("수시")) currentType = "수시";
            if (trimmed.includes("정시")) currentType = "정시";

            const parts = trimmed.split(/\s{2,}/);
            if (parts.length >= 2 && parts[0].length > 1) {
                const unitName = parts[0];
                const capacity = parts[parts.length - 1];
                
                // Filtering out obviously non-department lines
                if (!/^(제|항|표|및|또는|페이지|Keyword)/.test(unitName) && unitName.length < 20) {
                    allRecords.push({
                        "광역": trimmed.includes("광역") ? "O" : "",
                        "기초": "",
                        "대학교": univName,
                        "계열": "",
                        "모집단위명": unitName,
                        "전형유형": currentType,
                        "전형명": "", // TBD from context
                        "지원자격": "", // TBD from context
                        "모집인원": capacity,
                        "전년대비": "",
                        "전년대비 변경사항": "",
                        "최저학력기준": /최저|학력|기준/.test(trimmed) ? "있음" : "미확인",
                        "전형방법": "",
                        "필요서류": "",
                        "복수지원": "",
                        "학년별반영비율": "",
                        "반영과목": "",
                        "진로선택과목": ""
                    });
                }
            }
        });
    }

    // 4. Create Excel
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(allRecords);
    XLSX.utils.book_append_sheet(wb, ws, "2028_Admission_Data");
    XLSX.writeFile(wb, FINAL_EXCEL_PATH);
    console.log(`\nDONE! Final Excel saved at: ${FINAL_EXCEL_PATH}`);
    console.log(`Total records extracted: ${allRecords.length}`);
}

processAllUniversities();
