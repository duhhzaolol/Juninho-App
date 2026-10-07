// Atualiza o banco de dados sozinho, sem precisar rodar comando no terminal.
//
// Na primeira consulta depois de cada deploy, o app confere a versão do banco (tabela "_jm_schema")
// e, se faltar alguma coisa, cria numa única transação. Só ADICIONA tabelas e colunas novas:
// nunca apaga nem altera dados que já existem. Pode rodar quantas vezes for preciso.
//
// Ao mudar o prisma/schema.prisma no futuro, adicione uma nova versão no fim da lista MIGRATIONS.

import type { PrismaClient } from '@prisma/client'

const MIGRATIONS: { version: number; name: string; sql: string[] }[] = [
  {
    version: 1,
    name: 'loja de planilhas, confirmação de e-mail e convite',
    sql: [
      `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP(3)`,
      // quem já tinha conta antes desta versão é considerado com e-mail confirmado
      `UPDATE "User" SET "emailVerifiedAt" = "createdAt" WHERE "emailVerifiedAt" IS NULL`,
      `ALTER TABLE "StudentProfile" ADD COLUMN IF NOT EXISTS "workoutDueAt" TIMESTAMP(3)`,
      `ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "periodDays" INTEGER`,
      `CREATE TABLE IF NOT EXISTS "Product" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "trainerId" TEXT NOT NULL REFERENCES "TrainerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "slug" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "category" TEXT,
        "tagline" TEXT,
        "description" TEXT,
        "priceCents" INTEGER NOT NULL DEFAULT 0,
        "oldPriceCents" INTEGER,
        "checkoutUrl" TEXT,
        "tictoCodes" TEXT,
        "unlockMode" TEXT NOT NULL DEFAULT 'WEEKLY',
        "unlockDays" INTEGER NOT NULL DEFAULT 7,
        "status" TEXT NOT NULL DEFAULT 'draft',
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "Product_slug_key" ON "Product"("slug")`,
      `CREATE TABLE IF NOT EXISTS "ProductWeek" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "week" INTEGER NOT NULL,
        "programId" TEXT NOT NULL REFERENCES "WeeklyProgram"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "ProductWeek_productId_week_key" ON "ProductWeek"("productId", "week")`,
      `CREATE TABLE IF NOT EXISTS "Purchase" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "studentId" TEXT REFERENCES "StudentProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        "email" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'active',
        "source" TEXT NOT NULL DEFAULT 'ticto',
        "externalId" TEXT,
        "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "Purchase_productId_email_key" ON "Purchase"("productId", "email")`,
      `CREATE TABLE IF NOT EXISTS "AuthToken" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "purpose" TEXT NOT NULL,
        "tokenHash" TEXT NOT NULL,
        "attempts" INTEGER NOT NULL DEFAULT 0,
        "expiresAt" TIMESTAMP(3) NOT NULL,
        "usedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "AuthToken_tokenHash_key" ON "AuthToken"("tokenHash")`,
      `CREATE TABLE IF NOT EXISTS "WebhookLog" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "source" TEXT NOT NULL,
        "result" TEXT NOT NULL,
        "message" TEXT,
        "payload" JSONB NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
    ],
  },
]

export const SCHEMA_VERSION = MIGRATIONS[MIGRATIONS.length - 1].version

let ready: Promise<void> | null = null

async function run(base: PrismaClient) {
  await base.$executeRawUnsafe(
    `CREATE TABLE IF NOT EXISTS "_jm_schema" ("id" INTEGER PRIMARY KEY, "version" INTEGER NOT NULL, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP)`
  )
  const rows = await base.$queryRawUnsafe<{ version: number }[]>(`SELECT "version" FROM "_jm_schema" WHERE "id" = 1`)
  if ((rows[0]?.version ?? 0) >= SCHEMA_VERSION) return

  await base.$transaction(
    async (tx) => {
      // trava para dois servidores não atualizarem ao mesmo tempo
      await tx.$executeRawUnsafe(`SELECT pg_advisory_xact_lock(4242001)`)
      const current = await tx.$queryRawUnsafe<{ version: number }[]>(`SELECT "version" FROM "_jm_schema" WHERE "id" = 1`)
      const from = current[0]?.version ?? 0
      for (const m of MIGRATIONS) {
        if (m.version <= from) continue
        for (const statement of m.sql) await tx.$executeRawUnsafe(statement)
        await tx.$executeRawUnsafe(
          `INSERT INTO "_jm_schema" ("id", "version", "updatedAt") VALUES (1, ${m.version}, CURRENT_TIMESTAMP)
           ON CONFLICT ("id") DO UPDATE SET "version" = EXCLUDED."version", "updatedAt" = CURRENT_TIMESTAMP`
        )
        console.log(`[banco] atualizado para a versão ${m.version}: ${m.name}`)
      }
    },
    { timeout: 30000, maxWait: 15000 }
  )
}

export function ensureSchema(base: PrismaClient): Promise<void> {
  if (!ready) {
    ready = run(base).catch((err) => {
      ready = null // tenta de novo na próxima consulta
      throw err
    })
  }
  return ready
}
