import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppTopbar } from "@/components/AppSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { npsRespostas, palestrantes } from "@/lib/mock-data";
import { CheckCircle2, Circle, QrCode, Star, Smile, Meh, Frown, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/app/eventos")({ component: EventosPage });

const checklists = {
  evento: [
    { item: "Briefing aprovado pelo cliente", ok: true },
    { item: "Roteiro técnico enviado", ok: true },
    { item: "Equipe de produção confirmada", ok: true },
    { item: "Cenografia e telão validados", ok: false },
    { item: "Avaliação NPS preparada (QR)", ok: true },
  ],
  palestrante: [
    { item: "Termo assinado", ok: true },
    { item: "Slides validados", ok: true },
    { item: "Logística confirmada", ok: true },
    { item: "Briefing técnico recebido", ok: false },
  ],
  cliente: [
    { item: "Contrato assinado", ok: true },
    { item: "Pagamento sinal recebido", ok: true },
    { item: "Briefing preenchido", ok: true },
    { item: "Aprovação roteiro final", ok: false },
    { item: "Lista de presença enviada", ok: false },
  ],
  interno: [
    { item: "Lead convertido", ok: true },
    { item: "Proposta arquivada", ok: true },
    { item: "Contrato no Jurídico", ok: true },
    { item: "Logística aberta", ok: true },
    { item: "Financeiro lançado", ok: false },
    { item: "Pós-venda agendado", ok: false },
  ],
};

const events = [
  { id: "ev1", nome: "Convenção Itaú 2025", data: "21/05/2025", cliente: "Itaú" },
  { id: "ev2", nome: "Workshop Vale Inovação", data: "24/05/2025", cliente: "Vale" },
  { id: "ev3", nome: "Treinamento Magalu", data: "27/05/2025", cliente: "Magazine Luiza" },
];

function EventosPage() {
  const [evento, setEvento] = useState(events[0]);
  const mediaGeral = (npsRespostas.reduce((a, b) => a + b.nota, 0) / npsRespostas.length).toFixed(1);
  const promotores = npsRespostas.filter((n) => n.nota >= 9).length;
  const npsScore = Math.round(((promotores / npsRespostas.length) * 100));
  const qrUrl = `https://nps.polopalestrantes.com/${evento.id}`;

  return (
    <>
      <AppTopbar title="Eventos · Checklists & NPS" breadcrumb={["Operação", "Eventos"]} />
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <Tabs defaultValue="checklists">
          <TabsList>
            <TabsTrigger value="checklists">Checklists</TabsTrigger>
            <TabsTrigger value="qr">QR Code Avaliação</TabsTrigger>
            <TabsTrigger value="nps">Dashboard NPS</TabsTrigger>
          </TabsList>

          <TabsContent value="checklists" className="mt-5">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-sm text-muted-foreground">Evento:</span>
              {events.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setEvento(e)}
                  className={`px-3 py-1.5 rounded-md text-sm ${evento.id === e.id ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"}`}
                >
                  {e.nome}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {Object.entries(checklists).map(([key, items]) => {
                const done = items.filter((i) => i.ok).length;
                const pct = Math.round((done / items.length) * 100);
                const titles: Record<string, string> = { evento: "Checklist do Evento", palestrante: "Checklist do Palestrante", cliente: "Checklist do Cliente", interno: "Checklist Interno" };
                return (
                  <Card key={key} className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="font-semibold text-sm">{titles[key]}</div>
                      <Badge variant={pct === 100 ? "default" : "secondary"}>{pct}%</Badge>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mb-4">
                      <div className={`h-full ${pct === 100 ? "bg-emerald-500" : "bg-primary"}`} style={{ width: `${pct}%` }} />
                    </div>
                    <ul className="space-y-2">
                      {items.map((it, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          {it.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" /> : <Circle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />}
                          <span className={it.ok ? "" : "text-muted-foreground"}>{it.item}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="qr" className="mt-5">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-8 flex flex-col items-center text-center">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Avalie sua experiência</div>
                <h3 className="font-semibold text-lg mb-1">{evento.nome}</h3>
                <div className="text-sm text-muted-foreground mb-6">Aponte a câmera para enviar seu NPS</div>
                <div className="p-4 bg-white rounded-xl border-2 border-border">
                  <svg viewBox="0 0 200 200" className="h-56 w-56">
                    {Array.from({ length: 25 }).map((_, r) =>
                      Array.from({ length: 25 }).map((_, c) => {
                        const seed = (r * 31 + c * 17 + evento.id.charCodeAt(2)) % 7;
                        const corner = (r < 7 && c < 7) || (r < 7 && c > 17) || (r > 17 && c < 7);
                        const innerCorner = ((r >= 1 && r <= 5 && c >= 1 && c <= 5) || (r >= 1 && r <= 5 && c >= 19 && c <= 23) || (r >= 19 && r <= 23 && c >= 1 && c <= 5));
                        const dotCorner = (r >= 2 && r <= 4 && c >= 2 && c <= 4) || (r >= 2 && r <= 4 && c >= 20 && c <= 22) || (r >= 20 && r <= 22 && c >= 2 && c <= 4);
                        if (corner && !innerCorner) return <rect key={`${r}-${c}`} x={c * 8} y={r * 8} width="8" height="8" fill="#000" />;
                        if (dotCorner) return <rect key={`${r}-${c}`} x={c * 8} y={r * 8} width="8" height="8" fill="#000" />;
                        if (innerCorner) return null;
                        return seed < 3 ? <rect key={`${r}-${c}`} x={c * 8} y={r * 8} width="8" height="8" fill="#000" /> : null;
                      })
                    )}
                  </svg>
                </div>
                <div className="mt-4 text-xs font-mono text-muted-foreground break-all">{qrUrl}</div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm"><QrCode className="h-4 w-4" /> Baixar PNG</Button>
                  <Button size="sm">Imprimir crachá</Button>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-1">Pré-visualização da tela de NPS</h3>
                <p className="text-sm text-muted-foreground mb-5">Como o participante vê após escanear</p>
                <div className="rounded-xl border bg-gradient-to-br from-violet-500/10 via-fuchsia-500/5 to-transparent p-6">
                  <div className="text-center mb-5">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Polo Palestrantes</div>
                    <div className="font-semibold mt-1">Qual a chance de você recomendar este palestrante?</div>
                  </div>
                  <div className="grid grid-cols-11 gap-1 mb-5">
                    {Array.from({ length: 11 }).map((_, n) => (
                      <button key={n} className={`h-10 rounded text-sm font-medium border transition ${n <= 6 ? "hover:bg-rose-500 hover:text-white" : n <= 8 ? "hover:bg-amber-500 hover:text-white" : "hover:bg-emerald-500 hover:text-white"}`}>{n}</button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-5">
                    <span className="flex items-center gap-1"><Frown className="h-3 w-3" /> Pouco provável</span>
                    <span className="flex items-center gap-1">Muito provável <Smile className="h-3 w-3" /></span>
                  </div>
                  <textarea className="w-full rounded-md border bg-background px-3 py-2 text-sm" rows={3} placeholder="Conte-nos o motivo..." />
                  <Button className="w-full mt-3">Enviar avaliação</Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="nps" className="mt-5 space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-5">
                <div className="text-xs text-muted-foreground">NPS Score</div>
                <div className="text-3xl font-bold mt-1 text-emerald-500">+{npsScore}</div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Excelente</div>
              </Card>
              <Card className="p-5">
                <div className="text-xs text-muted-foreground">Nota média</div>
                <div className="text-3xl font-bold mt-1">{mediaGeral}</div>
                <div className="flex gap-0.5 mt-1">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}</div>
              </Card>
              <Card className="p-5">
                <div className="text-xs text-muted-foreground">Promotores</div>
                <div className="text-3xl font-bold mt-1 text-emerald-500">{promotores}</div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Smile className="h-3 w-3 text-emerald-500" /> nota ≥ 9</div>
              </Card>
              <Card className="p-5">
                <div className="text-xs text-muted-foreground">Respostas</div>
                <div className="text-3xl font-bold mt-1">{npsRespostas.length}</div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Meh className="h-3 w-3" /> últimos 30 dias</div>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <Card className="p-5">
                <h3 className="font-semibold mb-4">Nota média por palestrante</h3>
                <div className="space-y-3">
                  {palestrantes.slice(0, 5).map((p, i) => {
                    const score = (4.5 + (i % 3) * 0.15).toFixed(1);
                    return (
                      <div key={p.id} className="flex items-center gap-3">
                        <img src={p.foto} className="h-9 w-9 rounded-full object-cover" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{p.nome}</div>
                          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${(Number(score) / 5) * 100}%` }} />
                          </div>
                        </div>
                        <div className="text-sm font-semibold w-10 text-right">{score}</div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className="p-5">
                <h3 className="font-semibold mb-4">Nota média por cliente</h3>
                <div className="space-y-3">
                  {["Itaú", "Natura", "Vale", "Magazine Luiza", "Ambev"].map((c, i) => {
                    const score = (4.4 + ((i * 7) % 5) * 0.12).toFixed(1);
                    return (
                      <div key={c} className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-md bg-muted grid place-items-center text-xs font-semibold">{c[0]}</div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{c}</div>
                          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                            <div className="h-full bg-violet-500" style={{ width: `${(Number(score) / 5) * 100}%` }} />
                          </div>
                        </div>
                        <div className="text-sm font-semibold w-10 text-right">{score}</div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            <Card className="p-5">
              <h3 className="font-semibold mb-4">Comentários recentes</h3>
              <div className="space-y-4">
                {npsRespostas.map((n) => (
                  <div key={n.id} className="flex gap-3 pb-4 border-b last:border-0 last:pb-0">
                    <div className={`h-10 w-10 rounded-full grid place-items-center font-bold text-white shrink-0 ${n.nota >= 9 ? "bg-emerald-500" : n.nota >= 7 ? "bg-amber-500" : "bg-rose-500"}`}>{n.nota}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="text-sm font-medium">{n.palestrante} <span className="text-muted-foreground font-normal">· {n.cliente}</span></div>
                        <div className="text-xs text-muted-foreground">{n.data}</div>
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">{n.evento}</div>
                      <p className="text-sm">"{n.comentario}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
