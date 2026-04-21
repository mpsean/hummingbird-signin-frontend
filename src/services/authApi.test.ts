import { vi, describe, it, expect, beforeEach } from 'vitest'

const axiosMock = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
  requestFulfilled: undefined as ((cfg: any) => any) | undefined,
  responseRejected: undefined as ((err: any) => Promise<any>) | undefined,
}))

vi.mock('axios', () => ({
  default: {
    create: () => ({
      post: axiosMock.post,
      get: axiosMock.get,
      delete: axiosMock.delete,
      interceptors: {
        request: {
          use: (fulfilled: (cfg: any) => any) => {
            axiosMock.requestFulfilled = fulfilled
          },
        },
        response: {
          use: (_: any, rejected: (err: any) => Promise<any>) => {
            axiosMock.responseRejected = rejected
          },
        },
      },
    }),
  },
}))

import { authApi } from './authApi'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockUser = {
  id: 1,
  email: 'user@example.com',
  username: 'testuser',
  role: 'USER',
  createdAt: '2024-01-01T00:00:00Z',
}

const mockAuthResponse = {
  token: 'test-jwt-token',
  tokenType: 'Bearer',
  expiresIn: 3600,
  user: mockUser,
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

// ── authApi.login ─────────────────────────────────────────────────────────────

describe('authApi.login', () => {
  it('POSTs to api/auth/login with credentials', async () => {
    axiosMock.post.mockResolvedValueOnce({ data: mockAuthResponse })

    const res = await authApi.login({ emailOrUsername: 'testuser', password: 'secret' })

    expect(axiosMock.post).toHaveBeenCalledWith('api/auth/login', {
      emailOrUsername: 'testuser',
      password: 'secret',
    })
    expect(res.data.token).toBe('test-jwt-token')
    expect(res.data.user.username).toBe('testuser')
  })
})

// ── authApi.register ──────────────────────────────────────────────────────────

describe('authApi.register', () => {
  it('POSTs to api/auth/register with user data', async () => {
    axiosMock.post.mockResolvedValueOnce({ data: mockAuthResponse })

    const payload = {
      email: 'user@example.com',
      username: 'testuser',
      password: 'secret',
      firstName: 'Test',
    }
    const res = await authApi.register(payload)

    expect(axiosMock.post).toHaveBeenCalledWith('api/auth/register', payload)
    expect(res.data.token).toBe('test-jwt-token')
  })
})

// ── authApi.me ────────────────────────────────────────────────────────────────

describe('authApi.me', () => {
  it('GETs api/auth/me', async () => {
    axiosMock.get.mockResolvedValueOnce({ data: mockUser })

    const res = await authApi.me()

    expect(axiosMock.get).toHaveBeenCalledWith('api/auth/me')
    expect(res.data.email).toBe('user@example.com')
  })
})

// ── authApi.changePassword ────────────────────────────────────────────────────

describe('authApi.changePassword', () => {
  it('POSTs to api/auth/change-password', async () => {
    axiosMock.post.mockResolvedValueOnce({ data: {} })

    await authApi.changePassword({ currentPassword: 'old', newPassword: 'new' })

    expect(axiosMock.post).toHaveBeenCalledWith('api/auth/change-password', {
      currentPassword: 'old',
      newPassword: 'new',
    })
  })
})

// ── authApi.deleteUser ────────────────────────────────────────────────────────

describe('authApi.deleteUser', () => {
  it('DELETEs api/users/:username', async () => {
    axiosMock.delete.mockResolvedValueOnce({ data: {} })

    await authApi.deleteUser('testuser')

    expect(axiosMock.delete).toHaveBeenCalledWith('api/users/testuser')
  })
})

// ── authApi.createTenant ──────────────────────────────────────────────────────

describe('authApi.createTenant', () => {
  it('POSTs to api/tenants with tenant data', async () => {
    axiosMock.post.mockResolvedValueOnce({ data: {} })

    const payload = { slug: 'acme', name: 'Acme Corp', frontendUrl: 'https://acme.example.com' }
    await authApi.createTenant(payload)

    expect(axiosMock.post).toHaveBeenCalledWith('api/tenants', payload)
  })
})

// ── Request interceptor ───────────────────────────────────────────────────────

describe('request interceptor', () => {
  it('attaches Bearer token when one is in localStorage', () => {
    localStorage.setItem('token', 'stored-token')

    const config = { headers: {} as Record<string, string> }
    const result = axiosMock.requestFulfilled!(config)

    expect(result.headers.Authorization).toBe('Bearer stored-token')
  })

  it('does not add Authorization header when localStorage has no token', () => {
    const config = { headers: {} as Record<string, string> }
    const result = axiosMock.requestFulfilled!(config)

    expect(result.headers.Authorization).toBeUndefined()
  })
})

// ── Response interceptor ──────────────────────────────────────────────────────

describe('response interceptor — 401', () => {
  it('removes token from localStorage on 401', async () => {
    localStorage.setItem('token', 'expired-token')

    await axiosMock.responseRejected!({ response: { status: 401 } }).catch(() => {})

    expect(localStorage.getItem('token')).toBeNull()
  })

  it('re-throws the error after a 401', async () => {
    const error = { response: { status: 401 } }

    await expect(axiosMock.responseRejected!(error)).rejects.toEqual(error)
  })

  it('re-throws errors that are not 401', async () => {
    const error = { response: { status: 500 } }

    await expect(axiosMock.responseRejected!(error)).rejects.toEqual(error)
  })
})
