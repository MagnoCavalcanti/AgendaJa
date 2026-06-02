// ============================================================================
// MODEL: USER (Usuário)
// Define o schema do usuário no MongoDB via Mongoose.
// IMPORTANTE: a senha é armazenada SEMPRE como hash (bcrypt), nunca em texto puro.
// ============================================================================

import mongoose, { Schema, Document, Model } from "mongoose";

// Interface que descreve um documento de usuário no banco (camada de dados).
export interface IUserDoc extends Document {
  name: string;     // Nome completo.
  email: string;    // E-mail (usado como login; precisa ser único).
  password: string; // Hash da senha (gerado com bcrypt no cadastro).
  role: "ADMIN" | "CLIENTE"; // Papel para controle de acesso.
  createdAt: Date;
}

// Definição do schema (estrutura + validações).
const UserSchema = new Schema<IUserDoc>(
  {
    name: {
      type: String,
      required: [true, "O nome é obrigatório"], // Validação no nível do banco.
    },
    email: {
      type: String,
      required: [true, "O e-mail é obrigatório"],
      unique: true,        // Índice único: impede dois cadastros com o mesmo e-mail.
      lowercase: true,     // Normaliza para minúsculas antes de salvar.
      trim: true,          // Remove espaços nas extremidades.
    },
    password: {
      type: String,
      required: [true, "A senha é obrigatória"],
      select: false,       // Por padrão, NÃO retorna a senha nas consultas (segurança).
    },
    role: {
      type: String,
      enum: ["ADMIN", "CLIENTE"], // Só aceita esses dois valores.
      default: "CLIENTE",          // Novos cadastros são clientes por padrão.
    },
  },
  {
    timestamps: true, // Cria automaticamente os campos createdAt e updatedAt.
  }
);

// PADRÃO SINGLETON DE MODEL:
// Em hot reload, o Mongoose tentaria registrar o mesmo model duas vezes e quebraria.
// Por isso reaproveitamos o model já existente em mongoose.models, se houver.
export const User: Model<IUserDoc> =
  mongoose.models.User || mongoose.model<IUserDoc>("User", UserSchema);
