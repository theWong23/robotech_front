import { useMemo } from "react";
import { FaUsers, FaBuilding, FaTrophy, FaGavel } from "react-icons/fa";

export default function AdminDashboard() {
  const displayName = useMemo(() => {
    const storedUser = localStorage.getItem("usuario");
    try {
      const user = storedUser ? JSON.parse(storedUser) : null;
      const fullName = `${user?.nombres || ""} ${user?.apellidos || ""}`.trim();
      return (
        fullName ||
        user?.nombre ||
        user?.usuario ||
        user?.correo ||
        "Administrador"
      );
    } catch {
      return "Administrador";
    }
  }, []);

  const quickCards = [
    { title: "Usuarios", desc: "Gestión de cuentas del sistema", icon: <FaUsers />, color: "primary" },
    { title: "Clubes", desc: "Administrar clubes registrados", icon: <FaBuilding />, color: "success" },
    { title: "Torneos", desc: "Crear y gestionar torneos", icon: <FaTrophy />, color: "warning" },
    { title: "Jueces", desc: "Asignar y administrar jueces", icon: <FaGavel />, color: "info" },
  ];

  return (
    <div className="container-fluid px-4 py-4 animate__animated animate__fadeIn">
      <div className="admin-welcome-banner p-4 p-md-5 mb-5 text-white rounded-4 shadow-sm">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <p className="text-uppercase small fw-bold mb-2 opacity-75">Panel de administración</p>
            <h2 className="fw-bold mb-2">¡Bienvenido de nuevo, {displayName}!</h2>
            <p className="mb-0 opacity-75">
              Organiza torneos, administra usuarios y mantén todo en orden.
            </p>
          </div>
          <div className="badge bg-light text-dark fw-bold px-3 py-2 align-self-md-start">
            Robotech 2026
          </div>
        </div>
      </div>

      <div className="row g-4">
        {quickCards.map((card, idx) => (
          <div className="col-12 col-sm-6 col-xl-3" key={idx}>
            <div className="card border-0 shadow-sm rounded-4 h-100 p-3 admin-card">
              <div className="d-flex align-items-center">
                <div
                  className={`rounded-circle bg-${card.color} bg-opacity-10 p-3 me-3 text-${card.color} fs-4 d-flex align-items-center justify-content-center`}
                  style={{ width: "60px", height: "60px" }}
                >
                  {card.icon}
                </div>
                <div>
                  <h6 className="text-muted mb-1 small text-uppercase fw-bold">{card.title}</h6>
                  <p className="mb-0 text-dark fw-semibold">{card.desc}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .admin-welcome-banner {
          background: linear-gradient(135deg, #1f6feb, #0ea5e9);
        }
        .admin-card {
          transition: transform .2s ease, box-shadow .2s ease;
        }
        .admin-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
        }
      `}</style>
    </div>
  );
}
