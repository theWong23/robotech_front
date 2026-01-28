import { useState, useEffect } from "react";
import { FaUsers, FaTrophy, FaBuilding, FaGavel } from "react-icons/fa";
import api from "../../services/axiosConfig"; 

export default function SubAdminDashboard() {
  const [stats, setStats] = useState({
    competidores: 0,
    clubes: 0,
    torneos: 0,
    jueces: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      
      const safeGet = async (url) => {
        try {
          const res = await api.get(url);
          return Array.isArray(res.data) ? res.data.length : 0;
        } catch (err) {
          console.warn(`No se pudo obtener datos de ${url}:`, err.response?.status || err.message);
          return 0; 
        }
      };

      try {
        const [compCount, clubCount, juezCount, torneoCount] = await Promise.all([
          safeGet("/subadmin/competidores"),
          safeGet("/public/clubes"),
          safeGet("/jueces"),
          safeGet("/admin/torneos") 
        ]);

        setStats({
          competidores: compCount,
          clubes: clubCount,
          jueces: juezCount,
          torneos: torneoCount,
        });
      } catch (error) {
        console.error("Error crítico en el Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const kpiCards = [
    { label: "Competidores", value: stats.competidores, icon: <FaUsers />, color: "primary" },
    { label: "Clubes Activos", value: stats.clubes, icon: <FaBuilding />, color: "success" },
    { label: "Jueces", value: stats.jueces, icon: <FaGavel />, color: "info" },
    { label: "Torneos", value: stats.torneos, icon: <FaTrophy />, color: "warning" },
  ];

  return (
    <div className="container-fluid px-4 py-4 animate__animated animate__fadeIn">
      
      {/* HEADER DE BIENVENIDA (Botón eliminado) */}
      <div className="mb-5 bg-white p-4 rounded-4 shadow-sm border-start border-primary border-5">
        <h2 className="fw-bold text-dark mb-1">¡Hola de nuevo, SubAdmin! 👋</h2>
        <p className="text-muted mb-0 small fw-bold text-uppercase ls-1">
          Panel de control administrativo - Robotech 2026
        </p>
      </div>

      {/* TARJETAS DE ESTADÍSTICAS (KPIs) */}
      <div className="row g-4">
        {kpiCards.map((stat, idx) => (
          <div className="col-12 col-sm-6 col-xl-3" key={idx}>
            <div className="card border-0 shadow-sm rounded-4 h-100 p-3 transition-all" style={{ transition: 'transform .2s' }}>
              <div className="d-flex align-items-center">
                <div className={`rounded-circle bg-${stat.color} bg-opacity-10 p-3 me-3 text-${stat.color} fs-4 d-flex align-items-center justify-content-center`} style={{ width: '60px', height: '60px' }}>
                  {stat.icon}
                </div>
                <div>
                  <h6 className="text-muted mb-0 small text-uppercase fw-bold">{stat.label}</h6>
                  <h3 className="fw-bold mb-0 text-dark">
                    {loading ? (
                      <div className="spinner-border spinner-border-sm text-secondary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                    ) : (
                      stat.value
                    )}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .ls-1 { letter-spacing: 0.5px; }
        .transition-all:hover {
          transform: translateY(-5px);
        }
      `}</style>
    </div>
  );
}