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
} from "@/components/ui/drawer"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { apiFetch } from "@/lib/api"
import type { Agent } from "@/types/agent"

type FormValues = { fecha_ingreso: string }

export default function ReingresoDialog({
  agente,
  onOpenChange,
  onSuccess,
}: {
  agente: Agent | null
  onOpenChange: (open: boolean) => void
  onSuccess: (updated: Agent) => void
}) {
  const isMobile = useIsMobile()
  const [isSaving, setIsSaving] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: { fecha_ingreso: "" },
  })

  const onSubmit = handleSubmit(async (values) => {
    if (!agente) return

    setIsSaving(true)
    setErrorMessage(null)
    try {
      const response = await apiFetch(`/agentes/${agente.legajo}/reingreso`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fecha_ingreso: values.fecha_ingreso }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || data?.message || "No se pudo reingresar al agente")
      }

      onSuccess(await response.json())
      onOpenChange(false)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "No se pudo reingresar al agente"
      )
    } finally {
      setIsSaving(false)
    }
  })

  return (
    <Drawer direction={isMobile ? "bottom" : "right"} open={!!agente} onOpenChange={onOpenChange}>
      <DrawerContent className="ml-auto max-w-[420px]">
        <DrawerHeader className="border-b pb-6">
          <DrawerTitle>Reingresar agente</DrawerTitle>
          <DrawerDescription>
            {agente
              ? `${agente.apellido} ${agente.nombre} vuelve a estar activo desde la fecha indicada.`
              : ""}
          </DrawerDescription>
        </DrawerHeader>

        <div className="overflow-y-auto px-6 py-6">
          {errorMessage ? (
            <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </div>
          ) : null}
          <Field>
            <FieldLabel htmlFor="reingreso-fecha">Fecha de ingreso</FieldLabel>
            <Input
              id="reingreso-fecha"
              type="date"
              {...register("fecha_ingreso", { required: true })}
            />
          </Field>
        </div>

        <DrawerFooter className="border-t">
          <Button onClick={onSubmit} disabled={isSaving}>
            {isSaving ? "Guardando..." : "Reingresar"}
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
