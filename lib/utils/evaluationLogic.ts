export const EVALUATION_TERMS = ["1-1", "1-2", "2-1", "2-2", "3-1"];

export const COMMON_PHRASES = [
  "논리적으로 전개",
  "성실히 참여",
  "자기주도적으로",
  "적극적으로 질문",
  "협업과 소통"
];

// Target 15 Universities Rubrics
export const UNIVERSITIES = [
  { id: "snu", name: "서울대학교", labels: ["학업능력", "학업태도", "학업외소양"] },
  { id: "yonsei", name: "연세대학교", labels: ["학업역량", "진로역량", "공동체역량"] },
  { id: "korea", name: "고려대학교", labels: ["학업역량", "자기계발역량", "인성"] },
  { id: "sogang", name: "서강대학교", labels: ["학업역량", "진로역량", "공동체역량"] },
  { id: "skku", name: "성균관대학교", labels: ["학업역량", "진로역량", "공동체역량"] },
  { id: "hanyang", name: "한양대학교", labels: ["학업역량", "진로역량", "공동체역량"] },
  { id: "cau", name: "중앙대학교", labels: ["학업역량", "진로역량", "공동체역량"] },
  { id: "khu", name: "경희대학교", labels: ["학업역량", "진로역량", "공동체역량"] },
  { id: "hufs", name: "한국외국어대학교", labels: ["학업역량", "진로역량", "공동체역량"] },
  { id: "uos", name: "서울시립대학교", labels: ["학업역량", "진로역량", "공동체역량"] },
  { id: "ewha", name: "이화여자대학교", labels: ["학업역량", "학교활동의 우수성", "발전가능성"] },
  { id: "konkuk", name: "건국대학교", labels: ["학업역량", "진로역량", "공동체역량"] },
  { id: "dongguk", name: "동국대학교", labels: ["학업역량", "진로역량", "공동체역량"] },
  { id: "hongik", name: "홍익대학교", labels: ["학업역량", "진로역량", "공동체역량"] },
  { id: "sookmyung", name: "숙명여자대학교", labels: ["학업역량", "진로역량", "공동체역량"] }
];

export const MAJORS = [
  {
    key: "engineering",
    label: "공학계열",
    coreGroups: [
      { group: "수학(핵심)", required: ["수학Ⅰ", "수학Ⅱ", "미적분", "확률과 통계"], optional: ["기하"] },
      { group: "과학(핵심)", required: ["물리학Ⅰ", "화학Ⅰ"], optional: ["통합과학", "생명과학Ⅰ", "지구과학Ⅰ"] },
      { group: "정보/융합", required: ["정보"], optional: ["인공지능 기초", "데이터과학"] }
    ]
  },
  {
    key: "humanities",
    label: "인문계열",
    coreGroups: [
      { group: "국어/독해", required: ["국어"], optional: ["문학", "화법과작문"] },
      { group: "사회(핵심)", required: ["한국사", "사회문화"], optional: ["생활과윤리", "윤리와사상", "세계사"] },
      { group: "수학(기초)", required: ["수학Ⅰ"], optional: ["수학Ⅱ", "확률과 통계"] }
    ]
  }
];

export const REF_AVG = [3.5, 3.4, 3.3, 3.2, 3.1];

export const DISTRIBUTION_BY_SUBJECT: Record<string, { A: number; B: number; C: number; n: number }> = {
  "수학Ⅰ": { A: 18, B: 44, C: 38, n: 176 },
  "수학Ⅱ": { A: 16, B: 46, C: 38, n: 172 },
  "미적분": { A: 14, B: 48, C: 38, n: 168 },
  "확률과 통계": { A: 20, B: 42, C: 38, n: 164 },
  "물리학Ⅰ": { A: 12, B: 50, C: 38, n: 140 },
  "화학Ⅰ": { A: 15, B: 47, C: 38, n: 150 },
  "국어": { A: 22, B: 44, C: 34, n: 180 },
  "영어": { A: 24, B: 42, C: 34, n: 178 }
};

export const MOCK_CANDIDATE = {
  id: "demo-virtual",
  schoolLine: "가상 고등학교 · 예비 고3 · 데모학생",
  track: "일반고(가상) · 2015개정 교육과정",
  takenCourses: ["국어", "영어", "수학Ⅰ", "수학Ⅱ", "미적분", "확률과 통계", "통합과학", "물리학Ⅰ", "화학Ⅰ", "한국사", "사회문화"],
  gradesBySubject: {
    "국어": [3.0, 2.7, 2.4, 2.3, 2.2],
    "영어": [2.8, 2.6, 2.3, 2.1, 2.0],
    "수학Ⅰ": [2.7, 2.3, 2.0, 1.9, 1.8],
    "수학Ⅱ": [2.9, 2.4, 2.1, 1.9, 1.9],
    "미적분": [null, null, 2.2, 1.9, 1.8],
    "물리학Ⅰ": [null, null, 2.4, 2.2, 2.1],
  },
  sepec: [
    { term: "1-1", subject: "수학Ⅰ", text: `함수 단원에서 그래프 해석을 통해 정의역·치역과 변화 양상을 설명하는 능력이 우수함.` },
    { term: "2-1", subject: "물리학Ⅰ", text: `등가속도 운동 실험에서 오차 원인을 장치/환경/측정자 요인으로 분류하고 개선안을 제시함.` }
  ],
  ca: {
    autonomous: [{ tag: "자율활동", text: `학급 구성원이 쉽게 활용하도록 학습 점검표를 제작함.` }],
    club: [{ tag: "동아리활동", text: `실험 데이터 기반 모델링 팀 프로젝트 수행.` }],
    career: [{ tag: "진로활동", text: `전공 관련 교과 이수 계획을 스스로 수립함.` }]
  }
};

// Successful Candidate Mock Data (합격자 사례)
export const SUCCESSFUL_CANDIDATES: Record<string, { univ: string; major: string; gpaTrend: number[]; keywords: string[]; sepecSnippet: string; rubricAvg: Record<string, string> }> = {
  "snu_engineering": {
    univ: "서울대학교",
    major: "공학계열",
    gpaTrend: [1.5, 1.4, 1.3, 1.2, 1.1],
    keywords: ["심화탐구", "수리적 모델링", "주도성"],
    sepecSnippet: "미적분학의 기본정리를 활용하여 물리 엔진의 오차율을 수리적으로 모델링하고 한계를 분석함.",
    rubricAvg: { "학업능력": "A", "학업태도": "A", "학업외소양": "B" }
  },
  "yonsei_engineering": {
    univ: "연세대학교",
    major: "공학계열",
    gpaTrend: [1.8, 1.7, 1.5, 1.4, 1.3],
    keywords: ["융합사고", "창의성", "문제해결"],
    sepecSnippet: "과학 탐구에서 발생한 예외 데이터를 제외하지 않고 코딩을 통해 시뮬레이션 환경을 구축함.",
    rubricAvg: { "학업역량": "A", "진로역량": "A", "공동체역량": "A" }
  },
  "default": {
    univ: "합격자 평균",
    major: "전공",
    gpaTrend: [2.5, 2.3, 2.1, 2.0, 1.9],
    keywords: ["성실성", "발전가능성", "전공적합성"],
    sepecSnippet: "교과 수업 내용을 바탕으로 희망 전공과 연계한 보고서를 성실히 작성함.",
    rubricAvg: { "학업역량": "B", "진로역량": "A", "공동체역량": "B" }
  }
};

export function isCommonText(text: string) {
  if (!text) return false;
  return COMMON_PHRASES.some(p => text.includes(p));
}

export function computeTermAvgFromRecords(gradesBySubject: Record<string, (number | null)[]>) {
  if (!gradesBySubject) return [null, null, null, null, null];
  const subjects = Object.keys(gradesBySubject);
  const termAvg = EVALUATION_TERMS.map((_, i) => {
    const arr: number[] = [];
    subjects.forEach(s => {
      const v = gradesBySubject[s]?.[i];
      if (v != null && !isNaN(v)) arr.push(v);
    });
    if (!arr.length) return null;
    return +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2);
  });
  return termAvg;
}

export function getTrendType(values: (number | null)[]) {
  const arr = values.filter(v => v != null) as number[];
  if (arr.length < 3) return "자료 제한";
  const delta = arr[0] - arr[arr.length - 1];
  if (delta >= 0.5) return "📈 성장형";
  if (delta <= -0.3) return "📉 하락형";
  return "➖ 유지형";
}
