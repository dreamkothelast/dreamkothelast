import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import { authRoutes } from './routes/auth.js'
import { deliveryRoutes } from './routes/deliveries.js'
import { driverRoutes } from './routes/drivers.js'
import { setupWebSocket } from './websocket.js'

const PORT = Number(process.env['API_PORT'] ?? 3001)
const ALLOWED_ORIGINS = (process.env['ALLOWED_ORIGINS'] ?? 'http://localhost:3000').split(',')

const app = Fastify({ logger: { level: process.env['NODE_ENV'] === 'production' ? 'warn' : 'info' } })

// ─── Plugins ──────────────────────────────────────────────────────────────────

await app.register(helmet)
await app.register(cookie)
await app.register(cors, { origin: ALLOWED_ORIGINS, credentials: true })
await app.register(rateLimit, {
  global: true,
  max: 100,
  timeWindow: '15 minutes',
  keyGenerator: (req) => req.ip,
})

// Stricter rate limit for auth endpoints
await app.register(async (sub) => {
  await sub.register(rateLimit, { max: 10, timeWindow: '1 minute' })
  await sub.register(authRoutes)
}, { prefix: '/api/v1' })

// ─── Routes ───────────────────────────────────────────────────────────────────

await app.register(deliveryRoutes, { prefix: '/api/v1' })
await app.register(driverRoutes, { prefix: '/api/v1' })

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/health', async () => ({ status: 'ok' }))

// ─── Start ────────────────────────────────────────────────────────────────────

const address = await app.listen({ port: PORT, host: '0.0.0.0' })

const io = await setupWebSocket(app.server, ALLOWED_ORIGINS)
app.decorate('io', io)

console.log(`API Parislivr démarrée sur ${address}`)
