import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaTrophy, FaHashtag, FaClock } from "react-icons/fa";

export default function EncuentroCard({ encuentro }) {
  
  // Función auxiliar para definir el color del badge según el estado
  const getStatusBadge = (estado) => {
    switch (estado) {
      case "PENDIENTE": return "badge bg-warning text-dark"; // Amarillo
      case "EN CURSO": return "badge bg-success"; // Verde
      case "FINALIZADO": return "badge bg-secondary"; // Gris
      default: return "badge bg-primary";
    }
  };

  const isFinished = encuentro.estado === "FINALIZADO";

  return (
    <div className="card h-100 border-0 shadow-sm hover-card">
      {/* --- CABECERA DE LA TARJETA --- */}
      <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center pt-3">
        <span className="badge bg-light text-secondary border">
          <FaHashtag className="me-1" /> {encuentro.idEncuentro}
        </span>
        <span className={getStatusBadge(encuentro.estado)}>
          {encuentro.estado}
        </span>
      </div>

      {/* --- CUERPO --- */}
      <div className="card-body">
        <h5 className="card-title fw-bold text-dark mb-1">
          {encuentro.tipo}
        </h5>
        <p className="text-muted small mb-3">
          <FaTrophy className="me-1 text-warning" /> 
          Categoría: {encuentro.categoria}
        </p>

        <div className="d-flex align-items-center text-secondary mb-2">
          <FaMapMarkerAlt className="me-2 text-danger" />
          <span>{encuentro.coliseo}</span>
        </div>
      </div>

      {/* --- PIE DE TARJETA (BOTÓN) --- */}
      <div className="card-footer bg-transparent border-0 pb-3">
        {isFinished ? (
          <button className="btn btn-secondary w-100" disabled>
            <FaClock className="me-2" />
            Finalizado
          </button>
        ) : (
          <Link
            to={`/juez/calificar/${encuentro.idEncuentro}`}
            className="btn btn-primary w-100 fw-bold shadow-sm"
            style={{ backgroundColor: '#00b3b3', borderColor: '#00b3b3' }} // Tu color turquesa
          >
            <FaClock className="me-2" />
            Calificar Encuentro
          </Link>
        )}
      </div>
    </div>
  );
}