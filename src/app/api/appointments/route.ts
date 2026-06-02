// ============================================================================
// ROUTE HANDLER: AGENDAMENTOS (/api/appointments)
//  - GET  : lista os agendamentos DO usuário logado.
//  - POST : cria um novo agendamento.
// Ambas as operações são protegidas no backend via getServerSession.
// Consumidas pelo React Query no componente cliente de agendamentos.
// ============================================================================

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { Appointment } from "@/models/Appointment";
import { Service } from "@/models/Service";

// ---------------------------------------------------------------------------
// GET: retorna apenas os agendamentos do usuário autenticado (READ do CRUD).
// ---------------------------------------------------------------------------
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  await dbConnect();

  // Filtra pelos agendamentos cujo "user" é o id da sessão atual.
  const appointments = await Appointment.find({ user: session.user.id })
    .sort({ date: 1 }) // Ordena do mais próximo para o mais distante.
    .lean();

  // Serializa para JSON seguro (ObjectId -> string, Date -> ISO).
  const data = appointments.map((a) => ({
    _id: a._id.toString(),
    serviceId: a.service.toString(),
    serviceName: a.serviceName,
    clientName: a.clientName,
    date: a.date.toISOString(),
    status: a.status,
    createdAt: a.createdAt?.toISOString() ?? "",
  }));

  return NextResponse.json(data);
}

// ---------------------------------------------------------------------------
// POST: cria um novo agendamento para o usuário logado (CREATE do CRUD).
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    // Lê os dados enviados pelo formulário (id do serviço e data).
    const { serviceId, date } = await request.json();

    if (!serviceId || !date) {
      return NextResponse.json(
        { error: "Serviço e data são obrigatórios." },
        { status: 400 }
      );
    }

    await dbConnect();

    // Busca o serviço para copiar o nome (desnormalização) e validar a existência.
    const service = await Service.findById(serviceId);
    if (!service) {
      return NextResponse.json(
        { error: "Serviço não encontrado." },
        { status: 404 }
      );
    }

    // Cria o agendamento vinculado ao usuário da sessão.
    const novo = await Appointment.create({
      service: service._id,
      serviceName: service.name,
      user: session.user.id,
      clientName: session.user.name ?? "Cliente",
      date: new Date(date),
      status: "PENDENTE",
    });

    return NextResponse.json(
      { _id: novo._id.toString(), message: "Agendamento criado." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
