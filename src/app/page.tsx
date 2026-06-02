// ============================================================================
// PÁGINA INICIAL PÚBLICA (rota "/")
// É um Server Component (padrão no App Router): não precisa de interatividade,
// então renderiza no servidor, deixando o bundle do cliente menor.
// Demonstra o uso dos componentes nativos otimizados <Image> e <Link>.
// ============================================================================

import Image from "next/image"; // Otimiza imagens (tamanho, formato, lazy-load).
import Link from "next/link";   // Navegação sem recarregar a página, com prefetch.
import { Button } from "@/components/ui/button";
import { CalendarClock, ShieldCheck, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* ---------- Cabeçalho simples ---------- */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12">
        <span className="text-xl font-bold text-primary">AgendaJá</span>
        <nav className="flex gap-2">
          {/* <Link> faz prefetch automático da rota de login. */}
          <Link href="/login">
            <Button variant="ghost">Entrar</Button>
          </Link>
          <Link href="/register">
            <Button>Criar conta</Button>
          </Link>
        </nav>
      </header>

      {/* ---------- Seção principal (hero) ---------- */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:px-12">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Agende seus serviços <span className="text-primary">sem WhatsApp</span> e sem confusão.
          </h1>
          <p className="text-lg text-muted-foreground">
            Plataforma de agendamento para barbearias e clínicas. Seus clientes
            marcam horário sozinhos, você acompanha tudo em um painel.
          </p>
          <div className="flex gap-3">
            <Link href="/register">
              <Button size="lg">Começar agora</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Já tenho conta
              </Button>
            </Link>
          </div>
        </div>

        {/* Imagem otimizada: o Next gera tamanhos responsivos e faz lazy-load. */}
        <div className="relative h-72 w-full overflow-hidden rounded-xl md:h-96">
          <Image
            src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800"
            alt="Profissional atendendo cliente"
            fill                       // Preenche o container pai (que é relative).
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw" // Dica de tamanho por viewport.
            priority                   // Carrega cedo por estar acima da dobra.
          />
        </div>
      </section>

      {/* ---------- Diferenciais ---------- */}
      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-20 md:grid-cols-3 md:px-12">
        <Feature
          icon={<CalendarClock className="h-6 w-6 text-primary" />}
          title="Agenda online 24h"
          text="Clientes marcam a qualquer hora, sem você precisar responder mensagens."
        />
        <Feature
          icon={<ShieldCheck className="h-6 w-6 text-primary" />}
          title="Acesso seguro"
          text="Login protegido e dados criptografados. Cada usuário vê só o que é seu."
        />
        <Feature
          icon={<Sparkles className="h-6 w-6 text-primary" />}
          title="Painel simples"
          text="Crie serviços, acompanhe agendamentos e confirme tudo em um só lugar."
        />
      </section>
    </main>
  );
}

// Pequeno componente local para cada cartão de diferencial (reuso de marcação).
function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-lg border p-6">
      <div className="mb-3">{icon}</div>
      <h3 className="mb-1 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
