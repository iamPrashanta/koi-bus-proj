import { z } from 'zod';

export const tripValidator = {
  createTrip: z.object({
    body: z.object({
      routeId: z.number().int().positive(),
      startTime: z.string().datetime(),
      endTime: z.string().datetime().optional(),
      busType: z.enum(['LOCAL', 'EXPRESS', 'AC', 'SUPER']),
    }),
  }),
  updateTrip: z.object({
    params: z.object({
      id: z.string().regex(/^\d+$/).transform(Number),
    }),
    body: z.object({
      routeId: z.number().int().positive().optional(),
      startTime: z.string().datetime().optional(),
      endTime: z.string().datetime().optional(),
      busType: z.enum(['LOCAL', 'EXPRESS', 'AC', 'SUPER']).optional(),
    }),
  }),
  getTripParams: z.object({
    params: z.object({
      id: z.string().regex(/^\d+$/).transform(Number),
    }),
  }),
};
