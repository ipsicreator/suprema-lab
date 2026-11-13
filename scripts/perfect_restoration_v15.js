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

// Keywords to separate Department from Track
const TRACK_KEYWORDS = ["학생부종합", "학생부교과", "논술전형", "논술", "실기위주", "실기", "지역균형", "일반전형", "기회균형", "추천형", "인재", "융합"];

async function run() {
    const files = fs.readdirSync(pdfDir);
    let masterData = [];

    for (const target of TARGET_LIST) {
        const targetFile = files.find(f => f.includes(target.key));
        if (!targetFile) continue;

        try {
            const data = await pdf(fs.readFileSync(path.join(pdfDir, targetFile)));
            const lines = data.text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
            
            let currentTrack = "일반";
            let univData = [];

            lines.forEach(line => {
                // Track Detection from context
                if (line.includes('학생부종합')) currentTrack = "학생부종합";
                else if (line.includes('학생부교과')) currentTrack = "학생부교과";
                else if (line.includes('논술')) currentTrack = "논술전형";

                const match = line.match(/([가-힣·& ]{2,30})\s+(\d{1,3})/);
                if (match) {
                    let dept = match[1].trim();
                    let quota = match[2];
                    let finalTrack = currentTrack;

                    // SPLIT dept and track if merged
                    for (const tk of TRACK_KEYWORDS) {
                        if (dept.includes(tk)) {
                            finalTrack = tk;
                            dept = dept.replace(tk, "").trim();
                            break;
                        }
                    }

                    if (parseInt(quota) > 1 && !['합계', '소계', '모집', '인원', '전형'].some(w => dept.includes(w))) {
                        univData.push({
                            "대학교": target.name,
                            "모집단위명": dept,
                            "전형명": finalTrack,
                            "모집인원": parseInt(quota)
                        });
                    }
                }
            });

            // Local De-dupe
            const unique = Array.from(new Set(univData.map(JSON.stringify))).map(JSON.parse);
            masterData.push(...unique);
            console.log(`[OK] ${target.name}: ${unique.length} rows`);
        } catch (e) {}
    }

    if (masterData.length > 0) {
        const wb = XLSX.utils.book_new();
        // Force column order
        const ws = XLSX.utils.json_to_sheet(masterData, { header: ["대학교", "모집단위명", "전형명", "모집인원"] });
        XLSX.utils.book_append_sheet(wb, ws, "Final_Census");
        XLSX.writeFile(wb, path.join(outputDir, "2028_수시_주요26개교_완벽복구_V15.xlsx"));
        console.log(`\nFinal Master Created: ${masterData.length} rows.`);
    }
}

run();
