import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import Dashboard from "./Dashboard"
import Belen from "./Belen"
import Valen from "./Valen"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/valen" element={<Valen />} />
        <Route path="/belen" element={<Belen />} />
      </Routes>
    </BrowserRouter>
  )
}
