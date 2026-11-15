const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } = require('c:/Users/chris/Desktop/수프리마랩/학원용앱/node_modules/docx');
const XLSX = require('xlsx');

async function buildDocx() {
  const mdPath = path.join(__dirname, '../docs/대치수프리마_나의입시멘토_B2C_개인사용자_마케팅_및_비디오홍보_계획서.md');
  const mdContent = fs.readFileSync(mdPath, 'utf8');

  const children = [];

  // Title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 140 },
      children: [
        new TextRun({
          text: '대치 수프리마 「나의 입시멘토」 B2C 마케팅 및 비디오 홍보물 제작 전략서',
          bold: true,
          size: 32,
          color: '7A1212',
        }),
      ],
    })
  );

  // Subtitle
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 360 },
      children: [
        new TextRun({
          text: '대치수프리마 대입전략연구소 | 문서번호: SUPRIMA-MKT-B2C-2026-V1 | 대표: 이기욱 대표컨설턴트',
          size: 19,
          color: '666666',
        }),
      ],
    })
  );

  const lines = mdContent.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('---') || trimmed.startsWith('# 대치 수프리마')) continue;

    if (trimmed.startsWith('## ')) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 280, after: 120 },
          children: [
            new TextRun({
              text: trimmed.replace(/^##\s*/, ''),
              bold: true,
              size: 24,
              color: '7A1212',
            }),
          ],
        })
      );
    } else if (trimmed.startsWith('### ')) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({
              text: trimmed.replace(/^###\s*/, ''),
              bold: true,
              size: 21,
              color: '1E3A8A',
            }),
          ],
        })
      );
    } else if (trimmed.startsWith('#### ')) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 160, after: 80 },
          children: [
            new TextRun({
              text: trimmed.replace(/^####\s*/, ''),
              bold: true,
              size: 19,
              color: '111111',
            }),
          ],
        })
      );
    } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      const text = trimmed.replace(/^[*•-]\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1');
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: text,
              size: 18,
              color: '333333',
            }),
          ],
        })
      );
    } else if (!trimmed.startsWith('|') && !trimmed.startsWith('```')) {
      const cleanText = trimmed.replace(/\*\*(.*?)\*\*/g, '$1');
      children.push(
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: cleanText,
              size: 18,
              color: '333333',
            }),
          ],
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  const outPath = path.join(__dirname, '../docs/대치수프리마_나의입시멘토_B2C_개인사용자_마케팅_및_비디오홍보_계획서.docx');
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outPath, buffer);
  console.log(`Saved B2C marketing docx: ${outPath} (${buffer.length} bytes)`);

  const copyPath = path.join(__dirname, '../학원용앱/public/guides/대치수프리마_나의입시멘토_B2C_개인사용자_마케팅_및_비디오홍보_계획서.docx');
  fs.writeFileSync(copyPath, buffer);
  console.log(`Copied docx to ${copyPath}`);
}

function buildXlsx() {
  const wb = XLSX.utils.book_new();

  // Sheet 1: 마케팅 전략 & 퍼널
  const s1Data = [
    ['대치수프리마 「나의 입시멘토」 B2C 마케팅 전략 및 퍼널 구조표'],
    ['문서번호', 'SUPRIMA-MKT-B2C-2026-V1', '발행일', '2026-11-15', '책임자', '이기욱 대표컨설턴트'],
    [],
    ['퍼널 단계', '주요 목표', '핵심 타깃', '실행 채널', '제공 콘텐츠/오퍼', '전환 KPI'],
    ['1. Top of Funnel (인식/유입)', '브랜드 인지도 확산 및 잠재 고객 대량 유입', '고1~고3 학생 및 학부모', '유튜브 쇼츠, 인스타그램 릴스, 틱톡', '충격 팩트 숏폼 비디오 5편, 2028 개편 팁', '월 100만 회 도달, 웹 유입 50,000명'],
    ['2. Middle of Funnel (체험/신뢰)', '성적 환산 및 카카오 도서 DB 매칭 경험', '수시 학종/세특 막막한 학생', '나의 입시멘토 웹사이트', '2028 5/9등급 환산, 추천도서 3권/탐구가설 미리보기', '1단계 등록 전환율 25% 이상'],
    ['3. Bottom of Funnel (유료 전환)', '학기제 관리형 패키지 유료 결제', '중간/기말 직후 학부모/학생', '결제 랜딩페이지, 카카오 알림톡', '1개월 단기속성 / 3~4개월 학기집중 / 6개월 풀코스', '유료 가입 전환율 12% 이상'],
    ['4. Retention & Referral (추천)', '재등록 및 맘카페/친구 자발적 확산', '기존 유료 이용 학생/학부모', '공식 밴드, 학부모 리포트 공유', '친구 초대 양방향 할인, 최종 세특 리포트 PDF', '친구 추천 바이럴 계수 1.3 이상'],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(s1Data);
  XLSX.utils.book_append_sheet(wb, ws1, '마케팅_전략_퍼널');

  // Sheet 2: 숏폼 비디오 5편 콘티 & 스크립트
  const s2Data = [
    ['대치수프리마 「나의 입시멘토」 숏폼 비디오(쇼츠/릴스) 5편 제작 기획안'],
    [],
    ['비디오 편수', '타깃 페르소나', '러닝타임', '핵심 주제(Title)', '후킹 문구 (0~3초)', '핵심 솔루션 & CTA', '주요 화면 연출'],
    ['비디오 01 (학부모)', '고1·고2 학부모', '42초', '2028 내신 1등급 10%의 충격 진실', '내신 1등급 맞아도 인서울 불합격?', '164개 대학 컷오프 기반 세특 완성 / 프로필 링크 확인', '4% vs 10% 비교 그래픽 ➔ 나의 입시멘토 시연'],
    ['비디오 02 (학생)', '일반고/자사고 고1·고2', '35초', '세특 마감 D-3, 챗GPT 쓰지 마라', '세특 마감 3일 전인데 아직도 빈 화면?', '카카오 도서 DB 연계 3단계 완성형 문장 / 나의 입시멘토 검색', '머리 쥐어뜯는 학생 ➔ 챗GPT 위험 ➔ 3단계 문장 생성'],
    ['비디오 03 (기능시연)', '수시 지원 고민 학생', '30초', '나이스 PDF 넣었더니 내 대학 위치가 10초 만에 뜬다', '학생부 PDF 딱 넣었더니 무슨 일이 일어났을까?', '2028 5/9등급 변환 + 164개 대학 상향/적정/안정 판정', 'PDF 드래그앤드롭 ➔ 환산 게이지 ➔ 6개 대학 라인업'],
    ['비디오 04 (합격사례)', '내신 3~4등급대 역전 희망생', '45초', '내신 3.2등급 일반고, 독서 세특으로 한양대 합격 비결', '내신 3.2등급 일반고가 한양대 학종을 최초합한 비결?', '단순 나열 탈피, 필독서 기반 심화 가설 수립', '합격증 ➔ 뻔한 세특 vs 합격 세특 대조 ➔ 독서 매칭'],
    ['비디오 05 (전문가)', '고등학생 및 학부모 전원', '48초', '대치동 10년 차가 밝히는 입학사정관이 거르는 세특 3가지', '입학사정관이 3초 만에 넘기는 세특 3가지', '수업요약/단순검색/복붙 배제, 대치수프리마 4단계 솔루션', '이기욱 대표 프로필 ➔ 3대 금기 ➔ 4단계 정교한 시스템'],
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(s2Data);
  XLSX.utils.book_append_sheet(wb, ws2, '숏폼_비디오_콘티');

  // Sheet 3: 학사일정별 캠페인 캘린더
  const s3Data = [
    ['대치수프리마 「나의 입시멘토」 1개 학기 단위(~8월/~2월) 연계 캠페인 캘린더'],
    [],
    ['월별/시즌', '캠페인 명칭', '관리 기간 연계', '타깃 대상', '핵심 메시지', '주요 프로모션 & 콘텐츠'],
    ['3월~4월', '신학기 풀코스 킥오프', '3월 가입 ➔ 8월 종료 (6개월 풀코스)', '고1 신입생 & 고2', '신학기 첫 단추, 자·동·진·특 1학기 설계로 시작하라', '신학기 6개월 풀코스 케어 특별 등록'],
    ['5월~6월', '중간고사 만회 세특 집중', '5월 가입 ➔ 8월 종료 (3~4개월 집중)', '중간고사 후 성적 충격 학생', '내신 아쉬워도 포기 금지! 세특으로 학종 대역전', '기말 대비 집중 탐구 & 카카오 도서 매칭'],
    ['7월~8월', '1학기 나이스 마감 & 수시 파이널', '8월 가입 ➔ 즉시 종료 (1개월 속성)', '고3 수험생 & 전 학년', '나이스 마감 D-30 최종 검수 & 164개 대학 수시 확정', '1학기 생기부 최종 3단계 검수 & 수시 6장 라인업'],
    ['9월~10월', '2학기 가을학기 풀코스', '9월 가입 ➔ 2월 종료 (6개월 풀코스)', '2학기 반등 희망 고1·고2', '2학기 역전의 기회, 전공 맞춤 심화 독서로 완성하라', '2학기 6개월 풀코스 케어 패키지'],
    ['11월~12월', '학년말 기말고사 직후 파이널', '12월 가입 ➔ 2월 종료 (3개월 집중)', '학년말 생기부 마감 학생', '학년이 바뀌기 전 마지막 기회! 1년치 누락 활동 보완', '겨울방학 3개월 집중 세특 최종 보완'],
    ['1월~2월', '겨울방학 독서 심화 & 2028 대비', '차기 학년 선행 관리', '예비 고1·고2·고3', '다음 학년 1등급을 결정하는 겨울방학 독서 10선', '카카오 도서 DB 연계 탐구보고서 사전 완성'],
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(s3Data);
  XLSX.utils.book_append_sheet(wb, ws3, '학사일정별_캠페인');

  // Sheet 4: 채널별 예산 & KPI
  const s4Data = [
    ['대치수프리마 「나의 입시멘토」 월간 마케팅 예산 배분 및 KPI 산출표'],
    [],
    ['마케팅 채널', '월간 예산(원)', '예산 비중', '주요 타깃', '목표 도달수/노출', '예상 CPC/CPA', '목표 유료 전환수'],
    ['메타 광고 (릴스/피드)', '4,500,000', '45.0%', '학부모(35~54세) & 학생(16~19세)', '1,500,000회 노출', 'CPA 20,000원', '225명'],
    ['유튜브 쇼츠 & 디스플레이', '2,500,000', '25.0%', '입시 키워드 검색자 & 수험생', '1,000,000회 노출', 'CPA 25,000원', '100명'],
    ['네이버 브랜드/파워콘텐츠', '1,500,000', '15.0%', '의도 기반 고관여 검색자', '200,000회 노출', 'CPA 15,000원', '100명'],
    ['인플루언서 & 맘카페 바이럴', '1,500,000', '15.0%', '학부모 커뮤니티 & 수험생 카페', '300,000회 조회', 'CPA 18,000원', '83명'],
    ['합계 / 목표치', '10,000,000', '100.0%', '전체 잠재 고객', '3,000,000회 노출', '평균 CPA 19,685원', '월 508명 유료 가입'],
  ];
  const ws4 = XLSX.utils.aoa_to_sheet(s4Data);
  XLSX.utils.book_append_sheet(wb, ws4, '예산_배분_KPI');

  const xlsxPath = path.join(__dirname, '../docs/대치수프리마_나의입시멘토_B2C_개인사용자_마케팅_및_비디오홍보_계획서.xlsx');
  XLSX.writeFile(wb, xlsxPath);
  console.log(`Saved B2C marketing xlsx: ${xlsxPath}`);

  const copyXlsx = path.join(__dirname, '../학원용앱/public/guides/대치수프리마_나의입시멘토_B2C_개인사용자_마케팅_및_비디오홍보_계획서.xlsx');
  XLSX.writeFile(wb, copyXlsx);
  console.log(`Copied xlsx to ${copyXlsx}`);

  // Copy MD to public guides
  const mdSrc = path.join(__dirname, '../docs/대치수프리마_나의입시멘토_B2C_개인사용자_마케팅_및_비디오홍보_계획서.md');
  const mdCopy = path.join(__dirname, '../학원용앱/public/guides/대치수프리마_나의입시멘토_B2C_개인사용자_마케팅_및_비디오홍보_계획서.md');
  fs.copyFileSync(mdSrc, mdCopy);
  console.log(`Copied md to ${mdCopy}`);
}

async function main() {
  await buildDocx();
  buildXlsx();
}

main().catch(console.error);
