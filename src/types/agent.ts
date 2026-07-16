import { z } from "zod"

export const agentSchema = z.object({
  id: z.number(),
  legajo: z.number(),
  dni: z.number(),
  apellido: z.string(),
  nombre: z.string(),
  puesto: z.string(),
  dependencia_id: z.number(),
  domicilio: z.string(),
  localidad: z.string(),
  sexo: z.string(),
  fecha_nacimiento: z.string(),
  fecha_ingreso: z.string(),
  nro_celular: z.string(),
  nivel_estudios: z.string(),
  cantidad_hijos: z.number(),
  fecha_baja: z.string().nullable().optional(),
  motivo_baja: z.string().nullable().optional(),
  es_jerarquico: z.string().nullable().optional(),
})

export type Agent = z.infer<typeof agentSchema>

export const dependenciaSchema = z.object({
  id: z.number(),
  nombre: z.string(),
})

export type Dependencia = z.infer<typeof dependenciaSchema>

export default agentSchema
