import "./services/axiosConfig";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ===== PÚBLICO =====
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";

import Torneos from "./pages/Torneos";
import Clubes from "./pages/Clubes";
import Competidores from "./pages/Competidores";
import Robots from "./pages/Robots";
import Rankings from "./pages/Rankings";

// ===== ADMIN =====
import AdminPanel from "./pages/AdminPanel";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import AdminClubes from "./pages/admin/AdminClubes";
import AdminJueces from "./pages/admin/AdminJueces";
import AdminTorneos from "./pages/admin/AdminTorneos";
import AdminCategoriasTorneo from "./pages/admin/AdminCategoriasTorneo";
import AdminDashboard from "./pages/admin/AdminDashboard";

// ===== SUBADMIN =====
import SubAdminPanel from "./pages/SubAdminPanel";
import SubAdminDashboard from "./pages/subadmin/SubAdminDashboard";

// ===== CLUB =====
import ClubPanel from "./pages/ClubPanel";
import ClubDashboard from "./pages/club/ClubDashboard";
import ClubCompetidores from "./pages/club/ClubCompetidores";
import ClubRobots from "./pages/club/ClubRobots";
import ClubTorneos from "./pages/club/ClubTorneos";
import ClubCategoriasTorneo from "./pages/club/ClubCategoriasTorneo";
import ClubInscribir from "./pages/club/ClubInscribir";
import ClubInscripciones from "./pages/club/ClubInscripciones";

// ===== COMPETIDORES =====
import CompetidorPanel from "./pages/CompetidorPanel";
import CompetidorDashboard from "./pages/Competidores/CompetidorDashboard";
import CompetidorRobots from "./pages/CompetidorRobots";
import CompetidorInscripciones from "./pages/Competidores/CompetidorInscripciones";

// ===== JUECES =====
import JuezPanel from "./pages/JuezPanel";
import JuezDashboard from "./pages/jueces/JuezDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= PÚBLICO ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/torneos" element={<Torneos />} />
        <Route path="/clubes" element={<Clubes />} />
        <Route path="/competidores" element={<Competidores />} />
        <Route path="/robots" element={<Robots />} />
        <Route path="/rankings" element={<Rankings />} />

        {/* ================= ADMIN ================= */}
        <Route path="/admin" element={<AdminPanel />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="usuarios" element={<AdminUsuarios />} />
          <Route path="clubes" element={<AdminClubes />} />
          <Route path="jueces" element={<AdminJueces />} />
          <Route path="torneos" element={<AdminTorneos />} />
          <Route
            path="torneos/:idTorneo/categorias"
            element={<AdminCategoriasTorneo />}
          />
        </Route>

        {/* ================= SUBADMIN ================= */}
        <Route path="/subadmin" element={<SubAdminPanel />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<SubAdminDashboard />} />
          {/* aquí irán registrar-club, registrar-comp, etc */}
        </Route>

        {/* ================= CLUB ================= */}
        <Route path="/club" element={<ClubPanel />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<ClubDashboard />} />
          <Route path="competidores" element={<ClubCompetidores />} />
          <Route path="robots" element={<ClubRobots />} />
          <Route path="torneos" element={<ClubTorneos />} />
          <Route path="inscripciones" element={<ClubInscripciones />} />
          <Route
            path="torneos/:idTorneo/categorias"
            element={<ClubCategoriasTorneo />}
          />
          <Route
            path="torneos/:idTorneo/categorias/:idCategoriaTorneo/inscribir"
            element={<ClubInscribir />}
          />
        </Route>

        {/* ================= COMPETIDORES ================= */}
        <Route path="/competidor" element={<CompetidorPanel />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<CompetidorDashboard />} />
          <Route path="robots" element={<CompetidorRobots />} />
          <Route path="inscripciones" element={<CompetidorInscripciones />} />
        </Route>

        {/* ================= JUECES ================= */}
        <Route path="/juez" element={<JuezPanel />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<JuezDashboard />} />
          {/* torneos, calificar */}
        </Route>

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
