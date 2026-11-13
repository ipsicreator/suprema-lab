# 입시 데이터 CLI 검증

관리자 화면의 파일 업로드가 일반 운영 반영 경로다. 아래 도구는 개발자가 원본 파일을 검사하거나 배포에 포함될 기본 자료를 명시적으로 갱신할 때 사용한다. Node.js 24의 TypeScript 직접 실행 기능을 이용하며, 관리자 업로드와 동일한 `lib/admissions/import.ts` 검증기를 사용한다.

## 검증만 수행

```powershell
npm run update:admissions -- "C:/자료/입결.xlsx"
npm run update:admissions -- "C:/자료/입결.xlsx" --sheet="전체" --dry-run
```

기본 동작은 검증만 수행하며 파일·현재 운영 버전·외부 컨설턴트 앱을 변경하지 않는다. 원본 경로는 필수다. 제목행·빈 행·줄바꿈 열 제목을 처리하고 대학·전형 수와 검토할 항목을 출력한다.

## 배포용 기본 자료 갱신

```powershell
npm run update:admissions -- "C:/자료/입결.xlsx" --sheet="전체" --write-bundled
```

`--write-bundled`를 명시한 경우에만 다음 파일을 갱신한다.

- `data/admission/admissionData.json`
- `data/susi_explorer_fixed.csv`
- `data/admission_cutoffs_2026.csv`

2026학년도 관측값을 2027학년도로 바꾸거나, 일반 입결·전년도 입결을 임의의 50%/70%컷으로 대체하지 않는다. `admission_cutoffs_2027.csv`는 변경하지 않는다. 운영에서 이미 반영한 활성 버전은 별도로 보존되므로, 운영 데이터 변경은 관리자 화면을 사용한다.

외부 컨설턴트 앱 동기화는 자동으로 실행하지 않는다. 필요한 경우 기존 `npm run sync:consultant`를 별도 명령으로 실행한다.

## 검증 결과

V7.24 원본의 ‘전체’ 시트에서 26,410개 전형·164개 대학을 확인했다. 검증 모드로 수행했으며 원본과 서비스용 데이터는 변경하지 않았다.
