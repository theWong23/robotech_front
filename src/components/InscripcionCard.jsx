export default function InscripcionCard({ inscripcion }) {
  const estadoColor = {
    PENDIENTE: "warning",
    APROBADO: "success",
    RECHAZADO: "danger"
  };

  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-body">
        <h5 className="fw-bold">{inscripcion.torneo}</h5>

        <p className="mb-1">
          <strong>Categoría:</strong> {inscripcion.categoria}
        </p>

        <p className="mb-1">
          <strong>Modalidad:</strong> {inscripcion.modalidad}
        </p>

        <p className="mb-1">
          <strong>Robots:</strong>
        </p>

        <ul className="mb-2">
          {inscripcion.robots.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>

        <span className={`badge bg-${estadoColor[inscripcion.estado]}`}>
          {inscripcion.estado}
        </span>
      </div>
    </div>
  );
}
