import { useEffect, useMemo, useState } from "react"
import { Building2, Pencil, Plus, Search } from "lucide-react"

import { AppLayout } from "@/components/app-layout"
import DependenciaViewer from "@/components/DependenciaViewer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { apiFetch } from "@/lib/api"
import { decodeToken } from "@/lib/auth"
import { useAuthStore } from "@/store/auth"
import type { Dependencia } from "@/types/agent"

export default function Dependencias() {
  const token = useAuthStore((state) => state.token)
  const puedeEditar = decodeToken(token)?.role === "root"

  const [dependencias, setDependencias] = useState<Dependencia[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [buscar, setBuscar] = useState("")
  const [editando, setEditando] = useState<Dependencia | null>(null)
  const [creando, setCreando] = useState(false)

  useEffect(() => {
    const cargarInicial = async () => {
      setCargando(true)
      setError(null)
      try {
        const response = await apiFetch("/dependencias")
        if (!response.ok) {
          throw new Error("Error al obtener las dependencias")
        }
        setDependencias(await response.json())
      } catch (err) {
        console.error("Error al obtener las dependencias:", err)
        setError("No se pudieron cargar las dependencias.")
      } finally {
        setCargando(false)
      }
    }

    cargarInicial()
  }, [])

  const resultado = useMemo(() => {
    const term = buscar.trim().toLowerCase()
    if (!term) return dependencias
    return dependencias.filter((dep) => dep.nombre.toLowerCase().includes(term))
  }, [dependencias, buscar])

  return (
    <AppLayout
      title="Dependencias"
      description="Dependencias municipales."
      actions={
        puedeEditar ? (
          <Button size="sm" onClick={() => setCreando(true)}>
            <Plus className="h-4 w-4" />
            Agregar dependencia
          </Button>
        ) : undefined
      }
    >
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-10 pl-10"
          placeholder="Buscar dependencia..."
          value={buscar}
          onChange={(event) => setBuscar(event.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de dependencias</CardTitle>
          <CardDescription>Dependencias registradas en el sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : cargando ? (
            <p className="text-sm text-muted-foreground">Cargando dependencias...</p>
          ) : resultado.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay dependencias.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    {puedeEditar ? <TableHead className="w-24">Acciones</TableHead> : null}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultado.map((dep) => (
                    <TableRow key={dep.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {dep.nombre}
                        </div>
                      </TableCell>
                      {puedeEditar ? (
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => setEditando(dep)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {puedeEditar && creando ? (
        <DependenciaViewer
          mode="create"
          open
          onOpenChange={(open) => {
            if (!open) setCreando(false)
          }}
          onCreate={(nueva) => {
            setDependencias((current) => [...current, nueva])
            setCreando(false)
          }}
        />
      ) : null}

      {puedeEditar && editando ? (
        <DependenciaViewer
          item={editando}
          open
          onOpenChange={(open) => {
            if (!open) setEditando(null)
          }}
          onSave={(actualizada) => {
            setDependencias((current) =>
              current.map((dep) => (dep.id === actualizada.id ? actualizada : dep))
            )
            setEditando(null)
          }}
        />
      ) : null}
    </AppLayout>
  )
}
