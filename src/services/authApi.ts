import axios from 'axios'

const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/$/, '')
const api = axios.create({ baseURL: `${BASE}/api` })

// Attach JWT token to every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Auto-logout on 401
api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      //window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export interface Tenant {
  id: number
  slug: string
  name: string
  frontendUrl: string
  isActive: boolean
  createdAt: string
}

export interface HbTenant {
  id: number
  name: string
  subdomain: string
  databaseName: string
  isActive: boolean
  createdAt: string
}

export interface User {
  id: number
  email: string
  username: string
  firstName?: string
  lastName?: string
  role: string
  createdAt: string
  lastLoginAt?: string
}

export interface AuthResponse {
  token: string
  tokenType: string
  expiresIn: number
  redirectUrl: string
  user: User
}

export const authApi = {
  getTenants: () => api.get<Tenant[]>('/tenants'),

  getHbTenants: () => fetch('http://localhost:5000/api/admin/tenants', {
    headers: { 'X-Admin-Key': 'hb-admin-dev-key' }
  }).then(r => { if (!r.ok) throw new Error(r.statusText); return r.json() as Promise<HbTenant[]> }),

  register: (data: {
    email: string; username: string; password: string;
    firstName?: string; lastName?: string; tenantSlug?: string
  }) => api.post<AuthResponse>('/auth/register', data),

  login: (data: { emailOrUsername: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),

  me: () => api.get<User>('/auth/me'),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),

  deleteUser: (username: string) =>
    api.delete(`/users/${username}`),

  createTenant: (data: { slug: string; name: string; frontendUrl: string }) =>
    api.post('/tenants', data),
}

export default api
