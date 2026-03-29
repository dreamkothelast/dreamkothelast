'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginSchema } from '@parislivr/schemas'
import type { LoginInput } from '@parislivr/schemas'
import { api } from '@/lib/api'
import type { User } from '@parislivr/types'

export default function LoginForm() {
  const router = useRouter()
  const [form, setForm] = useState<LoginInput>({ email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const set = (key: keyof LoginInput) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const parsed = loginSchema.safeParse(form)
    if (!parsed.success) { setError(parsed.error.errors[0]?.message ?? 'Erreur de validation'); return }

    setSubmitting(true)
    const res = await api.post<User>('/auth/login', form)
    setSubmitting(false)

    if (res.error) { setError(res.error.message); return }

    router.push(res.data.role === 'merchant' ? '/merchant' : '/driver')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
      <div>
        <label className="label">Email</label>
        <input
          type="email" required autoComplete="email"
          value={form.email} onChange={set('email')}
          className="input mt-1 w-full"
          placeholder="vous@exemple.fr"
        />
      </div>
      <div>
        <label className="label">Mot de passe</label>
        <input
          type="password" required autoComplete="current-password"
          value={form.password} onChange={set('password')}
          className="input mt-1 w-full"
        />
      </div>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  )
}
