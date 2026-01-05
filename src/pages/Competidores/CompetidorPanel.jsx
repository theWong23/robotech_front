import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function CompetidorPanel() {

  const items = [
    { label: "Mi perfil", to: "dashboard" },
    { label: "Mis Robots", to: "robots" },
    { label: "Mis Torneos", to: "torneos" },
    { label: "Ranking", to: "ranking" },
    { label: "Inscripciones", to: "inscripciones"}
  ];

  return (
    <>
      <Navbar />

      <div className="d-flex">
        <Sidebar titulo="Panel Competidor" items={items} />

        <div className="flex-grow-1 p-4">
          {/* 👇 contenido dinámico */}
          <Outlet />
        </div>
      </div>
    </>
  );
}
