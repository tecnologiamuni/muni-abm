import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, Cake, CalendarClock, ClipboardCheck } from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { apiFetch } from "@/lib/api"
import type { Agent } from "@/types/agent"
import type { Licencia } from "@/types/licencia"

const DIAS_PROXIMOS = 30

function fechaLocal(fecha: string) {
  const [anio, mes, dia] = fecha.split("-").map(Number)
  const resultado = new Date(anio, mes - 1, dia)
  return Number.isNaN(resultado.getTime()) ? null : resultado
}

function diasHastaFechaAnual(fecha: string, hoy: Date) {
  const original = fechaLocal(fecha)
  if (!original) return null

  const proxima = new Date(hoy.getFullYear(), original.getMonth(), original.getDate())
  if (proxima < hoy) {
    proxima.setFullYear(hoy.getFullYear() + 1)
  }

  return Math.round((proxima.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
}

function nombreCompleto(agente: Agent) {
  return `${agente.apellido}, ${agente.nombre}`
}

function MensajeVacio({ texto }: { texto: string }) {
  return <p className="text-sm text-muted-foreground">{texto}</p>
}

function FlechasPaginacion({
  pagina,
  visible,
  haySiguiente,
  volver,
  siguiente,
}: {
  visible: boolean
  pagina: number
  haySiguiente: boolean
  volver: () => void
  siguiente: () => void
}) {
  if (!visible) return null

  return (
    <div className="flex shrink-0 items-center gap-1">
      <Button
        aria-label="Volver a las personas anteriores"
        disabled={pagina === 0}
        className="h-7 w-7"
        size="icon"
        variant="ghost"
        onClick={volver}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <Button
        aria-label="Ver siguientes personas"
        disabled={!haySiguiente}
        className="h-7 w-7"
        size="icon"
        variant="ghost"
        onClick={siguiente}
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default function Novedades() {
  const [agentes, setAgentes] = useState<Agent[]>([])
  const [licencias, setLicencias] = useState<Licencia[]>([])
  const [paginaAniversarios, setPaginaAniversarios] = useState(0)
  const [paginaLicencias, setPaginaLicencias] = useState(0)
  const [paginaCumpleanios, setPaginaCumpleanios] = useState(0)

  useEffect(() => {
    const cargarAgentes = async () => {
      try {
        const response = await apiFetch("/agentes")
        if (response.ok) {
          setAgentes(await response.json())
        }
      } catch (error) {
        console.error("Error al obtener los agentes:", error)
      }
    }

    cargarAgentes()

    const guardadas = localStorage.getItem("licencias_guardadas")
    if (!guardadas) return

    try {
      setLicencias(JSON.parse(guardadas))
    } catch {
      setLicencias([])
    }
  }, [])

  const hoy = useMemo(() => {
    const fecha = new Date()
    fecha.setHours(0, 0, 0, 0)
    return fecha
  }, [])

  const aniversarios = useMemo(
    () =>
      agentes
        .map((agente) => ({ agente, dias: diasHastaFechaAnual(agente.fecha_ingreso, hoy) }))
        .filter(
          (item): item is { agente: Agent; dias: number } =>
            item.dias !== null && item.dias <= DIAS_PROXIMOS
        )
        .sort((a, b) => a.dias - b.dias),
    [agentes, hoy]
  )

  const cumpleanios = useMemo(
    () =>
      agentes
        .map((agente) => ({ agente, dias: diasHastaFechaAnual(agente.fecha_nacimiento, hoy) }))
        .filter(
          (item): item is { agente: Agent; dias: number } =>
            item.dias !== null && item.dias <= DIAS_PROXIMOS
        )
        .sort((a, b) => a.dias - b.dias),
    [agentes, hoy]
  )

  const licenciasActivas = useMemo(
    () =>
      licencias.filter((licencia) => {
        const inicio = fechaLocal(licencia.inicio)
        const fin = fechaLocal(licencia.fin)
        return inicio !== null && fin !== null && inicio <= hoy && fin >= hoy
      }),
    [licencias, hoy]
  )

  const personasPorPagina = 6
  const aniversariosVisibles = aniversarios.slice(
    paginaAniversarios * personasPorPagina,
    (paginaAniversarios + 1) * personasPorPagina
  )
  const licenciasVisibles = licenciasActivas.slice(
    paginaLicencias * personasPorPagina,
    (paginaLicencias + 1) * personasPorPagina
  )
  const cumpleaniosVisibles = cumpleanios.slice(
    paginaCumpleanios * personasPorPagina,
    (paginaCumpleanios + 1) * personasPorPagina
  )

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
        <main className="flex flex-1 flex-col p-4">
          <div className="flex flex-col gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <CalendarClock className="h-6 w-6 shrink-0 text-primary" />
                    <h2 className="text-base font-semibold">
                      Próximos aniversarios de tiempo trabajando
                    </h2>
                  </div>
                  <FlechasPaginacion
                    haySiguiente={(paginaAniversarios + 1) * personasPorPagina < aniversarios.length}
                    pagina={paginaAniversarios}
                    siguiente={() => setPaginaAniversarios((pagina) => pagina + 1)}
                    visible={aniversarios.length > personasPorPagina}
                    volver={() => setPaginaAniversarios((pagina) => pagina - 1)}
                  />
                </div>
                {aniversarios.length === 0 ? (
                  <MensajeVacio texto="No hay aniversarios en los próximos 30 días." />
                ) : (
                  <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {aniversariosVisibles.map(({ agente, dias }) => (
                      <li key={agente.id} className="rounded-md border bg-muted/30 p-3 text-sm">
                        <p className="font-medium">{nombreCompleto(agente)}</p>
                        <p className="mt-1 text-muted-foreground">
                          Ingreso: {agente.fecha_ingreso}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {dias === 0 ? "Hoy" : `En ${dias} días`}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <ClipboardCheck className="h-6 w-6 shrink-0 text-primary" />
                    <h2 className="text-base font-semibold">Licencias activas</h2>
                  </div>
                  <FlechasPaginacion
                    haySiguiente={(paginaLicencias + 1) * personasPorPagina < licenciasActivas.length}
                    pagina={paginaLicencias}
                    siguiente={() => setPaginaLicencias((pagina) => pagina + 1)}
                    visible={licenciasActivas.length > personasPorPagina}
                    volver={() => setPaginaLicencias((pagina) => pagina - 1)}
                  />
                </div>
                {licenciasActivas.length === 0 ? (
                  <MensajeVacio texto="No hay personas con licencias activas." />
                ) : (
                  <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {licenciasVisibles.map((licencia) => (
                      <li key={licencia.id} className="rounded-md border bg-muted/30 p-3 text-sm">
                        <p className="font-medium">{licencia.empleado}</p>
                        <p className="mt-1 text-muted-foreground">{licencia.tipoLicencia}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Hasta {licencia.fin}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Cake className="h-6 w-6 shrink-0 text-primary" />
                    <h2 className="text-base font-semibold">Cumpleaños</h2>
                  </div>
                  <FlechasPaginacion
                    haySiguiente={(paginaCumpleanios + 1) * personasPorPagina < cumpleanios.length}
                    pagina={paginaCumpleanios}
                    siguiente={() => setPaginaCumpleanios((pagina) => pagina + 1)}
                    visible={cumpleanios.length > personasPorPagina}
                    volver={() => setPaginaCumpleanios((pagina) => pagina - 1)}
                  />
                </div>
                {cumpleanios.length === 0 ? (
                  <MensajeVacio texto="No hay cumpleaños en los próximos 30 días." />
                ) : (
                  <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {cumpleaniosVisibles.map(({ agente, dias }) => (
                      <li
                        key={agente.id}
                        className="rounded-md border bg-muted/30 p-3 text-sm"
                      >
                        <p className="font-medium">{nombreCompleto(agente)}</p>
                        <p className="mt-1 text-muted-foreground">
                          Cumpleaños: {agente.fecha_nacimiento}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {dias === 0 ? "Hoy" : `En ${dias} días`}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
