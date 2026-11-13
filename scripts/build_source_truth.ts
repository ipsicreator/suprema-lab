import fs from 'fs';
import path from 'path';
import PDFParser from 'pdf2json';

const SOURCE_DIR = 'C:\\Users\\chris\\Desktop\\수프리마랩\\outputs\\seoul_priority1_exact_raw';
const TARGET_DIR = 'C:\\Users\\chris\\Desktop\\수프리마랩\\outputs\\source_truth';
const MANUAL_DIR = 'C:\\Users\\chris\\Desktop\\수프리마랩\\outputs\\manual_check';

const KEYWORDS = ['모집단위', '모집인원', '최저학력기준', '전형방법', '지원자격', '반영비율'];

if (!fs.existsSync(TARGET_DIR)) fs.mkdirSync(TARGET_DIR, { recursive: true });
if (!fs.existsSync(MANUAL_DIR)) fs.mkdirSync(MANUAL_DIR, { recursive: true });

async function getFiles(dir: string): Promise<string[]> {
  const dirents = fs.readdirSync(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  }));
  return Array.prototype.concat(...files).filter(f => f.toLowerCase().endsWith('.pdf'));
}

async function processPDF(filePath: string) {
  const schoolName = path.basename(path.dirname(filePath));
  console.log(`Processing: ${schoolName}`);

  return new Promise((resolve) => {
    const pdfParser = new PDFParser();
    
    pdfParser.on("pdfParser_dataError", (errData: any) => {
      console.error(`Error parsing ${schoolName}:`, errData.parserError);
      // Move to manual check if parsing error
      const dest = path.join(MANUAL_DIR, path.basename(filePath));
      fs.copyFileSync(filePath, dest);
      resolve({ school: schoolName, status: 'error' });
    });

    pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
      let keywordPages: number[] = [];
      let totalText = "";

      pdfData.Pages.forEach((page: any, index: number) => {
        const pageText = page.Texts.map((t: any) => {
          try {
            return decodeURIComponent(t.R[0].T);
          } catch (e) {
            return t.R[0].T; // Fallback to raw text if decoding fails
          }
        }).join(' ');
        totalText += pageText;
        
        if (KEYWORDS.some(k => pageText.includes(k))) {
          keywordPages.push(index + 1);
        }
      });

      if (totalText.trim().length < 100) {
        // Likely scanned image PDF
        console.log(`[OCR NEEDED] ${schoolName} has very little text.`);
        const dest = path.join(MANUAL_DIR, path.basename(filePath));
        if (!fs.existsSync(path.dirname(dest))) fs.mkdirSync(path.dirname(dest), {recursive:true});
        fs.copyFileSync(filePath, dest);
        resolve({ school: schoolName, status: 'ocr_needed' });
      } else if (keywordPages.length === 0) {
        console.log(`[NO KEYWORDS] ${schoolName} keywords not found.`);
        const dest = path.join(MANUAL_DIR, path.basename(filePath));
        if (!fs.existsSync(path.dirname(dest))) fs.mkdirSync(path.dirname(dest), {recursive:true});
        fs.copyFileSync(filePath, dest);
        resolve({ school: schoolName, status: 'no_keywords' });
      } else {
        console.log(`[SUCCESS] ${schoolName}: Found in pages ${keywordPages.join(', ')}`);
        const schoolTargetDir = path.join(TARGET_DIR, schoolName);
        if (!fs.existsSync(schoolTargetDir)) fs.mkdirSync(schoolTargetDir, { recursive: true });
        
        // Save page metadata for source of truth
        fs.writeFileSync(path.join(schoolTargetDir, 'source_info.json'), JSON.stringify({
          school: schoolName,
          original_file: filePath,
          keyword_pages: keywordPages
        }, null, 2));
        
        resolve({ school: schoolName, status: 'success', pages: keywordPages });
      }
    });

    pdfParser.loadPDF(filePath);
  });
}

async function main() {
  const files = await getFiles(SOURCE_DIR);
  console.log(`Found ${files.length} PDFs. Starting check...`);
  
  const results = [];
  for (const file of files) {
    const res = await processPDF(file);
    results.push(res);
  }

  fs.writeFileSync(path.join(TARGET_DIR, 'extraction_status.json'), JSON.stringify(results, null, 2));
  console.log('--- SCAN COMPLETED ---');
}

main();
