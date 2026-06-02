"use client"; // error.tsx é sempre Client Component.

// ============================================================================
// ERRO DO SEGMENTO /dashboard (arquivo reservado)
// Captura erros que aconteçam nas páginas do painel, isolando a falha sem
// derrubar o app inteiro.
// ============================================================================

import { Button } from "@/components/ui/button";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <h2 className="text-lg font-semibold">Não foi possível carregar o painel.</h2>
      <Button onClick={() => reset()}>Tentar novamente</Button>
    </div>
  );
}
