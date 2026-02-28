const store = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 60; // 60 per minute per IP

function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export function rateLimit(request: Request): { ok: boolean; remaining: number } {
  const ip = getClientIp(request);
  const now = Date.now();
  let entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    entry = { count: 1, resetAt: now + WINDOW_MS };
    store.set(ip, entry);
    return { ok: true, remaining: MAX_REQUESTS - 1 };
  }

  entry.count++;
  if (entry.count > MAX_REQUESTS) {
    return { ok: false, remaining: 0 };
  }
  return { ok: true, remaining: MAX_REQUESTS - entry.count };
}
