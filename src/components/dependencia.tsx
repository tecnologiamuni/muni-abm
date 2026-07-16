import { useMemo, useState } from "react"
import { Search, Building2, MapPin } from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const dependencias = [
  {
    id: 1,
    nombre: "Secretaría de Hacienda",
    direccion: "Palacio Municipal",
    categoria: "Economía",
  },
  {
    id: 2,
    nombre: "Secretaría de Salud",
    direccion: "Av. San Martín 450",
    categoria: "Salud",
  },
  {
    id: 3,
    nombre: "Obras Públicas",
    direccion: "Centro Cívico",
    categoria: "Infraestructura",
  },
  {
    id: 4,
    nombre: "Desarrollo Social",
    direccion: "Belgrano 235",
    categoria: "Social",
  },
]

export default function Dependencia() {
  const [buscar, setBuscar] = useState("")

  const resultado = useMemo(() => {
    return dependencias.filter((d) =>
      d.nombre.toLowerCase().includes(buscar.toLowerCase())
    )
  }, [buscar])

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

        <div className="flex flex-1 flex-col p-6">

          <h1 className="text-3xl font-bold mb-6">
            Buscar Dependencia
          </h1>

          <div className="relative mb-8 max-w-xl">

            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />

            <Input
              className="pl-10 h-12"
              placeholder="Buscar dependencia..."
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
            />

          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

            {resultado.map((dep) => (

              <Card key={dep.id}>

                <CardContent className="p-6">

                  <div className="flex items-start gap-4">

                    <div className="rounded-lg bg-primary/10 p-3">

                      <Building2 className="h-8 w-8 text-primary" />

                    </div>

                    <div>

                      <h2 className="font-semibold text-xl">
                        {dep.nombre}
                      </h2>

                      <div className="flex items-center gap-2 text-muted-foreground mt-2">

                        <MapPin className="h-4 w-4" />

                        {dep.direccion}

                      </div>

                    </div>

                  </div>

                  <div className="mt-6">
                    <strong>Categoría:</strong> {dep.categoria}
                  </div>

                  <Button className="w-full mt-6">
                    Seleccionar
                  </Button>

                </CardContent>

              </Card>

            ))}

          </div>

        </div>

      </SidebarInset>

    </SidebarProvider>
  )
}