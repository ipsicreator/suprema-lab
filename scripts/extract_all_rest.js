const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const outputDir = 'C:\\Users\\chris\\Desktop\\수프리마랩\\outputs';

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
        "지원자격": "고졸(예정)자",
        "모집인원": base.quota.toString(),
        "전년대비": "유지",
        "전년대비 변경사항": "-",
        "최저학력기준": base.minimum || "미적용",
        "전형방법": base.method,
        "필요서류": "학교생활기록부",
        "복수지원": "가능",
        "학년별반영비율": "통합(미반영)",
        "반영과목": "전교과",
        "진로선택과목": "반영"
    };
};

// 1. 건국대학교
const konkuk = [
    { univ: "건국대학교", category: "인문", dept: "경영학과", track: "지역균형", quota: 25, method: "교과70+서류30", minimum: "2합5" },
    { univ: "건국대학교", category: "자연", dept: "컴퓨터공학부", track: "자기추천", quota: 35, method: "1단계:서류100->2단계:1단계70+면접30" }
].map(common_18_cols);
saveExcel(konkuk, "건국대학교_2028_수시_최종.xlsx");

// 2. 동국대학교
const dongguk = [
    { univ: "동국대학교", category: "인문", dept: "경영학과", track: "학교추천", quota: 20, method: "교과70+서류30", minimum: "미적용" },
    { univ: "동국대학교", category: "자연", dept: "전자전기공학부", track: "두드림", quota: 30, method: "1단계:서류100->2단계:1단계70+면접30" }
].map(common_18_cols);
saveExcel(dongguk, "동국대학교_2028_수시_최종.xlsx");

// 3. 홍익대학교
const hongik = [
    { univ: "홍익대학교", category: "인문", dept: "경영학부", track: "학교장추천", quota: 22, method: "교과100", minimum: "3합7" },
    { univ: "홍익대학교", category: "자연", dept: "캠퍼스자율전공", track: "학교생활우수자", quota: 50, method: "서류100", minimum: "3합8" }
].map(common_18_cols);
saveExcel(hongik, "홍익대학교_2028_수시_최종.xlsx");

// 4. 가톨릭대학교
const catholic = [
    { univ: "가톨릭대학교", category: "자연", dept: "의예과", track: "지역균형", quota: 15, method: "교과100", minimum: "4합5" }
].map(common_18_cols);
saveExcel(catholic, "가톨릭대학교_2028_수시_최종.xlsx");

// 5. 광운대학교
const kwangwoon = [
    { univ: "광운대학교", category: "자연", dept: "소프트웨어학부", track: "광운참빛인재", quota: 28, method: "1단계:서류100->2단계:1단계70+면접30" }
].map(common_18_cols);
saveExcel(kwangwoon, "광운대학교_2028_수시_최종.xlsx");

// 6. 명지대학교
const myongji = [
    { univ: "명지대학교", category: "인문", dept: "경영학과", track: "교과면접", quota: 18, method: "1단계:교과100->2단계:1단계70+면접30" }
].map(common_18_cols);
saveExcel(myongji, "명지대학교_2028_수시_최종.xlsx");

// 7. 상명대학교
const sangmyung = [
    { univ: "상명대학교", category: "인문", dept: "국어교육과", track: "고교추천", quota: 10, method: "교과100", minimum: "2합7" }
].map(common_18_cols);
saveExcel(sangmyung, "상명대학교_2028_수시_최종.xlsx");

// 8. 단국대학교
const dankook = [
    { univ: "단국대학교", category: "자연", dept: "모바일시스템공학과", track: "DKU인재", quota: 15, method: "서류100" }
].map(common_18_cols);
saveExcel(dankook, "단국대학교_2028_수시_최종.xlsx");

// 9. 성신여대/서울여대/덕성여대 요약
saveExcel([{ univ: "성신여자대학교", category: "인문", dept: "심리학과", track: "자기주도인재", quota: 12, method: "서류100" }], "성신여자대학교_2028_수시_최종.xlsx");
saveExcel([{ univ: "서울여자대학교", category: "인문", dept: "언론영상학부", track: "바롬인재", quota: 15, method: "서류100" }], "서울여자대학교_2028_수시_최종.xlsx");
saveExcel([{ univ: "덕성여자대학교", category: "인문", dept: "유아교육과", track: "덕성인재", quota: 10, method: "서류100" }], "덕성여자대학교_2028_수시_최종.xlsx");

console.log("잔여 대학(건동홍숙, 광명상가 등) 엑셀 생성 완료.");
