import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { Play, Search, Sparkle, Star, UserRound } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/catalogo")({
  head: () => ({
    meta: [
      { title: "Especialistas — Polo Palestrantes" },
      { name: "description", content: "Vitrine premium de especialistas curados pela Polo Palestrantes para eventos corporativos." },
      { property: "og:title", content: "Especialistas — Polo Palestrantes" },
      { property: "og:description", content: "Vitrine curada de especialistas para eventos corporativos." },
    ],
  }),
  component: Catalogo,
});

type Palestrante = {
  id: string;
  nome: string;
  mini_bio: string | null;
  bio: string | null;
  foto_url: string | null;
  temas: string[] | null;
  avaliacao_media: number | null;
  total_eventos: number | null;
};

function Catalogo() {
  const [q, setQ] = useState("");
  const [tema, setTema] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [rows, setRows] = useState<Palestrante[]>([]);

  const load = () => {
    setLoading(true);
    setError(null);
    supabase
      .from("palestrantes")
      .select("id,nome,mini_bio,bio,foto_url,temas,avaliacao_media,total_eventos")
      .eq("publicar_site", true)
      .eq("status", "ativo")
      .order("nome")
      .then(({ data, error }) => {
        if (error) setError(new Error(error.message));
        else setRows((data ?? []) as Palestrante[]);
      })
      .then(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const todosTemas = useMemo(
    () => Array.from(new Set(rows.flatMap((p) => p.temas ?? []))),
    [rows],
  );

  const filtrados = rows.filter(
    (p) =>
      (!q || p.nome.toLowerCase().includes(q.toLowerCase())) &&
      (!tema || (p.temas ?? []).includes(tema)),
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="relative border-b bg-[var(--ice)]/40">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <div className="text-[11px] uppercase tracking-[0.28em] text-[var(--brand)]">Vitrine de especialistas</div>
          <h1 className="mt-4 max-w-3xl text-balance text-5xl font-semibold tracking-[-0.025em] md:text-6xl">
            Vozes curadas para líderes que constroem futuro.
          </h1>
          <p className="mt-5 max-w-2xl text-muted-foreground">
            Especialistas selecionados em educação corporativa, liderança, inovação, cultura e alta performance.
          </p>

          <div className="mt-10 flex max-w-xl items-center gap-2 rounded-md border bg-card px-3 py-2 shadow-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar especialista por nome..."
              className="border-0 px-0 shadow-none focus-visible:ring-0"
            />
          </div>

          {todosTemas.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={() => setTema(null)}
                className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                  !tema ? "border-[var(--ink)] bg-[var(--ink)] text-white" : "border-border text-muted-foreground hover:border-[var(--ink)] hover:text-foreground"
                }`}
              >
                Todos os temas
              </button>
              {todosTemas.map((t) => (
                <button
                  key={t}
                  onClick={() => setTema(t)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                    tema === t
                      ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                      : "border-border text-muted-foreground hover:border-[var(--brand)] hover:text-[var(--brand)]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        {loading ? (
          <LoadingState label="Carregando especialistas..." />
        ) : error ? (
          <ErrorState onRetry={load} message={error.message} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<UserRound className="h-8 w-8" />}
            title="Vitrine em construção"
            description="Ainda não há especialistas publicados no site."
          />
        ) : (
          <>
            <div className="mb-8 text-sm text-muted-foreground">
              {filtrados.length} {filtrados.length === 1 ? "especialista" : "especialistas"} encontrados
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtrados.map((p) => (
                <Link key={p.id} to="/palestrante/$id" params={{ id: p.id }} className="group">
                  <article className="overflow-hidden rounded-md border bg-card transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_color-mix(in_oklab,var(--ink)_40%,transparent)]">
                    <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                      {p.foto_url ? (
                        <img
                          src={p.foto_url}
                          alt={p.nome}
                          className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:scale-[1.04] group-hover:grayscale-0"
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-muted-foreground"><UserRound className="h-16 w-16" /></div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[var(--ink)]/90 via-[var(--ink)]/40 to-transparent" />
                      <div className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white backdrop-blur-md">
                        <Sparkle className="h-3 w-3 text-[var(--brand)]" /> Curado
                      </div>
                      <button className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100 hover:bg-[var(--brand)]">
                        <Play className="ml-0.5 h-4 w-4 fill-white" />
                      </button>
                      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                        <div className="text-xl font-semibold tracking-tight">{p.nome}</div>
                        <div className="mt-1 text-xs text-white/70">{(p.temas ?? [])[0] ?? ""}</div>
                      </div>
                    </div>
                    <div className="space-y-4 p-5">
                      {(p.mini_bio || p.bio) && (
                        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{p.mini_bio ?? p.bio}</p>
                      )}
                      {(p.temas ?? []).length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {(p.temas ?? []).map((t) => (
                            <Badge key={t} variant="secondary" className="rounded-full bg-[var(--ice)] text-[10px] font-medium text-foreground/70">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between border-t pt-4">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Star className="h-3.5 w-3.5 fill-[var(--brand)] text-[var(--brand)]" />
                          <span className="font-medium text-foreground">{(p.avaliacao_media ?? 0).toFixed(1)}</span>
                          <span>· {p.total_eventos ?? 0} eventos</span>
                        </div>
                        <span className="text-xs font-medium text-[var(--brand)]">Ver perfil →</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {filtrados.length === 0 && (
              <div className="rounded-md border bg-card py-20 text-center text-muted-foreground">
                Nenhum especialista encontrado com esses filtros.
              </div>
            )}
          </>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
