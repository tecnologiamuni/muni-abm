import { useState } from "react";
import "./Belen.css";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Search,
  Filter,
  Plus,
  ArrowLeft,
  Home,
  Users,
  Bell,
  Settings,
  User,
  Upload,
} from "lucide-react";

interface Agente {
  nombre: string;
  cargo: string;
  estado: string;
}

const agentesIniciales: Agente[] = [
  {
    nombre: "Roberto G. Méndez",
    cargo: "Director de Planeamiento",
    estado: "Activo",
  },
  {
    nombre: "Elena S. Valencia",
    cargo: "Coordinadora",
    estado: "Activo",
  },
  {
    nombre: "Lucas Martín",
    cargo: "Técnico en Infraestructura",
    estado: "Inactivo",
  },
  {
    nombre: "Marta Isabel",
    cargo: "Secretaria de Finanzas",
    estado: "Activo",
  },
];

export default function Belen() {
  const [pantalla, setPantalla] = useState<"lista" | "nuevo">("lista");
  const [buscar, setBuscar] = useState("");
  const [autoridad, setAutoridad] = useState(false);

  const lista = agentesIniciales.filter((a) =>
    a.nombre.toLowerCase().includes(buscar.toLowerCase())
  );

  if (pantalla === "nuevo") {
    return (
      <div className="contenedor">
        <header className="header">
          <Button variant="ghost" onClick={() => setPantalla("lista")}> 
            <ArrowLeft />
          </Button>

          <div>
            <span className="subtitulo">Municipalidad</span>
            <h1>Cargar Agente</h1>
            <p>Nuevo integrante</p>
          </div>
        </header>

        <Card className="formulario">
          <h2>Información Personal</h2>

          <div className="fila">
            <div className="grupo">
              <label>Nombre</label>
              <Input />
            </div>
            <div className="grupo">
              <label>Apellido</label>
              <Input />
            </div>
          </div>

          <div className="fila">
            <div className="grupo">
              <label>DNI</label>
              <Input placeholder="Documento" />
            </div>
            <div className="grupo">
              <label>Email</label>
              <Input placeholder="Correo electrónico" />
            </div>
          </div>

          <div className="fila">
            <div className="grupo">
              <label>Teléfono</label>
              <Input placeholder="Teléfono" />
            </div>
            <div className="grupo">
              <label>Cantidad de hijos</label>
              <Input type="number" placeholder="0" />
            </div>
          </div>

          <div className="fila">
            <div className="grupo">
              <label>Sexo</label>
              <select className="select" defaultValue="">
                <option value="" disabled>
                  Elija una opción
                </option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div className="grupo">
              <label>Localidad</label>
              <select className="select" defaultValue="">
                <option value="" disabled>
                  Seleccione localidad
                </option>
                <option value="Centro">Centro</option>
                <option value="Norte">Norte</option>
                <option value="Sur">Sur</option>
              </select>
            </div>
          </div>

          <div className="grupo">
            <label>Fotografía</label>
            <div className="uploadBox">
              <Upload />
              <span>Subir foto de perfil</span>
              <small>PNG o JPG, hasta 2MB</small>
            </div>
          </div>

          <h2>Información Laboral</h2>
          <div className="fila">
            <div className="grupo">
              <label>Cargo</label>
              <Input placeholder="Cargo" />
            </div>
            <div className="grupo">
              <label>Dependencia</label>
              <Input placeholder="Área" />
            </div>
          </div>

          <div className="grupo switch">
            <label>Autoridad</label>
            <Checkbox
              checked={autoridad}
              onCheckedChange={(checked) => setAutoridad(checked === true)}
            />
          </div>

          <div className="acciones">
            <Button className="guardar">Guardar</Button>
            <Button variant="outline" onClick={() => setPantalla("lista")}>Cancelar</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="contenedor">
      <header className="header">
        <div>
          <span className="subtitulo">Municipalidad</span>
          <h1>Gestión de Agentes</h1>
          <p>Panel administrativo</p>
        </div>
        <div className="header-avatar">
          <Avatar>
            <AvatarFallback>BG</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <div className="busqueda">
        <div className="inputBusqueda">
          <Search size={18} />
          <Input
            placeholder="Buscar agente..."
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter />
          Filtrar
        </Button>
      </div>

      <Card className="estadistica">
        <div className="estadisticaContenido">
          <span className="tituloCard">Total de Agentes Municipales</span>
          <h1>1,248</h1>
          <div className="estadoActivo">
            <span className="punto" />
            <span>94% Activos</span>
          </div>
          <div className="barra">
            <div className="barraProgreso" />
          </div>
        </div>
        <Users className="iconoGrande" />
      </Card>

      <Card className="secundaria">
        <div>
          <h2>Nuevos Agentes</h2>
          <h1>24</h1>
          <p>Últimos 30 días</p>
        </div>
      </Card>

      <div className="encabezadoLista">
        <h2>Listado de Personal</h2>
        <Button variant="ghost" className="btnOrdenar">
          <Filter size={18} /> Ordenar
        </Button>
      </div>

      <div className="lista">
        {lista.map((agente, index) => (
          <Card className="agente" key={index}>
            <Avatar>
              <AvatarFallback>{agente.nombre.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="info">
              <h3>{agente.nombre}</h3>
              <p>{agente.cargo}</p>
            </div>
            <Badge>{agente.estado}</Badge>
          </Card>
        ))}
      </div>

      <div className="botones">
        <Button variant="outline">Ver más agentes</Button>
        <Button onClick={() => setPantalla("nuevo")}> 
          <Plus /> Cargar Agente
        </Button>
      </div>

      <nav className="bottomNav">
        <Home />
        <Users />
        <Bell />
        <Settings />
        <User />
      </nav>
    </div>
  );
}
