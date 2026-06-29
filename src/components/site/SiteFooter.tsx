import { Link } from "@tanstack/react-router";
import { PoloMark } from "./SiteHeader";

export function SiteFooter() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-[var(--ink)] text-[var(--ice)]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--brand)]/60 to-transparent" />
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="text-white"><PoloMark /></div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
              Bureau premium de especialistas e soluções de educação corporativa.
              Curadoria estratégica para empresas que desenvolvem pessoas,
              cultura e performance.
            </p>
            <div className="mt-6 flex gap-2">
              <span className="rounded-full border border-white/15 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/70">
                Desde 2010
              </span>
              <span className="rounded-full border border-white/15 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/70">
                +1.500 eventos
              </span>
            </div>
          </div>

          <FooterCol title="Plataforma" links={[
            { to: "/catalogo", label: "Especialistas" },
            { to: "/solucoes", label: "Soluções" },
            { to: "/institucional", label: "A Polo" },
            { to: "/orcamento", label: "Curadoria" },
          ]} />
          <FooterCol title="Soluções" links={[
            { to: "/solucoes", label: "Palestras" },
            { to: "/solucoes", label: "Workshops" },
            { to: "/solucoes", label: "Treinamentos" },
            { to: "/solucoes", label: "Imersões" },
          ]} />
          <FooterCol title="Contato" links={[
            { to: "/orcamento", label: "Falar com curadoria" },
            { to: "/orcamento", label: "Eventos corporativos" },
            { to: "/orcamento", label: "Parcerias" },
          ]} />
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row md:items-center">
          <div>© {new Date().getFullYear()} Polo Palestrantes · Educação corporativa premium</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Termos</a>
            <a href="#" className="hover:text-white">Privacidade</a>
            <a href="#" className="hover:text-white">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div className="md:col-span-2">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">{title}</div>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((l, i) => (
          <li key={i}>
            <Link to={l.to} className="text-white/80 transition-colors hover:text-white">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
