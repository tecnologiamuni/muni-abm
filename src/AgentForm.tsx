"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  BriefcaseIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  GraduationCapIcon,
  HashIcon,
  HomeIcon,
  MapPinIcon,
  PhoneIcon,
  UsersIcon,
} from "lucide-react"

function FormField({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
        <Icon className="h-4 w-4 text-emerald-400" />
        <span>{label}</span>
      </div>
      {children}
    </div>
  )
}

export default function AgentForm({ onAdd, onClose }: { onAdd?: (a: any) => void; onClose?: () => void }) {
  const [nuevoAgente, setNuevoAgente] = useState({
    legajo: "",
    dni: "",
    puesto: "",
    localidad: "",
    domicilio: "",
    celular: "",
    nacimiento: "",
    ingreso: "",
    nivel: "",
    hijos: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNuevoAgente({ ...nuevoAgente, [name]: value })
  }

  const cargarAgente = () => {
    const agente = {
      id: Date.now(),
      legajo: nuevoAgente.legajo,
      dni: nuevoAgente.dni,
      puesto: nuevoAgente.puesto,
      localidad: nuevoAgente.localidad,
      domicilio: nuevoAgente.domicilio,
      nro_celular: nuevoAgente.celular,
      fecha_nacimiento: nuevoAgente.nacimiento,
      fecha_ingreso: nuevoAgente.ingreso,
      nivel_estudios: nuevoAgente.nivel,
      cantidad_hijos: Number(nuevoAgente.hijos) || 0,
      apellido: "",
      nombre: "",
      dependencia_id: 0,
      motivo_baja: null,
      fecha_baja: null,
      es_jerarquico: null,
    }

    if (onAdd) onAdd(agente)

    setNuevoAgente({
      legajo: "",
      dni: "",
      puesto: "",
      localidad: "",
      domicilio: "",
      celular: "",
      nacimiento: "",
      ingreso: "",
      nivel: "",
      hijos: "",
    })

    if (onClose) onClose()
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <FormField icon={HashIcon} label="Legajo">
          <Input
            name="legajo"
            placeholder="Legajo"
            value={nuevoAgente.legajo}
            onChange={handleChange}
            className="bg-slate-950/90 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:ring-emerald-400/20"
          />
        </FormField>

        <FormField icon={CreditCardIcon} label="DNI">
          <Input
            name="dni"
            placeholder="DNI"
            maxLength={8}
            value={nuevoAgente.dni}
            onChange={handleChange}
            className="bg-slate-950/90 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:ring-emerald-400/20"
          />
        </FormField>

        <FormField icon={BriefcaseIcon} label="Puesto">
          <Input
            name="puesto"
            placeholder="Puesto"
            value={nuevoAgente.puesto}
            onChange={handleChange}
            className="bg-slate-950/90 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:ring-emerald-400/20"
          />
        </FormField>

        <FormField icon={MapPinIcon} label="Localidad">
          <Input
            name="localidad"
            placeholder="Localidad"
            value={nuevoAgente.localidad}
            onChange={handleChange}
            className="bg-slate-950/90 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:ring-emerald-400/20"
          />
        </FormField>

        <FormField icon={HomeIcon} label="Domicilio">
          <Input
            name="domicilio"
            placeholder="Domicilio"
            value={nuevoAgente.domicilio}
            onChange={handleChange}
            className="bg-slate-950/90 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:ring-emerald-400/20"
          />
        </FormField>

        <FormField icon={PhoneIcon} label="Celular">
         <Input
          name="celular"
          placeholder="Celular"
          type="text"
          inputMode="numeric"
          maxLength={12}
          value={nuevoAgente.celular}
          onChange={(e) => {
            e.target.value = e.target.value.replace(/\D/g, "");
            handleChange(e);
          }}
          className="bg-slate-950/90 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:ring-emerald-400/20"
        />
        </FormField>

        <FormField icon={CalendarDaysIcon} label="Nacimiento">
          <Input
            type="date"
            name="nacimiento"
            value={nuevoAgente.nacimiento}
            onChange={handleChange}
            className="bg-slate-950/90 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:ring-emerald-400/20"
          />
        </FormField>

        <FormField icon={CalendarDaysIcon} label="Ingreso">
          <Input
            type="date"
            name="ingreso"
            value={nuevoAgente.ingreso}
            onChange={handleChange}
            className="bg-slate-950/90 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:ring-emerald-400/20"
          />
        </FormField>

        <FormField icon={GraduationCapIcon} label="Nivel">
          <Input
            name="nivel"
            placeholder="Nivel"
            value={nuevoAgente.nivel}
            onChange={handleChange}
            className="bg-slate-950/90 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:ring-emerald-400/20"
          />
        </FormField>

        <FormField icon={UsersIcon} label="Hijos">
          <Input
            type="number"
            name="hijos"
            placeholder="Hijos"
            value={nuevoAgente.hijos}
            onChange={handleChange}
            className="bg-slate-950/90 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:ring-emerald-400/20"
          />
        </FormField>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
        <Button
          variant="outline"
          className="w-full border-emerald-500 text-emerald-200 hover:bg-emerald-500/10 sm:max-w-[160px]"
          onClick={() => onClose && onClose()}
        >
          Cancelar
        </Button>
        <Button
          className="w-full bg-emerald-500 text-slate-950 hover:bg-emerald-400 sm:max-w-[220px]"
          onClick={cargarAgente}
        >
          Cargar Agente
        </Button>
      </div>
    </div>
  )
}
