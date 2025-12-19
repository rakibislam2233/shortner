// In-memory rate limiting with cleanup (simple implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number; lastAccess: number }>();
const CLEANUP_INTERVAL = 60000; // Cleanup every minute

// Initialize cleanup interval
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    // Clean up records older than 2 windows to prevent memory leaks
    if (now - record.lastAccess > 2 * 60000) {
      rateLimitMap.delete(ip);
    }
  }
}, CLEANUP_INTERVAL);

export interface RateLimitOptions {
  limit?: number;
  windowMs?: number;
}

export function isRateLimited(ip: string, options: RateLimitOptions = {}): boolean {
  const { limit = 10, windowMs = 60000 } = options;
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs, lastAccess: now };

  if (now > record.resetTime) {
    // Reset the counter
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs, lastAccess: now });
    return false;
  } else {
    // Increment the counter
    if (record.count >= limit) {
      // Update last access time to keep track of active records
      rateLimitMap.set(ip, { ...record, count: record.count + 1, lastAccess: now });
      return true; // Rate limited
    }
    rateLimitMap.set(ip, { ...record, count: record.count + 1, lastAccess: now });
    return false;
  }
}