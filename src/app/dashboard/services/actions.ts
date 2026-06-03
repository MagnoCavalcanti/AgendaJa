"use server"; // Marca TODAS as funções deste arquivo como Server Actions.

// ============================================================================
// SERVER ACTIONS: CRUD DE SERVIÇOS
// ----------------------------------------------------------------------------
// Server Actions são funções que rodam EXCLUSIVAMENTE no servidor e podem ser
// chamadas diretamente de componentes (sem precisar criar uma rota de API).
// Após escrever no banco, chamamos revalidatePath() para invalidar o cache da
// página e forçar o Next.js a buscar os dados atualizados (estratégia de cache
// nativa, substituindo useEffect manual).
// ============================================================================

import { revalidatePath } from "next/cache"; // Invalida o cache de uma rota.
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { Service } from "@/models/Service";

// Garante que só usuários autenticados executem as ações (proteção no backend).
async function exigirSessao() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error("Não autorizado.");
  }
  return session;
}

// ---------------------------------------------------------------------------
// CREATE: cria um novo serviço a partir dos dados do formulário.
// Recebe FormData (enviado pelo <form action={...}>).
// ---------------------------------------------------------------------------
export async function createService(formData: FormData) {
  await exigirSessao();
  await dbConnect();

  // Extrai e converte os campos do formulário.
  const name = String(formData.get("name") ?? "");
  const description = String(formData.get("description") ?? "");
  const durationMin = Number(formData.get("durationMin") ?? 0);
  const price = Number(formData.get("price") ?? 0);

  // Validação mínima antes de gravar.
  if (!name || durationMin <= 0 || price < 0) {
    throw new Error("Dados do serviço inválidos.");
  }

  // Escreve no banco.
  await Service.create({ name, description, durationMin, price });

  // Invalida o cache da página de serviços: a listagem será refeita com o novo item.
  revalidatePath("/dashboard/services");
}

// ---------------------------------------------------------------------------
// UPDATE: atualiza um serviço existente pelo id.
// ---------------------------------------------------------------------------
export async function updateService(id: string, formData: FormData) {
  await exigirSessao();
  await dbConnect();

  const name = String(formData.get("name") ?? "");
  const description = String(formData.get("description") ?? "");
  const durationMin = Number(formData.get("durationMin") ?? 0);
  const price = Number(formData.get("price") ?? 0);

  if (!name || durationMin <= 0 || price < 0) {
    throw new Error("Dados do serviço inválidos.");
  }

  const atualizado = await Service.findByIdAndUpdate(
    id,
    { name, description, durationMin, price },
    { new: true }
  );

  if (!atualizado) {
    throw new Error("Serviço não encontrado.");
  }

  revalidatePath("/dashboard/services");
}

// ---------------------------------------------------------------------------
// DELETE: remove um serviço pelo id.
// ---------------------------------------------------------------------------
export async function deleteService(id: string) {
  await exigirSessao();
  await dbConnect();

  await Service.findByIdAndDelete(id); // Remoção (DELETE do CRUD).

  // Atualiza a listagem após a exclusão.
  revalidatePath("/dashboard/services");
}
