"use client"; // Usa signOut e usePathname => precisa rodar no cliente.

// ============================================================================
// NAVBAR DO PAINEL
// Exibe o nome do usuário, os links de navegação e o botão de sair.
// Recebe o nome via props (vindo do Server Component que já tem a sessão),
// evitando uma busca extra no cliente.
// ============================================================================

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation"; // Sabe a rota atual (para destacar o link ativo).
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";

// Links do menu do painel.
const links = [
  { href: "/dashboard", label: "Início" },
  { href: "/dashboard/services", label: "Serviços" },
  { href: "/dashboard/appointments", label: "Agendamentos" },
];

export function Navbar({ userName }: { userName: string }) {
  const pathname = usePathname(); // Rota atual, ex: "/dashboard/services".

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo + links */}
        <div className="flex items-center gap-6">
          <span className="font-bold text-primary">AgendaJá</span>
          <nav className="hidden gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-accent",
                  // Destaca o link da rota ativa.
                  pathname === link.href
                    ? "bg-accent font-medium"
                    : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Usuário + sair */}
        <div className="flex items-center gap-3">
          {/* Avatar gerado a partir do nome (imagem otimizada pelo Next). */}
          <Image
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              userName
            )}&background=2563eb&color=fff`}
            alt={userName}
            width={32}
            height={32}
            className="rounded-full"
          />
          <span className="hidden text-sm font-medium sm:inline">{userName}</span>
          {/* signOut encerra a sessão e redireciona para a home. */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut({ callbackUrl: "/" })}
            aria-label="Sair"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
