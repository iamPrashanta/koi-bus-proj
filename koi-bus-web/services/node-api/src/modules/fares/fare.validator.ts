import { z } from 'zod';

export const fareValidator = {
  createFare: z.object({
    body: z.object({
      fromStopId: z.number().int().positive(),
      toStopId: z.number().int().positive(),
      amount: z.number().positive(),
    }),
  }),
  updateFare: z.object({
    params: z.object({
      id: z.string().regex(/^\d+$/).transform(Number),
    }),
    body: z.object({
      fromStopId: z.number().int().positive().optional(),
      toStopId: z.number().int().positive().optional(),
      amount: z.number().positive().optional(),
    }),
  }),
  getFareParams: z.object({
    params: z.object({
      id: z.string().regex(/^\d+$/).transform(Number),
    }),
  }),
};
