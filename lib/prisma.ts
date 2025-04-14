import { PrismaClient } from "@prisma/client"

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient
}

let prisma: PrismaClient
if (process.env.NODE_ENV === "production") {
//   const pool = new Pool({ connectionString: process.env.DATABASE_URL })
//   const adapter = new PrismaNeon(pool)
  prisma = new PrismaClient()
} else {
  if (!global.cachedPrisma) {
    // const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    // const adapter = new PrismaNeon(pool)
    global.cachedPrisma = new PrismaClient()
  }
  prisma = global.cachedPrisma
}

export const db = prisma
