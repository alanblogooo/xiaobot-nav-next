import { PrismaClient } from '@prisma/client'

interface GlobalWithPrisma {
  prisma: PrismaClient | undefined;
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!(global as GlobalWithPrisma).prisma) {
    (global as GlobalWithPrisma).prisma = new PrismaClient()
  }
  prisma = (global as GlobalWithPrisma).prisma as PrismaClient
}

export { prisma } 