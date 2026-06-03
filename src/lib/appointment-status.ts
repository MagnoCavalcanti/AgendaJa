import type { AppointmentStatus } from "@/types";

/** Rótulos exibidos na interface (o valor no banco continua em inglês). */
export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDENTE: "Agendado",
  CONFIRMADO: "Efetuado",
  CANCELADO: "Cancelado",
};

const VALID_STATUSES: AppointmentStatus[] = [
  "PENDENTE",
  "CONFIRMADO",
  "CANCELADO",
];

/** Transições permitidas a partir de cada status. */
const ALLOWED_TRANSITIONS: Record<
  AppointmentStatus,
  readonly AppointmentStatus[]
> = {
  PENDENTE: ["CONFIRMADO", "CANCELADO"],
  CONFIRMADO: [],
  CANCELADO: [],
};

export function isAppointmentStatus(value: unknown): value is AppointmentStatus {
  return (
    typeof value === "string" &&
    VALID_STATUSES.includes(value as AppointmentStatus)
  );
}

export function canTransitionStatus(
  from: AppointmentStatus,
  to: AppointmentStatus
): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function getTransitionError(
  from: AppointmentStatus,
  to: AppointmentStatus
): string | null {
  if (!canTransitionStatus(from, to)) {
    if (from === "CONFIRMADO") {
      return "Este agendamento já foi efetuado e não pode ser alterado.";
    }
    if (from === "CANCELADO") {
      return "Agendamentos cancelados não podem ser alterados.";
    }
    return "Transição de status não permitida.";
  }
  return null;
}
