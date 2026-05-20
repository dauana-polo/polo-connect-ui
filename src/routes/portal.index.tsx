import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatBRL } from "@/lib/mock-data";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Calendar, FileText, MapPin, Star, Upload } from "lucide-react";

export const Route = createFileRoute("/portal/")({
  component: PortalDashboard,
});

const proximosEventos = [
  { data: "22 Mai", titulo: "Convenção Top Performers", cliente: "Itaú", local: "São Paulo, SP", valor: 24500, status: "confirmado" },
  { data: "12 Jun", titulo: "Summit de Inovação", cliente: "Bradesco", local: "Rio de Janeiro, RJ", valor: 26600, status: "briefing pendente" },
  { data: "28 Jun", titulo: "Expert Conference", cliente: "XP Inc", local: "São Paulo, SP", valor: 38500, status: "confirmado" },
];

const recebidos = [
  { mes: "Mar", v: 65000 },{ mes: "Abr", v: 82000 },{ mes: "Mai", v: 98000 },{ mes: "Jun", v: 124000 },
];

const avaliacoes = [
  { cliente: "Itaú", nota: 5, comentario: "Conteúdo excepcional, equipe muito satisfeita." },
  { cliente: "Vale", nota: 4.8, comentario: "Ótima didática, recomendamos!" },
  { cliente: "Ambev", nota: 5, comentario: "Inspirador, mudou a forma como vemos liderança." },
];

function PortalDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-5"><div className="text-xs uppercase tracking-wider text-muted-foreground">Próximos eventos</div><div className="text-2xl font-semibold mt-1">3</div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="text-xs uppercase tracking-wider text-muted-foreground">Recebido (mês)</div><div className="text-2xl font-semibold mt-1 text-emerald-600">{formatBRL(124000)}</div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="text-xs uppercase tracking-wider text-muted-foreground">Avaliação média</div><div className="text-2xl font-semibold mt-1 flex items-center gap-1.5">4.9 <Star className="h-5 w-5 fill-amber-400 text-amber-400" /></div></CardContent></Card>
        <Card><CardContent className="p-5"><div className="text-xs uppercase tracking-wider text-muted-foreground">Eventos realizados</div><div className="text-2xl font-semibold mt-1">142</div></CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Recebimentos</CardTitle></CardHeader>
          <CardContent>
            <div className="h-60">
              <ResponsiveContainer>
                <AreaChart data={recebidos}>
                  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.4} /><stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="mes" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickFormatter={(v) => `${v/1000}k`} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} formatter={(v: number) => formatBRL(v)} />
                  <Area type="monotone" dataKey="v" stroke="var(--chart-2)" fill="url(#g)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Documentos</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1.5"><span>RG / CPF</span><span className="text-emerald-600">Enviado</span></div>
              <Progress value={100} />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5"><span>Comprovante PJ</span><span className="text-emerald-600">Enviado</span></div>
              <Progress value={100} />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5"><span>Mídia kit 2025</span><span className="text-amber-600">Pendente</span></div>
              <Progress value={45} />
            </div>
            <Button variant="outline" className="w-full mt-2"><Upload className="h-4 w-4 mr-1.5" />Enviar documento</Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="eventos">
        <TabsList>
          <TabsTrigger value="eventos"><Calendar className="h-3.5 w-3.5 mr-1.5" />Próximos eventos</TabsTrigger>
          <TabsTrigger value="avaliacoes"><Star className="h-3.5 w-3.5 mr-1.5" />Avaliações</TabsTrigger>
          <TabsTrigger value="briefings"><FileText className="h-3.5 w-3.5 mr-1.5" />Briefings</TabsTrigger>
        </TabsList>
        <TabsContent value="eventos">
          <div className="grid md:grid-cols-3 gap-4">
            {proximosEventos.map((e, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 grid place-items-center flex-col">
                      <div className="text-[10px] text-muted-foreground uppercase">{e.data.split(" ")[1]}</div>
                      <div className="text-sm font-bold">{e.data.split(" ")[0]}</div>
                    </div>
                    <Badge variant={e.status === "confirmado" ? "default" : "secondary"} className={e.status === "confirmado" ? "bg-emerald-500" : ""}>{e.status}</Badge>
                  </div>
                  <div className="font-semibold">{e.titulo}</div>
                  <div className="text-xs text-muted-foreground mt-1">{e.cliente}</div>
                  <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><MapPin className="h-3 w-3" />{e.local}</div>
                  <div className="mt-3 pt-3 border-t font-semibold text-emerald-600">{formatBRL(e.valor)}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="avaliacoes">
          <div className="grid md:grid-cols-3 gap-4">
            {avaliacoes.map((a, i) => (
              <Card key={i}><CardContent className="p-5">
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, j) => <Star key={j} className={`h-4 w-4 ${j < Math.round(a.nota) ? "fill-amber-400 text-amber-400" : "text-muted"}`} />)}
                  <span className="ml-1 text-sm font-semibold">{a.nota}</span>
                </div>
                <p className="text-sm italic text-muted-foreground">"{a.comentario}"</p>
                <div className="text-xs font-medium mt-3">— {a.cliente}</div>
              </CardContent></Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="briefings">
          <Card><CardContent className="p-6 space-y-3">
            {proximosEventos.map((e, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <div className="font-medium text-sm">{e.titulo}</div>
                  <div className="text-xs text-muted-foreground">{e.cliente} · {e.data}</div>
                </div>
                <Button size="sm" variant="outline">Abrir briefing</Button>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
