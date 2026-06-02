// ============================================================================
// PÁGINA DE AGENDAMENTOS (/dashboard/appointments)
// Esta página em si é um Server Component "casca": apenas renderiza o
// componente cliente AppointmentsClient, onde mora a interatividade
// (React Query + Zustand). Isso mantém a interatividade restrita às FOLHAS
// da árvore de componentes (boa prática de Server/Client Components).
// ============================================================================

import { AppointmentsClient } from "@/components/AppointmentsClient";

export default function AppointmentsPage() {
  return <AppointmentsClient />;
}
