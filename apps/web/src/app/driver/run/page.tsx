'use client'

import { useState } from 'react'
import Link from 'next/link'

const STEPS = [
  { id: 'pickup', label: 'Enlèvement', icon: 'store' },
  { id: 'transit', label: 'En route', icon: 'directions_bike' },
  { id: 'dropoff', label: 'Livraison', icon: 'home' },
]

const CHECKLIST = [
  { id: 'bag', label: 'Sac isotherme présent' },
  { id: 'fragile', label: 'Protection colis fragiles' },
  { id: 'count', label: 'Nombre de colis vérifié (3)' },
]

export default function ActiveRunPage() {
  const [step, setStep] = useState(0)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState(false)

  const address = step === 0
    ? { label: 'Enlèvement', street: '12 rue de la Roquette', zip: '75011', city: 'Paris', name: 'Boulangerie Dupont' }
    : { label: 'Livraison', street: '45 avenue Ledru-Rollin', zip: '75012', city: 'Paris', name: 'Client' }

  function copyAddress() {
    navigator.clipboard.writeText(`${address.street}, ${address.zip} ${address.city}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function toggleCheck(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const allChecked = CHECKLIST.every((c) => checked[c.id])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-surface-container-low border-b border-outline-variant px-4 py-3 flex items-center gap-3">
        <Link href="/driver/mission/1" className="text-on-surface-variant">
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>arrow_back</span>
        </Link>
        <div className="flex-1">
          <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wide">Mission en cours</p>
          <p className="font-semibold text-on-background text-sm">Boulangerie Dupont</p>
        </div>
        <span className="flex items-center gap-1 bg-secondary-container text-on-secondary-container text-xs px-2 py-1 rounded font-semibold">
          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>radio_button_checked</span>
          Actif
        </span>
      </div>

      {/* Progress bar */}
      <div className="bg-surface-container h-1.5">
        <div
          className="bg-primary h-full transition-all duration-500"
          style={{ width: `${((step + 0.5) / STEPS.length) * 100}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex px-4 py-3 gap-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className={`flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded border text-xs font-medium transition-colors ${
            i === step
              ? 'bg-primary text-on-primary border-primary shadow-hard-sm'
              : i < step
              ? 'bg-secondary-container text-on-secondary-container border-secondary-container'
              : 'bg-surface-container text-on-surface-variant border-outline-variant'
          }`}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{s.icon}</span>
            <span className="truncate">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="flex-1 px-4 pb-4 flex flex-col gap-4">
        {/* Map snippet */}
        <div className="relative h-40 bg-surface-container rounded-lg border border-outline-variant overflow-hidden shadow-hard">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(28,27,27,0.06) 1px, transparent 1px),
                linear-gradient(90deg, rgba(28,27,27,0.06) 1px, transparent 1px)
              `,
              backgroundSize: '28px 28px',
            }}
          />
          {/* Animated pulsing dot for current location */}
          <div className="absolute" style={{ top: '50%', left: '45%', transform: 'translate(-50%,-50%)' }}>
            <div className="w-5 h-5 bg-secondary rounded-full border-2 border-on-secondary shadow-hard" />
            <div className="absolute inset-0 w-5 h-5 bg-secondary rounded-full opacity-30 animate-ping" />
          </div>
          {/* Destination pin */}
          <div
            className="absolute bg-primary text-on-primary rounded px-2 py-0.5 text-xs font-bold shadow-hard"
            style={{ top: '30%', left: '65%', transform: 'translate(-50%,-50%)' }}
          >
            {step === 0 ? 'A' : 'B'}
          </div>
          <div className="absolute bottom-2 right-2 bg-surface-container-low border border-outline-variant rounded px-2 py-1 text-xs text-on-surface-variant font-medium shadow-hard-sm">
            1.2 km · ~6 min
          </div>
        </div>

        {/* Address block */}
        <div className="bg-surface-container-low border border-outline-variant rounded-lg shadow-hard overflow-hidden">
          <div className="px-4 py-3 border-b border-outline-variant bg-surface-container">
            <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">{address.label}</p>
            <p className="font-semibold text-on-background">{address.name}</p>
          </div>
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-on-background">{address.street}</p>
              <p className="text-sm text-on-surface-variant">{address.zip} {address.city}</p>
            </div>
            <button
              onClick={copyAddress}
              className="shrink-0 flex items-center gap-1.5 bg-surface-container border border-outline-variant rounded px-3 py-1.5 text-sm font-medium text-on-surface-variant shadow-hard-sm hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                {copied ? 'check' : 'content_copy'}
              </span>
              {copied ? 'Copié !' : 'Copier'}
            </button>
          </div>
        </div>

        {/* Checklist (only at pickup step) */}
        {step === 0 && (
          <div className="bg-surface-container-low border border-outline-variant rounded-lg shadow-hard overflow-hidden">
            <div className="px-4 py-3 border-b border-outline-variant bg-surface-container">
              <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Vérification avant départ</p>
            </div>
            <div className="px-4 py-2">
              {CHECKLIST.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className="ledger-row w-full text-left"
                >
                  <span className="text-sm text-on-background">{item.label}</span>
                  <span className={`material-symbols-outlined transition-colors ${checked[item.id] ? 'text-secondary' : 'text-outline-variant'}`}
                    style={{ fontSize: 22, fontVariationSettings: checked[item.id] ? "'FILL' 1" : "'FILL' 0" }}>
                    check_circle
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto">
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 0 && !allChecked}
              className="btn-primary w-full justify-center py-3 disabled:opacity-40"
            >
              <span className="material-symbols-outlined mr-2" style={{ fontSize: 18 }}>
                {step === 0 ? 'inventory' : 'local_shipping'}
              </span>
              {step === 0 ? 'Confirmer le retrait' : 'Marquer en transit'}
            </button>
          ) : (
            <Link href="/driver/carnet" className="btn-primary w-full justify-center py-3">
              <span className="material-symbols-outlined mr-2" style={{ fontSize: 18 }}>task_alt</span>
              Confirmer la livraison
            </Link>
          )}
          {step === 0 && !allChecked && (
            <p className="text-xs text-center text-on-surface-variant mt-2">
              Cochez toutes les cases pour continuer
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
