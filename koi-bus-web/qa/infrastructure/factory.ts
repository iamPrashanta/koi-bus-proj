import { InfrastructureController } from './index';
import { PodmanController } from './podman';
import { NoopController } from './noop';

export function getInfrastructureController(): InfrastructureController {
  const provider = process.env.QA_INFRA_PROVIDER || 'podman';
  
  if (provider === 'podman') {
    return new PodmanController();
  }
  return new NoopController();
}
