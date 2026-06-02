// ============================================================================
// CONEXÃO COM O MONGODB ATLAS USANDO O PADRÃO SINGLETON
// ----------------------------------------------------------------------------
// PROBLEMA QUE RESOLVEMOS:
// Em ambiente serverless (Vercel) e durante o "hot reload" do Next.js em
// desenvolvimento, cada requisição/recarga poderia abrir uma NOVA conexão com
// o banco. Isso rapidamente estoura o limite de conexões do MongoDB Atlas.
//
// SOLUÇÃO (Singleton):
// Guardamos a conexão (e a promise de conexão) em uma variável GLOBAL.
// Assim, se já existe uma conexão aberta, reutilizamos a mesma em vez de criar
// outra. É o clássico padrão Singleton aplicado ao acesso a dados.
// ============================================================================

import mongoose from "mongoose"; // ODM (Object Document Mapper) para o MongoDB.

// Lemos a URI do banco das variáveis de ambiente (definida no .env.local / Vercel).
const MONGODB_URI = process.env.MONGODB_URI;

// Se a variável não existir, derrubamos a aplicação cedo com uma mensagem clara.
if (!MONGODB_URI) {
  throw new Error(
    "Defina a variável de ambiente MONGODB_URI no arquivo .env.local"
  );
}

// Tipo do objeto que vamos guardar em cache: a conexão e a promise pendente.
interface MongooseCache {
  conn: typeof mongoose | null;            // Conexão já estabelecida (ou null).
  promise: Promise<typeof mongoose> | null; // Promise da conexão em andamento (ou null).
}

// Estendemos o objeto global do Node para guardar o cache entre hot reloads.
// (Em produção serverless, o global é reaproveitado enquanto a função fica "quente".)
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

// Recupera o cache do global; se não existir ainda, cria um cache vazio.
let cached = global.mongooseCache;
if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

/**
 * Função única de acesso ao banco. Toda parte do app (Server Actions, Route
 * Handlers, etc.) deve chamar dbConnect() antes de usar os Models.
 */
export async function dbConnect(): Promise<typeof mongoose> {
  // 1) Se já temos conexão aberta em cache, reutilizamos imediatamente.
  if (cached!.conn) {
    return cached!.conn;
  }

  // 2) Se ainda não há uma promise de conexão, criamos UMA só (Singleton).
  if (!cached!.promise) {
    const opts = {
      bufferCommands: false, // Não enfileira comandos enquanto desconectado (falha rápido).
    };

    // Inicia a conexão e guarda a promise no cache para reaproveitamento.
    cached!.promise = mongoose.connect(MONGODB_URI!, opts).then((m) => m);
  }

  // 3) Aguardamos a promise (existente ou recém-criada) e guardamos a conexão.
  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    // Se falhar, zeramos a promise para permitir nova tentativa na próxima chamada.
    cached!.promise = null;
    throw e;
  }

  // 4) Retornamos a conexão única e compartilhada.
  return cached!.conn;
}
