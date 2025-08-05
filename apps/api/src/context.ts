import { PrismaClient } from '@prisma/client'
import { verifyToken } from './auth/jwt'
import { ExpressContextFunctionArgument } from '@as-integrations/express5'

const prisma = new PrismaClient()

export async function createContext({ req }: ExpressContextFunctionArgument) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  const userId = token ? verifyToken(token) : null

  return { prisma, userId }
}

export type MyContext = Awaited<ReturnType<typeof createContext>>
