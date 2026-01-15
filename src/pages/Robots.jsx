import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/robots.css";
import { useState, useEffect } from "react";
import api from "../services/axiosConfig";

export default function Robots() {
  const [robots, setRobots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get("public/robots")
      .then((res) => setRobots(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // 1. Función para obtener iniciales (Igual que en Clubes)
  const getInitials = (name) => {
    if (!name) return "R";
    // Toma la primera letra de cada palabra, las une y se queda con las 2 primeras
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // (Opcional) Función para dar un color de fondo aleatorio basado en el nombre
  // Esto hace que no todos se vean iguales
  const getColorFromName = (name) => {
    const colors = ["#d63384", "#6610f2", "#fd7e14", "#20c997", "#0d6efd", "#6c757d"];
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
        <h2 className="fw-bold text-center mb-5">Galería de Robots</h2>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted">Cargando máquinas...</p>
          </div>
        ) : (
          <div className="row g-4">
            {robots.map((r) => (
              <div key={r.idRobot} className="col-12 col-sm-6 col-md-4">
                <div className="card h-100 shadow-sm border-0 robot-card">
                  
                  {/* 2. ÁREA DE FOTO TEMPORAL CON INICIALES */}
                  <div 
                    className="d-flex align-items-center justify-content-center text-white"
                    style={{ 
                        height: "200px", 
                        fontSize: "3.5rem", 
                        fontWeight: "bold",
                        backgroundColor: getColorFromName(r.nombre) // Color dinámico
                    }}
                  >
                    {getInitials(r.nombre)}
                  </div>

                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="fw-bold mb-0 text-dark">{r.nombre}</h5>
                        <small className="text-muted fst-italic">{r.nickname}</small>
                    </div>
                    
                    <span className="badge bg-dark mb-3">{r.categoria}</span>

                    <div className="border-top pt-3">
                        <p className="mb-1 small text-muted">
                            <i className="bi bi-person-fill me-2"></i>
                            <strong>Piloto:</strong> {r.nombreDueño}
                        </p>
                        <p className="mb-0 small text-muted">
                            <i className="bi bi-flag-fill me-2"></i>
                            <strong>Club:</strong> {r.nombreClub}
                        </p>
                    </div>
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