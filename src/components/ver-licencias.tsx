import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Edit } from "lucide-react"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Licencia } from "@/types/licencia"

export default function VerLicencias() {
  const navigate = useNavigate()
  const [licencias, setLicencias] = useState<Licencia[]>([])

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

  const licenciasActivas = useMemo(() => {
    return licencias.filter((lic) => getDiasRestantes(lic.fin) > 0)
  }, [licencias])

  useEffect(() => {
    const current = localStorage.getItem("licencias_guardadas")
    if (!current) {
      setLicencias([])
      return
    }

    try {
      setLicencias(JSON.parse(current))
    } catch {
      setLicencias([])
    }
  }, [])

  return (
    <AppLayout
      title="Ver licencias"
      description="Licencias generadas que todavía están activas."
      actions={<Button size="sm">Actualizar Lista</Button>}
    >
      <Card>
        <CardHeader>
          <CardTitle>Listado de licencias</CardTitle>
          <CardDescription>
            Aquí podrás ver las licencias generadas y sus estados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {licencias.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No se han guardado licencias aún.
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
                    <TableHead>Días restantes</TableHead>
                    <TableHead>Archivo</TableHead>
                    <TableHead>Observaciones</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {licenciasActivas.map((licencia) => (
                    <TableRow key={licencia.id}>
                      <TableCell>{licencia.empleado}</TableCell>
                      <TableCell>{licencia.tipoLicencia}</TableCell>
                      <TableCell>{licencia.inicio}</TableCell>
                      <TableCell>{licencia.fin}</TableCell>
                      <TableCell>{getDiasRestantes(licencia.fin)}</TableCell>
                      <TableCell>{licencia.archivoNombre || "Ninguno"}</TableCell>
                      <TableCell>{licencia.observaciones || "-"}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            localStorage.setItem("licencia_editando", JSON.stringify(licencia))
                            navigate("/licencias")
                          }}
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
