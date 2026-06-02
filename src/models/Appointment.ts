// ============================================================================
// MODEL: APPOINTMENT (Agendamento)
// Liga um usuário (cliente) a um serviço em uma data/horário específico.
// ============================================================================

import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IAppointmentDoc extends Document {
  service: Types.ObjectId; // Referência (relacionamento) ao documento Service.
  serviceName: string;     // Nome do serviço copiado (desnormalização para listar mais rápido).
  user: Types.ObjectId;    // Referência ao usuário dono do agendamento.
  clientName: string;      // Nome do cliente copiado para exibição.
  date: Date;              // Data e hora do agendamento.
  status: "PENDENTE" | "CONFIRMADO" | "CANCELADO";
  createdAt: Date;
}

const AppointmentSchema = new Schema<IAppointmentDoc>(
  {
    service: {
      type: Schema.Types.ObjectId, // Tipo de relacionamento no MongoDB.
      ref: "Service",              // Aponta para o model Service (permite .populate()).
      required: true,
    },
    serviceName: { type: String, required: true },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clientName: { type: String, required: true },
    date: {
      type: Date,
      required: [true, "A data do agendamento é obrigatória"],
    },
    status: {
      type: String,
      enum: ["PENDENTE", "CONFIRMADO", "CANCELADO"],
      default: "PENDENTE", // Todo agendamento nasce pendente de confirmação.
    },
  },
  { timestamps: true }
);

export const Appointment: Model<IAppointmentDoc> =
  mongoose.models.Appointment ||
  mongoose.model<IAppointmentDoc>("Appointment", AppointmentSchema);
