import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { apiFetch } from "@/lib/api"
import { calculateAge } from "@/lib/date"
import type { Agent } from "@/types/agent"

export default function Jubilaciones() {
  const navigate = useNavigate()
  const [agentes, setAgentes] = useState<Agent[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!localStorage.getItem("auth_token")) {
      navigate("/login")
      return
    }

    const cargarAgentes = async () => {
      try {
        const response = await apiFetch("/agentes")
        if (!response.ok) throw new Error("Error al obtener los agentes")
        setAgentes(await response.json())
      } catch (loadError) {
        console.error("Error al obtener los agentes para jubilaciones:", loadError)
        setError("No se pudo cargar la lista de agentes.")
      }
    }

    cargarAgentes()
  }, [navigate])

  const agentesEnEdadJubilatoria = useMemo(
    () =>
      agentes.filter((agente) => {
        const edad = calculateAge(agente.fecha_nacimiento)
        const sexo = agente.sexo.trim().toUpperCase()
        return (sexo === "F" && edad !== null && edad >= 57) ||
          (sexo === "M" && edad !== null && edad >= 62)
      }),
    [agentes]
  )

  return (
    <AppLayout
      title="Jubilaciones"
      description="Agentes que superan la edad jubilatoria de referencia."
      contentClassName=""
    >
      {error ? (
        <p className="px-4 text-destructive lg:px-6">{error}</p>
      ) : (
        <DataTable data={agentesEnEdadJubilatoria} modoJubilaciones />
      )}
    </AppLayout>
  )
}