import { authRepository } from './auth.repository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserRole } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_in_prod';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_change_in_prod';

export class AuthService {
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private generateTokens(userId: number, role: UserRole) {
    const accessToken = jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = crypto.randomBytes(64).toString('hex');
    return { accessToken, refreshToken };
  }

  private normalizePhone(phone: string): string {
    if (!phone) return phone;
    const digits = phone.replace(/[^\d]/g, '');
    return digits.slice(-10);
  }

  async signup(data: any) {
    data.phone = this.normalizePhone(data.phone);
    const existing = await authRepository.findUserByPhone(data.phone);
    if (existing) {
      throw new Error('Phone number already registered');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await authRepository.createUser({
      phone: data.phone,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      passwordHash,
      role: data.role as UserRole || 'PASSENGER',
      profile: {
        create: {}
      }
    });

    const tokens = this.generateTokens(user.id, user.role);
    const hashedRefresh = this.hashToken(tokens.refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const rtRecord = await authRepository.storeRefreshToken(user.id, hashedRefresh, expiresAt);
    
    // Create session record
    await authRepository.createUserSession(user.id, rtRecord.id, data.ipAddress, data.userAgent);

    return {
      user: { id: user.id, phone: user.phone, role: user.role, firstName: user.firstName, lastName: user.lastName, operatorId: user.operatorId },
      ...tokens
    };
  }

  async login(phone: string, password: string, ipAddress?: string, userAgent?: string) {
    const normalizedPhone = this.normalizePhone(phone);
    const user = await authRepository.findUserByPhone(normalizedPhone);
    if (!user || !user.isActive) {
      throw new Error('Invalid credentials');
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      throw new Error('Invalid credentials');
    }

    const tokens = this.generateTokens(user.id, user.role);
    const hashedRefresh = this.hashToken(tokens.refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const rtRecord = await authRepository.storeRefreshToken(user.id, hashedRefresh, expiresAt);
    
    // Create session record
    await authRepository.createUserSession(user.id, rtRecord.id, ipAddress, userAgent);

    return {
      user: { id: user.id, phone: user.phone, role: user.role, firstName: user.firstName, lastName: user.lastName, operatorId: user.operatorId },
      ...tokens
    };
  }

  async refresh(oldRefreshToken: string, ipAddress?: string, userAgent?: string) {
    const tokenHash = this.hashToken(oldRefreshToken);
    const record = await authRepository.findRefreshTokenByHash(tokenHash);

    if (!record) {
      throw new Error('Invalid refresh token');
    }

    // Reuse detection (Replay protection)
    if (record.revokedAt) {
      await authRepository.revokeAllUserRefreshTokens(record.userId);
      throw new Error('Security Alert: Refresh token reuse detected. All sessions revoked.');
    }

    if (new Date() > record.expiresAt) {
      await authRepository.revokeRefreshToken(record.id);
      throw new Error('Refresh token expired');
    }

    const tokens = this.generateTokens(record.userId, record.user.role);
    const newHashedRefresh = this.hashToken(tokens.refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const newRtRecord = await authRepository.storeRefreshToken(record.userId, newHashedRefresh, expiresAt);
    await authRepository.replaceRefreshToken(record.id, newHashedRefresh);
    
    // Create new session record
    await authRepository.createUserSession(record.userId, newRtRecord.id, ipAddress, userAgent);

    return tokens;
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    const record = await authRepository.findRefreshTokenByHash(tokenHash);
    
    if (record && !record.revokedAt) {
      await authRepository.revokeRefreshToken(record.id);
    }
    return { success: true };
  }

  async getMe(userId: number) {
    const user = await authRepository.findUserById(userId);
    if (!user) throw new Error('User not found');
    return { id: user.id, phone: user.phone, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName, operatorId: user.operatorId };
  }
}

export const authService = new AuthService();
