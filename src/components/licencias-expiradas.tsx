import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Edit } from "lucide-react"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { fetchLicencias } from "@/lib/licencias"
import type { Licencia } from "@/types/licencia"

export default function LicenciasExpiradas() {
  const navigate = useNavigate()
  const [licencias, setLicencias] = useState<Licencia[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const hoy = useMemo(() => {
    const fecha = new Date()
    fecha.setHours(0, 0, 0, 0)
    return fecha
  }, [])

  const getDiasRestantes = (fechaFin: string) => {
    const fin = new Date(fechaFin)
    fin.setHours(0, 0, 0, 0)
    const diferencia = Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
    return diferencia > 0 ? diferencia : 0
  }

  const licenciasExpiradas = useMemo(() => {
    return licencias.filter((lic) => getDiasRestantes(lic.fin) === 0)
  }, [licencias])

  const cargarLicencias = async () => {
    setCargando(true)
    setError(null)
    try {
      setLicencias(await fetchLicencias())
    } catch (err) {
      console.error("Error al obtener las licencias:", err)
      setError("No se pudieron cargar las licencias.")
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    const cargarInicial = async () => {
      setCargando(true)
      setError(null)
      try {
        setLicencias(await fetchLicencias())
      } catch (err) {
        console.error("Error al obtener las licencias:", err)
        setError("No se pudieron cargar las licencias.")
      } finally {
        setCargando(false)
      }
    }

    cargarInicial()
  }, [])

  return (
    <AppLayout
      title="Licencias expiradas"
      description="Licencias generadas cuya fecha de fin ya venció."
      actions={
        <Button size="sm" onClick={cargarLicencias} disabled={cargando}>
          {cargando ? "Actualizando..." : "Actualizar Lista"}
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Listado de licencias expiradas</CardTitle>
          <CardDescription>
            Aquí podrás ver las licencias que ya han expirado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : cargando ? (
            <p className="text-sm text-muted-foreground">Cargando licencias...</p>
          ) : licenciasExpiradas.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay licencias expiradas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empleado</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Inicio</TableHead>
                    <TableHead>Fin</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Archivo</TableHead>
                    <TableHead>Observaciones</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {licenciasExpiradas.map((licencia) => (
                    <TableRow key={licencia.id} className="bg-red-100/30">
                      <TableCell>{licencia.empleado}</TableCell>
                      <TableCell>{licencia.tipoLicencia}</TableCell>
                      <TableCell>{licencia.inicio}</TableCell>
                      <TableCell>{licencia.fin}</TableCell>
                      <TableCell>
                        <span className="font-semibold text-red-600">Expirada</span>
                      </TableCell>
                      <TableCell>
                        {licencia.archivoNombre ? (
                          licencia.archivoUrl ? (
                            <a
                              href={licencia.archivoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary underline"
                            >
                              {licencia.archivoNombre}
                            </a>
                          ) : (
                            licencia.archivoNombre
                          )
                        ) : (
                          "Ninguno"
                        )}
                      </TableCell>
                      <TableCell>{licencia.observaciones || "-"}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/licencias?id=${licencia.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="ml-1">Editar</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  )
}
