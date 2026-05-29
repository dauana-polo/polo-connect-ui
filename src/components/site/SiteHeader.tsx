import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function PoloMark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="relative inline-grid h-7 w-7 place-items-center">
        <span className="absolute inset-0 rounded-[6px] bg-[var(--ink)]" />
        <span className="absolute inset-[3px] rounded-[3px] border border-[color-mix(in_oklab,white_20%,transparent)]" />
        <span className="relative z-10 text-[11px] font-bold tracking-tight text-white">P<span className="text-[var(--brand)]">.</span></span>
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[13px] font-semibold tracking-[0.02em]">Polo</span>
        <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">Palestrantes</span>
      </span>
    </span>
  );
}

const nav = [
  { to: "/catalogo", label: "Especialistas" },
  { to: "/solucoes", label: "Soluções" },
  { to: "/institucional", label: "A Polo" },
  { to: "/orcamento", label: "Curadoria" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="group"><PoloMark /></Link>

        <nav className="hidden items-center gap-9 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/app">Acessar plataforma</Link>
          </Button>
          <Button size="sm" className="bg-[var(--brand)] text-white hover:bg-[var(--brand-dark)]" asChild>
            <Link to="/orcamento">Falar com curadoria</Link>
          </Button>
        </div>

        <button
          className="grid h-9 w-9 place-items-center rounded-md border md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <div className="border-t bg-background md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {n.label}
              </Link>
            ))}
            <Button size="sm" className="mt-2 bg-[var(--brand)] text-white hover:bg-[var(--brand-dark)]" asChild>
              <Link to="/orcamento">Falar com curadoria</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
