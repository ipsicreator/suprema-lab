"use client";
import { useEffect, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";

export default function AdminOnly({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const email = session?.user?.email || "";
  const [result, setResult] = useState<{ email: string; allowed: boolean; message: string } | null>(null);
  useEffect(() => {
    if (status !== "authenticated" || !email) return;
    const controller = new AbortController();
    fetch("/api/platform/admin/access", { cache: "no-store", signal: controller.signal })
      .then(async response => {
        const data = await response.json();
        if (!controller.signal.aborted) setResult({ email, allowed: response.ok && data.success === true, message: data.error || "관리자 권한이 필요합니다." });
      })
      .catch(() => { if (!controller.signal.aborted) setResult({ email, allowed: false, message: "관리자 권한을 확인하지 못했습니다. 새로고침해 주세요." }); });
    return () => controller.abort();
  }, [email, status]);
  if (status === "loading" || (status === "authenticated" && result?.email !== email)) return <p role="status">관리자 권한 확인 중...</p>;
  if (status !== "authenticated" || !email || !result?.allowed) return <div className="glass-card" role="alert"><h2>관리자 전용 페이지입니다</h2><p>{result?.email === email ? result?.message : "관리자 계정으로 로그인해 주세요."}</p></div>;
  return <>{children}</>;
}
