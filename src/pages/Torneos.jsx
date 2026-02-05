import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/torneos.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/axiosConfig";
import { FaTrophy, FaMedal, FaAward, FaCalendarAlt, FaInfoCircle, FaGamepad } from "react-icons/fa";

export default function Torneos() {
  const [torneos, setTorneos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [torneoSeleccionado, setTorneoSeleccionado] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const roles = (() => {
    try { return JSON.parse(localStorage.getItem("roles") || "[]"); } catch { return []; }
  })();
  const usuario = (() => {
    try { return JSON.parse(localStorage.getItem("usuario")); } catch { return null; }
  })();
  const puedeInscribirseAgenteLibre = roles.includes("COMPETIDOR") && !usuario?.idClub;


  useEffect(() => {
    cargarTorneos();
  }, []);

  const cargarTorneos = async () => {
    setLoading(true);
    try {
      const res = await api.get("/public/torneos");
      setTorneos(res.data);
    } catch (err) {
      console.error("Error cargando torneos", err);
    } finally {
      setLoading(false);
    }
  };

  const cerrarModal = () => setTorneoSeleccionado(null);

  useEffect(() => {
    const cargarCategorias = async () => {
      if (!torneoSeleccionado?.idTorneo) return;
      setCategorias([]);
      setLoadingCategorias(true);
      try {
        const res = await api.get(`/public/torneos/${torneoSeleccionado.idTorneo}/categorias`);
        setCategorias(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error cargando categorías", err);
        setCategorias([]);
      } finally {
        setLoadingCategorias(false);
      }
    };

    cargarCategorias();
  }, [torneoSeleccionado]);

  const getBadgeColor = (estado) => {
    switch (estado) {
      case "INSCRIPCIONES_ABIERTAS": return "bg-success";
      case "INSCRIPCIONES_CERRADAS": return "bg-warning text-dark";
      case "EN_PROGRESO": return "bg-primary text-white";
      case "FINALIZADO": return "bg-dark text-white border border-warning";
      default: return "bg-secondary";
    }
  };

  const formatEstado = (estado) => {
    if (!estado) return "Desconocido";
    return estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase().replace(/_/g, " ");
  };

  const torneosFiltrados = torneos.filter((t) => {
    const coincideBusqueda = t.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado = filtroEstado === "" || t.estado === filtroEstado;
    return coincideBusqueda && coincideEstado;
  });

  return (
    <>
      <Navbar />
      <div className="container py-5" style={{ minHeight: "80vh" }}>
        <h2 className="fw-bold text-center mb-4">Explorar Torneos</h2>

        <div className="row justify-content-center mb-4">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control buscador shadow-sm rounded-pill"
              placeholder="🔍 Buscar por nombre del torneo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <div className="text-center mb-5 d-flex flex-wrap justify-content-center gap-2">
          <button className={`btn rounded-pill px-4 ${filtroEstado === "" ? "btn-dark" : "btn-outline-dark"}`} onClick={() => setFiltroEstado("")}>Todos</button>
          <button className={`btn rounded-pill px-4 ${filtroEstado === "INSCRIPCIONES_ABIERTAS" ? "btn-success" : "btn-outline-success"}`} onClick={() => setFiltroEstado("INSCRIPCIONES_ABIERTAS")}>Inscripciones Abiertas</button>
          <button className={`btn rounded-pill px-4 ${filtroEstado === "FINALIZADO" ? "btn-secondary" : "btn-outline-secondary"}`} onClick={() => setFiltroEstado("FINALIZADO")}>Historial Finalizados</button>
        </div>

        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
        ) : (
          <div className="row g-4">
            {torneosFiltrados.map((t) => (
              <div key={t.idTorneo} className="col-12 col-sm-6 col-md-4">
                <div className={`card torneo-card shadow-sm h-100 ${t.estado === 'FINALIZADO' ? 'border-warning shadow' : ''}`}>
                  <div className="card-body d-flex flex-column">
                    <span className={`badge mb-2 align-self-start py-2 px-3 rounded-pill ${getBadgeColor(t.estado)}`}>
                      {formatEstado(t.estado)}
                    </span>
                    <h5 className="fw-bold">{t.nombre}</h5>
                    <p className="text-muted small mb-3">
                      <FaCalendarAlt className="me-1"/> {t.fechaInicio} al {t.fechaFin}
                    </p>
                    
                    {/* Ganador destacado en la card */}
                    {t.estado === "FINALIZADO" && t.ganador && (
                      <div className="bg-warning bg-opacity-10 p-2 rounded mb-3 border border-warning">
                        <small className="d-block text-uppercase fw-bold text-dark">🏆 Ganador Absoluto</small>
                        <span className="fw-bold text-dark">{t.ganador}</span>
                      </div>
                    )}

                    <button 
                      className={`btn w-100 mt-auto ${t.estado === 'FINALIZADO' ? 'btn-dark' : 'btn-outline-primary'}`} 
                      onClick={() => setTorneoSeleccionado(t)}
                    >
                      {t.estado === "FINALIZADO" ? "Ver Resultados Finales" : "Detalles e Inscripción"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalles y Resultados */}
      {torneoSeleccionado && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content modal-anim" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header border-0 pb-0">
               <button className="btn-close-modal ms-auto" onClick={cerrarModal}>✕</button>
            </div>
            
            <div className="text-center px-4">
              <h3 className="fw-bold text-primary">{torneoSeleccionado.nombre}</h3>
              <span className={`badge ${getBadgeColor(torneoSeleccionado.estado)} px-3 py-2 mb-4`}>
                {formatEstado(torneoSeleccionado.estado)}
              </span>
            </div>

            <div className="modal-body px-4">
              {torneoSeleccionado.estado === "FINALIZADO" ? (
                <div className="animate__animated animate__fadeIn">
                  <div className="text-center mb-4">
                    <FaTrophy size={50} className="text-warning mb-2" />
                    <h5 className="fw-bold">Cuadro de Honor</h5>
                  </div>
                  
                  <div className="table-responsive rounded shadow-sm">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-dark">
                        <tr>
                          <th className="text-center">Pos.</th>
                          <th>Participante</th>
                          <th className="text-end">Puntaje Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {torneoSeleccionado.resultados && torneoSeleccionado.resultados.length > 0 ? (
                          torneoSeleccionado.resultados.map((res, idx) => (
                            <tr key={idx} className={idx === 0 ? "table-warning border-warning" : ""}>
                              <td className="text-center fw-bold">
                                {idx === 0 ? <FaTrophy className="text-warning"/> : 
                                 idx === 1 ? <FaMedal className="text-secondary"/> :
                                 idx === 2 ? <FaAward className="text-danger"/> : idx + 1}
                              </td>
                              <td className={idx === 0 ? "fw-bold" : ""}>{res.nombre}</td>
                              <td className="text-end fw-bold text-primary">{res.puntaje} <small>pts</small></td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan="3" className="text-center py-4 text-muted italic">Los resultados están siendo procesados.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="mt-2">
                  <p><FaCalendarAlt className="me-2 text-primary"/><strong>Cronograma:</strong> {torneoSeleccionado.fechaInicio} al {torneoSeleccionado.fechaFin}</p>
                  <p className="mt-3"><FaInfoCircle className="me-2 text-primary"/><strong>Información del Torneo:</strong></p>
                  <div className="bg-light p-3 rounded border">
                    {torneoSeleccionado.descripcion}
                  </div>
                </div>
              )}

              <div className="mt-4">
                <h5 className="fw-bold mb-3"><FaGamepad className="me-2 text-warning" />Categorías y Encuentros</h5>
                {loadingCategorias ? (
                  <div className="text-center text-muted py-3">Cargando categorías...</div>
                ) : categorias.length === 0 ? (
                  <div className="text-center text-muted py-3">No hay categorías visibles.</div>
                ) : (
                  <div className="row g-3">
                    {categorias.map((c) => (
                      <div key={c.idCategoriaTorneo} className="col-12 col-md-6">
                        <div className="border rounded-3 p-3 h-100 d-flex flex-column gap-2">
                          <div className="fw-bold text-dark">{c.categoria}</div>
                          <div className="text-muted small">{c.modalidad}</div>
                          <div className="d-flex flex-column gap-2 mt-auto">
                            <Link
                              className="btn btn-outline-dark btn-sm"
                              to={`/torneos/${torneoSeleccionado.idTorneo}/categorias/${c.idCategoriaTorneo}/encuentros`}
                            >
                              Ver cuadro de encuentros
                            </Link>
                            {puedeInscribirseAgenteLibre && torneoSeleccionado?.estado === "INSCRIPCIONES_ABIERTAS" && c.modalidad === "INDIVIDUAL" && (
                              <Link
                                className="btn btn-success btn-sm"
                                to={`/competidor/torneos/${torneoSeleccionado.idTorneo}/categorias/${c.idCategoriaTorneo}/inscribir`}
                              >
                                Inscribirme (Agente libre)
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-3 border-top text-center">
                 <button className="btn btn-secondary px-5" onClick={cerrarModal}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}
