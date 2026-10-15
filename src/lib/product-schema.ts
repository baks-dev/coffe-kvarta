import { z } from 'zod';

const base = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number().positive()
});

export const ProductSchema = z.discriminatedUnion('type', [
  base.extend({
    type: z.literal('coffee'),
    weight: z.string(),
    roastLevel: z.enum(['light', 'medium', 'medium-dark', 'dark']),
    notes: z.array(z.string()),
    recommendedFor: z.string().optional()
  }),
  base.extend({
    type: z.literal('drip-pack'),
    quantity: z.number()
  }),
  base.extend({
    type: z.literal('subscription'),
    period: z.string(),
    includes: z.array(z.string())
  })
]);

export type Product = z.infer<typeof ProductSchema>;
