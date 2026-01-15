import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/competidores.css";
import { useState, useEffect } from "react";
import api from "../services/axiosConfig";

export default function Competidores() {
  const [competidores, setCompetidores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get("public/competidores")
      .then((res) => {
        console.log("Datos recibidos:", res.data); // Para depurar si vuelve a fallar
        setCompetidores(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getInitials = (name) => {
    // Protección contra nulos o undefined
    if (!name) return "CP"; 
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getColorFromName = (name) => {
    // Protección crítica: Si no hay nombre, devuelve gris
    if (!name) return "#6c757d"; 
    
    const colors = ["#0d6efd", "#6610f2", "#6f42c1", "#d63384", "#dc3545", "#fd7e14", "#198754", "#20c997", "#0dcaf0"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % colors.length);
    return colors[index];
  };

  return (
    <>
      <Navbar />

      <div className="container py-5" style={{ minHeight: "80vh" }}>
        <h2 className="fw-bold mb-5 text-center">Ranking de Competidores</h2>

        {loading ? (
           <div className="text-center py-5">
             <div className="spinner-border text-primary" role="status"></div>
             <p className="mt-2 text-muted">Cargando ranking...</p>
           </div>
        ) : (
          <div className="row g-4">
            {competidores.map((c, index) => (
              <div className="col-12" key={index}>
                <div className="competidor-card shadow-sm p-3 d-flex align-items-center bg-white rounded">
                  
                  {/* AVATAR: Usamos c.nombreCompleto */}
                  <div 
                    className="d-flex align-items-center justify-content-center text-white rounded-circle flex-shrink-0"
                    style={{ 
                        width: "60px", 
                        height: "60px", 
                        fontSize: "1.2rem", 
                        fontWeight: "bold",
                        // ⚠️ CORRECCIÓN: Usar nombreCompleto
                        backgroundColor: getColorFromName(c.nombreCompleto) 
                    }}
                  >
                    {/* ⚠️ CORRECCIÓN: Usar nombreCompleto */}
                    {getInitials(c.nombreCompleto)}
                  </div>

                  <div className="ms-3 flex-grow-1">
                    {/* ⚠️ CORRECCIÓN: Usar nombreCompleto */}
                    <h5 className="fw-bold mb-0 text-dark">{c.nombreCompleto}</h5>
                    <p className="text-muted m-0 small">
                        <i className="bi bi-shield-fill me-1"></i>
                        {c.club}
                    </p>
                    {/* Opcional: Mostrar cantidad de robots */}
                    <small className="text-muted" style={{fontSize: "0.8rem"}}>
                        <i className="bi bi-robot me-1"></i>
                        {c.totalRobots} Robots registrados
                    </small>
                  </div>

                  <div className="text-end ps-3">
                    <span className={`badge mb-1 ${c.ranking > 0 && c.ranking <= 3 ? 'bg-warning text-dark' : 'bg-light text-dark border'}`}>
                        {c.ranking > 0 ? `#${c.ranking}` : '-'}
                    </span>
                    {/* ⚠️ CORRECCIÓN: Usar puntosRanking */}
                    <p className="fw-bold m-0 text-primary">{c.puntosRanking} pts</p>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}