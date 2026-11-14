import zipfile
import os

doc_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="44"/><w:color w:val="8B1A1A"/></w:rPr>
        <w:t>대치수프리마 「나의 입시멘토」 진단 플로우 전면 개편 보고서</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r>
        <w:rPr><w:color w:val="666666"/><w:sz w:val="22"/></w:rPr>
        <w:t>작성일자: 2026년 11월 14일 | 시스템: 대치 수프리마 대입 심층 진단 플랫폼 (수프리마랩)</w:t>
      </w:r>
    </w:p>
    <w:p/>
    <w:p>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="30"/><w:color w:val="1A0F08"/></w:rPr>
        <w:t>1. 개요 및 변경 목적</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:rPr><w:sz w:val="22"/></w:rPr>
        <w:t>본 문서는 2026년 11월 14일 진행된 대치수프리마 「나의 입시멘토」 서비스의 진단 전체 플로우(Step 1 ~ Step 4 및 최종 결과보고서)에 대한 화면 디자인 정돈, 사용자 경험(UX) 개선, 대입 입결 데이터 갱신 및 교육부 컴플라이언스 준수 작업의 전체 변경 내역을 기록한 보고서입니다.</w:t>
      </w:r>
    </w:p>
    <w:p/>
    <w:p>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="30"/><w:color w:val="1A0F08"/></w:rPr>
        <w:t>2. 주요 개편 핵심 내용</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="8B1A1A"/></w:rPr>
        <w:t>가. 공식 브랜드 CI 확립 및 '나의 입시멘토' 서비스명 강조</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r><w:rPr><w:sz w:val="22"/></w:rPr><w:t>- 대치 수프리마 공식 CI 로고(suprema-official-logo.png)로 일원화 적용</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:rPr><w:sz w:val="22"/></w:rPr><w:t>- 헤더 중앙에 공식 서비스 명칭인 '나의 입시멘토'를 19px 볼드 버건디 타이포그래피와 공식 뱃지로 최우선 강조 배치</w:t></w:r>
    </w:p>
    <w:p/>
    <w:p>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="8B1A1A"/></w:rPr>
        <w:t>나. 학생부 등록 및 발급 간편인증 전용 팝업 분리</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r><w:rPr><w:sz w:val="22"/></w:rPr><w:t>- 화면 앞단에 나열되어 시각적 피로감을 주던 본인인증 라디오버튼/통신사버튼을 메인 화면에서 전면 제거</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:rPr><w:sz w:val="22"/></w:rPr><w:t>- 사전 안내 멘트와 함께 [⚡ 나이스 학생부 발급 연동] 및 [📄 PDF 파일 직접 등록] 직관적 2대 카드 제공</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:rPr><w:sz w:val="22"/></w:rPr><w:t>- 연동 버튼 클릭 시 전용 본인인증 모달 팝업이 실행되어 카카오/PASS/토스/네이버로 10초 만에 안전하게 자동 발급 및 18개 과목 성적·세특 자동 반영</w:t></w:r>
    </w:p>
    <w:p/>
    <w:p>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="8B1A1A"/></w:rPr>
        <w:t>다. 하단 중앙 CTA 버튼 및 교육부 지침 준수 공지 단독 배치</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r><w:rPr><w:sz w:val="22"/></w:rPr><w:t>- 우측으로 치우쳐 있던 [학생부 분석 시작 →] 버튼을 화면 정중앙으로 완벽 센터링</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:rPr><w:sz w:val="22"/></w:rPr><w:t>- 하단 풋터에 교육부의 학생부 수집/활용 금지 조치 준수 공지를 단독 노출 (글자 끊김 방지 keep-all 적용)</w:t></w:r>
    </w:p>
    <w:p/>
    <w:p>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="8B1A1A"/></w:rPr>
        <w:t>라. 1~4단계 전체 플로우 통일 및 이메일 발송 연동</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r><w:rPr><w:sz w:val="22"/></w:rPr><w:t>- Step 1부터 Step 4까지 FlowShell 래핑을 통일하여 일체형 진행 바와 헤더 통일성 확보</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:rPr><w:sz w:val="22"/></w:rPr><w:t>- Step 4 및 결과보고서 화면에 [✉️ 개인 메일로 보내기] 기능 신설 및 /api/send-email 실시간 전송 구현</w:t></w:r>
    </w:p>
    <w:p/>
    <w:p>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="30"/><w:color w:val="1A0F08"/></w:rPr>
        <w:t>3. 입결 데이터 최신화 및 컴파일</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r><w:rPr><w:sz w:val="22"/></w:rPr><w:t>- 전국 164개 대학교, 26,295개 수시 전형 및 2026학년도 최신 컷 데이터를 data/admission/admissionData.json에 정밀 번들링 완료</w:t></w:r>
    </w:p>
    <w:p/>
    <w:p>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="30"/><w:color w:val="1A0F08"/></w:rPr>
        <w:t>4. 5등급제(2028 개편) ➔ 9등급제(기존 입결) 정밀 환산 체계</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r><w:rPr><w:sz w:val="22"/></w:rPr><w:t>- 현재 3개년(2024~2026) 수시 입결 데이터는 9등급제 기준이며, 2028 개편안 대상 학생은 5등급제입니다.</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:rPr><w:sz w:val="22"/></w:rPr><w:t>- 누적 백분위 기준 정밀 환산 공식(5등급제 1등급 상위 10% ➔ 9등급제 1.83등급 등)을 진단 엔진 및 UI에 탑재했습니다.</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:rPr><w:sz w:val="22"/></w:rPr><w:t>- Step 1 입력창 하단 실시간 환산 배지, Step 4 진단 요약, 최종 결과보고서에 5등급제 원성적과 9등급 환산값을 명확히 병기하도록 개선했습니다.</w:t></w:r>
    </w:p>
    <w:p/>
    <w:p>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="30"/><w:color w:val="1A0F08"/></w:rPr>
        <w:t>5. 무결성 검증 결과</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r><w:rPr><w:sz w:val="22"/></w:rPr><w:t>- TypeScript 정적 타입 검증: 통과 (오류 0건)</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:rPr><w:sz w:val="22"/></w:rPr><w:t>- 전체 단위/통합 테스트: 133개 테스트 케이스 100% 통과</w:t></w:r>
    </w:p>
  </w:body>
</w:document>"""

content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>"""

rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>"""

docx_path = 'docs/2026-11-14_진단플로우_변경_수정내역_보고서.docx'
with zipfile.ZipFile(docx_path, 'w', zipfile.ZIP_DEFLATED) as docx:
    docx.writestr('[Content_Types].xml', content_types)
    docx.writestr('_rels/.rels', rels)
    docx.writestr('word/document.xml', doc_xml)

print("DOCX_CREATED_SUCCESS:", os.path.exists(docx_path), os.path.getsize(docx_path), "bytes")
