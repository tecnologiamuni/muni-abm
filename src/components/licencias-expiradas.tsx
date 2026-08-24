import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Edit } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Licencia } from "@/types/licencia"

export default function LicenciasExpiradas() {
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

  const licenciasExpiradas = useMemo(() => {
    return licencias.filter((lic) => getDiasRestantes(lic.fin) === 0)
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
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />

      <SidebarInset>
        <SiteHeader />

        <div className="flex min-h-[calc(100vh-3rem)] flex-col gap-6 p-6 lg:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.15em] text-muted-foreground">
                Licencias de Personal
              </p>
              <h1 className="text-3xl font-semibold tracking-tight">Licencias Expiradas</h1>
            </div>
            <Button size="sm">Actualizar Lista</Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Listado de licencias expiradas</CardTitle>
              <CardDescription>
                Aquí podrás ver las licencias que ya han expirado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {licenciasExpiradas.length === 0 ? (
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
                            <span className="text-red-600 font-semibold">Expirada</span>
                          </TableCell>
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
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
