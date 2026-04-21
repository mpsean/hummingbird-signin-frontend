import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authApi, User } from '../services/authApi'

interface AuthCtx {
  user: User | null
  loading: boolean
  login: (emailOrUsername: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }
    authApi.me()
      .then(r => setUser(r.data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  const login = async (emailOrUsername: string, password: string) => {
    const { data } = await authApi.login({ emailOrUsername, password })
    localStorage.setItem('token', data.token)
    setUser(data.user)

    // Redirect to tenant frontend with token — use ?redirect param if present
    const params = new URLSearchParams(window.location.search)
    const redirectTo = params.get('redirect') || data.redirectUrl
    window.location.href = `${redirectTo}${redirectTo.includes('?') ? '&' : '?'}token=${data.token}`
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
