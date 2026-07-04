import { InfrastructureController } from './index';

export class NoopController implements InfrastructureController {
  async stopRedis(): Promise<void> { console.log('[NOOP] stopRedis'); }
  async startRedis(): Promise<void> { console.log('[NOOP] startRedis'); }
  async stopBackend(): Promise<void> { console.log('[NOOP] stopBackend'); }
  async startBackend(): Promise<void> { console.log('[NOOP] startBackend'); }
  async restartRedis(): Promise<void> { console.log('[NOOP] restartRedis'); }
  async restartBackend(): Promise<void> { console.log('[NOOP] restartBackend'); }
}
