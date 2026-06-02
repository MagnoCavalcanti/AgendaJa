// ============================================================================
// LAYOUT ANINHADO DO PAINEL (/dashboard)
// É um Server Component que protege TODAS as rotas filhas no BACKEND:
// se não houver sessão válida, redireciona para /login antes de renderizar
// qualquer conteúdo. Esta é a camada obrigatória de proteção no servidor.
// Também renderiza a Navbar comum a todas as páginas do painel (layout aninhado).
// ============================================================================

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth"; // Lê a sessão no servidor (seguro).
import { authOptions } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Busca a sessão diretamente no servidor (não confia apenas no frontend).
  const session = await getServerSession(authOptions);

  // PROTEÇÃO DE ROTA NO BACKEND: sem sessão => redireciona para o login.
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Navbar compartilhada por todas as páginas internas. */}
      <Navbar userName={session.user.name ?? "Usuário"} />
      {/* O conteúdo da página atual é injetado aqui. */}
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
