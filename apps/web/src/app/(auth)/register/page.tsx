import RegisterForm from '@/components/auth/RegisterForm'
import Link from 'next/link'

export const metadata = { title: 'Inscription — Parislivr' }

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-primary font-serif italic">Parislivr</Link>
          <p className="mt-2 text-sm text-on-surface-variant">Créez votre compte</p>
        </div>
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-on-surface-variant">
          Déjà un compte ?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
