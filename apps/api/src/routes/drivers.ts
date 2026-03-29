import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { driverProfiles } from '../db/schema.js'
import { authenticate, requireRole } from '../middleware/auth.js'

export async function driverRoutes(app: FastifyInstance) {
  // GET /drivers/available — visible par les merchants
  app.get('/drivers/available', { preHandler: [authenticate, requireRole('merchant', 'admin')] }, async (_req, reply) => {
    const drivers = await db.select().from(driverProfiles).where(eq(driverProfiles.isAvailable, true))
    return reply.send({ data: drivers, error: null })
  })

  // PATCH /drivers/me/availability — driver toggles availability
  app.patch('/drivers/me/availability', { preHandler: [authenticate, requireRole('driver')] }, async (req, reply) => {
    const body = z.object({ isAvailable: z.boolean() }).safeParse(req.body)
    if (!body.success) return reply.code(400).send({ data: null, error: { code: 'VALIDATION_ERROR', message: body.error.message } })

    const [updated] = await db.update(driverProfiles)
      .set({ isAvailable: body.data.isAvailable })
      .where(eq(driverProfiles.userId, req.userId))
      .returning()

    return reply.send({ data: updated, error: null })
  })

  // PATCH /drivers/me/location — driver updates GPS position (also via WebSocket)
  app.patch('/drivers/me/location', { preHandler: [authenticate, requireRole('driver')] }, async (req, reply) => {
    const body = z.object({ lat: z.number(), lng: z.number() }).safeParse(req.body)
    if (!body.success) return reply.code(400).send({ data: null, error: { code: 'VALIDATION_ERROR', message: body.error.message } })

    const [updated] = await db.update(driverProfiles)
      .set({ currentLocation: body.data })
      .where(eq(driverProfiles.userId, req.userId))
      .returning()

    app.io.emit('driver:location', { driverId: req.userId, location: body.data })

    return reply.send({ data: updated, error: null })
  })
}
