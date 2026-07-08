import { lazy, Suspense } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import Dashboard from "./app/dashboard/page"
import LoginPage from "./app/login/page"

const CargarAgente = lazy(() => import("./CargarAgente"))

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cargar-agente" element={<CargarAgente />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
