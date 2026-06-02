"use client"; // Provider precisa rodar no cliente (usa React Context).

// ============================================================================
// WRAPPER DO SESSIONPROVIDER (NextAuth)
// O SessionProvider do next-auth/react é um Client Component. Como o layout
// raiz é um Server Component, encapsulamos ele aqui para poder usá-lo dentro
// do layout sem transformar a árvore inteira em client.
// ============================================================================

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

// Recebe os filhos e os envolve no contexto de sessão do NextAuth.
export function AuthSessionProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
