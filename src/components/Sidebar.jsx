import { NavLink } from "react-router-dom";
import "../styles/Sidebar.css";

export default function Sidebar({ items, titulo }) {
  return (
    <div className="sidebar p-3 h-100">
      
      {/* Encabezado del Sidebar */}
      <div className="sidebar-header mb-4 ps-2">
        <h4 className="fw-bold m-0" style={{ color: '#00b3b3' }}>{titulo}</h4>
        <small className="text-muted">Menú Principal</small>
      </div>

      <ul className="list-unstyled">
        {items.map((item, i) => (
          <li key={i} className="mb-2">
            <NavLink 
              to={item.to} 
              className={({ isActive }) => 
                isActive ? "sidebar-link active" : "sidebar-link"
              }
              // 'end' asegura que la coincidencia de ruta sea exacta (útil si hay subrutas)
              end 
            >
              {/* Icono (si existe) */}
              {item.icon && <span className="icon-wrapper me-3">{item.icon}</span>}
              
              {/* Texto */}
              <span className="link-text">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}