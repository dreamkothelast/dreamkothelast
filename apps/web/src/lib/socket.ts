import { io, type Socket } from 'socket.io-client'
import type { DeliveryStatusEvent, DriverLocationEvent } from '@parislivr/types'

let socket: Socket | null = null

export function getSocket(token: string): Socket {
  if (!socket) {
    socket = io(process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001', {
      auth: { token },
      withCredentials: true,
      autoConnect: false,
    })
  }
  return socket
}

export function disconnectSocket() {
  socket?.disconnect()
  socket = null
}

// Typed event helpers
export function onDeliveryStatus(s: Socket, cb: (e: DeliveryStatusEvent) => void) {
  s.on('delivery:status', cb)
  return () => s.off('delivery:status', cb)
}

export function onDriverLocation(s: Socket, cb: (e: DriverLocationEvent) => void) {
  s.on('driver:location', cb)
  return () => s.off('driver:location', cb)
}
