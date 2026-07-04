import { z } from 'zod';

export const searchValidator = {
  getSearch: z.object({
    query: z.object({
      from: z.string().min(1, 'From stop is required'),
      to: z.string().min(1, 'To stop is required'),
    }),
  }),
};
