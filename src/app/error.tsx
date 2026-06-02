"use client"; // error.tsx PRECISA ser Client Component (recebe função reset).

// ============================================================================
// ERRO GLOBAL (arquivo reservado error.tsx)
// O Next.js renderiza este componente automaticamente quando um erro não
// tratado acontece em uma página/segmento. Recebe o "error" e uma função
// "reset" que tenta renderizar o segmento novamente.
// ============================================================================

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }; // O erro capturado.
  reset: () => void;                   // Função para tentar de novo.
}) {
  // Loga o erro (em produção, poderia ir para um serviço de monitoramento).
  useEffect(() => {
    console.error("Erro capturado pelo error.tsx:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h2 className="text-xl font-semibold">Algo deu errado 😕</h2>
      <p className="max-w-md text-muted-foreground">
        Ocorreu um erro inesperado. Você pode tentar novamente.
      </p>
      {/* Ao clicar, chamamos reset() para o Next tentar re-renderizar. */}
      <Button onClick={() => reset()}>Tentar novamente</Button>
    </div>
  );
}
