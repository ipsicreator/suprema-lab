const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9'; // 13.333 x 7.5 inches

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
  purple: '7C3AED',
};

const FONT_TITLE = 'Malgun Gothic';
const FONT_BODY = 'Malgun Gothic';

function addSlideHeader(slide, category, title, subtitle) {
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 0.5,
    w: 2.4,
    h: 0.35,
    rectRadius: 0.15,
    fill: { color: COLORS.badgeBg },
    line: { color: COLORS.burgundy, width: 1 },
  });
  slide.addText(category, {
    x: 0.8,
    y: 0.5,
    w: 2.4,
    h: 0.35,
    fontSize: 10,
    fontFace: FONT_BODY,
    color: COLORS.burgundy,
    bold: true,
    align: 'center',
    valign: 'middle',
  });

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

  slide.addShape(pres.ShapeType.line, {
    x: 0.8,
    y: 6.9,
    w: 11.733,
    h: 0,
    line: { color: COLORS.borderBeige, width: 1 },
  });
  slide.addText('대치수프리마 대입전략연구소 · 서울시 강남구 테헤란로 326 B1F · B2C 마케팅 전략서', {
    x: 0.8,
    y: 6.95,
    w: 11.733,
    h: 0.35,
    fontSize: 9,
    fontFace: FONT_BODY,
    color: COLORS.slateText,
  });
}

// SLIDE 1: 표지
{
  const s1 = pres.addSlide();
  s1.background = { color: COLORS.bgLight };

  const logoPath = path.resolve('public/suprema-official-logo.png');
  if (fs.existsSync(logoPath)) {
    s1.addImage({ path: logoPath, x: 0.8, y: 0.45, w: 1.6, h: 0.5 });
  }

  s1.addShape(pres.ShapeType.line, {
    x: 2.55, y: 0.45, w: 0, h: 0.5,
    line: { color: 'D8C8B4', width: 1.5 },
  });

  s1.addText([
    { text: '대치 수프리마 대입전략연구소\n', options: { fontSize: 9.5, bold: true, color: COLORS.burgundy } },
    { text: '나의 입시멘토', options: { fontSize: 11.5, bold: true, color: COLORS.charcoal } },
  ], {
    x: 2.7, y: 0.42, w: 3.5, h: 0.55, fontFace: FONT_BODY, margin: 0,
  });

  s1.addShape(pres.ShapeType.roundRect, {
    x: 4.4, y: 1.5, w: 4.5, h: 0.38,
    rectRadius: 0.19, fill: { color: COLORS.white }, line: { color: 'E4D4BF', width: 1 },
  });
  s1.addText('✦ B2C 마케팅 및 비디오 홍보물 제작 로드맵', {
    x: 4.4, y: 1.5, w: 4.5, h: 0.38,
    fontSize: 11, fontFace: FONT_BODY, color: COLORS.burgundy, bold: true, align: 'center', valign: 'middle',
  });

  s1.addText('개인 사용자 확보를 위한', {
    x: 1.0, y: 2.05, w: 11.333, h: 0.5,
    fontSize: 24, fontFace: FONT_TITLE, color: COLORS.darkText, bold: true, align: 'center',
  });
  s1.addText('「나의 입시멘토」 마케팅 & 숏폼 비디오 전략', {
    x: 1.0, y: 2.55, w: 11.333, h: 0.75,
    fontSize: 38, fontFace: FONT_TITLE, color: COLORS.burgundy, bold: true, align: 'center',
  });

  s1.addText('나의 입시 멘토 “생각이 있으면, 방법은 따라 옵니다” 정교한 시스템으로, 따라만 해도 완성되는 학생부.', {
    x: 1.0, y: 3.4, w: 11.333, h: 0.45,
    fontSize: 14, fontFace: FONT_BODY, color: '222222', bold: true, align: 'center',
  });

  s1.addText('2028 대입 개편 5등급제 대비 학부모·학생 불안 해소부터 유튜브 쇼츠/인스타 릴스 5편 콘티, 1개 학기 관리제 연계', {
    x: 1.5, y: 3.9, w: 10.333, h: 0.45,
    fontSize: 12, fontFace: FONT_BODY, color: '4B5563', align: 'center',
  });

  // 4 Core Value Cards
  const cData = [
    { num: '5,000,000+', label: '분기당 숏폼 누적 도달수', color: COLORS.burgundy },
    { num: '10,000명', label: '6개월 내 유료 활성 가입자', color: COLORS.burgundy },
    { num: '25% 이상', label: '1단계 학생부 등록 전환율', color: COLORS.teal },
    { num: '350%+', label: '목표 ROAS (광고비 대비 매출)', color: COLORS.darkText },
  ];
  cData.forEach((c, idx) => {
    const cx = 0.85 + idx * 3.0;
    s1.addShape(pres.ShapeType.roundRect, {
      x: cx, y: 4.8, w: 2.65, h: 1.5,
      rectRadius: 0.15, fill: { color: COLORS.white }, line: { color: 'E8DECB', width: 1 },
    });
    s1.addText(c.num, {
      x: cx, y: 5.0, w: 2.65, h: 0.6,
      fontSize: 20, fontFace: FONT_TITLE, color: c.color, bold: true, align: 'center', valign: 'middle',
    });
    s1.addText(c.label, {
      x: cx, y: 5.65, w: 2.65, h: 0.45,
      fontSize: 11, fontFace: FONT_BODY, color: '334155', bold: true, align: 'center', valign: 'middle',
    });
  });
}

// SLIDE 2: 타깃 페르소나 및 시장 기회
{
  const s2 = pres.addSlide();
  s2.background = { color: COLORS.bgLight };
  addSlideHeader(s2, '01. TARGET PERSONAS', '2028 개편에 직면한 3대 핵심 타깃 페르소나', '5등급제 도입으로 교과 변별력이 급감하여, 학생과 학부모 모두 세특과 탐구 관리 솔루션을 절실히 찾고 있습니다.');

  const personas = [
    {
      role: '결제 주체 (구매 결정권자)',
      title: 'Persona A : 불안한 고1·고2 학부모',
      sub: '40~50대 학부모 / 강남·분당·목동 및 전국 주요 학군지',
      pain: '• 5등급제 개편으로 1등급 10% 확대 ➔ 내신만으로 안심 불가\n• 대치동 1:1 대면 컨설팅 비용(수백만 원)에 대한 경제적 부담\n• "어떤 책을 읽히고 어떤 세특을 써야 할지" 극심한 막막함',
      solution: '➔ 대치수프리마 164개 대학 입결 DB 기반 신뢰성 높은 디지털 코칭',
      color: COLORS.burgundy,
    },
    {
      role: '실사용자 (바이럴 확산 주체)',
      title: 'Persona B : 세특 마감 쫓기는 고1·고2',
      sub: '일반고/자사고 재학 / 쇼츠·릴스·틱톡 헤비 유저',
      pain: '• 수행평가와 생기부 세특 마감 직전 주제 고갈 및 멘붕\n• 챗GPT 문장은 나이스 기재 금지어에 걸릴 위험이 큼\n• 책을 읽지 않고도 전공 이론이 녹아든 완성형 문장이 필요',
      solution: '➔ 수프리마랩 도서 DB 연계 1-Click 3단계 나이스 규격 완성형 문장 도출',
      color: COLORS.blueNavy,
    },
    {
      role: '긴급 전환 타깃 (단기 속성)',
      title: 'Persona C : 수시 6장 고3 수험생',
      sub: '수시 원서 접수를 앞둔 고3 및 N수생',
      pain: '• 내 성적으로 어느 대학 학종/교과를 써야 할지 불안\n• 사설 업체의 비과학적인 "감"이나 과장 광고 불신\n• 최신 컷오프 기반 객관적 상향·적정·안정 라인업 갈망',
      solution: '➔ 26,295개 최신 전형 컷오프 기반 1개월 파이널 라인업 확정',
      color: COLORS.teal,
    },
  ];

  personas.forEach((p, idx) => {
    const x = 0.8 + idx * 4.0;
    s2.addShape(pres.ShapeType.roundRect, {
      x: x, y: 2.1, w: 3.733, h: 4.5,
      rectRadius: 0.15, fill: { color: COLORS.white }, line: { color: COLORS.borderBeige, width: 1 },
    });
    s2.addShape(pres.ShapeType.roundRect, {
      x: x + 0.25, y: 2.35, w: 3.233, h: 0.35,
      rectRadius: 0.08, fill: { color: p.color },
    });
    s2.addText(p.role, {
      x: x + 0.25, y: 2.35, w: 3.233, h: 0.35,
      fontSize: 10, fontFace: FONT_BODY, color: COLORS.white, bold: true, align: 'center', valign: 'middle',
    });
    s2.addText(p.title, {
      x: x + 0.25, y: 2.85, w: 3.233, h: 0.45,
      fontSize: 14, fontFace: FONT_TITLE, color: COLORS.darkText, bold: true,
    });
    s2.addText(p.sub, {
      x: x + 0.25, y: 3.3, w: 3.233, h: 0.3,
      fontSize: 10, fontFace: FONT_BODY, color: p.color, bold: true,
    });
    s2.addText(p.pain, {
      x: x + 0.25, y: 3.7, w: 3.233, h: 1.7,
      fontSize: 10, fontFace: FONT_BODY, color: COLORS.slateText, lineSpacingMultiple: 1.2,
    });
    s2.addShape(pres.ShapeType.roundRect, {
      x: x + 0.25, y: 5.5, w: 3.233, h: 0.85,
      rectRadius: 0.1, fill: { color: COLORS.lightBeige },
    });
    s2.addText(p.solution, {
      x: x + 0.35, y: 5.5, w: 3.033, h: 0.85,
      fontSize: 10, fontFace: FONT_BODY, color: COLORS.burgundy, bold: true, valign: 'middle',
    });
  });
}

// SLIDE 3: 4단계 퍼널(Funnel) 마케팅 전략
{
  const s3 = pres.addSlide();
  s3.background = { color: COLORS.bgLight };
  addSlideHeader(s3, '02. MARKETING FUNNEL', '고객 여정 4단계(Funnel) 유입 및 전환 전략', '숏폼 영상으로 대량 유입을 만들고, 5/9등급 자동 환산 무료 체험 후 학기제 정기 구독으로 전환합니다.');

  const funnels = [
    {
      stage: 'Top of Funnel',
      name: '1. 인식 & 바이럴 유입',
      desc: '• 유튜브 쇼츠 & 인스타 릴스 주 3~5회 배포\n• 고등학생 세특 멘붕 / 학부모 불안 저격 숏폼\n• 대형 맘카페(디스쿨/수만휘) 실전 칼럼 기고\n• 네이버 브랜드 검색 & SEO 상위 노출',
      kpi: '월 100만 회 숏폼 노출 / 웹 유입 50,000명',
      color: COLORS.burgundy,
    },
    {
      stage: 'Middle of Funnel',
      name: '2. 무료 체험 & 신뢰 구축',
      desc: '• 나이스 간편인증 or PDF 10초 업로드\n• 2028 개편 5등급제 ⟷ 9등급제 실시간 환산\n• 수프리마랩 도서 DB 연계 필독서 3권 즉시 추천\n• 164개 대학 합격 컷오프 모의 프리뷰',
      kpi: '웹 유입 대비 1단계 등록 전환율 25%+',
      color: COLORS.blueNavy,
    },
    {
      stage: 'Bottom of Funnel',
      name: '3. 유료 결제 & 학기 구독',
      desc: '• 1개월 속성: 수시 6개 대학 파이널 라인업\n• 3~4개월 집중: 중간/기말 직후 세특 집중 케어\n• 6개월 풀코스: 학기 완주형 자·동·진·특 풀케어\n• "남은 잔여학기 마감 임박" 카카오 알림톡',
      kpi: '체험자 대비 유료 결제 전환율 12%+',
      color: COLORS.teal,
    },
    {
      stage: 'Retention & Referral',
      name: '4. 재등록 & 친구 추천',
      desc: '• 친구 초대 시 양방향 세특 패키지 할인 혜택\n• 학부모 단톡방 공유용 최종 리포트 PDF 제공\n• 1학기 종료 후 2학기 풀코스 연속 구독 유도\n• 네이버 밴드 입시 브리핑 VIP 멤버십 연계',
      kpi: '바이럴 계수 1.3 / 재등록율 65%+',
      color: COLORS.amber,
    },
  ];

  funnels.forEach((f, idx) => {
    const x = 0.8 + idx * 3.0;
    s3.addShape(pres.ShapeType.roundRect, {
      x: x, y: 2.1, w: 2.75, h: 4.5,
      rectRadius: 0.15, fill: { color: COLORS.white }, line: { color: COLORS.borderBeige, width: 1 },
    });
    s3.addShape(pres.ShapeType.roundRect, {
      x: x + 0.25, y: 2.35, w: 2.25, h: 0.35,
      rectRadius: 0.08, fill: { color: f.color },
    });
    s3.addText(f.stage, {
      x: x + 0.25, y: 2.35, w: 2.25, h: 0.35,
      fontSize: 10, fontFace: FONT_BODY, color: COLORS.white, bold: true, align: 'center', valign: 'middle',
    });
    s3.addText(f.name, {
      x: x + 0.2, y: 2.85, w: 2.35, h: 0.45,
      fontSize: 13, fontFace: FONT_TITLE, color: COLORS.darkText, bold: true,
    });
    s3.addText(f.desc, {
      x: x + 0.2, y: 3.35, w: 2.35, h: 2.1,
      fontSize: 10, fontFace: FONT_BODY, color: COLORS.slateText, lineSpacingMultiple: 1.25,
    });
    s3.addShape(pres.ShapeType.roundRect, {
      x: x + 0.2, y: 5.6, w: 2.35, h: 0.75,
      rectRadius: 0.1, fill: { color: COLORS.lightBeige },
    });
    s3.addText(`KPI 목표:\n${f.kpi}`, {
      x: x + 0.25, y: 5.6, w: 2.25, h: 0.75,
      fontSize: 9.5, fontFace: FONT_BODY, color: f.color, bold: true, align: 'center', valign: 'middle',
    });
  });
}

// SLIDE 4: 숏폼 비디오(쇼츠/릴스) 제작 전략
{
  const s4 = pres.addSlide();
  s4.background = { color: COLORS.bgLight };
  addSlideHeader(s4, '03. VIDEO STRATEGY', '숏폼 비디오(쇼츠/릴스/틱톡) 핵심 제작 공식', '3초 후킹, 고화질 자막, 수프리마랩 도서 DB 시연으로 시청자를 단숨에 웹사이트 유입으로 연결합니다.');

  const rules = [
    {
      num: '01',
      title: '3초 킬러 후킹 (Hook)',
      desc: '스크롤을 즉시 멈추게 하는 충격 문구 배치:\n"내신 1등급 맞아도 인서울 탈락?"\n"세특 마감 3일 전, 챗GPT 절대 쓰지 마라"\n뉴스 헤드라인 줌인 및 극공감 상황 연출',
      color: COLORS.burgundy,
    },
    {
      num: '02',
      title: '9:16 세로형 & 고화질 자막',
      desc: '1080 x 1920 세로 풀스크린 규격 준수.\n오디오 없이도 100% 이해되는 프리미어 자막 바.\n대치수프리마 공식 컬러(버건디/그린/차콜) 탑재로 고급 브랜딩 각인',
      color: COLORS.blueNavy,
    },
    {
      num: '03',
      title: '실전 시연 & 수프리마랩 도서 DB',
      desc: '막연한 팁이 아닌 실제 화면 10초 스피드런:\n나이스 PDF 드래그 ➔ 5/9등급 자동 환산 ➔\n수프리마랩 도서 DB 연계 3단계 세특 문장 완결.\n"시스템의 실행력"을 눈으로 직접 확인',
      color: COLORS.teal,
    },
    {
      num: '04',
      title: '1초 명확한 행동 유도 (CTA)',
      desc: '영상 종료 직전 초록색 버튼 모션 그래픽:\n"[ AI Mentor 시작하기 ] 프로필 링크 클릭"\n"지금 검색창에 나의 입시멘토 검색"\n원클릭 랜딩페이지 직행 경로 확보',
      color: COLORS.greenBtn,
    },
  ];

  rules.forEach((r, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 0.8 + col * 6.0;
    const y = 2.1 + row * 2.35;

    s4.addShape(pres.ShapeType.roundRect, {
      x: x, y: y, w: 5.733, h: 2.15,
      rectRadius: 0.15, fill: { color: COLORS.white }, line: { color: COLORS.borderBeige, width: 1 },
    });
    s4.addShape(pres.ShapeType.roundRect, {
      x: x + 0.3, y: y + 0.25, w: 0.7, h: 0.45,
      rectRadius: 0.08, fill: { color: r.color },
    });
    s4.addText(r.num, {
      x: x + 0.3, y: y + 0.25, w: 0.7, h: 0.45,
      fontSize: 12, fontFace: FONT_BODY, color: COLORS.white, bold: true, align: 'center', valign: 'middle',
    });
    s4.addText(r.title, {
      x: x + 1.15, y: y + 0.25, w: 4.25, h: 0.45,
      fontSize: 15, fontFace: FONT_TITLE, color: COLORS.darkText, bold: true, valign: 'middle',
    });
    s4.addText(r.desc, {
      x: x + 0.3, y: y + 0.8, w: 5.133, h: 1.15,
      fontSize: 10.5, fontFace: FONT_BODY, color: COLORS.slateText, lineSpacingMultiple: 1.25,
    });
  });
}

// SLIDE 5: 숏폼 비디오 5편 콘티 요약
{
  const s5 = pres.addSlide();
  s5.background = { color: COLORS.bgLight };
  addSlideHeader(s5, '04. VIDEO SCRIPTS', '타깃별 숏폼 비디오 5편 제작 콘티 및 대본 요약', '학부모 팩폭형부터 학생 공감형, 기능 시연, 합격 스토리, 전문가 권위까지 다각도 공략');

  const scripts = [
    {
      num: '비디오 01 (학부모)',
      title: '2028 내신 1등급 10%의 충격 진실',
      hook: '“내신 1등급 맞아도 인서울 불합격?”',
      core: '1등급 2.5배 증가 ➔ 세특 필수화 ➔ 164개 대학 컷오프 기반 맞춤 세특 솔루션 제시',
      cta: '프로필 링크에서 1분 만에 확인',
      color: COLORS.burgundy,
    },
    {
      num: '비디오 02 (학생)',
      title: '세특 마감 D-3, 챗GPT 쓰지 마라',
      hook: '“세특 마감 3일 전, 아직도 빈 화면?”',
      core: '챗GPT 기재금지어 위험 ➔ 수프리마랩 도서 DB 연계 3단계 완성형 문장 자동 생성',
      cta: '검색창에 「나의 입시멘토」 검색',
      color: COLORS.blueNavy,
    },
    {
      num: '비디오 03 (기능시연)',
      title: '나이스 PDF 넣었더니 10초 만에 대학 위치가?',
      hook: '“정부24 PDF 딱 넣었더니 무슨 일이?”',
      core: '5등급 ↔ 9등급 자동 환산 ➔ 164개 대학 상향/적정/안정 6개 대학 즉시 도출',
      cta: '지금 바로 내 대학 합격선 확인',
      color: COLORS.teal,
    },
    {
      num: '비디오 04 (합격사례)',
      title: '내신 3.2등급 일반고, 독서 세특으로 한양대 합격',
      hook: '“내신 3.2등급이 한양대 최초합한 비결?”',
      core: '단순 나열 탈피 ➔ 전공 필독서와 심화 가설 연계 ➔ 학종 역전 비결 공개',
      cta: '대치수프리마 독서 세특 바로가기',
      color: COLORS.amber,
    },
    {
      num: '비디오 05 (전문가)',
      title: '대치동 10년 차가 밝히는 거르는 세특 3가지',
      hook: '“입학사정관이 3초 만에 넘기는 세특 3가지”',
      core: '수업요약/단순검색/복붙 배제 ➔ 이기욱 대표가 밝히는 4단계 완성 시스템',
      cta: '대치수프리마 공식 사이트 확인',
      color: COLORS.purple,
    },
  ];

  scripts.forEach((sc, idx) => {
    const y = 2.1 + idx * 0.9;
    s5.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: y, w: 11.733, h: 0.8,
      rectRadius: 0.1, fill: { color: COLORS.white }, line: { color: COLORS.borderBeige, width: 1 },
    });
    s5.addShape(pres.ShapeType.roundRect, {
      x: 1.0, y: y + 0.15, w: 1.8, h: 0.5,
      rectRadius: 0.08, fill: { color: sc.color },
    });
    s5.addText(sc.num, {
      x: 1.0, y: y + 0.15, w: 1.8, h: 0.5,
      fontSize: 10, fontFace: FONT_BODY, color: COLORS.white, bold: true, align: 'center', valign: 'middle',
    });
    s5.addText(sc.title, {
      x: 2.9, y: y + 0.12, w: 3.2, h: 0.32,
      fontSize: 11.5, fontFace: FONT_TITLE, color: COLORS.darkText, bold: true,
    });
    s5.addText(`후킹: ${sc.hook}`, {
      x: 2.9, y: y + 0.44, w: 3.2, h: 0.25,
      fontSize: 9.5, fontFace: FONT_BODY, color: sc.color, bold: true,
    });
    s5.addText(sc.core, {
      x: 6.2, y: y + 0.12, w: 4.2, h: 0.56,
      fontSize: 9.5, fontFace: FONT_BODY, color: COLORS.slateText, lineSpacingMultiple: 1.15,
    });
    s5.addShape(pres.ShapeType.roundRect, {
      x: 10.5, y: y + 0.18, w: 1.8, h: 0.44,
      rectRadius: 0.08, fill: { color: COLORS.lightBeige },
    });
    s5.addText(sc.cta, {
      x: 10.5, y: y + 0.18, w: 1.8, h: 0.44,
      fontSize: 9, fontFace: FONT_BODY, color: COLORS.burgundy, bold: true, align: 'center', valign: 'middle',
    });
  });
}

// SLIDE 6: 학사일정별 연계 캠페인 캘린더
{
  const s6 = pres.addSlide();
  s6.background = { color: COLORS.bgLight };
  addSlideHeader(s6, '05. CAMPAIGN CALENDAR', '고교 학사일정(~8월/~2월 종료) 연계 연간 캠페인', '1개 학기 단위 관리 종료 시점에 완벽히 맞춘 시기별 맞춤 프로모션으로 전환율을 극대화합니다.');

  const cal = [
    { period: '3월~4월', name: '신학기 풀코스 킥오프', term: '3월➔8월 (6개월)', target: '고1 신입생 & 고2', msg: '신학기 첫 단추, 자·동·진·특 1학기 설계로 시작하라' },
    { period: '5월~6월', name: '중간고사 만회 세특 집중', term: '5월➔8월 (3~4개월)', target: '중간고사 후 성적 충격생', msg: '내신 아쉬워도 포기 금지! 세특으로 학종 대역전' },
    { period: '7월~8월', name: '1학기 나이스 마감 & 수시', term: '8월➔즉시 (1개월 속성)', target: '고3 수험생 & 전 학년', msg: '나이스 마감 D-30 최종 검수 & 164개 대학 6장 확정' },
    { period: '9월~10월', name: '2학기 가을학기 풀코스', term: '9월➔2월 (6개월)', target: '2학기 반등 희망생', msg: '2학기 역전의 기회, 전공 맞춤 심화 독서로 완성하라' },
    { period: '11월~12월', name: '학년말 기말고사 직후 파이널', term: '12월➔2월 (3개월)', target: '학년말 생기부 마감생', msg: '학년이 바뀌기 전 마지막 기회! 1년치 누락 활동 보완' },
    { period: '1월~2월', name: '겨울방학 독서 심화 탐구', term: '차기 학년 선행', target: '예비 고1·고2·고3', msg: '다음 학년 1등급을 결정하는 겨울방학 독서 10선' },
  ];

  cal.forEach((c, idx) => {
    const y = 2.1 + idx * 0.75;
    s6.addShape(pres.ShapeType.roundRect, {
      x: 0.8, y: y, w: 11.733, h: 0.68,
      rectRadius: 0.1, fill: { color: COLORS.white }, line: { color: COLORS.borderBeige, width: 1 },
    });
    s6.addText(c.period, {
      x: 1.0, y: y + 0.14, w: 1.3, h: 0.4,
      fontSize: 11, fontFace: FONT_BODY, color: COLORS.burgundy, bold: true,
    });
    s6.addText(c.name, {
      x: 2.4, y: y + 0.14, w: 2.6, h: 0.4,
      fontSize: 11, fontFace: FONT_TITLE, color: COLORS.darkText, bold: true,
    });
    s6.addShape(pres.ShapeType.roundRect, {
      x: 5.1, y: y + 0.14, w: 1.7, h: 0.38,
      rectRadius: 0.08, fill: { color: COLORS.lightBeige },
    });
    s6.addText(c.term, {
      x: 5.1, y: y + 0.14, w: 1.7, h: 0.38,
      fontSize: 9.5, fontFace: FONT_BODY, color: COLORS.blueNavy, bold: true, align: 'center', valign: 'middle',
    });
    s6.addText(c.target, {
      x: 7.0, y: y + 0.14, w: 1.8, h: 0.4,
      fontSize: 10, fontFace: FONT_BODY, color: '334155', bold: true,
    });
    s6.addText(`“${c.msg}”`, {
      x: 8.9, y: y + 0.14, w: 3.4, h: 0.4,
      fontSize: 9.5, fontFace: FONT_BODY, color: COLORS.slateText, italic: true,
    });
  });
}

// SLIDE 7: 월간 마케팅 예산 및 KPI 산출표
{
  const s7 = pres.addSlide();
  s7.background = { color: COLORS.bgLight };
  addSlideHeader(s7, '06. BUDGET & KPI', '월간 마케팅 예산 배분 및 성과 측정 지표', '월 1,000만 원 집행 기준 300만 회 노출, 500명 이상의 유료 가입자 전환 달성');

  const budget = [
    { ch: '메타 광고 (인스타 릴스/피드)', cost: '4,500,000원', share: '45.0%', target: '학부모(35~54세) & 학생(16~19세)', imp: '1,500,000회', conv: '225명 유료 전환', color: COLORS.burgundy },
    { ch: '유튜브 쇼츠 & 디스플레이', cost: '2,500,000원', share: '25.0%', target: '입시 키워드 검색자 & 수험생', imp: '1,000,000회', conv: '100명 유료 전환', color: COLORS.blueNavy },
    { ch: '네이버 브랜드/파워콘텐츠', cost: '1,500,000원', share: '15.0%', target: '의도 기반 고관여 검색자', imp: '200,000회', conv: '100명 유료 전환', color: COLORS.teal },
    { ch: '인플루언서 & 맘카페 바이럴', cost: '1,500,000원', share: '15.0%', target: '학부모 커뮤니티 & 수험생 카페', imp: '300,000회', conv: '83명 유료 전환', color: COLORS.amber },
  ];

  budget.forEach((b, idx) => {
    const x = 0.8 + idx * 3.0;
    s7.addShape(pres.ShapeType.roundRect, {
      x: x, y: 2.1, w: 2.75, h: 4.4,
      rectRadius: 0.15, fill: { color: COLORS.white }, line: { color: COLORS.borderBeige, width: 1 },
    });
    s7.addShape(pres.ShapeType.roundRect, {
      x: x + 0.2, y: 2.35, w: 2.35, h: 0.35,
      rectRadius: 0.08, fill: { color: b.color },
    });
    s7.addText(b.share, {
      x: x + 0.2, y: 2.35, w: 2.35, h: 0.35,
      fontSize: 11, fontFace: FONT_BODY, color: COLORS.white, bold: true, align: 'center', valign: 'middle',
    });
    s7.addText(b.ch, {
      x: x + 0.2, y: 2.85, w: 2.35, h: 0.5,
      fontSize: 12.5, fontFace: FONT_TITLE, color: COLORS.darkText, bold: true,
    });
    s7.addText(`예산: ${b.cost}`, {
      x: x + 0.2, y: 3.45, w: 2.35, h: 0.3,
      fontSize: 11, fontFace: FONT_BODY, color: b.color, bold: true,
    });
    s7.addText(`타깃:\n${b.target}`, {
      x: x + 0.2, y: 3.85, w: 2.35, h: 0.6,
      fontSize: 9.5, fontFace: FONT_BODY, color: COLORS.slateText,
    });
    s7.addText(`노출:\n${b.imp}`, {
      x: x + 0.2, y: 4.55, w: 2.35, h: 0.5,
      fontSize: 9.5, fontFace: FONT_BODY, color: COLORS.slateText,
    });
    s7.addShape(pres.ShapeType.roundRect, {
      x: x + 0.2, y: 5.3, w: 2.35, h: 0.9,
      rectRadius: 0.1, fill: { color: COLORS.lightBeige },
    });
    s7.addText(`성과 목표:\n${b.conv}`, {
      x: x + 0.25, y: 5.3, w: 2.25, h: 0.9,
      fontSize: 10, fontFace: FONT_BODY, color: COLORS.burgundy, bold: true, align: 'center', valign: 'middle',
    });
  });
}

// SLIDE 8: 영상 제작 체크리스트 및 소통 채널
{
  const s8 = pres.addSlide();
  s8.background = { color: COLORS.bgLight };
  addSlideHeader(s8, '07. ACTION CHECKLIST', '비디오 홍보물 제작 체크리스트 & 공식 채널', '철저한 브랜드 규격 준수와 공식 채널 연계로 프리미엄 신뢰도를 완성합니다.');

  s8.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: 2.1, w: 5.65, h: 4.5,
    rectRadius: 0.15, fill: { color: COLORS.white }, line: { color: COLORS.borderBeige, width: 1 },
  });
  s8.addText('콘텐츠 제작 6대 필수 검수 원칙', {
    x: 1.1, y: 2.35, w: 5.05, h: 0.4,
    fontSize: 14, fontFace: FONT_TITLE, color: COLORS.burgundy, bold: true,
  });

  const checkItems = [
    '✓ 무료(Free) 단어 절대 배제 — 유료 프리미엄 솔루션 명시',
    '✓ 도서 DB는 반드시 ‘수프리마랩 도서 DB’로 정확히 표기 (알라딘 배제)',
    '✓ 대학 DB 규모 ‘164개 대학 26,295개 전형’ 공식 수치 준수',
    '✓ 2028 개편 5등급제 ⟷ 9등급제 자동 환산 기술력 강조',
    '✓ 1개 학기 단위 (~8월/~2월 종료) 잔여 개월수 공식 준수',
    '✓ 전사 공식 풋터 및 대치수프리마 대입전략연구소 브랜딩 탑재',
  ];
  s8.addText(checkItems.join('\n\n'), {
    x: 1.1, y: 2.9, w: 5.05, h: 3.4,
    fontSize: 10.5, fontFace: FONT_BODY, color: '334155', lineSpacingMultiple: 1.2,
  });

  // Right Box: Official Channels
  s8.addShape(pres.ShapeType.roundRect, {
    x: 6.883, y: 2.1, w: 5.65, h: 4.5,
    rectRadius: 0.15, fill: { color: COLORS.white }, line: { color: COLORS.borderBeige, width: 1 },
  });
  s8.addText('대치수프리마 공식 소통 채널 & 고객 지원', {
    x: 7.183, y: 2.35, w: 5.05, h: 0.4,
    fontSize: 14, fontFace: FONT_TITLE, color: COLORS.blueNavy, bold: true,
  });

  const channels = [
    '• 연구소 본원: 서울시 강남구 테헤란로 326 B1F',
    '  (대치수프리마 입시&코칭센터 · 대입전략연구소)',
    '• 대표 컨설턴트: 이기욱 대표컨설턴트',
    '• 네이버 밴드: band.us/@suprima (실시간 수시 분석)',
    '• 공식 블로그: blog.naver.com/gouniv_hifive (입시 칼럼)',
    '• 인스타그램: instagram.com/suprima_ipsicreator (숏폼 배포)',
    '• 서비스 사이트: 「나의 입시멘토」 & 「컨설턴트 앱」',
  ];
  s8.addText(channels.join('\n\n'), {
    x: 7.183, y: 2.9, w: 5.05, h: 3.4,
    fontSize: 10.5, fontFace: FONT_BODY, color: '334155', lineSpacingMultiple: 1.15,
  });
}

async function run() {
  const outDir = path.resolve('docs');
  const pptxFile = path.join(outDir, '대치수프리마_나의입시멘토_B2C_개인사용자_마케팅_및_비디오홍보_계획서.pptx');
  await pres.writeFile({ fileName: pptxFile });
  console.log(`Saved B2C marketing pptx: ${pptxFile}`);

  const guideDir = path.resolve('학원용앱/public/guides');
  if (fs.existsSync(guideDir)) {
    const copyTarget = path.join(guideDir, '대치수프리마_나의입시멘토_B2C_개인사용자_마케팅_및_비디오홍보_계획서.pptx');
    fs.copyFileSync(pptxFile, copyTarget);
    console.log(`Copied marketing pptx to ${copyTarget}`);
  }
}

run().catch(err => {
  console.error('Build PPTX failed:', err);
  process.exit(1);
});
