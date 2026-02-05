import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { FaCalendarAlt, FaRobot, FaSync, FaTags, FaTrophy } from "react-icons/fa";
import { obtenerMisTorneosCompetidor } from "../../services/torneoService";

const estadoConfig = {
  ACTIVADA: { color: "success", label: "Activa" },
  ANULADA: { color: "danger", label: "Anulada" },
};

export default function CompetidorTorneos() {
  const [torneos, setTorneos] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(() => {
    setLoading(true);
    obtenerMisTorneosCompetidor()
      .then((res) => {
        setTorneos(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error(err);
        Swal.fire("Error", "No se pudieron cargar tus torneos", "error");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const formatearRango = (inicio, fin) => {
    if (inicio && fin) return `${inicio} al ${fin}`;
    if (inicio) return inicio;
    if (fin) return fin;
    return "Por definir";
  };

  return (
    <div className="container-fluid">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-0 text-dark">
            <FaTrophy className="me-2 text-warning" />
            Mis Torneos
          </h2>
          <p className="text-muted mb-0">Torneos en los que participas o participaste</p>
        </div>

        <div className="d-flex gap-2">
          <Link to="/torneos" className="btn btn-primary d-flex align-items-center gap-2 shadow-sm">
            <FaTrophy /> Ver Torneos
          </Link>
          <button
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            onClick={cargar}
            disabled={loading}
          >
            <FaSync className={loading ? "fa-spin" : ""} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3 text-muted">Cargando tus torneos...</p>
        </div>
      ) : torneos.length === 0 ? (
        <div className="text-center py-5 bg-light rounded border border-dashed">
          <div className="mb-3 text-muted opacity-50"><FaTrophy size={50} /></div>
          <h4 className="fw-bold">Aun no tienes torneos</h4>
          <p className="text-muted">Inscribete para empezar a competir.</p>
          <Link to="/torneos" className="btn btn-outline-primary mt-2">
            Explorar Torneos
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {torneos.map((t) => (
            <div key={t.idTorneo} className="col-12 col-md-6 col-xl-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="fw-bold text-dark mb-0">{t.nombre}</h5>
                    <div className="d-flex flex-wrap gap-1">
                      {(t.estadosInscripcion || []).map((estado) => {
                        const config = estadoConfig[estado] || { color: "secondary", label: estado };
                        return (
                          <span key={estado} className={`badge bg-${config.color}`}>
                            {config.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="text-muted small mb-3">
                    <FaCalendarAlt className="me-1" />
                    Fecha: {formatearRango(t.fechaInicio, t.fechaFin)}
                  </div>

                  <div className="bg-light p-2 rounded mb-3">
                    <div className="small d-flex align-items-center gap-2">
                      <FaTags className="text-primary" />
                      <span className="fw-semibold">Categorias:</span>
                      <span>{(t.categorias || []).filter(Boolean).join(", ") || "-"}</span>
                    </div>
                    <div className="small d-flex align-items-center gap-2 mt-1">
                      <FaTags className="text-secondary" />
                      <span className="fw-semibold">Modalidades:</span>
                      <span>{(t.modalidades || []).filter(Boolean).join(", ") || "-"}</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="small fw-bold text-secondary mb-1">
                      <FaRobot className="me-1" /> Robots inscritos
                    </div>
                    <div className="small text-dark">
                      {(t.robots || []).length > 0
                        ? (t.robots || []).slice(0, 3).join(", ") + ((t.robots || []).length > 3 ? ` y ${(t.robots || []).length - 3} mas` : "")
                        : "-"}
                    </div>
                  </div>

                  <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                    <small className="text-muted">Inscripciones: {t.inscripciones ?? 0}</small>
                    <Link to="/competidor/inscripciones" className="btn btn-link btn-sm p-0 text-decoration-none">
                      Ver detalle
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
