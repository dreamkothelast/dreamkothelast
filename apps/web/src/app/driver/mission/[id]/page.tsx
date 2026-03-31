import Link from 'next/link'

const MOCK_MISSIONS: Record<string, {
  id: string
  merchant: string
  merchantInitial: string
  distance: string
  timeWindow: string
  price: number
  isFragile: boolean
  weightKg: number
  contents: string
  notes: string
  pickup: { street: string; city: string; zip: string }
  dropoff: { street: string; city: string; zip: string }
}> = {
  '1': {
    id: '1',
    merchant: 'Boulangerie Dupont',
    merchantInitial: 'B',
    distance: '1.2 km',
    timeWindow: '14h00 – 16h00',
    price: 12.5,
    isFragile: false,
    weightKg: 3.5,
    contents: 'Pains spéciaux, viennoiseries assortiment',
    notes: 'Sonner deux fois. Code immeuble : 1234A.',
    pickup: { street: '12 rue de la Roquette', city: 'Paris', zip: '75011' },
    dropoff: { street: '45 avenue Ledru-Rollin', city: 'Paris', zip: '75012' },
  },
  '2': {
    id: '2',
    merchant: 'Épicerie Le Marais',
    merchantInitial: 'É',
    distance: '2.8 km',
    timeWindow: '15h30 – 17h30',
    price: 18.0,
    isFragile: true,
    weightKg: 7.2,
    contents: "Bocaux confiture, huiles d'olive, épices",
    notes: 'Colis fragiles — ne pas poser à plat.',
    pickup: { street: '8 rue des Francs-Bourgeois', city: 'Paris', zip: '75004' },
    dropoff: { street: '3 rue du Temple', city: 'Paris', zip: '75004' },
  },
}

export function generateStaticParams() {
  return Object.keys(MOCK_MISSIONS).map((id) => ({ id }))
}

export default function MissionDetailsPage({ params }: { params: { id: string } }) {
  const mission = MOCK_MISSIONS[params.id] ?? MOCK_MISSIONS['1']!

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Map header */}
      <div className="relative h-52 bg-surface-container overflow-hidden shrink-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(28,27,27,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(28,27,27,0.06) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px',
          }}
        />
        {/* Route line mock */}
        <svg className="absolute inset-0 w-full h-full">
          <line x1="30%" y1="30%" x2="70%" y2="65%" stroke="#a8302f" strokeWidth="2" strokeDasharray="6,4" />
        </svg>
        {/* Pickup pin */}
        <div className="absolute bg-secondary text-on-secondary rounded px-2 py-1 text-xs font-semibold shadow-hard"
          style={{ top: '25%', left: '25%', transform: 'translate(-50%,-50%)' }}>
          A
        </div>
        {/* Dropoff pin */}
        <div className="absolute bg-primary text-on-primary rounded px-2 py-1 text-xs font-semibold shadow-hard"
          style={{ top: '60%', left: '65%', transform: 'translate(-50%,-50%)' }}>
          B
        </div>
        {/* Back button */}
        <Link href="/driver"
          className="absolute top-3 left-3 bg-surface-container-low border border-outline-variant rounded p-1.5 shadow-hard">
          <span className="material-symbols-outlined text-on-background" style={{ fontSize: 20 }}>arrow_back</span>
        </Link>
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Bottom sheet */}
      <div className="flex-1 bg-background px-4 pt-4 pb-6">
        {/* Title row */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-serif italic text-xl text-on-background">{mission.merchant}</h2>
            <p className="text-sm text-on-surface-variant mt-0.5">{mission.distance} · {mission.timeWindow}</p>
          </div>
          <p className="font-numeric font-bold text-2xl text-primary">{mission.price.toFixed(2)} €</p>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { label: 'Poids', value: `${mission.weightKg} kg`, icon: 'scale' },
            { label: 'Créneau', value: mission.timeWindow, icon: 'schedule' },
            { label: 'Contenu', value: mission.contents, icon: 'inventory_2' },
            { label: 'Distance', value: mission.distance, icon: 'straighten' },
          ].map((item) => (
            <div key={item.label}
              className="bg-surface-container-low border border-outline-variant rounded p-3 shadow-hard-sm">
              <div className="flex items-center gap-1.5 text-on-surface-variant mb-1">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{item.icon}</span>
                <span className="text-xs font-medium uppercase tracking-wide">{item.label}</span>
              </div>
              <p className="text-sm font-semibold text-on-background line-clamp-2">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Fragile badge */}
        {mission.isFragile && (
          <div className="flex items-center gap-2 bg-primary-container border border-outline-variant rounded p-3 mb-4 shadow-hard-sm">
            <span className="material-symbols-outlined text-on-primary-container" style={{ fontSize: 20 }}>fragile</span>
            <p className="text-sm font-medium text-on-primary-container">Colis fragile — manipuler avec soin</p>
          </div>
        )}

        {/* Merchant notes */}
        {mission.notes && (
          <div className="bg-tertiary-container border border-outline-variant rounded p-3 mb-4 shadow-hard-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant mb-1">Note du commerçant</p>
            <p className="text-sm text-on-tertiary-container">{mission.notes}</p>
          </div>
        )}

        {/* Timeline */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant mb-3">Itinéraire</p>
          <div className="flex flex-col gap-0">
            {/* Pickup */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded bg-secondary text-on-secondary flex items-center justify-center text-xs font-bold shadow-hard-sm shrink-0">A</div>
                <div className="w-px flex-1 bg-outline-variant mt-1" style={{ minHeight: 24 }} />
              </div>
              <div className="pb-4">
                <p className="text-xs text-on-surface-variant font-medium">Enlèvement</p>
                <p className="font-semibold text-on-background text-sm">{mission.pickup.street}</p>
                <p className="text-sm text-on-surface-variant">{mission.pickup.zip} {mission.pickup.city}</p>
              </div>
            </div>
            {/* Dropoff */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded bg-primary text-on-primary flex items-center justify-center text-xs font-bold shadow-hard-sm shrink-0">B</div>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-medium">Livraison</p>
                <p className="font-semibold text-on-background text-sm">{mission.dropoff.street}</p>
                <p className="text-sm text-on-surface-variant">{mission.dropoff.zip} {mission.dropoff.city}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Accept CTA */}
        <div className="bg-surface-container-low border border-outline-variant rounded-lg p-4 shadow-hard">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-1 bg-secondary-container text-on-secondary-container text-xs px-2 py-1 rounded font-medium">
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>verified</span>
              Paiement Garanti
            </span>
            <span className="font-numeric font-bold text-xl text-primary">{mission.price.toFixed(2)} €</span>
          </div>
          <Link
            href="/driver/run"
            className="btn-primary w-full justify-center text-sm py-3"
          >
            <span className="material-symbols-outlined mr-2" style={{ fontSize: 18 }}>check_circle</span>
            Accepter la mission
          </Link>
        </div>
      </div>
    </div>
  )
}
