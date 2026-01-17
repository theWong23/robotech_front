import { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { FaClipboardList, FaSearch, FaSync, FaTrophy, FaRobot, FaCheckCircle, FaSpinner, FaTimesCircle } from "react-icons/fa";
import { obtenerInscripcionesCompetidor } from "../../services/inscripcionesService";
import InscripcionCard from "../../components/InscripcionCard";

export default function CompetidorInscripciones() {

  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros para el servidor
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODOS");

  // ============================
  // CARGA DE DATOS (Server-side)
  // ============================
  const cargarDatos = useCallback(() => {
    setLoading(true);

    const params = {
      busqueda: busqueda.trim(),
      estado: filtroEstado !== "TODOS" ? filtroEstado : null
    };

    obtenerInscripcionesCompetidor(params)
      .then(res => {
        setInscripciones(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error(err);
        Swal.fire("Error", "No se pudieron obtener tus inscripciones", "error");
      })
      .finally(() => setLoading(false));
  }, [busqueda, filtroEstado]);

  // ============================
  // EFECTO DEBUNCE
  // ============================
  useEffect(() => {
    const timer = setTimeout(() => {
      cargarDatos();
    }, 400); // 400ms para que se sienta fluido
    return () => clearTimeout(timer);
  }, [cargarDatos]);

  // ============================
  // ESTADÍSTICAS (KPIs)
  // ============================
  const stats = useMemo(() => {
    return {
      total: inscripciones.length,
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
          <p className="text-muted mb-0">Seguimiento de tus postulaciones a torneos</p>
        </div>

        <div className="d-flex gap-2">
          <Link to="/torneos" className="btn btn-primary d-flex align-items-center gap-2 shadow-sm">
            <FaTrophy /> Nuevo Torneo
          </Link>
          <button 
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            onClick={cargarDatos}
            disabled={loading}
          >
            <FaSync className={loading ? "fa-spin" : ""} />
          </button>
        </div>
      </div>

      {/* --- TARJETAS DE RESUMEN (KPIs) --- */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm bg-white border-start border-4 border-primary h-100">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <h6 className="text-muted mb-1">Total Listados</h6>
                <h3 className="fw-bold mb-0">{stats.total}</h3>
              </div>
              <FaRobot className="text-primary opacity-25" size={40} />
            </div>
          </div>
        </div>
        <div className="col-6 col-md-4">
          <div className="card border-0 shadow-sm bg-white border-start border-4 border-success h-100">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <h6 className="text-muted mb-1">Activas</h6>
                <h3 className="fw-bold mb-0">{stats.activas}</h3>
              </div>
              <FaCheckCircle className="text-success opacity-25" size={40} />
            </div>
          </div>
        </div>
        <div className="col-6 col-md-4">
          <div className="card border-0 shadow-sm bg-white border-start border-4 border-danger h-100">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <h6 className="text-muted mb-1">Anuladas</h6>
                <h3 className="fw-bold mb-0">{stats.anuladas}</h3>
              </div>
              <FaTimesCircle className="text-danger opacity-25" size={40} />
            </div>
          </div>
        </div>
      </div>

      {/* --- FILTROS SERVER-SIDE --- */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-3">
          <div className="row g-3">
            <div className="col-md-8">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0"><FaSearch className="text-muted"/></span>
                <input 
                  type="text" 
                  className="form-control border-start-0" 
                  placeholder="Buscar robot o torneo en el servidor..." 
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select 
                className="form-select" 
                value={filtroEstado} 
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="TODOS">Todos los estados</option>
                <option value="ACTIVA">Activas</option>
                <option value="ANULADA">Anuladas</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* --- CONTENIDO --- */}
      {loading ? (
        <div className="text-center py-5">
          <FaSpinner className="spinner-border text-primary" role="status" />
          <p className="mt-3 text-muted">Consultando base de datos...</p>
        </div>
      ) : (
        <>
          {inscripciones.length === 0 ? (
            <div className="text-center py-5 bg-light rounded border border-dashed">
              <div className="mb-3 text-muted opacity-50"><FaClipboardList size={50}/></div>
              <h4 className="fw-bold">Sin resultados</h4>
              <p className="text-muted">No encontramos inscripciones con esos criterios.</p>
              <Link to="/torneos" className="btn btn-outline-primary mt-2">
                Ver Torneos Disponibles
              </Link>
            </div>
          ) : (
            <div className="row g-4">
              {inscripciones.map(i => (
                <div key={i.idInscripcion} className="col-md-6 col-lg-4 col-xl-3 animate__animated animate__fadeIn">
                  <InscripcionCard inscripcion={i} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}