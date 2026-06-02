// ============================================================================
// AUGMENTATION DE TIPOS DO NEXT-AUTH
// Por padrão, o NextAuth não conhece os campos "id" e "role".
// Aqui estendemos as interfaces para que o TypeScript reconheça esses campos
// em session.user e no token JWT (tipagem consistente em todo o app).
// ============================================================================

import { DefaultSession } from "next-auth";

// Estende o módulo "next-auth" (objeto Session e User).
declare module "next-auth" {
  interface Session {
    user: {
      id: string;                 // ID do usuário no banco.
      role: "ADMIN" | "CLIENTE";  // Papel para controle de acesso.
    } & DefaultSession["user"];   // Mantém name, email e image padrão.
  }

  interface User {
    role?: "ADMIN" | "CLIENTE";
  }
}

// Estende o módulo do JWT para reconhecer os campos extras no token.
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "ADMIN" | "CLIENTE";
  }
}
