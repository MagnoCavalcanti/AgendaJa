// ============================================================================
// PÁGINA DE SERVIÇOS (/dashboard/services)
// Server Component que LÊ os serviços direto do banco e renderiza a lista.
// A criação e a exclusão usam Server Actions; o revalidatePath dentro delas
// faz esta página recarregar os dados automaticamente após cada operação.
// ============================================================================

import { dbConnect } from "@/lib/mongodb";
import { Service } from "@/models/Service";
import { formatCurrency } from "@/lib/utils";
import { ServiceForm } from "@/components/ServiceForm";
import { DeleteServiceButton } from "@/components/DeleteServiceButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

// Renderização DINÂMICA: esta página lê dados ao vivo do banco a cada acesso,
// então não deve ser pré-renderizada estaticamente no build.
export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  // Conecta e lê todos os serviços (READ do CRUD), rodando no servidor.
  await dbConnect();
  const docs = await Service.find().sort({ createdAt: -1 }).lean();

  // Serializa para uso no JSX (ObjectId -> string).
  const services = docs.map((s) => ({
    id: s._id.toString(),
    name: s.name,
    description: s.description,
    durationMin: s.durationMin,
    price: s.price,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Serviços</h1>

      {/* Cartão com o formulário de cadastro. */}
      <Card>
        <CardHeader>
          <CardTitle>Novo serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceForm />
        </CardContent>
      </Card>

      {/* Lista de serviços cadastrados. */}
      <div className="grid gap-3">
        {services.length === 0 && (
          <p className="text-muted-foreground">Nenhum serviço cadastrado ainda.</p>
        )}

        {services.map((s) => (
          <Card key={s.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{s.name}</p>
                {s.description && (
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                )}
                <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {s.durationMin} min
                  </span>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(s.price)}
                  </span>
                </div>
              </div>
              {/* Botão de exclusão (Client Component dentro do Server Component). */}
              <DeleteServiceButton id={s.id} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
