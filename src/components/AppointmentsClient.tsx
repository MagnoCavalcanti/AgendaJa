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
import {
  maskDateBR,
  maskTimeBR,
  parseAppointmentDateTime,
  validateClientName,
  isCompleteDateBR,
  isCompleteTimeBR,
} from "@/lib/appointment-datetime";
import { APPOINTMENT_STATUS_LABELS } from "@/lib/appointment-status";
import { formatCurrency } from "@/lib/utils";
import { AppointmentActions } from "@/components/AppointmentActions";
import type { IService, IAppointment, AppointmentStatus } from "@/types";
import type { StatusFilter } from "@/store/useUIStore";

const FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "TODOS", label: "Todos" },
  { value: "PENDENTE", label: "Agendados" },
  { value: "CONFIRMADO", label: "Efetuados" },
  { value: "CANCELADO", label: "Cancelados" },
];

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

  const [serviceId, setServiceId] = useState("");
  const [clientName, setClientName] = useState("");
  const [dateBR, setDateBR] = useState("");
  const [timeBR, setTimeBR] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

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
    mutationFn: async (payload: {
      serviceId: string;
      clientName: string;
      dateBR: string;
      timeBR: string;
      date: string;
    }) => {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Falha ao criar agendamento"
        );
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setServiceId("");
      setClientName("");
      setDateBR("");
      setTimeBR("");
      setFormError(null);
      closeModal();
    },
    onError: (err: Error) => {
      setFormError(err.message);
    },
  });

  const parsedDateTime = parseAppointmentDateTime(dateBR, timeBR);
  const clientNameError = validateClientName(clientName);
  const canSubmit =
    !!serviceId &&
    !clientNameError &&
    parsedDateTime.ok &&
    !createMutation.isPending;

  function handleCreate() {
    setFormError(null);
    const nameErr = validateClientName(clientName);
    if (nameErr) {
      setFormError(nameErr);
      return;
    }
    const parsed = parseAppointmentDateTime(dateBR, timeBR);
    if (!parsed.ok) {
      setFormError(parsed.message);
      return;
    }
    createMutation.mutate({
      serviceId,
      clientName: clientName.trim(),
      dateBR,
      timeBR,
      date: parsed.date.toISOString(),
    });
  }

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
        {FILTER_OPTIONS.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={statusFilter === f.value ? "default" : "outline"}
            onClick={() => setStatusFilter(f.value)}
          >
            {f.label}
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
                  Cliente: {a.clientName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(a.date), "dd 'de' MMMM 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                <StatusBadge status={a.status} />
                <AppointmentActions id={a._id} status={a.status} />
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
            <Label htmlFor="clientName">Nome do cliente</Label>
            <Input
              id="clientName"
              value={clientName}
              onChange={(e) => {
                setClientName(e.target.value);
                setFormError(null);
              }}
              placeholder="Ex: João Silva"
              maxLength={80}
              autoComplete="name"
            />
            {clientName.length > 0 && clientNameError && (
              <p className="mt-1 text-xs text-destructive">{clientNameError}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="dateBR">Data</Label>
              <Input
                id="dateBR"
                value={dateBR}
                onChange={(e) => {
                  setDateBR(maskDateBR(e.target.value));
                  setFormError(null);
                }}
                placeholder="DD/MM/AAAA"
                inputMode="numeric"
                maxLength={10}
                aria-invalid={
                  dateBR.length > 0 && !isCompleteDateBR(dateBR)
                    ? true
                    : undefined
                }
              />
            </div>
            <div>
              <Label htmlFor="timeBR">Horário</Label>
              <Input
                id="timeBR"
                value={timeBR}
                onChange={(e) => {
                  setTimeBR(maskTimeBR(e.target.value));
                  setFormError(null);
                }}
                placeholder="HH:MM"
                inputMode="numeric"
                maxLength={5}
                aria-invalid={
                  timeBR.length > 0 && !isCompleteTimeBR(timeBR)
                    ? true
                    : undefined
                }
              />
            </div>
          </div>
          {dateBR.length === 10 &&
            timeBR.length === 5 &&
            !parsedDateTime.ok && (
              <p className="text-xs text-destructive">{parsedDateTime.message}</p>
            )}

          {formError && (
            <p className="text-sm text-destructive">{formError}</p>
          )}

          <Button
            className="w-full"
            disabled={!canSubmit}
            onClick={handleCreate}
          >
            {createMutation.isPending ? "Agendando..." : "Agendar"}
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
      {APPOINTMENT_STATUS_LABELS[status]}
    </span>
  );
}
