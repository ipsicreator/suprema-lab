import OriginalLanding from "../components/OriginalLanding";

export default function IntroPage() {
  return <OriginalLanding src="/intro-hero-final.png" alt="대치 수프리마 · 나의 입시멘토 · 탐구, 세특, 입시위치진단을 하나의 흐름으로" width={1536} height={1024} links={[
    { label: "로그인", href: "/api/auth/signin", left: 88, top: 7, width: 7, height: 4 },
    { label: "진단 시작하기", href: "/diagnosis/step1", left: 7, top: 54, width: 24.5, height: 7.8 },
    { label: "결과 보기", href: "/report", left: 7, top: 63.2, width: 24.5, height: 7.8 },
    { label: "1단계 학생부 업로드", href: "/diagnosis/step1", left: 6, top: 75, width: 23, height: 15.5 },
    { label: "2단계 학생부 분석", href: "/diagnosis/step2", left: 29, top: 75, width: 23, height: 15.5 },
    { label: "3단계 탐구 주제", href: "/diagnosis/step3", left: 52, top: 75, width: 23, height: 15.5 },
    { label: "4단계 입시 위치 진단", href: "/diagnosis/step4", left: 75, top: 75, width: 20, height: 15.5 },
  ]} />;
}
