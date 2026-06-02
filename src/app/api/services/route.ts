// ============================================================================
// ROUTE HANDLER: SERVIÇOS (GET /api/services)
// Lista os serviços em formato JSON. É consumido pelo React Query no formulário
// de agendamento (para preencher o seletor de serviços no lado do cliente).
// ============================================================================

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth"; // Lê a sessão no servidor.
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { Service } from "@/models/Service";

export async function GET() {
  // PROTEÇÃO DE ROTA NO BACKEND:
  // Mesmo que o frontend bloqueie, validamos a sessão aqui também (defesa em camadas).
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  await dbConnect();

  // Busca todos os serviços, ordenados pelo nome.
  const services = await Service.find().sort({ name: 1 }).lean();

  // Serializamos: o _id é um ObjectId; convertemos para string para o JSON.
  const data = services.map((s) => ({
    _id: s._id.toString(),
    name: s.name,
    description: s.description,
    durationMin: s.durationMin,
    price: s.price,
    createdAt: s.createdAt?.toISOString() ?? "",
  }));

  return NextResponse.json(data);
}
