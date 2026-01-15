import api from "./axiosConfig";

// ✅ CAMBIO: Quita el "/" al principio de la ruta
export const obtenerInscripcionesClub = () =>
  api.get("inscripciones/club"); 

export const obtenerInscripcionesCompetidor = () =>
  api.get("inscripciones/competidor");