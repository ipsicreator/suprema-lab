import { auth } from "../../auth";
import { upsertUserBySession } from "@/lib/platform-store";

export async function getCurrentUserOrThrow() {
  const session = await auth();
  const user = session?.user;
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  const sessionUserId = `${user.email ?? "no-email"}:${(user as { provider?: string }).provider ?? "unknown"}`;
  const provider = (user as { provider?: string }).provider;
  const providerId = (user as { providerId?: string }).providerId;

  await upsertUserBySession({
    sessionUserId,
    email: user.email ?? undefined,
    name: user.name ?? undefined,
    provider,
    providerId,
  });

  return {
    userId: sessionUserId,
    email: user.email ?? undefined,
    name: user.name ?? undefined,
  };
}

export async function requireAdminOrThrow() {
  if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET) throw new Error("AUTH_NOT_CONFIGURED");
  const session = await auth();
  if (!session?.user?.email) throw new Error("UNAUTHORIZED");
  const allowlist = (process.env.ADMIN_EMAILS || "").split(",").map(value => value.trim().toLowerCase()).filter(Boolean);
  if (!allowlist.length) throw new Error("ADMIN_NOT_CONFIGURED");
  if (!allowlist.includes(session.user.email.toLowerCase())) throw new Error("FORBIDDEN");
  return {
    userId: `${session.user.email}:${(session.user as { provider?: string }).provider || "unknown"}`,
    email: session.user.email,
    name: session.user.name ?? undefined,
  };
}
