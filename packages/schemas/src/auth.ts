import { z } from 'zod'
import { addressSchema } from './address'

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
})

const baseRegisterSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z
    .string()
    .min(8, 'Minimum 8 caractères')
    .regex(/[A-Z]/, 'Au moins une majuscule')
    .regex(/[0-9]/, 'Au moins un chiffre'),
})

export const registerMerchantSchema = baseRegisterSchema.extend({
  role: z.literal('merchant'),
  shopName: z.string().min(1).max(255),
  siret: z.string().regex(/^\d{14}$/, 'SIRET invalide (14 chiffres)'),
  address: addressSchema,
})

export const registerDriverSchema = baseRegisterSchema.extend({
  role: z.literal('driver'),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  vehicleType: z.enum(['bike', 'scooter', 'car', 'van']),
  zones: z
    .array(z.string().regex(/^\d{5}$/))
    .min(1, 'Au moins une zone requise')
    .max(50),
})

export const registerSchema = z.discriminatedUnion('role', [
  registerMerchantSchema,
  registerDriverSchema,
])

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type RegisterMerchantInput = z.infer<typeof registerMerchantSchema>
export type RegisterDriverInput = z.infer<typeof registerDriverSchema>
