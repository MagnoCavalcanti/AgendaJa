"use client";

// ============================================================================
// BOTÃO DE EXCLUIR SERVIÇO
// Componente cliente que chama a Server Action deleteService.
// Pede confirmação antes de remover e mostra estado de carregamento.
// ============================================================================

import { useTransition } from "react"; // Permite executar a action sem travar a UI.
import { Trash2 } from "lucide-react";
import { deleteService } from "@/app/dashboard/services/actions";
import { Button } from "@/components/ui/button";

export function DeleteServiceButton({ id }: { id: string }) {
  // isPending indica se a transição (chamada da action) está em andamento.
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={isPending}
      aria-label="Excluir serviço"
      onClick={() => {
        // Confirmação simples antes de excluir.
        if (!confirm("Excluir este serviço?")) return;
        // startTransition mantém a interface responsiva durante a action.
        startTransition(() => deleteService(id));
      }}
    >
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  );
}
