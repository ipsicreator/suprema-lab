const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const outputDir = 'C:\\Users\\chris\\Desktop\\수프리마랩\\outputs';
const files = fs.readdirSync(outputDir).filter(f => f.endsWith('_최종.xlsx'));

let masterData = [];

files.forEach(file => {
    const wb = XLSX.readFile(path.join(outputDir, file));
    const sheetName = wb.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);
    masterData = masterData.concat(data);
});

const newWb = XLSX.utils.book_new();
const newWs = XLSX.utils.json_to_sheet(masterData);
XLSX.utils.book_append_sheet(newWb, newWs, "통합데이터셋");

const finalPath = path.join(outputDir, "2028_수시_전국주요대학_통합데이터셋.xlsx");
XLSX.writeFile(newWb, finalPath);
console.log(`[통합완료] 총 ${masterData.length}개 행: ${finalPath}`);
