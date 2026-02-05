import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/axiosConfig";
import "../../styles/ClubRobots.css";

const ClubRobots = () => {
  const [robots, setRobots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarRobots = async () => {
      try {
        const res = await api.get("/club/robots");
        setRobots(res.data);
      } catch (err) {
        console.error("Error cargando robots", err);
      } finally {
        setLoading(false);
      }
    };

    cargarRobots();
  }, []);

  if (loading) {
    return <div className="loader">Cargando robots…</div>;
  }

  const roles = JSON.parse(localStorage.getItem("roles") || "[]");

  return (
    <div className="robots-container">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3">
        <h2 className="robots-title mb-0">Mis Robots</h2>
        {roles.includes("COMPETIDOR") && (
          <Link className="btn btn-outline-primary btn-sm" to="/competidor/robots">
            Registrar mis robots personales
          </Link>
        )}
      </div>

      {robots.length === 0 ? (
        <p className="empty-state">No tienes robots registrados</p>
      ) : (
        <div className="robots-grid">
          {robots.map((robot) => (
            <div className="robot-card" key={robot.idRobot}>
              <h3 className="robot-name">{robot.nombre}</h3>

              <div className="robot-info">
                <span className="robot-category">{robot.categoria}</span>
                <span className="robot-nickname">@{robot.nickname}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClubRobots;
