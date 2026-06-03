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
import {
  parseAppointmentDateTime,
  validateClientName,
} from "@/lib/appointment-datetime";
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
    const { serviceId, date, dateBR, timeBR, clientName } = await request.json();

    if (!serviceId) {
      return NextResponse.json(
        { error: "Serviço é obrigatório." },
        { status: 400 }
      );
    }

    const clientNameError = validateClientName(
      typeof clientName === "string" ? clientName : ""
    );
    if (clientNameError) {
      return NextResponse.json({ error: clientNameError }, { status: 400 });
    }

    let appointmentDate: Date;
    if (typeof dateBR === "string" && typeof timeBR === "string") {
      const parsed = parseAppointmentDateTime(dateBR, timeBR);
      if (!parsed.ok) {
        return NextResponse.json({ error: parsed.message }, { status: 400 });
      }
      appointmentDate = parsed.date;
    } else if (date) {
      const fallback = new Date(date);
      if (Number.isNaN(fallback.getTime()) || fallback.getTime() <= Date.now()) {
        return NextResponse.json(
          { error: "Data e horário inválidos." },
          { status: 400 }
        );
      }
      appointmentDate = fallback;
    } else {
      return NextResponse.json(
        { error: "Data e horário são obrigatórios." },
        { status: 400 }
      );
    }

    await dbConnect();

    const service = await Service.findById(serviceId);
    if (!service) {
      return NextResponse.json(
        { error: "Serviço não encontrado." },
        { status: 404 }
      );
    }

    const novo = await Appointment.create({
      service: service._id,
      serviceName: service.name,
      user: session.user.id,
      clientName: clientName.trim(),
      date: appointmentDate,
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
