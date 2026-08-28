import { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Agentes from "./app/agentes/page";
import LoginPage from "./app/login/page";
import Licencias from "./components/licencias";
import VerLicencias from "./components/ver-licencias";
import LicenciasExpiradas from "./components/licencias-expiradas";
import Dependencias from "./components/dependencia";
import Novedades from "./components/novedades";

export default function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/novedades" replace />} />
        <Route path="/agentes" element={<Agentes />} />
        <Route path="/licencias" element={<Licencias />} />
        <Route path="/ver-licencias" element={<VerLicencias />} />
        <Route path="/licencias-expiradas" element={<LicenciasExpiradas />} />
        <Route path="/dependencias" element={<Dependencias />} />
        <Route path="/novedades" element={<Novedades />} />
      </Routes>
    </Suspense>
  );
}