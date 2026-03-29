'use client'

import { useState } from 'react'
import { api } from '@/lib/api'

export default function AvailabilityToggle() {
  const [available, setAvailable] = useState(false)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const res = await api.patch('/drivers/me/availability', { isAvailable: !available })
    if (!res.error) setAvailable((v) => !v)
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
        available
          ? 'bg-green-100 text-green-800 hover:bg-green-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {available ? 'Disponible' : 'Indisponible'}
    </button>
  )
}
