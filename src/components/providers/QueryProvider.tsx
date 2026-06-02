"use client"; // React Query usa estado/contexto do cliente.

// ============================================================================
// PROVIDER DO REACT QUERY (TanStack Query)
// Cria o QueryClient e o disponibiliza para toda a árvore de componentes.
// É ele quem gerencia cache, refetch e sincronização dos dados assíncronos,
// substituindo o uso frágil de useEffect + fetch manual.
// ============================================================================

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  // useState com função inicializadora garante que o QueryClient seja criado
  // UMA única vez por montagem do componente (e não a cada renderização).
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,      // Dados considerados "frescos" por 60s (evita refetch excessivo).
            refetchOnWindowFocus: false, // Não refazer a busca só por focar a janela.
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
