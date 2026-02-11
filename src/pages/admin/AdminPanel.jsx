import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import "../../styles/DashboardLayout.css";

export default function AdminPanel() {
  const items = [
    { label: "Gestionar Usuarios", to: "usuarios" },
    { label: "Gestionar Competidores", to: "competidores" },
    { label: "Gestionar Torneos", to: "torneos" },
    { label: "Gestionar Jueces", to: "jueces" },
    { label: "Gestionar Clubes", to: "clubes" },
    { label: "Transferencias Propietario", to: "transferencias-propietario" },
    { label: "Gestionar Subadministrador", to: "subadmin" },
    { label: "Gestionar Robots", to: "robots" },
    { label: "Gestionar Encuentros", to: "encuentros" },
    { label: "Gestion de Coliseos", to: "Coliseos" },
    { label: "Gestion de Inscripciones", to: "Inscripciones" }
  ];

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <div className="d-flex flex-grow-1 dashboard-container">
        <div className="sidebar-wrapper border-end bg-white">
          <Sidebar titulo="Panel Admin" items={items} />
        </div>

        <main className="flex-grow-1 p-4 content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
