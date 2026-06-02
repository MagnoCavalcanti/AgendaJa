// ============================================================================
// LAYOUT RAIZ DA APLICAÇÃO (App Router)
// É um Server Component que define o <html>/<body> e envolve toda a árvore
// nos Providers globais (sessão do NextAuth e React Query).
// ============================================================================

import type { Metadata } from "next";
import { Poppins } from "next/font/google"; // Fonte otimizada pelo Next (sem requests externos em runtime).
import "./globals.css";
import { AuthSessionProvider } from "@/components/providers/SessionProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";

// Carrega a fonte Poppins com os pesos usados na interface.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap", // Mostra texto com fonte fallback até a Poppins carregar.
});

// Metadados (título e descrição) usados pelo SEO e pela aba do navegador.
export const metadata: Metadata = {
  title: "AgendaJá — Agendamento de Serviços",
  description: "Plataforma SaaS para agendamento em barbearias e clínicas.",
};

// O layout raiz recebe "children" = a página atual sendo renderizada.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={poppins.className}>
        {/* Provider de sessão precisa envolver tudo que use useSession(). */}
        <AuthSessionProvider>
          {/* Provider do React Query disponibiliza o cache para os hooks de dados. */}
          <QueryProvider>{children}</QueryProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
