"use client"; // Usa hooks de formulário do cliente.

// ============================================================================
// FORMULÁRIO DE NOVO SERVIÇO
// Usa a Server Action createService diretamente no atributo "action" do form.
// O hook useFormStatus fornece o estado "pending" para feedback visual durante
// o envio (botão desabilitado + texto "Salvando...").
// ============================================================================

import { useRef } from "react";
import { useFormStatus } from "react-dom"; // Estado de envio de um <form> com action.
import { createService } from "@/app/dashboard/services/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Botão separado para poder usar useFormStatus (precisa estar DENTRO do <form>).
function SubmitButton() {
  const { pending } = useFormStatus(); // true enquanto a action está executando.
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : "Adicionar serviço"}
    </Button>
  );
}

export function ServiceForm() {
  // Ref para limpar o formulário depois do envio.
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      // A action recebe o FormData e roda no servidor (Server Action).
      action={async (formData) => {
        await createService(formData);
        formRef.current?.reset(); // Limpa os campos após salvar.
      }}
      className="grid gap-4 sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <Label htmlFor="name">Nome do serviço</Label>
        <Input id="name" name="name" placeholder="Ex: Corte Masculino" required />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="description">Descrição</Label>
        <Input id="description" name="description" placeholder="Opcional" />
      </div>
      <div>
        <Label htmlFor="durationMin">Duração (min)</Label>
        <Input id="durationMin" name="durationMin" type="number" min={5} defaultValue={30} required />
      </div>
      <div>
        <Label htmlFor="price">Preço (R$)</Label>
        <Input id="price" name="price" type="number" min={0} step="0.01" defaultValue={0} required />
      </div>
      <div className="sm:col-span-2">
        <SubmitButton />
      </div>
    </form>
  );
}
