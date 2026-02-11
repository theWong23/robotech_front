import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import "../../styles/DashboardLayout.css";

export default function SubAdminPanel() {
  const items = [
    { label: "Registrar Club", to: "registrar-club" },
    { label: "Registrar Competidor", to: "registrar-comp" },
    { label: "Registrar Juez", to: "registrar-juez" },
    { label: "Gestionar Jueces", to: "jueces" },
    { label: "Transferencias Propietario", to: "transferencias-propietario" },
    { label: "Crear Torneo", to: "torneos" }
  ];

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <div className="d-flex flex-grow-1 dashboard-container">
        <div className="sidebar-wrapper border-end bg-white">
          <Sidebar titulo="Panel SubAdmin" items={items} />
        </div>

        <main className="flex-grow-1 p-4 content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
