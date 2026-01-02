import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function ClubPanel() {

  const items = [
    { label: "Mis Competidores", to: "competidores" },
    { label: "Mis Robots", to: "robots" },
    { label: "Transferencias", to: "transferencias" },
    { label: "Torneos Disponibles", to: "torneos" },
    {label: "Inscripciones", to: "inscripciones"}
  ];

  return (
    <>
      <Navbar />

      <div className="d-flex">
        <Sidebar titulo="Panel del Club" items={items} />

        <div className="flex-grow-1 p-4">
          {/* 👇 AQUÍ SE CARGA LO DINÁMICO */}
          <Outlet />
        </div>
      </div>
    </>
  );
}
