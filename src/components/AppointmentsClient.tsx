"use client";

// ============================================================================
// CLIENTE DE AGENDAMENTOS (React Query + Zustand)
// ----------------------------------------------------------------------------
// Aqui usamos o React Query para:
//   - useQuery: buscar a lista de serviços e a lista de agendamentos (cache).
//   - useMutation: criar/cancelar agendamentos e invalidar o cache para
//     re-buscar automaticamente (sincronização sem useEffect manual).
// O Zustand controla o modal e o filtro de status (estado de UI do cliente).
// ============================================================================

import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { format } from "date-fns"; // Formatação de datas.
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { useUIStore } from "@/store/useUIStore";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { IService, IAppointment, AppointmentStatus } from "@/types";

// ---------------------------------------------------------------------------
// Funções de acesso à API (camada de fetch reutilizada pelos hooks).
// ---------------------------------------------------------------------------
async function fetchServices(): Promise<IService[]> {
  const res = await fetch("/api/services");
  if (!res.ok) throw new Error("Falha ao carregar serviços");
  return res.json();
}

async function fetchAppointments(): Promise<IAppointment[]> {
  const res = await fetch("/api/appointments");
  if (!res.ok) throw new Error("Falha ao carregar agendamentos");
  return res.json();
}

export function AppointmentsClient() {
  // queryClient permite invalidar caches após uma mutação.
  const queryClient = useQueryClient();

  // Estado de UI vindo do Zustand: modal e filtro de status.
  const openModal = useUIStore((s) => s.openModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const statusFilter = useUIStore((s) => s.statusFilter);
  const setStatusFilter = useUIStore((s) => s.setStatusFilter);

  // Campos locais do formulário do modal.
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");

  // ----- QUERIES (leitura com cache automático) -----
  const servicesQuery = useQuery({
    queryKey: ["services"],     // Chave do cache.
    queryFn: fetchServices,     // Função que busca os dados.
  });

  const appointmentsQuery = useQuery({
    queryKey: ["appointments"],
    queryFn: fetchAppointments,
  });

  // ----- MUTATION: criar agendamento -----
  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, date }),
      });
      if (!res.ok) throw new Error("Falha ao criar agendamento");
      return res.json();
    },
    onSuccess: () => {
      // Invalida o cache: o React Query re-busca a lista atualizada sozinho.
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      // Limpa o formulário e fecha o modal.
      setServiceId("");
      setDate("");
      closeModal();
    },
  });

  // ----- MUTATION: cancelar agendamento (PATCH status) -----
  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELADO" }),
      });
      if (!res.ok) throw new Error("Falha ao cancelar");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  // Aplica o filtro de status (estado vindo do Zustand) sobre os dados do cache.
  const appointments = (appointmentsQuery.data ?? []).filter((a) =>
    statusFilter === "TODOS" ? true : a.status === statusFilter
  );

  return (
    <div className="space-y-6">
      {/* Cabeçalho com botão para abrir o modal. */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Agendamentos</h1>
        <Button onClick={openModal}>Novo agendamento</Button>
      </div>

      {/* Filtros de status (alteram o estado de UI no Zustand). */}
      <div className="flex flex-wrap gap-2">
        {(["TODOS", "PENDENTE", "CONFIRMADO", "CANCELADO"] as const).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={statusFilter === f ? "default" : "outline"}
            onClick={() => setStatusFilter(f)}
          >
            {f}
          </Button>
        ))}
      </div>

      {/* Estados de carregamento e erro (UX). */}
      {appointmentsQuery.isLoading && (
        <p className="text-muted-foreground">Carregando agendamentos...</p>
      )}
      {appointmentsQuery.isError && (
        <p className="text-destructive">Erro ao carregar. Recarregue a página.</p>
      )}

      {/* Lista de agendamentos filtrados. */}
      <div className="grid gap-3">
        {!appointmentsQuery.isLoading && appointments.length === 0 && (
          <p className="text-muted-foreground">Nenhum agendamento neste filtro.</p>
        )}

        {appointments.map((a) => (
          <Card key={a._id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                {/* Link para a rota dinâmica de detalhe do agendamento. */}
                <Link
                  href={`/dashboard/appointments/${a._id}`}
                  className="font-medium hover:underline"
                >
                  {a.serviceName}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(a.date), "dd 'de' MMMM 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={a.status} />
                {a.status !== "CANCELADO" && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={cancelMutation.isPending}
                    onClick={() => cancelMutation.mutate(a._id)}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de criação (controlado pelo Zustand). */}
      <Modal title="Novo agendamento">
        <div className="space-y-4">
          <div>
            <Label htmlFor="service">Serviço</Label>
            {/* Seletor preenchido com os dados vindos do useQuery de serviços. */}
            <select
              id="service"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Selecione...</option>
              {servicesQuery.data?.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} — {formatCurrency(s.price)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="date">Data e hora</Label>
            <Input
              id="date"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {createMutation.isError && (
            <p className="text-sm text-destructive">Não foi possível agendar.</p>
          )}

          <Button
            className="w-full"
            // Desabilita se faltar dado ou enquanto a mutação está em andamento.
            disabled={!serviceId || !date || createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            {createMutation.isPending ? "Agendando..." : "Confirmar agendamento"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

// Pequeno selo colorido conforme o status.
function StatusBadge({ status }: { status: AppointmentStatus }) {
  const styles: Record<AppointmentStatus, string> = {
    PENDENTE: "bg-yellow-100 text-yellow-800",
    CONFIRMADO: "bg-green-100 text-green-800",
    CANCELADO: "bg-red-100 text-red-800",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}
