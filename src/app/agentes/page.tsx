import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { PlusIcon } from "lucide-react"

import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import ReingresoDialog from "@/components/ReingresoDialog"
import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/api"
import type { Agent } from "@/types/agent"

export default function Agentes() {
  const navigate = useNavigate()
  const [agentes, setAgentes] = useState<Agent[]>([])
  const [inactivos, setInactivos] = useState<Agent[]>([])
  const [vistaBajas, setVistaBajas] = useState(false)
  const [reingresando, setReingresando] = useState<Agent | null>(null)
  const [creando, setCreando] = useState(false)

  const fetchAgentes = async () => {
    try {
      const response = await apiFetch("/agentes")
      if (!response.ok) {
        throw new Error("Error al obtener los agentes")
      }
      setAgentes(await response.json())
    } catch (error) {
      console.error("Error al obtener los agentes:", error)
    }
  }

  const fetchInactivos = async () => {
    try {
      const response = await apiFetch("/agentes/inactivos")
      if (!response.ok) {
        throw new Error("Error al obtener los agentes dados de baja")
      }
      setInactivos(await response.json())
    } catch (error) {
      console.error("Error al obtener los agentes dados de baja:", error)
    }
  }

  useEffect(() => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        navigate("/login")
      }
    } catch (error) {
      console.error("Error al verificar el token:", error)
      navigate("/login")
    }

    // fetch agentes from the API with token in authorization header
    const cargarInicial = async () => {
      try {
        const response = await apiFetch("/agentes")
        if (!response.ok) {
          throw new Error("Error al obtener los agentes")
        }
        setAgentes(await response.json())
      } catch (error) {
        console.error("Error al obtener los agentes:", error)
      }
    }

    cargarInicial()
  }, [navigate])

  const handleToggleVistaBajas = () => {
    if (vistaBajas) {
      setVistaBajas(false)
      return
    }
    setVistaBajas(true)
    fetchInactivos()
  }

  return (
    <AppLayout
      title="Agentes"
      description="Personal municipal registrado."
      contentClassName=""
      actions={
        vistaBajas ? undefined : (
          <Button size="sm" onClick={() => setCreando(true)}>
            <PlusIcon className="h-4 w-4" />
            Agregar agente
          </Button>
        )
      }
    >
      <DataTable
        data={vistaBajas ? inactivos : agentes}
        onReingresar={vistaBajas ? (agente) => setReingresando(agente) : undefined}
        creatingOpen={creando}
        onCreatingOpenChange={setCreando}
        vistaBajas={vistaBajas}
        onToggleVistaBajas={handleToggleVistaBajas}
        onAgenteChange={() => {
          fetchAgentes()
          if (vistaBajas) fetchInactivos()
        }}
      />
      <ReingresoDialog
        agente={reingresando}
        onOpenChange={(open) => {
          if (!open) setReingresando(null)
        }}
        onSuccess={() => {
          setReingresando(null)
          fetchInactivos()
          fetchAgentes()
        }}
      />
    </AppLayout>
  )
}
