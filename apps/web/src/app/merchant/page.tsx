import { Suspense } from 'react'
import DeliveryList from '@/components/merchant/DeliveryList'
import CreateDeliveryForm from '@/components/merchant/CreateDeliveryForm'

export default function MerchantPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-on-background font-serif italic">Espace commerçant</h1>
      <p className="mt-1 text-on-surface-variant">Gérez vos demandes de livraison</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-lg font-semibold text-on-background">Nouvelle livraison</h2>
          <CreateDeliveryForm />
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-on-background">Mes livraisons</h2>
          <Suspense fallback={<p className="text-on-surface-variant">Chargement…</p>}>
            <DeliveryList />
          </Suspense>
        </section>
      </div>
    </div>
  )
}
