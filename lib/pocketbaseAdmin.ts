import PocketBase from "pocketbase";

const PB_URL = process.env.PB_URL || process.env.NEXT_PUBLIC_PB_URL || "";
const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || "";
const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || "";
let cached: PocketBase | null = null;
let authenticating: Promise<void> | null = null;

export function hasPocketBaseAdmin(): boolean {
  return Boolean(PB_URL && PB_ADMIN_EMAIL && PB_ADMIN_PASSWORD);
}

export async function pbAdmin(): Promise<PocketBase> {
  if (!hasPocketBaseAdmin()) throw new Error("PocketBase admin configuration is missing");
  const pb = cached ?? (cached = new PocketBase(PB_URL));
  if (pb.authStore.isValid) return pb;
  if (!authenticating) {
    authenticating = (async () => {
      try {
        await pb.collection("_superusers").authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
      } catch (error: unknown) {
        // Only a missing modern endpoint identifies a server predating v0.23.
        if (!error || typeof error !== "object" || !("status" in error) || error.status !== 404) throw error;
        const res = await fetch(`${PB_URL.replace(/\/$/, "")}/api/admins/auth-with-password`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identity: PB_ADMIN_EMAIL, password: PB_ADMIN_PASSWORD }),
          cache: "no-store", signal: AbortSignal.timeout(15_000),
        });
        if (!res.ok) throw new Error(`PocketBase legacy admin authentication failed (${res.status})`);
        const data = await res.json() as { token?: unknown; admin?: Record<string, unknown> };
        if (typeof data.token !== "string" || !data.token) throw new Error("Invalid PocketBase authentication response");
        pb.authStore.save(data.token, null);
      }
    })().finally(() => { authenticating = null; });
  }
  await authenticating;
  return pb;
}
