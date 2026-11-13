import { NextResponse } from "next/server";

export const runtime = "nodejs";

async function checkPocketBaseReachable(pbUrl: string | null) {
  if (!pbUrl) return { configured: false, reachable: false };
  try {
    const res = await fetch(`${pbUrl.replace(/\/$/, "")}/api/health`, {
      method: "GET",
      cache: "no-store",
    });
    return { configured: true, reachable: res.ok };
  } catch {
    return { configured: true, reachable: false };
  }
}

export async function GET() {
  const pbUrl = process.env.PB_URL || process.env.NEXT_PUBLIC_PB_URL || null;

  return NextResponse.json(
    {
      ok: true,
      app: "suprema-lab",
      vercel: {
        env: process.env.VERCEL_ENV || null,
        git: {
          sha: process.env.VERCEL_GIT_COMMIT_SHA || null,
          ref: process.env.VERCEL_GIT_COMMIT_REF || null,
        },
      },
      pocketbase: {
        url: pbUrl,
        ...(await checkPocketBaseReachable(pbUrl)),
      },
    },
    { status: 200 },
  );
}
