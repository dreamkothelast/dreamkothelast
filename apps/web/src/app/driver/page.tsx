import { Suspense } from 'react'
import AvailableDeliveries from '@/components/driver/AvailableDeliveries'
import AvailabilityToggle from '@/components/driver/AvailabilityToggle'

export default function DriverPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Espace livreur</h1>
          <p className="mt-1 text-gray-500">Trouvez des livraisons disponibles en Île-de-France</p>
        </div>
        <AvailabilityToggle />
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Livraisons disponibles</h2>
        <Suspense fallback={<p className="text-gray-400">Chargement…</p>}>
          <AvailableDeliveries />
        </Suspense>
      </div>
    </div>
  )
}
