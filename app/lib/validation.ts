import { z } from "zod";

export const MAX_BODY_BYTES = 20_000;
export const MAX_MESSAGE_CHARS = 1_000;
export const MAX_MESSAGES = 20;
export const MAX_TOTAL_CHARS = 8_000;

export const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(MAX_MESSAGE_CHARS)
});

export const requestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(MAX_MESSAGES)
});
