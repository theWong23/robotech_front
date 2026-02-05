import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { FaUserTie, FaExchangeAlt, FaTimesCircle } from "react-icons/fa";
import api from "../../services/axiosConfig";

export default function ClubTransferirPropietario() {
  const storedUser = localStorage.getItem("usuario");
  const entidad = storedUser ? JSON.parse(storedUser) : null;
  const idClub = entidad?.idClub;

  const [competidores, setCompetidores] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [idCompetidor, setIdCompetidor] = useState("");

  const competidoresAprobados = useMemo(
    () => competidores.filter((c) => c.estadoValidacion === "APROBADO"),
    [competidores]
  );

  const solicitudPendiente = useMemo(
    () => solicitudes.find((s) => s.estado === "PENDIENTE"),
    [solicitudes]
  );

  const cargarTodo = async () => {
    if (!idClub) return;
    setLoading(true);
    try {
      const [resCompetidores, resSolicitudes] = await Promise.all([
        api.get(`/competidores/club/${idClub}`),
        api.get("/club/propietario-transferencias"),
      ]);
      setCompetidores(Array.isArray(resCompetidores.data) ? resCompetidores.data : []);
      setSolicitudes(Array.isArray(resSolicitudes.data) ? resSolicitudes.data : []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo cargar la informaci?n", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTodo();
  }, [idClub]);

  const solicitar = async () => {
    if (!idCompetidor) {
      return Swal.fire("Atenci?n", "Selecciona un competidor", "warning");
    }
    try {
      await api.post("/club/propietario-transferencias/solicitar", { idCompetidor });
      setIdCompetidor("");
      Swal.fire("Solicitud enviada", "Queda pendiente de aprobaci?n", "success");
      cargarTodo();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "No se pudo solicitar";
      Swal.fire("Error", msg, "error");
    }
  };

  const cancelar = async (id) => {
    try {
      await api.post(`/club/propietario-transferencias/${id}/cancelar`);
      Swal.fire("Cancelado", "Solicitud cancelada", "info");
      cargarTodo();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "No se pudo cancelar";
      Swal.fire("Error", msg, "error");
    }
  };

  const badgeByEstado = (estado) => {
    switch (estado) {
      case "PENDIENTE":
        return "bg-warning-subtle text-warning-emphasis border border-warning";
      case "APROBADA":
        return "bg-success-subtle text-success border border-success";
      case "RECHAZADA":
      case "CANCELADA":
        return "bg-danger-subtle text-danger border border-danger";
      default:
        return "bg-light text-secondary border border-secondary";
    }
  };

  if (!idClub) {
    return <div className="alert alert-danger m-4">Error: No se identific? el club.</div>;
  }

  return (
    <div className="container-fluid">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-0 text-dark">
            <FaExchangeAlt className="me-2 text-primary" />
            Transferir Propietario
          </h2>
          <p className="text-muted mb-0">Solicita la transferencia del club a un competidor aprobado</p>
        </div>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white border-0 fw-bold">
          <FaUserTie className="me-2 text-info" />
          Nueva solicitud
        </div>
        <div className="card-body">
          {solicitudPendiente && (
            <div className="alert alert-warning">
              Ya tienes una solicitud pendiente. Debe ser aprobada o rechazada por admin/subadmin.
            </div>
          )}
          <div className="row g-3 align-items-end">
            <div className="col-md-8">
              <label className="form-label fw-bold small">Competidor aprobado</label>
              <select
                className="form-select"
                value={idCompetidor}
                onChange={(e) => setIdCompetidor(e.target.value)}
                disabled={loading || !!solicitudPendiente}
              >
                <option value="">Selecciona un competidor...</option>
                {competidoresAprobados.map((c) => (
                  <option key={c.idCompetidor} value={c.idCompetidor}>
                    {c.nombres} {c.apellidos} - {c.dni}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <button
                className="btn btn-primary w-100"
                onClick={solicitar}
                disabled={loading || !!solicitudPendiente}
              >
                Enviar solicitud
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white border-0 fw-bold">Mis solicitudes</div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">Cargando...</div>
          ) : solicitudes.length === 0 ? (
            <div className="text-muted">No has realizado solicitudes.</div>
          ) : (
            <div className="list-group">
              {solicitudes.map((s) => (
                <div key={s.idTransferencia} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-bold">{s.nombreCompetidorNuevo || "Competidor"}</div>
                    <div className="small text-muted">Nuevo propietario</div>
                    <span className={`badge rounded-pill ${badgeByEstado(s.estado)}`}>{s.estado}</span>
                  </div>
                  {s.estado === "PENDIENTE" && (
                    <button className="btn btn-outline-danger btn-sm" onClick={() => cancelar(s.idTransferencia)}>
                      <FaTimesCircle className="me-1" />
                      Cancelar
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
