import type { PrismAnswers } from "./questions";

export type SubmitResponse = { id: number; engine_type: string; score: Record<string, number> };

const API_BASE = process.env.NEXT_PUBLIC_PRISM_API_BASE || "";

function cleanBase(base: string): string {
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

export function hasPrismApi(): boolean {
  return Boolean(API_BASE);
}

export async function submitPrismAnswers(args: { clientId: string; answers: PrismAnswers }): Promise<SubmitResponse | null> {
  if (!API_BASE) return null;
  try {
    const res = await fetch(`${cleanBase(API_BASE)}/ipsidna-prism/submit`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ client_id: args.clientId, answers: args.answers }),
    });
    if (!res.ok) return null;
    return (await res.json()) as SubmitResponse;
  } catch {
    return null;
  }
}

export async function fetchPrismResult(args: { resultId: number }): Promise<Record<string, unknown> | null> {
  if (!API_BASE) return null;
  try {
    const res = await fetch(`${cleanBase(API_BASE)}/ipsidna-prism/result/${args.resultId}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    return data && typeof data === "object" && !Array.isArray(data) ? data as Record<string, unknown> : null;
  } catch {
    return null;
  }
}
