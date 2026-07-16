import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

function InfoRow({
  label,
  value,
  field,
  isEditing,
  valueStr,
  onChange,
  firstInputRef,
}: {
  label: string
  value: React.ReactNode
  field?: string
  isEditing: boolean
  valueStr?: string
  onChange?: (field: string, value: string) => void
  firstInputRef?: React.RefObject<HTMLInputElement | null>
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b pb-2">
      <span className="text-muted-foreground">{label}</span>
      {isEditing && field ? (
        <Input
          ref={field === "nombre" ? (firstInputRef as any) : undefined}
          value={String(valueStr ?? "")}
          onChange={(event) => onChange?.(field, event.target.value)}
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
  const firstInputRef = React.useRef<HTMLInputElement | null>(null)
  const [formData, setFormData] = React.useState({
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

  const syncFromItem = React.useCallback((source: Agent) => {
    setCurrentItem(source)
    setFormData({
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
    })
  }, [])

  React.useEffect(() => {
    syncFromItem(item)
    setIsEditing(false)
    setErrorMessage(null)
  }, [item, syncFromItem])

  React.useEffect(() => {
    if (isEditing) {
      requestAnimationFrame(() => {
        firstInputRef.current?.focus()
      })
    }
  }, [isEditing])

  const handleSave = async () => {
    setIsSaving(true)
    setErrorMessage(null)

    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        throw new Error("No hay sesión activa")
      }

      const payload = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        legajo: Number(formData.legajo),
        dni: Number(formData.dni),
        puesto: formData.puesto,
        localidad: formData.localidad,
        domicilio: formData.domicilio,
        nro_celular: formData.nro_celular,
        fecha_nacimiento: formData.fecha_nacimiento,
        fecha_ingreso: formData.fecha_ingreso,
        nivel_estudios: formData.nivel_estudios,
        cantidad_hijos: Number(formData.cantidad_hijos) || 0,
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
        ...currentItem,
        ...payload,
      }

      setCurrentItem(updatedAgent)
      onSave?.(updatedAgent)
      setIsEditing(false)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "No se pudo guardar el agente"
      )
    } finally {
      setIsSaving(false)
    }
  }

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
              {item.nombre[0]}
              {item.apellido[0]}
            </div>
            <div>
              <DrawerTitle className="text-xl">
                {isEditing ? `${formData.apellido} ${formData.nombre}` : `${currentItem.apellido} ${currentItem.nombre}`}
              </DrawerTitle>
              <DrawerDescription>
                {isEditing ? formData.puesto : currentItem.puesto}
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
                <InfoRow label="Nombre" value={currentItem.nombre} field="nombre" isEditing={isEditing} valueStr={formData.nombre} onChange={(field, val) => setFormData((c) => ({ ...c, [field]: val }))} firstInputRef={firstInputRef} />
                <InfoRow label="Apellido" value={currentItem.apellido} field="apellido" isEditing={isEditing} valueStr={formData.apellido} onChange={(field, val) => setFormData((c) => ({ ...c, [field]: val }))} firstInputRef={firstInputRef} />
                <InfoRow label="Legajo" value={currentItem.legajo} field="legajo" isEditing={isEditing} valueStr={formData.legajo} onChange={(field, val) => setFormData((c) => ({ ...c, [field]: val }))} firstInputRef={firstInputRef} />
                <InfoRow label="DNI" value={currentItem.dni} field="dni" isEditing={isEditing} valueStr={formData.dni} onChange={(field, val) => setFormData((c) => ({ ...c, [field]: val }))} firstInputRef={firstInputRef} />
                <InfoRow label="Puesto" value={currentItem.puesto} field="puesto" isEditing={isEditing} valueStr={formData.puesto} onChange={(field, val) => setFormData((c) => ({ ...c, [field]: val }))} firstInputRef={firstInputRef} />
                <InfoRow label="Localidad" value={currentItem.localidad} field="localidad" isEditing={isEditing} valueStr={formData.localidad} onChange={(field, val) => setFormData((c) => ({ ...c, [field]: val }))} firstInputRef={firstInputRef} />
                <InfoRow label="Domicilio" value={currentItem.domicilio} field="domicilio" isEditing={isEditing} valueStr={formData.domicilio} onChange={(field, val) => setFormData((c) => ({ ...c, [field]: val }))} firstInputRef={firstInputRef} />
                <InfoRow label="Celular" value={currentItem.nro_celular} field="nro_celular" isEditing={isEditing} valueStr={formData.nro_celular} onChange={(field, val) => setFormData((c) => ({ ...c, [field]: val }))} firstInputRef={firstInputRef} />
                <InfoRow label="Nacimiento" value={currentItem.fecha_nacimiento} field="fecha_nacimiento" isEditing={isEditing} valueStr={formData.fecha_nacimiento} onChange={(field, val) => setFormData((c) => ({ ...c, [field]: val }))} firstInputRef={firstInputRef} />
                <InfoRow label="Ingreso" value={currentItem.fecha_ingreso} field="fecha_ingreso" isEditing={isEditing} valueStr={formData.fecha_ingreso} onChange={(field, val) => setFormData((c) => ({ ...c, [field]: val }))} firstInputRef={firstInputRef} />
                <InfoRow label="Nivel" value={currentItem.nivel_estudios} field="nivel_estudios" isEditing={isEditing} valueStr={formData.nivel_estudios} onChange={(field, val) => setFormData((c) => ({ ...c, [field]: val }))} firstInputRef={firstInputRef} />
                <InfoRow label="Hijos" value={currentItem.cantidad_hijos} field="cantidad_hijos" isEditing={isEditing} valueStr={formData.cantidad_hijos} onChange={(field, val) => setFormData((c) => ({ ...c, [field]: val }))} firstInputRef={firstInputRef} />
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
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setFormData({
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
