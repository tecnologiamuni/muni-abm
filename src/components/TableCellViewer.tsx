import * as React from "react"
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
      reset(buildFormValues(EMPTY_AGENT))
    }
  }, [isCreate, drawerOpen, reset, buildFormValues])

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
        const newAgent: Agent = { ...EMPTY_AGENT, ...payload, ...(created ?? {}) }
        onCreate?.(newAgent)
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
      reset(buildFormValues(EMPTY_AGENT))
      setDrawerOpen(false)
    } else {
      reset(buildFormValues(resolvedItem))
      setIsEditing(false)
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
            <Button variant="link" className="w-fit px-0 text-left text-foreground">
              {resolvedItem.apellido} {resolvedItem.nombre}
            </Button>
          )}
        </DrawerTrigger>
      )}
      <DrawerContent className="max-w-[500px] ml-auto">
        <DrawerHeader className="border-b pb-6">
              <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-lg font-bold text-violet-700">
              {(displayNombre?.[0] ?? "") || (isCreate ? "+" : "")}
              {displayApellido?.[0] ?? ""}
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

            {isCreate ? null : (
              <>
                <section>
                  <h3 className="mb-4 text-sm font-semibold uppercase text-muted-foreground">Estado</h3>
                  <Badge className="bg-green-500">Activo</Badge>
                </section>

                <section>
                  <h3 className="mb-4 text-sm font-semibold uppercase text-muted-foreground">Historial</h3>
                  <div className="space-y-4">
                    <TimelineItem title="Alta del agente" date={resolvedItem.fecha_ingreso} />
                    <TimelineItem title="Última actualización" date="Hace 2 días" />
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
