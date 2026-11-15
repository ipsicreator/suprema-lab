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
};

const FONT_TITLE = 'Malgun Gothic';
const FONT_BODY = 'Malgun Gothic';

// Helper: Add Standard Header on internal slides (Slide 2 ~ 8)
function addSlideHeader(slide, category, title, subtitle) {
  // Category Pill
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 0.5,
    w: 2.2,
    h: 0.35,
    rectRadius: 0.15,
    fill: { color: COLORS.badgeBg },
    line: { color: COLORS.burgundy, width: 1 },
  });
  slide.addText(category, {
    x: 0.8,
    y: 0.5,
    w: 2.2,
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
    y: 0.95,
    w: 11.7,
    h: 0.55,
    fontSize: 22,
    fontFace: FONT_TITLE,
    color: COLORS.darkText,
    bold: true,
  });

  // Subtitle
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.8,
      y: 1.5,
      w: 11.7,
      h: 0.35,
      fontSize: 12,
      fontFace: FONT_BODY,
      color: COLORS.slateText,
    });
  }

  // Top Right Brand Logo Text
  slide.addText('대치수프리마 대입전략연구소 | 나의 입시멘토', {
    x: 7.5,
    y: 0.5,
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
  slide.addText('대치수프리마 대입전략연구소 · 서울시 강남구 테헤란로 326 B1F · B2B 제안서', {
    x: 0.8,
    y: 6.95,
    w: 11.733,
    h: 0.35,
    fontSize: 9,
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
  // Logo image if exists
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
    x: 4.4,
    y: 1.45,
    w: 4.5,
    h: 0.38,
    rectRadius: 0.19,
    fill: { color: COLORS.white },
    line: { color: 'E4D4BF', width: 1 },
  });
  s1.addText('✦ 2026 · 2027 · 2028 수시 올인원 AI 진단 솔루션', {
    x: 4.4,
    y: 1.45,
    w: 4.5,
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
    y: 1.95,
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
    y: 2.45,
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
    y: 3.3,
    w: 11.333,
    h: 0.45,
    fontSize: 14,
    fontFace: FONT_BODY,
    color: '222222',
    bold: true,
    align: 'center',
  });

  // 5. Subtext (2 lines)
  s1.addText([
    { text: '2028 대입 개편 5등급제·9등급제 자동 환산과 전국 164개 대학 26,295개 전형 최신 컷오프를 탑재\n', options: { bold: true } },
    { text: '하여, 학생부 정밀 분석부터 나이스 기재용 세특 문장과 연계 추천 도서까지 한 번에 완성합니다.', options: { bold: false } },
  ], {
    x: 1.5,
    y: 3.8,
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
    y: 4.6,
    w: 6.333,
    h: 0.85,
    rectRadius: 0.15,
    fill: { color: COLORS.white },
    line: { color: 'E6DBC9', width: 1 },
  });
  s1.addShape(pres.ShapeType.roundRect, {
    x: 4.8,
    y: 4.75,
    w: 3.733,
    h: 0.55,
    rectRadius: 0.12,
    fill: { color: COLORS.greenBtn },
  });
  s1.addText('AI Mentor 시작하기', {
    x: 4.8,
    y: 4.75,
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
      y: 5.7,
      w: cardW,
      h: 1.25,
      rectRadius: 0.15,
      fill: { color: COLORS.white },
      line: { color: 'E8DECB', width: 1 },
    });
    s1.addText(c.num, {
      x: cx,
      y: 5.82,
      w: cardW,
      h: 0.55,
      fontSize: 20,
      fontFace: FONT_TITLE,
      color: c.color,
      bold: true,
      align: 'center',
      valign: 'middle',
    });
    s1.addText(c.label, {
      x: cx,
      y: 6.35,
      w: cardW,
      h: 0.45,
      fontSize: 11,
      fontFace: FONT_BODY,
      color: '334155',
      bold: true,
      align: 'center',
      valign: 'middle',
    });
  });
}

// ==========================================
// SLIDE 2: 학원 입시 컨설팅 현주소 & 당면 과제
// ==========================================
{
  const s2 = pres.addSlide();
  s2.background = { color: COLORS.bgLight };
  addSlideHeader(s2, '01. MARKET PAIN POINTS', '학원이 직면한 입시 관리의 한계와 새로운 기회', '2028 개편 5등급제 시행으로 학부모 불안 급증 — 단순 단과 강의만으로는 재원생 유치가 어렵습니다.');

  const pains = [
    {
      step: '01',
      title: '학부모의 극심한 입시 불안',
      subtitle: '2028 5등급제 개편',
      desc: '내신 1등급 비율이 4%에서 10%로 확대되며 교과 변별력 급감.\n"내신만 잘 따면 된다"는 과거 공식이 깨지며, 학부모들은 심화 탐구와 차별화된 세특 관리를 필수로 요구하고 있습니다.',
      accent: COLORS.burgundy,
    },
    {
      step: '02',
      title: '전문 컨설턴트 채용의 한계',
      subtitle: '고액 인건비 & 전문성 유지 난항',
      desc: '입시 전문 인력을 정규직으로 채용하기에는 고정비 부담이 과중하며,\n담당 강사들이 학생별 맞춤 세특과 방대한 대학별 입결 컷오프를 개별 조사하고 상담하기에는 물리적 한계가 존재합니다.',
      accent: COLORS.blueNavy,
    },
    {
      step: '03',
      title: '수강생 이탈 및 방학 누수',
      subtitle: '시험 직후 관리 공백',
      desc: '중간·기말고사 직후 생기부 활동을 즉각 이끌어주지 못하면,\n수강생들이 대치동 대형 컨설팅 학원이나 입시 센터로 대거 유출되어 장기 수강생 확보에 치명적인 타격을 입습니다.',
      accent: COLORS.amber,
    },
  ];

  pains.forEach((p, idx) => {
    const x = 0.8 + idx * 4.0;
    s2.addShape(pres.ShapeType.roundRect, {
      x: x,
      y: 2.1,
      w: 3.733,
      h: 3.7,
      rectRadius: 0.15,
      fill: { color: COLORS.white },
      line: { color: COLORS.borderBeige, width: 1 },
    });
    // Top tag
    s2.addShape(pres.ShapeType.roundRect, {
      x: x + 0.3,
      y: 2.35,
      w: 0.8,
      h: 0.35,
      rectRadius: 0.08,
      fill: { color: p.accent },
    });
    s2.addText(p.step, {
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

    s2.addText(p.title, {
      x: x + 0.3,
      y: 2.85,
      w: 3.133,
      h: 0.45,
      fontSize: 16,
      fontFace: FONT_TITLE,
      color: COLORS.darkText,
      bold: true,
    });
    s2.addText(p.subtitle, {
      x: x + 0.3,
      y: 3.3,
      w: 3.133,
      h: 0.35,
      fontSize: 11,
      fontFace: FONT_BODY,
      color: p.accent,
      bold: true,
    });
    s2.addText(p.desc, {
      x: x + 0.3,
      y: 3.7,
      w: 3.133,
      h: 1.8,
      fontSize: 10.5,
      fontFace: FONT_BODY,
      color: COLORS.slateText,
      lineSpacingMultiple: 1.25,
    });
  });

  // Bottom Solution Banner
  s2.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 6.0,
    w: 11.733,
    h: 0.7,
    rectRadius: 0.12,
    fill: { color: COLORS.lightBeige },
    line: { color: COLORS.burgundy, width: 1 },
  });
  s2.addText('💡 솔루션: 대치 수프리마의 164개 대학 입결 DB와 AI 인프라를 학원에 즉시 이식하여, 별도 인력 채용 없이 대치동 최정상급 입시 코칭을 제공합니다.', {
    x: 1.1,
    y: 6.0,
    w: 11.133,
    h: 0.7,
    fontSize: 12,
    fontFace: FONT_BODY,
    color: COLORS.burgundy,
    bold: true,
    valign: 'middle',
  });
}

// ==========================================
// SLIDE 3: 통합 솔루션 개요 (학생용 + 학원용)
// ==========================================
{
  const s3 = pres.addSlide();
  s3.background = { color: COLORS.bgLight };
  addSlideHeader(s3, '02. INTEGRATED PLATFORM', '학생과 학원을 실시간으로 연결하는 듀얼 솔루션', '학생용 「나의 입시멘토」 웹과 학원용 「컨설턴트 앱」이 유기적으로 연동되는 올인원 입시 인프라');

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
  // Header
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
    '• 교과 성적 추이 & 학종 적합도 AI 정밀 진단',
    '• 카카오 도서 DB 연계 도서명·핵심이론 탑재 독서 탐구',
    '• 나이스 기재용 3단계 완성형 세특 문장 자동 생성',
    '• 164개 대학 26,295개 전형 상향·적정·안정 합격선 리포트',
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
  // Header
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
    '• 암호화된 고유 코드로 재원생 데이터 1-Click 안전 연동',
    '• 학생별 내신 성적 추이 및 탐구 보고서 실시간 모니터링',
    '• 1개월 / 3개월(학기집중) / 6개월(학기풀코스) 기간별 관리',
    '• 학원 로고가 각인된 심화탐구·독서·세특 맞춤 추천서 발급',
    '• 시험 직후 학부모 상담용 종합 성장 평가서 즉시 인쇄',
    '• 학원 담당자 입시 교육 또는 본원 전문 연구원 업무 대행',
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
// SLIDE 4: 학원 도입 시 4대 핵심 기대효과
// ==========================================
{
  const s4 = pres.addSlide();
  s4.background = { color: COLORS.bgLight };
  addSlideHeader(s4, '03. CORE BENEFITS', '학원 원장님과 강사진을 위한 4대 핵심 차별화 가치', '재원생 락인부터 신규 유치, 강사 업무 경감, 대치동 프리미엄 브랜딩까지 한 번에 실현합니다.');

  const benefits = [
    {
      num: '01',
      title: '재원생 락인(Lock-in) 극대화',
      desc: '교과 수업에 수시 학종 관리가 유기적으로 결합되어 학기 중은 물론 방학 기간 이탈을 완벽 차단합니다. 1개 학기 단위 밀착 코칭으로 연간 등록율을 대폭 향상시킵니다.',
      accent: COLORS.burgundy,
    },
    {
      num: '02',
      title: '신규 원생 유치 킬러 무기',
      desc: '‘대치 수프리마 164개 대학 입결 기반 1:1 정밀 진단’을 간판 무기로 학부모 설명회 및 상담 등록률을 폭발적으로 증가시킵니다. 타 학원이 흉내낼 수 없는 독보적 차별점입니다.',
      accent: COLORS.blueNavy,
    },
    {
      num: '03',
      title: '강사 업무 부담 90% 이상 경감',
      desc: '복잡한 입시 분석과 세특 문장 작성을 시스템과 AI가 전담합니다. 강사진은 본연의 교과 강의와 학생 관리에만 몰입할 수 있어 강사 피로도를 획기적으로 낮춥니다.',
      accent: COLORS.teal,
    },
    {
      num: '04',
      title: '대치동 최상위 브랜딩 탑재',
      desc: '지방 및 수도권 학원도 ‘대치수프리마 대입전략연구소 공식 제휴 학원’ 명칭과 최신 대치동 입결 데이터베이스를 공식 활용하여 지역 내 1등 학원 위상을 확고히 합니다.',
      accent: COLORS.amber,
    },
  ];

  benefits.forEach((b, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 0.8 + col * 6.0;
    const y = 2.1 + row * 2.35;

    s4.addShape(pres.ShapeType.roundRect, {
      x: x,
      y: y,
      w: 5.733,
      h: 2.1,
      rectRadius: 0.15,
      fill: { color: COLORS.white },
      line: { color: COLORS.borderBeige, width: 1 },
    });

    // Num Box
    s4.addShape(pres.ShapeType.roundRect, {
      x: x + 0.3,
      y: y + 0.25,
      w: 0.7,
      h: 0.45,
      rectRadius: 0.08,
      fill: { color: b.accent },
    });
    s4.addText(b.num, {
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

    s4.addText(b.title, {
      x: x + 1.15,
      y: y + 0.25,
      w: 4.25,
      h: 0.45,
      fontSize: 15,
      fontFace: FONT_TITLE,
      color: COLORS.darkText,
      bold: true,
      valign: 'middle',
    });

    s4.addText(b.desc, {
      x: x + 0.3,
      y: y + 0.85,
      w: 5.133,
      h: 1.05,
      fontSize: 10.5,
      fontFace: FONT_BODY,
      color: COLORS.slateText,
      lineSpacingMultiple: 1.25,
    });
  });
}

// ==========================================
// SLIDE 5: 학원 맞춤형 2-Track 운영 모델
// ==========================================
{
  const s5 = pres.addSlide();
  s5.background = { color: COLORS.bgLight };
  addSlideHeader(s5, '04. OPERATIONAL MODEL', '학원 내부 인력 현황에 따른 맞춤형 2-Track 지원', '학원 내 전담 인력 유무에 맞추어 ‘정기 교육 지원’ 또는 ‘전문 업무 대행’을 완벽하게 맞춤 제공합니다.');

  // Track A
  s5.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 2.1,
    w: 5.65,
    h: 4.2,
    rectRadius: 0.15,
    fill: { color: COLORS.white },
    line: { color: COLORS.burgundy, width: 1.5 },
  });
  s5.addShape(pres.ShapeType.roundRect, {
    x: 1.1,
    y: 2.3,
    w: 5.05,
    h: 0.55,
    rectRadius: 0.1,
    fill: { color: COLORS.burgundy },
  });
  s5.addText('Track A : 원내 담당자 배정형 (교육 지원)', {
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
    '• 시스템 제공: 학원 전용 컨설턴트 앱 관리자 마스터 계정 무제한 발급',
    '• 정기 입시 교육: 대치 수프리마 대입전략연구소의 월간 수시 트렌드 브리핑',
    '• 세특 지도법 전수: 2028 개편 나이스 기재용 3단계 문장 코칭 실전 가이드',
    '• 리포트 발급: 학원 로고가 들어간 맞춤형 추천서 및 진단서 1-Click 인쇄',
    '• 학원 내 입시 전문성을 구축하여 장기적인 학원 자체 자산으로 내재화',
  ];
  s5.addText(trackA.join('\n\n'), {
    x: 1.1,
    y: 3.05,
    w: 5.05,
    h: 3.0,
    fontSize: 10.5,
    fontFace: FONT_BODY,
    color: '334155',
    lineSpacingMultiple: 1.15,
  });

  // Track B
  s5.addShape(pres.ShapeType.roundRect, {
    x: 6.883,
    y: 2.1,
    w: 5.65,
    h: 4.2,
    rectRadius: 0.15,
    fill: { color: COLORS.white },
    line: { color: COLORS.blueNavy, width: 1.5 },
  });
  s5.addShape(pres.ShapeType.roundRect, {
    x: 7.183,
    y: 2.3,
    w: 5.05,
    h: 0.55,
    rectRadius: 0.1,
    fill: { color: COLORS.blueNavy },
  });
  s5.addText('Track B : 전담 인력 부재형 (업무 대행 위탁)', {
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
    '• 권장 대상: 별도 입시 인력 채용이 부담스럽고 강사 업무 과중을 덜고 싶은 학원',
    '• 업무 100% 대행: 학원 전담 직원이 상주하는 것처럼 본원 전문 연구원이 대행',
    '• 학생부 정밀 분석: 학생이 등록한 생기부/성적 데이터를 본원에서 직접 분석',
    '• 탐구 주제 & 도서 배정: 학생 희망 진로에 최적화된 독서와 탐구 주제 지정',
    '• 나이스 문장 최종 검수: 학교 제출용 완성형 세특 초안을 본원 연구진이 감수',
    '• 학원은 학생 모집과 브랜딩에만 집중, 입시 실무는 대치 본원이 풀케어',
  ];
  s5.addText(trackB.join('\n\n'), {
    x: 7.183,
    y: 3.05,
    w: 5.05,
    h: 3.0,
    fontSize: 10.5,
    fontFace: FONT_BODY,
    color: '334155',
    lineSpacingMultiple: 1.15,
  });

  // Bottom Notice
  s5.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 6.45,
    w: 11.733,
    h: 0.4,
    rectRadius: 0.08,
    fill: { color: COLORS.lightBeige },
  });
  s5.addText('※ 도입 비용 안내: 학원 재원생 규모 및 운영 방식(Track A 직접 코칭 vs Track B 전담 업무대행)에 따라 맞춤 협의로 진행됩니다.', {
    x: 1.0,
    y: 6.45,
    w: 11.333,
    h: 0.4,
    fontSize: 10.5,
    fontFace: FONT_BODY,
    color: COLORS.burgundy,
    bold: true,
    align: 'center',
    valign: 'middle',
  });
}

// ==========================================
// SLIDE 6: 1개 학기 단위 관리 기간 및 산정 공식
// ==========================================
{
  const s6 = pres.addSlide();
  s6.background = { color: COLORS.bgLight };
  addSlideHeader(s6, '05. SEMESTER MANAGEMENT', '고교 학사일정에 맞춘 1개 학기 단위 밀착 관리', '종료 시점(~8월, ~2월)을 기준으로 잔여 개월 수를 유연하게 산정하여 학사 일정과 완벽 동기화합니다.');

  // Formula Card
  s6.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 2.1,
    w: 11.733,
    h: 1.1,
    rectRadius: 0.12,
    fill: { color: COLORS.white },
    line: { color: COLORS.burgundy, width: 1.5 },
  });
  s6.addText('📌 관리 기간 산정 공식:  종료 시점 - 가입 시점 = 잔여 관리 개월 수 (1개 학기 단위 완주)', {
    x: 1.1,
    y: 2.25,
    w: 11.133,
    h: 0.4,
    fontSize: 14,
    fontFace: FONT_TITLE,
    color: COLORS.burgundy,
    bold: true,
  });
  s6.addText('• 1학기 종료 기준: ~8월 말 (여름방학 및 1학기 나이스 생기부 마감)  |  • 2학기 종료 기준: ~2월 말 (겨울방학 및 학년말 생기부 최종 확정)', {
    x: 1.1,
    y: 2.65,
    w: 11.133,
    h: 0.35,
    fontSize: 11,
    fontFace: FONT_BODY,
    color: '334155',
    bold: true,
  });

  // 4 Case Cards
  const cases = [
    {
      title: '12월 가입 ➔ 2월 종료',
      months: '3개월 집중 관리',
      badge: '겨울방학 집중',
      desc: '• 2학기 기말고사 직후 가입\n• 1년간의 생기부 누락 활동 최종 보완\n• 학년말 나이스 기재 마감 집중 코칭',
      color: COLORS.blueNavy,
    },
    {
      title: '5월 가입 ➔ 8월 종료',
      months: '3~4개월 학기 집중',
      badge: '중간고사 직후',
      desc: '• 1학기 중간고사 직후 가입\n• 기말고사 대비 및 독서 탐구 설계\n• 1학기 나이스 세특 문장 최종 검수',
      color: COLORS.blueNavy,
    },
    {
      title: '3월 가입 ➔ 8월 종료',
      months: '6개월 풀코스 케어',
      badge: '1학기 완주',
      desc: '• 신학기 시작과 동시 1학기 풀코스 등록\n• 중간·기말 내신 성적 추이 심층 분석\n• 자·동·진·특 전 영역 상시 밀착 케어',
      color: COLORS.burgundy,
    },
    {
      title: '9월 가입 ➔ 2월 종료',
      months: '6개월 풀코스 케어',
      badge: '2학기 완주',
      desc: '• 2학기 개학과 동시 2학기 풀코스 등록\n• 수행평가 및 교과목별 연계 탐구 완성\n• 다음 학년 진급 대비 맞춤형 전략 수립',
      color: COLORS.burgundy,
    },
  ];

  cases.forEach((c, idx) => {
    const x = 0.8 + idx * 3.0;
    s6.addShape(pres.ShapeType.roundRect, {
      x: x,
      y: 3.4,
      w: 2.75,
      h: 3.2,
      rectRadius: 0.15,
      fill: { color: COLORS.white },
      line: { color: COLORS.borderBeige, width: 1 },
    });

    s6.addShape(pres.ShapeType.roundRect, {
      x: x + 0.25,
      y: 3.6,
      w: 2.25,
      h: 0.35,
      rectRadius: 0.08,
      fill: { color: c.color },
    });
    s6.addText(c.badge, {
      x: x + 0.25,
      y: 3.6,
      w: 2.25,
      h: 0.35,
      fontSize: 10,
      fontFace: FONT_BODY,
      color: COLORS.white,
      bold: true,
      align: 'center',
      valign: 'middle',
    });

    s6.addText(c.title, {
      x: x + 0.2,
      y: 4.1,
      w: 2.35,
      h: 0.35,
      fontSize: 12,
      fontFace: FONT_TITLE,
      color: COLORS.darkText,
      bold: true,
      align: 'center',
    });
    s6.addText(c.months, {
      x: x + 0.2,
      y: 4.45,
      w: 2.35,
      h: 0.3,
      fontSize: 11,
      fontFace: FONT_BODY,
      color: c.color,
      bold: true,
      align: 'center',
    });

    s6.addText(c.desc, {
      x: x + 0.2,
      y: 4.85,
      w: 2.35,
      h: 1.5,
      fontSize: 9.5,
      fontFace: FONT_BODY,
      color: COLORS.slateText,
      lineSpacingMultiple: 1.25,
    });
  });
}

// ==========================================
// SLIDE 7: 원스톱 4단계 진단 & 세특 완성 플로우
// ==========================================
{
  const s7 = pres.addSlide();
  s7.background = { color: COLORS.bgLight };
  addSlideHeader(s7, '06. 4-STEP PROCESS', '“따라만 해도 완성되는” 정교한 4단계 진단 플로우', '학생부 등록부터 대학 위치 진단까지, 직관적인 내비게이션으로 막힘없이 완성됩니다.');

  const steps = [
    {
      num: 'STEP 01',
      title: '학생부 간편 등록 & 환산',
      desc: '• 나이스 10초 간편인증 또는 정부24 PDF 업로드\n• 2028 개편 5등급제 ⟷ 9등급제 실시간 자동 변환\n• 학생 기본 성적 데이터 자동 파싱 & 저장',
      accent: COLORS.burgundy,
    },
    {
      num: 'STEP 02',
      title: '학생부 AI 정밀 분석',
      desc: '• 교과 성적 추이 & 학종 적합도 AI 정밀 진단\n• 학생의 진로 역량과 이수 과목 적합성 평가\n• 전공 역량별 취약 영역 및 보완 포인트 도출',
      accent: COLORS.blueNavy,
    },
    {
      num: 'STEP 03',
      title: '독서 연계 심화 탐구·세특',
      desc: '• 카카오 도서 DB 연계 추천 도서 매칭\n• 도서명·핵심이론이 자연스럽게 녹아든 탐구 가설\n• 나이스 기재 기준에 부합하는 3단계 완성형 세특',
      accent: COLORS.burgundy,
    },
    {
      num: 'STEP 04',
      title: '164개 대학 위치 진단',
      desc: '• 164개 대학 26,295개 수시 전형 컷오프 비교\n• 상향(도전)·적정(유력)·안정 3단계 모의 지원선\n• 학부모 상담용 종합 분석 리포트 즉시 출력',
      accent: COLORS.teal,
    },
  ];

  steps.forEach((st, idx) => {
    const x = 0.8 + idx * 3.0;
    s7.addShape(pres.ShapeType.roundRect, {
      x: x,
      y: 2.2,
      w: 2.75,
      h: 4.4,
      rectRadius: 0.15,
      fill: { color: COLORS.white },
      line: { color: COLORS.borderBeige, width: 1 },
    });

    s7.addShape(pres.ShapeType.roundRect, {
      x: x + 0.3,
      y: 2.5,
      w: 1.0,
      h: 0.35,
      rectRadius: 0.08,
      fill: { color: st.accent },
    });
    s7.addText(st.num, {
      x: x + 0.3,
      y: 2.5,
      w: 1.0,
      h: 0.35,
      fontSize: 10,
      fontFace: FONT_BODY,
      color: COLORS.white,
      bold: true,
      align: 'center',
      valign: 'middle',
    });

    s7.addText(st.title, {
      x: x + 0.3,
      y: 3.05,
      w: 2.15,
      h: 0.6,
      fontSize: 14,
      fontFace: FONT_TITLE,
      color: COLORS.darkText,
      bold: true,
    });

    s7.addText(st.desc, {
      x: x + 0.3,
      y: 3.8,
      w: 2.15,
      h: 2.5,
      fontSize: 10,
      fontFace: FONT_BODY,
      color: COLORS.slateText,
      lineSpacingMultiple: 1.3,
    });
  });
}

// ==========================================
// SLIDE 8: 도입 절차 및 문의 안내
// ==========================================
{
  const s8 = pres.addSlide();
  s8.background = { color: COLORS.bgLight };
  addSlideHeader(s8, '07. ONBOARDING & CONTACT', '학원 제휴 절차 및 대치 수프리마 공식 소통 채널', '간편한 4단계 도입 절차를 통해 학원의 입시 경쟁력을 즉시 업그레이드하세요.');

  // 4 Steps Horizontal Box
  const onboards = [
    { step: '1단계', title: '제휴 신청 & 상담', desc: '학원 규모 및 원내 입시 현황 진단' },
    { step: '2단계', title: 'Track 모델 확정', desc: 'Track A(직접 지도) or Track B(업무 대행)' },
    { step: '3단계', title: '원장·강사 교육', desc: '시스템 사용법 및 세특 코칭 가이드 전수' },
    { step: '4단계', title: '계정 발급 & 개시', desc: '학원 코드 발급 및 재원생 실시간 연동' },
  ];

  onboards.forEach((o, idx) => {
    const x = 0.8 + idx * 3.0;
    s8.addShape(pres.ShapeType.roundRect, {
      x: x,
      y: 2.1,
      w: 2.75,
      h: 1.6,
      rectRadius: 0.12,
      fill: { color: COLORS.white },
      line: { color: COLORS.borderBeige, width: 1 },
    });
    s8.addText(o.step, {
      x: x + 0.2,
      y: 2.3,
      w: 2.35,
      h: 0.3,
      fontSize: 11,
      fontFace: FONT_BODY,
      color: COLORS.burgundy,
      bold: true,
    });
    s8.addText(o.title, {
      x: x + 0.2,
      y: 2.65,
      w: 2.35,
      h: 0.35,
      fontSize: 13,
      fontFace: FONT_TITLE,
      color: COLORS.darkText,
      bold: true,
    });
    s8.addText(o.desc, {
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
  s8.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 3.95,
    w: 11.733,
    h: 2.75,
    rectRadius: 0.15,
    fill: { color: COLORS.white },
    line: { color: COLORS.borderBeige, width: 1 },
  });

  s8.addText('대치수프리마 대입전략연구소 공식 제휴 문의', {
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
  s8.addText(contactLeft.join('\n\n'), {
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
    '• 비용 협의: 재원생 규모 및 운영 Track에 따른 원장님 1:1 맞춤 상담',
  ];
  s8.addText(contactRight.join('\n\n'), {
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
}

run().catch(err => {
  console.error('Build PPTX failed:', err);
  process.exit(1);
});
