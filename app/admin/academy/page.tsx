"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import AdminOnly from "../../components/auth/AdminOnly";
import RequireAuth from "../../components/auth/RequireAuth";

type Audit = {
  checkedAt: string;
  collections: { name: string; id?: string; exists: boolean; count: number; fields: { name: string; type: string; required: boolean; collectionId?: string; maxSelect?: number }[]; rules: Record<string, string | null> }[];
  assignment: { configuredField: string | null; relationCandidates: string[]; configuredFieldVerified: boolean; invalidAssignments: number };
  profileLinks: { unlinkedProfiles: number; unknownUserLinks: number; conflictingProfileLinks: number; ambiguousUsers: number };
  academies: { academyId: string; profiles: number; roles: Record<string, number>; students: number; assignedStudents: Record<string, number> }[];
};
const panel = { padding: 24, border: "1px solid #e8dfd3", borderRadius: 14, background: "white", marginTop: 20 };

function AcademyAudit() {
  const [audit, setAudit] = useState<Audit | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/platform/admin/academy", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "운영 상태를 확인하지 못했습니다.");
      setAudit(data);
    } catch (cause) { setAudit(null); setError(cause instanceof Error ? cause.message : "운영 상태를 확인하지 못했습니다."); }
    finally { setBusy(false); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  return <>
    <Link href="/admin">← 관리자 홈</Link>
    <h1 style={{ fontSize: 30, fontWeight: 800, marginTop: 20 }}>학원 권한·학생 배정 점검</h1>
    <p style={{ color: "#71665e", marginTop: 12 }}>운영 저장소에서 소속·역할·배정 관계를 읽어 확인합니다. 이 화면은 자료와 권한을 변경하지 않습니다.</p>
    <button onClick={() => void refresh()} disabled={busy} style={{ marginTop: 20, padding: "10px 18px", background: "#17366d", color: "white", borderRadius: 8 }}>{busy ? "확인 중…" : "다시 확인"}</button>
    {error && <p role="alert" style={{ color: "#a52424", marginTop: 20 }}>{error}</p>}
    {audit && <>
      <p style={{ marginTop: 12, color: "#71665e" }}>확인 시각: {new Date(audit.checkedAt).toLocaleString("ko-KR")}</p>
      <section style={panel}>
        <h2 style={{ fontSize: 21, fontWeight: 750 }}>학생 배정 연결</h2>
        <p style={{ marginTop: 10 }}>설정된 배정 필드: {audit.assignment.configuredField || "미설정"}</p>
        <p>실제 담당자 관계 필드: {audit.assignment.relationCandidates.join(", ") || "없음"}</p>
        <p>설정과 실제 관계: {audit.assignment.configuredFieldVerified ? "일치" : "확인 필요"}</p>
        <p>계정 연결 없음: {audit.profileLinks.unlinkedProfiles}건 · 존재하지 않는 계정 연결: {audit.profileLinks.unknownUserLinks}건</p>
        <p>한 프로필에 서로 다른 계정 연결: {audit.profileLinks.conflictingProfileLinks}건 · 한 계정에 여러 프로필 연결: {audit.profileLinks.ambiguousUsers}건</p>
        <p>소속·역할이 맞지 않는 배정: {audit.assignment.invalidAssignments.toLocaleString("ko-KR")}건</p>
      </section>
      <section style={panel}>
        <h2 style={{ fontSize: 21, fontWeight: 750 }}>학원별 현황</h2>
        {!audit.academies.length ? <p style={{ marginTop: 12 }}>등록된 학원 프로필·학생이 없습니다.</p> : <div style={{ overflowX: "auto", marginTop: 14 }}><table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}><thead><tr><th>학원 구분</th><th>계정·역할</th><th>학생</th><th>배정 학생</th></tr></thead><tbody>{audit.academies.map(academy => <tr key={academy.academyId}><td style={{ padding: "12px 8px 12px 0" }}>{academy.academyId}</td><td>{academy.profiles}명 ({Object.entries(academy.roles).map(([role, count]) => `${role} ${count}`).join(" · ")})</td><td>{academy.students}명</td><td>{Object.entries(academy.assignedStudents).map(([field, count]) => `${field}: ${count}명`).join(" · ") || "관계 없음"}</td></tr>)}</tbody></table></div>}
      </section>
      <section style={panel}>
        <h2 style={{ fontSize: 21, fontWeight: 750 }}>저장소 구조와 접근 규칙</h2>
        <p style={{ marginTop: 10, color: "#71665e" }}>null은 서버 관리자 전용, 빈 문자열은 공개 접근 규칙입니다. 학생 이름·연락처·비밀값은 표시하지 않습니다.</p>
        {audit.collections.map(collection => <details key={collection.name} style={{ marginTop: 18 }}><summary>{collection.name} — {collection.exists ? `${collection.count.toLocaleString("ko-KR")}건` : "없음"}</summary><pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", background: "#f8f6f2", padding: 16, marginTop: 10, fontSize: 13 }}>{JSON.stringify({ id: collection.id, fields: collection.fields, rules: collection.rules }, null, 2)}</pre></details>)}
      </section>
    </>}
  </>;
}

export default function AcademyPage() {
  return <main style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 24px" }}><RequireAuth><AdminOnly><AcademyAudit /></AdminOnly></RequireAuth></main>;
}
