import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BadgeCheck, CheckCircle2, Mail, MessageSquare, Phone } from "lucide-react";
import { useState } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/orcamento")({
  head: () => ({
    meta: [
      { title: "Falar com curadoria — Polo Palestrantes" },
      { name: "description", content: "Receba uma curadoria personalizada de especialistas em até 24h úteis. Atendimento consultivo Polo." },
    ],
  }),
  component: Orcamento,
});

function Orcamento() {
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="border-b bg-[var(--ink)] text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--brand)]">Atendimento consultivo</div>
          <h1 className="mt-4 max-w-3xl text-balance text-5xl font-semibold tracking-[-0.025em] md:text-6xl">
            Fale com nossa curadoria.
          </h1>
          <p className="mt-5 max-w-2xl text-white/65">
            Conte-nos sobre seu evento. Em até 24h úteis nossa equipe apresenta
            uma curadoria personalizada de especialistas alinhados ao seu desafio.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <aside className="space-y-4 lg:col-span-4">
            <Block icon={BadgeCheck} title="Resposta em 24h úteis" d="Curadoria personalizada apresentada por um consultor dedicado." />
            <Block icon={MessageSquare} title="Atendimento consultivo" d="Reunião de briefing para entender contexto e objetivo." />
            <Block icon={Mail} title="curadoria@polopalestrantes.com" d="Atendimento direto com nossa equipe." />
            <Block icon={Phone} title="+55 11 4002-8922" d="Segunda a sexta, das 9h às 19h." />
          </aside>

          <div className="lg:col-span-8">
            {sent ? (
              <div className="rounded-2xl border bg-card p-12 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[var(--brand)]/10">
                  <CheckCircle2 className="h-7 w-7 text-[var(--brand)]" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold tracking-tight">Briefing recebido.</h2>
                <p className="mt-2 text-muted-foreground">
                  Nossa equipe de curadoria entrará em contato em até 24h úteis com
                  uma seleção personalizada de especialistas.
                </p>
                <Button className="mt-6 bg-[var(--brand)] text-white hover:bg-[var(--brand-dark)]" asChild>
                  <Link to="/">Voltar ao início</Link>
                </Button>
              </div>
            ) : (
              <form
                onSubmit={(e) => { e.preventDefault(); setSent(true); }}
                className="space-y-6 rounded-2xl border bg-card p-8 md:p-10"
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Nome completo" required><Input required placeholder="Como podemos te chamar?" /></Field>
                  <Field label="E-mail corporativo" required><Input required type="email" placeholder="voce@empresa.com" /></Field>
                  <Field label="Empresa" required><Input required placeholder="Nome da empresa" /></Field>
                  <Field label="Cargo"><Input placeholder="Seu cargo" /></Field>
                  <Field label="Tipo de evento">
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="palestra">Palestra</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="treinamento">Treinamento</SelectItem>
                        <SelectItem value="imersao">Imersão</SelectItem>
                        <SelectItem value="convencao">Convenção</SelectItem>
                        <SelectItem value="sipat">SIPAT</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Público estimado">
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50">Até 50</SelectItem>
                        <SelectItem value="200">50 a 200</SelectItem>
                        <SelectItem value="500">200 a 500</SelectItem>
                        <SelectItem value="1000">500 a 1.000</SelectItem>
                        <SelectItem value="mais">Mais de 1.000</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <Field label="Tema / desafio do evento">
                  <Textarea rows={5} placeholder="Conte um pouco sobre o público, o objetivo e o resultado esperado." />
                </Field>

                <div className="flex flex-col items-start justify-between gap-4 border-t pt-6 sm:flex-row sm:items-center">
                  <div className="text-xs text-muted-foreground">
                    Ao enviar, você concorda com nossa política de privacidade.
                  </div>
                  <Button type="submit" size="lg" className="bg-[var(--brand)] px-6 text-white hover:bg-[var(--brand-dark)]">
                    Enviar briefing
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}{required && <span className="ml-0.5 text-[var(--brand)]">*</span>}
      </Label>
      {children}
    </div>
  );
}

function Block({ icon: Icon, title, d }: { icon: React.ComponentType<{ className?: string }>; title: string; d: string }) {
  return (
    <div className="flex gap-4 rounded-md border bg-card p-5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[var(--ice)] text-[var(--brand)]">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="mt-1 text-xs text-muted-foreground">{d}</div>
      </div>
    </div>
  );
}
