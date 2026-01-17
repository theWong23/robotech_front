import { useEffect, useState, useMemo } from "react";
import Swal from "sweetalert2";
import api from "../../services/axiosConfig";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaTrophy, FaUsers, FaArrowRight, FaLock, FaLockOpen } from "react-icons/fa";

export default function AdminEncuentros() {
  // =========================
  // ESTADOS
  // =========================
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros locales
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODOS"); // Opciones: TODOS, ABIERTAS, CERRADAS

  const navigate = useNavigate();

  // =========================
  // CARGAR DATOS
  // =========================
  const cargarCategorias = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/encuentros/categorias");
      setCategorias(res.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudieron cargar las categorías desde el servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  // =========================
  // LÓGICA DE FILTRADO (VISUAL)
  // =========================
  const categoriasFiltradas = useMemo(() => {
    return categorias.filter(cat => {
      // 1. Filtro por Texto (Torneo o Categoría)
      const textoMatch = 
        (cat.torneo?.toLowerCase() || "").includes(busqueda.toLowerCase()) || 
        (cat.categoria?.toLowerCase() || "").includes(busqueda.toLowerCase());

      // 2. Filtro por Estado (Pestañas)
      let estadoMatch = true;
      if (filtroEstado === "CERRADAS") estadoMatch = cat.inscripcionesCerradas;
      if (filtroEstado === "ABIERTAS") estadoMatch = !cat.inscripcionesCerradas;

      return textoMatch && estadoMatch;
    });
  }, [categorias, busqueda, filtroEstado]);

  // =========================
  // RENDER
  // =========================
  return (
    <div className="container-fluid px-4 mt-4">
      
      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <div>
           <h2 className="fw-bold text-dark mb-0">
             <FaTrophy className="me-2 text-warning"/>Gestión de Encuentros
           </h2>
           <p className="text-muted mb-0">Selecciona una categoría para generar o ver los cruces.</p>
        </div>
      </div>

      {/* CONTROLES (Buscador + Pestañas de Filtro) */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body d-flex flex-column flex-md-row gap-3 align-items-center">
            
            {/* Buscador */}
            <div className="input-group" style={{maxWidth: "400px"}}>
               <span className="input-group-text bg-light border-end-0"><FaSearch className="text-muted"/></span>
               <input 
                  type="text" 
                  className="form-control border-start-0 bg-light" 
                  placeholder="Buscar torneo o categoría..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
               />
            </div>

            {/* Filtros (Tabs) */}
            <div className="btn-group" role="group">
               <button 
                  type="button" 
                  className={`btn ${filtroEstado === "TODOS" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setFiltroEstado("TODOS")}
               >
                  Todos
               </button>
               <button 
                  type="button" 
                  className={`btn ${filtroEstado === "ABIERTAS" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setFiltroEstado("ABIERTAS")}
               >
                  <FaLockOpen className="me-1" size={14}/> Abiertas
               </button>
               <button 
                  type="button" 
                  className={`btn ${filtroEstado === "CERRADAS" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setFiltroEstado("CERRADAS")}
               >
                  <FaLock className="me-1" size={14}/> Cerradas
               </button>
            </div>
        </div>
      </div>

      {/* CONTENIDO (Grid de Tarjetas) */}
      {loading ? (
        <div className="text-center py-5">
           <div className="spinner-border text-primary" role="status"></div>
           <p className="mt-2 text-muted">Cargando categorías...</p>
        </div>
      ) : categoriasFiltradas.length === 0 ? (
        <div className="text-center py-5">
           <div className="display-1 text-muted opacity-25 mb-3"><FaTrophy/></div>
           <h5 className="text-muted">No se encontraron categorías</h5>
           <p className="text-muted small">Intenta cambiar los filtros de búsqueda.</p>
        </div>
      ) : (
        <div className="row g-4">
          {categoriasFiltradas.map(cat => (
            <div key={cat.idCategoriaTorneo} className="col-md-6 col-lg-4 col-xl-3">
              <div className="card h-100 shadow-sm border-0 hover-effect">
                
                {/* Cabecera de Tarjeta: Estado */}
                <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center pt-3 pb-0">
                   <span className={`badge rounded-pill ${cat.inscripcionesCerradas ? "bg-secondary" : "bg-success"}`}>
                      {cat.inscripcionesCerradas ? <><FaLock className="me-1"/>Cerradas</> : <><FaLockOpen className="me-1"/>Abiertas</>}
                   </span>
                   <small className="text-muted fw-bold" style={{fontSize: "0.75rem"}}>
                      {cat.modalidad}
                   </small>
                </div>

                {/* Cuerpo de Tarjeta: Info + Progreso */}
                <div className="card-body">
                  <h5 className="card-title fw-bold text-primary mb-1 text-truncate" title={cat.torneo}>
                     {cat.torneo}
                  </h5>
                  <h6 className="card-subtitle mb-3 text-dark fw-bold">
                     {cat.categoria}
                  </h6>

                  <div className="d-flex align-items-center gap-2 mb-3 bg-light p-2 rounded">
                     <FaUsers className="text-muted"/>
                     <span className="fw-bold text-dark">{cat.inscritos}</span>
                     <span className="text-muted small">/ {cat.maxParticipantes} inscritos</span>
                  </div>

                  {/* Barra de progreso de cupos */}
                  <div className="progress" style={{height: "6px"}}>
                     <div 
                        className={`progress-bar ${cat.inscripcionesCerradas ? "bg-secondary" : "bg-info"}`}
                        role="progressbar" 
                        style={{width: `${(cat.inscritos / cat.maxParticipantes) * 100}%`}}
                     ></div>
                  </div>
                </div>

                {/* Pie de Tarjeta: Botón de Acción */}
                <div className="card-footer bg-transparent border-0 pb-3">
                  <button
                    className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2"
                    onClick={() => navigate(`/admin/encuentros/${cat.idCategoriaTorneo}`)}
                  >
                    Gestionar <FaArrowRight size={12}/>
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estilo simple para efecto hover en tarjetas */}
      <style>{`
        .hover-effect { transition: transform 0.2s, box-shadow 0.2s; }
        .hover-effect:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important; }
      `}</style>
    </div>
  );
}