// Centralized formatters — replace ad-hoc Intl usage across routes/components.

export const formatCurrency = (
  value: number | string | null | undefined,
  opts: { compact?: boolean; noFraction?: boolean } = {},
) => {
  const n = typeof value === "string" ? Number(value) : (value ?? 0);
  const safe = Number.isFinite(n) ? n : 0;
  return safe.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: opts.compact ? "compact" : "standard",
    maximumFractionDigits: opts.noFraction ? 0 : 2,
    minimumFractionDigits: opts.noFraction ? 0 : 2,
  });
};

export const formatNumber = (value: number | null | undefined) =>
  (value ?? 0).toLocaleString("pt-BR");

export const formatDate = (v: string | Date | null | undefined) => {
  if (!v) return "—";
  const d = typeof v === "string" ? new Date(v) : v;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
};

export const formatDateTime = (v: string | Date | null | undefined) => {
  if (!v) return "—";
  const d = typeof v === "string" ? new Date(v) : v;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
};

export const formatCNPJ = (raw: string | null | undefined) => {
  const s = (raw ?? "").replace(/\D/g, "").slice(0, 14);
  if (s.length !== 14) return raw ?? "";
  return `${s.slice(0, 2)}.${s.slice(2, 5)}.${s.slice(5, 8)}/${s.slice(8, 12)}-${s.slice(12)}`;
};

export const formatCPF = (raw: string | null | undefined) => {
  const s = (raw ?? "").replace(/\D/g, "").slice(0, 11);
  if (s.length !== 11) return raw ?? "";
  return `${s.slice(0, 3)}.${s.slice(3, 6)}.${s.slice(6, 9)}-${s.slice(9)}`;
};

export const formatPhone = (raw: string | null | undefined) => {
  const s = (raw ?? "").replace(/\D/g, "");
  if (s.length === 11) return `(${s.slice(0, 2)}) ${s.slice(2, 7)}-${s.slice(7)}`;
  if (s.length === 10) return `(${s.slice(0, 2)}) ${s.slice(2, 6)}-${s.slice(6)}`;
  return raw ?? "";
};

export const formatPercent = (v: number | null | undefined, digits = 1) =>
  `${((v ?? 0)).toFixed(digits).replace(".", ",")}%`;
