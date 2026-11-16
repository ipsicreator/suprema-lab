const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9'; // 13.333 x 7.5 inches

// Brand Color Palette
const COLORS = {
  bgLight: 'FAF8F5',
  cardBg: 'FFFFFF',
  burgundy: '8B1A1A',
  darkBurgundy: '6B1010',
  navy: '1E3A8A',
  blueNavy: '1E5A84',
  teal: '0E7070',
  darkText: '1A1A1A',
  charcoal: '2A1B12',
  slateText: '475569',
  borderBeige: 'EADFCE',
  lightBeige: 'F4EFE6',
  greenBtn: '529838',
  white: 'FFFFFF',
  badgeBg: 'FFF5F5',
  amber: 'D97706',
  softGray: 'F8FAFC',
};

const FONT_TITLE = 'Malgun Gothic';
const FONT_BODY = 'Malgun Gothic';

// Helper: Add Standard Header on internal slides (Slide 2 ~ 11)
function addSlideHeader(slide, category, title, subtitle) {
  // Category Pill
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 0.45,
    w: 2.5,
    h: 0.35,
    rectRadius: 0.15,
    fill: { color: COLORS.badgeBg },
    line: { color: COLORS.burgundy, width: 1 },
  });
  slide.addText(category, {
    x: 0.8,
    y: 0.45,
    w: 2.5,
    h: 0.35,
    fontSize: 10,
    fontFace: FONT_BODY,
    color: COLORS.burgundy,
    bold: true,
    align: 'center',
    valign: 'middle',
  });

  // Title
  slide.addText(title, {
    x: 0.8,
    y: 0.9,
    w: 11.7,
    h: 0.55,
    fontSize: 21,
    fontFace: FONT_TITLE,
    color: COLORS.darkText,
    bold: true,
  });

  // Subtitle
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.8,
      y: 1.45,
      w: 11.7,
      h: 0.38,
      fontSize: 11.5,
      fontFace: FONT_BODY,
      color: COLORS.slateText,
    });
  }

  // Top Right Brand Logo Text
  slide.addText('대치수프리마 대입전략연구소 | 나의 입시멘토', {
    x: 7.5,
    y: 0.45,
    w: 5.0,
    h: 0.35,
    fontSize: 10,
    fontFace: FONT_BODY,
    color: COLORS.burgundy,
    bold: true,
    align: 'right',
    valign: 'middle',
  });

  // Footer line
  slide.addShape(pres.ShapeType.line, {
    x: 0.8,
    y: 6.9,
    w: 11.733,
    h: 0,
    line: { color: COLORS.borderBeige, width: 1 },
  });

  // Footer text
  slide.addText('DAECHI SUPRIMA UNIVERSITY ADMISSIONS RESEARCH INSTITUTE | PROPRIETARY & CONFIDENTIAL', {
    x: 0.8,
    y: 7.0,
    w: 11.733,
    h: 0.3,
    fontSize: 8.5,
    fontFace: FONT_BODY,
    color: COLORS.slateText,
  });
}

// ==========================================
// SLIDE 1: 표지 (인트로 와이어프레임 100% 매칭)
// ==========================================
{
  const s1 = pres.addSlide();
  s1.background = { color: COLORS.bgLight };

  // 1. Top Bar
  const logoPath = path.resolve('public/suprema-official-logo.png');
  if (fs.existsSync(logoPath)) {
    s1.addImage({
      path: logoPath,
      x: 0.8,
      y: 0.45,
      w: 1.6,
      h: 0.5,
    });
  }

  // Divider
  s1.addShape(pres.ShapeType.line, {
    x: 2.55,
    y: 0.45,
    w: 0,
    h: 0.5,
    line: { color: 'D8C8B4', width: 1.5 },
  });

  // Subtitle
  s1.addText([
    { text: '대치 수프리마 대입전략연구소\n', options: { fontSize: 9.5, bold: true, color: COLORS.burgundy } },
    { text: '나의 입시멘토', options: { fontSize: 11.5, bold: true, color: COLORS.charcoal } },
  ], {
    x: 2.7,
    y: 0.42,
    w: 3.5,
    h: 0.55,
    fontFace: FONT_BODY,
    margin: 0,
  });

  // Right '학원연결' button
  s1.addShape(pres.ShapeType.roundRect, {
    x: 11.3,
    y: 0.45,
    w: 1.2,
    h: 0.4,
    rectRadius: 0.1,
    fill: { color: COLORS.white },
    line: { color: 'D8C7B2', width: 1 },
  });
  s1.addText('학원연결', {
    x: 11.3,
    y: 0.45,
    w: 1.2,
    h: 0.4,
    fontSize: 10,
    fontFace: FONT_BODY,
    color: '475569',
    bold: true,
    align: 'center',
    valign: 'middle',
  });

  // 2. Top Badge
  s1.addShape(pres.ShapeType.roundRect, {
    x: 3.8,
    y: 1.4,
    w: 5.7,
    h: 0.38,
    rectRadius: 0.19,
    fill: { color: COLORS.white },
    line: { color: 'E4D4BF', width: 1 },
  });
  s1.addText('✦ 대한민국 유일의 완벽한 2026·2027·2028 수시 올인원 솔루션', {
    x: 3.8,
    y: 1.4,
    w: 5.7,
    h: 0.38,
    fontSize: 11,
    fontFace: FONT_BODY,
    color: COLORS.burgundy,
    bold: true,
    align: 'center',
    valign: 'middle',
  });

  // 3. Headline
  s1.addText('AI Mentor와 함께하는', {
    x: 1.0,
    y: 1.9,
    w: 11.333,
    h: 0.5,
    fontSize: 24,
    fontFace: FONT_TITLE,
    color: COLORS.darkText,
    bold: true,
    align: 'center',
  });
  s1.addText('학생부 탐구·세특 Maker', {
    x: 1.0,
    y: 2.4,
    w: 11.333,
    h: 0.75,
    fontSize: 42,
    fontFace: FONT_TITLE,
    color: COLORS.darkText,
    bold: true,
    align: 'center',
  });

  // 4. Philosophy Slogan
  s1.addText('나의 입시 멘토 “생각이 있으면, 방법은 따라 옵니다” 정교한 시스템으로, 따라만 해도 완성되는 학생부.', {
    x: 1.0,
    y: 3.25,
    w: 11.333,
    h: 0.45,
    fontSize: 14,
    fontFace: FONT_BODY,
    color: '222222',
    bold: true,
    align: 'center',
  });

  // 5. Subtext
  s1.addText([
    { text: '2028 대입 개편 5등급제·9등급제 자동 환산과 전국 164개 대학 26,295개 전형 최신 컷오프를 탑재\n', options: { bold: true } },
    { text: '하여, 학생부 정밀 분석부터 나이스 기재용 세특 문장과 카카오 도서 연계 추천까지 한 번에 완성합니다.', options: { bold: false } },
  ], {
    x: 1.5,
    y: 3.75,
    w: 10.333,
    h: 0.65,
    fontSize: 11.5,
    fontFace: FONT_BODY,
    color: '4B5563',
    align: 'center',
    lineSpacingMultiple: 1.2,
  });

  // 6. Green CTA Button Container
  s1.addShape(pres.ShapeType.roundRect, {
    x: 3.5,
    y: 4.55,
    w: 6.333,
    h: 0.85,
    rectRadius: 0.15,
    fill: { color: COLORS.white },
    line: { color: 'E6DBC9', width: 1 },
  });
  s1.addShape(pres.ShapeType.roundRect, {
    x: 4.8,
    y: 4.7,
    w: 3.733,
    h: 0.55,
    rectRadius: 0.12,
    fill: { color: COLORS.greenBtn },
  });
  s1.addText('AI Mentor 시작하기', {
    x: 4.8,
    y: 4.7,
    w: 3.733,
    h: 0.55,
    fontSize: 14,
    fontFace: FONT_BODY,
    color: COLORS.white,
    bold: true,
    align: 'center',
    valign: 'middle',
  });

  // 7. 4 Stat Cards
  const cards = [
    { num: '164개', label: '전국 주요대학 DB', color: COLORS.burgundy },
    { num: '26,295개', label: '수시 전형 컷오프', color: COLORS.burgundy },
    { num: '5등급 ↔ 9등급', label: '개편안 자동 환산', color: COLORS.teal },
    { num: '6개월(학기별)', label: '연계학원관리', color: COLORS.darkText },
  ];

  const cardW = 2.65;
  const cardGap = 0.35;
  const startX = 0.85;

  cards.forEach((c, idx) => {
    const cx = startX + idx * (cardW + cardGap);
    s1.addShape(pres.ShapeType.roundRect, {
      x: cx,
      y: 5.65,
      w: cardW,
      h: 1.35,
      rectRadius: 0.12,
      fill: { color: COLORS.white },
      line: { color: 'E8DFD1', width: 1 },
    });

    s1.addText(c.num, {
      x: cx,
      y: 5.8,
      w: cardW,
      h: 0.6,
      fontSize: 18,
      fontFace: FONT_TITLE,
      color: c.color,
      bold: true,
      align: 'center',
    });

    s1.addText(c.label, {
      x: cx,
      y: 6.4,
      w: cardW,
      h: 0.4,
      fontSize: 11,
      fontFace: FONT_BODY,
      color: '4B5563',
      align: 'center',
    });
  });
}

// ==========================================
// SLIDE 2: 학원 입시 컨설팅 현주소 & 당면 과제
// ==========================================
{
  const s2 = pres.addSlide();
  s2.background = { color: COLORS.bgLight };
  addSlideHeader(s2, '01. MARKET BACKGROUND', '학원이 마주한 입시 지도 현실과 3대 난제', '2028 대입 개편과 학생부 평가 방식의 격변 속에서 학원의 전통적 관리 방식은 한계에 부딪혔습니다.');

  const challenges = [
    {
      num: '01',
      title: '2028 대입 개편 혼란',
      sub: '5등급제 전환 & 정량평가 변별력 약화',
      desc: '• 내신 9등급제에서 5등급제로 개편되며 1등급 비율이 4% ➔ 10%로 대폭 확대\n• 교과 성적만으로는 상위권 변별이 불가능해져 세특 및 탐구활동이 합불의 절대적 기준 부상\n• 학부모들의 생기부 관리 요구는 폭증했으나 원내 전문 가이드라인 부재',
      color: COLORS.burgundy,
    },
    {
      num: '02',
      title: '일반 생성형 AI 세특의 한계',
      sub: '환각(Hallucination) & 입결 미반영',
      desc: '• ChatGPT 등 일반 챗봇은 존재하지 않는 도서명을 지어내거나 교육부 NEIS 기재 금지어 양산\n• 전국 164개 대학 실제 수시 컷오프 데이터가 없어 현실적인 지원선 제시 불가\n• 학생 맞춤형 동기-과정-성장이 결여된 천편일률적 문장으로 학종 감점 초래',
      color: COLORS.blueNavy,
    },
    {
      num: '03',
      title: '원장·강사진의 과도한 업무 피로',
      sub: '시간 부족 & 학생부 관리 역량 한계',
      desc: '• 정규 교과 수업, 내신 대비, 시험 출제만으로도 강사진 업무 과부하 상태\n• 학생마다 다른 전공·희망학과 도서를 직접 찾고 수행평가를 첨삭해 주는 데 수 시간 소요\n• 체계화된 시스템 없이 강사 개인 역량에 의존하여 학생별 관리 편차 심화',
      color: COLORS.teal,
    },
  ];

  challenges.forEach((ch, idx) => {
    const x = 0.8 + idx * 4.0;
    s2.addShape(pres.ShapeType.roundRect, {
      x: x,
      y: 2.1,
      w: 3.733,
      h: 4.5,
      rectRadius: 0.15,
      fill: { color: COLORS.white },
      line: { color: COLORS.borderBeige, width: 1 },
    });

    // Num Icon
    s2.addShape(pres.ShapeType.roundRect, {
      x: x + 0.3,
      y: 2.35,
      w: 0.8,
      h: 0.35,
      rectRadius: 0.08,
      fill: { color: ch.color },
    });
    s2.addText(ch.num, {
      x: x + 0.3,
      y: 2.35,
      w: 0.8,
      h: 0.35,
      fontSize: 11,
      fontFace: FONT_BODY,
      color: COLORS.white,
      bold: true,
      align: 'center',
      valign: 'middle',
    });

    s2.addText(ch.title, {
      x: x + 0.3,
      y: 2.85,
      w: 3.133,
      h: 0.45,
      fontSize: 15,
      fontFace: FONT_TITLE,
      color: COLORS.darkText,
      bold: true,
    });

    s2.addText(ch.sub, {
      x: x + 0.3,
      y: 3.3,
      w: 3.133,
      h: 0.35,
      fontSize: 10.5,
      fontFace: FONT_BODY,
      color: ch.color,
      bold: true,
    });

    s2.addText(ch.desc, {
      x: x + 0.3,
      y: 3.8,
      w: 3.133,
      h: 2.5,
      fontSize: 10,
      fontFace: FONT_BODY,
      color: COLORS.slateText,
      lineSpacingMultiple: 1.3,
    });
  });
}

// ==========================================
// SLIDE 3: 통합 솔루션 개요 (대한민국 유일 완벽 시스템)
// ==========================================
{
  const s3 = pres.addSlide();
  s3.background = { color: COLORS.bgLight };
  addSlideHeader(s3, '02. INTEGRATED PLATFORM', '대한민국 유일의 완벽한 학생-학원 듀얼 올인원 시스템', '학생용 「나의 입시멘토」 웹과 학원용 「컨설턴트 앱」이 1초 코드로 완벽 동기화되는 입시 솔루션');

  // Left Column: 학생용 나의 입시멘토
  s3.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 2.1,
    w: 5.65,
    h: 4.5,
    rectRadius: 0.15,
    fill: { color: COLORS.white },
    line: { color: 'E2E8F0', width: 1.5 },
  });
  s3.addShape(pres.ShapeType.roundRect, {
    x: 1.1,
    y: 2.35,
    w: 5.05,
    h: 0.6,
    rectRadius: 0.1,
    fill: { color: COLORS.burgundy },
  });
  s3.addText('학생용 솔루션: 나의 입시멘토 (Web)', {
    x: 1.1,
    y: 2.35,
    w: 5.05,
    h: 0.6,
    fontSize: 13,
    fontFace: FONT_TITLE,
    color: COLORS.white,
    bold: true,
    align: 'center',
    valign: 'middle',
  });

  const studentFeatures = [
    '• 나이스 10초 간편인증 연동 및 정부24 PDF 원클릭 분석',
    '• 2028 개편 5등급제 ⟷ 9등급제 실시간 양방향 자동 변환',
    '• 학생 주도 월간 퀘스트 등록 (수행평가 일정, 시험범위, 자기평가서)',
    '• 카카오 도서 DB 공식 연계 도서명·핵심이론 탑재 독서 탐구',
    '• 나이스 기재용 3단계(동기➔과정➔성장) 완성형 세특 문장 자동 생성',
    '• 164개 대학 26,295개 전형 상향·적정·안정 실시간 모의 컷오프',
  ];
  s3.addText(studentFeatures.join('\n\n'), {
    x: 1.1,
    y: 3.15,
    w: 5.05,
    h: 3.2,
    fontSize: 11,
    fontFace: FONT_BODY,
    color: '334155',
    lineSpacingMultiple: 1.15,
  });

  // Right Column: 학원용 컨설턴트 앱
  s3.addShape(pres.ShapeType.roundRect, {
    x: 6.883,
    y: 2.1,
    w: 5.65,
    h: 4.5,
    rectRadius: 0.15,
    fill: { color: COLORS.white },
    line: { color: 'E2E8F0', width: 1.5 },
  });
  s3.addShape(pres.ShapeType.roundRect, {
    x: 7.183,
    y: 2.35,
    w: 5.05,
    h: 0.6,
    rectRadius: 0.1,
    fill: { color: COLORS.blueNavy },
  });
  s3.addText('학원 관리자 솔루션: 컨설턴트 앱 (Pro)', {
    x: 7.183,
    y: 2.35,
    w: 5.05,
    h: 0.6,
    fontSize: 13,
    fontFace: FONT_TITLE,
    color: COLORS.white,
    bold: true,
    align: 'center',
    valign: 'middle',
  });

  const academyFeatures = [
    '• 암호화된 고유 코드로 재원생 데이터 1-Click 안전 동기화',
    '• [퀘스트 & 자동 넛지]: 실시간 D-Day 감지 및 미완료 학생 자동 알림',
    '• [⚡ 탐구·도서 매칭 1초 브릿지]: 퀘스트 클릭 즉시 3탭 전환 및 AI 자동 주입',
    '• 시기별 시험기간(중간/기말/모평/수능) D-Day 실시간 카운트다운',
    '• 월간 활동 보고서 ⚡[Auto-Fill] 자동 집계 ➔ 🖨️ A4 인쇄 & ✉️ 메일링',
    '• 컨설턴트 개입 최소화: 단순 일정 체크 대신 오직 전문 첨삭에만 100% 몰입',
  ];
  s3.addText(academyFeatures.join('\n\n'), {
    x: 7.183,
    y: 3.15,
    w: 5.05,
    h: 3.2,
    fontSize: 11,
    fontFace: FONT_BODY,
    color: '334155',
    lineSpacingMultiple: 1.15,
  });
}

// ==========================================
// SLIDE 4: [핵심 엔진] 단계별 세부 매칭 방식 4단계 아키텍처
// ==========================================
{
  const s4 = pres.addSlide();
  s4.background = { color: COLORS.bgLight };
  addSlideHeader(s4, '03. CORE MATCHING ENGINE', '대한민국 유일 핵심 엔진: 단계별 세부 매칭 4단계 아키텍처', '단순 검색 탈피! 키워드 추출 ➔ 과목 6단계 심화 ➔ 연구 가설 ➔ 카카오 도서 DB & 나이스 3단계 세특 완결');

  // 4 Horizontal Process Steps
  const matchingSteps = [
    {
      step: 'STEP 01',
      title: '키워드 정밀 추출',
      sub: '진로·교과 핵심 개념 도출',
      desc: '• 생활기록부, 창체활동, 희망 진로 정밀 분석\n• 단순 흥미를 넘어 학문적 가치가 있는 핵심 키워드 군집 추출',
      accent: COLORS.burgundy,
    },
    {
      step: 'STEP 02',
      title: '과목 & 6단계 심화',
      sub: '기초·개념·심화·융합·연구·도구',
      desc: '• 고교 교과목과 1:1 매핑\n• 6단계 학문 심화 사다리 적용\n• 타 교과 융합 및 최신 연구 트렌드 확장',
      accent: COLORS.blueNavy,
    },
    {
      step: 'STEP 03',
      title: '연구 가설 수립',
      sub: '반증 가능한 구체적 가설',
      desc: '• 단순 사실 조사를 완전히 탈피\n• ‘A 변인이 B에 미치는 영향’ 등 학종 평가관이 선호하는 학문적 질문 구성',
      accent: COLORS.teal,
    },
    {
      step: 'STEP 04',
      title: '카카오 도서 & 세특',
      sub: '카카오 API + 3단계 완결',
      desc: '• 카카오 도서 DB 기반 실시간 단행본 매칭\n• 나이스 3단계(동기➔탐구과정➔변화성장) 공식 기재 규격 문장 완성',
      accent: COLORS.darkBurgundy,
    },
  ];

  const stepW = 2.75;
  matchingSteps.forEach((st, idx) => {
    const x = 0.8 + idx * 3.0;
    s4.addShape(pres.ShapeType.roundRect, {
      x: x,
      y: 2.05,
      w: stepW,
      h: 2.45,
      rectRadius: 0.12,
      fill: { color: COLORS.white },
      line: { color: COLORS.borderBeige, width: 1 },
    });

    // Step Badge
    s4.addShape(pres.ShapeType.roundRect, {
      x: x + 0.25,
      y: 2.25,
      w: 1.0,
      h: 0.32,
      rectRadius: 0.08,
      fill: { color: st.accent },
    });
    s4.addText(st.step, {
      x: x + 0.25,
      y: 2.25,
      w: 1.0,
      h: 0.32,
      fontSize: 10,
      fontFace: FONT_BODY,
      color: COLORS.white,
      bold: true,
      align: 'center',
      valign: 'middle',
    });

    s4.addText(st.title, {
      x: x + 0.25,
      y: 2.68,
      w: 2.25,
      h: 0.38,
      fontSize: 13.5,
      fontFace: FONT_TITLE,
      color: COLORS.darkText,
      bold: true,
    });

    s4.addText(st.sub, {
      x: x + 0.25,
      y: 3.05,
      w: 2.25,
      h: 0.25,
      fontSize: 9.5,
      fontFace: FONT_BODY,
      color: st.accent,
      bold: true,
    });

    s4.addText(st.desc, {
      x: x + 0.25,
      y: 3.35,
      w: 2.25,
      h: 1.05,
      fontSize: 9.2,
      fontFace: FONT_BODY,
      color: COLORS.slateText,
      lineSpacingMultiple: 1.2,
    });
  });

  // Bottom Box: 3대 교과 실증 사례 표
  s4.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 4.65,
    w: 11.733,
    h: 2.05,
    rectRadius: 0.12,
    fill: { color: COLORS.white },
    line: { color: COLORS.borderBeige, width: 1 },
  });

  s4.addText('✦ 3대 핵심 교과 실증 매칭 데이터 (화법과 작문 · 확률과 통계 · 생명과학Ⅱ)', {
    x: 1.1,
    y: 4.8,
    w: 11.0,
    h: 0.3,
    fontSize: 11,
    fontFace: FONT_TITLE,
    color: COLORS.burgundy,
    bold: true,
  });

  const examples = [
    {
      subject: '국어과 (화작 / 4단계 융합)',
      kw: '키워드: 알고리즘 편향성',
      hypo: '가설: 생성형 AI 요약 모델의 편향이 저널리즘 객관성 서술에 미치는 영향 분석',
      book: '도서: 『알고리즘의 편향성』 ➔ 나이스 3단계 세특: 미디어 신뢰도 지표 제안',
    },
    {
      subject: '수학과 (확통 / 5단계 연구)',
      kw: '키워드: 베이즈 정리·조건부 확률',
      hypo: '가설: 희귀 질환 유병률 변화 시 신속 진단 키트의 양성 예측도(PPV) 변동성 모델링',
      book: '도서: 『신은 주사위 놀이를 하지 않는다』 ➔ 나이스 3단계 세특: 질병 통계 모델 완성',
    },
    {
      subject: '과학과 (생명Ⅱ / 6단계 도구)',
      kw: '키워드: CRISPR-Cas9 가위',
      hypo: '가설: gRNA 길이 조절이 비표적 절단(Off-target effect) 빈도 감소에 미치는 상관관계 규명',
      book: '도서: 『크리스퍼가 온다』 ➔ 나이스 3단계 세특: 분자의학 최신 논문 검증 완결',
    },
  ];

  examples.forEach((ex, idx) => {
    const ey = 5.2 + idx * 0.46;
    s4.addText([
      { text: `[${ex.subject}] `, options: { bold: true, color: COLORS.darkBurgundy, fontSize: 10 } },
      { text: `${ex.kw}  |  `, options: { bold: false, color: COLORS.darkText, fontSize: 9.5 } },
      { text: `${ex.hypo}  |  `, options: { bold: false, color: COLORS.slateText, fontSize: 9.5 } },
      { text: ex.book, options: { bold: true, color: COLORS.teal, fontSize: 9.5 } },
    ], {
      x: 1.1,
      y: ey,
      w: 11.2,
      h: 0.38,
      fontFace: FONT_BODY,
      margin: 0,
    });
  });
}

// ==========================================
// SLIDE 5: [혁신 워크플로우] 학생 주도 퀘스트 & 자동 넛지 라이프사이클
// ==========================================
{
  const s5 = pres.addSlide();
  s5.background = { color: COLORS.bgLight };
  addSlideHeader(s5, '04. QUEST & AUTO-NUDGE', '학생 주도 퀘스트 & 자동 넛지(Nudge): 개입 최소화, 피드백 극대화', '1순위 학생 주도 등록과 시스템 자동 넛지로 단순 일정 잔무를 없애고, 컨설턴트는 전문 피드백에만 몰입');

  const questFlow = [
    {
      badge: '1순위 주도권',
      title: '01. 학생 주도 퀘스트 등록',
      desc: '• 학생이 본인의 시험범위, 자기평가서 제출 기한, 학교 수행평가 과제를 직접 등록\n• 학생 스스로 학사 일정을 관리하는 능동적 자기주도 탐구 습관 완성\n• 컨설턴트의 불필요한 개입을 최소화하여 독립성 부여',
      accent: COLORS.burgundy,
    },
    {
      badge: '2순위 백업',
      title: '02. 컨설턴트 보완 등록',
      desc: '• 학생이 미등록하거나 입력이 지연될 경우 컨설턴트가 확인 후 [+ 보완 등록]\n• 1순위 학생 ➔ 2순위 컨설턴트 보완 2단계 안전망 구축\n• 학생이 놓칠 수 있는 핵심 마감일을 누락 없이 안전하게 방어',
      accent: COLORS.blueNavy,
    },
    {
      badge: '자동화 엔진',
      title: '03. 실시간 D-Day & 자동 넛지',
      desc: '• 마감일 실시간 D-Day 계산 (D-5, D-Day 오늘, 지연 경고 배지)\n• [🔔 미완료 넛지 전송] 1클릭으로 마감 임박 학생에게 정중하고 강력한 리마인더 발송\n• 강사·컨설턴트가 전화·문자로 일일이 재촉하던 피로 완벽 해소',
      accent: COLORS.amber,
    },
    {
      badge: '원클릭 연계',
      title: '04. [⚡ 탐구·도서 매칭] 1초 전환',
      desc: '• 퀘스트 카드 클릭 시 즉시 [3. 탐구·세특 추천] 탭으로 자동 이동\n• 해당 과목명 및 과제명이 AI 프롬프트에 자동 주입되어 10초 만에 카카오 도서 세특 도출\n• 컨설턴트는 오직 완성도 높은 탐구 피드백에만 100% 집중',
      accent: COLORS.teal,
    },
  ];

  questFlow.forEach((q, idx) => {
    const x = 0.8 + idx * 3.0;
    s5.addShape(pres.ShapeType.roundRect, {
      x: x,
      y: 2.1,
      w: 2.75,
      h: 4.4,
      rectRadius: 0.15,
      fill: { color: COLORS.white },
      line: { color: COLORS.borderBeige, width: 1 },
    });

    // Badge
    s5.addShape(pres.ShapeType.roundRect, {
      x: x + 0.25,
      y: 2.35,
      w: 1.3,
      h: 0.32,
      rectRadius: 0.08,
      fill: { color: q.accent },
    });
    s5.addText(q.badge, {
      x: x + 0.25,
      y: 2.35,
      w: 1.3,
      h: 0.32,
      fontSize: 10,
      fontFace: FONT_BODY,
      color: COLORS.white,
      bold: true,
      align: 'center',
      valign: 'middle',
    });

    s5.addText(q.title, {
      x: x + 0.25,
      y: 2.8,
      w: 2.25,
      h: 0.55,
      fontSize: 13.5,
      fontFace: FONT_TITLE,
      color: COLORS.darkText,
      bold: true,
    });

    s5.addText(q.desc, {
      x: x + 0.25,
      y: 3.5,
      w: 2.25,
      h: 2.8,
      fontSize: 9.8,
      fontFace: FONT_BODY,
      color: COLORS.slateText,
      lineSpacingMultiple: 1.3,
    });
  });
}

// ==========================================
// SLIDE 6: [그레이트 베네핏 ①] 학생이 누리는 4대 혁신 가치
// ==========================================
{
  const s6 = pres.addSlide();
  s6.background = { color: COLORS.bgLight };
  addSlideHeader(s6, '05. GREAT BENEFIT: STUDENT', '학생을 위한 그레이트 베네핏: 수행평가 막막함 Zero & 학종 합격선 확보', '생각이 있으면 방법은 따라옵니다: 정교한 시스템으로 따라만 해도 완성되는 프리미엄 학생부');

  const studentBenefits = [
    {
      num: '01',
      title: '수행평가 막막함 Zero & 즉각 아이디어',
      sub: '과제 입력 즉시 도서 및 탐구 방향 도출',
      desc: '• 학기 중 쏟아지는 학교 수행평가 주제를 기입하는 즉시 전공 맞춤 카카오 도서와 탐구 주제가 도출\n• 막막한 백지 상태에서 고민하는 시간을 없애고 수행평가 준비 소요 시간 70% 단축\n• 내신 기간 중 수행평가 스트레스 없이 지필고사 공부 시간 확보',
      accent: COLORS.burgundy,
    },
    {
      num: '02',
      title: '자기주도형 탐구·학습 습관 완성',
      sub: '월간 퀘스트 라이프사이클로 자생력 체득',
      desc: '• 시험범위, 자기평가서 제출, 독후감 일정을 스스로 등록하고 실천하는 자기주도 학습관 형성\n• 학생부종합전형에서 가장 높게 평가하는 ‘자기주도적 학업역량 및 진로 탐색 의지’ 완벽 체득\n• 고교 3개년 동안 흔들리지 않는 학습 로드맵 구축',
      accent: COLORS.blueNavy,
    },
    {
      num: '03',
      title: '나이스 3단계 완성형 세특 소장',
      sub: '동기 ➔ 탐구과정 ➔ 변화성장의 완결형 문장',
      desc: '• 교육부 NEIS 기재 규정을 100% 준수한 3단계 구조의 고품격 세특 문장 확보\n• 학기말 학교 선생님께 제출할 자기평가서 및 탐구 보고서를 빈틈없이 소장\n• 입학사정관의 눈을 사로잡는 차별화된 스토리라인 구축',
      accent: COLORS.teal,
    },
    {
      num: '04',
      title: '전국 164개 대학 실시간 합격선 확인',
      sub: '26,295개 수시 전형 컷오프 기반 실시간 판정',
      desc: '• 내신 5등급제 ⟷ 9등급제 자동 환산으로 내 성적의 진짜 전국 위치 파악\n• 서울대부터 주요 164개 대학 수시 컷오프 기반 실시간 모의 6개 수시 라인업 산출\n• 막연한 입시 불안감을 종식하고 명확한 목표 대학 동기부여 제공',
      accent: COLORS.darkBurgundy,
    },
  ];

  studentBenefits.forEach((b, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 0.8 + col * 6.0;
    const y = 2.1 + row * 2.35;

    s6.addShape(pres.ShapeType.roundRect, {
      x: x,
      y: y,
      w: 5.733,
      h: 2.15,
      rectRadius: 0.15,
      fill: { color: COLORS.white },
      line: { color: COLORS.borderBeige, width: 1 },
    });

    // Num Box
    s6.addShape(pres.ShapeType.roundRect, {
      x: x + 0.3,
      y: y + 0.25,
      w: 0.7,
      h: 0.45,
      rectRadius: 0.08,
      fill: { color: b.accent },
    });
    s6.addText(b.num, {
      x: x + 0.3,
      y: y + 0.25,
      w: 0.7,
      h: 0.45,
      fontSize: 12,
      fontFace: FONT_BODY,
      color: COLORS.white,
      bold: true,
      align: 'center',
      valign: 'middle',
    });

    s6.addText(b.title, {
      x: x + 1.15,
      y: y + 0.22,
      w: 4.25,
      h: 0.45,
      fontSize: 14.5,
      fontFace: FONT_TITLE,
      color: COLORS.darkText,
      bold: true,
      valign: 'middle',
    });

    s6.addText(b.desc, {
      x: x + 0.3,
      y: y + 0.82,
      w: 5.133,
      h: 1.15,
      fontSize: 10,
      fontFace: FONT_BODY,
      color: COLORS.slateText,
      lineSpacingMultiple: 1.25,
    });
  });
}

// ==========================================
// SLIDE 7: [그레이트 베네핏 ②] 학원과 학부모가 받는 동반 성장 베네핏
// ==========================================
{
  const s7 = pres.addSlide();
  s7.background = { color: COLORS.bgLight };
  addSlideHeader(s7, '06. GREAT BENEFIT: ACADEMY & PARENTS', '학원과 학부모를 위한 그레이트 베네핏: 원생 락인과 학부모 완벽 안심', '학원은 이탈률 0%와 강사 업무 90% 절감, 학부모는 투명한 월간 리포트와 수백만 원 사교육비 절감');

  // Left Column: 학원 원장님 & 강사진 4대 베네핏
  s7.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 2.1,
    w: 5.65,
    h: 4.5,
    rectRadius: 0.15,
    fill: { color: COLORS.white },
    line: { color: COLORS.burgundy, width: 1.5 },
  });
  s7.addShape(pres.ShapeType.roundRect, {
    x: 1.1,
    y: 2.3,
    w: 5.05,
    h: 0.55,
    rectRadius: 0.1,
    fill: { color: COLORS.burgundy },
  });
  s7.addText('학원(원장님·강사진)을 위한 4대 비즈니스 가치', {
    x: 1.1,
    y: 2.3,
    w: 5.05,
    h: 0.55,
    fontSize: 12.5,
    fontFace: FONT_TITLE,
    color: COLORS.white,
    bold: true,
    align: 'center',
    valign: 'middle',
  });

  const academyBenefits = [
    '01. 재원생 이탈 0% 락인 (Retention)\n매월 정기 발송되는 월간 활동 보고서로 신뢰도를 극대화하여 시험 직후 수강생 이탈 완벽 차단',
    '02. 신규 원생 설명회 킬러 무기 (300% 급증)\n164개 대학 정밀 진단과 2028 개편 분석을 간판 무기로 학부모 설명회 신규 상담 등록률 폭발적 상승',
    '03. 강사진 피로도 90% 이상 절감\n도서 탐색, 세특 작성, 월간 보고서 집계를 [Auto-Fill]이 10초 만에 해결하여 본 수업에만 몰입',
    '04. 학원 브랜드 가치 프리미엄 격상\n단순 보습학원에서 ‘학생부종합전형까지 케어하는 대치동 직영급 명문 입시 코칭 센터’로 위상 도약',
  ];
  s7.addText(academyBenefits.join('\n\n'), {
    x: 1.1,
    y: 3.05,
    w: 5.05,
    h: 3.3,
    fontSize: 10,
    fontFace: FONT_BODY,
    color: '334155',
    lineSpacingMultiple: 1.15,
  });

  // Right Column: 학부모님 4대 안심 베네핏
  s7.addShape(pres.ShapeType.roundRect, {
    x: 6.883,
    y: 2.1,
    w: 5.65,
    h: 4.5,
    rectRadius: 0.15,
    fill: { color: COLORS.white },
    line: { color: COLORS.blueNavy, width: 1.5 },
  });
  s7.addShape(pres.ShapeType.roundRect, {
    x: 7.183,
    y: 2.3,
    w: 5.05,
    h: 0.55,
    rectRadius: 0.1,
    fill: { color: COLORS.blueNavy },
  });
  s7.addText('학부모님을 위한 4대 절대 안심 가치', {
    x: 7.183,
    y: 2.3,
    w: 5.05,
    h: 0.55,
    fontSize: 12.5,
    fontFace: FONT_TITLE,
    color: COLORS.white,
    bold: true,
    align: 'center',
    valign: 'middle',
  });

  const parentsBenefits = [
    '01. 월간 활동 보고서로 완벽한 안심\n학원에서 자녀가 어떤 퀘스트를 수행하고 어떤 책을 읽었는지 A4 리포트와 이메일로 매월 투명 확인',
    '02. 가정 내 감정 소모·잔소리 종식\n“수행평가 언제 하니?” 부모-자녀 간 갈등을 시스템의 스마트 자동 넛지와 학원 컨설턴트가 전담 해결',
    '03. 수백만 원대 고액 컨설팅 사교육비 절감\n대치동 1회 수십~수백만 원을 호가하는 1:1 학생부 컨설팅을 학원 정규 프로그램 안에서 상시 제공',
    '04. 2028 개편 대입 불안감 완전 해소\n내신 5등급제 개편과 고교학점제 혼란 속에서 164개 대학 입결 데이터 기반의 정확한 나침반 확보',
  ];
  s7.addText(parentsBenefits.join('\n\n'), {
    x: 7.183,
    y: 3.05,
    w: 5.05,
    h: 3.3,
    fontSize: 10,
    fontFace: FONT_BODY,
    color: '334155',
    lineSpacingMultiple: 1.15,
  });
}

// ==========================================
// SLIDE 8: 학원 맞춤형 2-Track 운영 모델
// ==========================================
{
  const s8 = pres.addSlide();
  s8.background = { color: COLORS.bgLight };
  addSlideHeader(s8, '07. OPERATIONAL MODEL', '학원 내부 인력 현황에 따른 맞춤형 2-Track 지원', '학원 내 전담 인력 유무에 맞추어 ‘정기 교육 지원’ 또는 ‘전문 업무 대행’을 완벽하게 맞춤 제공합니다.');

  // Track A
  s8.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 2.1,
    w: 5.65,
    h: 4.5,
    rectRadius: 0.15,
    fill: { color: COLORS.white },
    line: { color: COLORS.burgundy, width: 1.5 },
  });
  s8.addShape(pres.ShapeType.roundRect, {
    x: 1.1,
    y: 2.3,
    w: 5.05,
    h: 0.55,
    rectRadius: 0.1,
    fill: { color: COLORS.burgundy },
  });
  s8.addText('Track A : 원내 담당자 배정형 (교육 지원)', {
    x: 1.1,
    y: 2.3,
    w: 5.05,
    h: 0.55,
    fontSize: 13,
    fontFace: FONT_TITLE,
    color: COLORS.white,
    bold: true,
    align: 'center',
    valign: 'middle',
  });

  const trackA = [
    '• 권장 대상: 원장, 상담실장, 전담 강사가 직접 입시 상담을 주도하는 학원',
    '• 시스템 제공: 학원 전용 컨설턴트 앱 관리자 마스터 계정 발급',
    '• 퀘스트 & 넛지: 주차별 플래너, 시험 D-Day, 수행평가 퀘스트 전면 개방',
    '• 정기 입시 교육: 대치 수프리마 대입전략연구소의 월간 수시 트렌드 브리핑',
    '• 세특 지도법 전수: 2028 개편 나이스 기재용 3단계 문장 코칭 실전 가이드',
    '• 리포트 발급: 학원 로고가 들어간 맞춤형 추천서 및 진단서 1-Click 인쇄',
    '• 원내 자체 입시 역량을 내재화하여 장기적인 학원 자산으로 구축',
  ];
  s8.addText(trackA.join('\n\n'), {
    x: 1.1,
    y: 3.05,
    w: 5.05,
    h: 3.3,
    fontSize: 10,
    fontFace: FONT_BODY,
    color: '334155',
    lineSpacingMultiple: 1.15,
  });

  // Track B
  s8.addShape(pres.ShapeType.roundRect, {
    x: 6.883,
    y: 2.1,
    w: 5.65,
    h: 4.5,
    rectRadius: 0.15,
    fill: { color: COLORS.blueNavy },
  });
  s8.addShape(pres.ShapeType.roundRect, {
    x: 6.883,
    y: 2.1,
    w: 5.65,
    h: 4.5,
    rectRadius: 0.15,
    fill: { color: COLORS.white },
    line: { color: COLORS.blueNavy, width: 1.5 },
  });
  s8.addShape(pres.ShapeType.roundRect, {
    x: 7.183,
    y: 2.3,
    w: 5.05,
    h: 0.55,
    rectRadius: 0.1,
    fill: { color: COLORS.blueNavy },
  });
  s8.addText('Track B : 전담 인력 부재형 (업무 대행 위탁)', {
    x: 7.183,
    y: 2.3,
    w: 5.05,
    h: 0.55,
    fontSize: 13,
    fontFace: FONT_TITLE,
    color: COLORS.white,
    bold: true,
    align: 'center',
    valign: 'middle',
  });

  const trackB = [
    '• 권장 대상: 1인 원장 체제, 단과 강사 중심, 입시 전담 인력이 부족한 학원',
    '• 100% 실전 대행: 대치 수프리마 대입전략연구소 전문 연구원이 원내 입시연구소로 업무 전담',
    '• 생기부·성적 분석 대행: 학생 데이터 등록 및 수시 6개 대학 분석 리포트 발행',
    '• 수행평가 & 도서 배정: 학교별 수행평가 분석 및 카카오 도서 세특 1-Click 배정 대행',
    '• 월간 활동 보고서 발행: 매월 말 학부모 발송용 보고서 작성, 출력본 및 이메일 직발송 대행',
    '• 학부모 상담 스크립트: 입시 문의 시 학부모 응대용 전문 브리핑 스크립트 서면 지원',
    '• 추가 인건비 부담 없이 원내 대치동 입시 연구소를 즉시 보유하는 효과 달성',
  ];
  s8.addText(trackB.join('\n\n'), {
    x: 7.183,
    y: 3.05,
    w: 5.05,
    h: 3.3,
    fontSize: 10,
    fontFace: FONT_BODY,
    color: '334155',
    lineSpacingMultiple: 1.15,
  });
}

// ==========================================
// SLIDE 9: 1개 학기 단위 관리 기간 및 산정 공식
// ==========================================
{
  const s9 = pres.addSlide();
  s9.background = { color: COLORS.bgLight };
  addSlideHeader(s9, '08. SEMESTER MODEL & FORMULA', '학기제 기반 맞춤 관리 기간 및 기간 산정 공식', '수시 학생부종합전형의 학기 단위 마감 사이클에 최적화된 3가지 관리 코스를 제공합니다.');

  // Formula Banner
  s9.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 2.05,
    w: 11.733,
    h: 0.85,
    rectRadius: 0.1,
    fill: { color: COLORS.white },
    line: { color: COLORS.burgundy, width: 1.5 },
  });
  s9.addText([
    { text: '✦ 잔여 관리 개월 수 산정 공식: ', options: { bold: true, color: COLORS.burgundy, fontSize: 13 } },
    { text: '「해당 학기 종료 시점(1학기 8월 말 / 2학기 2월 말) － 학생 가입 시점」\n', options: { bold: true, color: COLORS.darkText, fontSize: 13 } },
    { text: '※ 학종 생기부 기재는 1학기(~8월)와 2학기(~2월) 단위로 완결되므로, 가입 시점부터 학기 종료일까지 밀착 코칭합니다.', options: { bold: false, color: COLORS.slateText, fontSize: 9.5 } },
  ], {
    x: 1.1,
    y: 2.12,
    w: 11.133,
    h: 0.7,
    fontFace: FONT_BODY,
    margin: 0,
    lineSpacingMultiple: 1.15,
  });

  const courses = [
    {
      title: '학기 정규 풀케어 (6개월)',
      target: '3월(1학기) 또는 9월(2학기) 시작',
      points: [
        '• 학기 전 과정 교과 성적 및 비교과 완벽 케어',
        '• 주차별 플래너 & 시험기간 D-Day 실시간 코칭',
        '• 수행평가 퀘스트 전 과목 첨삭 & 카카오 도서 매칭',
        '• 매월 대치수프리마 월간 활동 보고서 발송',
        '• 학기말 완성형 세특 포트폴리오(A4) 최종 완성',
      ],
      color: COLORS.burgundy,
      tag: '기본 정규 과정',
    },
    {
      title: '학기 집중 케어 (3~4개월)',
      target: '중간고사 직후(5월) or 기말 직후(12월)',
      points: [
        '• 중간/기말 지필고사 직후 집중 탐구활동 설계',
        '• 남은 학기 수행평가 과제 및 세특 집중 완성',
        '• 나이스 마감 대비 3단계 세특 문장 집중 감수',
        '• 매월 대치수프리마 월간 활동 보고서 발송',
        '• 방학 과제 연계 심화 탐구 보고서 도출',
      ],
      color: COLORS.blueNavy,
      tag: '★ 원장님 최다 추천',
    },
    {
      title: '단기 속성 진단 (1개월)',
      target: '수시 원서 접수 직전 (8~9월 파이널)',
      points: [
        '• 2028 개편 5등급 ↔ 9등급 정밀 자동 환산',
        '• 164개 대학 26,295개 전형 실시간 컷오프 분석',
        '• 수시 6개 대학 최적 지원 라인업 확정',
        '• 수시 6개 대학 파이널 지원 전략서 (A4) 발행',
        '• 신규 유입 원생 입학 진단용으로 활용 가능',
      ],
      color: COLORS.teal,
      tag: '파이널 전형 전략',
    },
  ];

  courses.forEach((c, idx) => {
    const x = 0.8 + idx * 4.0;
    s9.addShape(pres.ShapeType.roundRect, {
      x: x,
      y: 3.1,
      w: 3.733,
      h: 3.6,
      rectRadius: 0.15,
      fill: { color: COLORS.white },
      line: { color: COLORS.borderBeige, width: 1 },
    });

    s9.addShape(pres.ShapeType.roundRect, {
      x: x + 0.3,
      y: 3.3,
      w: 1.8,
      h: 0.3,
      rectRadius: 0.08,
      fill: { color: c.color },
    });
    s9.addText(c.tag, {
      x: x + 0.3,
      y: 3.3,
      w: 1.8,
      h: 0.3,
      fontSize: 9.5,
      fontFace: FONT_BODY,
      color: COLORS.white,
      bold: true,
      align: 'center',
      valign: 'middle',
    });

    s9.addText(c.title, {
      x: x + 0.3,
      y: 3.7,
      w: 3.133,
      h: 0.4,
      fontSize: 14,
      fontFace: FONT_TITLE,
      color: COLORS.darkText,
      bold: true,
    });

    s9.addText(c.target, {
      x: x + 0.3,
      y: 4.12,
      w: 3.133,
      h: 0.28,
      fontSize: 10,
      fontFace: FONT_BODY,
      color: c.color,
      bold: true,
    });

    s9.addText(c.points.join('\n\n'), {
      x: x + 0.3,
      y: 4.45,
      w: 3.133,
      h: 2.1,
      fontSize: 9.5,
      fontFace: FONT_BODY,
      color: COLORS.slateText,
      lineSpacingMultiple: 1.15,
    });
  });
}

// ==========================================
// SLIDE 10: 원스톱 4단계 진단 & 세특 완성 플로우
// ==========================================
{
  const s10 = pres.addSlide();
  s10.background = { color: COLORS.bgLight };
  addSlideHeader(s10, '09. 4-STEP PROCESS', '학원과 학생이 함께 완결하는 컨설턴트 4단계 실행 사이클', '진단에서 끝나지 않고, 퀘스트 실행과 수행평가, 월간 학부모 보고서까지 물 흐르듯 완성됩니다.');

  const steps = [
    {
      num: 'STEP 01',
      title: '학생부·성적 정밀 진단',
      desc: '• 나이스 간편인증 또는 정부24 PDF 원클릭 등록\n• 2028 개편 5등급제 ⟷ 9등급제 실시간 자동 변환\n• 164개 대학 26,295개 수시 전형 모의 합격선 산출',
      accent: COLORS.burgundy,
    },
    {
      num: 'STEP 02',
      title: '밀착 플래너 & 시험 D-Day',
      desc: '• 시기별 시험기간(중간/기말/모평/수능) D-Day 실시간 배너\n• 시험 21일 전(3주 이내) 집중 대비 모드 배지 가동\n• 주차별 학습 과제 부여 및 완료율(%) 실시간 추적',
      accent: COLORS.blueNavy,
    },
    {
      num: 'STEP 03',
      title: '도서 세특 & 수행평가 연계',
      desc: '• NEIS 핵심 근거가 되는 학교 수행평가 내용 다이렉트 기입\n• 희망 전공 맞춤 카카오 도서 DB 공식 연계 추천\n• 책의 핵심 이론이 자연스럽게 녹아든 3단계 세특 초안',
      accent: COLORS.teal,
    },
    {
      num: 'STEP 04',
      title: '월간 활동 보고서 & 메일링',
      desc: '• ⚡ [Auto-Fill] 버튼 1클릭으로 한 달간 실행 실적 즉시 취합\n• 대치수프리마 공식 버건디 품격의 🖨️ A4 프리미엄 인쇄\n• 공식 메일링 엔진을 통한 ✉️ 학부모 즉시 메일 직발송',
      accent: COLORS.darkBurgundy,
    },
  ];

  steps.forEach((st, idx) => {
    const x = 0.8 + idx * 3.0;
    s10.addShape(pres.ShapeType.roundRect, {
      x: x,
      y: 2.1,
      w: 2.75,
      h: 4.4,
      rectRadius: 0.15,
      fill: { color: COLORS.white },
      line: { color: COLORS.borderBeige, width: 1 },
    });

    s10.addShape(pres.ShapeType.roundRect, {
      x: x + 0.3,
      y: 2.4,
      w: 1.0,
      h: 0.35,
      rectRadius: 0.08,
      fill: { color: st.accent },
    });
    s10.addText(st.num, {
      x: x + 0.3,
      y: 2.4,
      w: 1.0,
      h: 0.35,
      fontSize: 10,
      fontFace: FONT_BODY,
      color: COLORS.white,
      bold: true,
      align: 'center',
      valign: 'middle',
    });

    s10.addText(st.title, {
      x: x + 0.3,
      y: 2.95,
      w: 2.15,
      h: 0.6,
      fontSize: 13,
      fontFace: FONT_TITLE,
      color: COLORS.darkText,
      bold: true,
    });

    s10.addText(st.desc, {
      x: x + 0.3,
      y: 3.7,
      w: 2.15,
      h: 2.6,
      fontSize: 9.8,
      fontFace: FONT_BODY,
      color: COLORS.slateText,
      lineSpacingMultiple: 1.3,
    });
  });
}

// ==========================================
// SLIDE 11: 도입 절차 및 문의 안내
// ==========================================
{
  const s11 = pres.addSlide();
  s11.background = { color: COLORS.bgLight };
  addSlideHeader(s11, '10. ONBOARDING & CONTACT', '학원 제휴 절차 및 대치 수프리마 공식 소통 채널', '간편한 4단계 도입 절차를 통해 학원의 입시 경쟁력을 즉시 업그레이드하세요.');

  // 4 Steps Horizontal Box
  const onboards = [
    { step: '1단계', title: '제휴 신청 & 상담', desc: '학원 규모 및 원내 입시 현황 진단' },
    { step: '2단계', title: 'Track 모델 확정', desc: 'Track A(직접 지도) or Track B(업무 대행)' },
    { step: '3단계', title: '원장·강사 교육', desc: '시스템 사용법 및 세특 코칭 가이드 전수' },
    { step: '4단계', title: '계정 발급 & 개시', desc: '학원 코드 발급 및 재원생 실시간 연동' },
  ];

  onboards.forEach((o, idx) => {
    const x = 0.8 + idx * 3.0;
    s11.addShape(pres.ShapeType.roundRect, {
      x: x,
      y: 2.1,
      w: 2.75,
      h: 1.6,
      rectRadius: 0.12,
      fill: { color: COLORS.white },
      line: { color: COLORS.borderBeige, width: 1 },
    });
    s11.addText(o.step, {
      x: x + 0.2,
      y: 2.3,
      w: 2.35,
      h: 0.3,
      fontSize: 11,
      fontFace: FONT_BODY,
      color: COLORS.burgundy,
      bold: true,
    });
    s11.addText(o.title, {
      x: x + 0.2,
      y: 2.65,
      w: 2.35,
      h: 0.35,
      fontSize: 13,
      fontFace: FONT_TITLE,
      color: COLORS.darkText,
      bold: true,
    });
    s11.addText(o.desc, {
      x: x + 0.2,
      y: 3.05,
      w: 2.35,
      h: 0.5,
      fontSize: 9.5,
      fontFace: FONT_BODY,
      color: COLORS.slateText,
    });
  });

  // Bottom Center: Company Info Card
  s11.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 3.95,
    w: 11.733,
    h: 2.75,
    rectRadius: 0.15,
    fill: { color: COLORS.white },
    line: { color: COLORS.borderBeige, width: 1 },
  });

  s11.addText('대치수프리마 대입전략연구소 공식 제휴 문의', {
    x: 1.2,
    y: 4.2,
    w: 10.933,
    h: 0.45,
    fontSize: 16,
    fontFace: FONT_TITLE,
    color: COLORS.darkBurgundy,
    bold: true,
  });

  const contactLeft = [
    '• 연구소 본원: 서울시 강남구 테헤란로 326 B1F (대치수프리마 입시&코칭센터)',
    '• 대표 컨설턴트: 이기욱 대표컨설턴트 / 대치수프리마 대입전략연구소',
    '• 핵심 인프라: 전국 164개 대학 입결 데이터베이스 & 카카오 도서 DB & AI 엔진 탑재',
  ];
  s11.addText(contactLeft.join('\n\n'), {
    x: 1.2,
    y: 4.8,
    w: 5.5,
    h: 1.6,
    fontSize: 11,
    fontFace: FONT_BODY,
    color: '334155',
    lineSpacingMultiple: 1.2,
  });

  const contactRight = [
    '• 네이버 밴드: band.us/@suprima (실시간 수시 분석 및 입시 브리핑)',
    '• 공식 블로그: blog.naver.com/gouniv_hifive (합격 사례 및 분석 칼럼)',
    '• 인스타그램: instagram.com/suprima_ipsicreator (최신 대입 뉴스)',
    '• 비용 협의: 재원생 규모 및 운영 Track에 따른 원장님 1:1 맞춤 상담 (유료 정규 서비스)',
  ];
  s11.addText(contactRight.join('\n\n'), {
    x: 7.0,
    y: 4.8,
    w: 5.2,
    h: 1.6,
    fontSize: 11,
    fontFace: FONT_BODY,
    color: '334155',
    lineSpacingMultiple: 1.2,
  });
}

// Write to files
async function run() {
  const outDir = path.resolve('docs');
  const pptxFile = path.join(outDir, '대치수프리마_나의입시멘토_컨설턴트앱_B2B_제안서.pptx');
  await pres.writeFile({ fileName: pptxFile });
  console.log(`Saved B2B proposal pptx: ${pptxFile}`);

  // Copy to consultant app public guides
  const guideDir = path.resolve('학원용앱/public/guides');
  if (fs.existsSync(guideDir)) {
    const copyTarget = path.join(guideDir, '대치수프리마_나의입시멘토_컨설턴트앱_B2B_제안서.pptx');
    fs.copyFileSync(pptxFile, copyTarget);
    console.log(`Copied proposal pptx to ${copyTarget}`);
  }

  // Copy to root public guides as well
  const rootGuideDir = path.resolve('public/guides');
  if (fs.existsSync(rootGuideDir)) {
    const rootCopyTarget = path.join(rootGuideDir, '대치수프리마_나의입시멘토_컨설턴트앱_B2B_제안서.pptx');
    fs.copyFileSync(pptxFile, rootCopyTarget);
    console.log(`Copied proposal pptx to root ${rootCopyTarget}`);
  }
}

run().catch(err => {
  console.error('Build PPTX failed:', err);
  process.exit(1);
});
