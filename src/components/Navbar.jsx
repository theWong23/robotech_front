import { useContext } from "react";
import { NavLink, Link } from "react-router-dom"; // Importamos los componentes de router
import AuthContext from "../context/AuthContext";
import "../styles/navbar.css"; // Descomenta esta linea si guardaste el CSS en un archivo aparte

export default function Navbar() {

  const { user, roles, logout } = useContext(AuthContext);

  const hasRole = (role) => Array.isArray(roles) && roles.includes(role);
  const isLogged = Array.isArray(roles) && roles.length > 0;

  // Funcion helper: Si la ruta coincide, React Router pone isActive = true.
  // El CSS se encarga del resto (subrayado, negrita, color).
  const getNavLinkClass = ({ isActive }) => 
    isActive ? "nav-link active" : "nav-link";

  return (
    // Agregamos la clase personalizada 'robotech-navbar' para el degradado y sombras
    <nav className="navbar navbar-expand-lg robotech-navbar sticky-top">
      <div className="container">

        {/* Logo: Usamos Link para evitar recarga de pagina */}
        <Link className="navbar-brand" to="/">
          <img 
            src="/img/logo.jpg" 
            alt="Logo Robotech" 
            height="50" 
            className="d-inline-block align-text-top rounded" // Clases extra para mejor alineacion
          />
        </Link>

        {/* Boton hamburguesa para moviles */}
        <button 
          className="navbar-toggler custom-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navBar" 
          aria-controls="navBar" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
          style={{ border: 'none', filter: 'brightness(0) invert(1)' }} // Hace el icono blanco
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navBar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">

            {/* Enlaces Publicos */}
            <li className="nav-item">
              <NavLink className={getNavLinkClass} to="/">Inicio</NavLink>
            </li>

            <li className="nav-item">
              <NavLink className={getNavLinkClass} to="/torneos">Torneos</NavLink>
            </li>

            <li className="nav-item">
              <NavLink className={getNavLinkClass} to="/clubes">Clubes</NavLink>
            </li>

            <li className="nav-item">
              <NavLink className={getNavLinkClass} to="/competidores">Competidores</NavLink>
            </li>

            <li className="nav-item">
              <NavLink className={getNavLinkClass} to="/robots">Robots</NavLink>
            </li>

            <li className="nav-item">
              <NavLink className={getNavLinkClass} to="/rankings">Rankings</NavLink>
            </li>


            {/* --- Opciones Condicionales por ROL --- */}

            {hasRole("ADMINISTRADOR") && (
              <li className="nav-item">
                <NavLink className={getNavLinkClass} to="/admin">Panel Admin</NavLink>
              </li>
            )}

            {hasRole("SUBADMINISTRADOR") && (
              <li className="nav-item">
                <NavLink className={getNavLinkClass} to="/subadmin">Panel SubAdmin</NavLink>
              </li>
            )}

            {hasRole("COMPETIDOR") && (
              <li className="nav-item">
                <NavLink className={getNavLinkClass} to="/competidor">Mi Perfil</NavLink>
              </li>
            )}

            {hasRole("JUEZ") && (
              <li className="nav-item">
                <NavLink className={getNavLinkClass} to="/juez">Panel Juez</NavLink>
              </li>
            )}

            {hasRole("CLUB") && (
              <li className="nav-item">
                <NavLink className={getNavLinkClass} to="/club">Panel Club</NavLink>
              </li>
            )}

          </ul>

          {/* --- Botones de Accion (Derecha) --- */}
          <div className="d-flex align-items-center gap-2">

            {!isLogged ? (
              // Si NO hay usuario logueado
              <>
                <Link className="btn btn-custom-outline fw-bold px-4" to="/login">
                  Ingresar
                </Link>
                <Link className="btn btn-warning fw-bold text-white px-4 shadow-sm" to="/register">
                  Registrate
                </Link>
              </>
            ) : (
              // Si HAY usuario logueado
              <div className="d-flex align-items-center gap-3">
                {/* Opcional: Mostrar nombre del usuario */}
                <span className="text-white d-none d-lg-block">
                  Hola, <strong>{user?.nombre || "Usuario"}</strong>
                </span>
                
                <button 
                  className="btn btn-outline-light btn-sm" 
                  onClick={logout}
                >
                  Cerrar Sesion
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
}
