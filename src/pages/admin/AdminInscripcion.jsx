import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../services/api";

export default function AdminInscripcion() {

  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---------------------------------
  // CARGAR INSCRIPCIONES
  // ---------------------------------
  const cargar = async () => {
    try {
      const res = await api.get("/admin/inscripciones");
      setInscripciones(res.data || []);
    } catch (err) {
      console.error("Error cargando inscripciones", err);
      Swal.fire(
        "Error",
        "No se pudieron cargar las inscripciones",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  // ---------------------------------
  // ANULAR INSCRIPCIÓN
  // ---------------------------------
  const anular = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: "¿Anular inscripción?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Sí, anular",
      cancelButtonText: "Cancelar"
    });

    if (!isConfirmed) return;

    try {
      await api.put(`/admin/inscripciones/${id}/anular`);
      Swal.fire(
        "Anulada",
        "La inscripción fue anulada correctamente",
        "success"
      );
      cargar(); // refrescar
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Error",
        "No se pudo anular la inscripción",
        "error"
      );
    }
  };

  // ---------------------------------
  // RENDER
  // ---------------------------------
  return (
    <div className="container-fluid">

      <h2 className="fw-bold mb-4">Gestión de Inscripciones</h2>

      {loading && <p className="text-muted">Cargando...</p>}

      {!loading && inscripciones.length === 0 && (
        <p className="text-muted">No hay inscripciones</p>
      )}

      {!loading && inscripciones.length > 0 && (
        <div className="table-responsive">
          <table className="table table-dark table-striped align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Torneo</th>
                <th>Categoría</th>
                <th>Modalidad</th>
                <th>Robots</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {inscripciones.map((i, index) => (
                <tr key={i.idInscripcion}>
                  <td>{index + 1}</td>

                  <td>{i.torneo}</td>

                  <td>{i.categoria}</td>

                  <td>
                    <span
                      className={`badge ${
                        i.modalidad === "EQUIPO"
                          ? "bg-primary"
                          : "bg-secondary"
                      }`}
                    >
                      {i.modalidad}
                    </span>
                  </td>

                  <td>
                    {i.robots.join(", ")}
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        i.estado === "ACTIVA"
                          ? "bg-success"
                          : "bg-danger"
                      }`}
                    >
                      {i.estado}
                    </span>
                  </td>

                  <td>
                    {i.estado === "ACTIVA" && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => anular(i.idInscripcion)}
                      >
                        Anular
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
