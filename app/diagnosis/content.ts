export type DiagnosisContent = {
  badge: string;
  title: string;
  subtitle: string;
  steps: Array<{
    no: string;
    title: string;
    description: string;
  }>;
};

export const diagnosisContent: DiagnosisContent = {
  badge: "PREMIUM DIAGNOSIS",
  title: "나의 입시멘토",
  subtitle: "학생부 업로드부터 분석, 탐구 주제, 입시 위치 진단까지 하나의 흐름으로 제공합니다.",
  steps: [
    {
      no: "1",
      title: "학생부 정보입력",
      description: "사용자 정보 입력과 학생부 업로드를 진행합니다.",
    },
    {
      no: "2",
      title: "학생부 분석",
      description: "학생부 상세 분석 결과를 리포트로 제공합니다.",
    },
    {
      no: "3",
      title: "독서·탐구·세특",
      description: "필수 연계 독서를 출발점으로 심화 탐구와 나이스 세특 문장을 구성합니다.",
    },
    {
      no: "4",
      title: "입시 위치 진단",
      description: "희망 대학 적합도와 최종 결과를 보여줍니다.",
    },
  ],
};

export const diagnosisScreenText = {
  step1: {
    title: "진단정보입력",
    subtitle: "정밀한 진단과 리포트 발송을 위해 모든 정보를 정확히 입력해주세요.",
  },
  step2: {
    title: "학생부 분석",
    subtitle: "학생부 상세 분석결과를 리포트로 제공합니다.",
  },
  step3: {
    title: "독서 연계 탐구·세특",
    subtitle: "필수 권장 도서를 출발점으로 심화 탐구 주제, 핵심 이론 요약 및 나이스 세특 문장을 완성합니다.",
  },
  step4: {
    title: "입시위치 진단",
    subtitle: "학생이 직접 선택한 희망대학 기준으로 성적과 학생부를 연결해 진단 결과를 제시합니다.",
  },
} as const;

function escapeSvg(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildTextSvg(title: string, subtitle?: string) {
  const safeTitle = escapeSvg(title);
  const safeSubtitle = subtitle ? escapeSvg(subtitle) : "";
  const subtitleBlock = safeSubtitle
    ? `<text x="0" y="68" fill="#6c6256" font-size="18" font-family="Pretendard, Arial, sans-serif">${safeSubtitle}</text>`
    : "";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1400" height="240" viewBox="0 0 1400 240">
      <rect width="1400" height="240" rx="32" fill="#fffaf4"/>
      <rect x="1" y="1" width="1398" height="238" rx="31" fill="none" stroke="#eadfce"/>
      <text x="40" y="104" fill="#1a0f08" font-size="56" font-weight="800" font-family="Pretendard, Arial, sans-serif">${safeTitle}</text>
      ${subtitleBlock}
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
