"use client";

import Link from "next/link";
import { useState } from "react";
import AdminOnly from "../../components/auth/AdminOnly";
import RequireAuth from "../../components/auth/RequireAuth";

type LinkCounts = { populated: number; matchingUsers: number };
type RoleCounts = { profiles: number; canonicalUser: number; canonicalUserMatching: number; legacyOnly: number; sameUserBoth: number; distinctLinks: number };
type Audit = {
  checkedAt: string;
  collections: { name: string; id?: string; exists: boolean; count: number; fields: { name: string; type: string; required: boolean; collectionId?: string; maxSelect?: number }[]; rules: Record<string, string | null> }[];
  assignment: { configuredField: string | null; relationCandidates: string[]; configuredFieldVerified: boolean; invalidAssignments: number; legacyAssignment?: { fieldExists: boolean; fieldType: string | null; populated: number; validProfileAssignments: number; invalidProfileAssignments: number; noUniqueCanonicalUser: number; usableAssignments: number } };
  profileLinks: { unlinkedProfiles: number; unknownUserLinks: number; conflictingProfileLinks: number; ambiguousUsers: number; canonicalAmbiguousUsers?: number; fields?: Record<string, LinkCounts>; roles?: Record<string, RoleCounts> };
  academies: { academyId: string; profiles: number; roles: Record<string, number>; students: number; assignedStudents: Record<string, number> }[];
};
type Result = Record<string, unknown>;
const panel = { padding: 24, border: "1px solid #e8dfd3", borderRadius: 14, background: "white", marginTop: 20 };
const pre = { whiteSpace: "pre-wrap" as const, overflowWrap: "anywhere" as const, background: "#f8f6f2", padding: 16, marginTop: 10, fontSize: 13 };
const endpoint = "/api/platform/admin/academy";
const record = (value: unknown): Result => value && typeof value === "object" && !Array.isArray(value) ? value as Result : {};

const checkLabels: Record<string, string> = {
  anonymous_records_blocked: "로그인 없는 접근 차단",
  managers_only_own_academy: "학원 관리자 소속 제한",
  consultants_only_assigned_students: "담당 학생만 조회",
  analyses_follow_student_scope: "학생 기록 접근 제한",
  staff_and_license_academy_scope: "담당자·이용권 소속 제한",
  direct_privilege_and_assignment_changes_blocked: "권한·배정 임의 변경 차단",
  manager_assignment_and_removal_change_visibility: "배정·해제 반영",
  manager_reassignment_revokes_previous_consultant: "재배정 시 이전 담당자 접근 해제",
  foreign_and_consultant_assignment_rejected: "타 학원·담당자 배정 변경 차단",
  inactive_license_revokes_academy_access: "이용권 종료 학원 접근 차단",
};

function ActionResult({ title, value }: { title: string; value: Result }) {
  const checks = Array.isArray(value.checks) ? value.checks : [];
  return <section style={panel} aria-live="polite">
    <h2 style={{ fontSize: 21, fontWeight: 750 }}>{title}</h2>
    {typeof value.error === "string" && <p style={{ color: "#a52424", marginTop: 10 }}>{value.error}</p>}
    {checks.length > 0 && <ul style={{ marginTop: 12, paddingLeft: 20 }}>{checks.map((raw, index) => {
      const check = record(raw), passed = check.passed ?? check.pass ?? check.ok;
      return <li key={index} style={{ marginTop: 6 }}>{typeof check.name === "string" ? checkLabels[check.name] || check.name : `검증 ${index + 1}`}: {passed === true ? "통과" : passed === false ? "실패" : "결과 확인 필요"}</li>;
    })}</ul>}
    {Object.hasOwn(value, "cleanup") && <div style={{ marginTop: 14 }}><strong>검증 자료 정리 결과</strong><pre style={pre}>{JSON.stringify(value.cleanup, null, 2)}</pre></div>}
    <details open={!checks.length} style={{ marginTop: 14 }}><summary>전체 실행 결과</summary><pre style={pre}>{JSON.stringify(value, null, 2)}</pre></details>
  </section>;
}

function AcademyAudit() {
  const [audit, setAudit] = useState<Audit | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [configuration, setConfiguration] = useState<Result | null>(null);
  const [verification, setVerification] = useState<Result | null>(null);
  async function readAudit() {
    const response = await fetch(endpoint, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(typeof data.error === "string" ? data.error : "운영 상태를 확인하지 못했습니다.");
    setAudit(data);
  }
  async function refresh() {
    if (busy) return;
    setBusy("audit"); setError("");
    try { await readAudit(); }
    catch (cause) { setAudit(null); setError(cause instanceof Error ? cause.message : "운영 상태를 확인하지 못했습니다."); }
    finally { setBusy(""); }
  }
  async function run(action: "configure" | "verify") {
    if (busy) return;
    setBusy(action); setError("");
    if (action === "configure") { setConfiguration(null); setVerification(null); } else setVerification(null);
    try {
      const response = await fetch(`${endpoint}/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}", cache: "no-store" });
      const data = record(await response.json());
      if (action === "configure") setConfiguration(data); else setVerification(data);
      if (!response.ok || data.success !== true) throw new Error(typeof data.error === "string" ? data.error : "실행 결과를 확인해 주세요. 완료되지 않은 검사가 있습니다.");
      if (action === "configure") await readAudit();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "작업을 완료하지 못했습니다. 실행 결과를 확인해 주세요."); }
    finally { setBusy(""); }
  }
  return <>
    <Link href="/admin">← 관리자 홈</Link>
    <h1 style={{ fontSize: 30, fontWeight: 800, marginTop: 20 }}>학원 권한·학생 배정 점검</h1>
    <p style={{ color: "#71665e", marginTop: 12 }}>운영 상태를 확인하고 접근 권한·담당자 배정 구조를 적용합니다. 실제 권한 검증은 별도 실행 결과로 확인합니다.</p>
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
      <button onClick={() => void refresh()} disabled={!!busy} style={{ padding: "10px 18px", background: "#17366d", color: "white", borderRadius: 8 }}>{busy === "audit" ? "확인 중…" : audit ? "다시 확인" : "운영 상태 확인"}</button>
      <button onClick={() => void run("configure")} disabled={!!busy} style={{ padding: "10px 18px", background: "#17366d", color: "white", borderRadius: 8 }}>{busy === "configure" ? "적용 중…" : "접근 권한·배정 구조 적용"}</button>
      <button onClick={() => void run("verify")} disabled={!!busy} style={{ padding: "10px 18px", background: "#17366d", color: "white", borderRadius: 8 }}>{busy === "verify" ? "검증 중…" : "실제 권한·배정 검증"}</button>
    </div>
    <p style={{ color: "#71665e", marginTop: 10 }}>권한 적용과 검증은 버튼을 눌렀을 때만 실행합니다. 검증에 사용한 임시 자료의 정리 결과도 함께 표시합니다.</p>
    {error && <p role="alert" style={{ color: "#a52424", marginTop: 20 }}>{error}</p>}
    {configuration && <ActionResult title="접근 권한·배정 구조 적용 결과" value={configuration} />}
    {verification && <ActionResult title="실제 권한·배정 검증 결과" value={verification} />}
    {audit && <>
      <p style={{ marginTop: 12, color: "#71665e" }}>운영 상태 확인 시각: {new Date(audit.checkedAt).toLocaleString("ko-KR")}</p>
      <section style={panel}>
        <h2 style={{ fontSize: 21, fontWeight: 750 }}>학생 배정 연결</h2>
        <p style={{ marginTop: 10 }}>설정된 배정 필드: {audit.assignment.configuredField || "미설정"}</p>
        <p>실제 담당자 관계 필드: {audit.assignment.relationCandidates.join(", ") || "없음"}</p>
        <p>설정과 실제 관계: {audit.assignment.configuredFieldVerified ? "일치" : "확인 필요"}</p>
        <p>소속·역할이 맞지 않는 관계 배정: {audit.assignment.invalidAssignments.toLocaleString("ko-KR")}건</p>
        {audit.assignment.legacyAssignment && <div style={{ marginTop: 12 }}><strong>기존 배정 자료</strong><p>consultant_id: {audit.assignment.legacyAssignment.fieldExists ? audit.assignment.legacyAssignment.fieldType : "필드 없음"} · 입력 {audit.assignment.legacyAssignment.populated}건</p><p>소속·역할 일치 {audit.assignment.legacyAssignment.validProfileAssignments}건 · 불일치 {audit.assignment.legacyAssignment.invalidProfileAssignments}건</p><p>고유 로그인 계정 없음 {audit.assignment.legacyAssignment.noUniqueCanonicalUser}건 · 계정까지 확인된 배정 {audit.assignment.legacyAssignment.usableAssignments}건</p></div>}
      </section>
      <section style={panel}>
        <h2 style={{ fontSize: 21, fontWeight: 750 }}>로그인 계정과 소속 연결</h2>
        <p style={{ marginTop: 10 }}>연결 없음 {audit.profileLinks.unlinkedProfiles}건 · 존재하지 않는 계정 연결 {audit.profileLinks.unknownUserLinks}건</p>
        <p>서로 다른 연결값 {audit.profileLinks.conflictingProfileLinks}건 · 전체 연결 기준 중복 계정 {audit.profileLinks.ambiguousUsers}건</p>
        <p>canonical user 기준 중복 계정: {audit.profileLinks.canonicalAmbiguousUsers ?? "미확인"}건</p>
        {audit.profileLinks.fields && <div style={{ marginTop: 12 }}>{Object.entries(audit.profileLinks.fields).map(([name, counts]) => <p key={name}>{name}: 입력 {counts.populated}건 · 실제 계정 일치 {counts.matchingUsers}건</p>)}</div>}
        {audit.profileLinks.roles && <div style={{ overflowX: "auto", marginTop: 14 }}><table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}><thead><tr><th>역할</th><th>프로필</th><th>user 입력 / 실제 계정</th><th>admin_id만 있음</th><th>두 연결값 같음 / 다름</th></tr></thead><tbody>{Object.entries(audit.profileLinks.roles).map(([role, counts]) => <tr key={role}><td style={{ padding: "10px 8px 10px 0" }}>{role}</td><td>{counts.profiles}</td><td>{counts.canonicalUser} / {counts.canonicalUserMatching}</td><td>{counts.legacyOnly}</td><td>{counts.sameUserBoth} / {counts.distinctLinks}</td></tr>)}</tbody></table></div>}
      </section>
      <section style={panel}>
        <h2 style={{ fontSize: 21, fontWeight: 750 }}>학원별 현황</h2>
        {!audit.academies.length ? <p style={{ marginTop: 12 }}>등록된 학원 프로필·학생이 없습니다.</p> : <div style={{ overflowX: "auto", marginTop: 14 }}><table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}><thead><tr><th>학원 구분</th><th>계정·역할</th><th>학생</th><th>배정 학생</th></tr></thead><tbody>{audit.academies.map(academy => <tr key={academy.academyId}><td style={{ padding: "12px 8px 12px 0" }}>{academy.academyId}</td><td>{academy.profiles}명 ({Object.entries(academy.roles).map(([role, count]) => `${role} ${count}`).join(" · ")})</td><td>{academy.students}명</td><td>{Object.entries(academy.assignedStudents).map(([field, count]) => `${field}: ${count}명`).join(" · ") || "관계 없음"}</td></tr>)}</tbody></table></div>}
      </section>
      <section style={panel}>
        <h2 style={{ fontSize: 21, fontWeight: 750 }}>저장소 구조와 접근 규칙</h2>
        <p style={{ marginTop: 10, color: "#71665e" }}>null은 서버 관리자 전용, 빈 문자열은 공개 접근 규칙입니다. 학생 이름·연락처·비밀값은 표시하지 않습니다.</p>
        {audit.collections.map(collection => <details key={collection.name} style={{ marginTop: 18 }}><summary>{collection.name} — {collection.exists ? `${collection.count.toLocaleString("ko-KR")}건` : "없음"}</summary><pre style={pre}>{JSON.stringify({ id: collection.id, fields: collection.fields, rules: collection.rules }, null, 2)}</pre></details>)}
      </section>
    </>}
  </>;
}

export default function AcademyPage() {
  return <main style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 24px" }}><RequireAuth><AdminOnly><AcademyAudit /></AdminOnly></RequireAuth></main>;
}
