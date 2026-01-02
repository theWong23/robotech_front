import api from "./axiosConfig";

export const obtenerInscripcionesClub = () =>
  api.get("/api/inscripciones/club");

export const obtenerInscripcionesCompetidor = () =>
  api.get("/api/inscripciones/competidor");
