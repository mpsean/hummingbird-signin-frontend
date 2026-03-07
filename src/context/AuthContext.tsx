import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authApi, User } from '../services/authApi'

interface AuthCtx {
  user: User | null
  loading: boolean
  login: (emailOrUsername: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
}

interface RegisterData {
  email: string; username: string; password: string;
  firstName?: string; lastName?: string
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
  }

  const register = async (data: RegisterData) => {
    const { data: res } = await authApi.register(data)
    localStorage.setItem('token', res.token)
    setUser(res.user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
