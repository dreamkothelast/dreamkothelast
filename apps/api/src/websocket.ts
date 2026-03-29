import { Server as SocketServer } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import type { Server as HttpServer } from 'node:http'
import { redis } from './lib/redis.js'
import { verifyAccessToken } from './lib/jwt.js'

// Extend Fastify with io
declare module 'fastify' {
  interface FastifyInstance {
    io: SocketServer
  }
}

export async function setupWebSocket(httpServer: HttpServer, allowedOrigins: string[]) {
  const pubClient = redis
  const subClient = redis.duplicate()
  await Promise.all([pubClient.connect(), subClient.connect()])

  const io = new SocketServer(httpServer, {
    cors: { origin: allowedOrigins, credentials: true },
    adapter: createAdapter(pubClient, subClient),
  })

  // Auth middleware for WebSocket
  io.use((socket, next) => {
    const token = socket.handshake.auth['token'] as string | undefined
    if (!token) return next(new Error('Authentication required'))
    try {
      const payload = verifyAccessToken(token)
      socket.data['userId'] = payload.sub
      socket.data['role'] = payload.role
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    const userId = socket.data['userId'] as string

    // Driver joins their personal room
    socket.join(`user:${userId}`)

    // Join a delivery room to receive status updates
    socket.on('delivery:join', (deliveryId: string) => {
      socket.join(`delivery:${deliveryId}`)
    })

    socket.on('delivery:leave', (deliveryId: string) => {
      socket.leave(`delivery:${deliveryId}`)
    })
  })

  return io
}
