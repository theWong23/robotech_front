import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api"; // ajusta la ruta si es necesario

export default function ClubCategoriasTorneo() {
  const { idTorneo } = useParams();
  const [categorias, setCategorias] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get(`http://localhost:8080/api/admin/torneos/${idTorneo}/categorias`)
      .then((res) => setCategorias(res.data))
      .catch(() => alert("Error cargando categorías"));
  }, [idTorneo]);

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Categorías del Torneo</h2>
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate(-1)}
        >
          ← Volver
        </button>
      </div>

      {categorias.length === 0 ? (
        <div className="alert alert-info text-center">
          No hay categorías registradas para este torneo
        </div>
      ) : (
        <div className="row g-4">
          {categorias.map((c) => (
            <div className="col-md-6 col-lg-4" key={c.idCategoriaTorneo}>
              <div className="card h-100 shadow-sm border-0 categoria-card">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title fw-bold text-uppercase">
                    {c.categoria}
                  </h5>

                  <p className="text-muted mb-2">
                    Máx. equipos: <strong>{c.maxParticipantes}</strong>
                  </p>
                  <p className="text-muted mb-4">
                    Máx. integrantes por equipo:{" "}
                    <strong>{c.maxIntegrantesEquipo}</strong>
                  </p>

                  <button
                    className="btn btn-success mt-auto w-100"
                    onClick={() =>
                      navigate(
                        `/club/torneos/${idTorneo}/categorias/${c.idCategoriaTorneo}/inscribir`
                      )
                    }
                  >
                    Inscribir equipo
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
