import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../services/axiosConfig";
import { inscribirIndividualCompetidor } from "../../services/inscripcionService";

export default function CompetidorInscribirIndividual({ categoria }) {
  const [robots, setRobots] = useState([]);
  const [robotSeleccionado, setRobotSeleccionado] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);

    api.get(`/competidor/inscripciones/robots-disponibles/${categoria.idCategoriaTorneo}`)
      .then((res) => setRobots(res.data || []))
      .catch(() => Swal.fire("Error", "No se pudieron cargar los robots", "error"))
      .finally(() => setLoading(false));
  }, [categoria.idCategoriaTorneo]);

  const inscribir = async () => {
    if (!robotSeleccionado) {
      Swal.fire("Atenci?n", "Selecciona un robot", "warning");
      return;
    }

    setSubmitting(true);

    try {
      await inscribirIndividualCompetidor({
        idCategoriaTorneo: categoria.idCategoriaTorneo,
        idRobot: robotSeleccionado
      });

      Swal.fire("? Inscripci?n realizada", "El robot qued? inscrito", "success");
      setRobotSeleccionado("");
    } catch (err) {
      Swal.fire("Error", err?.response?.data ?? "No se pudo inscribir el robot", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card shadow-sm p-4">
      <h5 className="fw-bold mb-3">Inscripci?n Individual ? {categoria.categoria}</h5>

      {loading ? (
        <p className="text-muted">Cargando robots...</p>
      ) : robots.length === 0 ? (
        <p className="text-muted">No hay robots disponibles</p>
      ) : (
        <select
          className="form-control mb-3"
          value={robotSeleccionado}
          onChange={(e) => setRobotSeleccionado(e.target.value)}
        >
          <option value="">Seleccione un robot</option>
          {robots.map((r) => (
            <option key={r.idRobot} value={r.idRobot}>
              {r.nombre}
            </option>
          ))}
        </select>
      )}

      <button
        className="btn btn-success w-100"
        disabled={submitting || !robotSeleccionado}
        onClick={inscribir}
      >
        {submitting ? "Inscribiendo..." : "Inscribir Robot"}
      </button>
    </div>
  );
}
