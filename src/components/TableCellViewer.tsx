import * as React from "react"
import { Camera } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Controller,
  useForm,
  useWatch,
  type Control,
  type UseFormRegister,
} from "react-hook-form"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Agent, Dependencia } from "@/types/agent"
import { apiFetch } from "@/lib/api"

const EMPTY_AGENT: Agent = {
  id: 0,
  legajo: 0,
  dni: 0,
  apellido: "",
  nombre: "",
  puesto: "",
  dependencia_id: 0,
  domicilio: "",
  localidad: "",
  sexo: "",
  fecha_nacimiento: "",
  fecha_ingreso: "",
  nro_celular: "",
  nivel_estudios: "",
  cantidad_hijos: 0,
  fecha_baja: null,
  motivo_baja: null,
  es_jerarquico: "NO",
  tipo_contratacion: null,
  categoria: null,
  nro: null,
  fecha_promocion: null,
  decreto_nro: null,
  observaciones: null,
}

const SEXO_OPTIONS = [
  { value: "M", label: "M" },
  { value: "F", label: "F" },
]

const LOCALIDAD_OPTIONS = [
  "AMERICA",
  "GONZALEZ MORENO",
  "FORTIN OLAVARRIA",
  "SANSINENA",
  "ROOSEVELT",
  "SUNDBLAD",
  "MIRA PAMPA",
  "SAN MAURICIO",
  "BADANO",
  "CERRITO",
  "CONDARCO",
  "VALENTIN GOMEZ",
  "VILLA SENA",
  "COLONIA EL BALDE",
  "OTRO",
].map((value) => ({ value, label: value }))

const TIPO_CONTRATACION_OPTIONS = [
  "PLANTA PERMANENTE",
  "JORNALIZADO",
  "CONTRATADO",
  "PLANES",
].map((value) => ({ value, label: value }))

const MOTIVO_BAJA_OPTIONS = [
  "BAJA",
  "RENUNCIA",
  "JUBILACION",
  "FALLECIMIENTO",
  "OTRO",
].map((value) => ({ value, label: value }))

const NIVEL_ESTUDIOS_OPTIONS = [
  "PRIMARIO INCOMPLETO",
  "PRIMARIO EN CURSO",
  "PRIMARIO COMPLETO",
  "SECUNDARIO INCOMPLETO",
  "SECUNDARIO EN CURSO",
  "SECUNDARIO COMPLETO",
  "TERCIARIO INCOMPLETO",
  "TERCIARIO EN CURSO",
  "TERCIARIO COMPLETO",
  "UNIVERSITARIO INCOMPLETO",
  "UNIVERSITARIO EN CURSO",
  "UNIVERSITARIO COMPLETO",
].map((value) => ({ value, label: value }))

type FormValues = {
  nombre: string
  apellido: string
  puesto: string
  legajo: string
  dni: string
  localidad: string
  domicilio: string
  nro_celular: string
  fecha_nacimiento: string
  fecha_ingreso: string
  nivel_estudios: string
  cantidad_hijos: string
  sexo: string
  dependencia_id: string
  es_jerarquico: string
  tipo_contratacion: string
  categoria: string
  nro: string
  fecha_promocion: string
  decreto_nro: string
  observaciones: string
  fecha_baja: string
  motivo_baja: string
}

function InfoRow({
  label,
  value,
  field,
  isEditing,
  valueStr,
  registerFn,
  placeholder,
}: {
  label: string
  value: React.ReactNode
  field?: keyof FormValues
  isEditing: boolean
  valueStr?: string
  registerFn?: UseFormRegister<FormValues>
  placeholder?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b pb-2">
      <span className="text-muted-foreground">{label}</span>
      {isEditing && field ? (
        <Input
          key={`${field}-${String(value ?? "")}`}
          {...(registerFn ? registerFn(field) : {})}
          defaultValue={String(valueStr ?? value ?? "")}
          placeholder={placeholder}
          className="h-8 max-w-44"
        />
      ) : (
        <span className="font-medium">{value}</span>
      )}
    </div>
  )
}

function SelectRow({
  label,
  isEditing,
  displayValue,
  control,
  name,
  options,
  placeholder,
}: {
  label: string
  isEditing: boolean
  displayValue: React.ReactNode
  control: Control<FormValues>
  name: keyof FormValues
  options: { value: string; label: string }[]
  placeholder?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b pb-2">
      <span className="text-muted-foreground">{label}</span>
      {isEditing ? (
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <Select value={field.value || ""} onValueChange={field.onChange}>
              <SelectTrigger size="sm" className="max-w-44">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      ) : (
        <span className="font-medium">{displayValue}</span>
      )}
    </div>
  )
}

function TextAreaRow({
  label,
  value,
  field,
  isEditing,
  valueStr,
  registerFn,
}: {
  label: string
  value: React.ReactNode
  field: keyof FormValues
  isEditing: boolean
  valueStr?: string
  registerFn: UseFormRegister<FormValues>
}) {
  return (
    <div className="flex flex-col gap-2 border-b pb-2">
      <span className="text-muted-foreground">{label}</span>
      {isEditing ? (
        <textarea
          key={`${field}-${String(value ?? "")}`}
          {...registerFn(field)}
          defaultValue={String(valueStr ?? value ?? "")}
          className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      ) : (
        <span className="font-medium">{value || "—"}</span>
      )}
    </div>
  )
}

function TimelineItem({
  title,
  date,
}: {
  title: string
  date: string
}) {
  return (
    <div className="flex gap-3">

      <div className="mt-1 h-3 w-3 rounded-full bg-violet-600" />

      <div>

        <p className="font-medium">{title}</p>

        <p className="text-sm text-muted-foreground">{date}</p>

      </div>

    </div>
  )
}

export default function TableCellViewer({
  item,
  trigger,
  open,
  onOpenChange,
  onSave,
  onCreate,
  mode = "view",
  dependencias = [],
}: {
  item?: Agent
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSave?: (updatedItem: Agent) => void
  onCreate?: (newItem: Agent) => void
  mode?: "view" | "create"
  dependencias?: Dependencia[]
}) {
  const isCreate = mode === "create"
  const resolvedItem = item ?? EMPTY_AGENT
  const isMobile = useIsMobile()
  const [isEditing, setIsEditing] = React.useState(isCreate)
  const [isSaving, setIsSaving] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [currentItem, setCurrentItem] = React.useState(resolvedItem)
  const [internalOpen, setInternalOpen] = React.useState(false)
  const [periodos, setPeriodos] = React.useState<
    { fecha_ingreso: string; fecha_baja: string | null; motivo_baja: string | null }[]
  >([])
  const [uploadingFoto, setUploadingFoto] = React.useState(false)
  const [fotoError, setFotoError] = React.useState<string | null>(null)
  // In create mode there's no legajo to upload against yet, so the file is
  // held here and uploaded right after the new agente is created.
  const [selectedFotoFile, setSelectedFotoFile] = React.useState<File | null>(null)
  const fotoPreviewUrl = React.useMemo(
    () => (selectedFotoFile ? URL.createObjectURL(selectedFotoFile) : null),
    [selectedFotoFile]
  )
  React.useEffect(() => {
    return () => {
      if (fotoPreviewUrl) {
        URL.revokeObjectURL(fotoPreviewUrl)
      }
    }
  }, [fotoPreviewUrl])

  const isControlled = open !== undefined
  const drawerOpen = isControlled ? open : internalOpen
  const setDrawerOpen = React.useCallback(
    (next: boolean) => {
      if (isControlled) {
        onOpenChange?.(next)
      } else {
        setInternalOpen(next)
      }
    },
    [isControlled, onOpenChange]
  )

  const buildFormValues = React.useCallback((source: Agent): FormValues => ({
    nombre: source.nombre,
    apellido: source.apellido,
    puesto: source.puesto,
    legajo: source.legajo ? String(source.legajo) : "",
    dni: source.dni ? String(source.dni) : "",
    localidad: source.localidad,
    domicilio: source.domicilio,
    nro_celular: source.nro_celular,
    fecha_nacimiento: source.fecha_nacimiento,
    fecha_ingreso: source.fecha_ingreso,
    nivel_estudios: source.nivel_estudios,
    cantidad_hijos: String(source.cantidad_hijos ?? ""),
    sexo: source.sexo,
    dependencia_id: source.dependencia_id ? String(source.dependencia_id) : "",
    es_jerarquico: source.es_jerarquico ?? "NO",
    tipo_contratacion: source.tipo_contratacion ?? "",
    categoria: source.categoria ?? "",
    nro: source.nro !== null && source.nro !== undefined ? String(source.nro) : "",
    fecha_promocion: source.fecha_promocion ?? "",
    decreto_nro: source.decreto_nro ?? "",
    observaciones: source.observaciones ?? "",
    fecha_baja: source.fecha_baja ?? "",
    motivo_baja: source.motivo_baja ?? "",
  }), [])

  const { register, handleSubmit, reset, control, setFocus } = useForm<FormValues>({
    defaultValues: buildFormValues(resolvedItem),
  })

  const watched = useWatch<FormValues>({ control })

  React.useEffect(() => {
    reset(buildFormValues(currentItem))
  }, [currentItem, reset, buildFormValues])

  React.useEffect(() => {
    if (isEditing) {
      reset(buildFormValues(currentItem))
      setFocus("nombre")
    }
  }, [isEditing, currentItem, reset, buildFormValues, setFocus])

  // When opening the create drawer, start fresh in editing mode.
  React.useEffect(() => {
    if (isCreate && drawerOpen) {
      setCurrentItem(EMPTY_AGENT)
      setErrorMessage(null)
      setIsEditing(true)
      setSelectedFotoFile(null)
      reset(buildFormValues(EMPTY_AGENT))
    }
  }, [isCreate, drawerOpen, reset, buildFormValues])

  React.useEffect(() => {
    if (isCreate || !drawerOpen || !resolvedItem.legajo) {
      return
    }

    const cargarPeriodos = async () => {
      try {
        const response = await apiFetch(`/agentes/${resolvedItem.legajo}/periodos`)
        if (!response.ok) {
          return
        }
        setPeriodos(await response.json())
      } catch (error) {
        console.error("Error al obtener el historial del agente:", error)
      }
    }

    cargarPeriodos()
  }, [isCreate, drawerOpen, resolvedItem.legajo])

  const onSubmit = handleSubmit(async (values) => {
    setIsSaving(true)
    setErrorMessage(null)
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

      const response = await apiFetch(
        isCreate ? `/agentes` : `/agentes/${resolvedItem.legajo}`,
        {
          method: isCreate ? "POST" : "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(
          errorData?.error ||
            errorData?.message ||
            (isCreate ? "No se pudo crear el agente" : "No se pudo guardar el agente")
        )
      }

      if (isCreate) {
        const created = await response.json().catch(() => null)
        let newAgent: Agent = { ...EMPTY_AGENT, ...payload, ...(created ?? {}) }

        if (selectedFotoFile && newAgent.legajo) {
          try {
            const fotoFormData = new FormData()
            fotoFormData.append("foto", selectedFotoFile)
            const fotoResponse = await apiFetch(`/agentes/${newAgent.legajo}/foto`, {
              method: "POST",
              body: fotoFormData,
            })
            if (fotoResponse.ok) {
              newAgent = { ...newAgent, ...((await fotoResponse.json()) as Agent) }
            }
          } catch (error) {
            console.error("Error al subir la foto del nuevo agente:", error)
          }
        }

        onCreate?.(newAgent)
        setSelectedFotoFile(null)
        reset(buildFormValues(EMPTY_AGENT))
        setDrawerOpen(false)
      } else {
        const updatedAgent = { ...resolvedItem, ...payload }
        setCurrentItem(updatedAgent)
        onSave?.(updatedAgent)
        reset(buildFormValues(updatedAgent))
        setIsEditing(false)
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : isCreate
            ? "No se pudo crear el agente"
            : "No se pudo guardar el agente"
      )
    } finally {
      setIsSaving(false)
    }
  })

  const handleCancel = () => {
    setErrorMessage(null)
    if (isCreate) {
      setSelectedFotoFile(null)
      reset(buildFormValues(EMPTY_AGENT))
      setDrawerOpen(false)
    } else {
      reset(buildFormValues(resolvedItem))
      setIsEditing(false)
    }
  }

  const handleFotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) {
      return
    }

    // No legajo yet to upload against - hold onto the file and upload it
    // right after the agente is created (see onSubmit).
    if (isCreate) {
      setFotoError(null)
      setSelectedFotoFile(file)
      return
    }

    if (!resolvedItem.legajo) {
      return
    }

    setUploadingFoto(true)
    setFotoError(null)
    try {
      const formData = new FormData()
      formData.append("foto", file)

      const response = await apiFetch(`/agentes/${resolvedItem.legajo}/foto`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || "No se pudo subir la foto")
      }

      const updated = (await response.json()) as Agent
      setCurrentItem(updated)
      onSave?.(updated)
    } catch (error) {
      setFotoError(error instanceof Error ? error.message : "No se pudo subir la foto")
    } finally {
      setUploadingFoto(false)
    }
  }

  const displayNombre = isEditing ? watched?.nombre ?? currentItem.nombre : currentItem.nombre
  const displayApellido = isEditing ? watched?.apellido ?? currentItem.apellido : currentItem.apellido

  const dependenciaOptions = React.useMemo(
    () => dependencias.map((dep) => ({ value: String(dep.id), label: dep.nombre })),
    [dependencias]
  )
  const dependenciaNombre =
    dependencias.find((dep) => dep.id === currentItem.dependencia_id)?.nombre ??
    (currentItem.dependencia_id ? String(currentItem.dependencia_id) : "—")

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={drawerOpen}
      onOpenChange={setDrawerOpen}
    >
      {isControlled ? null : (
        <DrawerTrigger asChild>
          {trigger ?? (
            <Button variant="link" className="w-fit gap-2 px-0 text-left text-foreground">
              {resolvedItem.foto_url ? (
                <img
                  src={resolvedItem.foto_url}
                  alt=""
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : null}
              {resolvedItem.apellido} {resolvedItem.nombre}
            </Button>
          )}
        </DrawerTrigger>
      )}
      <DrawerContent className="max-w-[500px] ml-auto">
        <DrawerHeader className="border-b pb-6">
              <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {fotoPreviewUrl || currentItem.foto_url ? (
                <img
                  src={fotoPreviewUrl ?? currentItem.foto_url ?? undefined}
                  alt=""
                  className="h-14 w-14 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-lg font-bold text-violet-700">
                  {(displayNombre?.[0] ?? "") || (isCreate ? "+" : "")}
                  {displayApellido?.[0] ?? ""}
                </div>
              )}
              <label className="absolute -bottom-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border bg-background text-muted-foreground hover:bg-muted">
                <Camera className="h-3 w-3" />
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={uploadingFoto}
                  onChange={handleFotoChange}
                />
              </label>
            </div>
            <div>
              <DrawerTitle className="text-xl">
                {isCreate
                  ? "Nuevo agente"
                  : `${displayApellido} ${displayNombre}`}
              </DrawerTitle>
              <DrawerDescription>
                {isCreate
                  ? "Complete los datos del nuevo agente"
                  : isEditing
                    ? watched?.puesto ?? currentItem.puesto
                    : currentItem.puesto}
              </DrawerDescription>
              {uploadingFoto ? (
                <p className="mt-1 text-xs text-muted-foreground">Subiendo foto...</p>
              ) : fotoError ? (
                <p className="mt-1 text-xs text-destructive">{fotoError}</p>
              ) : isCreate && selectedFotoFile ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Foto seleccionada: {selectedFotoFile.name}
                </p>
              ) : null}
            </div>
          </div>
        </DrawerHeader>

        <div className="overflow-y-auto px-6 py-6">
          <div className="space-y-6">
            <section>
              <h3 className="mb-4 text-sm font-semibold uppercase text-muted-foreground">Información personal</h3>

              {errorMessage ? (
                <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {errorMessage}
                </div>
              ) : null}

              <div className="space-y-4">
                <InfoRow label="Nombre" value={currentItem.nombre} field="nombre" isEditing={isEditing} valueStr={watched?.nombre} registerFn={register} />
                <InfoRow label="Apellido" value={currentItem.apellido} field="apellido" isEditing={isEditing} valueStr={watched?.apellido} registerFn={register} />
                <InfoRow label="Legajo" value={currentItem.legajo} field="legajo" isEditing={isEditing} valueStr={watched?.legajo} registerFn={register} />
                <InfoRow label="DNI" value={currentItem.dni} field="dni" isEditing={isEditing} valueStr={watched?.dni} registerFn={register} />
                <InfoRow label="Puesto" value={currentItem.puesto} field="puesto" isEditing={isEditing} valueStr={watched?.puesto} registerFn={register} />
                <SelectRow
                  label="Sexo"
                  isEditing={isEditing}
                  displayValue={currentItem.sexo}
                  control={control}
                  name="sexo"
                  options={SEXO_OPTIONS}
                  placeholder="Seleccionar"
                />
                <SelectRow
                  label="Localidad"
                  isEditing={isEditing}
                  displayValue={currentItem.localidad}
                  control={control}
                  name="localidad"
                  options={LOCALIDAD_OPTIONS}
                  placeholder="Seleccionar"
                />
                <InfoRow label="Domicilio" value={currentItem.domicilio} field="domicilio" isEditing={isEditing} valueStr={watched?.domicilio} registerFn={register} />
                <InfoRow label="Celular" value={currentItem.nro_celular} field="nro_celular" isEditing={isEditing} valueStr={watched?.nro_celular} registerFn={register} />
                <InfoRow label="Nacimiento" value={currentItem.fecha_nacimiento} field="fecha_nacimiento" isEditing={isEditing} valueStr={watched?.fecha_nacimiento} registerFn={register} placeholder="AAAA-MM-DD" />
                <InfoRow label="Ingreso" value={currentItem.fecha_ingreso} field="fecha_ingreso" isEditing={isEditing} valueStr={watched?.fecha_ingreso} registerFn={register} placeholder="AAAA-MM-DD" />
                <SelectRow
                  label="Nivel"
                  isEditing={isEditing}
                  displayValue={currentItem.nivel_estudios}
                  control={control}
                  name="nivel_estudios"
                  options={NIVEL_ESTUDIOS_OPTIONS}
                  placeholder="Seleccionar"
                />
                <InfoRow label="Hijos" value={currentItem.cantidad_hijos} field="cantidad_hijos" isEditing={isEditing} valueStr={watched?.cantidad_hijos} registerFn={register} />
                <SelectRow
                  label="Dependencia"
                  isEditing={isEditing}
                  displayValue={dependenciaNombre}
                  control={control}
                  name="dependencia_id"
                  options={dependenciaOptions}
                  placeholder="Seleccionar"
                />
                <SelectRow
                  label="Jerárquico"
                  isEditing={isEditing}
                  displayValue={currentItem.es_jerarquico}
                  control={control}
                  name="es_jerarquico"
                  options={[
                    { value: "SI", label: "SI" },
                    { value: "NO", label: "NO" },
                  ]}
                  placeholder="Seleccionar"
                />
              </div>
            </section>

            <section>
              <h3 className="mb-4 text-sm font-semibold uppercase text-muted-foreground">Datos laborales</h3>
              <div className="space-y-4">
                <SelectRow
                  label="Tipo de contratación"
                  isEditing={isEditing}
                  displayValue={currentItem.tipo_contratacion || "—"}
                  control={control}
                  name="tipo_contratacion"
                  options={TIPO_CONTRATACION_OPTIONS}
                  placeholder="Seleccionar"
                />
                <InfoRow label="Categoría" value={currentItem.categoria || "—"} field="categoria" isEditing={isEditing} valueStr={watched?.categoria} registerFn={register} />
                <InfoRow label="Nro." value={currentItem.nro ?? "—"} field="nro" isEditing={isEditing} valueStr={watched?.nro} registerFn={register} />
                <InfoRow label="Fecha de promoción" value={currentItem.fecha_promocion || "—"} field="fecha_promocion" isEditing={isEditing} valueStr={watched?.fecha_promocion} registerFn={register} placeholder="AAAA-MM-DD" />
                <InfoRow label="Decreto Nro." value={currentItem.decreto_nro || "—"} field="decreto_nro" isEditing={isEditing} valueStr={watched?.decreto_nro} registerFn={register} />
                <TextAreaRow label="Observaciones" value={currentItem.observaciones} field="observaciones" isEditing={isEditing} valueStr={watched?.observaciones} registerFn={register} />
              </div>
            </section>

            {isCreate ? null : (
              <>
                <section>
                  <h3 className="mb-4 text-sm font-semibold uppercase text-muted-foreground">Estado</h3>
                  {isEditing ? (
                    <div className="space-y-4">
                      <InfoRow
                        label="Fecha de baja"
                        value={currentItem.fecha_baja || "—"}
                        field="fecha_baja"
                        isEditing={isEditing}
                        valueStr={watched?.fecha_baja}
                        registerFn={register}
                        placeholder="AAAA-MM-DD"
                      />
                      <SelectRow
                        label="Motivo de baja"
                        isEditing={isEditing}
                        displayValue={currentItem.motivo_baja || "—"}
                        control={control}
                        name="motivo_baja"
                        options={MOTIVO_BAJA_OPTIONS}
                        placeholder="Seleccionar"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Badge className={currentItem.fecha_baja ? "bg-red-500" : "bg-green-500"}>
                        {currentItem.fecha_baja ? "Inactivo" : "Activo"}
                      </Badge>
                      {currentItem.fecha_baja ? (
                        <div className="flex items-center justify-between gap-3 border-b pb-2">
                          <span className="text-muted-foreground">Motivo</span>
                          <span className="font-medium">{currentItem.motivo_baja || "—"}</span>
                        </div>
                      ) : null}
                    </div>
                  )}
                </section>

                <section>
                  <h3 className="mb-4 text-sm font-semibold uppercase text-muted-foreground">Historial</h3>
                  <div className="space-y-4">
                    {periodos.length > 0 ? (
                      periodos.map((periodo, index) => (
                        <React.Fragment key={`${periodo.fecha_ingreso}-${index}`}>
                          <TimelineItem
                            title={periodos.length > 1 ? `Alta (período ${index + 1})` : "Alta del agente"}
                            date={periodo.fecha_ingreso}
                          />
                          {periodo.fecha_baja ? (
                            <TimelineItem
                              title={periodo.motivo_baja ? `Baja — ${periodo.motivo_baja}` : "Baja"}
                              date={periodo.fecha_baja}
                            />
                          ) : null}
                        </React.Fragment>
                      ))
                    ) : (
                      <TimelineItem title="Alta del agente" date={resolvedItem.fecha_ingreso} />
                    )}
                  </div>
                </section>
              </>
            )}

          </div>
        </div>

        <DrawerFooter className="border-t">
          {isEditing ? (
            <>
              <Button onClick={onSubmit} disabled={isSaving}>
                {isSaving ? "Guardando..." : isCreate ? "Crear agente" : "Guardar"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancelar
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setIsEditing(true)}>Editar agente</Button>
              <DrawerClose asChild>
                <Button variant="outline">Cerrar</Button>
              </DrawerClose>
            </>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
