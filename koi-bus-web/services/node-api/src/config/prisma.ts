import { PrismaClient } from '@prisma/client';
import { env } from './env'; // Ensure env is loaded

export const prisma = new PrismaClient({});
