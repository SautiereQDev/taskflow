import { HealthChecks, DiskSpaceCheck, MemoryHeapCheck } from '@adonisjs/health'

export const healthChecks = new HealthChecks().register([
  new DiskSpaceCheck(),
  new MemoryHeapCheck(),
])
