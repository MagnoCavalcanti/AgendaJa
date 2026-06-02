// ============================================================================
// TIPAGEM CENTRAL DA APLICAÇÃO (TypeScript)
// Concentrar os tipos em um só lugar facilita a manutenção e garante
// consistência entre frontend e backend (Clean Architecture).
// ============================================================================

// Papéis de usuário no sistema (controle de acesso).
export type UserRole = "ADMIN" | "CLIENTE";

// Status possíveis de um agendamento.
export type AppointmentStatus = "PENDENTE" | "CONFIRMADO" | "CANCELADO";

// Representação de um Serviço já serializado para o cliente (sem campos do Mongo).
export interface IService {
  _id: string;        // Identificador (convertido de ObjectId para string).
  name: string;       // Nome do serviço (ex: "Corte Masculino").
  description: string; // Descrição curta.
  durationMin: number; // Duração em minutos.
  price: number;       // Preço em reais.
  createdAt: string;   // Data de criação (ISO string).
}

// Representação de um Agendamento serializado.
export interface IAppointment {
  _id: string;
  serviceName: string;   // Nome do serviço escolhido (desnormalizado para facilitar a listagem).
  serviceId: string;     // Referência ao serviço.
  clientName: string;    // Nome de quem agendou.
  date: string;          // Data/hora do agendamento (ISO string).
  status: AppointmentStatus;
  createdAt: string;
}

// Dados do usuário expostos na sessão (NÃO inclui a senha).
export interface ISessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
