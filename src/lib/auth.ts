// ============================================================================
// CONFIGURAÇÃO CENTRAL DO NEXTAUTH (authOptions)
// ----------------------------------------------------------------------------
// Aqui definimos:
//  - Como o usuário faz login (Credentials Provider: e-mail + senha).
//  - Como a senha é verificada (bcrypt.compare contra o hash do banco).
//  - A estratégia de sessão via JWT (token assinado, sem tabela de sessão).
//  - Os callbacks que enriquecem o token e a sessão com id e role.
// Este objeto é reutilizado tanto pelo handler de rota quanto pelo
// getServerSession (proteção de rotas no backend).
// ============================================================================

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs"; // Biblioteca de hashing (versão JS, ideal para serverless).
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";

export const authOptions: NextAuthOptions = {
  // Provedores de autenticação. Aqui usamos login por credenciais (e-mail/senha).
  providers: [
    CredentialsProvider({
      name: "Credentials",
      // Campos esperados no formulário de login.
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      // Função que valida as credenciais. Retorna o usuário (sucesso) ou null (falha).
      async authorize(credentials) {
        // 1) Garante que vieram e-mail e senha.
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // 2) Conecta ao banco (reutiliza a conexão Singleton).
        await dbConnect();

        // 3) Busca o usuário pelo e-mail. Usamos .select("+password")
        //    para trazer o hash da senha (que por padrão fica oculto).
        const user = await User.findOne({ email: credentials.email }).select(
          "+password"
        );

        // 4) Se o usuário não existe, falha o login.
        if (!user) return null;

        // 5) Compara a senha digitada com o hash salvo. bcrypt faz isso
        //    de forma segura (sem nunca descriptografar o hash).
        const senhaConfere = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!senhaConfere) return null;

        // 6) Sucesso: retornamos os dados que irão para o token JWT.
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  // ESTRATÉGIA DE SESSÃO: JWT.
  // A sessão é guardada num token assinado no navegador (não precisamos de tabela de sessões).
  session: {
    strategy: "jwt",
  },

  // Páginas customizadas (em vez das telas padrão do NextAuth).
  pages: {
    signIn: "/login", // Para onde redirecionar quando precisar de login.
  },

  // Callbacks: pontos onde injetamos dados extras no token e na sessão.
  callbacks: {
    // Roda quando o JWT é criado/atualizado. Copiamos id e role para o token.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: "ADMIN" | "CLIENTE" }).role;
      }
      return token;
    },
    // Roda ao montar o objeto de sessão entregue ao app. Expomos id e role.
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "CLIENTE";
      }
      return session;
    },
  },

  // Segredo usado para assinar os tokens. Vem da variável de ambiente.
  secret: process.env.NEXTAUTH_SECRET,
};
