import { useMemo, useState } from "react"
import { Search, Building2, MapPin } from "lucide-react"

import { AppLayout } from "@/components/app-layout"
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

export default function Dependencias() {
  const [buscar, setBuscar] = useState("")

  const resultado = useMemo(() => {
    return dependencias.filter((d) =>
      d.nombre.toLowerCase().includes(buscar.toLowerCase())
    )
  }, [buscar])

  return (
    <AppLayout title="Dependencias" description="Buscá una dependencia municipal por nombre.">
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-10 pl-10"
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
                  <h2 className="text-xl font-semibold">{dep.nombre}</h2>
                  <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {dep.direccion}
                  </div>
                </div>
              </div>

              <div className="mt-6 text-sm">
                <strong>Categoría:</strong> {dep.categoria}
              </div>

              <Button className="mt-6 w-full">Seleccionar</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  )
}