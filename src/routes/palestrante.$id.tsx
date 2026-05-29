import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { palestrantes } from "@/lib/mock-data";
import { ArrowLeft, BadgeCheck, Building2, CheckCircle2, Globe2, Play, Quote, Sparkle, Star } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/palestrante/$id")({
  head: ({ params }) => {
    const p = palestrantes.find((x) => x.id === params.id);
    return {
      meta: [
        { title: p ? `${p.nome} — Polo Palestrantes` : "Especialista — Polo" },
        { name: "description", content: p?.bio ?? "Perfil de especialista." },
        { property: "og:title", content: p ? `${p.nome} — Polo Palestrantes` : "Especialista — Polo" },
        { property: "og:description", content: p?.bio ?? "" },
        { property: "og:image", content: p?.foto.replace("300", "800") ?? "" },
      ],
    };
  },
  component: PalestrantePage,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Especialista não encontrado</h1>
        <Link to="/catalogo" className="mt-2 inline-block text-[var(--brand)] underline">Voltar à vitrine</Link>
      </div>
    </div>
  ),
});

const empresasAtendidas = ["Itaú", "Vale", "Natura", "Ambev", "XP Inc", "Bradesco", "Magazine Luiza", "Stone"];

function PalestrantePage() {
  const { id } = Route.useParams();
  const p = palestrantes.find((x) => x.id === id);
  if (!p) throw notFound();

  const depoimentos = [
    { c: "Itaú", q: "Conteúdo excepcional. Equipe satisfeita e impactada.", a: "Daniela Reis", r: "Diretora de RH" },
    { c: "Vale", q: "Didática refinada e domínio absoluto do tema.", a: "Marco Lima", r: "CIO" },
    { c: "Ambev", q: "Inspirador. Mudou nossa forma de pensar liderança.", a: "Patrícia Gomes", r: "VP People" },
  ];

  const diferenciais = [
    "Presença em mais de 200 eventos corporativos por ano",
    "Conteúdo customizado por briefing",
    "Disponibilidade nacional e internacional",
    "Conteúdo bilíngue (PT/EN)",
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Banner */}
      <section className="relative isolate overflow-hidden bg-[var(--ink)] text-white">
        <img src={p.foto.replace("300", "1400")} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25 grayscale" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--ink)] via-[var(--ink)]/85 to-[var(--ink)]/30" />
        <div className="absolute -right-32 top-0 h-[400px] w-[400px] rounded-full bg-[var(--brand)]/25 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-12 md:pb-28 md:pt-16">
          <Link to="/catalogo" className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar à vitrine
          </Link>

          <div className="mt-10 grid items-center gap-12 md:grid-cols-12">
            <div className="md:col-span-7">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/70 backdrop-blur">
                <Sparkle className="h-3 w-3 text-[var(--brand)]" /> Especialista curado pela Polo
              </div>
              <h1 className="mt-5 text-balance text-5xl font-semibold leading-[1.05] tracking-[-0.025em] text-white md:text-7xl">
                {p.nome}
              </h1>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/70">
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-[var(--brand)] text-[var(--brand)]" />
                  <span className="font-medium text-white">{p.avaliacao}</span>
                </span>
                <span className="opacity-30">·</span>
                <span>{p.eventos} eventos corporativos</span>
                <span className="opacity-30">·</span>
                <span className="flex items-center gap-1.5"><Globe2 className="h-3.5 w-3.5" /> PT · EN</span>
              </div>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/75">
                {p.bio} Referência em sua área de atuação, com presença em TED,
                Web Summit e principais convenções corporativas do Brasil.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="h-12 bg-[var(--brand)] px-6 text-white hover:bg-[var(--brand-dark)]" asChild>
                  <Link to="/orcamento">Solicitar curadoria</Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 border-white/20 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white" asChild>
                  <Link to="/orcamento">Falar com especialista</Link>
                </Button>
              </div>
            </div>

            {/* Video card */}
            <div className="md:col-span-5">
              <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]">
                <img src={p.foto.replace("300", "1000")} alt={p.nome} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <button className="absolute inset-0 grid place-items-center">
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/30 transition group-hover:bg-[var(--brand)]">
                    <Play className="ml-1 h-6 w-6 fill-white text-white" />
                  </span>
                </button>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-white/60">Vídeo de apresentação</div>
                  <div className="mt-1 text-sm font-medium text-white">Conheça o trabalho de {p.nome.split(" ")[0]}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="space-y-16 lg:col-span-8">
            {/* Temas */}
            <section>
              <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--brand)]">Temas abordados</div>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em]">Conteúdos sob medida.</h2>
              <div className="mt-6 flex flex-wrap gap-2">
                {[...p.temas, "Estratégia", "Transformação cultural", "Futuro do trabalho"].map((t) => (
                  <Badge key={t} variant="outline" className="rounded-full border-border bg-card px-4 py-1.5 text-sm font-medium">
                    {t}
                  </Badge>
                ))}
              </div>
            </section>

            {/* Diferenciais */}
            <section>
              <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--brand)]">Diferenciais</div>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em]">Por que líderes escolhem.</h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {diferenciais.map((d, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-md border bg-card p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]" strokeWidth={1.7} />
                    <span className="text-sm leading-relaxed">{d}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Empresas */}
            <section>
              <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--brand)]">Empresas atendidas</div>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em]">Marcas que já levaram este especialista.</h2>
              <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-md border bg-border sm:grid-cols-4">
                {empresasAtendidas.map((e) => (
                  <div key={e} className="flex items-center gap-2 bg-card px-4 py-5 text-sm font-semibold text-foreground/70">
                    <Building2 className="h-4 w-4 text-muted-foreground" /> {e}
                  </div>
                ))}
              </div>
            </section>

            {/* Depoimentos */}
            <section>
              <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--brand)]">Depoimentos</div>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em]">O que dizem os clientes.</h2>
              <div className="mt-6 grid gap-5 md:grid-cols-3">
                {depoimentos.map((d, i) => (
                  <article key={i} className="relative rounded-md border bg-card p-6">
                    <Quote className="absolute right-5 top-5 h-7 w-7 text-[var(--brand)]/15" />
                    <p className="text-[15px] leading-relaxed">"{d.q}"</p>
                    <div className="mt-5 border-t pt-3 text-sm">
                      <div className="font-medium">{d.a}</div>
                      <div className="text-xs text-muted-foreground">{d.r} · {d.c}</div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          {/* Sticky CTA */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-5">
              <div className="overflow-hidden rounded-md border bg-card">
                <div className="border-b bg-[var(--ice)]/50 px-6 py-4">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Atendimento consultivo</div>
                  <div className="mt-1 text-base font-semibold">Curadoria personalizada</div>
                </div>
                <div className="space-y-4 p-6">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Nosso time de curadoria avalia o seu contexto e desenha a melhor
                    experiência com {p.nome.split(" ")[0]}.
                  </p>
                  <Button className="w-full bg-[var(--brand)] text-white hover:bg-[var(--brand-dark)]" size="lg" asChild>
                    <Link to="/orcamento">Solicitar curadoria</Link>
                  </Button>
                  <Button className="w-full" size="lg" variant="outline" asChild>
                    <Link to="/orcamento">Falar com especialista</Link>
                  </Button>
                  <div className="space-y-2 border-t pt-4 text-sm">
                    <Row k="Formatos" v="Presencial · Online · Híbrido" />
                    <Row k="Duração" v="60 a 90 minutos" />
                    <Row k="Idiomas" v="Português · Inglês" />
                    <Row k="Disponibilidade" v="Nacional e internacional" />
                  </div>
                  <div className="flex items-center gap-2 rounded-md bg-[var(--ice)] px-3 py-2.5 text-xs text-muted-foreground">
                    <BadgeCheck className="h-4 w-4 text-[var(--brand)]" />
                    Resposta da curadoria em até 24h úteis
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-right font-medium">{v}</span>
    </div>
  );
}
