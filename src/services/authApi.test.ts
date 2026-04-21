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
  redirectUrl: '/dashboard',
  user: mockUser,
}

const mockTenant = {
  id: 1,
  slug: 'acme',
  name: 'Acme Corp',
  frontendUrl: 'https://acme.example.com',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
}

const mockHbTenant = {
  id: 1,
  name: 'Acme HB',
  subdomain: 'acme',
  databaseName: 'acme_db',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  vi.restoreAllMocks()
})

// ── authApi.getTenants ────────────────────────────────────────────────────────

describe('authApi.getTenants', () => {
  it('GETs api/tenants', async () => {
    axiosMock.get.mockResolvedValueOnce({ data: [mockTenant] })

    const res = await authApi.getTenants()

    expect(axiosMock.get).toHaveBeenCalledWith('api/tenants')
    expect(res.data[0].slug).toBe('acme')
  })
})

// ── authApi.getHbTenants ──────────────────────────────────────────────────────

describe('authApi.getHbTenants', () => {
  it('fetches /api/admin/tenants with admin key header', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([mockHbTenant]),
    } as Response)

    const result = await authApi.getHbTenants()

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/tenants'),
      expect.objectContaining({
        headers: { 'X-Admin-Key': 'hb-admin-dev-key' },
      })
    )
    expect(result[0].subdomain).toBe('acme')
  })

  it('throws when response is not ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      statusText: 'Unauthorized',
    } as Response)

    await expect(authApi.getHbTenants()).rejects.toThrow('Unauthorized')
  })
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
  it('POSTs to auth/register with user data', async () => {
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
  it('GETs auth/me', async () => {
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
  it('POSTs to tenants with tenant data', async () => {
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
