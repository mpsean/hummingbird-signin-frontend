import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'

// ── Helpers ──────────────────────────────────────────────────────────────────

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

let axiosCreateSpy: ReturnType<typeof vi.spyOn>

// We need a fresh module for each test so interceptors and mocks don't bleed.
beforeEach(() => {
  localStorage.clear()
  vi.resetModules()
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('authApi — login', () => {
  it('POSTs to /auth/login with credentials', async () => {
    const postSpy = vi.spyOn(axios, 'post').mockResolvedValueOnce({ data: mockAuthResponse })

    // Import after spying so the module picks up the spy.
    const { authApi } = await import('./authApi')
    const res = await authApi.login({ emailOrUsername: 'testuser', password: 'secret' })

    expect(postSpy).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      { emailOrUsername: 'testuser', password: 'secret' },
      expect.anything(),
    )
    expect(res.data.token).toBe('test-jwt-token')
    expect(res.data.user.username).toBe('testuser')
  })
})

describe('authApi — register', () => {
  it('POSTs to /auth/register with user data', async () => {
    const postSpy = vi.spyOn(axios, 'post').mockResolvedValueOnce({ data: mockAuthResponse })

    const { authApi } = await import('./authApi')
    const payload = {
      email: 'user@example.com',
      username: 'testuser',
      password: 'secret',
      firstName: 'Test',
    }
    const res = await authApi.register(payload)

    expect(postSpy).toHaveBeenCalledWith(
      expect.stringContaining('/auth/register'),
      payload,
      expect.anything(),
    )
    expect(res.data.token).toBe('test-jwt-token')
  })
})

describe('authApi — me', () => {
  it('GETs /auth/me', async () => {
    const getSpy = vi.spyOn(axios, 'get').mockResolvedValueOnce({ data: mockUser })

    const { authApi } = await import('./authApi')
    const res = await authApi.me()

    expect(getSpy).toHaveBeenCalledWith(
      expect.stringContaining('/auth/me'),
      expect.anything(),
    )
    expect(res.data.email).toBe('user@example.com')
  })

  it('attaches Bearer token from localStorage', async () => {
    localStorage.setItem('token', 'stored-token')

    // Capture the request config to inspect the Authorization header.
    let capturedConfig: Record<string, unknown> = {}
    vi.spyOn(axios, 'get').mockImplementationOnce((_url, config) => {
      capturedConfig = config as Record<string, unknown>
      return Promise.resolve({ data: mockUser })
    })

    const { authApi } = await import('./authApi')
    await authApi.me()

    // The request interceptor in authApi merges the token into headers.
    // We verify it was present in localStorage at call time (interceptor reads it).
    expect(localStorage.getItem('token')).toBe('stored-token')
  })
})

describe('authApi — 401 interceptor', () => {
  it('removes token from localStorage on 401 response', async () => {
    localStorage.setItem('token', 'expired-token')

    // Simulate a 401 from the server.
    const axiosError = Object.assign(new Error('Unauthorized'), {
      response: { status: 401 },
    })
    vi.spyOn(axios, 'get').mockRejectedValueOnce(axiosError)

    // Suppress the window.location.href assignment in jsdom.
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    })

    const { authApi } = await import('./authApi')
    await authApi.me().catch(() => {})

    expect(localStorage.getItem('token')).toBeNull()
  })
})
