import { useState, useMemo } from "react";
import "./Valen.css";


import {
  Search,
  Building2,
  Users,
  UserPlus,
  CircleCheck,
  Filter,
  ArrowUpAZ,
  Camera,
  Briefcase,
  GraduationCap,
  ShieldCheck,
  Calendar,
} from "lucide-react";

const agentes = [
  {
    nombre: "Roberto G. Méndez",
    cargo: "Supervisor Regional",
    estado: "ACTIVO",
    foto:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300",
  },
  {
    nombre: "Elena S. Valenzuela",
    cargo: "Analista de Datos",
    estado: "ACTIVO",
    foto:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300",
  },
  {
    nombre: "Lucas Martín Pérez",
    cargo: "Coordinador de Campo",
    estado: "INACTIVO",
    foto:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300",
  },
  {
    nombre: "Marta Isabel Ortiz",
    cargo: "Recursos Humanos",
    estado: "ACTIVO",
    foto:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300",
  },
];

export default function Valen() {
  const [pantalla, setPantalla] = useState<"lista" | "nuevo">("lista");
  const [filtro, setFiltro] = useState<"TODOS" | "ACTIVO" | "INACTIVO">("TODOS");
  const [ordenAscendente, setOrdenAscendente] = useState(true);
  
  const agentesOrdenados = useMemo(() => {
    // Aplicar filtro
    let resultado = agentes.filter(agente => {
      if (filtro === "TODOS") return true;
      return agente.estado === filtro;
    });

    // Aplicar ordenamiento
    resultado = [...resultado].sort((a, b) => {
      // Primero por estado (ACTIVOS primero)
      if (a.estado !== b.estado) {
        const comparacion = a.estado === "ACTIVO" ? -1 : 1;
        return ordenAscendente ? comparacion : -comparacion;
      }
      // Luego alfabéticamente
      const comparacion = a.nombre.localeCompare(b.nombre);
      return ordenAscendente ? comparacion : -comparacion;
    });

    return resultado;
  }, [filtro, ordenAscendente]);

  const toggleFiltro = () => {
    const estados: ("TODOS" | "ACTIVO" | "INACTIVO")[] = ["TODOS", "ACTIVO", "INACTIVO"];
    const index = estados.indexOf(filtro);
    setFiltro(estados[(index + 1) % estados.length]);
  };

  return (
    <div className="valen">

      <header className="navbar">

        <div className="logo">

          <Building2 size={28} />

          <h1>Municipalidad</h1>

        </div>

        <nav>

          <a href="Valen">Inicio</a>

          <a className="active" href="#">
            Agentes
          </a>

          <a href="#">Reportes</a>

          <a href="#">Ajustes</a>

        </nav>

        <div className="nav-right">

          <div className="avatar">JS</div>

        </div>

      </header>

     

      <main className="contenido">

        <section className="titulo">

          <div>

            <h2>Gestión de Agentes</h2>

            <p>
              Monitorea y administra el personal activo del Municipio.
            </p>

          </div>

          <div className="titulo-actions">
            <button className="buscar" type="button">
              <Search size={22} />
              Buscar Agente
            </button>

            <button
              className="cargar"
              type="button"
              onClick={() => setPantalla("nuevo")}
            >
              <UserPlus size={22} />
              Cargar Agente
            </button>
          </div>

        </section>
        
        {pantalla === "lista" && (<>
        
        <section className="cards-superiores">

       

          <div className="card">

            <div className="card-header">

              <div className="icon verde-claro">
                <Users size={30} />
              </div>

              <span className="badge">
                +12% vs mes anterior
              </span>

            </div>

            <h3>Total de Agentes</h3>

            <h1>1,248</h1>

          </div>

          <div className="card">

            <div className="card-header">

              <div className="icon verde">
                <CircleCheck size={30} />
              </div>

              <span className="tiempo">
                ● En tiempo real
              </span>

            </div>

            <h3>Agentes Activos</h3>

            <h1>94%</h1>

          </div>

  

          <div className="card card-verde">

            <div className="icon oscuro">

              <UserPlus size={30} />

            </div>

            <div className="nuevo-contenido">

              <h3>Nuevos Agentes</h3>

              <div className="numero">

                <span className="grande">24</span>

                <span className="mes">
                  este mes
                </span>

              </div>

            </div>

          </div>

        </section>

        <section className="lista-header">

          <h2>Lista de Personal</h2>

          <div className="acciones-lista">

            <button className="btn-icon" onClick={toggleFiltro} title={`Filtro: ${filtro}`}>

              <Filter size={24} />

            </button>

            <button className="btn-icon" onClick={() => setOrdenAscendente(!ordenAscendente)} title={ordenAscendente ? "Descendente" : "Ascendente"}>

              <ArrowUpAZ size={24} />

            </button>

          </div>

        </section>


        <section className="lista-agentes">

          {agentesOrdenados.map((agente, index) => (

            <div className="agente-card" key={index}>

              <div className="agente-info">

                <div className="foto-container">

                  <img
                    src={agente.foto}
                    alt={agente.nombre}
                    className="foto"
                  />

                  <span
                    className={
                      agente.estado === "ACTIVO"
                        ? "estado-online"
                        : "estado-offline"
                    }
                  />


                </div>

                <div className="datos">

                  <h3>{agente.nombre}</h3>

                  <p>{agente.cargo}</p>

                  <span
                    className={
                      agente.estado === "ACTIVO"
                        ? "badge-activo"
                        : "badge-inactivo"
                    }
                  >
                    {agente.estado}
                  </span>

                </div>

              </div>

            </div>

          ))}

        </section>
        </>

)}

        <section className="footer-agentes">

          <button className="ver-todos">

            <span>Ver todos los agentes</span>

            <strong>(1,248)</strong>

          </button>

        </section>
{pantalla === "nuevo" && (

<div className="nuevo-agente">

    <div className="nuevo-header">

        <div>

            <h2>Nuevo Agente</h2>

            <p>
                Complete la información del agente.
            </p>

        </div>

        <button
            className="volver"
            onClick={() => setPantalla("lista")}
        >
            ← Volver
        </button>

    </div>

    <div className="formulario">

        <div className="foto-agente">

            <div className="circulo">

                <Camera size={55} />

            </div>

            <button>

                Cambiar Foto

            </button>

        </div>

        <div className="inputs">

            <div className="input">

                <label>Nombre completo</label>

                <input
                    placeholder="Ingrese nombre..."
                />

            </div>

            <div className="input">

                <label>Correo</label>

                <input
                    placeholder="correo@ejemplo.com"
                />

            </div>

            <div className="input">

                <label>Teléfono</label>

                <input
                    placeholder="+54..."
                />

            </div>

            <div className="input">

                <label>DNI</label>

                <input
                    placeholder="Ingrese DNI..."
                />

            </div>

            <div className="input">

                <label>Localidad</label>

                <input
                    placeholder="Ingrese localidad..."
                />

            </div>

            <div className="input">

                <label>Cantidad de hijos</label>

                <input
                    type="number"
                    placeholder="0"
                    min="0"
                />

            </div>

            <div className="input sexo-input">

                <label>Sexo</label>

                <div className="radio-group">
                    <label className="radio-option">
                        <input type="radio" name="sexo" value="masculino" defaultChecked />
                        <span className="radio-dot" />
                        Masculino
                    </label>
                    <label className="radio-option">
                        <input type="radio" name="sexo" value="femenino" />
                        <span className="radio-dot" />
                        Femenino
                    </label>
                    <label className="radio-option">
                        <input type="radio" name="sexo" value="otro" />
                        <span className="radio-dot" />
                        Otro
                    </label>
                </div>

            </div>

            <div className="input">

                <label>Cargo</label>

                <div className="input-icon">

                    <Briefcase />

                    <input
                        placeholder="Cargo"
                    />

                </div>

            </div>

            <div className="input">

                <label>Educación</label>

                <div className="input-icon">

                    <GraduationCap />

                    <input
                        placeholder="Título"
                    />

                </div>

            </div>

            <div className="input">

                <label>Departamento</label>

                <div className="input-icon">

                    <Building2 />

                    <input
                        placeholder="Departamento"
                    />

                </div>

            </div>

            <div className="input">

                <label>Fecha de ingreso</label>

                <div className="input-icon">

                    <Calendar />

                    <input
                        type="date"
                    />

                </div>

            </div>

            <div className="input">

                <label>Rol</label>

                <div className="input-icon">

                    <ShieldCheck />

                    <input
                        placeholder="Administrador"
                    />

                </div>

            </div>

        </div>

        <div className="acciones">

            <button
                className="cancelar"
                onClick={() => setPantalla("lista")}
            >
                Cancelar
            </button>

            <button className="guardar">

                Guardar Agente

            </button>

        </div>

    </div>

</div>

)}
      </main>

    </div>
  );
}