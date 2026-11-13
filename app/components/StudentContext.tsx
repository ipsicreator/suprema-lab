"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import styles from "./StudentContext.module.css";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("pageshow", callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener("pageshow", callback); };
}
function getSnapshot() { try { return sessionStorage.getItem("suprema_user_info"); } catch { return null; } }

export default function StudentContext() {
  const saved = useSyncExternalStore(subscribe, getSnapshot, () => null);
  let info: Record<string, unknown> = {};
  try { const parsed: unknown = saved ? JSON.parse(saved) : null; if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) info = parsed as Record<string, unknown>; } catch { /* Stored information can be unavailable. */ }
  const text = (key: string) => typeof info[key] === "string" ? (info[key] as string).trim() : "";
  const name = text("studentName");
  return <aside className={styles.context} aria-label="현재 진단 학생">
    <div>{name ? <><strong>{name}</strong><span>{[text("schoolName"), text("grade")].filter(Boolean).join(" · ")}</span>{text("consultantName") && <span>담당 {text("consultantName")}</span>}</> : <span>학생 정보를 입력한 뒤 진단을 진행해 주세요.</span>}</div>
    <Link href="/diagnosis/step1">{name ? "학생 정보 확인·수정" : "학생 정보 입력"}</Link>
  </aside>;
}
