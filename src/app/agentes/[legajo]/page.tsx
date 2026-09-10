import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, CalendarDays, Printer } from "lucide-react"

import { AppLayout } from "@/components/app-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiFetch } from "@/lib/api"
import { fetchLicencias } from "@/lib/licencias"
import { formatDate } from "@/lib/date"
import type { Agent } from "@/types/agent"
import type { Licencia } from "@/types/licencia"

type Periodo = {
  fecha_ingreso: string
  fecha_baja: string | null
  motivo_baja: string | null
}

function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value || "—"}</span>
    </div>
  )
}

function TimelineItem({ title, date, detail }: { title: string; date: string; detail?: string | null }) {
  return (
    <div className="flex gap-3">
      <div className="mt-1.5 h-3 w-3 shrink-0 rounded-full bg-primary" />
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{formatDate(date)}</p>
        {detail ? <p className="text-sm text-muted-foreground">{detail}</p> : null}
      </div>
    </div>
  )
}

function getRemainingDays(startDate: string, endDate: string, today: Date) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  if (end < today) return 0
  const from = start > today ? start : today
  return Math.max(0, Math.floor((end.getTime() - from.getTime()) / 86400000) + 1)
}

export default function AgentDetailPage() {
  const navigate = useNavigate()
  const { legajo } = useParams()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [periodos, setPeriodos] = useState<Periodo[]>([])
  const [licencias, setLicencias] = useState<Licencia[]>([])
  const [dependenciaNombre, setDependenciaNombre] = useState("—")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!legajo) return
      try {
        const [agentResponse, periodResponse, allLicencias, dependenciaResponse] = await Promise.all([
          apiFetch(`/agentes/${legajo}`),
          apiFetch(`/agentes/${legajo}/periodos`),
          fetchLicencias(),
          apiFetch("/dependencias"),
        ])
        if (!agentResponse.ok) throw new Error("No se pudo cargar el agente")
        const loadedAgent = (await agentResponse.json()) as Agent
        setAgent(loadedAgent)
        if (periodResponse.ok) setPeriodos(await periodResponse.json())
        setLicencias(allLicencias)
        if (dependenciaResponse.ok) {
          const dependencias = await dependenciaResponse.json()
          const dependencia = dependencias.find((item: { id: number; nombre: string }) => item.id === loadedAgent.dependencia_id)
          setDependenciaNombre(dependencia?.nombre ?? "—")
        }
      } catch (loadError) {
        console.error("Error al obtener el detalle del agente:", loadError)
        setError("No se pudo cargar la información del agente.")
      }
    }
    load()
  }, [legajo])

  const vacacionesRestantes = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return licencias
      .filter((licencia) => licencia.agenteId === agent?.id && licencia.tipoLicencia.toLowerCase() === "vacaciones")
      .reduce((total, licencia) => total + getRemainingDays(licencia.inicio, licencia.fin, today), 0)
  }, [agent?.id, licencias])

  const licenciasExpiradas = useMemo(() => {
    if (!agent) return []

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return licencias
      .filter((licencia) => {
        const fin = new Date(licencia.fin)
        fin.setHours(0, 0, 0, 0)
        return licencia.agenteId === agent.id && fin <= today
      })
      .sort((a, b) => b.fin.localeCompare(a.fin))
  }, [agent, licencias])

  if (error) {
    return <AppLayout title="Detalle del agente"><p className="text-destructive">{error}</p></AppLayout>
  }

  if (!agent) {
    return <AppLayout title="Detalle del agente"><p className="text-muted-foreground">Cargando información...</p></AppLayout>
  }

  const initials = `${agent.nombre?.[0] ?? ""}${agent.apellido?.[0] ?? ""}`

  return (
    <AppLayout
      title="Detalle del agente"
      description="Información completa del personal municipal."
      actions={
        <>
          <Button variant="outline" onClick={() => navigate("/agentes")}>
            <ArrowLeft /> Volver a agentes
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer /> Imprimir legajo
          </Button>
          <Button onClick={() => navigate(`/agentes/${agent.legajo}/editar`)}>
            Editar agente
          </Button>
        </>
      }
    >
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4 border-b">
            {agent.foto_url ? (
              <img src={agent.foto_url} alt="" className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-xl font-bold text-violet-700">{initials}</div>
            )}
            <div className="min-w-0">
              <CardTitle className="text-xl">{agent.apellido} {agent.nombre}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{agent.puesto}</p>
              <Badge className="mt-2" variant={agent.fecha_baja ? "destructive" : "default"}>{agent.fecha_baja ? "Inactivo" : "Activo"}</Badge>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Información personal</CardTitle></CardHeader>
            <CardContent>
              <DataRow label="Nombre" value={agent.nombre} />
              <DataRow label="Apellido" value={agent.apellido} />
              <DataRow label="Legajo" value={agent.legajo} />
              <DataRow label="DNI" value={agent.dni} />
              <DataRow label="Puesto" value={agent.puesto} />
              <DataRow label="Sexo" value={agent.sexo} />
              <DataRow label="Localidad" value={agent.localidad} />
              <DataRow label="Domicilio" value={agent.domicilio} />
              <DataRow label="Celular" value={agent.nro_celular} />
              <DataRow label="Nacimiento" value={formatDate(agent.fecha_nacimiento)} />
               <DataRow label="Nivel de estudios" value={agent.nivel_estudios} />
               <DataRow label="Cantidad de hijos" value={agent.cantidad_hijos} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Datos laborales</CardTitle></CardHeader>
            <CardContent>
              <DataRow label="Dependencia" value={dependenciaNombre} />
              <DataRow label="Ingreso" value={formatDate(agent.fecha_ingreso)} />
              <DataRow label="Jerárquico" value={agent.es_jerarquico} />
              <DataRow label="Tipo de contratación" value={agent.tipo_contratacion} />
              <DataRow label="Categoría" value={agent.categoria} />
              <DataRow label="Días de vacaciones restantes" value={<span className="inline-flex items-center gap-2 text-emerald-600"><CalendarDays className="h-4 w-4" />{vacacionesRestantes}</span>} />
              <div className="border-t pt-5">
                <h3 className="mb-4 text-sm font-semibold uppercase text-muted-foreground">Licencias expiradas</h3>
                {licenciasExpiradas.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tiene licencias expiradas registradas.</p>
                ) : (
                  <div className="space-y-3">
                    {licenciasExpiradas.map((licencia) => {
                      const diasTomados = Math.max(
                        1,
                        Math.floor(
                          (new Date(`${licencia.fin}T00:00:00`).getTime() -
                            new Date(`${licencia.inicio}T00:00:00`).getTime()) /
                            86400000
                        ) + 1
                      )

                      return (
                        <div key={licencia.id} className="rounded-md border bg-muted/30 p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-medium">{licencia.tipoLicencia}</p>
                            <Badge variant="destructive">Expirada</Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {formatDate(licencia.inicio)} al {formatDate(licencia.fin)} · {diasTomados} {diasTomados === 1 ? "día" : "días"}
                          </p>
                          {licencia.observaciones ? (
                            <p className="mt-1 text-sm text-muted-foreground">{licencia.observaciones}</p>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Historial y estado</CardTitle></CardHeader>
           <CardContent className="space-y-5">
            <DataRow label="Fecha de baja" value={formatDate(agent.fecha_baja)} />
            <DataRow label="Motivo de baja" value={agent.motivo_baja} />
            <DataRow label="Nro. de promoción" value={agent.nro} />
            <DataRow label="Fecha de promoción" value={formatDate(agent.fecha_promocion)} />
            <DataRow label="Decreto Nro." value={agent.decreto_nro} />
            <DataRow label="Observaciones" value={agent.observaciones} />
              <div className="border-t pt-5">
                <h3 className="mb-4 text-sm font-semibold uppercase text-muted-foreground">Períodos laborales</h3>
                <div className="space-y-5">
                  {(periodos.length > 0 ? periodos : [{ fecha_ingreso: agent.fecha_ingreso, fecha_baja: agent.fecha_baja ?? null, motivo_baja: agent.motivo_baja ?? null }]).map((periodo, index) => (
                    <div key={`${periodo.fecha_ingreso}-${index}`} className="space-y-4">
                      <TimelineItem
                        title={periodos.length > 1 ? `Alta del período ${index + 1}` : "Alta del agente"}
                        date={periodo.fecha_ingreso}
                      />
                      {periodo.fecha_baja ? (
                        <TimelineItem title="Baja del agente" date={periodo.fecha_baja} detail={periodo.motivo_baja ? `Motivo: ${periodo.motivo_baja}` : null} />
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}