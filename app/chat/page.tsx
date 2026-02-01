"use client";

import { useMemo, useState } from "react";

type Role = "user" | "assistant";

type ChatMessage = {
  role: Role;
  content: string;
  citations?: { filename: string; score?: number }[];
};

const SUGGESTED = [
  "¿Qué servicios ofrece Camaral?",
  "¿Cómo empiezo con Camaral?",
  "Resume el enfoque de precios de Camaral.",
  "¿Con quién debo contactar para soporte empresarial?",
  "Comparte un resumen breve de la misión de Camaral."
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSend = useMemo(
    () => input.trim().length > 0 && !loading,
    [input, loading]
  );

  async function sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed || loading) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed }
    ];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ messages: nextMessages }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      const contentType = res.headers.get("content-type") ?? "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : { error: "Unexpected server response" };
      if (!res.ok) {
        if (res.status === 429) {
          throw new Error("You’re sending messages too quickly. Please wait a moment.");
        }
        throw new Error("We couldn’t process that request. Please try again.");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          citations: Array.isArray(data.citations) ? data.citations : []
        }
      ]);
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "AbortError"
          ? "The request timed out. Please try again."
          : err instanceof Error
            ? err.message
            : "Unexpected error";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-slate">Camaral</p>
          <h1 className="text-3xl font-semibold text-ink">Chatbot de soporte de Camaral</h1>
          <p className="text-base text-slate">
            Haz preguntas sobre Camaral. Las respuestas se generan desde la base de conocimiento.
          </p>
        </header>

        <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <div className="flex min-h-[320px] flex-col gap-4">
            {messages.length === 0 ? (
              <div className="rounded-xl border border-dashed border-black/10 bg-sand p-6 text-sm text-slate">
                Empieza con una pregunta o elige una sugerencia.
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className="max-w-[80%]">
                    <div
                      className={`whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        message.role === "user"
                          ? "bg-ink text-white"
                          : "bg-sand text-ink"
                      }`}
                    >
                      {message.content}
                    </div>
                    {message.role === "assistant" && (
                      <div className="mt-2 text-xs text-slate">
                        <p className="font-medium text-ink">Fuentes</p>
                        {message.citations && message.citations.length > 0 ? (
                          <ul className="mt-1 space-y-1">
                            {message.citations.map((citation, citationIndex) => (
                              <li key={`${citation.filename}-${citationIndex}`}>
                                {citation.filename}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-1">
                            Sin fuente específica en la base de conocimiento
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-sand px-4 py-3 text-sm text-slate">
                  Pensando...
                </div>
              </div>
            )}
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <form
            className="flex flex-col gap-3 md:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage(input);
            }}
          >
            <textarea
              className="min-h-[52px] flex-1 resize-none rounded-xl border border-black/10 px-4 py-3 text-sm focus:border-ink focus:outline-none"
              placeholder="Haz una pregunta sobre Camaral..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setMessages([]);
                  setError(null);
                }}
                disabled={loading || messages.length === 0}
                className="rounded-xl border border-black/10 px-4 py-3 text-sm font-medium text-slate transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                Limpiar chat
              </button>
              <button
                type="submit"
                disabled={!canSend}
                className="rounded-xl bg-ink px-6 py-3 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                Enviar
              </button>
            </div>
          </form>
        </section>

        <p className="text-xs text-slate">
          Este chatbot puede equivocarse. Verifica la información crítica antes de tomar
          decisiones.
        </p>

        <section className="grid gap-3 md:grid-cols-2">
          {SUGGESTED.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => void sendMessage(question)}
              className="rounded-xl border border-black/10 bg-white px-4 py-3 text-left text-sm text-slate transition hover:border-ink hover:text-ink"
              disabled={loading}
            >
              {question}
            </button>
          ))}
        </section>
      </div>
    </main>
  );
}
