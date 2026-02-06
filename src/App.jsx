import "./services/axiosConfig";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ===== PÚBLICO =====
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";
import RequestPasswordReset from "./pages/RequestPasswordReset";
import ResetPassword from "./pages/ResetPassword";

import Torneos from "./pages/Torneos";
import Clubes from "./pages/Clubes";
import Competidores from "./pages/Competidores";
import Robots from "./pages/Robots";
import Rankings from "./pages/Rankings";
import EncuentrosPublicos from "./pages/EncuentrosPublicos";

// ===== ADMIN =====
import AdminPanel from "./pages/admin/AdminPanel";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import AdminClubes from "./pages/admin/AdminClubes";
import AdminColiseos from "./pages/admin/AdminColiseos";
import AdminJueces from "./pages/admin/AdminJueces";
import AdminTorneos from "./pages/admin/AdminTorneos";
import AdminCategoriasTorneo from "./pages/admin/AdminCategoriasTorneo";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEncuentros from "./pages/admin/AdminEncuentros";
import AdminGenerarEncuentros from "./pages/admin/AdminGenerarEncuentros";
import AdminRobots from "./pages/admin/AdminRobots";
import AdminInscripcion from "./pages/admin/AdminInscripcion";
import AdminSubAdministradores from "./pages/admin/AdminSubAdministradores";
import AdminTransferenciasPropietario from "./pages/admin/AdminTransferenciasPropietario";
import AdminRoute from "./components/AdminRoute";
import SubAdminRoute from "./components/SubAdminRoute";

// ===== SUBADMIN =====
import SubAdminPanel from "./pages/subadmin/SubAdminPanel";
import SubAdminDashboard from "./pages/subadmin/SubAdminDashboard";
import SubAdminRegistrarClub from "./pages/subadmin/SubAdminRegistrarClub";
import SubAdminRegistrarCompetidor from "./pages/subadmin/SubAdminRegistrarCompetidor";
import SubAdminRegistrarJuez from "./pages/subadmin/SubAdminRegistrarJuez";
import SubAdminTorneos from "./pages/subadmin/SubAdminTorneos";

// ===== CLUB =====
import ClubPanel from "./pages/club/ClubPanel";
import ClubDashboard from "./pages/club/ClubDashboard";
import ClubCompetidores from "./pages/club/ClubCompetidores";
import ClubRobots from "./pages/club/ClubRobots";
import ClubTorneos from "./pages/club/ClubTorneos";
import ClubCategoriasTorneo from "./pages/club/ClubCategoriasTorneo";
import ClubInscribir from "./pages/club/ClubInscribir";
import ClubInscripciones from "./pages/club/ClubInscripciones";
import ClubTransferencias from "./pages/club/ClubTransferencias";
import ClubTransferirPropietario from "./pages/club/ClubTransferirPropietario";
import ClubSolicitudesIngreso from "./pages/club/ClubSolicitudesIngreso";

// ===== COMPETIDORES =====
import CompetidorPanel from "./pages/Competidores/CompetidorPanel";
import CompetidorDashboard from "./pages/Competidores/CompetidorDashboard";
import CompetidorRobots from "./pages/Competidores/CompetidorRobots";
import CompetidorInscripciones from "./pages/Competidores/CompetidorInscripciones";
import CompetidorTorneos from "./pages/Competidores/CompetidorTorneos";
import CompetidorRanking from "./pages/Competidores/CompetidorRanking";
import CompetidorInscribir from "./pages/Competidores/CompetidorInscribir";

// ===== JUECES =====
import JuezPanel from "./pages/Jueces/JuezPanel";
import JuezDashboard from "./pages/jueces/JuezDashboard";
import EncuentrosAsignados from "./pages/Jueces/EncuentrosAsignados";
import CalificarEncuentro from "./pages/Jueces/CalificarEncuentro";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= PÚBLICO ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/request-password-reset" element={<RequestPasswordReset />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/torneos" element={<Torneos />} />
        <Route path="/clubes" element={<Clubes />} />
        <Route path="/competidores" element={<Competidores />} />
        <Route path="/robots" element={<Robots />} />
        <Route path="/rankings" element={<Rankings />} />
        <Route
          path="/torneos/:idTorneo/categorias/:idCategoriaTorneo/encuentros"
          element={<EncuentrosPublicos />}
        />

        {/* ================= ADMIN ================= */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="usuarios" element={<AdminUsuarios />} />
          <Route path="clubes" element={<AdminClubes />} />
          <Route path="transferencias-propietario" element={<AdminTransferenciasPropietario />} />
          <Route path="jueces" element={<AdminJueces />} />
          <Route path="subadmin" element={<AdminSubAdministradores />} />
          <Route path="coliseos" element={<AdminColiseos />} />
          <Route path="torneos" element={<AdminTorneos />} />
          <Route path="encuentros" element={<AdminEncuentros />} />
           <Route path="inscripciones" element={<AdminInscripcion />} />
          <Route path="robots" element={<AdminRobots />} /> {/* 👈 */}
          <Route
            path="encuentros/:idCategoriaTorneo"
            element={<AdminGenerarEncuentros />}
          />
          <Route
            path="torneos/:idTorneo/categorias"
            element={<AdminCategoriasTorneo />}
          />
        </Route>

        {/* ================= SUBADMIN ================= */}
        <Route
          path="/subadmin"
          element={
            <SubAdminRoute>
              <SubAdminPanel />
            </SubAdminRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<SubAdminDashboard />} />

          
          {/* Nuevas rutas para los módulos */}
          <Route path="registrar-club" element={<SubAdminRegistrarClub />} />
          <Route path="registrar-comp" element={<SubAdminRegistrarCompetidor />} />
          <Route path="registrar-juez" element={<SubAdminRegistrarJuez />} />
          <Route path="jueces" element={<AdminJueces />} />
          <Route path="transferencias-propietario" element={<AdminTransferenciasPropietario />} />
          <Route path="torneos" element={<SubAdminTorneos />} />
        </Route>

        {/* ================= CLUB ================= */}
        <Route path="/club" element={<ClubPanel />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<ClubDashboard />} />
          <Route path="competidores" element={<ClubCompetidores />} />
          <Route path="robots" element={<ClubRobots />} />
          <Route path="transferencias" element={<ClubTransferencias />} />
          <Route path="solicitudes-ingreso" element={<ClubSolicitudesIngreso />} />
          <Route path="transferir-propietario" element={<ClubTransferirPropietario />} />
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
          <Route path="torneos" element={<CompetidorTorneos />} />
          <Route path="ranking" element={<CompetidorRanking />} />
          <Route path="inscripciones" element={<CompetidorInscripciones />} />
          <Route path="torneos/:idTorneo/categorias/:idCategoriaTorneo/inscribir" element={<CompetidorInscribir />} />
        </Route>

        {/* ================= JUECES ================= */}
        <Route path="/juez" element={<JuezPanel />}>

          {/* /juez → /juez/dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<JuezDashboard />} />
          <Route path="encuentros" element={<EncuentrosAsignados />} />
          <Route path="calificar/:idEncuentro" element={<CalificarEncuentro />} />

        </Route>

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
