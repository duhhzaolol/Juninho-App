# JM Team — Módulo 1: Autenticação + Dashboard do Aluno

Primeiro módulo implementado, conforme a arquitetura, design system, wireframes e biblioteca de componentes já validados.

## O que está implementado
- Modelagem completa do banco (`prisma/schema.prisma`)
- Autenticação por credenciais com papéis Aluno/Professor (`lib/auth.ts`)
- Tela de login (`app/(auth)/login`)
- Dashboard do Aluno (`app/(student)/dashboard`) consumindo dados reais do Prisma
- Componentes base: `Button`, `Card` (4 variantes), `ProgressBar`, `BottomNav`

## Como rodar
```bash
npm install
cp .env.example .env      # preencher DATABASE_URL e AUTH_SECRET
npx prisma migrate dev
npm run prisma:seed       # popula com professor, aluna, treino e histórico de teste
npm run dev
```

## Login de teste (após o seed)
- Professor: `juninho@jmteam.app` / `123456`
- Aluna: `carla@aluna.app` / `123456`

## Próximos módulos sugeridos
1. Fluxo de treino (lista de exercícios → execução → cronômetro de descanso)
2. Progresso (gráficos + fotos)
3. Área do Professor: Dashboard + Alunos
4. Criador de Treinos (drag-and-drop)
