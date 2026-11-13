# 수프리마 랩

검토용 기획안과 권한 운영 절차는 [Word](기획안_참고용/수프리마랩_기획안과_권한운영절차.docx)와 [PDF](기획안_참고용/수프리마랩_기획안과_권한운영절차.pdf)로 제공합니다.

마스터는 Google 인증으로 학원별 계정을 관리하고, 학원 관리자는 소속 실행 담당자에게 학생을 배정합니다.

## 서비스

- [수프리마 랩](https://suprema-lab.vercel.app)
- [마스터 관리](https://suprema-lab.vercel.app/admin/academy)
- [학원용 앱](https://consultantapp.vercel.app)

## 프로젝트 구성

| 위치 | 내용 |
|---|---|
| 기획안_참고용 | 사람이 검토하는 최종 Word와 PDF |
| app | 서비스 화면과 서버 API |
| lib / src/lib | 진단·인증·저장 공통 기능 |
| data / config | 입시 근거와 설정 |
| public | 서비스 로고와 원복한 화면 이미지 |
| scripts | 입시 자료 처리·검증·운영 도구 |
| docs | 기존 개발·검증·배포 기록 보존 |
| 학원용앱 | 별도 GitHub 저장소인 학원용 앱 |
| fly | 기존 PocketBase 배포 자료 |

## 개발과 검증

- 설치: `npm ci`
- 개발: `npm run dev`
- 검사: `npm test`, `npm run lint`
- 배포용 빌드: `npm run build`
- 실행: `npm start`

GitHub 저장소와 Vercel 프로젝트는 suprema-lab입니다. 학원용 앱은 ipsicreator/consultant-app 저장소의 master 브랜치에서 별도로 배포합니다. 기존 ID·이력·운영 자료는 보존합니다.

로컬 학원용앱 저장소, 원본 입결 파일과 화면 검토 자료는 본사 앱 배포에 포함하지 않습니다. 기존 입결 엑셀은 바탕화면 수시 폴더에 보존합니다.

[전체 화면과 이용 흐름](화면구성_플로우별/전체화면_플로우안내.html)은 과거 검토 자료를 포함합니다. 최신 운영·권한 절차는 위 Word와 PDF를 기준으로 확인합니다.
