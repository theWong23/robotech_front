import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../services/axiosConfig";
import { FaChartLine, FaMedal, FaSync, FaTrophy, FaUsers } from "react-icons/fa";

export default function CompetidorRanking() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const storedUser = localStorage.getItem("usuario");
  const entidad = storedUser ? JSON.parse(storedUser) : null;
  const idCompetidor = entidad?.idCompetidor;

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/rankings/competidores");
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error cargando ranking:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const miPosicion = useMemo(() => {
    if (!idCompetidor) return null;
    const idx = data.findIndex((d) => d.idReferencia === idCompetidor);
    return idx >= 0 ? idx + 1 : null;
  }, [data, idCompetidor]);

  const misPuntos = useMemo(() => {
    if (!idCompetidor) return null;
    const row = data.find((d) => d.idReferencia === idCompetidor);
    return row?.puntosRanking ?? null;
  }, [data, idCompetidor]);

  return (
    <div className="container-fluid">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-0 text-dark">
            <FaTrophy className="me-2 text-warning" />
            Ranking Global
          </h2>
          <p className="text-muted mb-0">Posicion general de competidores</p>
        </div>

        <button
          className="btn btn-outline-secondary d-flex align-items-center gap-2"
          onClick={cargar}
          disabled={loading}
        >
          <FaSync className={loading ? "fa-spin" : ""} />
          Actualizar
        </button>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm bg-white border-start border-4 border-primary h-100">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <h6 className="text-muted mb-1">Competidores rankeados</h6>
                <h3 className="fw-bold mb-0">{data.length}</h3>
              </div>
              <FaUsers className="text-primary opacity-25" size={40} />
            </div>
          </div>
        </div>
        <div className="col-6 col-md-4">
          <div className="card border-0 shadow-sm bg-white border-start border-4 border-success h-100">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <h6 className="text-muted mb-1">Tu posicion</h6>
                <h3 className="fw-bold mb-0">{miPosicion ?? "-"}</h3>
              </div>
              <FaTrophy className="text-success opacity-25" size={40} />
            </div>
          </div>
        </div>
        <div className="col-6 col-md-4">
          <div className="card border-0 shadow-sm bg-white border-start border-4 border-warning h-100">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <h6 className="text-muted mb-1">Tus puntos</h6>
                <h3 className="fw-bold mb-0">{misPuntos ?? "-"}</h3>
              </div>
              <FaChartLine className="text-warning opacity-25" size={40} />
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow border-0 overflow-hidden">
        <div className="card-header bg-white py-3 border-bottom">
          <h5 className="fw-bold m-0 text-secondary">Tabla de Competidores</h5>
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
                <th className="py-3 text-center text-info">Empates</th>
                <th className="py-3 text-center text-danger">Derrotas</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((item, index) => (
                  <tr
                    key={item.idReferencia || index}
                    className={item.idReferencia === idCompetidor ? "table-success fw-semibold" : ""}
                  >
                    <td className="px-4 py-3">
                      {index === 0 && <FaMedal className="text-warning fs-4" />}
                      {index === 1 && <FaMedal className="text-secondary fs-4" />}
                      {index === 2 && <FaMedal className="text-danger fs-4" />}
                      {index > 2 && <span className="text-muted fw-bold ps-2">{index + 1}</span>}
                    </td>

                    <td>
                      <div className="d-flex align-items-center">
                        <div className="ms-2">
                          <span className="d-block text-dark">{item.nombre}</span>
                          <small className="text-muted" style={{ fontSize: "0.75rem" }}>ID: {item.idReferencia}</small>
                        </div>
                      </div>
                    </td>

                    <td className="text-center">
                      <span className="badge bg-primary fs-6 px-3 py-2 rounded-pill">
                        {item.puntosRanking} pts
                      </span>
                    </td>

                    <td className="text-center text-muted">
                      <FaChartLine className="me-1 text-info" />
                      {item.promedioPuntaje ? item.promedioPuntaje.toFixed(1) : "0.0"}
                    </td>

                    <td className="text-center text-success fw-bold">{item.victorias}</td>
                    <td className="text-center text-info">{item.empates}</td>
                    <td className="text-center text-danger">{item.derrotas}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    No hay datos registrados aun para esta categoria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
