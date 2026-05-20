import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBRL, palestrantes } from "@/lib/mock-data";
import { ArrowRight, Award, Building2, Calendar, CheckCircle2, Mic2, Search, Sparkles, Star, Users } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Polo Palestrantes — Os melhores palestrantes do Brasil" },
      { name: "description", content: "Bureau premium de palestrantes. Encontre, contrate e gerencie palestras corporativas em um só lugar." },
    ],
  }),
  component: Home,
});

const logos = ["Itaú", "Vale", "Magazine Luiza", "Natura", "Ambev", "XP Inc", "Bradesco"];

function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-background/80 border-b">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 grid place-items-center"><Sparkles className="h-4 w-4 text-white" /></div>
            <span className="font-semibold tracking-tight">Polo Palestrantes</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm">
            <Link to="/catalogo" className="text-muted-foreground hover:text-foreground">Palestrantes</Link>
            <a href="#temas" className="text-muted-foreground hover:text-foreground">Temas</a>
            <a href="#cases" className="text-muted-foreground hover:text-foreground">Cases</a>
            <Link to="/orcamento" className="text-muted-foreground hover:text-foreground">Orçamento</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild><Link to="/app">Entrar</Link></Button>
            <Button size="sm" asChild><Link to="/orcamento">Solicitar orçamento</Link></Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-fuchsia-500/5" />
        <div className="absolute top-20 -left-20 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute top-40 -right-20 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32 text-center">
          <Badge variant="secondary" className="gap-1.5"><Award className="h-3 w-3" /> +1.500 eventos realizados em 2024</Badge>
          <h1 className="mt-6 text-5xl md:text-7xl font-bold tracking-tight">
            Palestrantes que <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">transformam</span><br />o seu próximo evento.
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            O bureau premium das maiores empresas do Brasil. Curadoria exclusiva, gestão completa, eventos memoráveis.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild><Link to="/catalogo">Explorar palestrantes <ArrowRight className="h-4 w-4 ml-1.5" /></Link></Button>
            <Button size="lg" variant="outline" asChild><Link to="/orcamento">Solicitar orçamento</Link></Button>
          </div>

          <div className="mt-16">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-5">Empresas que confiam</div>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-muted-foreground/70">
              {logos.map((l) => <div key={l} className="text-lg font-semibold">{l}</div>)}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {[
          { v: "87+", l: "Palestrantes" }, { v: "1.5k", l: "Eventos" },
          { v: "98%", l: "NPS clientes" }, { v: "15+", l: "Anos de mercado" },
        ].map((s) => (
          <div key={s.l}>
            <div className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-br from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">{s.v}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.l}</div>
          </div>
        ))}
      </section>

      {/* Destaques */}
      <section id="temas" className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <Badge variant="secondary">Em destaque</Badge>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">Palestrantes mais requisitados</h2>
          </div>
          <Button variant="outline" asChild><Link to="/catalogo">Ver catálogo completo</Link></Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {palestrantes.slice(0, 6).map((p) => (
            <Link key={p.id} to="/palestrante/$id" params={{ id: p.id }}>
              <Card className="overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="aspect-[4/3] bg-muted overflow-hidden">
                  <img src={p.foto.replace("300", "600")} className="h-full w-full object-cover" alt="" />
                </div>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold">{p.nome}</div>
                    <div className="text-xs flex items-center gap-1 font-medium"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{p.avaliacao}</div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.temas.slice(0, 3).map((t) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                  </div>
                  <div className="mt-4 text-sm font-bold text-emerald-600">A partir de {formatBRL(p.valor)}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Como funciona */}
      <section className="bg-muted/40 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center">Do briefing ao palco em 4 passos</h2>
          <div className="mt-12 grid md:grid-cols-4 gap-6">
            {[
              { i: Search, t: "Conte seu briefing", d: "Tema, data, público e orçamento." },
              { i: Users, t: "Receba curadoria", d: "Sugestões em até 24h." },
              { i: CheckCircle2, t: "Aprove e contrate", d: "Contrato e pagamento simplificados." },
              { i: Mic2, t: "Evento memorável", d: "Gestão fim a fim pela Polo." },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 grid place-items-center shadow-lg shadow-violet-500/20"><s.i className="h-5 w-5 text-white" /></div>
                <div className="mt-4 font-semibold">{s.t}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cases */}
      <section id="cases" className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Cases recentes</h2>
        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {[
            { c: "Itaú", t: "Convenção de 800 líderes", q: "Trouxeram não só um palestrante, mas uma experiência completa.", a: "Daniela Reis, RH" },
            { c: "Vale", t: "Workshop de inovação", q: "A curadoria foi cirúrgica para o nosso desafio.", a: "Marco Lima, CIO" },
            { c: "Natura", t: "Programa Diversidade", q: "Equipe Polo é parceira de verdade. Recomendamos.", a: "Patrícia Gomes, ESG" },
          ].map((c, i) => (
            <Card key={i}><CardContent className="p-6">
              <Building2 className="h-6 w-6 text-muted-foreground" />
              <div className="mt-3 text-xs font-medium text-primary">{c.c}</div>
              <div className="font-semibold mt-1">{c.t}</div>
              <p className="text-sm text-muted-foreground italic mt-3">"{c.q}"</p>
              <div className="text-xs text-muted-foreground mt-3">— {c.a}</div>
            </CardContent></Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="rounded-3xl bg-gradient-to-br from-violet-600 to-fuchsia-600 p-12 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,white,transparent_50%)]" />
          <div className="relative">
            <Calendar className="h-10 w-10 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Pronto para começar?</h2>
            <p className="mt-3 text-white/80 max-w-xl mx-auto">Solicite seu orçamento e receba uma curadoria personalizada em até 24 horas.</p>
            <Button size="lg" variant="secondary" className="mt-6" asChild>
              <Link to="/orcamento">Solicitar orçamento <ArrowRight className="h-4 w-4 ml-1.5" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div>© 2025 Polo Palestrantes — Bureau premium</div>
          <div className="flex gap-6"><a href="#">Termos</a><a href="#">Privacidade</a><a href="#">Contato</a></div>
        </div>
      </footer>
    </div>
  );
}
