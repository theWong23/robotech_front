import { Outlet } from "react-router-dom";
// 1. Importamos los iconos que vamos a usar
import { FaUser, FaRobot, FaTrophy, FaListOl, FaClipboardList } from "react-icons/fa";

import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import "../../styles/DashboardLayout.css";

export default function CompetidorPanel() {

  // 2. Agregamos la propiedad 'icon' a cada objeto
  const items = [
    { 
      label: "Mi Perfil", 
      to: "dashboard", 
      icon: <FaUser />         // Icono de usuario
    },
    { 
      label: "Mis Robots", 
      to: "robots", 
      icon: <FaRobot />        // Icono de robot
    },
    { 
      label: "Mis Torneos", 
      to: "torneos", 
      icon: <FaTrophy />       // Trofeo/Copa
    },
    { 
      label: "Ranking Global", 
      to: "ranking", 
      icon: <FaListOl />       // Lista numerada
    },
    { 
      label: "Inscripciones", 
      to: "inscripciones", 
      icon: <FaClipboardList /> // Tabla con clip
    }
  ];

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Navbar Fijo arriba */}
      <Navbar />

      {/* Contenedor Principal */}
      <div className="d-flex flex-grow-1 dashboard-container">
        
        {/* Sidebar a la izquierda */}
        <div className="sidebar-wrapper border-end bg-white">
          <Sidebar titulo="Panel Competidor" items={items} />
        </div>

        {/* Área de Contenido Dinámico */}
        <main className="flex-grow-1 p-4 content-area">
          <div className="container-fluid">
            
            {/* Animación y Outlet */}
            <div className="fade-in-content">
               <Outlet />
            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
}