import { describe, expect, it } from "vitest";
import { requestSchema } from "../validation";

const baseMessage = { role: "user", content: "Hola" };

describe("requestSchema", () => {
  it("accepts a valid request", () => {
    const result = requestSchema.safeParse({ messages: [baseMessage] });
    expect(result.success).toBe(true);
  });

  it("rejects empty messages array", () => {
    const result = requestSchema.safeParse({ messages: [] });
    expect(result.success).toBe(false);
  });

  it("rejects empty content", () => {
    const result = requestSchema.safeParse({
      messages: [{ role: "user", content: "   " }]
    });
    expect(result.success).toBe(false);
  });

});
