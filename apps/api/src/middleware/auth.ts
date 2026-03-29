import type { FastifyRequest, FastifyReply } from 'fastify'
import type { Role } from '@parislivr/types'
import { verifyAccessToken } from '../lib/jwt.js'

declare module 'fastify' {
  interface FastifyRequest {
    userId: string
    userRole: Role
  }
}

export async function authenticate(req: FastifyRequest, reply: FastifyReply) {
  const token = req.cookies['access_token']
  if (!token) return reply.code(401).send({ data: null, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } })

  try {
    const payload = verifyAccessToken(token)
    req.userId = payload.sub
    req.userRole = payload.role
  } catch {
    return reply.code(401).send({ data: null, error: { code: 'TOKEN_EXPIRED', message: 'Token expired or invalid' } })
  }
}

export function requireRole(...roles: Role[]) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    if (!roles.includes(req.userRole)) {
      return reply.code(403).send({ data: null, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } })
    }
  }
}
