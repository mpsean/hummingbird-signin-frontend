import { vi, describe, it, expect, beforeEach } from 'vitest'

// vi.hoisted runs before everything — lets us share state between the mock
// factory (which is hoisted) and the rest of the test file.
const axiosMock = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
  requestFulfilled: undefined as ((cfg: any) => any) | undefined,
  responseRejected: undefined as ((err: any) => Promise<any>) | undefined,
}))

// Replace axios.create() with a fake instance before authApi is imported.
vi.mock('axios', () => ({
  default: {
    create: () => ({
      post: axiosMock.post,
      get: axiosMock.get,
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

// Static import runs after vi.mock is hoisted — picks up the mock.
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

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

// ── authApi.login ─────────────────────────────────────────────────────────────

describe('authApi.login', () => {
  it('POSTs to /auth/login with credentials', async () => {
    axiosMock.post.mockResolvedValueOnce({ data: mockAuthResponse })

    const res = await authApi.login({ emailOrUsername: 'testuser', password: 'secret' })

    expect(axiosMock.post).toHaveBeenCalledWith('/auth/login', {
      emailOrUsername: 'testuser',
      password: 'secret',
    })
    expect(res.data.token).toBe('test-jwt-token')
    expect(res.data.user.username).toBe('testuser')
  })
})

// ── authApi.register ──────────────────────────────────────────────────────────

describe('authApi.register', () => {
  it('POSTs to /auth/register with user data', async () => {
    axiosMock.post.mockResolvedValueOnce({ data: mockAuthResponse })

    const payload = {
      email: 'user@example.com',
      username: 'testuser',
      password: 'secret',
      firstName: 'Test',
    }
    const res = await authApi.register(payload)

    expect(axiosMock.post).toHaveBeenCalledWith('/auth/register', payload)
    expect(res.data.token).toBe('test-jwt-token')
  })
})

// ── authApi.me ────────────────────────────────────────────────────────────────

describe('authApi.me', () => {
  it('GETs /auth/me', async () => {
    axiosMock.get.mockResolvedValueOnce({ data: mockUser })

    const res = await authApi.me()

    expect(axiosMock.get).toHaveBeenCalledWith('/auth/me')
    expect(res.data.email).toBe('user@example.com')
  })
})

// ── authApi.changePassword ────────────────────────────────────────────────────

describe('authApi.changePassword', () => {
  it('POSTs to /auth/change-password', async () => {
    axiosMock.post.mockResolvedValueOnce({ data: {} })

    await authApi.changePassword({ currentPassword: 'old', newPassword: 'new' })

    expect(axiosMock.post).toHaveBeenCalledWith('/auth/change-password', {
      currentPassword: 'old',
      newPassword: 'new',
    })
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
  beforeEach(() => {
    Object.defineProperty(window, 'location', { value: { href: '' }, writable: true })
  })

  it('removes token from localStorage on 401', async () => {
    localStorage.setItem('token', 'expired-token')

    await axiosMock.responseRejected!({ response: { status: 401 } }).catch(() => {})

    expect(localStorage.getItem('token')).toBeNull()
  })

  it('redirects to /login on 401', async () => {
    await axiosMock.responseRejected!({ response: { status: 401 } }).catch(() => {})

    expect(window.location.href).toBe('/login')
  })

  it('re-throws errors that are not 401', async () => {
    const error = { response: { status: 500 } }

    await expect(axiosMock.responseRejected!(error)).rejects.toEqual(error)
  })
})
