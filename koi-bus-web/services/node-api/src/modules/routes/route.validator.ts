import { z } from 'zod';

export const routeValidator = {
  createRoute: z.object({
    body: z.object({
      code: z.string().min(1),
      name: z.string().min(1),
      operatorId: z.number().int(),
      isActive: z.boolean().optional(),
    }),
  }),
  updateRoute: z.object({
    params: z.object({
      id: z.string().regex(/^\d+$/).transform(Number),
    }),
    body: z.object({
      code: z.string().optional(),
      name: z.string().optional(),
      operatorId: z.number().int().optional(),
      isActive: z.boolean().optional(),
    }),
  }),
  getRouteParams: z.object({
    params: z.object({
      id: z.string().regex(/^\d+$/).transform(Number),
    }),
  }),
};
