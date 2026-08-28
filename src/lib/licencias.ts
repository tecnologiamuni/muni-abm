import { apiFetch } from "@/lib/api"
import type { Licencia } from "@/types/licencia"

interface AgenteResumen {
  id: number
  legajo: number
  nombre: string
  apellido: string
}

interface LicenciaApi {
  id: number
  agente_id: number
  tipo_licencia: string
  inicio: string
  fin: string
  archivo_url: string | null
  archivo_nombre: string | null
  observaciones: string | null
  created_at: string
  Agente?: AgenteResumen
}

function mapLicencia(raw: LicenciaApi): Licencia {
  return {
    id: raw.id,
    agenteId: raw.agente_id,
    empleado: raw.Agente ? `${raw.Agente.apellido.toUpperCase()} ${raw.Agente.nombre}` : "",
    tipoLicencia: raw.tipo_licencia,
    inicio: raw.inicio,
    fin: raw.fin,
    archivoNombre: raw.archivo_nombre,
    archivoUrl: raw.archivo_url,
    observaciones: raw.observaciones ?? "",
    createdAt: raw.created_at,
  }
}

export async function fetchLicencias(): Promise<Licencia[]> {
  const response = await apiFetch("/licencias")
  if (!response.ok) {
    throw new Error("Error al obtener las licencias")
  }
  const data: LicenciaApi[] = await response.json()
  return data.map(mapLicencia)
}

export async function fetchLicencia(id: number): Promise<Licencia> {
  const response = await apiFetch(`/licencias/${id}`)
  if (!response.ok) {
    throw new Error("Error al obtener la licencia")
  }
  return mapLicencia(await response.json())
}
