import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatBRL, palestrantes } from "@/lib/mock-data";
import { ArrowLeft, Calendar, Play, Sparkles, Star } from "lucide-react";

export const Route = createFileRoute("/palestrante/$id")({
  component: PalestrantePage,
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center"><div className="text-center"><h1 className="text-2xl font-bold">Palestrante não encontrado</h1><Link to="/catalogo" className="text-primary underline mt-2 inline-block">Voltar ao catálogo</Link></div></div>
  ),
});

function PalestrantePage() {
  const { id } = Route.useParams();
  const p = palestrantes.find((x) => x.id === id);
  if (!p) throw notFound();

  const depoimentos = [
    { c: "Itaú", q: "Conteúdo excepcional, equipe muito satisfeita.", a: "Daniela Reis" },
    { c: "Vale", q: "Ótima didática, recomendamos!", a: "Marco Lima" },
    { c: "Ambev", q: "Inspirador, mudou nossa forma de ver liderança.", a: "Patrícia Gomes" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-background/80 border-b">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 grid place-items-center"><Sparkles className="h-4 w-4 text-white" /></div>
            <span className="font-semibold tracking-tight">Polo Palestrantes</span>
          </Link>
          <Button asChild><Link to="/orcamento">Solicitar orçamento</Link></Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <Link to="/catalogo" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="h-4 w-4" />Voltar ao catálogo</Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted">
              <img src={p.videoThumb.replace("400", "1200")} className="h-full w-full object-cover" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent grid place-items-center">
                <div className="h-16 w-16 rounded-full bg-white/90 grid place-items-center"><Play className="h-6 w-6 text-black ml-1" /></div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-4">
                <img src={p.foto} className="h-20 w-20 rounded-full ring-4 ring-background shadow-lg" alt="" />
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{p.nome}</h1>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{p.avaliacao}</span>
                    <span>·</span>
                    <span>{p.eventos} eventos realizados</span>
                  </div>
                </div>
              </div>
              <p className="mt-5 text-muted-foreground leading-relaxed">{p.bio} Com presença em mais de 200 eventos corporativos por ano, é referência nacional em sua área de atuação, com participações em TED, Web Summit e principais convenções do país.</p>
            </div>

            <div>
              <h2 className="font-semibold text-lg mb-3">Temas</h2>
              <div className="flex flex-wrap gap-2">
                {p.temas.map((t) => <Badge key={t} variant="secondary" className="text-sm py-1.5 px-3">{t}</Badge>)}
              </div>
            </div>

            <div>
              <h2 className="font-semibold text-lg mb-3">Depoimentos</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {depoimentos.map((d, i) => (
                  <Card key={i}><CardContent className="p-4">
                    <div className="flex">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}</div>
                    <p className="text-sm italic mt-2">"{d.q}"</p>
                    <div className="text-xs text-muted-foreground mt-2">— {d.a}, {d.c}</div>
                  </CardContent></Card>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Investimento a partir de</div>
                <div className="text-3xl font-bold text-emerald-600 mt-1">{formatBRL(p.valor)}</div>
                <div className="text-xs text-muted-foreground mt-1">Valor referência · personalizado por evento</div>
                <Button className="w-full mt-5" size="lg" asChild><Link to="/orcamento">Solicitar este palestrante</Link></Button>
                <Button variant="outline" className="w-full mt-2" size="lg"><Calendar className="h-4 w-4 mr-1.5" />Ver disponibilidade</Button>
                <div className="mt-5 pt-5 border-t space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Tempo médio</span><span className="font-medium">60-90 min</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Formato</span><span className="font-medium">Presencial / Online</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Idiomas</span><span className="font-medium">PT / EN</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
