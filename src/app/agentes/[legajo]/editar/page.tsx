import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, CalendarDays } from "lucide-react"
import { useForm } from "react-hook-form"

import { AppLayout } from "@/components/app-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiFetch } from "@/lib/api"
import { fetchLicencias } from "@/lib/licencias"
import type { Agent, Dependencia } from "@/types/agent"
import type { Licencia } from "@/types/licencia"

type Periodo = { fecha_ingreso: string; fecha_baja: string | null; motivo_baja: string | null }
type FormValues = Omit<Agent, "id" | "fecha_baja" | "motivo_baja" | "fecha_promocion" | "nro" | "decreto_nro" | "observaciones" | "tipo_contratacion" | "categoria" | "es_jerarquico" | "foto_url"> & {
  fecha_baja: string
  motivo_baja: string
  fecha_promocion: string
  nro: string
  decreto_nro: string
  observaciones: string
  tipo_contratacion: string
  categoria: string
  es_jerarquico: string
}

function Field({ label, name, register, type = "text" }: { label: string; name: keyof FormValues; register: ReturnType<typeof useForm<FormValues>>["register"]; type?: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} type={type} {...register(name)} />
    </div>
  )
}

function SelectField({ label, name, options, register }: { label: string; name: keyof FormValues; options: string[]; register: ReturnType<typeof useForm<FormValues>>["register"] }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <select id={name} {...register(name)} className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
        <option value="">Seleccionar</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  )
}

function getRemainingDays(startDate: string, endDate: string, today: Date) {
  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < today) return 0
  const from = start > today ? start : today
  return Math.max(0, Math.floor((end.getTime() - from.getTime()) / 86400000) + 1)
}

export default function AgentEditPage() {
  const navigate = useNavigate()
  const { legajo } = useParams()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [periodos, setPeriodos] = useState<Periodo[]>([])
  const [licencias, setLicencias] = useState<Licencia[]>([])
  const [dependencias, setDependencias] = useState<Dependencia[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset } = useForm<FormValues>()

  useEffect(() => {
    if (!legajo) return
    Promise.all([
      apiFetch(`/agentes/${legajo}`),
      apiFetch(`/agentes/${legajo}/periodos`),
      apiFetch("/dependencias"),
      fetchLicencias(),
    ]).then(async ([agentResponse, periodResponse, dependenciaResponse, loadedLicencias]) => {
      if (!agentResponse.ok) throw new Error("No se pudo cargar el agente")
      const loadedAgent = await agentResponse.json() as Agent
      setAgent(loadedAgent)
      setPeriodos(periodResponse.ok ? await periodResponse.json() : [])
      setDependencias(dependenciaResponse.ok ? await dependenciaResponse.json() : [])
      setLicencias(loadedLicencias)
      reset({ ...loadedAgent, fecha_baja: loadedAgent.fecha_baja ?? "", motivo_baja: loadedAgent.motivo_baja ?? "", fecha_promocion: loadedAgent.fecha_promocion ?? "", nro: loadedAgent.nro == null ? "" : String(loadedAgent.nro), decreto_nro: loadedAgent.decreto_nro ?? "", observaciones: loadedAgent.observaciones ?? "", tipo_contratacion: loadedAgent.tipo_contratacion ?? "", categoria: loadedAgent.categoria ?? "", es_jerarquico: loadedAgent.es_jerarquico ?? "" })
    }).catch(() => setError("No se pudo cargar la información del agente."))
  }, [legajo, reset])

  const vacacionesRestantes = useMemo(() => {
    if (!agent) return 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return licencias.filter((licencia) => licencia.agenteId === agent.id && licencia.tipoLicencia.toLowerCase() === "vacaciones").reduce((total, licencia) => total + getRemainingDays(licencia.inicio, licencia.fin, today), 0)
  }, [agent, licencias])

  const onSubmit = handleSubmit(async (values) => {
    if (!agent) return
    setSaving(true)
    setError(null)
    try {
      const payload = {
        nombre: values.nombre,
        apellido: values.apellido,
        legajo: Number(values.legajo),
        dni: Number(values.dni),
        puesto: values.puesto,
        localidad: values.localidad,
        domicilio: values.domicilio,
        nro_celular: values.nro_celular,
        fecha_nacimiento: values.fecha_nacimiento,
        fecha_ingreso: values.fecha_ingreso,
        nivel_estudios: values.nivel_estudios,
        cantidad_hijos: Number(values.cantidad_hijos) || 0,
        sexo: values.sexo,
        dependencia_id: Number(values.dependencia_id) || 0,
        es_jerarquico: values.es_jerarquico || "NO",
        tipo_contratacion: values.tipo_contratacion || null,
        categoria: values.categoria || null,
        nro: values.nro ? Number(values.nro) : null,
        fecha_promocion: values.fecha_promocion || null,
        decreto_nro: values.decreto_nro || null,
        observaciones: values.observaciones || null,
        fecha_baja: values.fecha_baja || null,
        motivo_baja: values.motivo_baja || null,
      }
      const response = await apiFetch(`/agentes/${agent.legajo}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || errorData?.message || "No se pudo guardar el agente")
      }
      navigate(`/agentes/${agent.legajo}`)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar el agente")
    } finally {
      setSaving(false)
    }
  })

  if (error && !agent) return <AppLayout title="Editar agente"><p className="text-destructive">{error}</p></AppLayout>
  if (!agent) return <AppLayout title="Editar agente"><p className="text-muted-foreground">Cargando información...</p></AppLayout>

  const dependenciaNombre = dependencias.find((dependencia) => dependencia.id === agent.dependencia_id)?.nombre ?? "—"

  return (
    <AppLayout title={`Editar agente: ${agent.apellido} ${agent.nombre}`} description="Modifica la información completa del agente." actions={<Button variant="outline" onClick={() => navigate(`/agentes/${agent.legajo}`)}><ArrowLeft /> Volver al detalle</Button>}>
      <form onSubmit={onSubmit} className="mx-auto w-full max-w-5xl space-y-6">
        {error ? <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div> : null}
        <Card>
          <CardHeader><CardTitle>Información personal</CardTitle></CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Nombre" name="nombre" register={register} /><Field label="Apellido" name="apellido" register={register} /><Field label="Legajo" name="legajo" register={register} type="number" /><Field label="DNI" name="dni" register={register} type="number" /><Field label="Puesto" name="puesto" register={register} />
            <SelectField label="Sexo" name="sexo" options={["M", "F"]} register={register} /><SelectField label="Localidad" name="localidad" options={["AMERICA", "GONZALEZ MORENO", "FORTIN OLAVARRIA", "SANSINENA", "ROOSEVELT", "SUNDBLAD", "MIRA PAMPA", "SAN MAURICIO", "BADANO", "CERRITO", "CONDARCO", "VALENTIN GOMEZ", "VILLA SENA", "COLONIA EL BALDE", "OTRO"]} register={register} />
            <Field label="Domicilio" name="domicilio" register={register} /><Field label="Celular" name="nro_celular" register={register} /><Field label="Nacimiento" name="fecha_nacimiento" register={register} type="date" /><Field label="Ingreso" name="fecha_ingreso" register={register} type="date" /><Field label="Nivel de estudios" name="nivel_estudios" register={register} /><Field label="Hijos" name="cantidad_hijos" register={register} type="number" />
            <div className="space-y-2"><Label htmlFor="dependencia_id">Dependencia</Label><select id="dependencia_id" {...register("dependencia_id")} className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">{dependenciaNombre}</option>{dependencias.map((dependencia) => <option key={dependencia.id} value={dependencia.id}>{dependencia.nombre}</option>)}</select></div>
            <SelectField label="Jerárquico" name="es_jerarquico" options={["SI", "NO"]} register={register} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Datos laborales y vacaciones</CardTitle></CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <SelectField label="Tipo de contratación" name="tipo_contratacion" options={["PLANTA PERMANENTE", "JORNALIZADO", "CONTRATADO", "PLANES"]} register={register} /><Field label="Categoría" name="categoria" register={register} /><Field label="Nro." name="nro" register={register} type="number" /><Field label="Fecha de promoción" name="fecha_promocion" register={register} type="date" /><Field label="Decreto Nro." name="decreto_nro" register={register} />
            <div className="flex items-center gap-3 rounded-md border p-3"><CalendarDays className="h-5 w-5 text-emerald-600" /><div><p className="text-sm text-muted-foreground">Días de vacaciones restantes</p><p className="text-lg font-semibold">{vacacionesRestantes}</p></div></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Historial y estado</CardTitle></CardHeader>
          <CardContent className="space-y-5"><div className="grid gap-5 sm:grid-cols-2"><Field label="Fecha de baja" name="fecha_baja" register={register} type="date" /><SelectField label="Motivo de baja" name="motivo_baja" options={["BAJA", "RENUNCIA", "JUBILACION", "FALLECIMIENTO", "OTRO"]} register={register} /></div><div className="space-y-2"><Label htmlFor="observaciones">Observaciones</Label><textarea id="observaciones" {...register("observaciones")} className="min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" /></div><div className="flex items-center gap-2"><Badge variant={agent.fecha_baja ? "destructive" : "default"}>{agent.fecha_baja ? "Inactivo" : "Activo"}</Badge><span className="text-sm text-muted-foreground">{periodos.length} período(s) registrado(s)</span></div></CardContent>
        </Card>
        <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => navigate(`/agentes/${agent.legajo}`)}>Cancelar</Button><Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar modificaciones"}</Button></div>
      </form>
    </AppLayout>
  )
}
