import { useEffect, useState } from "react";
import { FaSync, FaExclamationTriangle, FaGavel } from "react-icons/fa"; // Iconos para UI
import api from "../../services/api";
import EncuentroCard from "../../components/juez/EncuentroCard";

export default function EncuentrosAsignados() {
  const [encuentros, setEncuentros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Estado para manejar fallos

  // Función extraída para poder re-llamarla con el botón de actualizar
  const fetchEncuentros = () => {
    setLoading(true);
    setError(null);

    api.get("/juez/encuentros")
      .then(res => {
        setEncuentros(res.data);
      })
      .catch(err => {
        console.error(err);
        setError("No se pudieron cargar los encuentros. Verifica tu conexión.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEncuentros();
  }, []);

  return (
    <div className="container-fluid">
      
      {/* --- ENCABEZADO --- */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0 text-dark">
            <FaGavel className="me-2 text-info" /> {/* Icono temático */}
            Torneos Asignados
          </h2>
          <small className="text-muted">Gestiona y califica tus batallas pendientes</small>
        </div>

        {/* Botón de Refrescar */}
        <button 
          className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
          onClick={fetchEncuentros}
          disabled={loading}
        >
          <FaSync className={loading ? "fa-spin" : ""} />
          Actualizar
        </button>
      </div>

      {/* --- ESTADO DE ERROR --- */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <FaExclamationTriangle className="me-2" />
          <div>{error}</div>
        </div>
      )}

      {/* --- ESTADO DE CARGA --- */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-info" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Obteniendo asignaciones...</p>
        </div>
      )}

      {/* --- ESTADO VACÍO --- */}
      {!loading && !error && encuentros.length === 0 && (
        <div className="text-center py-5 bg-white rounded shadow-sm border">
          <div className="display-1 text-muted mb-3">📭</div>
          <h4>Todo listo por aquí</h4>
          <p className="text-muted">No tienes encuentros pendientes de calificación en este momento.</p>
        </div>
      )}

      {/* --- LISTA DE ENCUENTROS (GRID) --- */}
      {!loading && !error && encuentros.length > 0 && (
        <div className="row g-4"> {/* g-4 da espacio entre tarjetas */}
          {encuentros.map((encuentro) => (
            // Adaptable: 1 columna en móvil, 2 en tablet, 3 en escritorio grande
            <div key={encuentro.idEncuentro} className="col-12 col-md-6 col-xl-4 animate__animated animate__fadeIn">
              <EncuentroCard encuentro={encuentro} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}