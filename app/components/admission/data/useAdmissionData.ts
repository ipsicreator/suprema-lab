"use client";

import { useEffect, useState } from "react";
import type { AdmissionRow } from "./admissionData";

export function useAdmissionData() {
  const [rows, setRows] = useState<AdmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admissions", { cache: "no-store", signal: controller.signal })
      .then(async response => {
        const result = await response.json();
        if (!response.ok || !result.success || !Array.isArray(result.rows)) throw new Error(result.error || "입시 데이터를 불러오지 못했습니다.");
        setRows(result.rows);
      })
      .catch(error => { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "데이터 조회 오류"); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  return { rows, loading, error };
}
