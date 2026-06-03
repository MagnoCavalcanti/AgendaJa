"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppointmentStatus } from "@/types";

async function patchStatus(id: string, status: AppointmentStatus) {
  const res = await fetch(`/api/appointments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Falha ao atualizar status"
    );
  }
  return data;
}

export function AppointmentActions({
  id,
  status,
  layout = "row",
}: {
  id: string;
  status: AppointmentStatus;
  layout?: "row" | "stack";
}) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: ({
      appointmentId,
      nextStatus,
    }: {
      appointmentId: string;
      nextStatus: AppointmentStatus;
    }) => patchStatus(appointmentId, nextStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      router.refresh();
    },
  });

  if (status !== "PENDENTE") {
    return null;
  }

  const pending = mutation.isPending;
  const wrapClass =
    layout === "stack"
      ? "flex flex-col gap-2 sm:flex-row"
      : "flex flex-wrap items-center gap-2";

  return (
    <div className={wrapClass}>
      <Button
        size="sm"
        disabled={pending}
        onClick={() => {
          if (!confirm("Marcar este atendimento como efetuado?")) return;
          mutation.mutate({ appointmentId: id, nextStatus: "CONFIRMADO" });
        }}
      >
        <Check className="mr-1 h-3.5 w-3.5" />
        {pending ? "Salvando..." : "Efetuar"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => {
          if (!confirm("Cancelar este agendamento?")) return;
          mutation.mutate({ appointmentId: id, nextStatus: "CANCELADO" });
        }}
      >
        <X className="mr-1 h-3.5 w-3.5" />
        Cancelar
      </Button>
    </div>
  );
}
