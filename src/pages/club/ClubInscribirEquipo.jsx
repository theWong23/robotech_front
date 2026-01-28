import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { inscribirEquipo } from "../../services/inscripcionService";
import api from "../../services/axiosConfig";

export default function ClubInscribirEquipo({ categoria }) {
  const [robots, setRobots] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [nombreEquipo, setNombreEquipo] = useState("");



  // ✅ Blindaje: si categoria todavía no llegó
  const maxIntegrantes = useMemo(() => {
    const v = categoria?.maxIntegrantesEquipo;
    // fallback razonable para que nunca sea undefined/null
    return Number.isFinite(v) && v > 0 ? v : 1;
  }, [categoria]);

  useEffect(() => {
    if (!categoria?.idCategoriaTorneo) {
      setRobots([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    api.get(`/club/inscripciones/robots-disponibles/${categoria.idCategoriaTorneo}`)
      .then((res) => setRobots(res.data))
      .catch(() => Swal.fire("Error", "No se pudieron cargar los robots", "error"))
      .finally(() => setLoading(false));
  }, [categoria?.idCategoriaTorneo]);

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

    if (!nombreEquipo.trim()) {
      Swal.fire("Atención", "Ingresa un nombre para el equipo", "warning");
      return;
    }


    setSubmitting(true);
    try {
      await inscribirEquipo({
        idCategoriaTorneo: categoria.idCategoriaTorneo,
        nombreEquipo,
        robots: seleccionados,
      });   

      Swal.fire("✔ Equipo inscrito", "Estado: pendiente", "success");
      setSeleccionados([]);
    } catch (err) {
      const message = err?.response?.data?.message ?? err?.response?.data ?? "No se pudo inscribir";
      Swal.fire("Error", message, "error");
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
    <h5 className="fw-bold mb-3">Inscripción por Equipos</h5>

    {/* Nombre del equipo */}
    <div className="mb-3">
      <label className="form-label fw-semibold">Nombre del equipo</label>
      <input
        type="text"
        className="form-control"
        placeholder="Ej: ThunderBots"
        value={nombreEquipo}
        onChange={(e) => setNombreEquipo(e.target.value)}
        maxLength={50}
      />
    </div>

    {/* Contador */}
    <div className="d-flex justify-content-between align-items-center mb-2">
      <span className="fw-semibold">Selecciona robots</span>
      <span className="badge bg-primary">
        {seleccionados.length} / {maxIntegrantes}
      </span>
    </div>

    {/* Robots */}
    {loading ? (
      <p>Cargando robots...</p>
    ) : robots.length === 0 ? (
      <p className="text-muted">No hay robots disponibles</p>
    ) : (
      <div className="row">
        {robots.map((r) => {
          const checked = seleccionados.includes(r.idRobot);
          return (
            <div key={r.idRobot} className="col-md-6 mb-2">
              <div
                className={`card p-2 h-100 ${
                  checked ? "border-success bg-light" : ""
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => toggleRobot(r.idRobot)}
              >
                <div className="d-flex align-items-center">
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    checked={checked}
                    readOnly
                  />
                  <div>
                    <div className="fw-semibold">{r.nombre}</div>
                    <small className="text-muted">
                      {r.categoria ?? "Robot"}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}

    {/* Preview */}
    {seleccionados.length > 0 && (
      <div className="alert alert-secondary mt-3">
        <strong>Equipo:</strong> {nombreEquipo || "—"} <br />
        <strong>Robots:</strong>{" "}
        {robots
          .filter((r) => seleccionados.includes(r.idRobot))
          .map((r) => r.nombre)
          .join(", ")}
      </div>
    )}

    {/* Botón */}
    <button
      className="btn btn-success w-100 mt-3"
      disabled={submitting}
      onClick={inscribir}
    >
      {submitting ? "Inscribiendo..." : "Inscribir Equipo"}
    </button>
  </div>
);

}
