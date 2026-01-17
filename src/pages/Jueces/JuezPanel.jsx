import { Outlet } from "react-router-dom";
import { FaHome, FaGavel, FaClipboardCheck } from "react-icons/fa"; // Iconos: Casa, Mazo (Juez), Lista
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

// Reutilizamos el mismo CSS para mantener la consistencia visual
import "../../styles/DashboardLayout.css"; 

export default function JuezPanel() {

  // Definimos solo las opciones de navegación principales.
  // NOTA: La ruta "calificar/:idEncuentro" NO va aquí, 
  // porque depende de qué encuentro seleccione el juez en la lista.
  const items = [
    { 
      label: "Inicio", 
      to: "dashboard", 
      icon: <FaHome /> 
    },
    { 
      label: "Encuentros Asignados", 
      to: "encuentros", 
      icon: <FaGavel /> // El mazo es el icono universal de Juez
    },
    // Podrías agregar un historial si tuvieras esa ruta
    // { label: "Historial", to: "historial", icon: <FaClipboardCheck /> }
  ];

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* 1. Navbar Superior */}
      <Navbar />

      {/* 2. Estructura del Dashboard */}
      <div className="d-flex flex-grow-1 dashboard-container">
        
        {/* Sidebar Izquierdo */}
        <div className="sidebar-wrapper border-end bg-white">
          <Sidebar titulo="Panel de Juez" items={items} />
        </div>

        {/* Área de Contenido Dinámico */}
        <main className="flex-grow-1 p-4 content-area">
          <div className="container-fluid">
            {/* Animación de entrada suave */}
            <div className="fade-in-content">
               {/* Aquí se cargarán: JuezDashboard, EncuentrosAsignados o CalificarEncuentro */}
               <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}