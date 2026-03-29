'use client'

import { useEffect, useState } from 'react'
import type { Delivery } from '@parislivr/types'
import { api } from '@/lib/api'

const STATUS_LABELS: Record<Delivery['status'], string> = {
  pending: 'En attente',
  accepted: 'Acceptée',
  picked_up: 'Récupérée',
  in_transit: 'En cours',
  delivered: 'Livrée',
  cancelled: 'Annulée',
}

const STATUS_COLORS: Record<Delivery['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  picked_up: 'bg-indigo-100 text-indigo-800',
  in_transit: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-500',
}

export default function DeliveryList() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<Delivery[]>('/deliveries').then((res) => {
      if (res.data) setDeliveries(res.data)
      setLoading(false)
    })
  }, [])

  if (loading) return <p className="text-gray-400">Chargement…</p>
  if (deliveries.length === 0) return <p className="text-gray-400">Aucune livraison pour l'instant.</p>

  return (
    <ul className="space-y-3">
      {deliveries.map((d) => (
        <li key={d.id} className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{d.dropoff.street}, {d.dropoff.city}</p>
              <p className="text-xs text-gray-500 mt-0.5">{d.packageInfo.description}</p>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[d.status]}`}>
              {STATUS_LABELS[d.status]}
            </span>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            {(d.priceInCents / 100).toFixed(2)} € · {new Date(d.createdAt).toLocaleDateString('fr-FR')}
          </p>
        </li>
      ))}
    </ul>
  )
}
