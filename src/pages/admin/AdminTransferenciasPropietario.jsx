import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaUserTie, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import api from "../../services/axiosConfig";

export default function AdminTransferenciasPropietario() {
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/propietario-transferencias/pendientes");
      setPendientes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo cargar las solicitudes", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const aprobar = async (id) => {
    const result = await Swal.fire({
      title: "?Aprobar transferencia?",
      text: "El club pasar? al nuevo propietario.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "S?, aprobar",
      confirmButtonColor: "#198754",
    });

    if (!result.isConfirmed) return;

    try {
      await api.put(`/admin/propietario-transferencias/${id}/aprobar`);
      Swal.fire("Aprobado", "Transferencia aplicada", "success");
      cargar();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "No se pudo aprobar";
      Swal.fire("Error", msg, "error");
    }
  };

  const rechazar = async (id) => {
    const result = await Swal.fire({
      title: "?Rechazar transferencia?",
      text: "La solicitud ser? rechazada.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "S?, rechazar",
      confirmButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    try {
      await api.put(`/admin/propietario-transferencias/${id}/rechazar`);
      Swal.fire("Rechazado", "Solicitud rechazada", "info");
      cargar();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "No se pudo rechazar";
      Swal.fire("Error", msg, "error");
    }
  };

  return (
    <div className="container-fluid px-4 mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-0">
            <FaUserTie className="me-2" />
            Transferencias de Propietario
          </h2>
          <p className="text-muted mb-0">Aprueba o rechaza solicitudes de clubes</p>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">Club</th>
                  <th>Propietario actual</th>
                  <th>Nuevo propietario</th>
                  <th className="text-end pe-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-5">
                      <div className="spinner-border text-primary" />
                    </td>
                  </tr>
                ) : pendientes.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center text-muted py-5">
                      No hay solicitudes pendientes.
                    </td>
                  </tr>
                ) : (
                  pendientes.map((s) => (
                    <tr key={s.idTransferencia}>
                      <td className="ps-4 fw-bold text-primary">{s.nombreClub}</td>
                      <td>
                        <div className="d-flex flex-column small">
                          <span className="text-muted">{s.nombrePropietarioActual}</span>
                          <span className="text-muted">{s.correoPropietarioActual}</span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-column small">
                          <span className="text-muted">{s.nombreCompetidorNuevo}</span>
                          <span className="text-muted">{s.correoCompetidorNuevo}</span>
                        </div>
                      </td>
                      <td className="text-end pe-4">
                        <button className="btn btn-outline-success btn-sm me-2" onClick={() => aprobar(s.idTransferencia)}>
                          <FaCheckCircle />
                        </button>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => rechazar(s.idTransferencia)}>
                          <FaTimesCircle />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
