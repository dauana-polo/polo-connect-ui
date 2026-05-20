import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatBRL, palestrantes } from "@/lib/mock-data";
import { Search, Sparkles, Star } from "lucide-react";

export const Route = createFileRoute("/catalogo")({
  head: () => ({ meta: [{ title: "Catálogo de Palestrantes — Polo" }] }),
  component: Catalogo,
});

const todosTemas = Array.from(new Set(palestrantes.flatMap((p) => p.temas)));

function Catalogo() {
  const [q, setQ] = useState("");
  const [tema, setTema] = useState<string | null>(null);

  const filtrados = palestrantes.filter((p) =>
    (!q || p.nome.toLowerCase().includes(q.toLowerCase())) &&
    (!tema || p.temas.includes(tema))
  );

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

      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold tracking-tight">Catálogo de palestrantes</h1>
        <p className="text-muted-foreground mt-2">Curadoria premium para os melhores eventos corporativos.</p>

        <div className="mt-8 flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 h-11 px-3 rounded-lg border bg-card">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} className="border-0 shadow-none focus-visible:ring-0 px-0" placeholder="Buscar por nome..." />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant={!tema ? "default" : "outline"} className="cursor-pointer" onClick={() => setTema(null)}>Todos</Badge>
          {todosTemas.map((t) => (
            <Badge key={t} variant={tema === t ? "default" : "outline"} className="cursor-pointer" onClick={() => setTema(t)}>{t}</Badge>
          ))}
        </div>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtrados.map((p) => (
            <Link key={p.id} to="/palestrante/$id" params={{ id: p.id }}>
              <Card className="overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="aspect-[4/3] bg-muted overflow-hidden">
                  <img src={p.foto.replace("300", "600")} className="h-full w-full object-cover" alt="" />
                </div>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="font-semibold">{p.nome}</div>
                    <div className="text-xs flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{p.avaliacao}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.bio}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.temas.map((t) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                  </div>
                  <div className="mt-4 text-sm font-bold text-emerald-600">A partir de {formatBRL(p.valor)}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
