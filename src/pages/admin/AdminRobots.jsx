import { useEffect, useMemo, useState, useCallback } from "react";
import Swal from "sweetalert2";
import { FaSearch, FaRobot, FaFilter, FaSync, FaEraser, FaUsers, FaBuilding, FaMicrochip } from "react-icons/fa";
// Ensure these service functions point to your API endpoints correctly
import { listarRobotsAdmin, listarClubesAdmin } from "../../services/adminRobotsService";

export default function AdminRobots() {
  // =========================
  // ESTADOS
  // =========================
  const [robots, setRobots] = useState([]);
  const [clubes, setClubes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRobots, setTotalRobots] = useState(0);

  // Filtros locales (Estado del formulario)
  const [filtros, setFiltros] = useState({
    nombre: "",
    categoria: "",
    idClub: ""
  });

  // =========================
  // NORMALIZACIÓN DE FILTROS
  // =========================
  // Prepara los datos para enviarlos limpios al backend
  const filtrosNormalizados = useMemo(() => ({
    nombre: filtros.nombre?.trim() || null,
    categoria: filtros.categoria || null,
    idClub: filtros.idClub || null
  }), [filtros]);

  // =========================
  // CARGA DE DATOS (Delegada al Servicio)
  // =========================
  const cargarRobots = useCallback(async (params) => {
    setLoading(true);
    try {
      // El backend recibe los filtros y devuelve la lista ya procesada
      const data = await listarRobotsAdmin({
        ...params,
        page: page - 1,
        size: 20
      });
      setRobots(Array.isArray(data?.content) ? data.content : []);
      setTotalPages(data?.totalPages ?? 1);
      setTotalRobots(data?.totalElements ?? 0);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudieron cargar los robots desde el servidor", "error");
    } finally {
      setLoading(false);
    }
  }, [page]);

  // 1. Cargar lista de clubes (Select) al montar
  useEffect(() => {
    listarClubesAdmin()
      .then(data => setClubes(data || []))
      .catch(err => console.error("Error cargando clubes", err));
  }, []);

  // 2. Debounce para búsqueda automática por nombre
  // Espera 500ms antes de pedirle al backend que filtre
  useEffect(() => {
    const timer = setTimeout(() => {
      cargarRobots(filtrosNormalizados);
    }, 500);
    return () => clearTimeout(timer);
  }, [filtrosNormalizados, cargarRobots]);

  useEffect(() => {
    setPage(1);
  }, [filtrosNormalizados]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages || 1);
  }, [page, totalPages]);

  // =========================
  // HANDLERS
  // =========================
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const limpiarFiltros = () => {
    setFiltros({ nombre: "", categoria: "", idClub: "" });
    // Al limpiar el estado, el useEffect de arriba detectará el cambio y recargará todo automáticamente
  };

  // =========================
  // RENDER UI (Mantenido Visualmente Idéntico)
  // =========================
  return (
    <div className="container-fluid px-4 mt-4">
      
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-0"><FaRobot className="me-2 text-primary"/>Gestión de Robots</h2>
          <p className="text-muted mb-0">Consulta y filtra el inventario de robots inscritos en la plataforma.</p>
        </div>
      </div>

      {/* FILTROS CARD */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3">
          <h6 className="m-0 fw-bold text-primary"><FaFilter className="me-2"/>Filtros de Búsqueda</h6>
        </div>
        <div className="card-body">
          <div className="row g-3">
            
            {/* BUSCAR POR NOMBRE */}
            <div className="col-md-4">
              <label className="form-label small text-muted fw-bold">NOMBRE DEL ROBOT</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0"><FaSearch className="text-muted"/></span>
                <input
                  className="form-control border-start-0 bg-light"
                  placeholder="Escribe para buscar..."
                  name="nombre"
                  value={filtros.nombre}
                  onChange={handleFiltroChange}
                />
              </div>
            </div>

            {/* CATEGORÍA */}
            <div className="col-md-4">
              <label className="form-label small text-muted fw-bold">CATEGORÍA</label>
              <select
                className="form-select bg-light"
                name="categoria"
                value={filtros.categoria}
                onChange={handleFiltroChange}
              >
                <option value="">Todas las categorías</option>
                <option value="MINISUMO">Minisumo</option>
                <option value="MICROSUMO">Microsumo</option>
                <option value="MEGASUMO">Megasumo</option>
                <option value="DRONE">Drone</option>
                <option value="FOLLOWER">Line Follower</option>
                <option value="SOCCER">Soccer</option>
              </select>
            </div>

            {/* CLUB */}
            <div className="col-md-4">
              <label className="form-label small text-muted fw-bold">CLUB</label>
              <select
                className="form-select bg-light"
                name="idClub"
                value={filtros.idClub}
                onChange={handleFiltroChange}
              >
                <option value="">Todos los clubes</option>
                {clubes.map(c => (
                  <option key={c.idClub} value={c.idClub}>{c.nombre}</option>
                ))}
              </select>
            </div>

          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button 
              className="btn btn-outline-secondary btn-sm" 
              onClick={limpiarFiltros}
              title="Borrar filtros"
            >
              <FaEraser className="me-2"/>Limpiar
            </button>
            <button 
              className="btn btn-primary btn-sm" 
              onClick={() => cargarRobots(filtrosNormalizados)}
              disabled={loading}
            >
              <FaSync className={`me-2 ${loading ? "fa-spin" : ""}`}/>
              {loading ? "Cargando..." : "Actualizar Lista"}
            </button>
          </div>
        </div>
      </div>

      {/* TABLA DE RESULTADOS */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">Robot</th>
                  <th>Categoría</th>
                  <th>Competidor</th>
                  <th>Club</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status"/>
                      <p className="mt-2 text-muted small">Consultando servidor...</p>
                    </td>
                  </tr>
                ) : robots.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-5">
                      <div className="text-muted opacity-50 mb-2"><FaRobot size={40}/></div>
                      <h6 className="text-muted">No se encontraron robots</h6>
                      <small className="text-muted">El backend no retornó resultados para estos filtros.</small>
                    </td>
                  </tr>
                ) : (
                  robots.map((r) => (
                    <tr key={r.idRobot}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center">
                          <div className="bg-light rounded-circle p-2 me-3 d-flex align-items-center justify-content-center" style={{width: "40px", height: "40px"}}>
                             <FaMicrochip className="text-secondary"/>
                          </div>
                          <div>
                            <div className="fw-bold text-dark">{r.nombre}</div>
                            <small className="text-muted fst-italic">{r.nickname || "Sin alias"}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-info bg-opacity-10 text-info border border-info px-3">
                          {r.categoria}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center text-muted">
                           <FaUsers className="me-2 small"/>
                           {r.competidor}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center text-muted">
                           <FaBuilding className="me-2 small"/>
                           {r.club}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer bg-white border-top-0 py-3">
          <small className="text-muted">
             {loading ? "Cargando..." : `Mostrando ${robots.length} de ${totalRobots} resultados`}
          </small>
        </div>
      </div>

      {!loading && totalRobots > 0 && (
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3 gap-2">
          <div className="text-muted small">
            Página {page} de {totalPages}
          </div>
          <div className="btn-group">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage(1)} disabled={page <= 1}>
              Primero
            </button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>
              Anterior
            </button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
              Siguiente
            </button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage(totalPages)} disabled={page >= totalPages}>
              Último
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
