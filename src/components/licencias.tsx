import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { UploadCloud } from "lucide-react"

import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Field, FieldLabel } from "@/components/ui/field"
import { apiFetch } from "@/lib/api"
import { fetchLicencia } from "@/lib/licencias"
import type { Agent } from "@/types/agent"

const licenciaTipos = [
  "Dia particular",
  "Enfermedad",
  "Maternidad",
  "Vacaciones",
  "Examen",
  "Cuidado de Familiar",
  "Licencia por Fallecimiento",
  "licencia por matrimonio",
  "licencia por accidente",
]

export default function CrearLicencias() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get("id")

  const [agentes, setAgentes] = useState<Agent[]>([])
  const [empleadoId, setEmpleadoId] = useState("")
  const [empleadoSearch, setEmpleadoSearch] = useState("")
  const [empleadoOpen, setEmpleadoOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [tipoLicencia, setTipoLicencia] = useState("")
  const [inicio, setInicio] = useState("")
  const [fin, setFin] = useState("")
  const [archivo, setArchivo] = useState<File | null>(null)
  const [archivoActual, setArchivoActual] = useState<{ nombre: string; url: string | null } | null>(null)
  const [observaciones, setObservaciones] = useState("")
  const [guardando, setGuardando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [errors, setErrors] = useState<{
    empleado?: string
    tipoLicencia?: string
    inicio?: string
    fin?: string
  }>({})
  const empleadoFieldRef = useRef<HTMLDivElement | null>(null)

  const agentesFiltrados = useMemo(() => {
    const term = empleadoSearch.trim().toLowerCase()
    if (!term) {
      return agentes
    }

    return agentes.filter((agente) => {
      const nombreCompleto = `${agente.apellido} ${agente.nombre}`.toLowerCase()
      return (
        nombreCompleto.includes(term) ||
        agente.legajo.toString().includes(term)
      )
    })
  }, [agentes, empleadoSearch])

  const selectedEmpleado = useMemo(
    () => agentes.find((agente) => String(agente.id) === empleadoId),
    [agentes, empleadoId]
  )

  useEffect(() => {
    if (!empleadoOpen) {
      return
    }

    setHighlightedIndex(0)
  }, [agentesFiltrados, empleadoOpen])

  useEffect(() => {
    const fetchAgentes = async () => {
      try {
        const response = await apiFetch("/agentes")
        if (!response.ok) {
          throw new Error("Error al obtener los agentes")
        }
        setAgentes(await response.json())
      } catch (error) {
        console.error("Error al obtener los agentes:", error)
      }
    }

    fetchAgentes()
  }, [])

  useEffect(() => {
    if (!editId) {
      return
    }

    const cargarLicencia = async () => {
      try {
        const licencia = await fetchLicencia(Number(editId))
        setEmpleadoId(String(licencia.agenteId))
        setEmpleadoSearch(licencia.empleado)
        setTipoLicencia(licencia.tipoLicencia)
        setInicio(licencia.inicio)
        setFin(licencia.fin)
        setObservaciones(licencia.observaciones)
        setArchivoActual(
          licencia.archivoNombre
            ? { nombre: licencia.archivoNombre, url: licencia.archivoUrl }
            : null
        )
      } catch (error) {
        console.error("Error al obtener la licencia:", error)
        setErrorEnvio("No se pudo cargar la licencia a editar.")
      }
    }

    cargarLicencia()
  }, [editId])

  const totalDias = useMemo(() => {
    if (!inicio || !fin) {
      return ""
    }

    const fechaInicio = new Date(inicio)
    const fechaFin = new Date(fin)

    if (Number.isNaN(fechaInicio.getTime()) || Number.isNaN(fechaFin.getTime())) {
      return ""
    }

    const diferencia = Math.floor(
      (fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)
    )

    return diferencia >= 0 ? String(diferencia + 1) : ""
  }, [inicio, fin])

  const hoy = new Date().toISOString().slice(0, 10)

  const guardarSolicitud = async () => {
    const validationErrors: typeof errors = {}

    if (!selectedEmpleado) {
      validationErrors.empleado = "Selecciona un empleado válido"
    }

    if (!tipoLicencia) {
      validationErrors.tipoLicencia = "Selecciona el tipo de licencia"
    }

    if (!inicio) {
      validationErrors.inicio = "Ingresa la fecha de inicio"
    }

    if (!fin) {
      validationErrors.fin = "Ingresa la fecha de finalización"
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const formData = new FormData()
    if (!editId) {
      formData.append("agenteId", String(selectedEmpleado!.id))
    }
    formData.append("tipoLicencia", tipoLicencia)
    formData.append("inicio", inicio)
    formData.append("fin", fin)
    formData.append("observaciones", observaciones)
    if (archivo) {
      formData.append("archivo", archivo)
    }

    setGuardando(true)
    setErrorEnvio(null)
    setMensaje(null)

    try {
      const response = await apiFetch(editId ? `/licencias/${editId}` : "/licencias", {
        method: editId ? "PUT" : "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "No se pudo guardar la licencia")
      }

      if (editId) {
        navigate("/ver-licencias")
        return
      }

      setEmpleadoId("")
      setEmpleadoSearch("")
      setTipoLicencia("")
      setInicio("")
      setFin("")
      setArchivo(null)
      setObservaciones("")
      setErrors({})
      setMensaje("Licencia guardada correctamente.")
    } catch (error) {
      setErrorEnvio(error instanceof Error ? error.message : String(error))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <AppLayout
      title={editId ? "Editar licencia" : "Crear licencias"}
      description={
        editId
          ? "Modifica los datos de la licencia existente."
          : "Completa los datos de la solicitud de licencia."
      }
      actions={
        <>
          <Button variant="default" size="sm" onClick={guardarSolicitud} disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar Solicitud"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (editId) {
                navigate("/ver-licencias")
                return
              }
              setEmpleadoId("")
              setEmpleadoSearch("")
              setTipoLicencia("")
              setInicio("")
              setFin("")
              setArchivo(null)
              setObservaciones("")
              setErrors({})
              setErrorEnvio(null)
              setMensaje(null)
            }}
          >
            Cancelar
          </Button>
        </>
      }
    >
      {errorEnvio ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorEnvio}
        </div>
      ) : null}

      {mensaje ? (
        <div className="rounded-md border border-primary/50 bg-primary/10 px-4 py-3 text-sm text-primary">
          {mensaje}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
        <Card className="overflow-hidden">
          <CardHeader className="gap-2">
            <CardTitle className="text-xl font-semibold">Datos de la Solicitud</CardTitle>
            <CardDescription>Completa los datos de la solicitud de licencia.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <Field>
              <FieldLabel>Seleccionar Empleado</FieldLabel>
              <div className="relative" ref={empleadoFieldRef}>
                {errors.empleado ? (
                  <p className="text-sm text-destructive">{errors.empleado}</p>
                ) : null}
                <Input
                  value={
                    empleadoSearch ||
                    (selectedEmpleado
                      ? `${selectedEmpleado.apellido.toUpperCase()} ${selectedEmpleado.nombre} - ${selectedEmpleado.legajo}`
                      : "")
                  }
                  onChange={(event) => {
                    setEmpleadoSearch(event.target.value)
                    setEmpleadoId("")
                    setEmpleadoOpen(true)
                    setErrors((current) => ({ ...current, empleado: undefined }))
                  }}
                  onFocus={() => setEmpleadoOpen(true)}
                  onBlur={(event) => {
                    const next = event.relatedTarget as HTMLElement | null
                    if (next && empleadoFieldRef.current?.contains(next)) {
                      return
                    }
                    setEmpleadoOpen(false)
                  }}
                  onKeyDown={(event) => {
                    if (!empleadoOpen || agentesFiltrados.length === 0) {
                      return
                    }
  
                    if (event.key === "ArrowDown") {
                      event.preventDefault()
                      setHighlightedIndex((current) =>
                        current === agentesFiltrados.length - 1 ? 0 : current + 1
                      )
                    }
  
                    if (event.key === "ArrowUp") {
                      event.preventDefault()
                      setHighlightedIndex((current) =>
                        current === 0 ? agentesFiltrados.length - 1 : current - 1
                      )
                    }
  
                    if (event.key === "Enter") {
                      event.preventDefault()
                      const agente = agentesFiltrados[highlightedIndex]
                      if (agente) {
                        setEmpleadoId(String(agente.id))
                        setEmpleadoSearch(
                          `${agente.apellido.toUpperCase()} ${agente.nombre} - ${agente.legajo}`
                        )
                        setEmpleadoOpen(false)
                      }
                    }
  
                    if (event.key === "Escape") {
                      setEmpleadoOpen(false)
                    }
                  }}
                  placeholder="Buscar por apellido, nombre o legajo"
                  className="h-12"
                  disabled={!!editId}
                />

                {empleadoOpen && !editId && (
                  <div className="absolute left-0 top-full z-50 mt-1 max-h-72 w-full overflow-hidden overflow-y-auto rounded-xl border border-border bg-popover text-popover-foreground shadow-xl">
                    {agentesFiltrados.length === 0 ? (
                      <div className="p-3 text-sm text-muted-foreground">
                        No hay coincidencias.
                      </div>
                    ) : (
                      agentesFiltrados.map((agente, index) => {
                        const label = `${agente.apellido.toUpperCase()} ${agente.nombre} - ${agente.legajo}`
                        const highlighted = index === highlightedIndex
                        return (
                          <button
                            key={agente.id}
                            type="button"
                            className={`w-full px-3 py-2 text-left text-sm transition ${
                              highlighted ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                            }`}
                            onClick={() => {
                              setEmpleadoId(String(agente.id))
                              setEmpleadoSearch(label)
                              setEmpleadoOpen(false)
                            }}
                            onMouseEnter={() => setHighlightedIndex(index)}
                          >
                            {label}
                          </button>
                        )
                      })
                    )}
                  </div>
                )}
              </div>
            </Field>
  
            <Field>
              <FieldLabel>Tipo de Licencia</FieldLabel>
              {errors.tipoLicencia ? (
                <p className="text-sm text-destructive">{errors.tipoLicencia}</p>
              ) : null}
              <Select
                value={tipoLicencia}
                onValueChange={(value) => {
                  setTipoLicencia(value)
                  setErrors((current) => ({ ...current, tipoLicencia: undefined }))
                }}
              >
                <SelectTrigger className="w-full h-12">
                  <SelectValue placeholder="Elegir licencia" />
                </SelectTrigger>
                <SelectContent>
                  {licenciaTipos.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
  
            <div className="rounded-3xl border border-dashed border-border p-6 text-center">
              <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">
                Subir certificado médico o documentación... (máx 10MB, PDF/JPG)
              </p>
              <label className="mt-5 inline-flex cursor-pointer items-center justify-center rounded-lg border border-input px-4 py-2 text-sm hover:bg-muted">
                <input
                  type="file"
                  className="sr-only"
                  accept=".pdf,.jpg,.jpeg"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) {
                      setArchivo(file)
                    }
                  }}
                />
                Seleccionar archivo
              </label>
              {archivo ? (
                <p className="mt-3 text-sm text-foreground">{archivo.name}</p>
              ) : archivoActual ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  Archivo actual:{" "}
                  {archivoActual.url ? (
                    <a
                      href={archivoActual.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline"
                    >
                      {archivoActual.nombre}
                    </a>
                  ) : (
                    archivoActual.nombre
                  )}
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>
  
        <div className="grid gap-6">
          <Card className="overflow-hidden">
            <CardHeader className="gap-2">
              <CardTitle className="text-xl font-semibold">Fechas y Períodos</CardTitle>
              <CardDescription>Calcula los días corridos de la licencia.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel>Fecha de Inicio</FieldLabel>
                  {errors.inicio ? (
                    <p className="text-sm text-destructive">{errors.inicio}</p>
                  ) : null}
                  <Input
                    type="date"
                    className="h-12"
                    value={inicio}
                    onChange={(event) => {
                      setInicio(event.target.value)
                      setErrors((current) => ({ ...current, inicio: undefined }))
                    }}
                  />
                </Field>
                <Field>
                  <FieldLabel>Fecha de Fin</FieldLabel>
                  {errors.fin ? (
                    <p className="text-sm text-destructive">{errors.fin}</p>
                  ) : null}
                  <Input
                    type="date"
                    className="h-12"
                    value={fin}
                    min={hoy}
                    onChange={(event) => {
                      setFin(event.target.value)
                      setErrors((current) => ({ ...current, fin: undefined }))
                    }}
                  />
                </Field>
              </div>
  
              <Field>
                <FieldLabel>Total Días Corridos</FieldLabel>
                <Input
                  className="h-12 bg-muted/50"
                  value={totalDias || "-"}
                  readOnly
                />
              </Field>
            </CardContent>
          </Card>
  
          <Card className="overflow-hidden">
            <CardHeader className="gap-2">
              <CardTitle className="text-xl font-semibold">Observaciones</CardTitle>
              <CardDescription>Notas adicionales sobre la licencia.</CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                className="min-h-[160px] w-full rounded-lg border border-input bg-transparent px-3 py-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                placeholder="Notas o Observaciones"
                value={observaciones}
                onChange={(event) => setObservaciones(event.target.value)}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
