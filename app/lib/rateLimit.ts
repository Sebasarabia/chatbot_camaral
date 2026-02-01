import { Redis } from "@upstash/redis";

type WindowState = number[];
type RepeatState = { content: string; at: number };

const inMemoryWindows = new Map<string, WindowState>();
const lastMessages = new Map<string, RepeatState>();

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN
      })
    : null;

export async function rateLimit({
  key,
  limit,
  windowMs
}: {
  key: string;
  limit: number;
  windowMs: number;
}) {
  const now = Date.now();

  if (redis) {
    const windowKey = `rl:${key}`;
    const pipeline = redis.pipeline();
    pipeline.zadd(windowKey, { score: now, member: `${now}` });
    pipeline.zremrangebyscore(windowKey, 0, now - windowMs);
    pipeline.zcard(windowKey);
    pipeline.expire(windowKey, Math.ceil(windowMs / 1000));
    const [, , count] = (await pipeline.exec()) as [unknown, unknown, number];
    return { allowed: count <= limit };
  }

  // In-memory sliding window. Not safe for multi-instance/serverless production.
  const window = inMemoryWindows.get(key) ?? [];
  const fresh = window.filter((ts) => now - ts <= windowMs);
  fresh.push(now);
  inMemoryWindows.set(key, fresh);
  return { allowed: fresh.length <= limit };
}

export function isRepeatedMessage({
  key,
  content,
  windowMs
}: {
  key: string;
  content: string;
  windowMs: number;
}) {
  const now = Date.now();
  const last = lastMessages.get(key);
  if (last && last.content === content && now - last.at <= windowMs) {
    return true;
  }
  lastMessages.set(key, { content, at: now });
  return false;
}
