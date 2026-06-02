# AgendaJá — Plataforma de Agendamento de Serviços (SaaS)

Plataforma SaaS de agendamento para **barbearias e clínicas**, construída com **Next.js 14 (App Router)**. O cliente se cadastra, escolhe um serviço e marca um horário; o painel acompanha tudo.

> Projeto desenvolvido para a 3ª Unidade de **Web II** (Tema 1).

---

## Tecnologias adotadas

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Banco de dados | MongoDB Atlas + Mongoose (conexão **Singleton**) |
| Autenticação | NextAuth.js (Credentials Provider, sessão via **JWT**) |
| Senhas | **bcryptjs** (hashing) |
| Dados assíncronos | **React Query** (TanStack) + **Server Actions** com `revalidatePath` |
| Estado de UI | **Zustand** (modal e filtros) |
| Estilização | **Tailwind CSS** + componentes no estilo **ShadCN/UI** |
| Deploy | **Vercel** |

---

## Como rodar localmente

### 1. Pré-requisitos
- Node.js 18.18+ instalado.
- Uma conta gratuita no [MongoDB Atlas](https://www.mongodb.com/atlas) com um cluster criado.

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
Copie o arquivo de exemplo e preencha com seus dados:
```bash
cp .env.example .env.local
```
Edite o `.env.local`:
```env
MONGODB_URI="sua-string-de-conexao-do-atlas"
NEXTAUTH_SECRET="gere-com: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Rodar em desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:3000`.

### 5. Fluxo de teste
1. Crie uma conta em **/register**.
2. Em **Serviços**, cadastre alguns serviços (ex: Corte, Barba).
3. Em **Agendamentos**, clique em **Novo agendamento** e marque um horário.
4. Filtre por status e cancele um agendamento para ver o cache atualizar.

---

## Deploy na Vercel

1. Suba o projeto para um repositório no GitHub.
2. Em [vercel.com](https://vercel.com), clique em **New Project** e importe o repositório.
3. Em **Settings > Environment Variables**, cadastre (mascaradas):
   - `MONGODB_URI`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (use a URL gerada pela Vercel, ex: `https://agendaja.vercel.app`)
4. No MongoDB Atlas, libere o acesso de rede para `0.0.0.0/0` (ou os IPs da Vercel).
5. Clique em **Deploy**.

---

## Mapa da arquitetura (Clean Architecture)

```
src/
├── app/                 # Rotas (App Router)
│   ├── (auth)/          # Grupo de rotas: login e cadastro
│   ├── api/             # Route Handlers (auth, register, services, appointments)
│   ├── dashboard/       # Área protegida (layout aninhado + páginas)
│   ├── layout.tsx       # Layout raiz + Providers
│   ├── loading.tsx      # UX: carregamento global
│   └── error.tsx        # UX: erro global
├── components/          # Componentes (ui/ = base ShadCN, providers/, etc.)
├── lib/                 # mongodb (Singleton), auth (NextAuth), utils
├── models/              # Schemas Mongoose (User, Service, Appointment)
├── store/               # Zustand (estado de UI do cliente)
├── types/               # Tipagens TypeScript compartilhadas
└── middleware.ts        # Proteção de rota no frontend (borda)
```

---

## Onde cada critério da avaliação foi atendido

- **Singleton (MongoDB):** `src/lib/mongodb.ts`
- **CRUD:** Server Actions em `app/dashboard/services/actions.ts` e Route Handlers em `app/api/appointments/`
- **React Query / revalidação:** `components/AppointmentsClient.tsx` (React Query) e `actions.ts` (`revalidatePath`)
- **NextAuth + JWT:** `lib/auth.ts` e `app/api/auth/[...nextauth]/route.ts`
- **Proteção em camadas:** `middleware.ts` (frontend) + `app/dashboard/layout.tsx` e Route Handlers (backend, `getServerSession`)
- **bcrypt:** `app/api/register/route.ts` e `lib/auth.ts`
- **App Router / layouts / rota dinâmica:** `app/dashboard/layout.tsx`, `app/dashboard/appointments/[id]/page.tsx`
- **Zustand:** `store/useUIStore.ts` (modal e filtros)
- **loading.tsx / error.tsx:** na raiz e em `dashboard/`
- **ShadCN/Tailwind:** `components/ui/`
- **Image / Link:** `app/page.tsx` e `components/Navbar.tsx`
- **Server vs Client Components:** páginas como Server por padrão; interatividade isolada em `"use client"`
```
