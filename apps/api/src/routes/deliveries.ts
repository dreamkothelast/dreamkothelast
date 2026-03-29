import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { db } from '../db/client.js'
import { deliveries } from '../db/schema.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import type { DeliveryStatus } from '@parislivr/types'

const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().regex(/^(75|77|78|91|92|93|94|95)\d{3}$/, 'Code postal hors Île-de-France'),
  coords: z.object({ lat: z.number(), lng: z.number() }),
})

const createDeliverySchema = z.object({
  pickup: addressSchema,
  dropoff: addressSchema,
  packageInfo: z.object({
    description: z.string().min(1).max(255),
    weightKg: z.number().positive().max(100),
    isFragile: z.boolean(),
  }),
  priceInCents: z.number().int().positive(),
  scheduledAt: z.string().datetime().optional(),
})

const VALID_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
  pending: ['accepted', 'cancelled'],
  accepted: ['picked_up', 'cancelled'],
  picked_up: ['in_transit'],
  in_transit: ['delivered'],
  delivered: [],
  cancelled: [],
}

export async function deliveryRoutes(app: FastifyInstance) {
  // GET /deliveries — merchant: own deliveries / driver: available deliveries
  app.get('/deliveries', { preHandler: [authenticate] }, async (req, reply) => {
    if (req.userRole === 'merchant') {
      const rows = await db.select().from(deliveries).where(eq(deliveries.merchantId, req.userId))
      return reply.send({ data: rows, error: null })
    }

    if (req.userRole === 'driver') {
      const rows = await db.select().from(deliveries).where(eq(deliveries.status, 'pending'))
      return reply.send({ data: rows, error: null })
    }

    // admin: all
    const rows = await db.select().from(deliveries)
    return reply.send({ data: rows, error: null })
  })

  // POST /deliveries — merchant only
  app.post('/deliveries', { preHandler: [authenticate, requireRole('merchant')] }, async (req, reply) => {
    const body = createDeliverySchema.safeParse(req.body)
    if (!body.success) return reply.code(400).send({ data: null, error: { code: 'VALIDATION_ERROR', message: body.error.message } })

    const [delivery] = await db.insert(deliveries).values({
      merchantId: req.userId,
      ...body.data,
    }).returning()

    // Emit to available drivers via Socket.io
    app.io.emit('delivery:new', delivery)

    return reply.code(201).send({ data: delivery, error: null })
  })

  // GET /deliveries/:id
  app.get('/deliveries/:id', { preHandler: [authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const [delivery] = await db.select().from(deliveries).where(eq(deliveries.id, id)).limit(1)

    if (!delivery) return reply.code(404).send({ data: null, error: { code: 'NOT_FOUND', message: 'Livraison introuvable' } })

    // Merchants can only see their own deliveries
    if (req.userRole === 'merchant' && delivery.merchantId !== req.userId) {
      return reply.code(403).send({ data: null, error: { code: 'FORBIDDEN', message: 'Accès refusé' } })
    }

    return reply.send({ data: delivery, error: null })
  })

  // PATCH /deliveries/:id/status
  app.patch('/deliveries/:id/status', { preHandler: [authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const body = z.object({ status: z.enum(['accepted', 'picked_up', 'in_transit', 'delivered', 'cancelled']) }).safeParse(req.body)
    if (!body.success) return reply.code(400).send({ data: null, error: { code: 'VALIDATION_ERROR', message: body.error.message } })

    const [delivery] = await db.select().from(deliveries).where(eq(deliveries.id, id)).limit(1)
    if (!delivery) return reply.code(404).send({ data: null, error: { code: 'NOT_FOUND', message: 'Livraison introuvable' } })

    const allowed = VALID_TRANSITIONS[delivery.status]
    if (!allowed.includes(body.data.status)) {
      return reply.code(422).send({ data: null, error: { code: 'INVALID_TRANSITION', message: `Transition ${delivery.status} → ${body.data.status} non autorisée` } })
    }

    const timestamps: Partial<typeof delivery> = {}
    if (body.data.status === 'accepted') {
      timestamps.acceptedAt = new Date()
      // Assign driver
      if (req.userRole !== 'driver') return reply.code(403).send({ data: null, error: { code: 'FORBIDDEN', message: 'Seul un livreur peut accepter une livraison' } })
    }
    if (body.data.status === 'picked_up') timestamps.pickedUpAt = new Date()
    if (body.data.status === 'delivered') timestamps.deliveredAt = new Date()

    const updateData: Record<string, unknown> = { status: body.data.status, ...timestamps }
    if (body.data.status === 'accepted') updateData['driverId'] = req.userId

    const [updated] = await db.update(deliveries)
      .set(updateData)
      .where(and(eq(deliveries.id, id)))
      .returning()

    app.io.to(`delivery:${id}`).emit('delivery:status', { deliveryId: id, status: body.data.status, updatedAt: new Date().toISOString() })

    return reply.send({ data: updated, error: null })
  })
}
