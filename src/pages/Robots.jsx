import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/robots.css";
import { useState, useEffect } from "react";
import api from "../services/axiosConfig";
import { FaUser, FaShieldAlt, FaRobot, FaSearch } from "react-icons/fa";
import Pagination from "../components/Pagination";

export default function Robots() {
  const [robots, setRobots] = useState([]);
  const [busqueda, setBusqueda] = useState(""); // Estado para la búsqueda
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    setLoading(true);
    api.get("public/robots")
      .then((res) => setRobots(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getInitials = (name) => {
    if (!name) return "R";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
  };

  const getColorFromName = (name) => {
    const colors = ["#0d6efd", "#6610f2", "#6f42c1", "#d63384", "#dc3545", "#fd7e14", "#198754", "#20c997", "#0dcaf0"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % colors.length);
    return colors[index];
  };

  // ✅ Lógica de filtrado dinámico
  const robotsFiltrados = robots.filter(r => 
    r.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    r.nombreDueño?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="container py-5" style={{ minHeight: "80vh" }}>
        <div className="text-center mb-5">
            <h2 className="fw-bold display-6 text-dark">Galería de Robots</h2>
            <p className="text-muted">Los protagonistas de la arena Robotech</p>
        </div>

        {/* --- BUSCADOR ESTILIZADO --- */}
        <div className="row justify-content-center mb-5">
          <div className="col-md-6">
            <div className="input-group shadow-sm rounded-pill overflow-hidden border bg-white px-3">
              <span className="input-group-text bg-white border-0"><FaSearch className="text-muted" /></span>
              <input 
                type="text" 
                className="form-control border-0 shadow-none py-2" 
                placeholder="Buscar por robot o piloto..." 
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted">Cargando sistemas...</p>
          </div>
        ) : (
          <div className="row g-4">
            {robotsFiltrados.length > 0 ? (
              robotsPaginados.map((r) => (
                <div key={r.idRobot} className="col-12 col-sm-6 col-lg-4">
                  <div className="card h-100 shadow-sm border-0 robot-card-modern overflow-hidden">
                    
                    {/* Banner de Identidad */}
                    <div 
                      className="d-flex align-items-center justify-content-center text-white position-relative"
                      style={{ 
                          height: "160px", 
                          fontSize: "3rem", 
                          fontWeight: "800",
                          backgroundColor: getColorFromName(r.nombre),
                          textShadow: "1px 1px 5px rgba(0,0,0,0.15)"
                      }}
                    >
                      {getInitials(r.nombre)}
                      
                      {/* Categoría pequeña */}
                      <div className="position-absolute top-0 end-0 m-3">
                          <span className="badge rounded-pill bg-white text-dark shadow-sm px-3 py-2 border-0" style={{ fontSize: '0.65rem', letterSpacing: '0.5px', opacity: 0.9 }}>
                             {r.categoria.toUpperCase()}
                          </span>
                      </div>
                    </div>

                    <div className="card-body p-4">
                      <div className="mb-4">
                          <h4 className="fw-bold mb-0 text-dark" style={{ letterSpacing: '-0.5px' }}>
                             {r.nombre}
                          </h4>
                          <small className="text-primary fw-semibold">@{r.nickname}</small>
                      </div>
                      
                      <div className="d-flex flex-column gap-3">
                          <div className="d-flex align-items-center">
                              <div className="icon-box-small me-3 text-primary bg-primary-subtle rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                  <FaUser size={14} />
                              </div>
                              <div className="overflow-hidden">
                                  <small className="text-muted d-block" style={{fontSize: '0.6rem', fontWeight: '700', textTransform: 'uppercase'}}>Piloto</small>
                                  <span className="fw-bold text-dark text-truncate d-block" style={{ fontSize: '0.95rem' }}>{r.nombreDueño}</span>
                              </div>
                          </div>

                          <div className="d-flex align-items-center border-top pt-2">
                              <div className="icon-box-small me-3 text-success bg-success-subtle rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                  <FaShieldAlt size={14} />
                              </div>
                              <div className="overflow-hidden">
                                  <small className="text-muted d-block" style={{fontSize: '0.6rem', fontWeight: '700', textTransform: 'uppercase'}}>Afiliación</small>
                                  <span className="fw-semibold text-secondary text-truncate d-block" style={{ fontSize: '0.9rem' }}>{r.nombreClub || "Independiente"}</span>
                              </div>
                          </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-5">
                <p className="text-muted">No se encontraron robots que coincidan con tu búsqueda.</p>
              </div>
            )}
          </div>
        )}

        {!loading && robotsFiltrados.length > 0 && (
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>
      <Footer />
    </>
  );
}
