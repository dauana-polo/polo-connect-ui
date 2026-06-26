import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const WHATSAPP_URL =
  "https://api.whatsapp.com/send?phone=5512982506250&text=Olá, gostaria de saber mais a respeito de palestrantes para o meu evento!";

export function PoloMark({ className = "" }: { className?: string }) {
  return (
    <img
      src="https://www.polopalestrantes.com.br/images/logo-2024-white.png"
      alt="Polo Palestrantes"
      className={`h-9 w-auto ${className}`}
    />
  );
}

const nav = [
  { to: "/catalogo", label: "Palestrantes" },
  { to: "/catalogo", label: "Mestres de Cerimônia" },
  { to: "/institucional", label: "Blog" },
  { to: "/orcamento", label: "Orçamento" },
  { to: "/institucional", label: "Nosso Time" },
  { to: "/orcamento", label: "Contato" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-[#1e1e1e] bg-[#0d0d0d]">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="group"><PoloMark /></Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {nav.map((n, i) => (
            <Link
              key={`${n.label}-${i}`}
              to={n.to}
              className="text-[13px] font-medium text-white/70 transition-colors hover:text-[var(--brand)]"
              activeProps={{ className: "text-[var(--brand)]" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="/app"
            className="text-[12px] font-medium uppercase tracking-wider text-white/60 hover:text-white"
          >
            Quero ser Palestrante Polo!
          </a>
          <Button
            size="sm"
            className="h-10 rounded bg-[var(--brand)] px-4 text-[13px] font-semibold text-black hover:bg-[var(--brand-dark)]"
            asChild
          >
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">Fale com um consultor!</a>
          </Button>
        </div>

        <button
          className="grid h-9 w-9 place-items-center rounded-md border border-[#2a2a2a] text-white lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[#1e1e1e] bg-[#0d0d0d] lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
            {nav.map((n, i) => (
              <Link
                key={`m-${n.label}-${i}`}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2.5 text-sm font-medium text-white/80 hover:bg-[#161616] hover:text-[var(--brand)]"
              >
                {n.label}
              </Link>
            ))}
            <Button
              size="sm"
              className="mt-3 bg-[var(--brand)] text-black hover:bg-[var(--brand-dark)]"
              asChild
            >
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">Fale com um consultor!</a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
