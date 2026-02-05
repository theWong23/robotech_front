import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function AdminPanel() {

  const items = [
    { label: "Gestionar Usuarios", to: "usuarios" },
    { label: "Gestionar Torneos", to: "torneos" },
    { label: "Gestionar Jueces", to: "jueces" },
    { label: "Gestionar Clubes", to: "clubes" },
    { label: "Transferencias Propietario", to: "transferencias-propietario" },
    { label: "Gestionar Subadministrador", to: "subadmin" },
    { label: "Gestionar Robots", to: "robots" },
    { label: "Gestionar Encuentros", to: "encuentros"},
    { label: "Gestion de Coliseos", to: "Coliseos"},
    { label: "Gestion de Inscripciones", to: "Inscripciones" }
  ];

  return (
    <>
      <Navbar />

      <div className="d-flex">
        <Sidebar titulo="Panel Admin" items={items} />

        <div className="flex-grow-1 p-4">
          {/* 👇 AQUÍ SE RENDERIZA LA SUBRUTA */}
          <Outlet />

          
        </div>
      </div>
    </>
  );
}
