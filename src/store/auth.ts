import { create } from "zustand"

const TOKEN_KEY = "auth_token"
const REFRESH_TOKEN_KEY = "refresh_token"

interface AuthState {
  token: string | null
  refreshToken: string | null
  setSession: (token: string | null, refreshToken?: string | null) => void
  setToken: (token: string | null) => void
  clearToken: () => void
}

const readStorage = (key: string) => {
  if (typeof window === "undefined") return null
  return localStorage.getItem(key)
}

const writeStorage = (key: string, value: string | null) => {
  if (typeof window === "undefined") return
  if (value) {
    localStorage.setItem(key, value)
  } else {
    localStorage.removeItem(key)
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  token: readStorage(TOKEN_KEY),
  refreshToken: readStorage(REFRESH_TOKEN_KEY),
  setSession: (token, refreshToken) => {
    writeStorage(TOKEN_KEY, token)
    if (refreshToken !== undefined) {
      writeStorage(REFRESH_TOKEN_KEY, refreshToken)
    }
    set((state) => ({
      token,
      refreshToken:
        refreshToken !== undefined ? refreshToken : state.refreshToken,
    }))
  },
  setToken: (token) => {
    writeStorage(TOKEN_KEY, token)
    set({ token })
  },
  clearToken: () => {
    writeStorage(TOKEN_KEY, null)
    writeStorage(REFRESH_TOKEN_KEY, null)
    set({ token: null, refreshToken: null })
  },
}))
