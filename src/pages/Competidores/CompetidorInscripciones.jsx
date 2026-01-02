import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { obtenerInscripcionesCompetidor } from "../../services/inscripcionesService";
import InscripcionCard from "../../components/InscripcionCard";

export default function CompetidorInscripciones() {

  const [inscripciones, setInscripciones] = useState([]);

  useEffect(() => {
    obtenerInscripcionesCompetidor()
      .then(res => setInscripciones(res.data))
      .catch(() =>
        Swal.fire("Error", "No se pudieron cargar las inscripciones", "error")
      );
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-4">Mis Inscripciones</h2>

      {inscripciones.length === 0 ? (
        <p className="text-muted">Aún no estás inscrito en ningún torneo</p>
      ) : (
        <div className="row g-3">
          {inscripciones.map(i => (
            <div key={i.idInscripcion} className="col-md-4">
              <InscripcionCard inscripcion={i} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
