"use client";

// ============================================================================
// MODAL GENÉRICO
// A abertura/fechamento é controlada pela store Zustand (useUIStore), provando
// o uso de estado EXCLUSIVO de cliente para UI. Renderiza um overlay e o
// conteúdo recebido via children.
// ============================================================================

import { ReactNode } from "react";
import { X } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { Button } from "@/components/ui/button";

export function Modal({ title, children }: { title: string; children: ReactNode }) {
  // Lemos o estado e a ação de fechar diretamente da store Zustand.
  const isOpen = useUIStore((s) => s.isModalOpen);
  const closeModal = useUIStore((s) => s.closeModal);

  // Se o modal não está aberto, não renderiza nada.
  if (!isOpen) return null;

  return (
    // Overlay escuro de fundo; clicar fora fecha o modal.
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={closeModal}
    >
      {/* stopPropagation evita que o clique DENTRO do modal feche-o. */}
      <div
        className="w-full max-w-md rounded-lg bg-card p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button variant="ghost" size="icon" onClick={closeModal} aria-label="Fechar">
            <X className="h-4 w-4" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
