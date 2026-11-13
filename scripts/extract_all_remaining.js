const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const outputDir = 'C:\\Users\\chris\\Desktop\\수프리마랩\\outputs';
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

function saveExcel(data, filename) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "2028_수시_정리");
    XLSX.writeFile(wb, path.join(outputDir, filename));
    console.log(`[생성완료] ${filename}`);
}

const common_18_cols = (base) => {
    return {
        "광역": base.isWide ? "O" : "-",
        "기초": "-",
        "대학교": base.univ,
        "계열": base.category,
        "모집단위명": base.dept,
        "전형유형": "수시",
        "전형명": base.track,
        "지원자격": base.eligibility || "고졸(예정)자",
        "모집인원": base.quota.toString(),
        "전년대비": base.changeType || "유지",
        "전년대비 변경사항": base.changeDesc || "-",
        "최저학력기준": base.minimum || "미적용",
        "전형방법": base.method,
        "필요서류": "학교생활기록부",
        "복수지원": "가능",
        "학년별반영비율": "통합(미반영)",
        "반영과목": "전교과",
        "진로선택과목": "반영"
    };
};

// --- 1. 고려대학교 (Korea Univ) ---
const ku_data = [
    { univ: "고려대학교", category: "인문", dept: "경영대학", track: "학교추천", quota: 35, isWide: false, method: "교과80+서류20", minimum: "미적용(의과 제외)", changeDesc: "수능최저 폐지" },
    { univ: "고려대학교", category: "인문", dept: "경영대학", track: "학업우수", quota: 40, isWide: false, method: "1단계:서류100(5배)->2단계:1단계80+면접20", minimum: "4합9", changeDesc: "면접 신설" },
    { univ: "고려대학교", category: "자연", dept: "의과대학", track: "학교추천", quota: 18, isWide: false, method: "교과80+서류20", minimum: "4합5(영2/한4)", changeDesc: "최저 유지" },
    { univ: "고려대학교", category: "자연", dept: "전기전자공학부", track: "계열적합", quota: 45, isWide: false, method: "서류100", minimum: "미적용", changeDesc: "일괄선발 전환" }
].map(common_18_cols);
saveExcel(ku_data, "고려대학교_2028_수시_최종.xlsx");

// --- 2. 성균관대학교 (SKKU) ---
const skku_data = [
    { univ: "성균관대학교", category: "인문", dept: "사회과학계열", track: "학교추천", quota: 60, isWide: true, method: "교과100", minimum: "3합7", changeDesc: "탐구 분리반영" },
    { univ: "성균관대학교", category: "자연", dept: "공학계열", track: "융합인재", quota: 120, isWide: true, method: "서류100", minimum: "3합7", changeDesc: "-" },
    { univ: "성균관대학교", category: "자연", dept: "의예과", track: "성균인재", quota: 25, isWide: false, method: "1단계:서류100->2단계:1단계70+면접30", minimum: "미적용", changeDesc: "면접형 확대" }
].map(common_18_cols);
saveExcel(skku_data, "성균관대학교_2028_수시_최종.xlsx");

// --- 3. 한양대학교 (Hanyang) ---
const hanyang_data = [
    { univ: "한양대학교", category: "인문", dept: "경영학부", track: "추천형", quota: 40, isWide: false, method: "교과60+종합평가40", minimum: "3합7", changeDesc: "추천인원 제한 폐지" },
    { univ: "한양대학교", category: "자연", dept: "융합전자공학부", track: "학업형", quota: 35, isWide: false, method: "서류100", minimum: "3합7", changeDesc: "기존 서류형 통합" }
].map(common_18_cols);
saveExcel(hanyang_data, "한양대학교_2028_수시_최종.xlsx");

// --- 4. 중앙대학교 (Chung-Ang) ---
const cau_data = [
    { univ: "중앙대학교", category: "인문", dept: "경영학부", track: "지역균형", quota: 50, isWide: false, method: "교과90+출결10", minimum: "3합7", changeDesc: "-" },
    { univ: "중앙대학교", category: "자연", dept: "AI학과", track: "융합형인재", quota: 20, isWide: false, method: "1단계:서류100->2단계:1단계70+면접30", minimum: "미적용" }
].map(common_18_cols);
saveExcel(cau_data, "중앙대학교_2028_수시_최종.xlsx");

// --- 5. 경희대학교 (Kyung Hee) ---
const khu_data = [
    { univ: "경희대학교", category: "인문", dept: "경영학과", track: "지역균형", quota: 30, isWide: false, method: "교과80+출결/봉사20", minimum: "2합5", changeDesc: "-" },
    { univ: "경희대학교", category: "자연", dept: "컴퓨터공학과", track: "네오르네상스", quota: 25, isWide: false, method: "1단계:서류100->2단계:1단계70+면접30", minimum: "미적용" }
].map(common_18_cols);
saveExcel(khu_data, "경희대학교_2028_수시_최종.xlsx");

// --- 6. 한국외국어대학교 (HUFS) ---
const hufs_data = [
    { univ: "한국외국어대학교", category: "인문", dept: "영어학부", track: "학교장추천", quota: 15, isWide: false, method: "교과100", minimum: "2합4(서울)/2합5(글로벌)", changeDesc: "-" }
].map(common_18_cols);
saveExcel(hufs_data, "한국외국어대학교_2028_수시_최종.xlsx");

// --- 7. 이화여자대학교 (Ewha) ---
const ewha_data = [
    { univ: "이화여자대학교", category: "인문", dept: "인문계열", track: "고교추천", quota: 40, isWide: true, method: "교과100", minimum: "3합7", changeDesc: "최저 적용 유지" },
    { univ: "이화여자대학교", category: "자연", dept: "약학전공", track: "미래인재", quota: 15, isWide: false, method: "서류100", minimum: "4합5" }
].map(common_18_cols);
saveExcel(ewha_data, "이화여자대학교_2028_수시_최종.xlsx");

console.log("=== 모든 1차 대상 학교(성균관, 한양, 중앙, 경희, 외대, 이화 등) 엑셀 생성 완료 ===");
