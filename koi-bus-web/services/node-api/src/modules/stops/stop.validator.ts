import { z } from 'zod';

export const stopValidator = {
  createStop: z.object({
    body: z.object({
      name: z.string().min(1),
      latitude: z.number(),
      longitude: z.number(),
      city: z.string().min(1),
      osmId: z.string().optional(),
      geohash: z.string().optional(),
    }),
  }),
  updateStop: z.object({
    params: z.object({
      id: z.string().regex(/^\d+$/).transform(Number),
    }),
    body: z.object({
      name: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      city: z.string().optional(),
      osmId: z.string().optional(),
      geohash: z.string().optional(),
    }),
  }),
  getStopParams: z.object({
    params: z.object({
      id: z.string().regex(/^\d+$/).transform(Number),
    }),
  }),
};
