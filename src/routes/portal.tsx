import { Outlet, createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { Calendar, FileText, Home, Mic2, User, Wallet, FileSignature, ChevronDown, Sparkles, Bell } from "lucide-react";

export const Route = createFileRoute("/portal")({
  component: PortalLayout,
});

const items = [
  { to: "/portal", label: "Dashboard", icon: Home, exact: true },
  { to: "/portal/agenda", label: "Agenda", icon: Calendar },
  { to: "/portal/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/portal/contratos", label: "Contratos", icon: FileSignature },
  { to: "/portal/briefings", label: "Briefings", icon: FileText },
  { to: "/portal/perfil", label: "Meu Perfil", icon: User },
];

function PortalLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden md:flex w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-sidebar-border">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-rose-500 grid place-items-center">
            <Mic2 className="h-4 w-4 text-white" />
          </div>
          <div className="text-sm font-semibold">Portal Palestrante</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {items.map((i) => {
            const active = i.exact ? pathname === i.to : pathname.startsWith(i.to);
            return (
              <Link key={i.to} to={i.to} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"}`}>
                <i.icon className="h-4 w-4" />{i.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <Link to="/app" className="flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-sidebar-foreground/60 hover:bg-sidebar-accent/50">
            <Sparkles className="h-3.5 w-3.5" /> Ir para área admin
          </Link>
          <div className="flex items-center gap-2 px-2 py-2 mt-1 rounded-lg">
            <img src="https://i.pravatar.cc/64?img=12" className="h-8 w-8 rounded-full" alt="" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">Dr. Ricardo Almeida</div>
              <div className="text-[11px] text-sidebar-foreground/50">Palestrante</div>
            </div>
            <ChevronDown className="h-4 w-4 text-sidebar-foreground/50" />
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-6 border-b bg-card">
          <h1 className="font-semibold tracking-tight">Bem-vindo de volta, Ricardo 👋</h1>
          <button className="relative h-10 w-10 grid place-items-center rounded-lg hover:bg-muted"><Bell className="h-4 w-4" /><span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-card" /></button>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
