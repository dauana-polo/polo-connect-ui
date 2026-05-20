import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Sparkles } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/orcamento")({
  head: () => ({ meta: [{ title: "Solicitar orçamento — Polo Palestrantes" }] }),
  component: Orcamento,
});

function Orcamento() {
  const [sent, setSent] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-background/80 border-b">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 grid place-items-center"><Sparkles className="h-4 w-4 text-white" /></div>
            <span className="font-semibold tracking-tight">Polo Palestrantes</span>
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-16">
        {sent ? (
          <Card><CardContent className="p-12 text-center space-y-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 grid place-items-center"><CheckCircle2 className="h-8 w-8 text-emerald-600" /></div>
            <h1 className="text-2xl font-bold">Recebemos seu pedido!</h1>
            <p className="text-muted-foreground">Em até 24 horas nossa equipe entrará em contato com uma curadoria personalizada.</p>
            <Button asChild><Link to="/">Voltar ao início</Link></Button>
          </CardContent></Card>
        ) : (
          <>
            <h1 className="text-4xl font-bold tracking-tight">Solicitar orçamento</h1>
            <p className="text-muted-foreground mt-2">Preencha os dados e receba uma curadoria personalizada em até 24h.</p>

            <Card className="mt-8"><CardContent className="p-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>Nome completo</Label><Input placeholder="Seu nome" /></div>
                <div className="space-y-1.5"><Label>Empresa</Label><Input placeholder="Nome da empresa" /></div>
                <div className="space-y-1.5"><Label>E-mail corporativo</Label><Input type="email" placeholder="voce@empresa.com" /></div>
                <div className="space-y-1.5"><Label>Telefone</Label><Input placeholder="(11) 99999-9999" /></div>
                <div className="space-y-1.5"><Label>Data do evento</Label><Input type="date" /></div>
                <div className="space-y-1.5"><Label>Orçamento estimado</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a">Até R$ 20.000</SelectItem>
                      <SelectItem value="b">R$ 20-40.000</SelectItem>
                      <SelectItem value="c">R$ 40-80.000</SelectItem>
                      <SelectItem value="d">Acima de R$ 80.000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5"><Label>Tema desejado</Label><Input placeholder="Ex.: Liderança, IA, ESG" /></div>
              <div className="space-y-1.5"><Label>Mensagem / briefing</Label><Textarea rows={5} placeholder="Conte mais sobre o evento, público e objetivos..." /></div>
              <Button size="lg" className="w-full" onClick={() => setSent(true)}>Enviar solicitação</Button>
            </CardContent></Card>
          </>
        )}
      </div>
    </div>
  );
}
