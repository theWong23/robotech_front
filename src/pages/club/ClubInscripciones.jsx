import { useEffect, useState, useCallback, useMemo } from "react";
import Swal from "sweetalert2";
import { FaSearch, FaClipboardList, FaSync, FaCheckCircle, FaTimesCircle, FaSpinner } from "react-icons/fa";
import { obtenerInscripcionesClub } from "../../services/inscripcionesService";
import InscripcionCard from "../../components/InscripcionCard";

export default function ClubInscripciones() {

  // ============================
  // ESTADOS
  // ============================
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [busqueda, setBusqueda] = useState("");
  // Cambiamos el estado inicial a "TODOS" pero ahora filtrará por ACTIVA/ANULADA
  const [filtroEstado, setFiltroEstado] = useState("TODOS");

  // ============================
  // CARGAR DATOS (Sincronizado con el Backend)
  // ============================
  const cargarDatos = useCallback(() => {
    setLoading(true);

    const params = {
      busqueda: busqueda.trim(),
      // Enviamos el valor exacto que espera el Enum del Backend (ACTIVA/ANULADA)
      estado: filtroEstado !== "TODOS" ? filtroEstado : null
    };

    obtenerInscripcionesClub(params)
      .then(res => {
        setInscripciones(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error(err);
        const msg = err.response?.data?.mensaje || "No se pudo conectar con el servidor";
        Swal.fire("Error", msg, "error");
      })
      .finally(() => setLoading(false));
  }, [busqueda, filtroEstado]);

  // ============================
  // EFECTOS (Debounce)
  // ============================
  useEffect(() => {
    const timer = setTimeout(() => {
      cargarDatos();
    }, 500);
    return () => clearTimeout(timer);
  }, [cargarDatos]);

  // ============================
  // ESTADÍSTICAS (Sincronizadas con ACTIVA/ANULADA)
  // ============================
  const stats = useMemo(() => {
    return {
      total: inscripciones.length,
      // Ahora contamos según los nuevos estados de tu base de datos
      activas: inscripciones.filter(i => i.estado === "ACTIVA").length,
      anuladas: inscripciones.filter(i => i.estado === "ANULADA").length
    };
  }, [inscripciones]);

  return (
    <div className="container-fluid">
      
      {/* --- ENCABEZADO --- */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-0 text-dark">
            <FaClipboardList className="me-2 text-primary" />
            Mis Inscripciones
          </h2>
          <p className="text-muted mb-0">Gestiona el estado de tus robots en los torneos</p>
        </div>

        <button 
          className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
          onClick={cargarDatos}
          disabled={loading}
        >
          <FaSync className={loading ? "fa-spin" : ""} /> Actualizar
        </button>
      </div>

      {/* --- TARJETAS DE RESUMEN (KPIs Ajustados) --- */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm bg-primary text-white h-100">
            <div className="card-body text-center p-2">
              <h3 className="fw-bold mb-0">{stats.total}</h3>
              <small>Total Listados</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-4">
          <div className="card border-0 shadow-sm bg-success text-white h-100">
            <div className="card-body text-center p-2">
              <h3 className="fw-bold mb-0">{stats.activas}</h3>
              <small><FaCheckCircle className="me-1"/> Solo Activas</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-4">
          <div className="card border-0 shadow-sm bg-danger text-white h-100">
            <div className="card-body text-center p-2">
              <h3 className="fw-bold mb-0">{stats.anuladas}</h3>
              <small><FaTimesCircle className="me-1"/> Solo Anuladas</small>
            </div>
          </div>
        </div>
      </div>

      {/* --- BARRA DE HERRAMIENTAS (Filtros Server-Side) --- */}
      <div className="card shadow-sm border-0 mb-4 bg-white">
        <div className="card-body p-3">
          <div className="row g-3">
            <div className="col-md-8">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0"><FaSearch className="text-muted"/></span>
                <input 
                  type="text" 
                  className="form-control border-start-0 bg-light" 
                  placeholder="Buscar robot o torneo en el servidor..." 
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>
            
            <div className="col-md-4">
              <select 
                className="form-select bg-light" 
                value={filtroEstado} 
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="TODOS">Todas las inscripciones</option>
                {/* Valores sincronizados con el Enum del Backend */}
                <option value="ACTIVA">Activas</option>
                <option value="ANULADA">Anuladas</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* --- GRID DE RESULTADOS --- */}
      {loading ? (
        <div className="text-center py-5">
          <FaSpinner className="spinner-border text-primary" role="status" />
          <p className="mt-2 text-muted">Consultando base de datos...</p>
        </div>
      ) : (
        <>
          {inscripciones.length === 0 ? (
            <div className="text-center py-5 bg-light rounded border border-dashed">
              <h4 className="text-muted">No se encontraron inscripciones</h4>
              <p className="text-muted small">No hay coincidencias en el servidor.</p>
            </div>
          ) : (
            <div className="row g-4">
              {inscripciones.map(inscripcion => (
                <div key={inscripcion.idInscripcion} className="col-md-6 col-lg-4 col-xxl-3">
                  <InscripcionCard inscripcion={inscripcion} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}