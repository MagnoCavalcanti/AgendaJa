// ============================================================================
// HOME DO PAINEL (/dashboard)
// Server Component que busca métricas diretamente no banco (sem API intermediária).
// Como é Server Component, a consulta roda no servidor e só o HTML chega ao cliente.
// ============================================================================

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { Service } from "@/models/Service";
import { Appointment } from "@/models/Appointment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Renderização dinâmica: depende da sessão e de dados ao vivo do banco.
export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  // A sessão já foi validada no layout; aqui apenas a reutilizamos.
  const session = await getServerSession(authOptions);
  await dbConnect();

  // Consultas de contagem rodando no servidor (eficiente).
  const totalServicos = await Service.countDocuments();
  const totalAgendamentos = await Appointment.countDocuments({
    user: session?.user.id,
  });
  const pendentes = await Appointment.countDocuments({
    user: session?.user.id,
    status: "PENDENTE",
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Olá, {session?.user.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground">Resumo da sua conta.</p>
      </div>

      {/* Grade de cartões de métricas, responsiva. */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard title="Serviços cadastrados" value={totalServicos} />
        <MetricCard title="Meus agendamentos" value={totalAgendamentos} />
        <MetricCard title="Pendentes" value={pendentes} />
      </div>
    </div>
  );
}

// Componente local simples para exibir uma métrica.
function MetricCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
