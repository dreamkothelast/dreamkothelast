import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center bg-background">
      {/* Hero illustration */}
      <div className="mb-6 select-none" aria-hidden="true" style={{ fontSize: 96, lineHeight: 1 }}>
        🥖🚴
      </div>

      <h1 className="text-5xl font-bold tracking-tight text-primary font-serif italic">Parislivr</h1>
      <p className="mt-4 max-w-xl text-lg text-on-surface-variant">
        La plateforme qui connecte les commerçants parisiens avec des livreurs indépendants
        partout en Île-de-France.
      </p>
      <div className="mt-10 flex gap-4 flex-wrap justify-center">
        <Link
          href="/merchant"
          className="rounded-lg bg-primary px-6 py-3 font-semibold text-on-primary hover:opacity-90 transition-opacity shadow-hard"
        >
          Espace commerçant
        </Link>
        <Link
          href="/driver"
          className="rounded-lg bg-primary px-6 py-3 font-semibold text-on-primary hover:opacity-90 transition-opacity shadow-hard"
        >
          Espace livreur
        </Link>
      </div>
    </main>
  )
}
