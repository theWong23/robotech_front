import { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import api from "../../services/axiosConfig";

export default function ClubCompetidores() {

  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔐 AUTH CORRECTO
  const usuarioRaw = localStorage.getItem("usuario");
  const usuario = usuarioRaw ? JSON.parse(usuarioRaw) : null;
  const idClub = usuario?.idClub;

  // ⛔ GUARDIA
  if (!usuario || !idClub) {
    return <div className="alert alert-danger">No autorizado</div>;
  }

  // ============================
  // CARGAR COMPETIDORES
  // ============================
  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/competidores/club/${idClub}`);
      setLista(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo cargar la lista", "error");
    } finally {
      setLoading(false);
    }
  }, [idClub]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // ============================
  // ACCIONES
  // ============================
  const aprobar = async (id) => {
    try {
      await api.put(`/api/competidores/${id}/aprobar`);
      Swal.fire("Aprobado", "Competidor activado", "success");
      cargar();
    } catch {
      Swal.fire("Error", "No se pudo aprobar", "error");
    }
  };

  const rechazar = async (id) => {
    try {
      await api.put(`/api/competidores/${id}/rechazar`);
      Swal.fire("Rechazado", "Competidor rechazado", "warning");
      cargar();
    } catch {
      Swal.fire("Error", "No se pudo rechazar", "error");
    }
  };

  // ============================
  // RENDER
  // ============================
  return (
    <>
      <h2 className="fw-bold mb-3">Mis Competidores</h2>

      {loading && <div className="text-muted">Cargando...</div>}

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>DNI</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {lista.length === 0 && !loading ? (
            <tr>
              <td colSpan="4" className="text-center text-muted">
                No hay competidores
              </td>
            </tr>
          ) : (
            lista.map((c) => (
              <tr key={c.idCompetidor}>
                <td>{c.nombres} {c.apellidos}</td>
                <td>{c.dni}</td>
                <td>
                  <span className={`badge ${
                    c.estadoValidacion === "APROBADO"
                      ? "bg-success"
                      : c.estadoValidacion === "RECHAZADO"
                      ? "bg-danger"
                      : "bg-warning"
                  }`}>
                    {c.estadoValidacion}
                  </span>
                </td>
                <td>
                  {c.estadoValidacion === "PENDIENTE" && (
                    <>
                      <button
                        className="btn btn-success btn-sm me-2"
                        onClick={() => aprobar(c.idCompetidor)}
                      >
                        Aprobar
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => rechazar(c.idCompetidor)}
                      >
                        Rechazar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );
}
