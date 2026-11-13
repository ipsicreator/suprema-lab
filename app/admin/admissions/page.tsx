"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { WorkBook } from "xlsx";
import RequireAuth from "../../components/auth/RequireAuth";
import styles from "./page.module.css";

type Revision = {
  id: string;
  fileName: string;
  rowCount: number;
  universityCount: number;
  createdAt: string;
};
type SampleRow = {
  univ: string;
  dept: string;
  type: string;
  name: string;
  cutoff26: number | null;
  reference26?: string | null;
};
type Preview = {
  rowCount: number;
  universityCount: number;
  cutoffCount: number;
  warningCount: number;
  warnings: string[];
  sample: SampleRow[];
};
const endpoint = "/api/platform/admin/admissions";
const number = (value: number) => value.toLocaleString("ko-KR");
const date = (value: string) => new Date(value).toLocaleString("ko-KR");

async function responseData(response: Response) {
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.success) {
    const error = data?.message || data?.error;
    throw new Error(typeof error === "string" ? error : "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
  return data;
}

function AdmissionManager() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [current, setCurrent] = useState<Revision | null>(null);
  const [history, setHistory] = useState<Revision[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [workbook, setWorkbook] = useState<WorkBook | null>(null);
  const [sheetName, setSheetName] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [draftId, setDraftId] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [rollbackId, setRollbackId] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const sequence = useRef(0);

  useEffect(() => {
    let active = true;
    fetch(endpoint, { cache: "no-store" })
      .then(responseData)
      .then((data) => {
        if (!active) return;
        setCurrent(data.current);
        setHistory(data.history ?? []);
        setAuthorized(true);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setAuthorized(false);
        setError(cause instanceof Error ? cause.message : "관리자 권한을 확인하지 못했습니다.");
      });
    return () => { active = false; sequence.current += 1; };
  }, []);

  function clearPreview() {
    setDraftId("");
    setPreview(null);
    setConfirmed(false);
    setError("");
    setMessage("");
  }

  async function selectFile(selected: File | null) {
    const request = ++sequence.current;
    clearPreview();
    setFile(null);
    setWorkbook(null);
    setSheetName("");
    if (!selected) return;
    if (!/\.(xlsx|xls|csv|tsv)$/i.test(selected.name)) {
      setError("엑셀(.xlsx, .xls), CSV, TSV 파일을 선택해 주세요.");
      return;
    }
    if (selected.size > 20 * 1024 * 1024) {
      setError("20MB 이하의 파일을 선택해 주세요.");
      return;
    }
    setBusy("파일을 확인하고 있습니다.");
    try {
      const XLSX = await import("xlsx");
      const buffer = await selected.arrayBuffer();
      let parsed: WorkBook;
      if (/\.(csv|tsv)$/i.test(selected.name)) {
        let text = new TextDecoder("utf-8").decode(buffer);
        if (text.includes("\uFFFD")) text = new TextDecoder("euc-kr").decode(buffer);
        parsed = XLSX.read(text, { type: "string", raw: true, cellFormula: false });
      } else {
        parsed = XLSX.read(buffer, { type: "array", cellFormula: false });
      }
      if (request !== sequence.current) return;
      if (!parsed.SheetNames.length) throw new Error("파일에 읽을 수 있는 시트가 없습니다.");
      setFile(selected);
      setWorkbook(parsed);
      setSheetName(parsed.SheetNames.includes("전체") ? "전체" : parsed.SheetNames[0]);
    } catch (cause) {
      if (request === sequence.current) setError(cause instanceof Error ? cause.message : "파일을 읽지 못했습니다.");
    } finally {
      if (request === sequence.current) setBusy("");
    }
  }

  async function validate() {
    if (!file || !workbook || busy) return;
    const request = ++sequence.current;
    clearPreview();
    setBusy("데이터를 검증하고 미리보기를 준비합니다.");
    try {
      const { parseWorkbook } = await import("@/lib/admissions/import");
      const result = parseWorkbook(workbook, sheetName);
      if (typeof CompressionStream === "undefined") throw new Error("최신 Chrome 또는 Edge 브라우저에서 다시 시도해 주세요.");
      const compressed = await new Response(
        new Blob([JSON.stringify(result.rows)]).stream().pipeThrough(new CompressionStream("gzip")),
      ).blob();
      if (compressed.size > 3 * 1024 * 1024) throw new Error("전송 가능한 데이터 크기를 초과했습니다. 원본은 보존하고, 불필요한 열을 정리한 파일로 다시 시도해 주세요.");
      const form = new FormData();
      form.set("file", compressed, "admissions.json.gz");
      form.set("fileName", file.name);
      form.set("sheetName", sheetName);
      form.set("action", "preview");
      const data = await responseData(await fetch(endpoint, { method: "POST", body: form }));
      if (request !== sequence.current) return;
      setPreview(data.preview);
      setDraftId(data.draftId);
      setMessage("검증이 끝났습니다. 내용을 확인한 뒤 반영해 주세요. 아직 서비스 데이터는 바뀌지 않았습니다.");
    } catch (cause) {
      if (request === sequence.current) setError(cause instanceof Error ? cause.message : "데이터 검증에 실패했습니다.");
    } finally {
      if (request === sequence.current) setBusy("");
    }
  }

  async function apply(action: "publish" | "rollback", id: string) {
    if (busy || !id || (action === "publish" && !confirmed)) return;
    setBusy(action === "publish" ? "서비스에 데이터를 반영하고 있습니다." : "선택한 버전으로 복원하고 있습니다.");
    setError("");
    setMessage("");
    try {
      const data = await responseData(await fetch(endpoint, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, id }),
      }));
      setCurrent(data.current);
      setRollbackId("");
      clearPreview();
      setMessage(action === "publish" ? "입시 데이터가 서비스에 반영되었습니다." : "선택한 버전으로 복원되었습니다.");
      const refreshed = await responseData(await fetch(endpoint, { cache: "no-store" }));
      setHistory(refreshed.history ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "반영에 실패했습니다.");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className={styles.shell}>
      <nav className={styles.nav} aria-label="관리자 메뉴"><Link href="/admin">관리자 홈</Link><Link href="/admin/pricing">가격·결제 관리</Link></nav>
      <header className={styles.header}>
        <span className={styles.eyebrow}>수프리마랩 관리자</span>
        <h1>입시 데이터 관리</h1>
        <p>엑셀이나 CSV 파일을 올리고, 검증 결과를 확인한 뒤 서비스에 반영하세요.</p>
      </header>
      {authorized === null && <p role="status" className={styles.notice}>관리자 권한을 확인하고 있습니다.</p>}
      {error && <p role="alert" className={styles.error}>{error}</p>}
      {message && <p role="status" className={styles.success}>{message}</p>}
      {authorized && <>
        <section className={styles.card} aria-labelledby="current-title">
          <div className={styles.sectionHeading}><h2 id="current-title">현재 반영된 데이터</h2><span className={styles.badge}>{current ? "사용 중" : "기본 데이터"}</span></div>
          {current ? <>
            <p className={styles.fileName}>{current.fileName}</p>
            <div className={styles.stats}><div><strong>{number(current.rowCount)}</strong><span>전형 데이터</span></div><div><strong>{number(current.universityCount)}</strong><span>대학</span></div><div><strong className={styles.date}>{date(current.createdAt)}</strong><span>등록 시각</span></div></div>
          </> : <p className={styles.muted}>아직 파일이 반영되지 않았습니다. 파일을 올려 입시 데이터를 등록해 주세요.</p>}
        </section>
        <section className={styles.card} aria-labelledby="upload-title" aria-busy={Boolean(busy)}>
          <div className={styles.sectionHeading}><h2 id="upload-title">새 파일 올리기</h2><span className={styles.step}>1. 파일 선택 → 2. 검증 → 3. 반영</span></div>
          <label className={styles.filePicker}>
            <strong>엑셀·CSV·TSV 파일 선택</strong>
            <span>.xlsx, .xls, .csv, .tsv · 최대 20MB</span>
            <input type="file" accept=".xlsx,.xls,.csv,.tsv" disabled={Boolean(busy)} onChange={(event) => { void selectFile(event.target.files?.[0] ?? null); }} />
          </label>
          {file && <div className={styles.fileDetails}><span>{file.name} <small>({(file.size / 1024 / 1024).toFixed(2)}MB)</small></span><label>반영할 시트<select value={sheetName} disabled={Boolean(busy)} onChange={(event) => { sequence.current += 1; setSheetName(event.target.value); clearPreview(); }}>{workbook?.SheetNames.map((name) => <option key={name} value={name}>{name}</option>)}</select></label></div>}
          <p className={styles.hint}>대학교·모집단위명·전형유형·전형명 열이 필요합니다. 제목이나 빈 행 위에 있는 열 제목도 자동으로 찾습니다.</p>
          <button className={styles.primary} type="button" disabled={!file || !workbook || Boolean(busy)} onClick={() => { void validate(); }}>검증 및 미리보기</button>
          {busy && <p role="status" className={styles.muted}>{busy}</p>}
        </section>
        {preview && <section className={styles.card} aria-labelledby="preview-title">
          <h2 id="preview-title">검증 결과</h2>
          <div className={styles.stats}><div><strong>{number(preview.rowCount)}</strong><span>반영할 전형</span></div><div><strong>{number(preview.universityCount)}</strong><span>대학</span></div><div><strong>{number(preview.cutoffCount)}</strong><span>입결이 있는 전형</span></div></div>
          {preview.warningCount > 0 && <div className={styles.warning}><strong>확인할 항목 {number(preview.warningCount)}개</strong><ul>{preview.warnings.slice(0, 10).map((warning, index) => <li key={index}>{warning}</li>)}</ul></div>}
          <div className={styles.tableWrap}><table><caption>반영할 데이터 미리보기 · 최대 10행</caption><thead><tr><th>대학교</th><th>모집단위</th><th>전형유형</th><th>전형명</th><th>2026 입결</th><th>입결 기준</th></tr></thead><tbody>{preview.sample.slice(0, 10).map((row, index) => <tr key={index}><td>{row.univ}</td><td>{row.dept}</td><td>{row.type}</td><td>{row.name}</td><td>{row.cutoff26 ?? "—"}</td><td>{row.reference26 || "—"}</td></tr>)}</tbody></table></div>
          <label className={styles.confirm}><input type="checkbox" checked={confirmed} disabled={Boolean(busy)} onChange={(event) => setConfirmed(event.target.checked)} /><span>미리보기를 확인했습니다. 현재 공통 입시 데이터를 이 파일의 데이터로 전체 교체합니다.</span></label>
          <button className={styles.primary} type="button" disabled={!confirmed || !draftId || Boolean(busy)} onClick={() => { void apply("publish", draftId); }}>서비스에 전체 반영</button>
          <p className={styles.hint}>기존 반영 버전은 이력에 보관되며, 필요하면 아래에서 복원할 수 있습니다.</p>
        </section>}
        <section className={styles.card} aria-labelledby="history-title">
          <h2 id="history-title">반영 이력</h2>
          {history.length ? <ul className={styles.history}>{history.map((revision) => <li key={revision.id}><div><strong>{revision.fileName}</strong><p>{number(revision.rowCount)}개 전형 · {number(revision.universityCount)}개 대학 · {date(revision.createdAt)}</p></div>{revision.id === current?.id ? <span className={styles.badge}>사용 중</span> : <button className={styles.secondary} type="button" disabled={Boolean(busy)} onClick={() => setRollbackId(revision.id)}>이 버전 복원</button>}{rollbackId === revision.id && <div className={styles.rollback} role="alert"><p>현재 공통 입시 데이터를 이 버전으로 바꾸시겠습니까?</p><div className={styles.actions}><button className={styles.primary} type="button" disabled={Boolean(busy)} onClick={() => { void apply("rollback", revision.id); }}>선택한 버전으로 복원</button><button className={styles.secondary} type="button" disabled={Boolean(busy)} onClick={() => setRollbackId("")}>취소</button></div></div>}</li>)}</ul> : <p className={styles.muted}>아직 반영 이력이 없습니다.</p>}
        </section>
      </>}
    </div>
  );
}

export default function AdminAdmissionsPage() {
  return <main className={styles.page}><RequireAuth><AdmissionManager /></RequireAuth></main>;
}
