"use client"; // Formulário com estado e eventos => Client Component.

// ============================================================================
// PÁGINA DE LOGIN (rota "/login")
// Usa signIn("credentials") do NextAuth para autenticar e redireciona ao
// painel em caso de sucesso. Mostra estado de carregamento e erro (UX).
// ============================================================================

import { useState } from "react";
import { signIn } from "next-auth/react";   // Dispara o fluxo de login no cliente.
import { useRouter } from "next/navigation"; // Navegação programática (App Router).
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();

  // Estados locais do formulário (campos, carregamento e mensagem de erro).
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handler de envio do formulário.
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();   // Evita o reload padrão do navegador.
    setLoading(true);     // Ativa o feedback visual de "pending".
    setError("");

    // Chama o NextAuth. redirect:false para tratarmos a resposta manualmente.
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    // Se o NextAuth retornou erro, mostramos uma mensagem amigável.
    if (res?.error) {
      setError("E-mail ou senha inválidos.");
      return;
    }

    // Sucesso: vai para o painel. refresh() recarrega os Server Components.
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Entrar no AgendaJá</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Exibe o erro apenas quando existe. */}
            {error && <p className="text-sm text-destructive">{error}</p>}

            {/* O botão fica desabilitado e troca o texto enquanto carrega. */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Não tem conta?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Cadastre-se
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
