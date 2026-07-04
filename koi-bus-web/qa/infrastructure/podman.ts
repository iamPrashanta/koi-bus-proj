import { execSync } from 'child_process';
import { InfrastructureController } from './index';

export class PodmanController implements InfrastructureController {
  async stopRedis(): Promise<void> {
    console.log('Stopping Redis (Podman)...');
    execSync('podman stop koi_bus_redis');
  }
  
  async startRedis(): Promise<void> {
    console.log('Starting Redis (Podman)...');
    execSync('podman start koi_bus_redis');
  }
  
  async stopBackend(): Promise<void> {
    // In our local environment, backend is typically run via npm run dev in PowerShell.
    // For chaos testing, we might need to kill the process holding port 4000.
    console.log('Stopping Backend...');
    try {
      execSync('FOR /F "tokens=5" %a in (\'netstat -aon ^| findstr :4000\') do taskkill /F /PID %a');
    } catch(e) {}
  }
  
  async startBackend(): Promise<void> {
    console.log('Starting Backend...');
    // We would restart the backend process here
  }
  
  async restartRedis(): Promise<void> {
    await this.stopRedis();
    await this.startRedis();
  }
  
  async restartBackend(): Promise<void> {
    await this.stopBackend();
    await this.startBackend();
  }
}
