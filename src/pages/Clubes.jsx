import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/clubes.css";
import { useState, useEffect } from "react";
import api from "../services/axiosConfig"; // Asegúrate de que la ruta sea correcta

export default function Clubes() {
  const [clubes, setClubes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [clubSeleccionado, setClubSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Cargar clubes desde el backend
  useEffect(() => {
    setLoading(true);
    api.get("public/clubes") // Ruta relativa, axiosConfig ya tiene el /api
      .then((res) => {
        setClubes(res.data);
      })
      .catch((err) => {
        console.error("Error al cargar clubes:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  // 2. Filtrado por nombre
  const clubesFiltrados = clubes.filter((club) =>
    club.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // 3. Función para generar un avatar con iniciales (ya que no hay logos)
  const getInitials = (name) => {
    return name ? name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) : "C";
  };

  return (
    <>
      <Navbar />

      <div className="container py-5" style={{ minHeight: "80vh" }}>
        <h2 className="fw-bold mb-4 text-center">Clubes Registrados</h2>

        {/* Buscador */}
        <div className="row mb-5">
            <div className="col-md-6 mx-auto">
                <input 
                  type="text" 
                  className="form-control buscador shadow-sm" 
                  placeholder="Buscar club por nombre..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>
        </div>

        {/* Estado de carga o vacío */}
        {loading ? (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2 text-muted">Cargando clubes...</p>
            </div>
        ) : clubesFiltrados.length === 0 ? (
            <div className="text-center py-5 text-muted">
                <h4>No se encontraron clubes registrados</h4>
            </div>
        ) : (
            <div className="row g-4">
              {clubesFiltrados.map((club) => (
                <div key={club.idClub} className="col-12 col-sm-6 col-md-4">
                  <div className="card h-100 shadow-sm border-0 club-card">
                    {/* Imagen / Avatar Dinámico */}
                    <div className="d-flex align-items-center justify-content-center bg-primary text-white" 
                         style={{ height: "160px", fontSize: "3rem", fontWeight: "bold" }}>
                      {getInitials(club.nombre)}
                    </div>

                    <div className="card-body text-center d-flex flex-column">
                      <h5 className="fw-bold mb-1">{club.nombre}</h5>
                      <p className="text-muted small mb-3">
                        <i className="bi bi-people-fill me-1"></i>
                        {club.cantidadCompetidores} {club.cantidadCompetidores === 1 ? 'Competidor' : 'Competidores'}
                      </p>
                      
                      <div className="mt-auto">
                          <button 
                            className="btn btn-outline-primary w-100 fw-bold"
                            data-bs-toggle="modal" 
                            data-bs-target="#modalClub"
                            onClick={() => setClubSeleccionado(club)}
                          >
                            Ver Detalles
                          </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        )}
      </div>

      {/* MODAL DEL CLUB */}
      <div className="modal fade" id="modalClub" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow">
            {clubSeleccionado && (
              <>
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title fw-bold">Perfil del Club</h5>
                  <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>

                <div className="modal-body text-center py-4">
                  <div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mb-3 shadow" 
                       style={{ width: "100px", height: "100px", fontSize: "2rem" }}>
                    {getInitials(clubSeleccionado.nombre)}
                  </div>
                  
                  <h3 className="fw-bold">{clubSeleccionado.nombre}</h3>
                  <p className="text-muted mb-4">Miembro oficial de la plataforma Robotech</p>
                  
                  <div className="row g-2 text-start">
                      <div className="col-12 border-bottom pb-2 mb-2">
                          <strong>ID del Club:</strong> <span className="float-end text-muted">{clubSeleccionado.idClub}</span>
                      </div>
                      <div className="col-12">
                          <strong>Competidores registrados:</strong> <span className="float-end badge bg-info text-dark">{clubSeleccionado.cantidadCompetidores}</span>
                      </div>
                  </div>
                </div>

                <div className="modal-footer border-0">
                  <button className="btn btn-secondary w-100" data-bs-dismiss="modal">Cerrar</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}