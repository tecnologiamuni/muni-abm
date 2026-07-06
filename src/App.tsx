import { lazy, Suspense } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import Dashboard from "./Dashboard"
import LoginPage from "./app/login/page"

const Belen = lazy(() => import("./Belen"))
const Valen = lazy(() => import("./Valen"))
const CargarAgente = lazy(() => import("./CargarAgente"))

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/valen" element={<Valen />} />
          <Route path="/belen" element={<Belen />} />
          <Route path="/cargar-agente" element={<CargarAgente />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
