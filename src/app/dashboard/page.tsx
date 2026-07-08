import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useNavigate } from "react-router-dom"

export default function Dashboard() {
  const API_BASE = "https://presentismo-backend.vercel.app/api"

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
        const response = await fetch(`${API_BASE}/agentes`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`
          }
        })
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
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div> */}
              <DataTable data={agentes} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
