"use client";
import { useState } from "react";

export default function PdfStorageSetup() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  async function prepare() {
    setPending(true); setMessage("");
    try {
      const response = await fetch("/api/diagnosis/upload-configure", { method: "POST" });
      const result = await response.json();
      if (!response.ok || result.ok !== true) throw new Error(response.status === 401 || response.status === 403 ? "관리자 계정으로 다시 로그인해 주세요." : "서버의 파일 보관 설정을 확인해 주세요. 기존 파일은 유지됩니다.");
      setMessage("파일 보관 준비가 완료되었습니다. 학생 정보 화면에서 PDF를 등록할 수 있습니다.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "파일 보관 준비에 실패했습니다."); }
    finally { setPending(false); }
  }
  return <section style={{ padding: 28, borderRadius: 14, border: "1px solid #e8dfd3", background: "white" }}>
    <h2 style={{ fontSize: 21, fontWeight: 750 }}>학생부 PDF 보관</h2>
    <p style={{ color: "#71665e", fontSize: 15 }}>첫 사용 시 관리자가 비공개 파일 보관 공간을 준비합니다.</p>
    <button type="button" className="btn-primary" disabled={pending} onClick={() => { void prepare(); }}>{pending ? "준비 중…" : "파일 보관 준비"}</button>
    {message && <p role="status" style={{ marginTop: 12 }}>{message}</p>}
  </section>;
}
