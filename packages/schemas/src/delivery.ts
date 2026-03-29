import { z } from 'zod'
import { addressSchema } from './address.js'

export const packageInfoSchema = z.object({
  description: z.string().min(1).max(255),
  weightKg: z.number().positive().max(100),
  isFragile: z.boolean(),
})

export const createDeliverySchema = z.object({
  pickup: addressSchema,
  dropoff: addressSchema,
  packageInfo: packageInfoSchema,
  priceInCents: z.number().int().min(100, 'Prix minimum 1 €'),
  scheduledAt: z.string().datetime().optional(),
})

export const updateDeliveryStatusSchema = z.object({
  status: z.enum(['accepted', 'picked_up', 'in_transit', 'delivered', 'cancelled']),
})

export type CreateDeliveryInput = z.infer<typeof createDeliverySchema>
export type UpdateDeliveryStatusInput = z.infer<typeof updateDeliveryStatusSchema>
