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
  pending: 'bg-tertiary-container text-on-tertiary-container',
  accepted: 'bg-secondary-container text-on-secondary-container',
  picked_up: 'bg-secondary-container text-on-secondary-container',
  in_transit: 'bg-primary-container text-on-primary-container',
  delivered: 'bg-secondary-container text-on-secondary-container',
  cancelled: 'bg-surface-container text-on-surface-variant',
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

  if (loading) return <p className="text-on-surface-variant">Chargement…</p>
  if (deliveries.length === 0) return <p className="text-on-surface-variant">Aucune livraison pour l&apos;instant.</p>

  return (
    <ul className="space-y-3">
      {deliveries.map((d) => (
        <li key={d.id} className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4 shadow-hard-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-on-background">{d.dropoff.street}, {d.dropoff.city}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{d.packageInfo.description}</p>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[d.status]}`}>
              {STATUS_LABELS[d.status]}
            </span>
          </div>
          <p className="mt-2 text-xs text-on-surface-variant font-numeric">
            {(d.priceInCents / 100).toFixed(2)} € · {new Date(d.createdAt).toLocaleDateString('fr-FR')}
          </p>
        </li>
      ))}
    </ul>
  )
}
