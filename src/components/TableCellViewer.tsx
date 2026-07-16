import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useForm, useWatch, type UseFormRegister } from "react-hook-form"
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
import type { Agent } from "@/types/agent"

const API_BASE = "https://presentismo-backend.vercel.app/api"

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
}

function InfoRow({
  label,
  value,
  field,
  isEditing,
  valueStr,
  registerFn,
}: {
  label: string
  value: React.ReactNode
  field?: keyof FormValues
  isEditing: boolean
  valueStr?: string
  registerFn?: UseFormRegister<FormValues>
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b pb-2">
      <span className="text-muted-foreground">{label}</span>
      {isEditing && field ? (
        <Input
          key={`${field}-${String(value ?? "")}`}
          {...(registerFn ? registerFn(field) : {})}
          defaultValue={String(valueStr ?? value ?? "")}
          className="h-8 max-w-44"
        />
      ) : (
        <span className="font-medium">{value}</span>
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
}: {
  item: Agent
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSave?: (updatedItem: Agent) => void
}) {
  const isMobile = useIsMobile()
  const [isEditing, setIsEditing] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [currentItem, setCurrentItem] = React.useState(item)

  const buildFormValues = React.useCallback((source: Agent): FormValues => ({
    nombre: source.nombre,
    apellido: source.apellido,
    puesto: source.puesto,
    legajo: String(source.legajo),
    dni: String(source.dni),
    localidad: source.localidad,
    domicilio: source.domicilio,
    nro_celular: source.nro_celular,
    fecha_nacimiento: source.fecha_nacimiento,
    fecha_ingreso: source.fecha_ingreso,
    nivel_estudios: source.nivel_estudios,
    cantidad_hijos: String(source.cantidad_hijos),
  }), [])

  const { register, handleSubmit, reset, control, setFocus } = useForm<FormValues>({
    defaultValues: buildFormValues(item),
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

  const onSubmit = handleSubmit(async (values) => {
    setIsSaving(true)
    setErrorMessage(null)
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) throw new Error("No hay sesión activa")

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
      }

      const response = await fetch(`${API_BASE}/agentes/${item.legajo}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || errorData?.message || "No se pudo guardar el agente")
      }

      const updatedAgent = {
        ...item,
        ...payload,
      }

      setCurrentItem(updatedAgent)
      onSave?.(updatedAgent)
      reset(buildFormValues(updatedAgent))
      setIsEditing(false)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo guardar el agente")
    } finally {
      setIsSaving(false)
    }
  })

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={open}
      onOpenChange={onOpenChange}
    >
      {onOpenChange ? null : (
        <DrawerTrigger asChild>
          {trigger ?? (
            <Button variant="link" className="w-fit px-0 text-left text-foreground">
              {item.apellido} {item.nombre}
            </Button>
          )}
        </DrawerTrigger>
      )}
      <DrawerContent className="max-w-[500px] ml-auto">
        <DrawerHeader className="border-b pb-6">
              <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-lg font-bold text-violet-700">
              {currentItem.nombre[0]}
              {currentItem.apellido[0]}
            </div>
            <div>
              <DrawerTitle className="text-xl">
                {isEditing ? `${watched?.apellido ?? currentItem.apellido} ${watched?.nombre ?? currentItem.nombre}` : `${currentItem.apellido} ${currentItem.nombre}`}
              </DrawerTitle>
              <DrawerDescription>
                {isEditing ? watched?.puesto ?? currentItem.puesto : currentItem.puesto}
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
                <InfoRow label="Localidad" value={currentItem.localidad} field="localidad" isEditing={isEditing} valueStr={watched?.localidad} registerFn={register} />
                <InfoRow label="Domicilio" value={currentItem.domicilio} field="domicilio" isEditing={isEditing} valueStr={watched?.domicilio} registerFn={register} />
                <InfoRow label="Celular" value={currentItem.nro_celular} field="nro_celular" isEditing={isEditing} valueStr={watched?.nro_celular} registerFn={register} />
                <InfoRow label="Nacimiento" value={currentItem.fecha_nacimiento} field="fecha_nacimiento" isEditing={isEditing} valueStr={watched?.fecha_nacimiento} registerFn={register} />
                <InfoRow label="Ingreso" value={currentItem.fecha_ingreso} field="fecha_ingreso" isEditing={isEditing} valueStr={watched?.fecha_ingreso} registerFn={register} />
                <InfoRow label="Nivel" value={currentItem.nivel_estudios} field="nivel_estudios" isEditing={isEditing} valueStr={watched?.nivel_estudios} registerFn={register} />
                <InfoRow label="Hijos" value={currentItem.cantidad_hijos} field="cantidad_hijos" isEditing={isEditing} valueStr={watched?.cantidad_hijos} registerFn={register} />
              </div>
            </section>

            <section>
              <h3 className="mb-4 text-sm font-semibold uppercase text-muted-foreground">Estado</h3>
              <Badge className="bg-green-500">Activo</Badge>
            </section>

            <section>
              <h3 className="mb-4 text-sm font-semibold uppercase text-muted-foreground">Historial</h3>
              <div className="space-y-4">
                <TimelineItem title="Alta del agente" date={item.fecha_ingreso} />
                <TimelineItem title="Última actualización" date="Hace 2 días" />
              </div>
            </section>

          </div>
        </div>

        <DrawerFooter className="border-t">
          {isEditing ? (
            <>
              <Button onClick={onSubmit} disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  reset({
                    nombre: item.nombre,
                    apellido: item.apellido,
                    puesto: item.puesto,
                    legajo: String(item.legajo),
                    dni: String(item.dni),
                    localidad: item.localidad,
                    domicilio: item.domicilio,
                    nro_celular: item.nro_celular,
                    fecha_nacimiento: item.fecha_nacimiento,
                    fecha_ingreso: item.fecha_ingreso,
                    nivel_estudios: item.nivel_estudios,
                    cantidad_hijos: String(item.cantidad_hijos),
                  })
                  setErrorMessage(null)
                  setIsEditing(false)
                }}
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
