import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  // FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuthStore } from "@/store/auth"
import { API_BASE } from "@/lib/api"

type AuthMode = "login" | "register"

export function LoginForm({ className }: { className?: string }) {
  const [mode, setMode] = useState<AuthMode>("login")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("user")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const setSession = useAuthStore((state) => state.setSession)
  const navigate = useNavigate()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    const payload = mode === "login"
      ? { username, password }
      : { username, password, role }
    const endpoint = mode === "login" ? "/auth/login" : "/auth/register"

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || response.statusText || "Error en la solicitud")
      }

      if (mode === "login") {
        if (!data.token) {
          throw new Error("No se recibió token de autenticación")
        }

        setSession(data.token, data.refreshToken ?? null)
        navigate("/dashboard")
        return
      }

      setMessage(data.message || "Registro exitoso. Inicia sesión ahora.")
      setMode("login")
      setPassword("")
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  // const toggleMode = () => {
  //   setMode(mode === "login" ? "register" : "login")
  //   setError(null)
  //   setMessage(null)
  // }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">
            {mode === "login" ? "Inicia sesión" : "Regístrate"}
          </h1>
          <p className="text-sm text-balance text-muted-foreground">
            {mode === "login"
              ? "Usa tu usuario y contraseña para acceder." 
              : "Crea una nueva cuenta para acceder al dashboard."}
          </p>
        </div>

        {error ? (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="rounded-md border border-primary/50 bg-primary/10 px-4 py-3 text-sm text-primary-foreground">
            {message}
          </div>
        ) : null}

        <Field>
          <FieldLabel htmlFor="username">Usuario</FieldLabel>
          <Input
            id="username"
            type="text"
            placeholder="usuario123"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            className="bg-background"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Contraseña</FieldLabel>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="bg-background"
          />
        </Field>

        {mode === "register" ? (
          <Field>
            <FieldLabel htmlFor="role">Rol</FieldLabel>
            <Input
              id="role"
              type="text"
              placeholder="user"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="bg-background"
            />
            <FieldDescription>Opcional. Por ejemplo: user, admin.</FieldDescription>
          </Field>
        ) : null}

        <Field>
          <Button type="submit" disabled={loading}>
            {loading ? "Enviando..." : mode === "login" ? "Iniciar sesión" : "Registrarme"}
          </Button>
        </Field>

        {/* <FieldSeparator>
          {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
        </FieldSeparator>

        <Field>
          <Button variant="outline" type="button" onClick={toggleMode}>
            {mode === "login" ? "Regístrate" : "Inicia sesión"}
          </Button>
        </Field> */}
      </FieldGroup>
    </form>
  )
}
