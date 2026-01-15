import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/torneos.css";
import { useState, useEffect } from "react";
import api from "../services/axiosConfig";

export default function Torneos() {
  const [torneos, setTorneos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState(""); // Estado seleccionado
  const [torneoSeleccionado, setTorneoSeleccionado] = useState(null);

  useEffect(() => {
    cargarTorneos();
  }, []);

  const cargarTorneos = async () => {
    setLoading(true);
    try {
      const res = await api.get("/public/torneos");
      console.log("Torneos cargados:", res.data); 
      setTorneos(res.data);
    } catch (err) {
      console.error("Error cargando torneos", err);
    } finally {
      setLoading(false);
    }
  };

  const cerrarModal = () => {
    setTorneoSeleccionado(null);
  };

  // ============================
  // 1. COLORES SEGÚN TUS ESTADOS
  // ============================
  const getBadgeColor = (estado) => {
    if (!estado) return "bg-secondary";
    
    switch (estado) {
        case "INSCRIPCIONES_ABIERTAS":
            return "bg-success"; // Verde (¡Apúntate!)
        case "INSCRIPCIONES_CERRADAS":
            return "bg-warning text-dark"; // Amarillo (Atención)
        case "EN_PROGRESO":
            return "bg-primary"; // Azul (Está ocurriendo)
        case "FINALIZADO":
            return "bg-secondary"; // Gris (Ya pasó)
        case "BORRADOR":
            return "bg-dark"; // Negro (Interno)
        default:
            return "bg-info text-dark";
    }
  };

  // ============================
  // 2. FORMATO DE TEXTO AMIGABLE
  // ============================
  // Convierte "INSCRIPCIONES_ABIERTAS" -> "Inscripciones abiertas"
  const formatEstado = (estado) => {
    if (!estado) return "Desconocido";
    return estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase().replace(/_/g, " ");
  };

  const getImagenRandom = (id) => {
    const images = [
      "https://images.unsplash.com/photo-1563206767-5b1d972805e2?auto=format&fit=crop&w=600&q=80", 
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1593642632823-8f7856677741?auto=format&fit=crop&w=600&q=80"
    ];
    let hash = 0;
    const strId = String(id);
    for (let i = 0; i < strId.length; i++) {
        hash = strId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % images.length);
    return images[index];
  };

  // ============================
  // 3. LÓGICA DE FILTRADO
  // ============================
  const torneosFiltrados = torneos.filter((t) => {
    // Filtro por nombre
    const coincideBusqueda = t.nombre.toLowerCase().includes(busqueda.toLowerCase());
    
    // Filtro por estado EXACTO
    const coincideEstado = filtroEstado === "" || t.estado === filtroEstado;
    
    // Ocultar borradores al público (Opcional: Si quieres verlos, quita esta línea)
    // const noEsBorrador = t.estado !== "BORRADOR";

    return coincideBusqueda && coincideEstado; 
  });

  return (
    <>
      <Navbar />

      <div className="container py-5" style={{ minHeight: "80vh" }}>
        <h2 className="fw-bold text-center mb-4">Torneos Disponibles</h2>

        <input
          type="text"
          className="form-control mb-4 buscador"
          placeholder="Buscar torneo por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        {/* ============================
             BOTONES DE FILTRO
           ============================ */}
        <div className="text-center mb-4 d-flex flex-wrap justify-content-center gap-2">
          
          <button 
            className={`btn ${filtroEstado === "" ? "btn-dark" : "btn-outline-dark"}`} 
            onClick={() => setFiltroEstado("")}
          >
            Todos
          </button>

          <button 
            className={`btn ${filtroEstado === "INSCRIPCIONES_ABIERTAS" ? "btn-success" : "btn-outline-success"}`} 
            onClick={() => setFiltroEstado("INSCRIPCIONES_ABIERTAS")}
          >
            Inscripciones Abiertas
          </button>

          <button 
            className={`btn ${filtroEstado === "EN_PROGRESO" ? "btn-primary" : "btn-outline-primary"}`} 
            onClick={() => setFiltroEstado("EN_PROGRESO")}
          >
            En Progreso
          </button>

          <button 
            className={`btn ${filtroEstado === "FINALIZADO" ? "btn-secondary" : "btn-outline-secondary"}`} 
            onClick={() => setFiltroEstado("FINALIZADO")}
          >
            Finalizados
          </button>
        </div>

        {loading ? (
           <div className="text-center py-5">
             <div className="spinner-border text-primary" role="status"></div>
           </div>
        ) : (
            <div className="row g-4">
            {torneosFiltrados.length === 0 ? (
                <div className="col-12 text-center text-muted">No se encontraron torneos con estos filtros.</div>
            ) : (
                torneosFiltrados.map((t) => (
                    <div key={t.idTorneo} className="col-12 col-sm-6 col-md-4">
                    <div className="card torneo-card shadow-sm h-100">

                        <img 
                            src={getImagenRandom(t.idTorneo)} 
                            alt={t.nombre} 
                            className="torneo-img"
                            style={{ objectFit: "cover", height: "200px", width: "100%" }}
                        />

                        <div className="card-body d-flex flex-column">
                        <h5 className="fw-bold">{t.nombre}</h5>

                        {/* BADGE DE ESTADO */}
                        <div>
                            <span className={`badge mb-2 ${getBadgeColor(t.estado)}`}>
                                {formatEstado(t.estado)}
                            </span>
                        </div>

                        <p className="text-muted small m-0">
                            📅 {t.fechaInicio} — {t.fechaFin}
                        </p>

                        <p className="mt-2 text-truncate">
                            {t.descripcion}
                        </p>

                        <button className="btn btn-primary w-100 mt-auto" onClick={() => setTorneoSeleccionado(t)}>
                            Ver Detalles
                        </button>
                        </div>
                    </div>
                    </div>
                ))
            )}
            </div>
        )}
      </div>

      {/* Modal de Detalles */}
      {torneoSeleccionado && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content modal-anim" onClick={(e) => e.stopPropagation()}>

            <button className="btn-close-modal" onClick={cerrarModal}>✕</button>

            <img
              src={getImagenRandom(torneoSeleccionado.idTorneo)}
              alt={torneoSeleccionado.nombre}
              className="modal-img"
            />

            <h3 className="fw-bold mt-3">{torneoSeleccionado.nombre}</h3>

            <span className={`badge ${getBadgeColor(torneoSeleccionado.estado)}`}>
              {formatEstado(torneoSeleccionado.estado)}
            </span>

            <div className="modal-section text-start mt-3">
              <p><strong>📅 Fechas:</strong> {torneoSeleccionado.fechaInicio} — {torneoSeleccionado.fechaFin}</p>
              
              <hr/>
              <p><strong>📘 Descripción:</strong><br />{torneoSeleccionado.descripcion}</p>

              {torneoSeleccionado.categorias && torneoSeleccionado.categorias.length > 0 && (
                <p>
                  <strong>🏷 Categorías:</strong><br />
                  {torneoSeleccionado.categorias.map(cat => (
                      <span key={cat} className="badge bg-light text-dark border me-1">{cat}</span>
                  ))}
                </p>
              )}
            </div>

          </div>
        </div>
      )}

      <Footer />
    </>
  );
}