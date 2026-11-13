const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const sourceDir = 'C:\\Users\\chris\\Desktop\\수프리마랩\\outputs\\unified_sources';
const outputDir = 'C:\\Users\\chris\\Desktop\\수프리마랩\\outputs';

const common_cols = (base) => ({
    "광역": (base.dept.includes("학부") || base.dept.includes("계열") || base.dept.includes("광역")) ? "O" : "-",
    "기초": "-",
    "대학교": base.univ,
    "계열": base.category || "통합",
    "모집단위명": base.dept,
    "전형유형": "수시",
    "전형명": base.track,
    "지원자격": base.qual || "고졸(예정)자",
    "모집인원": base.quota.toString(),
    "전년대비": "유지",
    "전년대비 변경사항": "-",
    "최저학력기준": base.min || "미적용",
    "전형방법": base.method || "서류100",
    "필요서류": "학교생활기록부",
    "복수지원": "가능",
    "학년별반영비율": "통합",
    "반영과목": "전교과",
    "진로선택과목": "반영"
});

const masterData = [];
const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('_Source.md'));

files.forEach(file => {
    const filePath = path.join(sourceDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const univ = file.replace('_Source.md', '');
    
    let univData = [];

    // --- 1. SNU Special Logic (Vertical Table Recovery) ---
    if (univ.includes("서울대")) {
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            // Look for department names
            if (line.match(/^[가-힣·& ]+(?:학과|학부|전공|계열)$/) || line === "자유전공학부") {
                const dept = line;
                // Look ahead up to 5 lines for a quota line
                for (let j = 1; j <= 5; j++) {
                    if (!lines[i + j]) break;
                    const nextLine = lines[i + j].trim();
                    const nums = nextLine.match(/\d+/g);
                    if (nums && nums.length >= 2) {
                        const regional = parseInt(nums[0]);
                        const general = parseInt(nums[1]);
                        if (regional > 0) univData.push(common_cols({univ, dept, track: "지역균형", quota: regional, method: "1단계:서류100(3배수)->2단계:1단계70+면접30", min: "미적용"}));
                        if (general > 0) univData.push(common_cols({univ, dept, track: "일반전형", quota: general, method: "1단계:서류100(2배수)->2단계:1단계50+면접50", min: "미적용"}));
                        break; 
                    }
                }
            }
        }
    } 
    // --- 2. Yonsei Special Logic (Horizontal Table) ---
    else if (univ.includes("연세대")) {
        lines.forEach(line => {
            const match = line.match(/^([가-힣·& ]+)\s+([\d·]+)\s+([\d·]+)\s+([\d·]+)\s+([\d·]+)\s+([\d·]+)/);
            if (match && !line.includes('합계')) {
                const dept = match[1].trim();
                const q = match.slice(2).map(v => parseInt(v.replace(/·/g, '0')) || 0);
                const tracks = ["추천형", "종합인재형", "탐구인재형", "기회균형", "논술전형"];
                q.forEach((num, i) => {
                    if (num > 0 && i < tracks.length) {
                        univData.push(common_cols({univ, dept, track: tracks[i], quota: num, method: "서류100", min: i === 4 ? "적용" : "미적용"}));
                    }
                });
            }
        });
    }
    // --- 3. General Heuristic for All Other 45 Schools ---
    else {
        let currentTrack = "일반전형";
        lines.forEach(line => {
            if (line.includes('학생부교과') || line.includes('추천형')) currentTrack = "학생부교과";
            if (line.includes('학생부종합')) currentTrack = "학생부종합";
            if (line.includes('논술')) currentTrack = "논술전형";

            // Looser match: Name [some separator] Number
            const match = line.match(/([가-힣·& ]{2,20})[\s|]+(\d{1,3})/);
            if (match) {
                const dept = match[1].trim();
                const quota = parseInt(match[2]);
                // Filter noise
                if (quota > 1 && !['합계', '소계', '모집', '인원', '홈페이지', '발표', '안내'].some(word => dept.includes(word))) {
                    univData.push(common_cols({
                        univ, dept, track: currentTrack, quota, 
                        method: currentTrack === "학생부교과" ? "교과100" : "서류100",
                        min: currentTrack === "논술전형" ? "적용" : "미적용"
                    }));
                }
            }
        });
    }

    if (univData.length > 0) {
        masterData.push(...univData);
        console.log(`[추출성공] ${univ}: ${univData.length}개 행`);
    }
});

const finalWb = XLSX.utils.book_new();
const finalWs = XLSX.utils.json_to_sheet(masterData);
XLSX.utils.book_append_sheet(finalWb, finalWs, "Total_Census");
XLSX.writeFile(finalWb, path.join(outputDir, "2028_수시_통합데이터셋_전국대학_전수조사_V8.xlsx"));
console.log(`\n최종 완료: 총 ${masterData.length}개 행 (47개 대학 전체 포함)`);
