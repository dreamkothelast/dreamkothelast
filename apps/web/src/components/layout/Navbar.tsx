'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Navbar() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  async function handleLogout() {
    await logout()
    router.push('/')
  }

  return (
    <header className="border-b border-outline-variant bg-surface-container-lowest shadow-hard-sm">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold text-primary font-serif italic">
          Parislivr
        </Link>

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-5 w-24 animate-pulse rounded bg-surface-container" />
          ) : user ? (
            <>
              <Link
                href={user.role === 'merchant' ? '/merchant' : '/driver'}
                className="text-sm font-medium text-on-surface-variant hover:text-primary"
              >
                {user.role === 'merchant' ? 'Mon espace' : 'Mes livraisons'}
              </Link>
              <span className="text-xs text-on-surface-variant">{user.email}</span>
              <button
                onClick={handleLogout}
                className="rounded border border-outline-variant px-3 py-1.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-on-surface-variant hover:text-primary">
                Connexion
              </Link>
              <Link href="/register" className="btn-primary text-sm px-4 py-2">
                Inscription
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
