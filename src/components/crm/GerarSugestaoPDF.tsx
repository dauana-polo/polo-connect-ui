import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function GerarSugestaoPDF({ propostaId }: { propostaId: string }) {
  const qc = useQueryClient();
  const [gerando, setGerando] = useState(false);

  const { data } = useQuery({
    queryKey: ["proposta-pdf-data", propostaId],
    queryFn: async () => {
      const { data: prop, error } = await supabase
        .from("propostas")
        .select("*, cliente:clientes(razao_social,nome_fantasia), lead:leads(empresa,tema_evento,data_pretendida,cidade_evento), proposta_palestrantes(*, palestrante:palestrantes(nome,bio,foto_url,temas))")
        .eq("id", propostaId)
        .single();
      if (error) throw error;
      return prop as any;
    },
  });

  const salvarUrl = useMutation({
    mutationFn: async (url: string) => {
      const { error } = await supabase.from("propostas").update({ pdf_sugestao_url: url }).eq("id", propostaId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lead-propostas", data?.lead_id] }),
  });

  const gerar = async () => {
    if (!data) return;
    setGerando(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const container = document.createElement("div");
      container.style.fontFamily = "Inter, system-ui, sans-serif";
      container.style.color = "#0f172a";
      container.innerHTML = renderHTML(data);
      document.body.appendChild(container);

      const blob: Blob = await html2pdf()
        .from(container)
        .set({
          margin: 0,
          filename: `sugestao-${data.lead?.empresa ?? "proposta"}.pdf`,
          image: { type: "jpeg", quality: 0.95 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"] },
        })
        .outputPdf("blob");

      document.body.removeChild(container);

      // Download local
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sugestao-${data.lead?.empresa ?? "proposta"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      // Record that a PDF was generated (URL placeholder — storage upload optional)
      await salvarUrl.mutateAsync(`local://sugestao-${propostaId}.pdf`);
      toast.success("PDF gerado");
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao gerar PDF");
    } finally {
      setGerando(false);
    }
  };

  return (
    <Button size="sm" variant="outline" onClick={gerar} disabled={gerando || !data}>
      {gerando ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <FileDown className="h-4 w-4 mr-1.5" />}
      Gerar PDF de sugestão
    </Button>
  );
}

function renderHTML(p: any): string {
  const palestrantes = (p.proposta_palestrantes ?? []) as any[];
  const clienteNome = p.cliente?.nome_fantasia || p.cliente?.razao_social || p.lead?.empresa || "Cliente";
  const data = p.lead?.data_pretendida ? new Date(p.lead.data_pretendida).toLocaleDateString("pt-BR") : "—";

  const capa = `
    <section style="page-break-after:always;height:297mm;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;background:linear-gradient(135deg,#7c3aed 0%,#ec4899 100%);color:white;padding:60px;">
      <div style="font-size:14px;letter-spacing:6px;text-transform:uppercase;opacity:.85;margin-bottom:16px;">Polo Palestrantes</div>
      <h1 style="font-size:42px;font-weight:800;margin:0 0 24px;line-height:1.1;">Sugestão de Palestrantes</h1>
      <div style="font-size:20px;font-weight:500;opacity:.95;">${escape(clienteNome)}</div>
      <div style="font-size:14px;opacity:.8;margin-top:8px;">${escape(p.lead?.tema_evento ?? "")}</div>
      <div style="margin-top:40px;font-size:13px;opacity:.75;">Evento: ${data} · ${escape(p.lead?.cidade_evento ?? "—")}</div>
    </section>
  `;

  const paginas = palestrantes.map((pp, i) => {
    const pal = pp.palestrante ?? {};
    return `
    <section style="${i < palestrantes.length - 1 ? "page-break-after:always;" : ""}min-height:297mm;padding:40px 50px;box-sizing:border-box;">
      <header style="display:flex;align-items:center;gap:24px;border-bottom:3px solid #7c3aed;padding-bottom:24px;margin-bottom:24px;">
        ${pal.foto_url ? `<img src="${escape(pal.foto_url)}" style="width:120px;height:120px;border-radius:50%;object-fit:cover;border:4px solid #f1f5f9;" />` : `<div style="width:120px;height:120px;border-radius:50%;background:#e2e8f0;display:flex;align-items:center;justify-content:center;font-size:48px;font-weight:700;color:#7c3aed;">${escape((pal.nome ?? "?")[0])}</div>`}
        <div>
          <h2 style="font-size:28px;font-weight:700;margin:0 0 6px;color:#0f172a;">${escape(pal.nome ?? "—")}</h2>
          <div style="display:flex;flex-wrap:wrap;gap:6px;">
            ${(pal.temas ?? []).slice(0, 5).map((t: string) => `<span style="font-size:11px;background:#f1f5f9;color:#475569;padding:3px 10px;border-radius:99px;">${escape(t)}</span>`).join("")}
          </div>
        </div>
      </header>
      <section style="margin-bottom:24px;">
        <h3 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#7c3aed;margin:0 0 8px;">Biografia</h3>
        <p style="font-size:13px;line-height:1.7;color:#334155;white-space:pre-wrap;margin:0;">${escape(pal.bio ?? "—")}</p>
      </section>
      ${pp.justificativa ? `
      <section style="background:#faf5ff;border-left:4px solid #7c3aed;padding:16px 20px;border-radius:6px;">
        <h3 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#7c3aed;margin:0 0 8px;">Por que este palestrante para o(a) ${escape(clienteNome)}</h3>
        <p style="font-size:13px;line-height:1.7;color:#334155;margin:0;white-space:pre-wrap;">${escape(pp.justificativa)}</p>
      </section>` : ""}
    </section>
    `;
  }).join("");

  return capa + paginas;
}

function escape(s: any): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]!));
}
