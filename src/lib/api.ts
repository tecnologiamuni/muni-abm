import { useAuthStore } from "@/store/auth"

export const API_BASE = "https://presentismo-backend.vercel.app/api"

// Shared in-flight refresh so concurrent 401s trigger a single refresh call.
let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken, setSession, clearToken } = useAuthStore.getState()

  if (!refreshToken) {
    clearToken()
    return null
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        })

        if (!response.ok) {
          clearToken()
          return null
        }

        const data = await response.json()
        if (!data?.token) {
          clearToken()
          return null
        }

        setSession(data.token, data.refreshToken ?? refreshToken)
        return data.token as string
      } catch {
        clearToken()
        return null
      } finally {
        refreshPromise = null
      }
    })()
  }

  return refreshPromise
}

function buildInit(init: RequestInit, token: string | null): RequestInit {
  return {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }
}

/**
 * fetch wrapper that attaches the access token and transparently refreshes it
 * once when the backend rejects the request with 401/403 (expired token).
 * Accepts either an absolute URL or a path relative to API_BASE.
 */
export async function apiFetch(
  input: string,
  init: RequestInit = {}
): Promise<Response> {
  const url = input.startsWith("http") ? input : `${API_BASE}${input}`
  const { token } = useAuthStore.getState()

  let response = await fetch(url, buildInit(init, token))

  if (response.status === 401 || response.status === 403) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      response = await fetch(url, buildInit(init, newToken))
    } else if (typeof window !== "undefined") {
      // Refresh failed — session is dead, send the user back to login.
      window.location.assign("/login")
    }
  }

  return response
}
