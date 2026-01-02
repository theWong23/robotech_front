import { useState } from "react";
import Swal from "sweetalert2";
import { inscribirIndividual } from "../../services/inscripcionService";

export default function CompetidorInscripcion({ idCategoriaTorneo, robots }) {

  const [idRobot, setIdRobot] = useState("");

  const inscribir = async () => {
    if (!idRobot) {
      Swal.fire("Error", "Selecciona un robot", "warning");
      return;
    }

    try {
      await inscribirIndividual({
        idCategoriaTorneo,
        idRobot
      });

      Swal.fire("✔ Inscrito", "Robot inscrito correctamente", "success");

    } catch (err) {
      Swal.fire(
        "Error",
        err?.response?.data ?? "No se pudo inscribir",
        "error"
      );
    }
  };

  return (
    <div className="card p-3">
      <h5>Inscripción Individual</h5>

      <select
        className="form-control mt-2"
        value={idRobot}
        onChange={e => setIdRobot(e.target.value)}
      >
        <option value="">Selecciona tu robot</option>
        {robots.map(r => (
          <option key={r.idRobot} value={r.idRobot}>
            {r.nombre}
          </option>
        ))}
      </select>

      <button className="btn btn-success mt-3" onClick={inscribir}>
        Inscribirme
      </button>
    </div>
  );
}
