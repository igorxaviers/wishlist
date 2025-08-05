import path from 'node:path'
import type { PrismaConfig } from 'prisma'

export default {
  earlyAccess: true,
  schema: path.join('./api/src/prisma'),
} satisfies PrismaConfig<Env>