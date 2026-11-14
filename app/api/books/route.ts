import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type BookDoc = {
  title: string;
  contents: string;
  summary?: string;
  inquiryPoints?: string[];
  setukRecommendation?: string;
  url: string;
  isbn: string;
  datetime: string;
  authors: string[];
  publisher: string;
  thumbnail: string;
  source: "gemini+kakao" | "gemini" | "kakao" | "curated";
};

// Curated academic inquiry fallbacks
const academicCuratedDB: Record<
  string,
  {
    title: string;
    authors: string[];
    publisher: string;
    thumbnail: string;
    summary: string;
    inquiryPoints: string[];
    setukRecommendation: string;
  }
> = {
  "이기적 유전자": {
    title: "이기적 유전자",
    authors: ["리처드 도킨스"],
    publisher: "을유문화사",
    thumbnail: "https://search1.kakaocdn.net/thumb/R120x174.q85/?fname=http%3A%2F%2Ft1.daumcdn.net%2Flbook%2Fimage%2F1467472",
    summary: "진화의 주체를 개체나 종이 아닌 '유전자'로 파악하여, 자연선택과 이타적 행동 메커니즘을 유전자의 자기복제와 생존 관점에서 규명한 현대 생물학의 고전입니다. 문화적 진화 단위인 '밈(Meme)'의 개념을 제시합니다.",
    inquiryPoints: [
      "생명과학Ⅱ 유전과 진화 단원: 혈연선택설(Kin Selection)과 이타주의 행동의 수학적 모델링 분석",
      "생활과윤리/철학 단원: 유전자 결정론의 한계와 인간의 자유의지·도덕성 형성 간의 상관관계 고찰",
    ],
    setukRecommendation: "생명과학Ⅱ 시간에 『이기적 유전자』를 탐독하고 혈연선택설의 수식 모델을 생태계 공생 사례에 적용하여 분석 보고서를 작성함.",
  },
  "침묵의 봄": {
    title: "침묵의 봄",
    authors: ["레이첼 카슨"],
    publisher: "에코리브르",
    thumbnail: "https://search1.kakaocdn.net/thumb/R120x174.q85/?fname=http%3A%2F%2Ft1.daumcdn.net%2Flbook%2Fimage%2F1551676",
    summary: "DDT를 비롯한 무분별한 합성 살충제 살포가 먹이사슬을 통해 생태계와 인간 건강에 미치는 치명적 파괴를 과학적 데이터로 입증하며 현대 환경운동의 시발점이 된 저작입니다.",
    inquiryPoints: [
      "통합과학/생명과학: 먹이사슬에 따른 지용성 화학물질의 생물 농축 계수(BCF) 계산 및 생태계 교란 분석",
      "환경/화학: 유기염소계 살충제의 화학구조 분해 저항성과 친환경 대체 생물학적 방제 기술 비교",
    ],
    setukRecommendation: "화학물질의 잔류성과 생물 농축 메커니즘을 『침묵의 봄』과 연결하여 교내 수질 생태 지표를 탐구하고 친환경 대안을 발표함.",
  },
  "부분과 전체": {
    title: "부분과 전체",
    authors: ["베르너 하이젠베르크"],
    publisher: "지식산업사",
    thumbnail: "https://search1.kakaocdn.net/thumb/R120x174.q85/?fname=http%3A%2F%2Ft1.daumcdn.net%2Flbook%2Fimage%2F1470123",
    summary: "양자역학의 태동과 불확정성 원리의 발견 과정을 보어, 아인슈타인, 플랑크 등과의 심층 대화록 형식으로 정리하여, 물리학적 발견이 철학적 인식론과 어떻게 상호작용하는지 밝힌 과학 철학의 정수입니다.",
    inquiryPoints: [
      "물리학Ⅰ/Ⅱ: 미시 세계에서의 관측 행위가 대상에 미치는 영향과 행렬역학·파동역학의 수학적 동등성 분석",
      "철학/물리: 결정론적 고전역학 세계관에서 확률론적 양자역학 세계관으로의 패러다임 전환 탐구",
    ],
    setukRecommendation: "『부분과 전체』를 바탕으로 고전물리학의 인과율과 양자역학의 확률 해석 차이를 수식 및 사고실험을 통해 비교 분석하는 역량을 보임.",
  },
  "총 균 쇠": {
    title: "총, 균, 쇠",
    authors: ["재레드 다이아몬드"],
    publisher: "문학사상",
    thumbnail: "https://search1.kakaocdn.net/thumb/R120x174.q85/?fname=http%3A%2F%2Ft1.daumcdn.net%2Flbook%2Fimage%2F1511234",
    summary: "대륙 간 문명 발전 속도의 격차 원인을 인종적 우열이 아닌 유라시아 대륙의 축 방향, 동식물 가축화·작물화 가능성 등 지리적·생태학적 환경 요인으로 명쾌하게 규명한 융합 인류학의 결정판입니다.",
    inquiryPoints: [
      "통합사회/지리: 동서 방향 대륙 축과 남북 방향 축의 기후 연속성이 농업 기술 전파 속도에 미친 영향 모델링",
      "생명과학/보건: 가축 감염병의 인수공통감염 경로와 유럽 문명의 천연두 항체 형성이 신대륙 정복에 미친 역학 조사",
    ],
    setukRecommendation: "『총, 균, 쇠』의 지리적 환경 결정 모델을 바탕으로 고대 농경 문명 전파 경로를 지리정보(GIS) 지도와 결합하여 융합 보고서를 작성함.",
  },
  "엔트로피": {
    title: "엔트로피",
    authors: ["제레미 리프킨"],
    publisher: "세종연구원",
    thumbnail: "https://search1.kakaocdn.net/thumb/R120x174.q85/?fname=http%3A%2F%2Ft1.daumcdn.net%2Flbook%2Fimage%2F1522345",
    summary: "물리학의 열역학 제2법칙인 엔트로피 법칙을 경제, 사회, 환경, 군사 등 현대 물질 문명 전반에 투영하여, 에너지 낭비와 자원 고갈의 한계를 경고하고 태양 에너지 기반의 지속 가능한 분산형 문명을 촉구한 저작입니다.",
    inquiryPoints: [
      "물리학/화학: 열역학 제2법칙(고립계의 비가역적 무질서도 증가)의 수학적 엔트로피(S=k ln W)와 경제 성장 모델 비교",
      "통합사회/지구과학: 화석 연료 소비에 따른 엔트로피 배출과 지구 온난화 및 재생에너지 전환의 열역학적 타당성 검토",
    ],
    setukRecommendation: "『엔트로피』의 열역학 제2법칙 개념을 도시 에너지 순환 시스템에 대입하여, 에너지 효율 최적화 방안을 제안하는 창의적 문제 해결력을 나타냄.",
  },
};

async function fetchKakaoBook(query: string, apiKey: string) {
  try {
    const res = await fetch(`https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(query)}&size=1`, {
      headers: { Authorization: `KakaoAK ${apiKey}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.documents?.[0] || null;
  } catch {
    return null;
  }
}

async function fetchGeminiBookAnalysis(bookTitle: string, apiKey: string) {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const prompt = `당신은 대한민국 최고 입시 전문 '대치 수프리마 대입전략연구소'의 수석 입시 연구원입니다.
고등학생이 학교생활기록부 학생부종합전형 탐구활동 및 세특에 인용할 도서 『${bookTitle}』에 대해 심층 입시 분석을 수행하세요.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "summary": "도서의 핵심 논점, 저자의 문제의식 및 핵심 챕터 요약 (2~3문장)",
  "inquiryPoints": [
    "탐구 연계 포인트 1 (교과목 단원 및 구체적 연구 주제)",
    "탐구 연계 포인트 2 (연구 가설 및 심화 분석 논점)"
  ],
  "setukRecommendation": "나이스 학교생활기록부 교과 세특에 기재 가능한 고품질 도서 연계 탐구 문장 (1~2문장)"
}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
          maxOutputTokens: 2048,
        },
      }),
      signal: AbortSignal.timeout(12000),
      cache: "no-store",
    });

    if (!res.ok) return null;
    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) return null;
    return JSON.parse(raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, ""));
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("query") || "").trim();

  if (!query) {
    return NextResponse.json({ error: "도서명을 입력해 주세요.", documents: [] }, { status: 400 });
  }

  const geminiKey = process.env.GEMINI_API_KEY || "";
  const kakaoKey =
    process.env.KAKAO_REST_API_KEY ||
    process.env.KAKAO_CLIENT_ID ||
    process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY ||
    "";

  // 1. Try Kakao Book Search for metadata & cover thumbnail
  let kakaoDoc = kakaoKey ? await fetchKakaoBook(query, kakaoKey) : null;

  // 2. Try Google Gemini API for deep admissions inquiry summarization
  let geminiAnalysis = geminiKey ? await fetchGeminiBookAnalysis(query, geminiKey) : null;

  // 3. Match curated academic DB if Gemini/Kakao returned partial data
  const matchedKey = Object.keys(academicCuratedDB).find((k) => query.includes(k) || k.includes(query));
  const curated = matchedKey ? academicCuratedDB[matchedKey] : null;

  const title = kakaoDoc?.title || curated?.title || query;
  const authors = kakaoDoc?.authors?.length ? kakaoDoc.authors : curated?.authors || ["전문 연구자 공저"];
  const publisher = kakaoDoc?.publisher || curated?.publisher || "학술 전문 출판사";
  const thumbnail = kakaoDoc?.thumbnail || curated?.thumbnail || "";
  const isbn = kakaoDoc?.isbn || "";
  const datetime = kakaoDoc?.datetime ? kakaoDoc.datetime.slice(0, 10) : "최신";

  const summary =
    geminiAnalysis?.summary ||
    kakaoDoc?.contents ||
    curated?.summary ||
    `『${title}』는 해당 분야의 핵심 개념과 이론적 전개를 다룬 저작으로, 학생부 세특 탐구활동의 이론적 근거와 심화 배경 지식으로 탁월한 가치를 지닙니다.`;

  const inquiryPoints =
    geminiAnalysis?.inquiryPoints ||
    curated?.inquiryPoints || [
      `관련 교과 심화 탐구: 『${title}』의 핵심 원리를 교과 단원 개념과 결합하여 탐구 가설 검증`,
      "실생활 및 융합 연구: 도서의 이론적 모델을 현대 사회 및 과학기술 이슈에 적용하여 심층 분석",
    ];

  const setukRecommendation =
    geminiAnalysis?.setukRecommendation ||
    curated?.setukRecommendation ||
    `『${title}』를 탐독하고 핵심 개념을 교과 단원의 심화 내용과 연결하여 체계적인 탐구보고서를 작성하는 자기주도적 학업역량을 드러냄.`;

  const source: BookDoc["source"] =
    geminiAnalysis && kakaoDoc
      ? "gemini+kakao"
      : geminiAnalysis
      ? "gemini"
      : kakaoDoc
      ? "kakao"
      : "curated";

  const doc: BookDoc = {
    title,
    contents: summary,
    summary,
    inquiryPoints,
    setukRecommendation,
    url: kakaoDoc?.url || "",
    isbn,
    datetime,
    authors,
    publisher,
    thumbnail,
    source,
  };

  return NextResponse.json({ success: true, documents: [doc] });
}
