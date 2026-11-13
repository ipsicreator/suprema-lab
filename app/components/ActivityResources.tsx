export const ACTIVITY_RESOURCES = [
  { title: "과학탐구 가이드", href: "https://jinhak.esteacher.kr/sciencetam.html" },
  { title: "사회탐구 가이드", href: "https://jinhak.esteacher.kr/socialtam.html" },
  { title: "AI 데이터 분석·프롬프트", href: "https://jinhak.esteacher.kr/ai_prompt.html" },
] as const;
export default function ActivityResources() {
  return <nav aria-label="탐구·세특·독서 참고 도구" className="mb-5 rounded-2xl border border-[#e8dfd3] bg-[#fffaf4] p-4 print:hidden">
    <p className="mb-3 text-sm font-bold text-[#50352a]">탐구·세특·독서 참고 도구</p>
    <div className="flex flex-wrap gap-2">{ACTIVITY_RESOURCES.map(resource => <a key={resource.href} href={resource.href} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" className="rounded-xl border border-[#d9c8b3] bg-white px-4 py-2 text-sm font-bold text-[#8b1a1a] hover:bg-[#f8eee4]">{resource.title} ↗<span className="sr-only"> (새 창)</span></a>)}</div>
  </nav>;
}
