import AgentForm from "./AgentForm"

export default function CargarAgente() {
  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h1>Cargar agente</h1>
      <p>Complete los datos del agente para registrarlo en el sistema.</p>
      <AgentForm />
    </div>
  )
}
