import { Outlet } from "react-router-dom";
import { FaUsers, FaRobot, FaExchangeAlt, FaTrophy, FaClipboardList, FaChartLine } from "react-icons/fa"; 
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

// Reutilizamos el CSS del panel anterior para no repetir código.
// Si prefieres, renombra "CompetidorPanel.css" a "Dashboard.css" en tu carpeta styles.
import "../../styles/DashboardLayout.css";

export default function ClubPanel() {

  const items = [
    { label: "Gestión Competidores", to: "competidores", icon: <FaUsers /> },
    { label: "Flota de Robots", to: "robots", icon: <FaRobot /> },
    { label: "Transferencias", to: "transferencias", icon: <FaExchangeAlt /> },
    { label: "Torneos Disponibles", to: "torneos", icon: <FaTrophy /> },
    { label: "Inscripciones", to: "inscripciones", icon: <FaClipboardList /> },
    { label: "Estadísticas", to: "estadisticas", icon: <FaChartLine /> } // Agregué uno extra útil para clubes
  ];

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* 1. Navbar Superior */}
      <Navbar />

      {/* 2. Contenedor Principal (Layout Dashboard) */}
      <div className="d-flex flex-grow-1 dashboard-container">
        
        {/* Sidebar Izquierdo */}
        <div className="sidebar-wrapper border-end bg-white">
          <Sidebar titulo="Panel del Club" items={items} />
        </div>

        {/* Área de Contenido Dinámico */}
        <main className="flex-grow-1 p-4 content-area">
          <div className="container-fluid">
            {/* Animación de entrada para el contenido */}
            <div className="fade-in-content">
               <Outlet />
            </div>
          </div>
        </main>

      </div>
    </div>
  );
}