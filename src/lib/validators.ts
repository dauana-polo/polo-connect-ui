// Schemas zod reutilizáveis. Use com react-hook-form + zodResolver em toda tela de cadastro.
import { z } from "zod";

const onlyDigits = (v: string) => v.replace(/\D/g, "");

/** Valida dígitos verificadores do CNPJ. */
export const isValidCNPJ = (raw: string) => {
  const s = onlyDigits(raw);
  if (s.length !== 14 || /^(\d)\1+$/.test(s)) return false;
  const calc = (base: string, weights: number[]) => {
    const sum = base.split("").reduce((acc, d, i) => acc + Number(d) * weights[i], 0);
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };
  const d1 = calc(s.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = calc(s.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return d1 === Number(s[12]) && d2 === Number(s[13]);
};

/** Valida dígitos verificadores do CPF. */
export const isValidCPF = (raw: string) => {
  const s = onlyDigits(raw);
  if (s.length !== 11 || /^(\d)\1+$/.test(s)) return false;
  const calc = (base: string, factor: number) => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) sum += Number(base[i]) * (factor - i);
    const mod = (sum * 10) % 11;
    return mod === 10 ? 0 : mod;
  };
  return calc(s.slice(0, 9), 10) === Number(s[9]) && calc(s.slice(0, 10), 11) === Number(s[10]);
};

// -------- Campos comuns --------
export const requiredString = (label = "Campo") =>
  z.string().trim().min(1, `${label} é obrigatório`);

export const emailSchema = z
  .string()
  .trim()
  .min(1, "E-mail é obrigatório")
  .email("E-mail inválido")
  .max(255);

export const optionalEmail = z
  .string()
  .trim()
  .max(255)
  .email("E-mail inválido")
  .or(z.literal(""))
  .optional();

export const phoneSchema = z
  .string()
  .trim()
  .refine((v) => !v || [10, 11].includes(onlyDigits(v).length), "Telefone inválido");

export const cnpjSchema = z
  .string()
  .trim()
  .refine((v) => !v || isValidCNPJ(v), "CNPJ inválido");

export const requiredCNPJ = z
  .string()
  .trim()
  .min(1, "CNPJ é obrigatório")
  .refine(isValidCNPJ, "CNPJ inválido");

export const cpfSchema = z
  .string()
  .trim()
  .refine((v) => !v || isValidCPF(v), "CPF inválido");

export const cepSchema = z
  .string()
  .trim()
  .refine((v) => !v || onlyDigits(v).length === 8, "CEP inválido");

export const moneySchema = z
  .union([z.string(), z.number()])
  .transform((v) => (typeof v === "string" ? Number(v.replace(/\./g, "").replace(",", ".")) : v))
  .refine((v) => Number.isFinite(v) && v >= 0, "Valor inválido");

export const isoDateSchema = z
  .string()
  .trim()
  .refine((v) => !v || !Number.isNaN(new Date(v).getTime()), "Data inválida");

export const requiredIsoDate = z
  .string()
  .trim()
  .min(1, "Data é obrigatória")
  .refine((v) => !Number.isNaN(new Date(v).getTime()), "Data inválida");
