const LEDGER = [
  { id: '1', merchant: 'Boulangerie Dupont', date: 'Auj. 14h32', price: 12.5, tip: 1.5, status: 'delivered' },
  { id: '2', merchant: 'Épicerie Le Marais', date: 'Auj. 11h15', price: 18.0, tip: 0, status: 'delivered' },
  { id: '3', merchant: 'Fleuriste Belleville', date: 'Hier 16h50', price: 9.0, tip: 2.0, status: 'delivered' },
  { id: '4', merchant: 'Cave Oberkampf', date: 'Hier 13h22', price: 22.5, tip: 0, status: 'delivered' },
  { id: '5', merchant: 'Fromagerie Nation', date: 'Lun. 10h08', price: 15.0, tip: 3.0, status: 'delivered' },
  { id: '6', merchant: 'Boulangerie Dupont', date: 'Lun. 08h45', price: 10.0, tip: 0, status: 'delivered' },
]

const totalEarnings = LEDGER.reduce((acc, r) => acc + r.price + r.tip, 0)
const totalTips = LEDGER.reduce((acc, r) => acc + r.tip, 0)
const avgTime = '18 min'

export default function CarnetPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="font-serif italic text-2xl text-on-background">Mon Carnet</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">7 derniers jours</p>
      </div>

      {/* Hero earnings */}
      <div className="mx-4 mb-4 bg-primary text-on-primary rounded-lg p-5 shadow-hard">
        <p className="text-sm font-medium opacity-80 mb-1">Gains totaux</p>
        <p className="font-numeric font-bold text-4xl tracking-tight">
          {totalEarnings.toFixed(2)} €
        </p>
        <p className="text-sm opacity-70 mt-2">{LEDGER.length} courses · cette semaine</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2 px-4 mb-5">
        {[
          { label: 'Courses', value: String(LEDGER.length), icon: 'local_shipping' },
          { label: 'Temps moy.', value: avgTime, icon: 'timer' },
          { label: 'Pourboires', value: `${totalTips.toFixed(2)} €`, icon: 'volunteer_activism' },
        ].map((stat) => (
          <div key={stat.label}
            className="bg-surface-container-low border border-outline-variant rounded p-3 shadow-hard-sm text-center">
            <span className="material-symbols-outlined text-primary mb-1" style={{ fontSize: 20 }}>{stat.icon}</span>
            <p className="font-numeric font-bold text-lg text-on-background">{stat.value}</p>
            <p className="text-xs text-on-surface-variant font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Ledger table */}
      <div className="mx-4 bg-surface-container-low border border-outline-variant rounded-lg shadow-hard overflow-hidden">
        <div className="px-4 py-3 border-b border-outline-variant bg-surface-container flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Détail des courses</p>
          <span className="text-xs text-on-surface-variant">{LEDGER.length} entrées</span>
        </div>

        <div className="divide-y divide-outline-variant">
          {LEDGER.map((row) => (
            <div key={row.id} className="px-4 py-3 flex items-center gap-3">
              {/* Status dot */}
              <div className="w-2 h-2 rounded-full bg-secondary shrink-0" />

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-on-background truncate">{row.merchant}</p>
                <p className="text-xs text-on-surface-variant">{row.date}</p>
              </div>

              <div className="text-right shrink-0">
                <p className="font-numeric font-bold text-on-background">
                  {(row.price + row.tip).toFixed(2)} €
                </p>
                {row.tip > 0 && (
                  <p className="text-xs text-secondary font-medium">
                    +{row.tip.toFixed(2)} € pourboire
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Total footer */}
        <div className="px-4 py-3 border-t-2 border-on-background flex items-center justify-between bg-surface-container">
          <p className="font-semibold text-on-background">Total semaine</p>
          <p className="font-numeric font-bold text-xl text-primary">{totalEarnings.toFixed(2)} €</p>
        </div>
      </div>

      {/* Payout CTA */}
      <div className="px-4 mt-4 pb-4">
        <button className="btn-primary w-full justify-center py-3">
          <span className="material-symbols-outlined mr-2" style={{ fontSize: 18 }}>account_balance</span>
          Demander un virement
        </button>
        <p className="text-xs text-center text-on-surface-variant mt-2">
          Virement sous 1–2 jours ouvrés · IBAN sécurisé
        </p>
      </div>
    </div>
  )
}
