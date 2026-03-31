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

  if (loading) return <p className="text-on-surface-variant">Chargement…</p>
  if (deliveries.length === 0) return <p className="text-on-surface-variant">Aucune livraison disponible pour le moment.</p>

  return (
    <ul className="space-y-3">
      {deliveries.map((d) => (
        <li key={d.id} className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-hard-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-on-background truncate">
                {d.pickup.city} → {d.dropoff.city}
              </p>
              <p className="text-xs text-on-surface-variant mt-0.5">{d.packageInfo.description} · {d.packageInfo.weightKg} kg</p>
              {d.packageInfo.isFragile && (
                <span className="mt-1 inline-block rounded bg-primary-container px-1.5 py-0.5 text-xs text-on-primary-container">Fragile</span>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="font-semibold text-primary font-numeric">{(d.priceInCents / 100).toFixed(2)} €</p>
              <button
                onClick={() => accept(d.id)}
                disabled={accepting === d.id}
                className="btn-primary mt-2 px-3 py-1.5 text-xs"
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
