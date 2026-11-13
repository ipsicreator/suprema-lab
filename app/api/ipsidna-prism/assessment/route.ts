import { NextResponse } from "next/server";
import { pbAdmin, hasPocketBaseAdmin } from "@/lib/pocketbaseAdmin";

type ChoiceKey = "A" | "B" | "C" | "D";

function scoreAnswers(answers: Record<string, ChoiceKey>) {
  const score = { SEDAN: 0, SUV: 0, SPORTS: 0, OFFROAD: 0 };
  for (const picked of Object.values(answers)) {
    if (picked === "A") score.SEDAN += 1;
    else if (picked === "B") score.SUV += 1;
    else if (picked === "C") score.SPORTS += 1;
    else if (picked === "D") score.OFFROAD += 1;
  }
  return score;
}

function resolveType(score: Record<string, number>): "SEDAN" | "SUV" | "SPORTS" | "OFFROAD" {
  const entries = Object.entries(score).sort((a, b) => b[1] - a[1]);
  const t = entries[0]?.[0] ?? "SEDAN";
  return t === "SUV" || t === "SPORTS" || t === "OFFROAD" ? t : "SEDAN";
}

export async function POST(req: Request) {
  if (!hasPocketBaseAdmin()) {
    return NextResponse.json({ ok: false, error: "pocketbase_not_configured" }, { status: 500 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const lead_id = String(body?.lead_id ?? "").trim();
  const answers = (body?.answers ?? null) as Record<string, ChoiceKey> | null;

  if (!lead_id || !answers || typeof answers !== "object" || Array.isArray(answers) || !Object.keys(answers).length || Object.keys(answers).length > 200 || !Object.values(answers).every(value => ["A", "B", "C", "D"].includes(value))) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const score = scoreAnswers(answers);
  const engine_type = resolveType(score);

  const pb = await pbAdmin();
  const created = await pb.collection("suprema_prism_assessments").create({
    lead_id,
    kind: "short",
    answers,
    score,
    engine_type,
  });

  return NextResponse.json({ ok: true, id: created.id, engine_type, score });
}

