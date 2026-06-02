// ============================================================================
// ROUTE HANDLER DINÂMICO: /api/appointments/[id]
//  - PATCH  : atualiza o status de um agendamento (UPDATE do CRUD).
//  - DELETE : remove um agendamento (DELETE do CRUD).
// O [id] na pasta é um parâmetro de rota dinâmico.
// ============================================================================

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { Appointment } from "@/models/Appointment";

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
    const { status } = await request.json();
    await dbConnect();

    // Atualiza só se o agendamento pertencer ao usuário logado (segurança).
    const atualizado = await Appointment.findOneAndUpdate(
      { _id: params.id, user: session.user.id }, // Filtro: id + dono.
      { status },                                 // Campo a alterar.
      { new: true }                               // Retorna o documento já atualizado.
    );

    if (!atualizado) {
      return NextResponse.json(
        { error: "Agendamento não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Status atualizado." });
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
