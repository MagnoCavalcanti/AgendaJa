// ============================================================================
// LOADING GLOBAL (arquivo reservado loading.tsx)
// O Next.js exibe AUTOMATICAMENTE este componente como fallback enquanto uma
// página/segmento está sendo carregado no servidor (Suspense embutido).
// Não precisamos controlar estado manualmente: basta existir este arquivo.
// ============================================================================

import { Loader2 } from "lucide-react"; // Ícone de spinner.

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      {/* animate-spin gira o ícone; aria-label ajuda leitores de tela. */}
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Carregando" />
    </div>
  );
}
