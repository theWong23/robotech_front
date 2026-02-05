import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../services/axiosConfig";
import CompetidorInscribirIndividual from "./CompetidorInscribirIndividual";

export default function CompetidorInscribir() {
  const { idTorneo, idCategoriaTorneo } = useParams();
  const [categoria, setCategoria] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/public/torneos/${idTorneo}/categorias`)
      .then((res) => {
        const encontrada = (res.data || []).find(
          (c) => c.idCategoriaTorneo === idCategoriaTorneo
        );

        if (!encontrada) {
          throw new Error("Categor?a no encontrada");
        }

        setCategoria(encontrada);
      })
      .catch(() => {
        Swal.fire("Error", "No se pudo cargar la categor?a", "error");
      })
      .finally(() => setLoading(false));
  }, [idTorneo, idCategoriaTorneo]);

  if (loading) return <p>Cargando...</p>;
  if (!categoria) return null;

  if (categoria.modalidad !== "INDIVIDUAL") {
    return (
      <div className="alert alert-warning">
        Solo puedes inscribirte en categor?as individuales.
      </div>
    );
  }

  return <CompetidorInscribirIndividual categoria={categoria} />;
}
