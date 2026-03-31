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
          ? 'bg-secondary-container text-on-secondary-container'
          : 'bg-surface-container text-on-surface-variant'
      }`}
    >
      {available ? 'Disponible' : 'Indisponible'}
    </button>
  )
}
