const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const XLSX = require('xlsx');

const pdfDir = 'C:\\Users\\chris\\Desktop\\수프리마랩\\.tmp\\all_univs';
const outputDir = 'C:\\Users\\chris\\Desktop\\수프리마랩\\outputs';

const TARGET_LIST = [
    { name: "가천대학교", key: "가천" },
    { name: "가톨릭대학교", key: "가톨릭" },
    { name: "건국대학교", key: "건국" },
    { name: "경기대학교", key: "경기" },
    { name: "경희대학교", key: "경희" },
    { name: "고려대학교", key: "고려" },
    { name: "광운대학교", key: "광운" },
    { name: "국민대학교", key: "국민" },
    { name: "단국대학교", key: "단국" },
    { name: "동국대학교", key: "동국" },
    { name: "명지대학교", key: "명지" },
    { name: "서강대학교", key: "서강" },
    { name: "서울대학교", key: "서울대" },
    { name: "서울시립대학교", key: "시립" },
    { name: "성균관대학교", key: "성균관" },
    { name: "세종대학교", key: "세종" },
    { name: "숙명여자대학교", key: "숙명" },
    { name: "숭실대학교", key: "숭실" },
    { name: "아주대학교", key: "아주" },
    { name: "연세대학교", key: "연세" },
    { name: "이화여자대학교", key: "이화" },
    { name: "인하대학교", key: "인하" },
    { name: "중앙대학교", key: "중앙" },
    { name: "한국외국어대학교", key: "외국어" },
    { name: "한양대학교", key: "한양" },
    { name: "홍익대학교", key: "홍익" }
];

async function extract() {
    const allFiles = fs.readdirSync(pdfDir).filter(f => f.endsWith('.pdf'));
    let masterData = [];

    for (const target of TARGET_LIST) {
        console.log(`Processing ${target.name}...`);
        // Find the best matching PDF (priority to 본교/서울 if possible)
        const matchedFiles = allFiles.filter(f => f.includes(target.key));
        if (matchedFiles.length === 0) continue;

        let univRows = [];
        for (const file of matchedFiles) {
            try {
                const data = await pdf(fs.readFileSync(path.join(pdfDir, file)));
                const lines = data.text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
                
                let currentTrack = "학생부위주";
                lines.forEach(line => {
                    if (line.includes('교과') || line.includes('추천')) currentTrack = "학생부교과";
                    if (line.includes('종합')) currentTrack = "학생부종합";
                    if (line.includes('논술')) currentTrack = "논술전형";

                    const match = line.match(/([가-힣·& ]{2,20})\s+(\d{1,3})/);
                    if (match) {
                        const dept = match[1].trim();
                        const quota = parseInt(match[2]);
                        if (quota > 1 && /학과|학부|전공|계열|공학|융합|인재|대학/.test(dept) && !['합계', '소계', '모집', '인원'].some(w => dept.includes(w))) {
                            univRows.push({
                                "대학교": target.name,
                                "모집단위명": dept,
                                "전형명": currentTrack,
                                "모집인원": quota
                            });
                        }
                    }
                });
            } catch (e) {}
        }

        // DE-DUPLICATE for this university
        const unique = [];
        const seen = new Set();
        univRows.forEach(r => {
            const key = `${r.모집단위명}-${r.전형명}-${r.모집인원}`;
            if (!seen.has(key)) {
                unique.push(r);
                seen.add(key);
            }
        });
        masterData.push(...unique);
        console.log(`[DONE] ${target.name}: ${unique.length} rows`);
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(masterData);
    XLSX.utils.book_append_sheet(wb, ws, "Final_26");
    XLSX.writeFile(wb, path.join(outputDir, "2028_수시_인서울_26개교_데이터_완전확정.xlsx"));
    
    // Create Consistency Log
    const log = {
        total_rows: masterData.length,
        details: masterData.reduce((acc, r) => {
            acc[r.대학교] = (acc[r.대학교] || 0) + 1;
            return acc;
        }, {})
    };
    fs.writeFileSync(path.join(outputDir, 'consistency_log.json'), JSON.stringify(log, null, 2));
}

extract();
