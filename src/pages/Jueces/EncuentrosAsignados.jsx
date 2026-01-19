import { useEffect, useState } from "react";
import { FaSync, FaExclamationTriangle, FaGavel } from "react-icons/fa";
import api from "../../services/api";
import EncuentroCard from "../../components/juez/EncuentroCard";

export default function EncuentrosAsignados() {
  const [encuentros, setEncuentros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEncuentros = () => {
    setLoading(true);
    setError(null);

    api.get("/juez/encuentros")
      .then(res => {
        // Aseguramos que res.data sea un array antes de guardar
        setEncuentros(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => {
        console.error("Error al obtener encuentros:", err);
        setError("No se pudieron cargar los encuentros. Verifica tu conexión.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEncuentros();
    // ✅ OPCIONAL: Asegura que al cargar la lista estemos arriba de la página
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container-fluid py-4">
      {/* ENCABEZADO */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0 text-dark">
            <FaGavel className="me-2 text-info" />
            Encuentros Asignados
          </h2>
          <small className="text-muted">Gestiona y califica tus batallas pendientes</small>
        </div>

        <button 
          className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 shadow-sm"
          onClick={fetchEncuentros}
          disabled={loading}
        >
          <FaSync className={loading ? "fa-spin" : ""} />
          Actualizar
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center border-0 shadow-sm animate__animated animate__shakeX" role="alert">
          <FaExclamationTriangle className="me-2" />
          <div>{error}</div>
        </div>
      )}

      {/* CARGANDO */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-info" role="status" style={{ width: "3rem", height: "3rem" }}></div>
          <p className="mt-3 text-muted fw-bold">Obteniendo asignaciones...</p>
        </div>
      )}

      {/* VACÍO */}
      {!loading && !error && encuentros.length === 0 && (
        <div className="text-center py-5 bg-white rounded shadow-sm border animate__animated animate__fadeIn">
          <div className="display-1 text-muted mb-3" style={{opacity: 0.3}}>📭</div>
          <h4 className="fw-bold text-secondary">Todo listo por aquí</h4>
          <p className="text-muted">No tienes encuentros pendientes de calificación.</p>
        </div>
      )}

      {/* GRID (CON MAPEO SEGURO) */}
      {!loading && !error && encuentros.length > 0 && (
        <div className="row g-4">
          {encuentros.map((encuentro) => (
            // Usamos un ID único y seguro para la key
            <div key={encuentro.idEncuentro || Math.random()} className="col-12 col-md-6 col-xl-4 animate__animated animate__fadeInUp">
              <EncuentroCard encuentro={encuentro} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}