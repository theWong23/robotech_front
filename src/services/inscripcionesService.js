import api from "./axiosConfig";

// ✅ Funciona para el Club
export const obtenerInscripcionesClub = (params) =>
  api.get("inscripciones/club", { params }); 

// ✅ CORRECCIÓN para el Competidor: Ahora también recibe y envía params
export const obtenerInscripcionesCompetidor = (params) =>
  api.get("inscripciones/competidor", { params });