import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Compass, Eye, Sparkle, Target } from "lucide-react";

export const Route = createFileRoute("/institucional")({
  head: () => ({
    meta: [
      { title: "A Polo — Educação corporativa premium" },
      { name: "description", content: "Há mais de 15 anos conectando especialistas e empresas que constroem o futuro do trabalho no Brasil." },
      { property: "og:title", content: "A Polo Palestrantes" },
      { property: "og:description", content: "Bureau premium de especialistas e educação corporativa." },
    ],
  }),
  component: Institucional,
});

function Institucional() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-[var(--ink)] text-white">
        <div className="absolute -left-40 top-0 h-[420px] w-[420px] rounded-full bg-[var(--brand)]/25 blur-[140px]" />
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-12 md:py-32">
          <div className="md:col-span-7">
            <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--brand)]">A Polo</div>
            <h1 className="mt-5 text-balance text-5xl font-semibold leading-[1.05] tracking-[-0.025em] md:text-7xl">
              Curadoria como<br /> <span className="italic font-light">vantagem competitiva</span>.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/70">
              Há mais de 15 anos conectando especialistas e empresas que constroem
              o futuro do trabalho no Brasil. Atendimento consultivo, processos
              maduros e padrão internacional de qualidade.
            </p>
          </div>
          <div className="md:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1000"
                alt=""
                className="h-full w-full object-cover grayscale"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="mx-auto max-w-5xl px-6 py-24 text-center">
        <Sparkle className="mx-auto h-6 w-6 text-[var(--brand)]" />
        <p className="mt-6 text-balance text-3xl font-medium leading-snug tracking-[-0.015em] md:text-4xl">
          Acreditamos que o conhecimento certo, na hora certa, com a voz certa,
          é o que transforma cultura, gera engajamento e move o ponteiro de
          empresas inteiras.
        </p>
      </section>

      {/* Missão / Visão / Valores */}
      <section className="border-y bg-[var(--ice)]/40">
        <div className="mx-auto grid max-w-7xl gap-px bg-border md:grid-cols-3">
          {[
            { i: Target, t: "Missão", d: "Conectar empresas a especialistas que transformam conhecimento em resultado tangível." },
            { i: Eye, t: "Visão", d: "Ser referência latino-americana em curadoria estratégica de educação corporativa." },
            { i: Compass, t: "Valores", d: "Curadoria, sofisticação, parceria de longo prazo e obsessão por experiência premium." },
          ].map((v, i) => (
            <div key={i} className="bg-card p-10">
              <v.i className="h-7 w-7 text-[var(--brand)]" strokeWidth={1.5} />
              <div className="mt-6 text-lg font-semibold tracking-tight">{v.t}</div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Números */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--brand)]">A Polo em números</div>
        <h2 className="mt-3 text-4xl font-semibold tracking-[-0.02em] md:text-5xl">Resultado que se mede.</h2>

        <div className="mt-12 grid gap-px overflow-hidden rounded-xl border bg-border md:grid-cols-4">
          {[
            { v: "15+", l: "Anos de atuação" },
            { v: "1.500+", l: "Eventos entregues" },
            { v: "120+", l: "Especialistas curados" },
            { v: "98%", l: "NPS de clientes" },
          ].map((s) => (
            <div key={s.l} className="bg-card p-10 text-center">
              <div className="text-5xl font-semibold tracking-tight text-[var(--ink)]">{s.v}</div>
              <div className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-2xl border bg-[var(--ink)] p-12 text-white md:p-16">
          <div className="absolute -right-32 top-0 h-[360px] w-[360px] rounded-full bg-[var(--brand)]/25 blur-[140px]" />
          <div className="relative grid items-center gap-10 md:grid-cols-12">
            <div className="md:col-span-8">
              <h2 className="text-balance text-3xl font-semibold tracking-[-0.02em] md:text-4xl">
                Vamos construir juntos a próxima experiência da sua liderança.
              </h2>
            </div>
            <div className="md:col-span-4 md:text-right">
              <Button size="lg" className="h-12 bg-[var(--brand)] px-6 text-white hover:bg-[var(--brand-dark)]" asChild>
                <Link to="/orcamento">Falar com curadoria <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
