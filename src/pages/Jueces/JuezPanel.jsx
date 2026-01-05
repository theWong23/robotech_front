import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function JuezPanel() {

  const items = [
    { label: "Torneos Asignados", to: "torneos" },
    { label: "Calificar Competidores", to: "calificar" }
  ];

  return (
    <>
      <Navbar />

      <div className="d-flex">
        <Sidebar titulo="Panel Juez" items={items} />

        <div className="flex-grow-1 p-4">
          {/* 👇 aquí se renderiza el contenido */}
          <Outlet />
        </div>
      </div>
    </>
  );
}
