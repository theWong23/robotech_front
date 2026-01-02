import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { inscribirEquipo } from "../../services/inscripcionService";
import api from "../../services/axiosConfig";

export default function ClubInscribirEquipo({ categoria }) {
  const [robots, setRobots] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ✅ Blindaje: si categoria todavía no llegó
  const maxIntegrantes = useMemo(() => {
    const v = categoria?.maxIntegrantesEquipo;
    // fallback razonable para que nunca sea undefined/null
    return Number.isFinite(v) && v > 0 ? v : 1;
  }, [categoria]);

  useEffect(() => {
    api.get("/api/club/robots")
      .then((res) => setRobots(res.data))
      .catch(() => Swal.fire("Error", "No se pudieron cargar los robots", "error"))
      .finally(() => setLoading(false));
  }, []);

  const toggleRobot = (id) => {
    if (seleccionados.includes(id)) {
      setSeleccionados(seleccionados.filter((r) => r !== id));
      return;
    }

    if (seleccionados.length >= maxIntegrantes) {
      Swal.fire("Límite alcanzado", `Máximo ${maxIntegrantes} robots`, "warning");
      return;
    }

    setSeleccionados([...seleccionados, id]);
  };

  console.log("Categoria enviada:", categoria);
  console.log("ID categoria:", categoria?.idCategoriaTorneo);
  console.log("Modalidad:", categoria?.modalidad);
  const inscribir = async () => {
    // ✅ No dejar inscribir si no hay categoria lista
    if (!categoria?.idCategoriaTorneo) {
      Swal.fire("Error", "No se pudo obtener la categoría", "error");
      return;
    }

    if (seleccionados.length === 0) {
      Swal.fire("Atención", "Selecciona al menos un robot", "warning");
      return;
    }

    setSubmitting(true);
    try {
      await inscribirEquipo({
        idCategoriaTorneo: categoria.idCategoriaTorneo,
        robots: seleccionados,
      });

      Swal.fire("✔ Equipo inscrito", "Estado: pendiente", "success");
      setSeleccionados([]);
    } catch (err) {
      Swal.fire("Error", err?.response?.data ?? "No se pudo inscribir", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Render seguro si categoria no llegó aún
  if (!categoria) {
    return (
      <div className="card p-4 shadow-sm">
        <p className="text-muted mb-0">Cargando categoría...</p>
      </div>
    );
  }

  return (
    <div className="card p-4 shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Inscripción por Equipos</h5>
        <span className="badge bg-primary">
          {seleccionados.length} / {maxIntegrantes}
        </span>
      </div>

      {loading ? (
        <p>Cargando robots...</p>
      ) : robots.length === 0 ? (
        <p className="text-muted">No hay robots disponibles</p>
      ) : (
        robots.map((r) => (
          <div key={r.idRobot} className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              checked={seleccionados.includes(r.idRobot)}
              onChange={() => toggleRobot(r.idRobot)}
              disabled={!seleccionados.includes(r.idRobot) && seleccionados.length >= maxIntegrantes}
            />
            <label className="form-check-label">{r.nombre}</label>
          </div>
        ))
      )}

      <button className="btn btn-success mt-3" disabled={submitting} onClick={inscribir}>
        {submitting ? "Inscribiendo..." : "Inscribir Equipo"}
      </button>
    </div>
  );
}
