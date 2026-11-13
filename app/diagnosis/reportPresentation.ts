export function reportBadgeStyle(level: string) {
  if (["상향/위험", "상향", "위험", "불가"].includes(level)) return { backgroundColor: "#FEE2E2", color: "#991B1B" };
  if (["매우 안정", "안정"].includes(level)) return { backgroundColor: "#D1FAE5", color: "#065F46" };
  if (level === "적정") return { backgroundColor: "#DBEAFE", color: "#1E40AF" };
  if (level === "도전") return { backgroundColor: "#FEF3C7", color: "#92400E" };
  return { backgroundColor: "#F3F4F6", color: "#4B5563" };
}
