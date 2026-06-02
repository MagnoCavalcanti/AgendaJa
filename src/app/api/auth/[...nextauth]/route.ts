// ============================================================================
// ROUTE HANDLER DO NEXTAUTH (App Router)
// Esta rota dinâmica [...nextauth] captura TODAS as rotas internas do NextAuth
// (/api/auth/signin, /api/auth/callback, /api/auth/session, etc.).
// ============================================================================

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // Configuração central reutilizável.

// Criamos o handler a partir das nossas opções de autenticação.
const handler = NextAuth(authOptions);

// No App Router, exportamos o mesmo handler para os métodos GET e POST.
export { handler as GET, handler as POST };
