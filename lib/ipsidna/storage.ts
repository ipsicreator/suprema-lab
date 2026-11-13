import type { EngineType } from "./questions";

function isEngineType(v: unknown): v is EngineType {
  return v === "SEDAN" || v === "SUV" || v === "SPORTS" || v === "OFFROAD";
}

export function getEngineTypeFromUrl(): EngineType | null {
  if (typeof window === "undefined") return null;
  const t = new URLSearchParams(window.location.search).get("type");
  return isEngineType(t) ? t : null;
}

export function getLastPrismEngineType(): EngineType | null {
  if (typeof window === "undefined") return null;
  try {
    const payload = window.localStorage.getItem("prism_last_payload");
    if (!payload) return null;
    const parsed = JSON.parse(decodeURIComponent(payload)) as { type?: unknown };
    return isEngineType(parsed?.type) ? parsed.type : null;
  } catch {
    return null;
  }
}

