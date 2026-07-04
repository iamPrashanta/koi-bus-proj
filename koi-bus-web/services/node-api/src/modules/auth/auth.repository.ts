import { prisma } from '../../config/prisma';
import { Prisma, UserRole } from '@prisma/client';

export class AuthRepository {
  async createUser(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  }

  async findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findUserByPhone(phone: string) {
    return prisma.user.findUnique({ where: { phone } });
  }

  async findUserById(id: number) {
    return prisma.user.findUnique({ where: { id } });
  }

  async storeRefreshToken(userId: number, tokenHash: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  async findRefreshTokenByHash(tokenHash: string) {
    return prisma.refreshToken.findFirst({
      where: { tokenHash },
      include: { user: true },
    });
  }

  async revokeRefreshToken(id: number) {
    return prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllUserRefreshTokens(userId: number) {
    return prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async replaceRefreshToken(oldId: number, newHash: string) {
    return prisma.refreshToken.update({
      where: { id: oldId },
      data: { 
        revokedAt: new Date(),
        replacedBy: newHash
      },
    });
  }

  async createUserSession(userId: number, refreshTokenId: number, ipAddress?: string, userAgent?: string) {
    return prisma.userSession.create({
      data: {
        userId,
        refreshTokenId,
        ipAddress,
        userAgent,
      }
    });
  }
}

export const authRepository = new AuthRepository();
