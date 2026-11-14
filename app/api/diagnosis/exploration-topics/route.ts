import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type ExplorationTopicsRequest = {
  subject?: string;
  keywords?: string[];
  careerHint?: string;
  count?: number;
};

export type MandatoryBook = {
  title: string;
  author: string;
  publisher: string;
  core_concept: string;
};

export type TopicResult = {
  id: string;
  subject: string;
  keyword: string;
  mandatory_book: MandatoryBook;
  topic_title: string;
  topic_direction: string;
  books: string[];
  papers: string[];
  data_sources: string[];
  expected_conclusion: string;
  setuk_sentence: string;
  tip?: string;
};

// Canonical authoritative book database mapped by subject & themes
const subjectBookMappings: Record<
  string,
  {
    book: MandatoryBook;
    titleTemplate: (kw: string) => string;
    directionTemplate: (kw: string, book: MandatoryBook) => string;
    setukTemplate: (kw: string, book: MandatoryBook) => string;
    papers: string[];
    data_sources: string[];
  }[]
> = {
  "과학탐구": [
    {
      book: {
        title: "이기적 유전자",
        author: "리처드 도킨스",
        publisher: "을유문화사",
        core_concept: "혈연선택설과 게임이론적 ESS(진화적으로 안정한 전략) 모델",
      },
      titleTemplate: (kw) => `『이기적 유전자』의 ESS 모델을 적용한 ${kw} 생태 상호작용 및 생존 전략 탐구`,
      directionTemplate: (kw, b) =>
        `수업 중 ${kw}에 생긴 학문적 호기심을 바탕으로 도서 『${b.title}』(${b.author})을 탐독함. 도서에 제시된 ${b.core_concept}을 교과 단원의 진화 및 생태계 개념과 연결하여 실제 군집 데이터의 생존 적합도를 수학적 시뮬레이션으로 비교 분석함.`,
      setukTemplate: (kw, b) =>
        `교과 단원의 ${kw} 개념에 호기심을 갖고 『${b.title}』(${b.author})을 탐독함. 도서의 ${b.core_concept}을 바탕으로 생태계 공생 관계를 정량적으로 모델링하고 심화 탐구보고서를 작성하여 발표하는 뛰어난 자기주도적 학업역량을 드러냄.`,
      papers: ["진화생물학에서의 혈연선택과 이타주의 메커니즘 연구", "한국생태학회지 군집 상호작용 논문"],
      data_sources: ["국립생태원 생태통계", "NCBI 유전체 데이터베이스", "교과서 심화 탐구자료"],
    },
    {
      book: {
        title: "침묵의 봄",
        author: "레이첼 카슨",
        publisher: "에코리브르",
        core_concept: "먹이사슬을 통한 잔류성 유해물질의 생물 농축 계수(BCF)와 생태 독성",
      },
      titleTemplate: (kw) => `『침묵의 봄』의 화학물질 생물 농축 메커니즘을 연계한 ${kw} 환경 독성 분석`,
      directionTemplate: (kw, b) =>
        `『${b.title}』(${b.author})에서 고발한 ${b.core_concept}을 학습하고, ${kw}과 관련된 수질 및 토양 오염물질의 잔류 기간을 측정·비교하여 생태계 보전 방안을 도출함.`,
      setukTemplate: (kw, b) =>
        `환경과 생명과학을 융합한 『${b.title}』(${b.author})을 탐독하고, ${kw} 분야의 화학물질이 생태계에 미치는 ${b.core_concept}을 도표와 그래프로 분석하여 친환경 대안을 제안하는 통찰력을 보임.`,
      papers: ["환경독성보건학회 환경오염물질 생물 농축성 평가 연구", "잔류성 유기오염물질 실태조사 보고서"],
      data_sources: ["국립환경과학원 환경빅데이터", "화학물질안전원 DB", "교내 환경 지표수 관찰기록"],
    },
    {
      book: {
        title: "부분과 전체",
        author: "베르너 하이젠베르크",
        publisher: "지식산업사",
        core_concept: "양자역학의 불확정성 원리와 관측 행위가 미시 세계에 미치는 물리적 영향",
      },
      titleTemplate: (kw) => `『부분과 전체』의 불확정성 원리를 고찰한 ${kw} 측정 한계와 확률론적 해석 탐구`,
      directionTemplate: (kw, b) =>
        `고전물리학의 인과율과 양자역학의 확률 해석을 다룬 『${b.title}』(${b.author})을 읽고, ${kw}의 물리적 변화를 미시 세계의 확률 진폭과 연결하여 오차 한계를 분석함.`,
      setukTemplate: (kw, b) =>
        `물리학과 과학철학 명저인 『${b.title}』(${b.author})을 읽고 ${kw} 관련 물리 실험에서 발생하는 측정 한계를 ${b.core_concept}과 결합하여 다각도로 고찰함.`,
      papers: ["양자역학의 역사와 과학철학적 함의", "현대물리학회지 미시 물리 모델링 연구"],
      data_sources: ["한국원자력연구원 공개데이터", "CERN 실험 관측치", "물리학 교과서 실험데이터"],
    },
  ],
  "수학": [
    {
      book: {
        title: "수학 콘서트",
        author: "박경미",
        publisher: "동아시아",
        core_concept: "소수 정리를 기반으로 한 RSA 공개키 암호 알고리즘과 행렬 변환",
      },
      titleTemplate: (kw) => `『수학 콘서트』의 암호 체계를 적용한 ${kw} 데이터 암호화 알고리즘 탐구`,
      directionTemplate: (kw, b) =>
        `수학이 사회 기술에 적용되는 원리를 다룬 『${b.title}』(${b.author})을 읽고, 모듈러 연산과 ${kw}의 수식 구조를 융합하여 안전한 보안 알고리즘을 분석함.`,
      setukTemplate: (kw, b) =>
        `수학의 응용력을 다룬 『${b.title}』(${b.author})을 탐독하고, ${kw} 단원의 함수 및 수열 개념을 ${b.core_concept}에 접목하여 직접 코딩하고 증명하는 수학적 논리성을 보임.`,
      papers: ["정수론 기반 공개키 암호 시스템의 효율성 분석", "한국수학교육학회지 실생활 수학모델링"],
      data_sources: ["KCI 수학 학술논문", "알고리즘 연산시간 데이터", "국가수리과학연구소 포털"],
    },
    {
      book: {
        title: "틀리지 않는 법",
        author: "조던 엘렌버그",
        publisher: "열린책들",
        core_concept: "빅데이터 통계의 편향 오류(생존 편향)와 베이즈 추론 확률 모델",
      },
      titleTemplate: (kw) => `『틀리지 않는 법』의 베이즈 추론을 통한 ${kw} 통계 편향 극복 모델링`,
      directionTemplate: (kw, b) =>
        `확률과 통계의 실전 왜곡을 방지하는 『${b.title}』(${b.author})을 읽고, ${kw} 관련 표본 데이터의 오차를 베이지안 확률로 보정하는 분석을 진행함.`,
      setukTemplate: (kw, b) =>
        `수학적 사고의 힘을 다룬 『${b.title}』(${b.author})을 탐독한 뒤, ${kw} 통계 조사에서 나타나는 오류를 ${b.core_concept}을 적용하여 논리적으로 교정한 분석 리포트를 작성함.`,
      papers: ["베이지안 추론을 이용한 데이터 편향 보정 연구", "통계학회지 모형 적합도 검정"],
      data_sources: ["통계청 KOSIS 마이크로데이터", "공공데이터포털 설문통계", "수업 탐구자료"],
    },
  ],
  "사회탐구": [
    {
      book: {
        title: "정의란 무엇인가",
        author: "마이클 샌델",
        publisher: "와이즈베리",
        core_concept: "롤스의 차등원칙(Difference Principle)과 공리주의적 분배 정의의 한계",
      },
      titleTemplate: (kw) => `『정의란 무엇인가』의 롤스 정의론을 적용한 ${kw} 제도 형평성 및 정책 평가`,
      directionTemplate: (kw, b) =>
        `현대 도덕 철학을 다룬 『${b.title}』(${b.author})을 탐독하고, ${kw} 분야의 사회적 딜레마 사례를 ${b.core_concept} 관점에서 다각적으로 비판·검토함.`,
      setukTemplate: (kw, b) =>
        `사회 정의의 철학적 기준을 다룬 『${b.title}』(${b.author})을 읽고, ${kw} 관련 사회 정책의 수혜자와 소외 계층을 ${b.core_concept}에 입각해 분석한 심층 소논문을 작성함.`,
      papers: ["롤스의 정의론과 현대 복지국가의 재분배 정책 연구", "한국행정학보 정책 형평성 논문"],
      data_sources: ["보건사회연구원 복지패널", "국회예산정책처 분석보고서", "통계청 사회조사"],
    },
    {
      book: {
        title: "총, 균, 쇠",
        author: "재레드 다이아몬드",
        publisher: "문학사상",
        core_concept: "지리적 환경 결정 모델과 대륙 축 방향이 문명 확산 속도에 미친 영향",
      },
      titleTemplate: (kw) => `『총, 균, 쇠』의 지리 생태 모델로 고찰한 ${kw} 불균형 발전 구조 분석`,
      directionTemplate: (kw, b) =>
        `인류 문명의 지리적 환경 조건을 규명한 『${b.title}』(${b.author})을 읽고, ${kw}의 역사적 형성 요인을 공간 지리 데이터와 결합하여 실증적으로 분석함.`,
      setukTemplate: (kw, b) =>
        `융합 인류학 고전인 『${b.title}』(${b.author})을 탐독한 후, ${kw}의 글로벌 격차 문제를 ${b.core_concept}과 연결 지어 지리정보(GIS) 분석으로 입증함.`,
      papers: ["지리적 요인과 국가 간 경제성장 격차 분석", "대한지리학회지 공간 확산 모델링"],
      data_sources: ["세계은행(World Bank) 글로벌 통계", "국토정보플랫폼 공간자료", "교과 자료집"],
    },
    {
      book: {
        title: "넛지",
        author: "리처드 탈러",
        publisher: "리더스북",
        core_concept: "행동경제학의 선택 설계(Choice Architecture)와 기본값(Default) 효과",
      },
      titleTemplate: (kw) => `『넛지』의 행동경제학 선택 설계를 활용한 ${kw} 참여 활성화 방안 기획`,
      directionTemplate: (kw, b) =>
        `인간의 제한된 합리성을 다룬 『${b.title}』(${b.author})을 바탕으로, ${kw} 문제 해결을 위한 넛지(Nudge) 유도 정책을 설계하고 효과를 예측함.`,
      setukTemplate: (kw, b) =>
        `행동경제학의 핵심을 다룬 『${b.title}』(${b.author})을 탐독하고, ${kw} 문제에 대해 처벌이나 규제가 아닌 ${b.core_concept}을 적용한 자발적 개선안을 제안함.`,
      papers: ["행동경제학의 넛지 이론을 활용한 공공정책 개선 방안", "경영학연구 소비자 심리 연구"],
      data_sources: ["한국소비자원 정책리포트", "행동경제학 실험 통계", "학교 실태조사 설문"],
    },
  ],
  "정보(IT)": [
    {
      book: {
        title: "인공지능의 미래",
        author: "레이 커즈와일",
        publisher: "동아시아",
        core_concept: "패턴 인식 마음 이론(PRTM)과 딥러닝 신경망 아키텍처의 연계",
      },
      titleTemplate: (kw) => `『인공지능의 미래』의 패턴 인식 이론을 적용한 ${kw} 딥러닝 모델 설계 탐구`,
      directionTemplate: (kw, b) =>
        `뇌과학과 컴퓨터 사이언스를 융합한 『${b.title}』(${b.author})을 탐독하고, ${kw} 처리를 위한 인공신경망의 가중치 최적화와 역전파 수식을 탐구함.`,
      setukTemplate: (kw, b) =>
        `인공지능의 구조적 진화를 다룬 『${b.title}』(${b.author})을 읽고, ${kw} 구현을 위한 ${b.core_concept}을 실제 파이썬 코드로 구현하고 알고리즘 복잡도를 분석함.`,
      papers: ["딥러닝 인공신경망의 패턴 분류 효율성 연구", "한국정보과학회 학술발표논문"],
      data_sources: ["Kaggle 오픈 데이터셋", "GitHub 오픈소스 모델", "인공지능연구원 공개자료"],
    },
    {
      book: {
        title: "알고리즘 산책",
        author: "루크 도멜",
        publisher: "반니",
        core_concept: "그래프 이론 최단 경로 탐색(Dijkstra)과 시간 복잡도(Big-O) 최적화",
      },
      titleTemplate: (kw) => `『알고리즘 산책』의 그래프 알고리즘을 활용한 ${kw} 최적화 시뮬레이션`,
      directionTemplate: (kw, b) =>
        `알고리즘의 논리적 설계를 다룬 『${b.title}』(${b.author})을 읽고, ${kw} 데이터의 탐색 및 정렬 연산 효율을 높이는 알고리즘을 설계함.`,
      setukTemplate: (kw, b) =>
        `컴퓨팅 사고의 핵심을 다룬 『${b.title}』(${b.author})을 탐독하고, ${kw} 문제를 해결하기 위해 ${b.core_concept}을 적용한 자료구조 프로그램을 완성함.`,
      papers: ["그래프 탐색 알고리즘의 최적화 기법 분석", "정보처리학회 연산 효율 연구"],
      data_sources: ["공공 API 교통/물류망 데이터", "알고리즘 벤치마크 테스트셋", "수업 실습파일"],
    },
  ],
};

function normalizeSubject(value: unknown): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (text.includes("사회")) return "사회탐구";
  if (text.includes("정보") || text.toLowerCase().includes("it")) return "정보(IT)";
  if (text.includes("수학")) return "수학";
  return "과학탐구";
}

function normalizeKeywords(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean).slice(0, 3);
}

function buildReadingFirstTopic(subject: string, keyword: string, index: number): TopicResult {
  const mappingList = subjectBookMappings[subject] || subjectBookMappings["과학탐구"];
  const item = mappingList[index % mappingList.length];
  const book = item.book;
  const kw = keyword || subject;

  return {
    id: `topic-${index + 1}`,
    subject,
    keyword: kw,
    mandatory_book: book,
    topic_title: item.titleTemplate(kw),
    topic_direction: item.directionTemplate(kw, book),
    books: [book.title, `${book.title} (저자: ${book.author})`],
    papers: item.papers,
    data_sources: item.data_sources,
    expected_conclusion: `도서 『${book.title}』의 ${book.core_concept}을 ${kw} 실데이터에 적용하여 가설을 실증하고 결론을 도출함.`,
    setuk_sentence: item.setukTemplate(kw, book),
    tip: `반드시 도서 『${book.title}』의 핵심 챕터를 먼저 정독하고 도서의 이론을 탐구보고서 서론의 연구 동기로 명시하세요.`,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ExplorationTopicsRequest;
    const subject = normalizeSubject(body.subject);
    const keywords = normalizeKeywords(body.keywords);
    const count = Math.max(1, Math.min(3, Number(body.count ?? 3) || 3));

    const topics: TopicResult[] = Array.from({ length: count }, (_, index) => {
      const kw = keywords[index] || keywords[0] || (index === 0 ? "핵심 교과 개념" : index === 1 ? "융합 심화 주제" : "실제 사례 분석");
      return buildReadingFirstTopic(subject, kw, index);
    });

    return NextResponse.json({ topics });
  } catch {
    return NextResponse.json({ error: "Failed to generate reading-linked exploration topics" }, { status: 500 });
  }
}
