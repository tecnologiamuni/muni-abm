import { z } from "zod"

export const licenciaSchema = z.object({
  id: z.number(),
  agenteId: z.number(),
  empleado: z.string(),
  tipoLicencia: z.string(),
  inicio: z.string(),
  fin: z.string(),
  archivoNombre: z.string().nullable(),
  archivoUrl: z.string().nullable(),
  observaciones: z.string(),
  createdAt: z.string(),
})

export type Licencia = z.infer<typeof licenciaSchema>
