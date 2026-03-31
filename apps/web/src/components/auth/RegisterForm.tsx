'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import type { User } from '@parislivr/types'

type RoleTab = 'merchant' | 'driver'

interface BaseFields {
  email: string
  password: string
  confirmPassword: string
}

interface MerchantFields extends BaseFields {
  role: 'merchant'
  shopName: string
  siret: string
  street: string
  city: string
  postalCode: string
}

interface DriverFields extends BaseFields {
  role: 'driver'
  firstName: string
  lastName: string
  vehicleType: 'bike' | 'scooter' | 'car' | 'van'
  zonesInput: string
}

const MERCHANT_INIT: MerchantFields = {
  role: 'merchant', email: '', password: '', confirmPassword: '',
  shopName: '', siret: '', street: '', city: '', postalCode: '',
}

const DRIVER_INIT: DriverFields = {
  role: 'driver', email: '', password: '', confirmPassword: '',
  firstName: '', lastName: '', vehicleType: 'bike', zonesInput: '',
}

export default function RegisterForm() {
  const router = useRouter()
  const [tab, setTab] = useState<RoleTab>('merchant')
  const [merchant, setMerchant] = useState<MerchantFields>(MERCHANT_INIT)
  const [driver, setDriver] = useState<DriverFields>(DRIVER_INIT)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const setM = (k: keyof MerchantFields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setMerchant((f) => ({ ...f, [k]: e.target.value }))
  const setD = (k: keyof DriverFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setDriver((f) => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const form = tab === 'merchant' ? merchant : driver
    if (form.password !== form.confirmPassword) { setError('Les mots de passe ne correspondent pas'); return }

    let body: unknown
    if (tab === 'merchant') {
      const { confirmPassword: _, street, city, postalCode, ...rest } = merchant
      body = { ...rest, address: { street, city, postalCode, coords: { lat: 0, lng: 0 } } }
    } else {
      const { confirmPassword: _, zonesInput, ...rest } = driver
      const zones = zonesInput.split(',').map((z) => z.trim()).filter(Boolean)
      body = { ...rest, zones }
    }

    setSubmitting(true)
    const res = await api.post<User>('/auth/register', body)
    setSubmitting(false)

    if (res.error) { setError(res.error.message); return }

    router.push(tab === 'merchant' ? '/merchant' : '/driver')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-hard">
      {/* Tabs */}
      <div className="mb-6 flex rounded border border-outline-variant p-1">
        {(['merchant', 'driver'] as const).map((t) => (
          <button
            key={t} type="button" onClick={() => setTab(t)}
            className={`flex-1 rounded py-2 text-sm font-medium transition-colors ${
              tab === t ? 'bg-primary text-on-primary shadow-hard-sm' : 'text-on-surface-variant hover:text-on-background'
            }`}
          >
            {t === 'merchant' ? 'Commerçant' : 'Livreur'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input type="email" required value={tab === 'merchant' ? merchant.email : driver.email}
            onChange={tab === 'merchant' ? setM('email') : setD('email')}
            className="input mt-1 w-full" placeholder="vous@exemple.fr" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Mot de passe</label>
            <input type="password" required value={tab === 'merchant' ? merchant.password : driver.password}
              onChange={tab === 'merchant' ? setM('password') : setD('password')}
              className="input mt-1 w-full" minLength={8} />
          </div>
          <div>
            <label className="label">Confirmer</label>
            <input type="password" required value={tab === 'merchant' ? merchant.confirmPassword : driver.confirmPassword}
              onChange={tab === 'merchant' ? setM('confirmPassword') : setD('confirmPassword')}
              className="input mt-1 w-full" />
          </div>
        </div>

        {tab === 'merchant' ? (
          <>
            <div>
              <label className="label">Nom de la boutique</label>
              <input required value={merchant.shopName} onChange={setM('shopName')} className="input mt-1 w-full" />
            </div>
            <div>
              <label className="label">SIRET</label>
              <input required value={merchant.siret} onChange={setM('siret')} className="input mt-1 w-full"
                placeholder="12345678901234" maxLength={14} pattern="\d{14}" />
            </div>
            <fieldset>
              <legend className="label">Adresse</legend>
              <div className="mt-1 space-y-2">
                <input required placeholder="Rue" value={merchant.street} onChange={setM('street')} className="input w-full" />
                <div className="flex gap-2">
                  <input required placeholder="Ville" value={merchant.city} onChange={setM('city')} className="input flex-1" />
                  <input required placeholder="Code postal" value={merchant.postalCode} onChange={setM('postalCode')}
                    className="input w-28" pattern="(75|77|78|91|92|93|94|95)\d{3}" title="Code postal Île-de-France" />
                </div>
              </div>
            </fieldset>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Prénom</label>
                <input required value={driver.firstName} onChange={setD('firstName')} className="input mt-1 w-full" />
              </div>
              <div>
                <label className="label">Nom</label>
                <input required value={driver.lastName} onChange={setD('lastName')} className="input mt-1 w-full" />
              </div>
            </div>
            <div>
              <label className="label">Véhicule</label>
              <select value={driver.vehicleType} onChange={setD('vehicleType')} className="input mt-1 w-full">
                <option value="bike">Vélo</option>
                <option value="scooter">Scooter</option>
                <option value="car">Voiture</option>
                <option value="van">Utilitaire</option>
              </select>
            </div>
            <div>
              <label className="label">Zones couvertes (codes postaux, virgule séparés)</label>
              <input required value={driver.zonesInput} onChange={setD('zonesInput')} className="input mt-1 w-full"
                placeholder="75001, 75002, 92100" />
              <p className="mt-1 text-xs text-on-surface-variant">Île-de-France uniquement</p>
            </div>
          </>
        )}
      </div>

      {error && <p className="mt-4 rounded bg-primary-container px-3 py-2 text-sm text-on-primary-container">{error}</p>}

      <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full">
        {submitting ? 'Création du compte…' : 'Créer mon compte'}
      </button>
    </form>
  )
}
