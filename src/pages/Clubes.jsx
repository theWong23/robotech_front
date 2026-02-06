import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/clubes.css";
import { useState, useEffect } from "react";
import api from "../services/axiosConfig";
import { 
  FaShieldAlt, 
  FaUsers, 
  FaSearch, 
  FaTimes, 
  FaIdCard, 
  FaBuilding, 
  FaMapMarkerAlt, 
  FaEnvelope 
} from "react-icons/fa";
import Pagination from "../components/Pagination";

export default function Clubes() {
  const [clubes, setClubes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [clubSeleccionado, setClubSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    setLoading(true);
    api.get("public/clubes")
      .then((res) => {
        setClubes(res.data);
      })
      .catch((err) => console.error("Error al cargar clubes:", err))
      .finally(() => setLoading(false));
  }, []);

  const getInitials = (name) => {
    return name ? name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) : "CL";
  };

  const getColorFromName = (name) => {
    const colors = ["#0d6efd", "#6610f2", "#6f42c1", "#d63384", "#dc3545", "#fd7e14", "#198754", "#20c997", "#0dcaf0"];
    let hash = 0;
    for (let i = 0; i < (name?.length || 0); i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % colors.length);
    return colors[index];
  };

  const handleOpenModal = (club) => {
    setClubSeleccionado(club);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setShowModal(false);
    document.body.style.overflow = 'unset';
  };

  const clubesFiltrados = clubes.filter((club) =>
    club.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  useEffect(() => {
    setPage(1);
  }, [busqueda, clubes.length]);

  const totalPages = Math.max(1, Math.ceil(clubesFiltrados.length / itemsPerPage));
  const clubesPaginados = clubesFiltrados.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <>
      <Navbar />

      <div className="container py-5" style={{ minHeight: "80vh" }}>
        <div className="text-center mb-5">
          <h2 className="fw-bold display-6 text-dark">Alianzas de Robótica</h2>
          <p className="text-muted">Las instituciones que impulsan la tecnología en la liga</p>
        </div>

        {/* Buscador */}
        <div className="row justify-content-center mb-5">
          <div className="col-md-6">
            <div className="input-group shadow-sm rounded-pill overflow-hidden border bg-white px-3">
              <span className="input-group-text bg-white border-0"><FaSearch className="text-muted" /></span>
              <input 
                type="text" 
                className="form-control border-0 shadow-none py-2" 
                placeholder="Buscar club por nombre..."
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted">Sincronizando clubes...</p>
          </div>
        ) : (
          <div className="row g-4">
            {clubesFiltrados.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <h4>No se encontraron clubes registrados</h4>
              </div>
            ) : (
              clubesPaginados.map((club) => (
                <div key={club.idClub} className="col-12 col-sm-6 col-lg-4">
                  <div 
                    className="card h-100 shadow-sm border-0 robot-card-modern overflow-hidden" 
                    onClick={() => handleOpenModal(club)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Banner */}
                    <div 
                      className="d-flex align-items-center justify-content-center text-white"
                      style={{ 
                          height: "140px", 
                          fontSize: "2.8rem", 
                          fontWeight: "800",
                          backgroundColor: getColorFromName(club.nombre),
                          textShadow: "1px 1px 5px rgba(0,0,0,0.15)"
                      }}
                    >
                      {getInitials(club.nombre)}
                    </div>

                    <div className="card-body p-4">
                      <div className="mb-4">
                        <h4 className="fw-bold mb-0 text-dark" style={{ letterSpacing: '-0.5px' }}>
                          {club.nombre}
                        </h4>
                        <small className="text-primary fw-bold d-flex align-items-center gap-1">
                          <FaBuilding size={12}/> ORGANIZACIÓN OFICIAL
                        </small>
                      </div>
                      
                      {/* Info Grid */}
                      <div className="d-flex flex-column gap-3">
                        <div className="d-flex align-items-center">
                          <div className="icon-box-small me-3 text-primary bg-primary-subtle rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                            <FaUsers size={14} />
                          </div>
                          <div className="overflow-hidden">
                            <small className="text-muted d-block" style={{fontSize: '0.6rem', fontWeight: '700', textTransform: 'uppercase'}}>Comunidad</small>
                            <span className="fw-bold text-dark text-truncate d-block" style={{ fontSize: '0.95rem' }}>
                              {club.cantidadCompetidores} {club.cantidadCompetidores === 1 ? 'Miembro' : 'Miembros'}
                            </span>
                          </div>
                        </div>

                        <div className="d-flex align-items-center border-top pt-2">
                          <div className="icon-box-small me-3 text-danger bg-danger-subtle rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                            <FaMapMarkerAlt size={14} />
                          </div>
                          <div className="overflow-hidden">
                            <small className="text-muted d-block" style={{fontSize: '0.6rem', fontWeight: '700', textTransform: 'uppercase'}}>Ubicación</small>
                            <span className="fw-semibold text-secondary text-truncate d-block" style={{ fontSize: '0.85rem' }}>
                              {club.direccionFiscal || "Dirección no disponible"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        )}

        {!loading && clubesFiltrados.length > 0 && (
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        )}

        {/* --- MODAL MANUAL --- */}
        {showModal && (
          <div className="custom-modal-overlay" onClick={handleCloseModal}>
            <div className="custom-modal-content animate__animated animate__zoomIn" onClick={e => e.stopPropagation()}>
              <div className="modal-header-manual">
                <h5 className="fw-bold m-0 text-muted" style={{fontSize: '0.8rem'}}>PERFIL INSTITUCIONAL</h5>
                <button className="close-btn" onClick={handleCloseModal}><FaTimes /></button>
              </div>
              
              <div className="modal-body-manual p-0">
                <div className="text-center py-4 px-3" style={{ background: 'linear-gradient(to bottom, #f8f9fa, #ffffff)' }}>
                    <div 
                      className="d-flex align-items-center justify-content-center text-white rounded-circle shadow mx-auto mb-3"
                      style={{ 
                        width: "85px", 
                        height: "85px", 
                        fontSize: "2rem", 
                        fontWeight: "800",
                        backgroundColor: getColorFromName(clubSeleccionado?.nombre),
                        border: '4px solid white'
                      }}
                    >
                      {getInitials(clubSeleccionado?.nombre)}
                    </div>
                   <h3 className="text-dark fw-bold mb-0">{clubSeleccionado?.nombre}</h3>
                   <span className="badge bg-primary-subtle text-primary rounded-pill px-3">Organización Oficial</span>
                </div>
                
                <div className="p-4 bg-light mx-3 rounded-4 mb-4">
                    <h6 className="fw-bold d-flex align-items-center gap-2 mb-3 text-secondary border-bottom pb-2" style={{fontSize: '0.85rem'}}>
                      <FaIdCard className="text-info" /> DATOS DE CONTACTO
                    </h6>
                    
                    {/* Dirección en el Modal */}
                    <div className="mb-3 d-flex align-items-center gap-3">
                        <FaMapMarkerAlt className="text-danger" />
                        <div>
                            <small className="text-muted d-block" style={{fontSize: '0.7rem'}}>DIRECCIÓN FISCAL</small>
                            <span className="fw-bold" style={{fontSize: '0.9rem'}}>{clubSeleccionado?.direccionFiscal || "No registrada"}</span>
                        </div>
                    </div>

                    {/* Correo en el Modal */}
                    <div className="mb-3 d-flex align-items-center gap-3">
                        <FaEnvelope className="text-primary" />
                        <div>
                            <small className="text-muted d-block" style={{fontSize: '0.7rem'}}>CORREO DE CONTACTO</small>
                            <a href={`mailto:${clubSeleccionado?.correoContacto}`} className="fw-bold text-primary text-decoration-none" style={{fontSize: '0.9rem'}}>
                              {clubSeleccionado?.correoContacto || "Sin correo registrado"}
                            </a>
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                        <FaUsers className="text-success" />
                        <div>
                            <small className="text-muted d-block" style={{fontSize: '0.7rem'}}>TOTAL DE MIEMBROS</small>
                            <span className="fw-bold" style={{fontSize: '0.9rem'}}>{clubSeleccionado?.cantidadCompetidores} Pilotos registrados</span>
                        </div>
                    </div>
                </div>
              </div>
              
              <div className="modal-footer-manual px-4 pb-4">
                <button className="btn-cerrar-manual shadow-sm" onClick={handleCloseModal}>Cerrar Perfil</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
