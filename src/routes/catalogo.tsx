import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { palestrantes } from "@/lib/mock-data";
import { Search, Star, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/catalogo")({
  head: () => ({
    meta: [
      { title: "Palestrantes — Polo Palestrantes" },
      { name: "description", content: "Encontre o palestrante certo para o seu evento. Mais que uma agência, curadores de palestras." },
    ],
  }),
  component: Catalogo,
});

const WHATSAPP_URL =
  "https://api.whatsapp.com/send?phone=5512982506250&text=Olá, gostaria de saber mais a respeito de palestrantes para o meu evento!";

const TEMAS = [
  "Liderança", "Inovação", "Gestão", "Marketing Digital", "Vendas",
  "Tecnologia", "IA", "Futuro do Trabalho", "Diversidade", "ESG",
  "Motivação", "Empreendedorismo", "Esporte", "Finanças", "Internacional",
];

const STATS = [
  { v: "15", l: "Anos de mercado" },
  { v: "1.8MM", l: "Vidas impactadas em 2024" },
  { v: "3K", l: "Palestrantes cadastrados" },
  { v: "2.8K", l: "Palestras realizadas em 2025" },
];

function Catalogo() {
  const [q, setQ] = useState("");
  const [tema, setTema] = useState<string | null>(null);

  const filtrados = palestrantes.filter(
    (p) =>
      (!q || p.nome.toLowerCase().includes(q.toLowerCase())) &&
      (!tema || p.temas.includes(tema))
  );

  const exclusivos = palestrantes.filter((p) => p.exclusivo);

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <SiteHeader />

      {/* HERO */}
      <section className="relative border-b border-[#1e1e1e] bg-[#0d0d0d]">
        <div className="pointer-events-none absolute -right-32 top-10 h-[420px] w-[420px] rounded-full bg-[var(--brand)]/10 blur-[140px]" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--brand)]">
            <span className="h-px w-8 bg-[var(--brand)]" />
            Polo Palestrantes · Curadoria
          </div>
          <h1 className="mt-6 max-w-4xl text-balance text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            O palestrante certo<br />para o seu evento.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/60">
            Mais que uma agência, curadores de palestras. Receba uma consultoria
            gratuita para o seu evento.
          </p>

          <div className="mt-10">
            <a
              href={WHATSAPP_URL}
              target="_blank" rel="noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded bg-[var(--brand)] px-7 text-sm font-semibold text-black transition hover:bg-[var(--brand-dark)]"
            >
              Fale agora com um consultor! <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-t border-[#1e1e1e] bg-[#161616]">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-[#2a2a2a] md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.l} className="px-6 py-8 text-center md:py-10">
                <div className="text-3xl font-bold text-[var(--brand)] md:text-4xl">{s.v}</div>
                <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEARCH + FILTERS */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex max-w-2xl items-center gap-2 rounded border border-[#2a2a2a] bg-[#161616] px-4 py-3 transition focus-within:border-[var(--brand)]">
          <Search className="h-4 w-4 text-white/40" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Encontre seu palestrante ou palavra-chave"
            className="border-0 bg-transparent px-0 text-white placeholder:text-white/40 shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setTema(null)}
            className={`rounded border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
              !tema
                ? "border-[var(--brand)] bg-[var(--brand)] text-black"
                : "border-[#2a2a2a] bg-[#1a1a1a] text-white hover:border-[var(--brand)]"
            }`}
          >
            Todos
          </button>
          {TEMAS.map((t) => (
            <button
              key={t}
              onClick={() => setTema(t)}
              className={`rounded border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                tema === t
                  ? "border-[var(--brand)] bg-[var(--brand)] text-black"
                  : "border-[#2a2a2a] bg-[#1a1a1a] text-white hover:border-[var(--brand)]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* GRID */}
        <div className="mt-12 mb-6 flex items-end justify-between">
          <div className="text-sm text-white/50">
            {filtrados.length} {filtrados.length === 1 ? "palestrante" : "palestrantes"}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((p) => (
            <PalestranteCard key={p.id} p={p} />
          ))}
        </div>

        {filtrados.length === 0 && (
          <div className="rounded border border-[#2a2a2a] bg-[#161616] py-20 text-center text-white/50">
            Nenhum palestrante encontrado com esses filtros.
          </div>
        )}
      </section>

      {/* CTA MIDDLE */}
      <section className="border-y border-[#1e1e1e] bg-[#161616]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-16 md:flex-row">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--brand)]">
              Curadoria gratuita
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Contrate uma palestra para o seu evento!
            </h2>
          </div>
          <a
            href={WHATSAPP_URL}
            target="_blank" rel="noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded bg-[var(--brand)] px-7 text-sm font-semibold text-black transition hover:bg-[var(--brand-dark)]"
          >
            Fale com um curador <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* TIME EXCLUSIVO */}
      {exclusivos.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--brand)]">
                Time exclusivo Polo
              </div>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                Confira o Nosso Time Exclusivo
              </h2>
              <p className="mt-2 text-white/55">
                Os melhores palestrantes do Brasil, exclusivos da Polo.
              </p>
            </div>
            <Link to="/catalogo" className="text-sm font-semibold text-[var(--brand)] hover:text-white">
              Visualize todos →
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {exclusivos.map((p) => (
              <PalestranteCard key={`ex-${p.id}`} p={p} />
            ))}
          </div>
        </section>
      )}

      {/* MAIS PESQUISADOS */}
      <section className="border-t border-[#1e1e1e] bg-[#0d0d0d] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--brand)]">
            Tendências
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Mais pesquisados
          </h2>
          <p className="mt-2 text-white/55">
            Encontre os palestrantes mais requisitados nos maiores eventos do país.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {palestrantes.slice(0, 3).map((p) => (
              <PalestranteCard key={`mp-${p.id}`} p={p} />
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function PalestranteCard({ p }: { p: (typeof palestrantes)[number] }) {
  return (
    <Link to="/palestrante/$id" params={{ id: p.id }} className="group block">
      <article className="overflow-hidden rounded border border-[#2a2a2a] bg-[#161616] transition-all duration-300 hover:border-[var(--brand)] hover:shadow-[0_20px_60px_-20px_rgba(200,168,75,0.35)]">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#0d0d0d]">
          <img
            src={p.foto}
            alt={p.nome}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/60 to-transparent" />
          <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded bg-[var(--brand)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-black">
            {p.exclusivo ? "Exclusivo Polo" : "Curado"}
          </div>
        </div>
        <div className="space-y-3 p-5">
          <div>
            <div className="text-lg font-semibold text-white">{p.nome}</div>
            <div className="mt-1 text-[13px] font-medium text-[var(--brand)]">
              {p.temas[0]}
            </div>
          </div>
          <p className="line-clamp-2 text-sm leading-relaxed text-white/55">{p.bio}</p>
          <div className="flex flex-wrap gap-1.5">
            {p.temas.slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded border border-[#2a2a2a] bg-[#1a1a1a] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/70"
              >
                {t}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-[#2a2a2a] pt-3">
            <div className="flex items-center gap-1.5 text-xs text-white/55">
              <Star className="h-3.5 w-3.5 fill-[var(--brand)] text-[var(--brand)]" />
              <span className="font-semibold text-white">{p.avaliacao}</span>
              <span>· {p.eventos} eventos</span>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-white/60 group-hover:text-[var(--brand)]">
              Ver perfil →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
