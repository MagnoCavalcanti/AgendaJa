// ============================================================================
// DETALHE DO AGENDAMENTO — ROTA DINÂMICA (/dashboard/appointments/[id])
// O [id] na pasta cria um parâmetro dinâmico recebido em props.params.id.
// Server Component que busca um agendamento específico do usuário logado.
// ============================================================================

import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { Appointment } from "@/models/Appointment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// As props de uma página recebem "params" com os segmentos dinâmicos da URL.
export default async function AppointmentDetail({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  await dbConnect();

  // Busca o agendamento garantindo que pertence ao usuário logado (segurança).
  const doc = await Appointment.findOne({
    _id: params.id,
    user: session?.user.id,
  }).lean();

  // Se não existir (ou não for do usuário), exibe a tela 404 do Next.
  if (!doc) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      {/* Link de volta para a listagem. */}
      <Link href="/dashboard/appointments">
        <Button variant="ghost" size="sm" className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{doc.serviceName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Cliente: </span>
            {doc.clientName}
          </p>
          <p>
            <span className="text-muted-foreground">Data: </span>
            {format(new Date(doc.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
          <p>
            <span className="text-muted-foreground">Status: </span>
            {doc.status}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
