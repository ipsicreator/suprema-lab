const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const sourceDir = 'C:\\Users\\chris\\Desktop\\수프리마랩\\outputs\\unified_sources';
const outputDir = 'C:\\Users\\chris\\Desktop\\수프리마랩\\outputs';

const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('_Source.md'));

files.forEach(file => {
    const filePath = path.join(sourceDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const univName = file.replace('_Source.md', '');
    
    // 학과 및 인원 패턴 추출 (학과명, 인원 숫자 등을 정규식으로 매칭 시도)
    // 실제로는 소스마다 형식이 다르므로, 파일별로 전수 조사를 위한 전용 추출 로직이 필요함.
    // 여기서는 우선 소스 파일의 텍스트가 엑셀에 그대로 담기도록 구조를 잡음.
    
    const lines = content.split('\n').filter(l => l.trim().length > 0);
    const data = lines.map(line => ({
        "대학교": univName,
        "원문내용": line.trim(),
        "항목": "전수추출중"
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, univName);
    XLSX.writeFile(wb, path.join(outputDir, `${univName}_2028_수시_원천데이터_전수.xlsx`));
    console.log(`[추출완료] ${univName}: ${data.length}개 행 생성`);
});
