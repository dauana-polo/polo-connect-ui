import { Phone, Smartphone, Mail, Instagram, Linkedin, Youtube, ArrowRight } from "lucide-react";
import { PoloMark } from "./SiteHeader";

export function SiteFooter() {
  return (
    <footer className="relative mt-24 border-t border-[#1e1e1e] bg-[#080808] text-white">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--brand)]/60 to-transparent" />
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <PoloMark />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/55">
              Mais que uma agência, curadores de palestras. Conectamos empresas aos
              palestrantes certos para cada evento.
            </p>
          </div>

          <div className="md:col-span-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">
              Fale Conosco
            </div>
            <ul className="mt-5 space-y-3 text-sm text-white/75">
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-[var(--brand)]" />
                <a href="tel:+551234130004" className="hover:text-white">12 3413 0004</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Smartphone className="h-4 w-4 text-[var(--brand)]" />
                <a href="tel:+5512982506250" className="hover:text-white">12 98250 6250</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-[var(--brand)]" />
                <a href="mailto:contato@polopalestrantes.com" className="hover:text-white">
                  contato@polopalestrantes.com
                </a>
              </li>
            </ul>
            <div className="mt-6 flex gap-3">
              <a
                href="https://www.instagram.com/polopalestrantes/"
                target="_blank" rel="noreferrer"
                className="grid h-9 w-9 place-items-center rounded-full border border-[#2a2a2a] text-white/70 transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.linkedin.com/company/polopalestrantes/"
                target="_blank" rel="noreferrer"
                className="grid h-9 w-9 place-items-center rounded-full border border-[#2a2a2a] text-white/70 transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://www.youtube.com/channel/UCQ_RuwRB6QVSSZ-BYbqcbvg"
                target="_blank" rel="noreferrer"
                className="grid h-9 w-9 place-items-center rounded-full border border-[#2a2a2a] text-white/70 transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">
              Conheça o nosso time
            </div>
            <p className="mt-5 text-sm leading-relaxed text-white/55">
              Uma empresa é feita de pessoas! Aqui na Polo temos orgulho de mostrar o time
              que faz tudo acontecer e transforma pessoas ao redor do Brasil.
            </p>
            <a
              href="/institucional"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--brand)] hover:text-white"
            >
              Clique aqui e conheça <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-[#1e1e1e] pt-6 text-xs text-white/40 md:flex-row md:items-center">
          <div>© {new Date().getFullYear()} Polo Palestrantes · Todos os direitos reservados</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Termos</a>
            <a href="#" className="hover:text-white">Privacidade</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
