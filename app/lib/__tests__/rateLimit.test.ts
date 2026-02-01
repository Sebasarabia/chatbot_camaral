import { describe, expect, it, vi } from "vitest";
import { isRepeatedMessage, rateLimit } from "../rateLimit";

describe("rateLimit (in-memory)", () => {
  it("blocks after limit within window", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-01T00:00:00Z"));

    const key = "test";
    const limit = await rateLimit({ key, limit: 2, windowMs: 1000 });
    const limit2 = await rateLimit({ key, limit: 2, windowMs: 1000 });
    const limit3 = await rateLimit({ key, limit: 2, windowMs: 1000 });

    expect(limit.allowed).toBe(true);
    expect(limit2.allowed).toBe(true);
    expect(limit3.allowed).toBe(false);

    vi.useRealTimers();
  });
});

describe("isRepeatedMessage", () => {
  it("detects quick repeats", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-01T00:00:00Z"));

    const key = "repeat";
    expect(isRepeatedMessage({ key, content: "hola", windowMs: 1000 })).toBe(false);
    expect(isRepeatedMessage({ key, content: "hola", windowMs: 1000 })).toBe(true);

    vi.useRealTimers();
  });
});
