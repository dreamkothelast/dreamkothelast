'use client'

import { useState } from 'react'
import type { Delivery } from '@parislivr/types'
import { api } from '@/lib/api'

interface FormState {
  pickupStreet: string
  pickupCity: string
  pickupPostalCode: string
  dropoffStreet: string
  dropoffCity: string
  dropoffPostalCode: string
  description: string
  weightKg: string
  isFragile: boolean
  priceInCents: string
}

const INITIAL: FormState = {
  pickupStreet: '', pickupCity: '', pickupPostalCode: '',
  dropoffStreet: '', dropoffCity: '', dropoffPostalCode: '',
  description: '', weightKg: '', isFragile: false, priceInCents: '',
}

export default function CreateDeliveryForm() {
  const [form, setForm] = useState<FormState>(INITIAL)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const res = await api.post<Delivery>('/deliveries', {
      pickup: { street: form.pickupStreet, city: form.pickupCity, postalCode: form.pickupPostalCode, coords: { lat: 0, lng: 0 } },
      dropoff: { street: form.dropoffStreet, city: form.dropoffCity, postalCode: form.dropoffPostalCode, coords: { lat: 0, lng: 0 } },
      packageInfo: { description: form.description, weightKg: Number(form.weightKg), isFragile: form.isFragile },
      priceInCents: Math.round(Number(form.priceInCents) * 100),
    })

    setSubmitting(false)
    if (res.error) { setError(res.error.message); return }
    setSuccess(true)
    setForm(INITIAL)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-white p-4 shadow-sm">
      <fieldset>
        <legend className="text-sm font-medium text-gray-700">Enlèvement</legend>
        <div className="mt-2 space-y-2">
          <input required placeholder="Rue" value={form.pickupStreet} onChange={set('pickupStreet')} className="input w-full" />
          <div className="flex gap-2">
            <input required placeholder="Ville" value={form.pickupCity} onChange={set('pickupCity')} className="input flex-1" />
            <input required placeholder="Code postal" value={form.pickupPostalCode} onChange={set('pickupPostalCode')} className="input w-28" pattern="(75|77|78|91|92|93|94|95)\d{3}" title="Code postal Île-de-France" />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-gray-700">Livraison</legend>
        <div className="mt-2 space-y-2">
          <input required placeholder="Rue" value={form.dropoffStreet} onChange={set('dropoffStreet')} className="input w-full" />
          <div className="flex gap-2">
            <input required placeholder="Ville" value={form.dropoffCity} onChange={set('dropoffCity')} className="input flex-1" />
            <input required placeholder="Code postal" value={form.dropoffPostalCode} onChange={set('dropoffPostalCode')} className="input w-28" pattern="(75|77|78|91|92|93|94|95)\d{3}" title="Code postal Île-de-France" />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-gray-700">Colis</legend>
        <div className="mt-2 space-y-2">
          <input required placeholder="Description" value={form.description} onChange={set('description')} className="input w-full" maxLength={255} />
          <div className="flex gap-2 items-center">
            <input required type="number" placeholder="Poids (kg)" value={form.weightKg} onChange={set('weightKg')} className="input w-32" min="0.1" max="100" step="0.1" />
            <label className="flex items-center gap-1.5 text-sm text-gray-600">
              <input type="checkbox" checked={form.isFragile} onChange={set('isFragile')} className="rounded" />
              Fragile
            </label>
          </div>
        </div>
      </fieldset>

      <div>
        <label className="text-sm font-medium text-gray-700">Prix proposé (€)</label>
        <input required type="number" placeholder="Ex: 12.50" value={form.priceInCents} onChange={set('priceInCents')} className="input mt-1 w-full" min="1" step="0.01" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">Livraison créée avec succès !</p>}

      <button type="submit" disabled={submitting} className="w-full rounded-lg bg-brand-600 py-2 font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition-colors">
        {submitting ? 'Envoi…' : 'Créer la livraison'}
      </button>
    </form>
  )
}
