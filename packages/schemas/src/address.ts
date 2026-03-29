import { z } from 'zod'

export const geoPointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})

// Île-de-France uniquement: 75, 77, 78, 91, 92, 93, 94, 95
export const idfPostalCodeSchema = z
  .string()
  .regex(/^(75|77|78|91|92|93|94|95)\d{3}$/, 'Code postal hors Île-de-France')

export const addressSchema = z.object({
  street: z.string().min(1).max(255),
  city: z.string().min(1).max(100),
  postalCode: idfPostalCodeSchema,
  coords: geoPointSchema,
})
