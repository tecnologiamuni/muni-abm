import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Dashboard from "./app/dashboard/page";
import LoginPage from "./app/login/page";
import Dependencias from "./components/dependencia";

const CargarAgente = lazy(() => import("./CargarAgente"));

export default function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cargar-agente" element={<CargarAgente />} />
        <Route path="/dependencias" element={<Dependencias />} />
      </Routes>
    </Suspense>
  );
}