import { FaRobot, FaCalendarAlt, FaInfoCircle } from "react-icons/fa";

export default function InscripcionCard({ inscripcion }) {
  // 1. Sincronizamos los colores con los estados ACTIVA y ANULADA de SQL
  const estadoConfig = {
    ACTIVA: { color: "success", label: "Activa" },
    ANULADA: { color: "danger", label: "Anulada" },
  };

  const config = estadoConfig[inscripcion.estado] || { color: "secondary", label: inscripcion.estado };

  return (
    <div className="card shadow-sm border-0 h-100 animate__animated animate__fadeIn">
      {/* Indicador de estado en la parte superior */}
      <div className={`card-header bg-${config.color} py-1`}></div>

      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h5 className="fw-bold text-dark mb-0">{inscripcion.torneo}</h5>
          <span className={`badge rounded-pill bg-${config.color}`}>
            {config.label}
          </span>
        </div>

        {/* 2. Mostramos la Fecha del Torneo (Nuevo campo del DTO) */}
        <div className="text-muted small mb-3">
          <FaCalendarAlt className="me-1" /> 
          Fecha: {inscripcion.torneoFecha || "Por definir"}
        </div>

        <div className="bg-light p-2 rounded mb-3">
          <p className="mb-1 small">
            <strong>Categoría:</strong> {inscripcion.categoria}
          </p>
          <p className="mb-0 small">
            <strong>Modalidad:</strong> {inscripcion.modalidad}
          </p>
        </div>

        <div className="mb-3">
          <p className="mb-1 small fw-bold text-secondary">
            <FaRobot className="me-1" /> Robots Inscritos:
          </p>
          <ul className="list-unstyled mb-0 ms-2">
            {inscripcion.robots.map((r, i) => (
              <li key={i} className="small text-dark">• {r}</li>
            ))}
          </ul>
        </div>

        {/* 3. Mostramos la Fecha de Registro (Nuevo campo del DTO) */}
        <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
          <small className="text-muted italic">
            Inscrito el: {inscripcion.fechaRegistro || "---"}
          </small>
          <button className="btn btn-link btn-sm p-0 text-decoration-none">
            <FaInfoCircle /> Detalles
          </button>
        </div>
      </div>
    </div>
  );
}