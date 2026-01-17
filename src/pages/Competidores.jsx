import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/competidores.css";
import { useState, useEffect } from "react";
import api from "../services/axiosConfig";
import { FaShieldAlt, FaRobot, FaSearch, FaTimes, FaUser, FaIdCard } from "react-icons/fa";

export default function Competidores() {
  const [competidores, setCompetidores] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedComp, setSelectedComp] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get("public/competidores")
      .then((res) => setCompetidores(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getInitials = (name) => {
    if (!name) return "CP";
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

  const handleOpenModal = (c) => {
    setSelectedComp(c);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setShowModal(false);
    document.body.style.overflow = 'unset';
  };

  const competidoresFiltrados = competidores.filter(c => 
    c.nombreCompleto?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.club?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="container py-5" style={{ minHeight: "80vh" }}>
        
        <div className="text-center mb-5">
          <h2 className="fw-bold display-6 text-dark">Comunidad de Pilotos</h2>
          <p className="text-muted">Los rostros detrás de la tecnología de Robotech</p>
        </div>

        {/* Buscador */}
        <div className="row justify-content-center mb-5">
          <div className="col-md-6">
            <div className="input-group shadow-sm rounded-pill overflow-hidden border bg-white px-3">
              <span className="input-group-text bg-white border-0"><FaSearch className="text-muted" /></span>
              <input 
                type="text" 
                className="form-control border-0 shadow-none py-2" 
                placeholder="Buscar por piloto o club..." 
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
           <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
        ) : (
          <div className="row g-4">
            {competidoresFiltrados.map((c, index) => (
              <div className="col-12 col-sm-6 col-lg-4" key={index}>
                <div 
                  className="card h-100 shadow-sm border-0 robot-card-modern overflow-hidden" 
                  onClick={() => handleOpenModal(c)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Banner de Identidad */}
                  <div 
                    className="d-flex align-items-center justify-content-center text-white position-relative"
                    style={{ 
                        height: "140px", 
                        fontSize: "2.8rem", 
                        fontWeight: "800",
                        backgroundColor: getColorFromName(c.nombreCompleto),
                        textShadow: "1px 1px 5px rgba(0,0,0,0.15)"
                    }}
                  >
                    {getInitials(c.nombreCompleto)}
                  </div>

                  <div className="card-body p-4">
                    <div className="mb-4">
                        <h4 className="fw-bold mb-0 text-dark" style={{ letterSpacing: '-0.5px' }}>
                           {c.nombreCompleto}
                        </h4>
                        <small className="text-primary fw-bold d-flex align-items-center gap-1">
                           <FaIdCard size={12}/> PILOTO OFICIAL
                        </small>
                    </div>
                    
                    {/* Info Grid */}
                    <div className="d-flex flex-column gap-3">
                        <div className="d-flex align-items-center">
                            <div className="icon-box-small me-3 text-primary bg-primary-subtle rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                <FaShieldAlt size={14} />
                            </div>
                            <div className="overflow-hidden">
                                <small className="text-muted d-block" style={{fontSize: '0.6rem', fontWeight: '700', textTransform: 'uppercase'}}>Afiliación</small>
                                <span className="fw-bold text-dark text-truncate d-block" style={{ fontSize: '0.95rem' }}>{c.club || "Independiente"}</span>
                            </div>
                        </div>

                        <div className="d-flex align-items-center border-top pt-2">
                            <div className="icon-box-small me-3 text-info bg-info-subtle rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                <FaRobot size={14} />
                            </div>
                            <div className="overflow-hidden">
                                <small className="text-muted d-block" style={{fontSize: '0.6rem', fontWeight: '700', textTransform: 'uppercase'}}>Inventario</small>
                                <span className="fw-semibold text-secondary d-block" style={{ fontSize: '0.9rem' }}>{c.totalRobots} {c.totalRobots === 1 ? 'Robot' : 'Robots'}</span>
                            </div>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- MODAL MANUAL --- */}
        {showModal && (
          <div className="custom-modal-overlay" onClick={handleCloseModal}>
            <div className="custom-modal-content animate__animated animate__zoomIn" onClick={e => e.stopPropagation()}>
              <div className="modal-header-manual">
                <h5 className="fw-bold m-0 text-muted" style={{fontSize: '0.8rem'}}>DETALLES DEL PILOTO</h5>
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
                        backgroundColor: getColorFromName(selectedComp?.nombreCompleto),
                        border: '4px solid white'
                      }}
                    >
                      {getInitials(selectedComp?.nombreCompleto)}
                    </div>
                   <h3 className="text-dark fw-bold mb-0">{selectedComp?.nombreCompleto}</h3>
                   <span className="badge bg-primary-subtle text-primary rounded-pill px-3">{selectedComp?.club}</span>
                </div>
                
                <div className="p-4">
                    <h6 className="fw-bold d-flex align-items-center gap-2 mb-3 text-secondary">
                    <FaRobot className="text-info" /> Máquinas Vinculadas:
                    </h6>
                    
                    <ul className="list-group-manual border-0">
                    {selectedComp?.nombresRobots?.length > 0 ? (
                        selectedComp.nombresRobots.map((robot, i) => (
                        <li key={i} className="list-item-manual px-0">
                            <div className="d-flex align-items-center gap-2">
                                <div className="bg-primary rounded-circle" style={{width: '6px', height: '6px'}}></div>
                                <span className="fw-bold">{robot}</span>
                            </div>
                            <small className="status-tag">REGISTRADO</small>
                        </li>
                        ))
                    ) : (
                        <li className="list-item-manual text-muted justify-content-center">Sin máquinas registradas</li>
                    )}
                    </ul>
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