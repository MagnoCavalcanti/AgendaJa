// ============================================================================
// ROUTE HANDLER: CADASTRO DE USUÁRIO (POST /api/register)
// Demonstra um Route Handler clássico fazendo ESCRITA no banco (parte do CRUD).
// Aqui aplicamos a boa prática de SEGURANÇA: hashing da senha com bcrypt.
// ============================================================================

import { NextResponse } from "next/server"; // Helper para devolver respostas HTTP.
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";

// Função que trata requisições POST nesta rota.
export async function POST(request: Request) {
  try {
    // 1) Lê o corpo JSON enviado pelo formulário de cadastro.
    const { name, email, password } = await request.json();

    // 2) Validação básica dos campos obrigatórios.
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Preencha nome, e-mail e senha." },
        { status: 400 } // 400 = requisição inválida.
      );
    }

    // 3) Conecta ao banco (Singleton).
    await dbConnect();

    // 4) Verifica se já existe alguém com esse e-mail (evita duplicidade).
    const jaExiste = await User.findOne({ email });
    if (jaExiste) {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado." },
        { status: 409 } // 409 = conflito.
      );
    }

    // 5) GERA O HASH DA SENHA.
    //    Nunca salvamos a senha em texto puro. O "10" é o custo (salt rounds):
    //    quanto maior, mais lento e mais seguro contra ataques de força bruta.
    const senhaComHash = await bcrypt.hash(password, 10);

    // 6) Cria o usuário no banco com a senha já hasheada.
    await User.create({
      name,
      email,
      password: senhaComHash,
    });

    // 7) Resposta de sucesso (201 = criado). Nunca devolvemos a senha.
    return NextResponse.json(
      { message: "Usuário cadastrado com sucesso." },
      { status: 201 }
    );
  } catch (error) {
    // 8) Qualquer erro inesperado vira um 500 com log no servidor.
    console.error("Erro no cadastro:", error);
    return NextResponse.json(
      { error: "Erro interno ao cadastrar." },
      { status: 500 }
    );
  }
}
