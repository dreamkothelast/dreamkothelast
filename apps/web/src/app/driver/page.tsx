import Link from 'next/link'

const MOCK_MISSIONS = [
  {
    id: '1',
    merchant: 'Boulangerie Dupont',
    merchantInitial: 'B',
    distance: '1.2 km',
    timeWindow: '14h00 – 16h00',
    price: 12.5,
    isFragile: false,
    zones: ['75011', '75012'],
  },
  {
    id: '2',
    merchant: 'Épicerie Le Marais',
    merchantInitial: 'É',
    distance: '2.8 km',
    timeWindow: '15h30 – 17h30',
    price: 18.0,
    isFragile: true,
    zones: ['75004'],
  },
  {
    id: '3',
    merchant: 'Fleuriste Belleville',
    merchantInitial: 'F',
    distance: '0.7 km',
    timeWindow: '11h00 – 13h00',
    price: 9.0,
    isFragile: true,
    zones: ['75020'],
  },
  {
    id: '4',
    merchant: 'Cave Oberkampf',
    merchantInitial: 'C',
    distance: '3.4 km',
    timeWindow: '17h00 – 19h00',
    price: 22.5,
    isFragile: false,
    zones: ['75011', '75003'],
  },
]

export default function RadarPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Map glimpse header */}
      <div className="relative h-44 bg-surface-container overflow-hidden">
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
        <div className="absolute inset-0">
          {[
            { top: '30%', left: '25%' },
            { top: '55%', left: '60%' },
            { top: '20%', left: '70%' },
            { top: '65%', left: '30%' },
          ].map((pos, i) => (
            <div
              key={i}
              className="absolute w-7 h-7 bg-primary rounded-full border-2 border-on-primary flex items-center justify-center shadow-hard"
              style={{ top: pos.top, left: pos.left, transform: 'translate(-50%,-50%)' }}
            >
              <span className="material-symbols-outlined text-on-primary" style={{ fontSize: 14 }}>
                local_shipping
              </span>
            </div>
          ))}
          <div
            className="absolute w-4 h-4 bg-secondary rounded-full border-2 border-on-secondary shadow-hard"
            style={{ top: '45%', left: '45%', transform: 'translate(-50%,-50%)' }}
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h1 className="font-serif italic text-2xl text-on-background">
          Missions à proximité
        </h1>
        <div className="flex items-center gap-1 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-semibold">
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>wifi_tethering</span>
          En ligne
        </div>
      </div>

      <p className="px-4 text-sm text-on-surface-variant mb-4">
        {MOCK_MISSIONS.length} missions · Paris 3e–20e
      </p>

      {/* Mission cards */}
      <div className="px-4 flex flex-col gap-3 pb-4">
        {MOCK_MISSIONS.map((m) => (
          <Link
            key={m.id}
            href={`/driver/mission/${m.id}`}
            className="block bg-surface-container-low border border-outline-variant rounded-lg shadow-hard hover:shadow-none transition-shadow"
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded bg-tertiary-container border border-outline-variant flex items-center justify-center font-semibold text-on-tertiary-container shrink-0 shadow-hard-sm">
                  {m.merchantInitial}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-on-background truncate">{m.merchant}</p>
                    <p className="font-numeric font-bold text-lg text-primary shrink-0">
                      {m.price.toFixed(2)} €
                    </p>
                  </div>

                  <div className="flex items-center gap-3 mt-1 text-sm text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>straighten</span>
                      {m.distance}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>schedule</span>
                      {m.timeWindow}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-outline-variant">
                <span className="flex items-center gap-1 bg-secondary-container text-on-secondary-container text-xs px-2 py-0.5 rounded font-medium">
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>verified</span>
                  Paiement Garanti
                </span>
                {m.isFragile && (
                  <span className="flex items-center gap-1 bg-primary-container text-on-primary-container text-xs px-2 py-0.5 rounded font-medium">
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>fragile</span>
                    Fragile
                  </span>
                )}
                <div className="ml-auto flex gap-1">
                  {m.zones.map((z) => (
                    <span key={z} className="text-xs text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant">
                      {z}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
