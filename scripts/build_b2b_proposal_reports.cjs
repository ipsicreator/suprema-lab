const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } = require('c:/Users/chris/Desktop/수프리마랩/학원용앱/node_modules/docx');
const XLSX = require('xlsx');

async function buildDocx() {
  const mdPath = path.join(__dirname, '../docs/대치수프리마_나의입시멘토_컨설턴트앱_B2B_제안서.md');
  const mdContent = fs.readFileSync(mdPath, 'utf8');

  const children = [];

  // Title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 140 },
      children: [
        new TextRun({
          text: '[대치수프리마] 「나의 입시멘토 + 컨설턴트 앱」 학원 전용 B2B 제안서',
          bold: true,
          size: 34,
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
          text: '대치수프리마 대입전략연구소 | 문서번호: SUPRIMA-B2B-PROPOSAL-2026-01 (대표: 이기욱 대표컨설턴트)',
          size: 19,
          color: '666666',
        }),
      ],
    })
  );

  const lines = mdContent.split('\n');
  let inTable = false;
  let tableRows = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('---') || trimmed.startsWith('# [대치수프리마]')) continue;

    // Handle Markdown Tables
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (trimmed.includes('---')) continue;
      const rawCols = trimmed.split('|').slice(1, -1).map(c => c.trim().replace(/<br>/g, '\n').replace(/&nbsp;/g, ' ').replace(/\*\*/g, ''));
      const isHeader = !inTable;
      inTable = true;

      const cells = rawCols.map((colText, idx) => {
        const textRuns = colText.split('\n').map(p => new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: p.trim(),
              bold: isHeader,
              size: isHeader ? 19 : 18,
              color: isHeader ? 'FFFFFF' : '333333',
            })
          ]
        }));

        return new TableCell({
          width: {
            size: idx === 0 ? 2500 : idx === 1 ? 4000 : idx === 2 ? 4500 : 2500,
            type: WidthType.DXA,
          },
          shading: {
            fill: isHeader ? '7A1212' : (tableRows.length % 2 === 1 ? 'F8FAFC' : 'FFFFFF'),
          },
          margins: { top: 120, bottom: 120, left: 140, right: 140 },
          children: textRuns,
        });
      });

      tableRows.push(new TableRow({ children: cells }));
      continue;
    } else if (inTable) {
      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
            left: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
            right: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: 'E2E8F0' },
            insideVertical: { style: BorderStyle.SINGLE, size: 2, color: 'E2E8F0' },
          },
          rows: tableRows,
        })
      );
      children.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
      inTable = false;
      tableRows = [];
    }

    if (trimmed.startsWith('## ')) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 120 },
          children: [
            new TextRun({
              text: trimmed.replace('## ', ''),
              bold: true,
              size: 26,
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
              text: trimmed.replace('### ', ''),
              bold: true,
              size: 22,
              color: '1A0F08',
            }),
          ],
        })
      );
    } else if (trimmed.startsWith('> ')) {
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 120 },
          children: [
            new TextRun({
              text: trimmed.replace('> ', '').replace(/\*\*/g, ''),
              bold: true,
              size: 19,
              color: '7A1212',
            }),
          ],
        })
      );
    } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: trimmed.replace(/^[\*\-]\s+/, '').replace(/\*\*/g, ''),
              size: 19,
              color: '333333',
            }),
          ],
        })
      );
    } else {
      children.push(
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({
              text: trimmed.replace(/\*\*/g, ''),
              size: 19,
              color: '222222',
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

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, '../docs/대치수프리마_나의입시멘토_컨설턴트앱_B2B_제안서.docx');
  fs.writeFileSync(outPath, buffer);
  console.log(`Saved B2B proposal docx: ${outPath} (${buffer.length} bytes)`);

  const publicOut = path.join(__dirname, '../학원용앱/public/guides/대치수프리마_나의입시멘토_컨설턴트앱_B2B_제안서.docx');
  fs.writeFileSync(publicOut, buffer);
  const rootPublicOut = path.join(__dirname, '../public/guides/대치수프리마_나의입시멘토_컨설턴트앱_B2B_제안서.docx');
  fs.writeFileSync(rootPublicOut, buffer);
}

function buildXlsx() {
  const wb = XLSX.utils.book_new();

  // Sheet 0: 단계별 세부 매칭 방식 (Core Engine)
  const s0Data = [
    {
      "단계": "STEP 1. 키워드 추출",
      "핵심 메커니즘": "학생 관심사/진로/전공 적합 키워드 정밀 분석 및 추출",
      "세부 실행 내용": "• 학생 생활기록부, 창체활동, 희망 진로(예: 의학, 인공지능, 경제) 분석\n• 단순 흥미를 넘어 학문적 탐구 가치가 있는 핵심 키워드 군집 도출",
      "실증 예시 (국어과)": "키워드: 매체 언어, 생성형 AI, 알고리즘 편향",
      "실증 예시 (수학과)": "키워드: 베이즈 정리, 사전/사후 확률, 신속 진단 키트",
      "실증 예시 (생명과학과)": "키워드: CRISPR 유전자 가위, Cas9, 오프타깃(Off-target)"
    },
    {
      "단계": "STEP 2. 과목 & 6단계 심화 사다리",
      "핵심 메커니즘": "교과목 매핑 및 6단계 학문 심화 수준 설정",
      "세부 실행 내용": "• [1단계 기초] 교과서 기본 원리 이해\n• [2단계 개념 확장] 교과 외 심화 개념 연계\n• [3단계 심화 적용] 실생활 및 사회 문제 적용\n• [4단계 융합 탐구] 타 교과와의 다학제 융합\n• [5단계 연구 검증] 가설 수립 및 실험·통계 검증\n• [6단계 도구화] 실제 논문 분석 및 프로토타입 구현",
      "실증 예시 (국어과)": "과목: 화법과 작문 (4단계: 언어 윤리 + AI 공학 융합)",
      "실증 예시 (수학과)": "과목: 확률과 통계 (5단계: 베이즈 정리 기반 조건부 확률 정밀 연구)",
      "실증 예시 (생명과학과)": "과목: 생명과학Ⅱ (6단계: 유전자 편집 도구와 분자의학 최신 논문 검증)"
    },
    {
      "단계": "STEP 3. 연구 가설 도출",
      "핵심 메커니즘": "교과 개념 기반의 반증 가능하고 구체적인 연구 가설 수립",
      "세부 실행 내용": "• 단순 사실 나열이나 검색성 조사를 탈피\n• 'A 변인이 B에 미치는 영향', 'C 한계점을 극복하기 위한 D 모델의 유효성' 등 학생부종합전형 평가관이 가장 선호하는 학문적 질문 구성",
      "실증 예시 (국어과)": "가설: 생성형 AI 요약 모델의 학습 말뭉치 편향이 저널리즘 객관성 서술에 미치는 영향 분석",
      "실증 예시 (수학과)": "가설: 희귀 질환 유병률 변화 시 베이즈 정리를 적용한 진단 검사 양성 예측도(PPV)의 변동성 모델링",
      "실증 예시 (생명과학과)": "가설: CRISPR-Cas9 복합체의 가이드 RNA 길이 조절이 비표적 절단(Off-target effect) 빈도 감소에 미치는 상관관계 규명"
    },
    {
      "단계": "STEP 4. 카카오 도서 DB & 나이스 세특",
      "핵심 메커니즘": "카카오 도서 DB 정식 연계 + 제미나이 AI 기반 나이스 3단계 완성형 세특 완결",
      "세부 실행 내용": "• 연구 가설을 입증할 수 있는 공신력 있는 단행본을 카카오 도서 검색 API로 실시간 추천\n• 책의 핵심 이론을 학생의 탐구 활동과 결합하여 교육부 NEIS 기재 규정에 부합하는 3단계(동기 ➔ 탐구과정 ➔ 변화성장) 완성형 문장 도출",
      "실증 예시 (국어과)": "연계 도서: 『알고리즘의 편향성』\n세특 문장: 매체 언어 속 AI 기술의 윤리적 쟁점에 주목하여... 저널리즘 신뢰도 지표를 제안함.",
      "실증 예시 (수학과)": "연계 도서: 『신은 주사위 놀이를 하지 않는다』\n세특 문장: 조건부 확률의 의료 통계 적용에 호기심을 갖고... 질병 관리 정책의 수학적 근거를 도출함.",
      "실증 예시 (생명과학과)": "연계 도서: 『크리스퍼가 온다』\n세특 문장: 분자생물학 단원에서 유전자 교정 기술의 한계를 탐구하고자... 공학적 해결 방안을 심도 있게 제시함."
    }
  ];
  const ws0 = XLSX.utils.json_to_sheet(s0Data);
  ws0['!cols'] = [{ wch: 28 }, { wch: 38 }, { wch: 60 }, { wch: 45 }, { wch: 45 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(wb, ws0, '단계별 세부 매칭 방식');

  // Sheet 0-2: 3대 주체 그레이트 베네핏 (Great Benefits)
  const sBenefitsData = [
    {
      "수혜 주체": "01. 학생 (Student)",
      "핵심 베네핏": "수행평가 막막함 0 & 즉각 탐구 아이디어",
      "상세 내용": "학기 중 쏟아지는 학교 수행평가 주제를 기입하는 즉시 전공 맞춤 카카오 도서와 3단계 탐구 아이디어가 도출되어 과제 스트레스가 완벽히 사라집니다.",
      "측정 가능 지표": "수행평가 소요 시간 70% 단축"
    },
    {
      "수혜 주체": "01. 학생 (Student)",
      "핵심 베네핏": "자기주도형 탐구·학습 습관 완성",
      "상세 내용": "월간 퀘스트(1순위 학생 주도 등록) 시스템을 통해 시험범위, 자기평가서, 탐구 마감일을 주도적으로 관리하며 자기주도역량이 비약적으로 상승합니다.",
      "측정 가능 지표": "월간 미션 완수율 95% 이상"
    },
    {
      "수혜 주체": "01. 학생 (Student)",
      "핵심 베네핏": "나이스 3단계 완성형 세특 소장",
      "상세 내용": "단순한 활동 나열이 아닌 '동기 ➔ 탐구과정 ➔ 변화성장'의 나이스 공식 기재 규격 문장을 확보하여 학기말 자기평가서 제출 시 압도적 우위를 점합니다.",
      "측정 가능 지표": "학종 서류 평가 최고 등급 획득"
    },
    {
      "수혜 주체": "01. 학생 (Student)",
      "핵심 베네핏": "전국 164개 대학 실시간 합격선 확인",
      "상세 내용": "26,295개 수시 전형 컷오프 기반 실시간 모의 지원선을 확인함으로써 막연한 불안감 없이 목표 대학을 향한 명확한 로드맵을 확립합니다.",
      "측정 가능 지표": "수시 6개 카드 최적 합격률 달성"
    },
    {
      "수혜 주체": "02. 학원 (Academy)",
      "핵심 베네핏": "재원생 이탈 0% 락인 (Retention)",
      "상세 내용": "매월 말 정기 발송되는 품격 있는 대치수프리마 월간 활동 보고서로 학부모 만족도를 극대화하여, 시험 직후 학생 이탈을 원천 차단합니다.",
      "측정 가능 지표": "재원생 유지율(Retention) 98% 돌파"
    },
    {
      "수혜 주체": "02. 학원 (Academy)",
      "핵심 베네핏": "신규 원생 유치 설명회 킬러 무기",
      "상세 내용": "2028 개편 5등급제 환산 및 164개 대학 정밀 진단 시스템을 간판 무기로 학부모 설명회를 개최하여 신규 상담 등록 전환율을 극대화합니다.",
      "측정 가능 지표": "설명회 신규 등록 전환율 300% 급증"
    },
    {
      "수혜 주체": "02. 학원 (Academy)",
      "핵심 베네핏": "강사진 피로도 90% 이상 절감",
      "상세 내용": "세특 작성, 도서 검색, 월간 보고서 작성을 [Auto-Fill]과 시스템이 10초 만에 처리하므로, 강사는 본연의 수업과 성적 향상에만 100% 집중할 수 있습니다.",
      "측정 가능 지표": "컨설팅 문서 행정 시간 90% 감소"
    },
    {
      "수혜 주체": "02. 학원 (Academy)",
      "핵심 베네핏": "학원 브랜드 가치 프리미엄 격상",
      "상세 내용": "단순 교과 보습학원을 넘어 '학생부종합전형·수행평가까지 완벽 케어하는 대치동 직영급 명문 입시 코칭 센터'로 원 브랜드 위상이 도약합니다.",
      "측정 가능 지표": "원비 객단가 및 프리미엄 라인업 확대"
    },
    {
      "수혜 주체": "03. 학부모 (Parents)",
      "핵심 베네핏": "월간 활동 보고서로 완벽한 안심",
      "상세 내용": "학원에서 자녀가 어떤 퀘스트를 수행하고 어떤 책을 읽고 세특을 준비했는지 A4 프리미엄 보고서와 이메일로 매월 투명하게 확인합니다.",
      "측정 가능 지표": "학원 신뢰도 및 소통 만족도 100%"
    },
    {
      "수혜 주체": "03. 학부모 (Parents)",
      "핵심 베네핏": "가정 내 감정 소모·잔소리 종식",
      "상세 내용": "'수행평가 언제 하니?', '독후감 썼니?' 등 부모-자녀 간 갈등을 시스템의 스마트 D-Day 자동 넛지와 학원 전문 컨설턴트가 전담 해결합니다.",
      "측정 가능 지표": "가정 내 입시 스트레스 대폭 감소"
    },
    {
      "수혜 주체": "03. 학부모 (Parents)",
      "핵심 베네핏": "수백만 원대 고액 컨설팅 사교육비 절감",
      "상세 내용": "대치동 1회 수십~수백만 원을 호가하는 1:1 학생부 컨설팅과 도서 세특 코칭을 학원 정규 프로그램 안에서 상시 제공받음으로써 가계 교육비를 획기적으로 절감합니다.",
      "측정 가능 지표": "연간 사교육비 수백만 원 절감 효과"
    },
    {
      "수혜 주체": "03. 학부모 (Parents)",
      "핵심 베네핏": "2028 입시 개편 불안감 완전 해소",
      "상세 내용": "내신 5등급제 개편과 고교학점제 시행으로 인한 대입 혼란 속에서, 정확한 5등급 ⟷ 9등급 환산과 164개 대학 입결 데이터로 정확한 길을 제시받습니다.",
      "측정 가능 지표": "입시 정보 비대칭 해소 및 안도감 부여"
    }
  ];
  const wsBenefits = XLSX.utils.json_to_sheet(sBenefitsData);
  wsBenefits['!cols'] = [{ wch: 25 }, { wch: 35 }, { wch: 75 }, { wch: 32 }];
  XLSX.utils.book_append_sheet(wb, wsBenefits, '3대 주체 그레이트 베네핏');

  // Sheet 0-3: 학생 주도 퀘스트 & 넛지 시스템
  const sQuestData = [
    {
      "구분": "01. 등록 주체 원칙",
      "운영 메커니즘": "1순위 학생 주도 등록 ➔ 2순위 컨설턴트 보완 등록",
      "세부 기능": "• 학생이 본인의 시험범위, 자기평가서 마감일, 학교 수행평가 과제를 직접 입력\n• 학생이 미등록하거나 입력이 지연될 경우 컨설턴트가 확인 후 [+ 퀘스트 보완 등록]으로 백업",
      "도입 효과": "학생의 자기주도권 보장 및 컨설턴트의 불필요한 개입 최소화"
    },
    {
      "구분": "02. 실시간 D-Day & 자동 넛지",
      "운영 메커니즘": "실시간 마감일 추적 & 미완료 자동 독려(Nudge) 엔진",
      "세부 기능": "• D-Day 실시간 계산 (D-5, D-Day 오늘, 지연 경고 배지)\n• [🔔 미완료 넛지 전송] 원클릭으로 마감 임박 학생에게 정중하고 강력한 리마인더 발송",
      "도입 효과": "컨설턴트가 일일이 전화·문자로 재촉하던 단순 관리 잔무를 시스템이 100% 자동화"
    },
    {
      "구분": "03. 1초 원클릭 매칭 브릿지",
      "운영 메커니즘": "퀘스트 카드에서 [⚡ 탐구·도서 매칭] 1클릭 전환",
      "세부 기능": "• 퀘스트 클릭 시 즉시 [3. 탐구·세특 추천] 탭으로 자동 이동\n• 해당 과목명 및 과제명이 AI 프롬프트에 자동 주입되어 10초 만에 카카오 도서 세특 도출",
      "도입 효과": "컨설턴트는 단순 일정 체크가 아닌 오직 탐구주제·보고서·도서 피드백에만 몰입"
    },
    {
      "구분": "04. 월간 리포트 자동 집계",
      "운영 메커니즘": "퀘스트 완수율(%) 및 수행평가 실적 [⚡ Auto-Fill] 연동",
      "세부 기능": "• 한 달간 학생이 완수한 퀘스트 목록, 수행평가 실적, 독서 현황을 1클릭으로 취합\n• A4 프리미엄 월간 활동 보고서 자동 생성 및 학부모 즉시 메일링",
      "도입 효과": "월말 행정 소요 시간 90% 단축 및 학부모 신뢰도 극대화"
    }
  ];
  const wsQuest = XLSX.utils.json_to_sheet(sQuestData);
  wsQuest['!cols'] = [{ wch: 25 }, { wch: 40 }, { wch: 70 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, wsQuest, '월간 퀘스트 & 자동 넛지');

  // Sheet 1: 2-Track 맞춤 모델
  const s1Data = [
    {
      "구분": "[Track A] 학원에 입시 담당자가 있는 경우",
      "운영 모델": "시스템 라이선스 + 정기 교육형",
      "대상 학원": "입시 상담실장, 부원장, 생기부 전담 강사가 상주하는 학원",
      "제공 서비스": "• 컨설턴트 앱 마스터/서브 계정 부여\n• 주차별 플래너, 시기별 시험기간 D-Day 설정, 수행평가 연계 기능 전면 개방\n• 월간 활동 보고서 자동 생성(Auto-Fill) 및 학부모 이메일 직발송 엔진 제공\n• 월 1회 최신 수시 전형 및 컷오프 변동 브리핑\n• 분기별 2028 개편 및 고교학점제 세특 지도법 워크숍\n• 카카오 도서 DB 기반 탐구 가이드북 및 설명회 PPT 템플릿 제공",
      "학원 이점": "원내 자체 입시 컨설턴트 역량 내재화, 매월 학부모 보고서 발송으로 원생 이탈 0% 달성, 선생님 업무 90% 절감",
      "비용": "상호 협의 (원생 규모 및 계정 수 연동)"
    },
    {
      "구분": "[Track B] 학원에 입시 담당자가 없는 경우",
      "운영 모델": "올인원 실전 업무대행 풀패키지형",
      "대상 학원": "1인 원장 체제, 과목 강사 중심, 입시 전담 인력이 전무한 학원",
      "제공 서비스": "• 대치수프리마 전문 연구원이 실제 학원 입시 연구소로 100% 업무 대행\n• 학생부 등록 및 암호화 코드 연동 전담\n• 주차별 학습 플래너 및 시기별 시험 D-Day 집중 케어\n• 학교 수행평가 주제 첨삭 및 카카오 도서 DB 연계 1-Click 배정 대행\n• 나이스 기재용 3단계 완성형 세특 검수 및 최종 리포트 학원 로고로 발행\n• 매월 학부모 발송용 월간 활동 보고서 작성, A4 출력본 전달 및 학부모 이메일 직발송 대행\n• 학부모 입시 질의 시 전문 스크립트 서면 지원",
      "학원 이점": "추가 인건비 부담 없이 원내 대치동 입시 연구소 즉시 보유, 원장님은 영업/수업에만 집중",
      "비용": "상호 협의 (원생 규모 및 관리 학생 수 연동)"
    }
  ];
  const ws1 = XLSX.utils.json_to_sheet(s1Data);
  ws1['!cols'] = [{ wch: 32 }, { wch: 28 }, { wch: 35 }, { wch: 65 }, { wch: 55 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, ws1, '2-Track 운영 모델');

  // Sheet 2: 프로그램 특장점 및 도입 효과
  const s2Data = [
    { "분류": "7대 핵심 특장점", "항목": "164개 대학 입결 DB", "상세 내용": "26,295개 수시 전형 최신 입결 컷오프 기반 실시간 6개 대학 모의 합불 산출" },
    { "분류": "7대 핵심 특장점", "항목": "2028 개편안 완벽 대응", "상세 내용": "5등급제 ⟷ 9등급제 실시간 양방향 자동 환산 및 이수 과목 적합도 정밀 분석" },
    { "분류": "7대 핵심 특장점", "항목": "독서 필수 연계 세특", "상세 내용": "카카오 도서 DB 공식 연계 + 제미나이 AI 기반 나이스 기재용 3단계 완성형 세특 도출" },
    { "분류": "7대 핵심 특장점", "항목": "1초 코드 동기화", "상세 내용": "학생 계정 암호화 코드를 컨설턴트 앱에 1초 연동, 1-Click 사회/과학 AI 탐구 배정" },
    { "분류": "7대 핵심 특장점", "항목": "주차별 플래너 & 시험 D-Day", "상세 내용": "시기별 시험기간(중간/기말/모평/수능) D-Day 실시간 카운트다운 배너 및 주차별 완수율 추적" },
    { "분류": "7대 핵심 특장점", "항목": "학교 수행평가 연계 탐구", "상세 내용": "NEIS 세특의 핵심 근거인 학교 수행평가 주제를 기입하고 카카오 도서 연계 3단계 세특 초안 완성" },
    { "분류": "7대 핵심 특장점", "항목": "월간 활동 보고서 & 메일링", "상세 내용": "한 달간의 실행 데이터를 [Auto-Fill] 1클릭으로 집계, A4 원클릭 인쇄 및 학부모 이메일 직발송" },
    { "분류": "학원 도입 5대 효과", "항목": "재원생 이탈 0% 달성", "상세 내용": "매월 정기 발송되는 고품격 학부모 월간 활동 보고서로 신뢰도 및 수강 유지율(Retention) 극대화" },
    { "분류": "학원 도입 5대 효과", "항목": "원생 모집 무기 확보", "상세 내용": "대치동 공신력 기반 학생부 정밀 진단 설명회 개최로 신규 등록 전환율 300% 증대" },
    { "분류": "학원 도입 5대 효과", "항목": "선생님 피로도 90% 절감", "상세 내용": "도서 탐색, 세특 첨삭, 월간 보고서 작성 시간 10초로 단축, 본 수업과 학생 관리에만 집중" },
    { "분류": "학원 도입 5대 효과", "항목": "수행평가 시즌 완벽 방어", "상세 내용": "학교 수행평가 과제 맞춤 도서 및 나이스 세특 초안을 즉각 지원하여 학생 만족도 극대화" },
    { "분류": "학원 도입 5대 효과", "항목": "학원 브랜드 가치 격상", "상세 내용": "단순 점수 보습학원에서 학생부종합전형까지 케어하는 프리미엄 입시 명문으로 전환" }
  ];
  const ws2 = XLSX.utils.json_to_sheet(s2Data);
  ws2['!cols'] = [{ wch: 20 }, { wch: 25 }, { wch: 75 }];
  XLSX.utils.book_append_sheet(wb, ws2, '특장점 및 도입 효과');

  // Sheet 3: 학기제 기반 관리 기간 모델 (종료 시점 - 가입 시점 = 잔여 개월 수)
  const s3Data = [
    {
      "관리 과정": "학기 정규 풀케어 (6개월 과정)",
      "기간 산정 공식": "학기 종료 시점(~8월 또는 ~2월) - 가입 시점",
      "가입 시점 예시": "• 1학기: 3월 가입 ➔ 8월 종료 (6개월 풀코스)\n• 2학기: 9월 가입 ➔ 2월 종료 (6개월 풀코스)",
      "주요 케어 내용": "학기 전 과정 교과 성적 추이 심층 분석, 주차별 밀착 플래너 관리 및 시험기간 D-Day 코칭, 학교 수행평가 첨삭 및 카카오 도서 매칭, 생기부 전 영역 밀착 코칭",
      "제공 결과물": "매월 대치수프리마 월간 활동 보고서 (A4 인쇄 & 학부모 이메일 발송), 학기별 교과 세특 완성 포트폴리오, 독서 기록장, 학기 종합 리포트"
    },
    {
      "관리 과정": "학기 집중 케어 (3~4개월 과정) ★ 추천",
      "기간 산정 공식": "학기 종료 시점(~8월 또는 ~2월) - 가입 시점",
      "가입 시점 예시": "• 1학기: 5월 가입 ➔ 8월 종료 (3~4개월 기말/여름집중)\n• 2학기: 12월 가입 ➔ 2월 종료 (3개월 겨울방학/학년말집중)",
      "주요 케어 내용": "중간·기말고사 직후 집중 탐구활동 설계 및 도서 연계, 시기별 시험기간 D-Day 집중 대비, 학교 수행평가 집중 연계 세특 문장 완성, 나이스 마감 대비 3단계 세특 문장 감수",
      "제공 결과물": "매월 대치수프리마 월간 활동 보고서 (A4 인쇄 & 학부모 이메일 발송), 집중 세특 완성본 (A4), 방학 과제 연계 탐구보고서"
    },
    {
      "관리 과정": "단기 속성 진단 (1개월 과정)",
      "기간 산정 공식": "수시 원서 직전 단기 집중 (8~9월)",
      "가입 시점 예시": "수시 원서 접수 직전 수험생 또는 신규 유입 원생 입학 진단용",
      "주요 케어 내용": "2028 개편 5등급 환산 정밀 진단, 164개 대학 26,295개 전형 실시간 모의 컷오프 분석, 수시 6개 대학 최적 라인업 확정",
      "제공 결과물": "수시 6개 대학 파이널 지원 전략서 (A4), 입학 진단 종합 평가표"
    }
  ];
  const ws3 = XLSX.utils.json_to_sheet(s3Data);
  ws3['!cols'] = [{ wch: 28 }, { wch: 35 }, { wch: 45 }, { wch: 65 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, ws3, '학기제 관리 기간 모델');

  // Sheet 4: 4단계 완결형 실행 사이클
  const s4Data = [
    {
      "단계": "STEP 01",
      "프로세스명": "학생부·성적 정밀 진단",
      "실행 내용": "나이스 간편인증 또는 정부24 PDF 업로드, 2028 개편 5등급제 ⟷ 9등급제 자동 환산, 164개 대학 26,295개 전형 최적 지원선 산출",
      "산출물": "정밀 진단 종합 분석표 (A4)"
    },
    {
      "단계": "STEP 02",
      "프로세스명": "주차별 밀착 플래너 & 시험 D-Day",
      "실행 내용": "시기별 시험기간(중간/기말/모평/수능) D-Day 실시간 카운트다운 배너 설정, 주차별 실천 과제 부여 및 완료율(%) 실시간 추적",
      "산출물": "주차별 학습 플래너 관리대장"
    },
    {
      "단계": "STEP 03",
      "프로세스명": "카카오 도서 세특 & 수행평가 연계",
      "실행 내용": "학교 수행평가 과제 내용 다이렉트 기입, 희망 전공 맞춤 카카오 도서 DB 연계 도서 매칭, NEIS 기재 규정에 맞춘 3단계 완성형 세특 초안 생성",
      "산출물": "과목별 세특 및 독서 탐구 카드"
    },
    {
      "단계": "STEP 04",
      "프로세스명": "월간 활동 보고서 Auto-Fill & 메일링",
      "실행 내용": "[⚡ 실행 항목 데이터 자동 집계 및 반영 (Auto-Fill)] 클릭으로 한 달간 실적 즉시 취합, A4 원클릭 인쇄 및 공식 이메일 엔진을 통한 학부모 직발송",
      "산출물": "대치수프리마 월간 학생 활동 보고서 (A4/HTML)"
    }
  ];
  const ws4 = XLSX.utils.json_to_sheet(s4Data);
  ws4['!cols'] = [{ wch: 15 }, { wch: 30 }, { wch: 70 }, { wch: 35 }];
  XLSX.utils.book_append_sheet(wb, ws4, '4단계 실행 사이클');

  const outXlsx = path.join(__dirname, '../docs/대치수프리마_나의입시멘토_컨설턴트앱_B2B_제안서.xlsx');
  XLSX.writeFile(wb, outXlsx);
  console.log(`Saved B2B proposal xlsx: ${outXlsx}`);

  const publicXlsx = path.join(__dirname, '../학원용앱/public/guides/대치수프리마_나의입시멘토_컨설턴트앱_B2B_제안서.xlsx');
  XLSX.writeFile(wb, publicXlsx);
  const rootPublicXlsx = path.join(__dirname, '../public/guides/대치수프리마_나의입시멘토_컨설턴트앱_B2B_제안서.xlsx');
  XLSX.writeFile(wb, rootPublicXlsx);
}

async function main() {
  await buildDocx();
  buildXlsx();

  // Also copy markdown
  const mdSrc = path.join(__dirname, '../docs/대치수프리마_나의입시멘토_컨설턴트앱_B2B_제안서.md');
  const mdDest = path.join(__dirname, '../학원용앱/public/guides/대치수프리마_나의입시멘토_컨설턴트앱_B2B_제안서.md');
  fs.copyFileSync(mdSrc, mdDest);
  const rootMdDest = path.join(__dirname, '../public/guides/대치수프리마_나의입시멘토_컨설턴트앱_B2B_제안서.md');
  fs.copyFileSync(mdSrc, rootMdDest);
  console.log(`Copied proposal md to ${mdDest} and ${rootMdDest}`);
}

main().catch(console.error);
