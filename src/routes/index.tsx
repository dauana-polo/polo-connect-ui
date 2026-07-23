import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, ArrowUpRight, BadgeCheck, Building2, Compass, Layers, MessagesSquare, Play, Quote, Sparkle, Star, Target, UserRound } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Polo Palestrantes — Especialistas que transformam conhecimento em resultado" },
      { name: "description", content: "Bureau premium de especialistas e soluções corporativas em palestras, workshops e treinamentos para empresas que desenvolvem pessoas, cultura e performance." },
      { property: "og:title", content: "Polo Palestrantes — Educação corporativa premium" },
      { property: "og:description", content: "Curadoria estratégica de especialistas para empresas que desejam desenvolver pessoas, cultura e performance." },
    ],
  }),
  component: Home,
});

type Destaque = {
  id: string;
  nome: string;
  foto_url: string | null;
  temas: string[] | null;
  avaliacao_media: number | null;
  total_eventos: number | null;
};

const logos = ["Itaú", "Vale", "Magazine Luiza", "Natura", "Ambev", "XP Inc", "Bradesco", "Stone"];
const areas = ["Liderança", "Cultura", "Inovação", "Vendas", "ESG", "Alta Performance", "Tecnologia", "Comunicação"];

function Home() {
  const [destaques, setDestaques] = useState<Destaque[]>([]);
  useEffect(() => {
    supabase
      .from("palestrantes")
      .select("id,nome,foto_url,temas,avaliacao_media,total_eventos")
      .eq("publicar_site", true)
      .eq("status", "ativo")
      .order("total_eventos", { ascending: false, nullsFirst: false })
      .limit(6)
      .then(({ data }) => setDestaques((data ?? []) as Destaque[]));
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-[var(--ink)] text-[var(--ice)]">
        <div className="absolute inset-0 grain opacity-[0.18]" />
        <div className="pointer-events-none absolute -left-32 top-1/3 h-[420px] w-[420px] rounded-full bg-[var(--brand)]/25 blur-[120px]" />
        <div className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-[var(--brand-dark)]/40 blur-[140px]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-28 pt-20 md:pt-28">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-white/60 animate-fade-up">
            <span className="h-px w-8 bg-[var(--brand)]" />
            Bureau de especialistas · Educação corporativa
          </div>

          <h1 className="mt-6 max-w-5xl text-balance text-[44px] font-semibold leading-[1.02] tracking-[-0.03em] text-white md:text-[76px] animate-fade-up delay-100">
            Especialistas que <span className="italic font-light text-[var(--ice)]/90">transformam</span> conhecimento
            <br className="hidden md:block" /> em <span className="text-[var(--brand)]">resultado</span>.
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/65 animate-fade-up delay-200">
            Soluções corporativas em palestras, workshops e treinamentos para empresas
            que desejam desenvolver pessoas, cultura e performance.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row animate-fade-up delay-300">
            <Button size="lg" className="h-12 bg-[var(--brand)] px-6 text-base text-white hover:bg-[var(--brand-dark)]" asChild>
              <Link to="/catalogo">Encontrar especialista <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 border-white/20 bg-white/5 px-6 text-base text-white hover:bg-white/10 hover:text-white" asChild>
              <Link to="/orcamento">Falar com curadoria</Link>
            </Button>
          </div>

          {/* Logos */}
          <div className="mt-24 border-t border-white/10 pt-10">
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">Empresas que confiam na Polo</div>
            <div className="mt-6 grid grid-cols-2 items-center gap-x-8 gap-y-5 text-white/60 sm:grid-cols-4 md:grid-cols-8">
              {logos.map((l) => (
                <div key={l} className="text-sm font-semibold tracking-wide opacity-70 transition-opacity hover:opacity-100">{l}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Indicadores de autoridade */}
      <section className="border-b bg-[var(--ice)]/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border px-6 md:grid-cols-4">
          {[
            { v: "15+", l: "Anos de mercado" },
            { v: "1.500+", l: "Eventos corporativos" },
            { v: "120+", l: "Especialistas curados" },
            { v: "98%", l: "NPS dos clientes" },
          ].map((s, i) => (
            <div key={i} className="px-4 py-10 text-center md:px-8">
              <div className="text-4xl font-semibold tracking-tight text-[var(--ink)] md:text-5xl">{s.v}</div>
              <div className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Áreas de atuação */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid items-end gap-10 md:grid-cols-2">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--brand)]">Áreas de atuação</div>
            <h2 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.02em] md:text-5xl">
              Temas que movem<br /> empresas de alta performance.
            </h2>
          </div>
          <p className="text-base leading-relaxed text-muted-foreground">
            Curadoria estratégica de especialistas brasileiros e internacionais em
            educação corporativa, liderança e transformação cultural — alinhados ao
            momento do seu negócio.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
          {areas.map((a) => (
            <Link
              key={a}
              to="/catalogo"
              className="group flex items-center justify-between rounded-md border border-border/80 bg-card px-5 py-5 transition-all hover:-translate-y-0.5 hover:border-[var(--brand)]/40 hover:shadow-[0_6px_30px_-12px_color-mix(in_oklab,var(--brand)_40%,transparent)]"
            >
              <span className="text-sm font-medium">{a}</span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--brand)]" />
            </Link>
          ))}
        </div>
      </section>

      {/* Vitrine de especialistas */}
      <section className="bg-[var(--ice)]/50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--brand)]">Especialistas</div>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.02em] md:text-5xl">Vozes que pautam o mercado.</h2>
            </div>
            <Button variant="outline" asChild>
              <Link to="/catalogo">Ver vitrine completa <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destaques.length === 0 ? (
              <div className="col-span-full rounded-md border bg-card py-16 text-center text-sm text-muted-foreground">
                Vitrine em atualização — em breve novos especialistas publicados.
              </div>
            ) : destaques.map((p) => (
              <Link key={p.id} to="/palestrante/$id" params={{ id: p.id }} className="group">
                <article className="overflow-hidden rounded-md border bg-card transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_color-mix(in_oklab,var(--ink)_40%,transparent)]">
                  <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                    {p.foto_url ? (
                      <img src={p.foto_url} alt={p.nome} className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:scale-[1.03] group-hover:grayscale-0" />
                    ) : (
                      <div className="grid h-full place-items-center text-muted-foreground"><UserRound className="h-16 w-16" /></div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[var(--ink)]/85 via-[var(--ink)]/30 to-transparent" />
                    <div className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white backdrop-blur-md">
                      <Sparkle className="h-3 w-3 text-[var(--brand)]" /> Curado
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <div className="text-lg font-semibold tracking-tight">{p.nome}</div>
                      <div className="mt-1 text-xs text-white/70">{(p.temas ?? []).slice(0, 2).join(" · ")}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Star className="h-3.5 w-3.5 fill-[var(--brand)] text-[var(--brand)]" />
                      <span className="font-medium text-foreground">{(p.avaliacao_media ?? 0).toFixed(1)}</span>
                      <span>·</span>
                      <span>{p.total_eventos ?? 0} eventos</span>
                    </div>
                    <span className="text-xs font-medium text-[var(--brand)] underline-offset-4 group-hover:underline">Ver perfil →</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Soluções corporativas */}
      <section id="solucoes" className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--brand)]">Soluções corporativas</div>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.02em] md:text-5xl">
              Formatos pensados para o ciclo do seu negócio.
            </h2>
            <p className="mt-6 text-muted-foreground">
              Do encontro institucional ao programa de longo prazo — montamos a
              jornada certa com os especialistas certos.
            </p>
            <Button variant="link" className="mt-4 px-0 text-[var(--brand)]" asChild>
              <Link to="/solucoes">Conhecer todas as soluções <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
            {[
              { i: MessagesSquare, t: "Palestras", d: "Conteúdo de alto impacto para convenções e eventos institucionais." },
              { i: Layers, t: "Workshops", d: "Sessões práticas e aplicadas para times e lideranças." },
              { i: Target, t: "Treinamentos", d: "Programas estruturados de desenvolvimento contínuo." },
              { i: Compass, t: "Imersões executivas", d: "Experiências estratégicas para C-level e talentos-chave." },
            ].map((s, i) => (
              <div key={i} className="group relative overflow-hidden rounded-md border bg-card p-7 transition-all hover:border-[var(--brand)]/40">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--brand)]/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <s.i className="h-6 w-6 text-[var(--brand)]" strokeWidth={1.5} />
                <div className="mt-5 text-lg font-semibold tracking-tight">{s.t}</div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vídeo institucional */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-2xl bg-[var(--graphite)]">
          <img src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1600" alt="" className="h-[420px] w-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--ink)] via-[var(--ink)]/60 to-transparent" />
          <div className="absolute inset-0 grid place-items-center">
            <button className="group relative grid h-20 w-20 place-items-center rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/30 transition hover:bg-white/20">
              <Play className="ml-1 h-7 w-7 fill-white text-white" />
              <span className="absolute inset-0 animate-ping rounded-full bg-[var(--brand)]/20" />
            </button>
          </div>
          <div className="absolute inset-x-0 bottom-0 p-10 text-white md:p-14">
            <Badge variant="outline" className="border-white/20 bg-white/5 text-white/80">A Polo em movimento</Badge>
            <div className="mt-4 max-w-2xl text-2xl font-medium leading-snug tracking-tight md:text-3xl">
              "Mais do que contratar um palestrante, é desenhar uma experiência
              estratégica para sua liderança."
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona a curadoria */}
      <section className="bg-[var(--ink)] py-24 text-[var(--ice)]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--brand)]">Processo</div>
          <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.02em] text-white md:text-5xl">
            Como funciona a curadoria Polo.
          </h2>

          <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/5 md:grid-cols-4">
            {[
              { n: "01", t: "Briefing estratégico", d: "Entendemos contexto, público, objetivo e KPIs do programa." },
              { n: "02", t: "Curadoria personalizada", d: "Selecionamos 2–4 especialistas alinhados ao seu desafio." },
              { n: "03", t: "Apresentação consultiva", d: "Mostramos perfis, vídeos, materiais e referências." },
              { n: "04", t: "Execução fim a fim", d: "Logística, contrato, alinhamento e gestão do dia do evento." },
            ].map((s) => (
              <div key={s.n} className="group bg-[var(--ink)] p-8 transition-colors hover:bg-white/[0.03]">
                <div className="text-[11px] font-medium text-[var(--brand)]">{s.n}</div>
                <div className="mt-3 text-lg font-semibold text-white">{s.t}</div>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cases / Depoimentos */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--brand)]">Cases recentes</div>
        <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.02em] md:text-5xl">
          Empresas brasileiras movendo o ponteiro com a Polo.
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { c: "Itaú", t: "Convenção de 800 líderes", q: "Trouxeram não só um palestrante, mas uma experiência estratégica completa.", a: "Daniela Reis", r: "Diretora de RH" },
            { c: "Vale", t: "Workshop de inovação", q: "A curadoria foi cirúrgica para o desafio que tínhamos pela frente.", a: "Marco Lima", r: "CIO" },
            { c: "Natura", t: "Programa de Diversidade", q: "Parceria de verdade — consultivos do briefing à execução.", a: "Patrícia Gomes", r: "Líder ESG" },
          ].map((c, i) => (
            <article key={i} className="relative flex flex-col rounded-md border bg-card p-8">
              <Quote className="absolute right-7 top-7 h-8 w-8 text-[var(--brand)]/15" />
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">{c.c}</span>
              </div>
              <div className="mt-3 text-base font-semibold">{c.t}</div>
              <p className="mt-5 grow text-[15px] leading-relaxed text-foreground/80">"{c.q}"</p>
              <div className="mt-6 border-t pt-4 text-sm">
                <div className="font-medium">{c.a}</div>
                <div className="text-xs text-muted-foreground">{c.r} · {c.c}</div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--brand)]">FAQ empresarial</div>
        <h2 className="mt-4 text-4xl font-semibold tracking-[-0.02em]">Perguntas frequentes.</h2>
        <div className="mt-10 divide-y rounded-md border bg-card">
          {[
            { q: "Como funciona o atendimento consultivo?", a: "Conduzimos uma reunião de briefing para entender contexto, público e objetivo, e em até 48h apresentamos uma curadoria personalizada." },
            { q: "A Polo cuida da logística do especialista?", a: "Sim. Cuidamos de contrato, passagens, hospedagem, transfer, alinhamento de conteúdo e gestão completa do dia do evento." },
            { q: "Quais formatos de evento vocês atendem?", a: "Convenções, kick-offs, SIPATs, treinamentos, imersões executivas, eventos híbridos e online." },
            { q: "É possível desenhar um programa contínuo?", a: "Sim — montamos jornadas de desenvolvimento com múltiplos encontros, conteúdo encadeado e acompanhamento." },
          ].map((f, i) => (
            <details key={i} className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <span className="font-medium">{f.q}</span>
                <span className="grid h-7 w-7 place-items-center rounded-full border text-muted-foreground transition group-open:rotate-45 group-open:border-[var(--brand)] group-open:text-[var(--brand)]">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-[var(--ink)] via-[var(--graphite)] to-[var(--ink)] p-12 text-white md:p-20">
          <div className="absolute -right-32 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-[var(--brand)]/30 blur-[140px]" />
          <div className="relative grid items-center gap-10 md:grid-cols-12">
            <div className="md:col-span-8">
              <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--brand)]">Próximo passo</div>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.02em] md:text-5xl">
                Vamos desenhar o próximo evento que sua liderança vai lembrar.
              </h2>
              <p className="mt-4 max-w-xl text-white/65">
                Receba uma curadoria personalizada em até 24h. Sem compromisso,
                com atendimento consultivo.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:col-span-4 md:items-end">
              <Button size="lg" className="h-12 bg-[var(--brand)] px-6 text-white hover:bg-[var(--brand-dark)]" asChild>
                <Link to="/orcamento">Falar com curadoria <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 border-white/20 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white" asChild>
                <Link to="/catalogo">Ver especialistas</Link>
              </Button>
              <div className="mt-3 flex items-center gap-3 text-xs text-white/50">
                <BadgeCheck className="h-4 w-4 text-[var(--brand)]" />
                Resposta em até 24h úteis
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
