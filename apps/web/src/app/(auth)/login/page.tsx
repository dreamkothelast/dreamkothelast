import LoginForm from '@/components/auth/LoginForm'
import Link from 'next/link'

export const metadata = { title: 'Connexion — Parislivr' }

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-brand-600">Parislivr</Link>
          <p className="mt-2 text-sm text-gray-500">Connectez-vous à votre compte</p>
        </div>
        <LoginForm />
        <p className="mt-6 text-center text-sm text-gray-500">
          Pas encore de compte ?{' '}
          <Link href="/register" className="font-medium text-brand-600 hover:underline">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  )
}
