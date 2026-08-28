import { useEffect, useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { UserPlus } from "lucide-react"

import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { apiFetch } from "@/lib/api"
import { decodeToken } from "@/lib/auth"
import { useAuthStore } from "@/store/auth"
import type { Rol, Usuario } from "@/types/user"

const roles: { value: Rol; label: string }[] = [
  { value: "root", label: "Root" },
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
]

export default function Usuarios() {
  const navigate = useNavigate()
  const token = useAuthStore((state) => state.token)
  const rol = decodeToken(token)?.role

  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [cargando, setCargando] = useState(true)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<Rol>("manager")
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)

  useEffect(() => {
    if (rol !== "root") {
      navigate("/novedades", { replace: true })
    }
  }, [rol, navigate])

  useEffect(() => {
    if (rol !== "root") return

    const cargarUsuarios = async () => {
      setCargando(true)
      try {
        const response = await apiFetch("/auth/users")
        if (response.ok) {
          setUsuarios(await response.json())
        }
      } catch (err) {
        console.error("Error al obtener los usuarios:", err)
      } finally {
        setCargando(false)
      }
    }

    cargarUsuarios()
  }, [rol])

  if (rol !== "root") {
    return null
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setMensaje(null)
    setGuardando(true)

    try {
      const response = await apiFetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "No se pudo crear el usuario")
      }

      setUsuarios((current) => [...current, data.user ?? { id: data.userId, username, role }])
      setMensaje(`Usuario "${username}" creado con rol ${role}.`)
      setUsername("")
      setPassword("")
      setRole("manager")
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <AppLayout
      title="Usuarios"
      description="Crea nuevos usuarios del sistema. Solo visible para el rol root."
    >
      <div className="grid gap-6 xl:grid-cols-[2fr_3fr]">
        <Card className="overflow-hidden">
          <CardHeader className="gap-2">
            <CardTitle className="text-xl font-semibold">Crear usuario</CardTitle>
            <CardDescription>El usuario podrá iniciar sesión con estas credenciales.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <Field>
                <FieldLabel htmlFor="new-username">Usuario</FieldLabel>
                <Input
                  id="new-username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                  autoComplete="off"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="new-password">Contraseña</FieldLabel>
                <Input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="new-password"
                />
              </Field>

              <Field>
                <FieldLabel>Rol</FieldLabel>
                <Select value={role} onValueChange={(value) => setRole(value as Rol)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {error ? (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              {mensaje ? (
                <div className="rounded-md border border-primary/50 bg-primary/10 px-4 py-3 text-sm text-primary">
                  {mensaje}
                </div>
              ) : null}

              <Button type="submit" disabled={guardando}>
                <UserPlus />
                {guardando ? "Creando..." : "Crear usuario"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Usuarios existentes</CardTitle>
            <CardDescription>Cuentas con acceso al sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            {cargando ? (
              <p className="text-sm text-muted-foreground">Cargando usuarios...</p>
            ) : usuarios.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay usuarios registrados.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Rol</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuarios.map((usuario) => (
                      <TableRow key={usuario.id}>
                        <TableCell>{usuario.username}</TableCell>
                        <TableCell className="capitalize">{usuario.role}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
