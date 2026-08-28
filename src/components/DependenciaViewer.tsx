import * as React from "react"
import { useForm } from "react-hook-form"

import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
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
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { apiFetch } from "@/lib/api"
import type { Dependencia } from "@/types/agent"

const EMPTY_DEPENDENCIA: Dependencia = { id: 0, nombre: "" }

type FormValues = { nombre: string }

export default function DependenciaViewer({
  item,
  trigger,
  open,
  onOpenChange,
  onSave,
  onCreate,
  mode = "view",
}: {
  item?: Dependencia
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSave?: (updated: Dependencia) => void
  onCreate?: (created: Dependencia) => void
  mode?: "view" | "create"
}) {
  const isCreate = mode === "create"
  const resolvedItem = item ?? EMPTY_DEPENDENCIA
  const isMobile = useIsMobile()
  const [isSaving, setIsSaving] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
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

  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: { nombre: isCreate ? "" : resolvedItem.nombre },
  })

  const onSubmit = handleSubmit(async (values) => {
    setIsSaving(true)
    setErrorMessage(null)
    try {
      const response = await apiFetch(
        isCreate ? "/dependencias" : `/dependencias/${resolvedItem.id}`,
        {
          method: isCreate ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre: values.nombre }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(
          errorData?.error ||
            errorData?.message ||
            (isCreate ? "No se pudo crear la dependencia" : "No se pudo guardar la dependencia")
        )
      }

      const data = await response.json().catch(() => null)
      if (isCreate) {
        onCreate?.(data ?? { ...EMPTY_DEPENDENCIA, nombre: values.nombre })
      } else {
        onSave?.(data ?? { ...resolvedItem, nombre: values.nombre })
      }
      setDrawerOpen(false)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : isCreate
            ? "No se pudo crear la dependencia"
            : "No se pudo guardar la dependencia"
      )
    } finally {
      setIsSaving(false)
    }
  })

  return (
    <Drawer direction={isMobile ? "bottom" : "right"} open={drawerOpen} onOpenChange={setDrawerOpen}>
      {isControlled ? null : (
        <DrawerTrigger asChild>
          {trigger ?? (
            <Button variant="link" className="w-fit px-0 text-left text-foreground">
              {resolvedItem.nombre}
            </Button>
          )}
        </DrawerTrigger>
      )}
      <DrawerContent className="ml-auto max-w-[420px]">
        <DrawerHeader className="border-b pb-6">
          <DrawerTitle>{isCreate ? "Nueva dependencia" : "Editar dependencia"}</DrawerTitle>
          <DrawerDescription>
            {isCreate
              ? "Completa el nombre de la nueva dependencia."
              : "Modifica el nombre de la dependencia."}
          </DrawerDescription>
        </DrawerHeader>

        <div className="overflow-y-auto px-6 py-6">
          {errorMessage ? (
            <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </div>
          ) : null}
          <Field>
            <FieldLabel htmlFor="dependencia-nombre">Nombre</FieldLabel>
            <Input id="dependencia-nombre" {...register("nombre", { required: true })} />
          </Field>
        </div>

        <DrawerFooter className="border-t">
          <Button onClick={onSubmit} disabled={isSaving}>
            {isSaving ? "Guardando..." : isCreate ? "Crear dependencia" : "Guardar"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" disabled={isSaving}>
              Cancelar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
