// ============================================================================
// MIDDLEWARE DE PROTEÇÃO DE ROTAS (camada de FRONTEND / borda)
// ----------------------------------------------------------------------------
// O middleware roda ANTES da página ser carregada. Aqui usamos o helper do
// NextAuth para bloquear o acesso às rotas do painel sem sessão, redirecionando
// para /login. Esta é a proteção na camada de borda/frontend.
// (A proteção definitiva continua no backend, no layout do dashboard via
// getServerSession — defesa em camadas.)
// ============================================================================

export { default } from "next-auth/middleware";

// O "matcher" define QUAIS rotas passam pelo middleware.
// Aqui protegemos tudo abaixo de /dashboard.
export const config = {
  matcher: ["/dashboard/:path*"],
};
