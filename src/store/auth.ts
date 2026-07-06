import { create } from "zustand"

interface AuthState {
  token: string | null
  setToken: (token: string | null) => void
  clearToken: () => void
}

const getInitialToken = () => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

export const useAuthStore = create<AuthState>((set) => ({
  token: getInitialToken(),
  setToken: (token) => {
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("auth_token", token)
      } else {
        localStorage.removeItem("auth_token")
      }
    }
    set({ token })
  },
  clearToken: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
    set({ token: null })
  },
}))
