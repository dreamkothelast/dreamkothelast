'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User } from '@parislivr/types'
import { api } from '@/lib/api'

interface AuthContextValue {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const res = await api.get<User | null>('/auth/me')
    setUser(res.data ?? null)
  }, [])

  const logout = useCallback(async () => {
    await api.post('/auth/logout', {})
    setUser(null)
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  return <AuthContext.Provider value={{ user, loading, logout, refresh }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider')
  return ctx
}
