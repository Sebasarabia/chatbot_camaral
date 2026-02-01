import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen px-4 py-16">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-start gap-6">
        <p className="text-sm uppercase tracking-[0.2em] text-slate">Camaral</p>
        <h1 className="text-4xl font-semibold text-ink">ChatBot de Camaral</h1>
        <p className="text-base text-slate">
          Respuestas rápidas y seguras desde la base de conocimiento de Camaral.
        </p>
        <Link
          href="/chat"
          className="rounded-xl bg-ink px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
        >
          Abrir chat
        </Link>
      </div>
    </main>
  );
}
