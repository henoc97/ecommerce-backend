// prisma/prisma.service.ts
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

declare global {
  // This is necessary to prevent TypeScript from complaining about the `global` object
  var __prisma: PrismaClient | undefined;
}

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient();
  }
  prisma = global.__prisma;
}

export default prisma;