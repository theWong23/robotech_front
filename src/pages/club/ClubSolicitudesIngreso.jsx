import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaInbox, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import api from "../../services/axiosConfig";

export default function ClubSolicitudesIngreso() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    setLoading(true);
    try {
      const res = await api.get("/club/solicitudes-ingreso");
      setSolicitudes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudieron cargar las solicitudes", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const aprobar = async (id) => {
    try {
      await api.post(`/club/solicitudes-ingreso/${id}/aprobar`);
      Swal.fire("Aprobado", "Competidor agregado al club", "success");
      cargar();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "No se pudo aprobar";
      Swal.fire("Error", msg, "error");
    }
  };

  const rechazar = async (id) => {
    try {
      await api.post(`/club/solicitudes-ingreso/${id}/rechazar`);
      Swal.fire("Rechazado", "Solicitud rechazada", "info");
      cargar();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "No se pudo rechazar";
      Swal.fire("Error", msg, "error");
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-0 text-dark">
            <FaInbox className="me-2 text-primary" />
            Solicitudes de Ingreso
          </h2>
          <p className="text-muted mb-0">Aprueba o rechaza competidores agentes libres</p>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">Cargando...</div>
          ) : solicitudes.length === 0 ? (
            <div className="text-muted">No hay solicitudes pendientes.</div>
          ) : (
            <div className="list-group">
              {solicitudes.map((s) => (
                <div key={s.idSolicitud} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-bold">{s.nombreCompetidor}</div>
                    <div className="small text-muted">{s.correoCompetidor}</div>
                  </div>
                  <div className="btn-group">
                    <button className="btn btn-outline-success btn-sm" onClick={() => aprobar(s.idSolicitud)}>
                      <FaCheckCircle />
                    </button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => rechazar(s.idSolicitud)}>
                      <FaTimesCircle />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
