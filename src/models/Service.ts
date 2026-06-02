// ============================================================================
// MODEL: SERVICE (Serviço oferecido pela barbearia/clínica)
// Ex: "Corte Masculino", "Barba", "Limpeza de Pele".
// ============================================================================

import mongoose, { Schema, Document, Model } from "mongoose";

// Interface do documento de serviço.
export interface IServiceDoc extends Document {
  name: string;        // Nome do serviço.
  description: string; // Descrição curta.
  durationMin: number; // Duração em minutos (usado para montar a agenda).
  price: number;       // Preço em reais.
  createdAt: Date;
}

const ServiceSchema = new Schema<IServiceDoc>(
  {
    name: {
      type: String,
      required: [true, "O nome do serviço é obrigatório"],
      trim: true,
    },
    description: {
      type: String,
      default: "", // Campo opcional; assume string vazia se não vier.
    },
    durationMin: {
      type: Number,
      required: [true, "A duração é obrigatória"],
      min: [5, "A duração mínima é de 5 minutos"], // Validação de regra de negócio.
    },
    price: {
      type: Number,
      required: [true, "O preço é obrigatório"],
      min: [0, "O preço não pode ser negativo"],
    },
  },
  { timestamps: true }
);

// Reaproveita o model existente (evita erro de "OverwriteModelError" no hot reload).
export const Service: Model<IServiceDoc> =
  mongoose.models.Service ||
  mongoose.model<IServiceDoc>("Service", ServiceSchema);
