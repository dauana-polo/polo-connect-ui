import { useState } from "react";
import { AlertCircle, CheckCircle2, FileDown, Search, Trophy, UserPlus, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const speakers = [
  { id: "camila", nome: "Camila Farani", tema: "Inovação e liderança", valor: "R$ 48.000" },
  { id: "arthur", nome: "Arthur Igreja", tema: "Futuro e tecnologia", valor: "R$ 42.000" },
  { id: "tallis", nome: "Tallis Gomes", tema: "Empreendedorismo", valor: "R$ 38.000" },
];

export function CrmCommercialPrototype() {
  const [winner, setWinner] = useState("camila");
  const [cnpj, setCnpj] = useState(false);
  const [losses, setLosses] = useState<Record<string, string>>({});
  const losers = speakers.filter((speaker) => speaker.id !== winner);
  const ready = cnpj && losers.every((speaker) => (losses[speaker.id] ?? "").trim());

  return (
    <Dialog>
      <DialogTrigger asChild><Button variant="outline"><Trophy className="h-4 w-4" /> Ver fluxo comercial</Button></DialogTrigger>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto">
        <DialogHeader><div className="flex items-center gap-2"><DialogTitle>Fluxo comercial completo</DialogTitle><Badge variant="outline">Protótipo</Badge></div><p className="text-sm text-muted-foreground">Organização inspirada no Pipedrive, sem alterar ou salvar dados.</p></DialogHeader>
        <Tabs defaultValue="cliente" className="mt-2">
          <TabsList className="h-auto w-full justify-start overflow-x-auto"><TabsTrigger value="cliente">1. Cliente e contatos</TabsTrigger><TabsTrigger value="recomendacao">2. Recomendação</TabsTrigger><TabsTrigger value="proposta">3. Proposta</TabsTrigger><TabsTrigger value="fechamento">4. Fechamento</TabsTrigger></TabsList>
          <TabsContent value="cliente" className="grid gap-4 pt-4 lg:grid-cols-2">
            <Card><CardHeader><CardTitle className="text-base">Buscar antes de criar</CardTitle></CardHeader><CardContent className="space-y-3"><div className="flex h-10 items-center gap-2 rounded-md border px-3"><Search className="h-4 w-4 text-muted-foreground" /><input className="flex-1 bg-transparent text-sm outline-none" defaultValue="Nexa" /></div>{["Nexa Tecnologia · (11) 98765-4321", "Nexa Consultoria · sem CNPJ"].map((name) => <button key={name} className="block w-full rounded-md border p-3 text-left text-sm hover:bg-muted/40">{name}</button>)}<Button variant="outline" className="w-full"><UserPlus className="h-4 w-4" /> Criar novo cliente</Button></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Cadastro rápido</CardTitle></CardHeader><CardContent className="space-y-3"><div className="grid gap-3 sm:grid-cols-2"><Input placeholder="Nome do cliente" /><Input placeholder="Telefone" /><Input placeholder="Nome do contato" /><Input placeholder="Cargo" /><Input placeholder="E-mail" /><Input placeholder="Telefone do contato" /></div><label className="flex items-center gap-2 text-sm"><Checkbox defaultChecked /> Salvar cliente sem CNPJ por enquanto</label><div className="rounded-md border border-warning/30 bg-warning/10 p-3 text-xs"><AlertCircle className="mr-2 inline h-4 w-4" />O CNPJ será obrigatório no fechamento.</div></CardContent></Card>
          </TabsContent>
          <TabsContent value="recomendacao" className="pt-4"><Card><CardHeader><CardTitle className="text-base">Recomendação de palestrantes</CardTitle></CardHeader><CardContent className="space-y-3">{speakers.map((speaker) => <div key={speaker.id} className="flex items-center justify-between rounded-md border p-3"><div><div className="font-medium">{speaker.nome}</div><div className="text-xs text-muted-foreground">{speaker.tema} · {speaker.valor}</div><p className="mt-1 text-sm">Perfil alinhado ao briefing e aos objetivos do cliente.</p></div><Badge variant="outline">Recomendado</Badge></div>)}<Button variant="outline" className="w-full" onClick={() => toast.info("PDF demonstrativo: nenhum arquivo foi criado.")}><FileDown className="h-4 w-4" /> Gerar PDF de recomendações</Button></CardContent></Card></TabsContent>
          <TabsContent value="proposta" className="pt-4"><Card><CardHeader><CardTitle className="text-base">Proposta comercial</CardTitle></CardHeader><CardContent className="space-y-3"><div className="rounded-md bg-muted p-3 text-sm">Somente palestrantes recomendados podem compor a proposta.</div>{speakers.map((speaker) => <label key={speaker.id} className="flex items-center gap-3 rounded-md border p-3"><Checkbox defaultChecked={speaker.id !== "tallis"} /><div className="flex-1 text-sm">{speaker.nome}</div><strong className="text-sm">{speaker.valor}</strong></label>)}<div className="grid gap-3 sm:grid-cols-2"><Input defaultValue="50% na assinatura + 50% antes do evento" /><Input defaultValue="Validade: 10 dias" /></div><Button className="w-full" onClick={() => toast.info("PDF demonstrativo: nenhum arquivo foi criado.")}><FileDown className="h-4 w-4" /> Gerar PDF da proposta</Button></CardContent></Card></TabsContent>
          <TabsContent value="fechamento" className="grid gap-4 pt-4 lg:grid-cols-2"><Card><CardHeader><CardTitle className="text-base">Ganho e perdas obrigatórias</CardTitle></CardHeader><CardContent className="space-y-4"><RadioGroup value={winner} onValueChange={setWinner}>{speakers.map((speaker) => <label key={speaker.id} className="flex items-center gap-3 rounded-md border p-3"><RadioGroupItem value={speaker.id} /><span className="flex-1 text-sm font-medium">{speaker.nome}</span>{winner === speaker.id && <Badge className="bg-success text-success-foreground">Ganho</Badge>}</label>)}</RadioGroup>{losers.map((speaker) => <div key={speaker.id}><Label className="text-xs">Motivo de perda — {speaker.nome}</Label><Textarea rows={2} value={losses[speaker.id] ?? ""} onChange={(event) => setLosses((old) => ({ ...old, [speaker.id]: event.target.value }))} /></div>)}<label className="flex items-center gap-2 text-sm"><Checkbox checked={cnpj} onCheckedChange={(checked) => setCnpj(!!checked)} /> CNPJ do cliente conferido</label><Button disabled={!ready} className="w-full" onClick={() => toast.success("Fechamento demonstrativo validado.")}><Trophy className="h-4 w-4" /> Confirmar fechamento</Button></CardContent></Card><Card><CardHeader><CardTitle className="text-base">Histórico dos palestrantes</CardTitle></CardHeader><CardContent className="space-y-4">{speakers.map((speaker) => { const won = speaker.id === winner; return <div key={speaker.id} className="flex gap-3 border-b pb-3"><div className={won ? "text-success" : "text-destructive"}>{won ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}</div><div><div className="text-sm font-medium">{speaker.nome}</div><p className="text-xs text-muted-foreground">{won ? "Contratado para o evento." : losses[speaker.id] || "O motivo da perda aparecerá aqui."}</p></div></div>; })}</CardContent></Card></TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}