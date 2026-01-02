import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../services/axiosConfig";
import ClubInscribirEquipo from "./ClubInscribirEquipo";
import ClubInscribirIndividual from "./ClubInscribirIndividual";

export default function ClubInscribir() {

  const { idTorneo, idCategoriaTorneo } = useParams();
  

  const [categoria, setCategoria] = useState(null);
  const [loading, setLoading] = useState(true);

  // ----------------------------------
  // Cargar categoría DESDE el torneo
  // ----------------------------------
  useEffect(() => {
    api.get(`/api/admin/torneos/${idTorneo}/categorias`)
      .then(res => {
        const encontrada = res.data.find(
          c => c.idCategoriaTorneo === idCategoriaTorneo
        );

        if (!encontrada) {
          throw new Error("Categoría no encontrada");
        }

        setCategoria(encontrada);
      })
      .catch(() => {
        Swal.fire("Error", "No se pudo cargar la categoría", "error");
      })
      .finally(() => setLoading(false));
  }, [idTorneo, idCategoriaTorneo]);

  if (loading) return <p>Cargando...</p>;
  if (!categoria) return null;

  // ----------------------------------
  // Render según modalidad
  // ----------------------------------

  if (!categoria) {
  return <p>Cargando categoría...</p>;
  }
  return categoria.modalidad === "EQUIPO" ? (
  <ClubInscribirEquipo categoria={categoria} />
) : (
  <ClubInscribirIndividual categoria={categoria} />
);
}
