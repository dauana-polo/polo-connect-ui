import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Award, Brain, Briefcase, Building2, Compass, GraduationCap,
  HeartPulse, Layers, Lightbulb, MessageCircle, Mic2, ShieldCheck, Target, TrendingUp, Users,
} from "lucide-react";

export const Route = createFileRoute("/solucoes")({
  head: () => ({
    meta: [
      { title: "Soluções Corporativas — Polo Palestrantes" },
      { name: "description", content: "Palestras, workshops, treinamentos e imersões para liderança, cultura e performance corporativa." },
      { property: "og:title", content: "Soluções Corporativas — Polo Palestrantes" },
      { property: "og:description", content: "Educação corporativa premium em formatos pensados para cada ciclo do negócio." },
    ],
  }),
  component: Solucoes,
});

const formatos = [
  { i: Mic2, t: "Palestras", d: "Conteúdo de alto impacto para convenções, kick-offs e eventos institucionais." },
  { i: Layers, t: "Workshops", d: "Sessões práticas com dinâmicas aplicadas para times e lideranças." },
  { i: GraduationCap, t: "Treinamentos", d: "Programas estruturados de desenvolvimento contínuo." },
  { i: Compass, t: "Imersões executivas", d: "Experiências estratégicas para C-level e talentos-chave." },
];

const temas = [
  { i: Award, t: "Liderança", d: "Desenvolvimento de lideranças e times de alta performance." },
  { i: Building2, t: "Cultura organizacional", d: "Construção e transformação cultural com método." },
  { i: ShieldCheck, t: "SIPAT", d: "Programas premium para semanas de segurança e bem-estar." },
  { i: MessageCircle, t: "Comunicação", d: "Comunicação executiva, storytelling e influência." },
  { i: TrendingUp, t: "Vendas", d: "Aceleração comercial e mentalidade de crescimento." },
  { i: HeartPulse, t: "Inteligência emocional", d: "Saúde mental, autoconhecimento e resiliência." },
  { i: Users, t: "Desenvolvimento humano", d: "Pessoas, propósito e protagonismo no trabalho." },
  { i: Lightbulb, t: "Inovação", d: "Mentalidade exploratória e novos modelos de negócio." },
  { i: Brain, t: "Tecnologia & IA", d: "Futuro do trabalho, dados e IA aplicada." },
  { i: Target, t: "Estratégia", d: "Visão de longo prazo e execução com foco." },
  { i: Briefcase, t: "Diversidade & ESG", d: "Diversidade, equidade, inclusão e agenda ESG." },
];

function Solucoes() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b bg-[var(--ink)] text-white">
        <div className="absolute -right-40 top-0 h-[420px] w-[420px] rounded-full bg-[var(--brand)]/20 blur-[140px]" />
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--brand)]">Soluções corporativas</div>
          <h1 className="mt-5 max-w-4xl text-balance text-5xl font-semibold leading-[1.05] tracking-[-0.025em] md:text-7xl">
            Educação corporativa em formatos<br className="hidden md:block" /> que entregam <span className="text-[var(--brand)]">resultado</span>.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/65">
            Do encontro institucional ao programa de longo prazo — desenhamos a jornada
            certa, com os especialistas certos, no formato certo.
          </p>
        </div>
      </section>

      {/* Formatos */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--brand)]">Formatos</div>
        <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.02em]">Escolha o formato que combina com o seu momento.</h2>

        <div className="mt-12 grid gap-px overflow-hidden rounded-xl border bg-border md:grid-cols-4">
          {formatos.map((f, i) => (
            <div key={i} className="group bg-card p-8 transition-colors hover:bg-[var(--ice)]/40">
              <f.i className="h-7 w-7 text-[var(--brand)]" strokeWidth={1.5} />
              <div className="mt-6 text-lg font-semibold tracking-tight">{f.t}</div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.d}</p>
              <div className="mt-6 inline-flex items-center gap-1 text-xs font-medium text-[var(--brand)] opacity-0 transition-opacity group-hover:opacity-100">
                Falar com curadoria <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Temas */}
      <section className="bg-[var(--ice)]/50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--brand)]">Temas estratégicos</div>
          <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.02em]">
            Conteúdos que atravessam todos os níveis da organização.
          </h2>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {temas.map((t, i) => (
              <div key={i} className="group relative overflow-hidden rounded-md border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-[var(--brand)]/40 hover:shadow-[0_20px_50px_-25px_color-mix(in_oklab,var(--brand)_30%,transparent)]">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-md bg-[var(--ice)] text-[var(--brand)] transition group-hover:bg-[var(--brand)] group-hover:text-white">
                    <t.i className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <div className="text-base font-semibold tracking-tight">{t.t}</div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Processo */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--brand)]">Processo de contratação</div>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.02em]">Do briefing ao palco, com curadoria consultiva.</h2>
            <p className="mt-5 text-muted-foreground">
              Mais do que uma indicação: um processo de curadoria estratégica
              conduzido por especialistas em educação corporativa.
            </p>
            <Button className="mt-6 bg-[var(--brand)] text-white hover:bg-[var(--brand-dark)]" asChild>
              <Link to="/orcamento">Iniciar curadoria <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <ol className="space-y-6 lg:col-span-7">
            {[
              { n: "01", t: "Briefing estratégico", d: "Reunião consultiva para entender contexto, público e objetivos." },
              { n: "02", t: "Curadoria personalizada", d: "Em até 48h, recomendação de 2–4 especialistas alinhados ao desafio." },
              { n: "03", t: "Apresentação executiva", d: "Perfis, vídeos, materiais e referências de mercado." },
              { n: "04", t: "Contrato e logística", d: "Cuidamos de contrato, viagem, hospedagem e alinhamento de conteúdo." },
              { n: "05", t: "Execução e follow-up", d: "Gestão no dia do evento e devolutiva pós-experiência." },
            ].map((s) => (
              <li key={s.n} className="grid grid-cols-[auto_1fr] gap-6 border-b pb-6 last:border-0">
                <div className="text-2xl font-light text-[var(--brand)]">{s.n}</div>
                <div>
                  <div className="text-lg font-semibold tracking-tight">{s.t}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-[var(--ink)] via-[var(--graphite)] to-[var(--ink)] p-12 text-white md:p-16">
          <div className="absolute -left-32 top-1/2 h-[360px] w-[360px] -translate-y-1/2 rounded-full bg-[var(--brand)]/25 blur-[140px]" />
          <div className="relative grid items-center gap-10 md:grid-cols-12">
            <div className="md:col-span-8">
              <h2 className="text-balance text-3xl font-semibold tracking-[-0.02em] md:text-4xl">
                Pronto para desenhar o seu próximo programa?
              </h2>
              <p className="mt-3 max-w-xl text-white/65">
                Fale com nossa curadoria e receba uma proposta personalizada em até 24h úteis.
              </p>
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
