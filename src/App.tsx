import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import Dashboard from "./Dashboard"
import Belen from "./Belen"
import Valen from "./Valen"
import CargarAgente from "./CargarAgente"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/valen" element={<Valen />} />
        <Route path="/belen" element={<Belen />} />
        <Route path="/cargar-agente" element={<CargarAgente />} />
      </Routes>
    </BrowserRouter>
  )
}
