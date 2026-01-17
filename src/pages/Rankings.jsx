import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../services/api"; // Asegúrate de que esta ruta sea correcta para tu proyecto
import { FaTrophy, FaRobot, FaUsers, FaShieldAlt, FaMedal, FaChartLine } from "react-icons/fa";

export default function Rankings() {
  const [data, setData] = useState([]);
  const [tipo, setTipo] = useState("robots"); // Estado inicial
  const [loading, setLoading] = useState(false);

  // 🔄 Efecto para cargar datos cuando cambia el tipo
  useEffect(() => {
    fetchRanking(tipo);
  }, [tipo]);

  const fetchRanking = async (selectedTipo) => {
    setLoading(true);
    try {
      // Llama a: /api/rankings/robots, /api/rankings/competidores, etc.
      const res = await api.get(`/rankings/${selectedTipo}`);
      setData(res.data);
    } catch (err) {
      console.error("Error cargando ranking:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para el título según la selección
  const getTitulo = () => {
    if (tipo === "clubes") return "Ranking de Clubes";
    if (tipo === "competidores") return "Ranking de Competidores";
    return "Ranking de Robots";
  };

  return (
    <>
      <Navbar />

      <div className="container py-5">
        
        {/* --- Encabezado --- */}
        <div className="text-center mb-5">
          <h2 className="fw-bold display-5 text-primary mb-3">
            <FaTrophy className="text-warning me-3" />
            Tabla de Posiciones
          </h2>
          <p className="text-muted fs-5">Consulta el rendimiento global de la liga Robotech</p>
        </div>

        {/* --- Botones de Filtro (Tarjetas Interactivas) --- */}
        <div className="row g-4 mb-5 justify-content-center">
          
          <div className="col-md-4" onClick={() => setTipo("clubes")} style={{ cursor: "pointer" }}>
            <div className={`card shadow-sm border-0 h-100 transition-all ${tipo === 'clubes' ? 'bg-primary text-white ring-4' : 'bg-white'}`}>
              <div className="card-body text-center py-4">
                <FaShieldAlt size={40} className="mb-3" />
                <h5 className="fw-bold">Clubes</h5>
                <p className={`small ${tipo === 'clubes' ? 'text-white-50' : 'text-muted'}`}>Puntaje acumulado por organización</p>
              </div>
            </div>
          </div>

          <div className="col-md-4" onClick={() => setTipo("competidores")} style={{ cursor: "pointer" }}>
            <div className={`card shadow-sm border-0 h-100 transition-all ${tipo === 'competidores' ? 'bg-success text-white' : 'bg-white'}`}>
              <div className="card-body text-center py-4">
                <FaUsers size={40} className="mb-3" />
                <h5 className="fw-bold">Competidores</h5>
                <p className={`small ${tipo === 'competidores' ? 'text-white-50' : 'text-muted'}`}>Rendimiento individual de pilotos</p>
              </div>
            </div>
          </div>

          <div className="col-md-4" onClick={() => setTipo("robots")} style={{ cursor: "pointer" }}>
            <div className={`card shadow-sm border-0 h-100 transition-all ${tipo === 'robots' ? 'bg-warning text-dark' : 'bg-white'}`}>
              <div className="card-body text-center py-4">
                <FaRobot size={40} className="mb-3" />
                <h5 className="fw-bold">Robots</h5>
                <p className={`small ${tipo === 'robots' ? 'text-dark-50' : 'text-muted'}`}>Estadísticas de combate por unidad</p>
              </div>
            </div>
          </div>

        </div>

        {/* --- Tabla de Resultados --- */}
        <div className="card shadow border-0 overflow-hidden">
          <div className="card-header bg-white py-3 border-bottom">
            <h5 className="fw-bold m-0 text-secondary">{getTitulo()}</h5>
          </div>
          
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light text-secondary text-uppercase small">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="py-3">Nombre</th>
                  <th className="py-3 text-center">Puntaje Total</th>
                  <th className="py-3 text-center">Promedio</th>
                  <th className="py-3 text-center text-success">Victorias</th>
                  <th className="py-3 text-center text-danger">Derrotas</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status"></div>
                    </td>
                  </tr>
                ) : data.length > 0 ? (
                  data.map((item, index) => (
                    <tr key={index} className={index < 3 ? "fw-semibold" : ""}>
                      <td className="px-4 py-3">
                        {index === 0 && <FaMedal className="text-warning fs-4" />}
                        {index === 1 && <FaMedal className="text-secondary fs-4" />}
                        {index === 2 && <FaMedal className="text-danger fs-4" />} {/* Bronce */}
                        {index > 2 && <span className="text-muted fw-bold ps-2">{index + 1}</span>}
                      </td>
                      
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="ms-2">
                            <span className="d-block text-dark">{item.nombre}</span>
                            <small className="text-muted" style={{fontSize: '0.75rem'}}>ID: {item.idReferencia}</small>
                          </div>
                        </div>
                      </td>

                      <td className="text-center">
                        <span className="badge bg-primary fs-6 px-3 py-2 rounded-pill">
                          {item.puntosRanking} pts
                        </span>
                      </td>

                      <td className="text-center text-muted">
                        <FaChartLine className="me-1 text-info"/>
                        {item.promedioPuntaje ? item.promedioPuntaje.toFixed(1) : "0.0"}
                      </td>

                      <td className="text-center text-success fw-bold">
                        {item.victorias}
                      </td>

                      <td className="text-center text-danger">
                        {item.derrotas}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      No hay datos registrados aún para esta categoría.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
      <Footer />
    </>
  );
}