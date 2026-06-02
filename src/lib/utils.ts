// Utilitário padrão do ecossistema ShadCN/UI.
// Combina classes condicionais (clsx) e resolve conflitos do Tailwind (tailwind-merge).

import { clsx, type ClassValue } from "clsx";        // Monta strings de classe a partir de condições.
import { twMerge } from "tailwind-merge";            // Remove classes Tailwind conflitantes (ex: "p-2 p-4" -> "p-4").

/**
 * cn = "class names". Ex: cn("px-2", isActive && "bg-primary", "px-4")
 * Resultado: classes limpas, sem duplicações conflitantes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata um valor numérico como moeda brasileira (R$).
 * Usado para exibir o preço dos serviços.
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
