import { z } from 'zod';

export const busValidator = {
  createBus: z.object({
    body: z.object({
      registrationNumber: z.string().min(1),
      routeId: z.number().int().positive(),
    }),
  }),
  updateBus: z.object({
    params: z.object({
      id: z.string().regex(/^\d+$/).transform(Number),
    }),
    body: z.object({
      registrationNumber: z.string().min(1).optional(),
      routeId: z.number().int().positive().optional(),
    }),
  }),
  getBusParams: z.object({
    params: z.object({
      id: z.string().regex(/^\d+$/).transform(Number),
    }),
  }),
  recordLocation: z.object({
    params: z.object({
      id: z.string().regex(/^\d+$/).transform(Number),
    }),
    body: z.object({
      latitude: z.number(),
      longitude: z.number(),
      speed: z.number().optional(),
    }),
  }),
};
