import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppTopbar } from "@/components/AppSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { contratos, formatBRL } from "@/lib/mock-data";
import { Download, FileSignature, Plus } from "lucide-react";

export const Route = createFileRoute("/app/juridico")({
  component: Juridico,
});

const statusCor: Record<string, string> = {
  rascunho: "bg-slate-500",
  enviado: "bg-blue-500",
  assinado: "bg-emerald-500",
  arquivado: "bg-zinc-500",
};

const modelos = [
  { id: "padrao", nome: "Contrato Padrão", desc: "Eventos nacionais, palestrante PJ" },
  { id: "corporativo", nome: "Corporativo", desc: "Grandes empresas, cláusulas estendidas" },
  { id: "exclusivo", nome: "Exclusivo", desc: "Exclusividade temporal e setorial" },
  { id: "internacional", nome: "Internacional", desc: "Bilíngue, foro internacional" },
];

function Juridico() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AppTopbar title="Jurídico" breadcrumb={["Home", "Jurídico", "Contratos"]} />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {modelos.map((m) => (
            <Card key={m.id} className="hover:border-primary/40 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 grid place-items-center mb-3"><FileSignature className="h-5 w-5 text-primary" /></div>
                <div className="font-semibold text-sm">{m.nome}</div>
                <p className="text-xs text-muted-foreground mt-1">{m.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end">
          <Button><Plus className="h-4 w-4 mr-1.5" />Novo Contrato</Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Número</th>
                  <th className="text-left px-2 py-3 font-medium">Cliente</th>
                  <th className="text-left px-2 py-3 font-medium">Modelo</th>
                  <th className="text-right px-2 py-3 font-medium">Valor</th>
                  <th className="text-left px-2 py-3 font-medium">Data</th>
                  <th className="text-left px-2 py-3 font-medium">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {contratos.map((c) => (
                  <tr key={c.id} className="border-t hover:bg-muted/30">
                    <td className="px-5 py-3 font-mono text-xs">{c.numero}</td>
                    <td className="px-2 py-3 font-medium">{c.cliente}</td>
                    <td className="px-2 py-3 text-muted-foreground capitalize">{c.modelo}</td>
                    <td className="px-2 py-3 text-right font-semibold">{formatBRL(c.valor)}</td>
                    <td className="px-2 py-3 text-muted-foreground">{c.data}</td>
                    <td className="px-2 py-3"><Badge className={`${statusCor[c.status]} text-white hover:${statusCor[c.status]}`}>{c.status}</Badge></td>
                    <td className="px-5 py-3 text-right"><Button size="sm" variant="ghost" onClick={() => setOpen(true)}>Visualizar</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Preview do contrato</DialogTitle></DialogHeader>
          <div className="bg-white border rounded-lg p-10 max-h-[70vh] overflow-y-auto shadow-inner space-y-5 text-sm">
            <div className="text-center space-y-1 border-b pb-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Contrato de Prestação de Serviços</div>
              <div className="font-mono text-xs">CT-2025-098</div>
            </div>
            <p className="text-muted-foreground leading-relaxed">Pelo presente instrumento particular, de um lado <b>Polo Palestrantes LTDA</b>, inscrita no CNPJ sob o nº 12.345.678/0001-90, doravante denominada CONTRATADA, e de outro lado <b>Itaú Unibanco S.A.</b>, doravante denominada CONTRATANTE, têm entre si justo e acordado o seguinte:</p>
            <div>
              <h3 className="font-semibold mb-1">Cláusula 1ª — Objeto</h3>
              <p className="text-muted-foreground">Prestação de serviços de palestra magna pelo profissional Dr. Ricardo Almeida no evento "Convenção Top Performers".</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Cláusula 2ª — Valor</h3>
              <p className="text-muted-foreground">R$ 35.000,00 (trinta e cinco mil reais), pagos em duas parcelas iguais.</p>
            </div>
            <div className="pt-12 flex justify-around text-center text-xs">
              <div><div className="border-t border-foreground w-48 pt-1">CONTRATANTE</div></div>
              <div><div className="border-t border-foreground w-48 pt-1">CONTRATADA</div></div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline"><Download className="h-4 w-4 mr-1.5" />Baixar</Button>
            <Button>Enviar para assinatura</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
