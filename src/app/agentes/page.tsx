import { useEffect, useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { useNavigate } from "react-router-dom"
import { apiFetch } from "@/lib/api"

export default function Agentes() {
  const navigate = useNavigate()
  const [agentes, setAgentes] = useState([])

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
    const fetchAgentes = async () => {
      try {
        const response = await apiFetch("/agentes")
        if (!response.ok) {
          throw new Error("Error al obtener los agentes")
        }
        const agentes = await response.json()
        setAgentes(agentes)
      } catch (error) {
        console.error("Error al obtener los agentes:", error)
      }

    }

    fetchAgentes()
  }, [navigate])

  return (
    <AppLayout title="Agentes" description="Personal municipal registrado." contentClassName="">
      <DataTable data={agentes} />
    </AppLayout>
  )
}
