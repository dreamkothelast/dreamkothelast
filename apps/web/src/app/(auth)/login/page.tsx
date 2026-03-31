import LoginForm from '@/components/auth/LoginForm'
import Link from 'next/link'

export const metadata = { title: 'Connexion — Parislivr' }

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-primary font-serif italic">Parislivr</Link>
          <p className="mt-2 text-sm text-on-surface-variant">Connectez-vous à votre compte</p>
        </div>
        <LoginForm />
        <p className="mt-6 text-center text-sm text-on-surface-variant">
          Pas encore de compte ?{' '}
          <Link href="/register" className="font-medium text-primary hover:underline">
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </div>
  )
}
