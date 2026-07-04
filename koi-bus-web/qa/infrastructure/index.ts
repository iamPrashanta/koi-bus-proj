export interface InfrastructureController {
  stopRedis(): Promise<void>;
  startRedis(): Promise<void>;
  stopBackend(): Promise<void>;
  startBackend(): Promise<void>;
  restartRedis(): Promise<void>;
  restartBackend(): Promise<void>;
}
