import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, FileText, Kanban, DollarSign, Scale,
  Settings, Mic2, Search, Bell, ChevronDown, Sparkles,
  Plane, ClipboardCheck, Building2, TrendingUp, UserCog, Wallet, PieChart,
} from "lucide-react";

const nav = [
  { group: "Principal", items: [
    { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { to: "/app/crm", label: "CRM Comercial", icon: Users },
    { to: "/app/propostas", label: "Propostas", icon: FileText },
    { to: "/app/vendas", label: "Vendas", icon: TrendingUp },
    { to: "/app/kanban", label: "Kanban Multi", icon: Kanban },
  ]},
  { group: "Cadastros", items: [
    { to: "/app/clientes", label: "Clientes 360°", icon: Building2 },
    { to: "/app/palestrantes", label: "Palestrantes", icon: UserCog },
  ]},
  { group: "Operação", items: [
    { to: "/app/logistica", label: "Logística", icon: Plane },
    { to: "/app/eventos", label: "Eventos & NPS", icon: ClipboardCheck },
    { to: "/app/juridico", label: "Jurídico", icon: Scale },
  ]},
  { group: "Financeiro", items: [
    { to: "/app/financeiro", label: "Financeiro", icon: DollarSign },
    { to: "/app/comissoes", label: "Comissões", icon: Wallet },
    { to: "/app/prebalanco", label: "Pré-Balanço", icon: PieChart },
  ]},
  { group: "Sistema", items: [
    { to: "/app/admin", label: "Administração", icon: Settings },
    { to: "/portal", label: "Portal Palestrante", icon: Mic2 },
  ]},
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-sidebar-border">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 grid place-items-center shadow-lg shadow-violet-500/20">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="leading-tight">
          <div className="font-semibold text-sm tracking-tight">Polo Palestrantes</div>
          <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50">Enterprise</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {nav.map((g) => (
          <div key={g.group}>
            <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
              {g.group}
            </div>
            <div className="space-y-0.5">
              {g.items.map((item) => {
                const active = isActive(item.to, item.exact);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${active ? "text-sidebar-primary" : ""}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sidebar-accent/50 cursor-pointer">
          <img src="https://i.pravatar.cc/64?img=5" alt="" className="h-9 w-9 rounded-full ring-2 ring-sidebar-border" />
          <div className="flex-1 leading-tight min-w-0">
            <div className="text-sm font-medium truncate">Roberto Dias</div>
            <div className="text-[11px] text-sidebar-foreground/50 truncate">Administrador</div>
          </div>
          <ChevronDown className="h-4 w-4 text-sidebar-foreground/50" />
        </div>
      </div>
    </aside>
  );
}

export function AppTopbar({ title, breadcrumb }: { title: string; breadcrumb?: string[] }) {
  return (
    <header className="h-16 flex items-center justify-between gap-4 px-6 border-b border-border bg-card">
      <div>
        {breadcrumb && (
          <div className="text-xs text-muted-foreground mb-0.5">
            {breadcrumb.join(" / ")}
          </div>
        )}
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 h-10 w-80 px-3 rounded-lg border border-border bg-background">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input className="bg-transparent outline-none text-sm flex-1" placeholder="Buscar leads, palestrantes, propostas..." />
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">⌘K</kbd>
        </div>
        <button className="relative h-10 w-10 grid place-items-center rounded-lg hover:bg-muted">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-card" />
        </button>
      </div>
    </header>
  );
}
