"use client";

import { signIn, useSession } from "next-auth/react";
import type { ReactNode } from "react";

export default function MasterAccess({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  if (status === "loading") return <p role="status">마스터 로그인 확인 중…</p>;
  if (status !== "authenticated" || !session?.user || (session.user as { provider?: string }).provider !== "google") return <section style={{ maxWidth: 540, margin: "40px auto", padding: 36, border: "1px solid #e8dfd3", borderRadius: 14, background: "white", textAlign: "center" }}>
    <p style={{ color: "#8b1a1a", fontSize: 14, fontWeight: 700 }}>수프리마 랩</p>
    <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 12 }}>마스터 로그인</h1>
    <p style={{ color: "#71665e", marginTop: 16 }}>등록된 마스터의 Google 계정으로 로그인합니다. 별도 서비스 비밀번호는 필요하지 않습니다.</p>
    <p style={{ color: "#71665e", marginTop: 10 }}>로그인 후 학원 관리자·실행 담당자 계정과 비밀번호를 관리할 수 있습니다.</p>
    <button onClick={() => void signIn("google", { callbackUrl: "/admin/academy" })} style={{ marginTop: 24, padding: "12px 24px", background: "#17366d", color: "white", borderRadius: 8 }}>Google로 마스터 로그인</button>
  </section>;
  return <>{children}</>;
}

