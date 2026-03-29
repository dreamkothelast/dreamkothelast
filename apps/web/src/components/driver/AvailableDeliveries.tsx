'use client'

import { useEffect, useState } from 'react'
import type { Delivery } from '@parislivr/types'
import { api } from '@/lib/api'

export default function AvailableDeliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState<string | null>(null)

  useEffect(() => {
    api.get<Delivery[]>('/deliveries').then((res) => {
      if (res.data) setDeliveries(res.data)
      setLoading(false)
    })
  }, [])

  async function accept(id: string) {
    setAccepting(id)
    const res = await api.patch<Delivery>(`/deliveries/${id}/status`, { status: 'accepted' })
    if (res.data) setDeliveries((prev) => prev.filter((d) => d.id !== id))
    setAccepting(null)
  }

  if (loading) return <p className="text-gray-400">Chargement…</p>
  if (deliveries.length === 0) return <p className="text-gray-400">Aucune livraison disponible pour le moment.</p>

  return (
    <ul className="space-y-3">
      {deliveries.map((d) => (
        <li key={d.id} className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {d.pickup.city} → {d.dropoff.city}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{d.packageInfo.description} · {d.packageInfo.weightKg} kg</p>
              {d.packageInfo.isFragile && (
                <span className="mt-1 inline-block rounded bg-orange-100 px-1.5 py-0.5 text-xs text-orange-700">Fragile</span>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="font-semibold text-brand-600">{(d.priceInCents / 100).toFixed(2)} €</p>
              <button
                onClick={() => accept(d.id)}
                disabled={accepting === d.id}
                className="mt-2 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
              >
                {accepting === d.id ? 'Acceptation…' : 'Accepter'}
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
