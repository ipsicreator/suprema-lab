import OriginalLanding from "./components/OriginalLanding";

export default function Home() {
  return <OriginalLanding src="/5_16_IMAGE.png" alt="대치 수프리마 · 학생부 AI분석·입시전략 플랫폼" width={1369} height={1149} links={[
    { label: "센터소개", href: "/intro", left: 88, top: 3, width: 10, height: 5 },
    { label: "진단 시작하기", href: "/diagnosis/step1", left: 32.4, top: 84.7, width: 34.8, height: 7 },
  ]} />;
}
