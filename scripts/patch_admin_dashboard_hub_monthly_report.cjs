const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../app/admin/AdminDashboardHub.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

const oldGuide = `  academyApp: {
    id: "academyApp",
    num: "메뉴 01",
    name: "학원용 관리 앱 (컨설턴트 앱 Pro)",
    category: "학원 및 입시 실무",
    badge: "실무 코칭 작업대",
    path: "consultantapp.vercel.app",
    isExternal: true,
    purpose: "제휴 학원 원장·컨설턴트·마스터가 재원생을 1:1로 밀착 관리하고, 나이스 3단계 세특 검수 및 A4 맞춤 추천서/평가서를 인쇄하는 현장 워크스페이스",
    target: "총괄 마스터(전 권한 오픈) / 학원 관리자(원장) / 담당 컨설턴트",
    whenToUse: "신규 원생 등록, 5등급/9등급 성적 분석, 카카오 도서 DB 매칭, 나이스 세특 검수, 학기별 성장평가서 A4 출력, 강사별 학생 배정 시",
    steps: [
      "1. 학생 CRM에서 신규 학생을 등록하고 학생 카드를 클릭합니다.",
      "2. 5/9등급 자동 환산 성적과 학종 적합도 분석을 확인합니다.",
      "3. 카카오 도서 DB 기반 추천 도서와 3단계 세특 문장을 검수·배정합니다.",
      "4. 학원 로고가 인쇄된 맞춤 추천서 및 성장평가서를 1-Click 인쇄합니다."
    ],
    keyTip: "마스터 로그인 시 모든 학원 및 컨설턴트 권한이 완전 개방되어 전 학생을 열람/관리할 수 있습니다.",
    accentColor: "#8b1a1a",
    badgeBg: "bg-red-50 text-red-800 border-red-200",
  },`;

const newGuide = `  academyApp: {
    id: "academyApp",
    num: "메뉴 01",
    name: "학원용 관리 앱 (컨설턴트 앱 Pro)",
    category: "학원 및 입시 실무",
    badge: "실무 코칭 작업대",
    path: "consultantapp.vercel.app",
    isExternal: true,
    purpose: "컨설턴트 4대 실행 항목(진단 ➔ 플래너 ➔ 도서/세특 ➔ 월간 보고서)을 밀착 코칭하고, 실행 데이터를 자동 집계해 A4 출력 및 학부모 원클릭 메일링을 전송하는 현장 워크스페이스",
    target: "총괄 마스터(전 권한 오픈) / 학원 관리자(원장) / 담당 컨설턴트",
    whenToUse: "원생 등록, 5/9등급 성적 분석, 주차별 플래너 과제 점검, 카카오 도서 DB 매칭, 3단계 세특 검수, 월간 활동 보고서 A4 출력 및 학부모 메일 발송 시",
    steps: [
      "1. [진단] 5등급/9등급 내신 환산 및 164개 대학 컷오프 기반 수시 적합도를 분석합니다.",
      "2. [플래너] 주차별 탐구 과제를 부여하고 학생의 수행 여부 및 달성률을 체크합니다.",
      "3. [세특/도서] 카카오 도서 DB 연계 필독서와 3단계(동기-과정-변화) 세특을 검수·배정합니다.",
      "4. [보고서] [⚡실행 데이터 자동 집계]로 월간 활동 보고서를 생성해 A4 출력 및 학부모 메일링을 발송합니다."
    ],
    keyTip: "컨설턴트의 4대 실행 항목 데이터가 [월간 활동 보고서]로 자동 집계되어 A4 인쇄 및 학부모 원클릭 메일링으로 직결됩니다.",
    accentColor: "#8b1a1a",
    badgeBg: "bg-red-50 text-red-800 border-red-200",
  },`;

content = content.replace(/\r\n/g, '\n');
content = content.replace(oldGuide.replace(/\r\n/g, '\n'), newGuide.replace(/\r\n/g, '\n'));

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully updated AdminDashboardHub.tsx with 4-step consultant execution & monthly report guide!');
