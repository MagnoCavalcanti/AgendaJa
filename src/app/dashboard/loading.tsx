// ============================================================================
// LOADING DO SEGMENTO /dashboard (arquivo reservado)
// Mostrado automaticamente enquanto qualquer página do painel carrega no servidor.
// ============================================================================

import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="Carregando" />
    </div>
  );
}
