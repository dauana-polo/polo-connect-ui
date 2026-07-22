import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard, Users, FileText, Kanban, DollarSign, Scale,
  Settings, Mic2, Search, ChevronDown, Sparkles,
  Plane, ClipboardCheck, Building2, TrendingUp, UserCog, Wallet, PieChart, Menu, LogOut,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { NotificationBell } from "@/components/NotificationBell";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

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

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");
  return (
    <>
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
                    onClick={onNavigate}
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
      <UserFooter />
    </>
  );
}

function UserFooter() {
  const { user, roles } = useAuth();
  const navigate = useNavigate();
  const nome = (user?.user_metadata?.name as string) || user?.email?.split("@")[0] || "Usuário";
  const perfil = roles[0] ?? "—";
  async function handleLogout() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  return (
    <div className="p-3 border-t border-sidebar-border">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sidebar-accent/50">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 grid place-items-center text-white text-sm font-semibold ring-2 ring-sidebar-border">
              {nome.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 leading-tight min-w-0 text-left">
              <div className="text-sm font-medium truncate">{nome}</div>
              <div className="text-[11px] text-sidebar-foreground/50 truncate capitalize">{perfil.replace("_", " ")}</div>
            </div>
            <ChevronDown className="h-4 w-4 text-sidebar-foreground/50" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="truncate">{user?.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function AppSidebar() {
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <NavContent />
    </aside>
  );
}

export function AppTopbar({ title, breadcrumb }: { title: string; breadcrumb?: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="h-16 flex items-center justify-between gap-4 px-4 md:px-6 border-b border-border bg-card">
      <div className="flex items-center gap-3 min-w-0">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="md:hidden h-9 w-9 grid place-items-center rounded-lg hover:bg-muted shrink-0" aria-label="Abrir menu">
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 bg-sidebar text-sidebar-foreground flex flex-col">
            <NavContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="min-w-0">
          {breadcrumb && (
            <div className="text-xs text-muted-foreground mb-0.5 truncate">
              {breadcrumb.join(" / ")}
            </div>
          )}
          <h1 className="text-base md:text-lg font-semibold tracking-tight truncate">{title}</h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 h-10 w-80 px-3 rounded-lg border border-border bg-background">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input className="bg-transparent outline-none text-sm flex-1" placeholder="Buscar leads, palestrantes, propostas..." />
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">⌘K</kbd>
        </div>
        <NotificationBell />
      </div>
    </header>
  );
}
