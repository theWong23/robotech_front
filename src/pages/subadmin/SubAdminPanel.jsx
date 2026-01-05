import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function SubAdminPanel() {

  const items = [
    { label: "Registrar Club", to: "registrar-club" },
    { label: "Registrar Competidor", to: "registrar-comp" },
    { label: "Registrar Juez", to: "registrar-juez" },
    { label: "Crear Torneo", to: "torneos" }
  ];

  return (
    <>
      <Navbar />

      <div className="d-flex">
        <Sidebar titulo="Panel SubAdmin" items={items} />

        <div className="flex-grow-1 p-4">
          {/* 👇 aquí se renderizan las subrutas */}
          <Outlet />
        </div>
      </div>
    </>
  );
}
