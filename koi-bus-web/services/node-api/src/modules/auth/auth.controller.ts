import { Request, Response } from 'express';
import { authService } from './auth.service';

// Cookie options — centralized so they stay consistent across all auth endpoints.
// sameSite:'lax' is required for cross-port localhost dev (3001 → 3000).
// secure:false on localhost; set true in production via NODE_ENV check.
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export class AuthController {
  async signup(req: Request, res: Response) {
    try {
      const data = req.body;
      data.ipAddress = req.ip;
      data.userAgent = req.headers['user-agent'];

      const result = await authService.signup(data);

      res.cookie('refreshToken', result.refreshToken, cookieOptions);
      res.status(201).json({ success: true, accessToken: result.accessToken, user: result.user });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { phone, password } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      const result = await authService.login(phone, password, ipAddress, userAgent);

      res.cookie('refreshToken', result.refreshToken, cookieOptions);
      res.json({ success: true, accessToken: result.accessToken, user: result.user });
    } catch (error: any) {
      res.status(401).json({ success: false, error: error.message });
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ success: false, error: 'Refresh token missing' });
      }

      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      const result = await authService.refresh(refreshToken, ipAddress, userAgent);

      res.cookie('refreshToken', result.refreshToken, cookieOptions);
      res.json({ success: true, accessToken: result.accessToken });
    } catch (error: any) {
      res.clearCookie('refreshToken', { path: '/' });
      res.status(401).json({ success: false, error: error.message });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
      res.clearCookie('refreshToken', { path: '/' });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getMe(req: Request, res: Response) {
    try {
      // @ts-ignore
      const userId = req.user.userId;
      const user = await authService.getMe(userId);
      res.json({ success: true, data: user });
    } catch (error: any) {
      res.status(404).json({ success: false, error: error.message });
    }
  }
}

export const authController = new AuthController();
