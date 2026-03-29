import { Suspense } from 'react'
import DeliveryList from '@/components/merchant/DeliveryList'
import CreateDeliveryForm from '@/components/merchant/CreateDeliveryForm'

export default function MerchantPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Espace commerçant</h1>
      <p className="mt-1 text-gray-500">Gérez vos demandes de livraison</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-lg font-semibold">Nouvelle livraison</h2>
          <CreateDeliveryForm />
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">Mes livraisons</h2>
          <Suspense fallback={<p className="text-gray-400">Chargement…</p>}>
            <DeliveryList />
          </Suspense>
        </section>
      </div>
    </div>
  )
}
