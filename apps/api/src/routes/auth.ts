import type { FastifyInstance } from 'fastify'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { loginSchema, registerSchema } from '@parislivr/schemas'
import { db } from '../db/client.js'
import { users, merchantProfiles, driverProfiles } from '../db/schema.js'
import { redis } from '../lib/redis.js'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt.js'

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env['NODE_ENV'] === 'production',
  sameSite: 'strict' as const,
  path: '/',
}

export async function authRoutes(app: FastifyInstance) {
  // POST /auth/register
  app.post('/auth/register', async (req, reply) => {
    const body = registerSchema.safeParse(req.body)
    if (!body.success) {
      return reply.code(400).send({ data: null, error: { code: 'VALIDATION_ERROR', message: body.error.message } })
    }

    const { email, password, role } = body.data

    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)
    if (existing.length > 0) {
      return reply.code(409).send({ data: null, error: { code: 'EMAIL_TAKEN', message: 'Cet email est déjà utilisé' } })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const [user] = await db.insert(users).values({ email, passwordHash, role }).returning()

    if (body.data.role === 'merchant') {
      const { shopName, siret, address } = body.data
      await db.insert(merchantProfiles).values({ userId: user.id, shopName, siret, address })
    } else {
      const { firstName, lastName, vehicleType, zones } = body.data
      await db.insert(driverProfiles).values({ userId: user.id, firstName, lastName, vehicleType, zones })
    }

    const payload = { sub: user.id, role: user.role }
    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)
    await redis.setex(`refresh:${user.id}`, 60 * 60 * 24 * 7, refreshToken)

    return reply
      .code(201)
      .setCookie('access_token', accessToken, { ...COOKIE_OPTS, maxAge: 60 * 15 })
      .setCookie('refresh_token', refreshToken, { ...COOKIE_OPTS, maxAge: 60 * 60 * 24 * 7 })
      .send({ data: { id: user.id, email: user.email, role: user.role }, error: null })
  })

  // POST /auth/login
  app.post('/auth/login', async (req, reply) => {
    const body = loginSchema.safeParse(req.body)
    if (!body.success) {
      return reply.code(400).send({ data: null, error: { code: 'VALIDATION_ERROR', message: body.error.message } })
    }

    const [user] = await db.select().from(users).where(eq(users.email, body.data.email)).limit(1)
    if (!user || !(await bcrypt.compare(body.data.password, user.passwordHash))) {
      return reply.code(401).send({ data: null, error: { code: 'INVALID_CREDENTIALS', message: 'Email ou mot de passe incorrect' } })
    }

    const payload = { sub: user.id, role: user.role }
    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)
    await redis.setex(`refresh:${user.id}`, 60 * 60 * 24 * 7, refreshToken)

    return reply
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
      await redis.setex(`refresh:${payload.sub}`, 60 * 60 * 24 * 7, newRefresh)

      return reply
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
      } catch { /* déjà invalide */ }
    }

    return reply
      .clearCookie('access_token', { path: '/' })
      .clearCookie('refresh_token', { path: '/' })
      .send({ data: { ok: true }, error: null })
  })

  // GET /auth/me — retourne l'utilisateur courant
  app.get('/auth/me', async (req, reply) => {
    const token = req.cookies['access_token']
    if (!token) return reply.send({ data: null, error: null })

    try {
      const { verifyAccessToken } = await import('../lib/jwt.js')
      const payload = verifyAccessToken(token)
      const [user] = await db.select({ id: users.id, email: users.email, role: users.role })
        .from(users).where(eq(users.id, payload.sub)).limit(1)
      return reply.send({ data: user ?? null, error: null })
    } catch {
      return reply.send({ data: null, error: null })
    }
  })
}
