import { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import api from "../../services/axiosConfig";
import { FaUsers, FaRobot, FaTicketAlt, FaPlus, FaCalendarAlt, FaUserFriends, FaInfoCircle, FaCheckCircle, FaExclamationCircle, FaHourglassHalf } from "react-icons/fa";
import "../../styles/ClubPanel.css";

export default function ClubDashboard() {
  const [club, setClub] = useState(null);
  const [codigos, setCodigos] = useState([]);
  // ✅ El estado inicial ahora incluye totalCodigos para evitar valores undefined
  const [stats, setStats] = useState({ totalCompetidores: 0, totalRobots: 0, totalCodigos: 0 });
  const [loading, setLoading] = useState(true);

  const storedUser = localStorage.getItem("usuario");
  const entidad = storedUser ? JSON.parse(storedUser) : null;
  const idClub = entidad?.idClub;

  const cargarDashboard = useCallback(async () => {
    if (!idClub) return;
    setLoading(true);
    try {
      const [resClub, resStats, resCodigos] = await Promise.all([
        api.get(`/clubes/${idClub}`),
        api.get(`/clubes/${idClub}/stats`),
        api.get(`/codigos/club/${idClub}`)
      ]);
      setClub(resClub.data);
      setStats(resStats.data); // ✅ Aquí se recibe el Map con 'totalCodigos' desde el Back
      setCodigos(resCodigos.data);
    } catch (err) {
      console.error("Error al cargar dashboard:", err);
      Swal.fire("Error", "No se pudo sincronizar la información", "error");
    } finally {
      setLoading(false);
    }
  }, [idClub]);

  useEffect(() => { cargarDashboard(); }, [cargarDashboard]);

  const generarCodigo = async () => {
    const { value: valores } = await Swal.fire({
      title: "Nuevo Código de Acceso",
      html: `
        <div class="text-start px-3">
          <label class="form-label fw-bold small mb-1">Horas de validez</label>
          <input id="horas" type="number" class="form-control mb-3" value="24">
          <label class="form-label fw-bold small mb-1">Límite de usos</label>
          <input id="limite" type="number" class="form-control" value="1">
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: "#007bff",
      confirmButtonText: "Generar Código",
      preConfirm: () => ({
        horas: document.getElementById("horas").value,
        limite: document.getElementById("limite").value
      })
    });

    if (valores) {
      try {
        const res = await api.post(`/codigos/${idClub}/generar`, {
          horasExpiracion: Number(valores.horas),
          limiteUso: Number(valores.limite)
        });
        Swal.fire("¡Éxito!", `Código: ${res.data.codigo}`, "success");
        cargarDashboard(); // ✅ Recarga stats para actualizar el contador automáticamente
      } catch {
        Swal.fire("Error", "No se pudo generar", "error");
      }
    }
  };

  if (loading) return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
      <div className="spinner-border text-teal" role="status" style={{width: '3rem', height: '3rem'}}></div>
      <p className="mt-3 text-muted fw-bold text-uppercase">Sincronizando Panel...</p>
    </div>
  );

  return (
    <div className="container-fluid px-4 py-4 animate__animated animate__fadeIn">
      
      {/* HEADER PRINCIPAL */}
      <div className="club-header-banner p-4 mb-5 shadow rounded-4 text-white">
        <div className="d-flex align-items-center gap-4">
          <div className="profile-img-container">
            <img
              src={club?.logoUrl || "/default-club.png"}
              alt="logo"
              className="club-profile-img border border-4 border-white-50"
            />
          </div>
          <div>
            <h1 className="display-5 fw-bold mb-1">{club?.nombre}</h1>
            <p className="opacity-75 mb-0 d-flex align-items-center gap-2">
              <FaInfoCircle /> {club?.descripcion || "Gestión de sede y competidores registrados."}
            </p>
          </div>
        </div>
      </div>

      {/* MÉTRICAS (KPIs) */}
      <div className="row g-4 mb-5">
        {[
          { label: "Competidores", val: stats.totalCompetidores, icon: <FaUsers />, class: "kpi-blue" },
          { label: "Robots", val: stats.totalRobots, icon: <FaRobot />, class: "kpi-green" },
          // ✅ CORREGIDO: Ahora usa stats.totalCodigos del Backend en lugar de codigos.length
          { label: "Códigos Generados", val: stats.totalCodigos, icon: <FaTicketAlt />, class: "kpi-orange" }
        ].map((kpi, idx) => (
          <div className="col-md-4" key={idx}>
            <div className={`card border-0 shadow-sm kpi-card-main ${kpi.class}`}>
              <div className="card-body d-flex align-items-center justify-content-between p-4 text-white">
                <div>
                  <p className="kpi-label-mini mb-1 text-uppercase">{kpi.label}</p>
                  <h2 className="kpi-value-main mb-0">{kpi.val}</h2>
                </div>
                <div className="kpi-icon-container">
                  {kpi.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* TABLA DE REGISTRO */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="card-header bg-white border-0 py-4 d-flex justify-content-between align-items-center">
          <div>
            <h3 className="fw-bold mb-0 text-dark">Registro de Accesos</h3>
            <small className="text-muted">Gestión de códigos históricos</small>
          </div>
          <button className="btn btn-primary-robotech d-flex align-items-center gap-2 px-4 py-2 shadow-sm fw-bold" onClick={generarCodigo}>
            <FaPlus /> NUEVO CÓDIGO
          </button>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-robotech-head text-muted small text-uppercase">
              <tr>
                <th className="ps-4">Código</th>
                <th>Estado</th>
                <th>Expiración</th>
                <th>Uso / Límite</th>
                <th className="pe-4 text-center">Capacidad</th>
              </tr>
            </thead>
            <tbody>
              {codigos.map((c) => (
                <tr key={c.codigo}>
                  <td className="ps-4">
                    <span className="badge-code-robotech">{c.codigo}</span>
                  </td>
                  <td>
                    {c.usado ? (
                      <span className="status-pill-robotech pill-red"><FaExclamationCircle /> AGOTADO</span>
                    ) : new Date(c.expiraEn) < new Date() ? (
                      <span className="status-pill-robotech pill-gray"><FaHourglassHalf /> EXPIRADO</span>
                    ) : (
                      <span className="status-pill-robotech pill-green"><FaCheckCircle /> VIGENTE</span>
                    )}
                  </td>
                  <td className="text-muted small">
                    <FaCalendarAlt className="me-1 opacity-50"/> {new Date(c.expiraEn).toLocaleDateString()}
                  </td>
                  <td className="fw-bold small">
                    <FaUserFriends className="me-1 opacity-50"/> {c.usosActuales} / {c.limiteUso}
                  </td>
                  <td className="pe-4">
                    <div className="progress-robotech-container">
                      <div 
                        className={`progress-robotech-fill ${c.usado ? 'fill-red' : 'fill-teal'}`} 
                        style={{ width: `${(c.usosActuales / c.limiteUso) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}