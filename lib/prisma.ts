import { PrismaClient } from '@prisma/client'
import { ensureSchema } from './db-schema'

function createClient() {
  const base = new PrismaClient()
  // Antes da primeira consulta, garante que o banco está na versão certa (ver lib/db-schema.ts)
  return base.$extends({
    query: {
      async $allOperations({ args, query }) {
        await ensureSchema(base)
        return query(args)
      },
    },
  })
}

type Client = ReturnType<typeof createClient>

const globalForPrisma = globalThis as unknown as { prisma?: Client }

export const prisma = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
