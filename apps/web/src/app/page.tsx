import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-5xl font-bold tracking-tight text-brand-600">Parislivr</h1>
      <p className="mt-4 max-w-xl text-lg text-gray-600">
        La plateforme qui connecte les commerçants parisiens avec des livreurs indépendants
        partout en Île-de-France.
      </p>
      <div className="mt-10 flex gap-4">
        <Link
          href="/merchant"
          className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700 transition-colors"
        >
          Espace commerçant
        </Link>
        <Link
          href="/driver"
          className="rounded-lg border border-brand-600 px-6 py-3 font-semibold text-brand-600 hover:bg-brand-50 transition-colors"
        >
          Espace livreur
        </Link>
      </div>
    </main>
  )
}
