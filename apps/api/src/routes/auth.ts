import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { users } from '../db/schema.js'
import { redis } from '../lib/redis.js'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt.js'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env['NODE_ENV'] === 'production',
  sameSite: 'strict' as const,
  path: '/',
}

export async function authRoutes(app: FastifyInstance) {
  // POST /auth/login
  app.post('/auth/login', async (req, reply) => {
    const body = loginSchema.safeParse(req.body)
    if (!body.success) return reply.code(400).send({ data: null, error: { code: 'VALIDATION_ERROR', message: body.error.message } })

    const { email, password } = body.data
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return reply.code(401).send({ data: null, error: { code: 'INVALID_CREDENTIALS', message: 'Email ou mot de passe incorrect' } })
    }

    const payload = { sub: user.id, role: user.role }
    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)

    // Store refresh token in Redis (TTL 7 days)
    await redis.setex(`refresh:${user.id}`, 60 * 60 * 24 * 7, refreshToken)

    reply
      .setCookie('access_token', accessToken, { ...COOKIE_OPTS, maxAge: 60 * 15 })
      .setCookie('refresh_token', refreshToken, { ...COOKIE_OPTS, maxAge: 60 * 60 * 24 * 7 })
      .send({ data: { id: user.id, email: user.email, role: user.role }, error: null })
  })

  // POST /auth/refresh
  app.post('/auth/refresh', async (req, reply) => {
    const token = req.cookies['refresh_token']
    if (!token) return reply.code(401).send({ data: null, error: { code: 'UNAUTHORIZED', message: 'No refresh token' } })

    try {
      const payload = verifyRefreshToken(token)
      const stored = await redis.get(`refresh:${payload.sub}`)
      if (stored !== token) throw new Error('Token reuse detected')

      const newAccess = signAccessToken({ sub: payload.sub, role: payload.role })
      const newRefresh = signRefreshToken({ sub: payload.sub, role: payload.role })

      // Rotate refresh token
      await redis.setex(`refresh:${payload.sub}`, 60 * 60 * 24 * 7, newRefresh)

      reply
        .setCookie('access_token', newAccess, { ...COOKIE_OPTS, maxAge: 60 * 15 })
        .setCookie('refresh_token', newRefresh, { ...COOKIE_OPTS, maxAge: 60 * 60 * 24 * 7 })
        .send({ data: { ok: true }, error: null })
    } catch {
      return reply.code(401).send({ data: null, error: { code: 'INVALID_REFRESH_TOKEN', message: 'Token invalide ou révoqué' } })
    }
  })

  // POST /auth/logout
  app.post('/auth/logout', async (req, reply) => {
    const token = req.cookies['refresh_token']
    if (token) {
      try {
        const payload = verifyRefreshToken(token)
        await redis.del(`refresh:${payload.sub}`)
      } catch { /* token already invalid, that's fine */ }
    }

    reply
      .clearCookie('access_token', { path: '/' })
      .clearCookie('refresh_token', { path: '/' })
      .send({ data: { ok: true }, error: null })
  })
}
