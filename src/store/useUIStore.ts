// ============================================================================
// STORE ZUSTAND: ESTADO DE UI (somente do cliente)
// ----------------------------------------------------------------------------
// O Zustand é usado APENAS para estado de interface que não precisa ir ao
// servidor: aqui controlamos se o modal de "novo agendamento" está aberto e
// qual filtro de status está ativo na listagem.
// (Dados do servidor ficam no React Query / Server Components, não aqui.)
// ============================================================================

import { create } from "zustand";
import type { AppointmentStatus } from "@/types";

// Filtro pode ser um status específico ou "TODOS".
export type StatusFilter = AppointmentStatus | "TODOS";

export interface EditingService {
  id: string;
  name: string;
  description: string;
  durationMin: number;
  price: number;
}

// Formato (interface) do nosso estado e das ações que o alteram.
interface UIState {
  isModalOpen: boolean;                 // O modal de criação está aberto?
  statusFilter: StatusFilter;           // Filtro atual da listagem.
  editingService: EditingService | null; // Serviço em edição (modal de serviços).
  openModal: () => void;                // Ação: abrir o modal.
  closeModal: () => void;               // Ação: fechar o modal.
  setStatusFilter: (f: StatusFilter) => void; // Ação: trocar o filtro.
  openEditService: (service: EditingService) => void;
  closeEditService: () => void;
}

// create() gera o hook useUIStore que os componentes vão consumir.
export const useUIStore = create<UIState>((set) => ({
  // Estado inicial.
  isModalOpen: false,
  statusFilter: "TODOS",
  editingService: null,

  // Implementação das ações. set() atualiza o estado de forma imutável.
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
  setStatusFilter: (f) => set({ statusFilter: f }),
  openEditService: (service) => set({ editingService: service }),
  closeEditService: () => set({ editingService: null }),
}));
