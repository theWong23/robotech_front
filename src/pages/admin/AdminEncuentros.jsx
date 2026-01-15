import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../services/axiosConfig";
import { useNavigate } from "react-router-dom";
import "../../styles/AdminEncuentros.css";

export default function AdminEncuentros() {

  const [categorias, setCategorias] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // -------------------------------
  // CARGAR CATEGORÍAS
  // -------------------------------
  const cargarCategorias = async () => {
    try {
      const res = await api.get("/admin/encuentros/categorias");
      setCategorias(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Error",
        "No se pudieron cargar las categorías",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  // -------------------------------
  // RENDER
  // -------------------------------
  if (loading) {
    return <p className="text-muted">Cargando categorías...</p>;
  }

  return (
    <div className="container">

      <h2 className="fw-bold mb-4">Gestión de Encuentros</h2>

      {categorias.length === 0 ? (
        <p className="text-muted">No hay categorías disponibles</p>
      ) : (
        <div className="row g-4">
          {categorias.map(cat => (
            <div key={cat.idCategoriaTorneo} className="col-md-6 col-lg-4">

              <div className="card encuentro-card shadow-sm h-100">
                <div className="card-body">

                  <h5 className="fw-bold">{cat.torneo}</h5>
                  <p className="mb-1">
                    <strong>Categoría:</strong> {cat.categoria}
                  </p>

                  <span
                    className={`badge ${
                      cat.modalidad === "EQUIPO"
                        ? "bg-primary"
                        : "bg-secondary"
                    }`}
                  >
                    {cat.modalidad}
                  </span>

                  <hr />

                  <p className="mb-1">
                    <strong>Inscritos:</strong>{" "}
                    {cat.inscritos} / {cat.maxParticipantes}
                  </p>

                  <p className="mb-3">
                    <strong>Estado:</strong>{" "}
                    {cat.inscripcionesCerradas ? (
                      <span className="text-success fw-bold">
                        Inscripciones cerradas
                      </span>
                    ) : (
                      <span className="text-warning fw-bold">
                        Inscripciones abiertas
                      </span>
                    )}
                  </p>

                 <button
                    className="btn btn-success w-100"
                    onClick={() =>
                      navigate(`/admin/encuentros/${cat.idCategoriaTorneo}`)
                    }
                  >
                    Crear Encuentros
                  </button>

                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
