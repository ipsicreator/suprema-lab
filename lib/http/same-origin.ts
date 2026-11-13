export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return;
  const internal = new URL(request.url);
  const host = request.headers.get("host") || internal.host;
  const protocol = request.headers.get("x-forwarded-proto")?.split(",")[0].trim() || internal.protocol.slice(0, -1);
  let source: URL;
  try { source = new URL(origin); } catch { throw new Error("CROSS_ORIGIN"); }
  if (!["http:", "https:"].includes(source.protocol) || source.host.toLowerCase() !== host.toLowerCase() || source.protocol !== `${protocol}:`) throw new Error("CROSS_ORIGIN");
}
