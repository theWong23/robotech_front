import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaTrophy, FaHashtag, FaClock, FaRobot } from "react-icons/fa";

export default function EncuentroCard({ encuentro }) {
  
  // Función auxiliar para definir el color del badge según el estado
  const getStatusBadge = (estado) => {
    switch (estado) {
      case "PROGRAMADO": return "badge bg-info-subtle text-info border border-info-subtle"; 
      case "EN_CURSO": return "badge bg-success"; 
      case "FINALIZADO": return "badge bg-secondary-subtle text-secondary border border-secondary-subtle"; 
      default: return "badge bg-primary";
    }
  };

  const isFinished = encuentro.estado === "FINALIZADO";

  return (
    <div className="card h-100 border-0 shadow-sm hover-card transition-all">
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
        {/* ✅ NOMBRE DEL TORNEO (Título principal) */}
        <h5 className="card-title fw-bold text-dark mb-1">
          <FaTrophy className="me-2 text-warning" />
          {encuentro.nombreTorneo || "Torneo Robotech"}
        </h5>
        
        {/* Tipo de encuentro y Categoría */}
        <p className="text-primary small fw-bold mb-3">
          {encuentro.tipo} — <span className="text-muted">{encuentro.categoria}</span>
        </p>

        {/* Ubicación */}
        <div className="d-flex align-items-center text-secondary mb-3">
          <FaMapMarkerAlt className="me-2 text-danger" />
          <span className="small">{encuentro.coliseo}</span>
        </div>

        {/* ✅ NOMBRES DE LOS PARTICIPANTES (Vista previa) */}
        <div className="bg-light p-2 rounded">
          <div className="d-flex align-items-center justify-content-center gap-2 small fw-bold">
            <span className="text-truncate" title={encuentro.participantes[0]?.nombre}>
              {encuentro.participantes[0]?.nombre || "Robot A"}
            </span>
            <span className="text-muted">vs</span>
            <span className="text-truncate" title={encuentro.participantes[1]?.nombre}>
              {encuentro.participantes[1]?.nombre || "Robot B"}
            </span>
          </div>
        </div>
      </div>

      {/* --- PIE DE TARJETA (BOTÓN) --- */}
      <div className="card-footer bg-transparent border-0 pb-3">
        {isFinished ? (
          <button className="btn btn-secondary w-100 opacity-75" disabled>
            <FaClock className="me-2" />
            Encuentro Finalizado
          </button>
        ) : (
          <Link
            to={`/juez/calificar/${encuentro.idEncuentro}`}
            className="btn btn-primary w-100 fw-bold shadow-sm d-flex align-items-center justify-content-center"
            style={{ backgroundColor: '#00b3b3', borderColor: '#00b3b3' }}
          >
            <FaClock className="me-2" />
            Calificar Encuentro
          </Link>
        )}
      </div>
    </div>
  );
}