"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type Academy = { id: string; label: string };
type Profile = { id: string; name: string; role: string; academyId: string; userId: string | null; email: string; status?: string };
type Roster = { academies: Academy[]; profiles: Profile[] };
const endpoint = "/api/platform/admin/academy/accounts";
const panel = { padding: 24, border: "1px solid #e8dfd3", borderRadius: 14, background: "white", marginTop: 20 };
const input = { width: "100%", padding: "10px 12px", border: "1px solid #cfc7bf", borderRadius: 8, marginTop: 6 };
const button = { padding: "10px 18px", background: "#17366d", color: "white", borderRadius: 8 };
const object = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
function parseRoster(raw: unknown): Roster {
  const data = object(raw);
  if (!Array.isArray(data.academies) || !Array.isArray(data.profiles)) throw new Error("계정 목록을 확인하지 못했습니다.");
  const academies = data.academies.map(value => {
    const item = object(value); if (typeof item.id !== "string" || typeof item.label !== "string") throw new Error("학원 목록 형식을 확인해 주세요.");
    return { id: item.id, label: item.label };
  });
  const profiles = data.profiles.map(value => {
    const item = object(value);
    if (typeof item.id !== "string" || typeof item.name !== "string" || typeof item.role !== "string" || typeof item.academyId !== "string" || !(item.userId == null || typeof item.userId === "string") || !(item.email == null || typeof item.email === "string")) throw new Error("담당자 목록 형식을 확인해 주세요.");
    return { id: item.id, name: item.name, role: item.role, academyId: item.academyId, userId: typeof item.userId === "string" ? item.userId : null, email: typeof item.email === "string" ? item.email : "", ...(typeof item.status === "string" ? { status: item.status } : {}) };
  });
  return { academies, profiles };
}

export default function AccountsPanel() {
  const [roster, setRoster] = useState<Roster>({ academies: [], profiles: [] });
  const [academyId, setAcademyId] = useState("");
  const [profileId, setProfileId] = useState("");
  const [role, setRole] = useState("consultant");
  const [resetId, setResetId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const provisionForm = useRef<HTMLFormElement>(null);
  const resetForm = useRef<HTMLFormElement>(null);
  const generation = useRef(0);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => { generation.current++; controller.current?.abort(); }, []);
  function clearPasswords() { provisionForm.current?.reset(); resetForm.current?.reset(); }
  function clearRoster() { setRoster({ academies: [], profiles: [] }); setAcademyId(""); setProfileId(""); setResetId(""); clearPasswords(); }
  async function request(path: string, init: RequestInit, signal: AbortSignal) {
    const response = await fetch(endpoint + path, { ...init, cache: "no-store", signal });
    const data = object(await response.json().catch(() => null));
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) clearRoster();
      throw new Error(typeof data.error === "string" ? data.error : "계정 작업을 완료하지 못했습니다.");
    }
    return data;
  }
  async function load() {
    if (busy) return;
    const sequence = ++generation.current; controller.current?.abort(); controller.current = new AbortController();
    setBusy(true); setError(""); setMessage(""); clearPasswords();
    try {
      const result = parseRoster(await request("", {}, controller.current.signal));
      if (sequence !== generation.current) return;
      setRoster(result); setAcademyId(previous => result.academies.some(item => item.id === previous) ? previous : result.academies[0]?.id || ""); setProfileId(""); setResetId("");
    } catch (cause) { if (sequence === generation.current) { clearRoster(); setError(cause instanceof Error ? cause.message : "계정 목록을 확인하지 못했습니다."); } }
    finally { if (sequence === generation.current) setBusy(false); }
  }
  function changeAcademy(value: string) { generation.current++; controller.current?.abort(); clearPasswords(); setAcademyId(value); setProfileId(""); setResetId(""); setRole("consultant"); setError(""); setMessage(""); }
  async function submit(event: FormEvent<HTMLFormElement>, action: "provision" | "change-password") {
    event.preventDefault(); if (busy || !academyId) return;
    const form = event.currentTarget, fields = new FormData(form);
    const password = String(fields.get("password") || ""), confirmation = String(fields.get("confirm") || "");
    fields.delete("password"); fields.delete("confirm");
    if (password.length < 12 || password.length > 128) { setError("비밀번호는 12~128자로 입력해 주세요."); return; }
    if (password !== confirmation) { setError("비밀번호 확인이 일치하지 않습니다."); return; }
    const sequence = ++generation.current; controller.current?.abort(); controller.current = new AbortController();
    setBusy(true); setError(""); setMessage("");
    try {
      const selected = roster.profiles.find(item => item.id === profileId);
      const body = action === "provision" ? { action, academyId, ...(profileId ? { profileId } : {}), name: profileId ? selected?.name || "" : String(fields.get("name") || "").trim(), role: profileId ? "consultant" : role, email: String(fields.get("email") || "").trim(), password } : { action, profileId: resetId, newPassword: password };
      const result = await request("", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }, controller.current.signal);
      if (sequence !== generation.current) return;
      if (result.ok !== true && result.success !== true) throw new Error("계정 작업 완료를 확인하지 못했습니다.");
      clearPasswords(); setMessage(action === "provision" ? "학원 계정을 발급했습니다. 학생 배정은 별도로 진행해 주세요." : "비밀번호를 변경했습니다.");
      try {
        const updated = parseRoster(await request("", {}, controller.current.signal));
        if (sequence === generation.current) { setRoster(updated); setProfileId(""); setResetId(""); }
      } catch { if (sequence === generation.current) { setRoster({ academies: [], profiles: [] }); setMessage("계정 작업은 완료됐습니다. 목록을 다시 불러와 확인해 주세요."); } }
    } catch (cause) { if (sequence === generation.current) setError(cause instanceof Error ? cause.message : "계정 작업을 완료하지 못했습니다."); }
    finally { if (sequence === generation.current) setBusy(false); }
  }
  const selectedProfiles = roster.profiles.filter(profile => profile.academyId === academyId);
  const unlinked = selectedProfiles.filter(profile => profile.role === "consultant" && !profile.userId && (!profile.status || profile.status === "unlinked"));
  const linked = selectedProfiles.filter(profile => profile.role !== "master" && profile.userId && (!profile.status || profile.status === "linked"));
  return <section style={panel}>
    <h2 style={{ fontSize: 23, fontWeight: 750 }}>학원 계정·비밀번호 관리</h2>
    <p style={{ color: "#71665e", marginTop: 10 }}>마스터는 Google로 로그인하며 별도 서비스 비밀번호를 만들지 않습니다.</p>
    <p style={{ marginTop: 6 }}>마스터 → 학원 관리자 → 실행 담당자(컨설턴트)</p>
    <p style={{ color: "#71665e", marginTop: 8 }}>연결되지 않은 담당자는 각각 별도 로그인 계정을 발급해야 합니다. 계정 발급 시 학생을 자동 배정하지 않습니다.</p>
    <button onClick={() => void load()} disabled={busy} style={{ ...button, marginTop: 16 }}>{busy ? "처리 중…" : "학원·계정 불러오기"}</button>
    {error && <p role="alert" style={{ color: "#a52424", marginTop: 14 }}>{error}</p>}
    {message && <p role="status" style={{ color: "#23623a", marginTop: 14 }}>{message}</p>}
    {roster.academies.length > 0 && <>
      <label style={{ display: "block", marginTop: 18 }}>학원 선택<select aria-label="계정 관리 학원" value={academyId} onChange={event => changeAcademy(event.target.value)} disabled={busy} style={input}>{roster.academies.map(academy => <option key={academy.id} value={academy.id}>{academy.label}</option>)}</select></label>
      <div style={{ overflowX: "auto", marginTop: 16 }}><table style={{ width: "100%", textAlign: "left" }}><thead><tr><th>이름</th><th>역할</th><th>로그인</th><th>계정 상태</th></tr></thead><tbody>{selectedProfiles.map(profile => <tr key={profile.id}><td style={{ padding: "10px 8px 10px 0" }}>{profile.name || "이름 미지정"}</td><td>{profile.role === "master" ? "마스터" : profile.role === "admin" ? "학원 관리자" : profile.role === "consultant" ? "실행 담당자" : "확인 필요"}</td><td>{profile.role === "master" ? "Google 로그인" : profile.email || "미발급"}</td><td>{profile.role === "master" ? "비밀번호 관리 대상 아님" : profile.status === "ambiguous" ? "중복 연결 확인 필요" : profile.status === "invalid" ? "계정 연결 확인 필요" : profile.userId ? "연결됨" : "계정 발급 필요"}</td></tr>)}</tbody></table>{!selectedProfiles.length && <p>등록된 담당자가 없습니다.</p>}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24, marginTop: 24 }}>
        <form ref={provisionForm} onSubmit={event => void submit(event, "provision")}>
          <h3 style={{ fontWeight: 750, fontSize: 19 }}>계정 발급</h3>
          <label style={{ display: "block", marginTop: 12 }}>대상<select value={profileId} onChange={event => { clearPasswords(); setProfileId(event.target.value); }} disabled={busy} style={input}><option value="">새 담당자 등록</option>{unlinked.map(profile => <option key={profile.id} value={profile.id}>{profile.name || "이름 미지정"} — 기존 실행 담당자</option>)}</select></label>
          {!profileId && <><label style={{ display: "block", marginTop: 12 }}>이름<input name="name" required maxLength={100} disabled={busy} style={input} autoComplete="off" /></label><label style={{ display: "block", marginTop: 12 }}>역할<select value={role} onChange={event => setRole(event.target.value)} disabled={busy} style={input}><option value="consultant">실행 담당자(컨설턴트)</option><option value="admin">학원 관리자</option></select></label></>}
          <label style={{ display: "block", marginTop: 12 }}>로그인 이메일<input name="email" type="email" required maxLength={254} autoComplete="off" disabled={busy} style={input} /></label>
          <label style={{ display: "block", marginTop: 12 }}>비밀번호<input name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} disabled={busy} style={input} /></label>
          <label style={{ display: "block", marginTop: 12 }}>비밀번호 확인<input name="confirm" type="password" autoComplete="new-password" required minLength={12} maxLength={128} disabled={busy} style={input} /></label>
          <button type="submit" disabled={busy || !academyId} style={{ ...button, marginTop: 16 }}>계정 발급</button>
        </form>
        <form ref={resetForm} onSubmit={event => void submit(event, "change-password")}>
          <h3 style={{ fontWeight: 750, fontSize: 19 }}>비밀번호 변경</h3>
          <label style={{ display: "block", marginTop: 12 }}>대상 계정<select value={resetId} onChange={event => { resetForm.current?.reset(); setResetId(event.target.value); }} required disabled={busy} style={input}><option value="">계정 선택</option>{linked.map(profile => <option key={profile.id} value={profile.id}>{profile.name || "이름 미지정"} — {profile.email}</option>)}</select></label>
          <label style={{ display: "block", marginTop: 12 }}>새 비밀번호<input name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} disabled={busy} style={input} /></label>
          <label style={{ display: "block", marginTop: 12 }}>새 비밀번호 확인<input name="confirm" type="password" autoComplete="new-password" required minLength={12} maxLength={128} disabled={busy} style={input} /></label>
          <button type="submit" disabled={busy || !resetId} style={{ ...button, marginTop: 16 }}>비밀번호 변경</button>
        </form>
      </div>
    </>}
  </section>;
}
