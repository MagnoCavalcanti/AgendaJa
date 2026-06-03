// ============================================================================
// ROUTE HANDLER DINÂMICO: /api/appointments/[id]
//  - PATCH  : atualiza o status de um agendamento (UPDATE do CRUD).
//  - DELETE : remove um agendamento (DELETE do CRUD).
// O [id] na pasta é um parâmetro de rota dinâmico.
// ============================================================================

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getTransitionError,
  isAppointmentStatus,
} from "@/lib/appointment-status";
import { dbConnect } from "@/lib/mongodb";
import { Appointment } from "@/models/Appointment";
import type { AppointmentStatus } from "@/types";

// Tipo do segundo argumento: contém os parâmetros dinâmicos da URL.
interface RouteContext {
  params: { id: string };
}

// ---------------------------------------------------------------------------
// PATCH: muda o status (ex: de PENDENTE para CONFIRMADO).
// ---------------------------------------------------------------------------
export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { status: newStatus } = await request.json();

    if (!isAppointmentStatus(newStatus)) {
      return NextResponse.json({ error: "Status inválido." }, { status: 400 });
    }

    await dbConnect();

    const atual = await Appointment.findOne({
      _id: params.id,
      user: session.user.id,
    });

    if (!atual) {
      return NextResponse.json(
        { error: "Agendamento não encontrado." },
        { status: 404 }
      );
    }

    const transitionError = getTransitionError(
      atual.status as AppointmentStatus,
      newStatus
    );
    if (transitionError) {
      return NextResponse.json({ error: transitionError }, { status: 400 });
    }

    const atualizado = await Appointment.findOneAndUpdate(
      { _id: params.id, user: session.user.id },
      { status: newStatus },
      { new: true }
    );

    const messages: Record<AppointmentStatus, string> = {
      CONFIRMADO: "Agendamento marcado como efetuado.",
      CANCELADO: "Agendamento cancelado.",
      PENDENTE: "Status atualizado.",
    };

    return NextResponse.json({
      message: messages[newStatus],
      status: atualizado?.status,
    });
  } catch (error) {
    console.error("Erro ao atualizar:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE: remove o agendamento.
// ---------------------------------------------------------------------------
export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  await dbConnect();

  // Só apaga se o registro for do próprio usuário.
  const removido = await Appointment.findOneAndDelete({
    _id: params.id,
    user: session.user.id,
  });

  if (!removido) {
    return NextResponse.json(
      { error: "Agendamento não encontrado." },
      { status: 404 }
    );
  }

  return NextResponse.json({ message: "Agendamento removido." });
}
