import api from "./axiosConfig";

// ⚠️ Usamos rutas relativas (sin el / inicial) para evitar duplicados con baseURL
const BASE_URL = "club/inscripciones"; 

// ===============================
// INSCRIPCIÓN INDIVIDUAL (CLUB)
// ===============================
export const inscribirIndividual = async (data) => {
  const res = await api.post(`${BASE_URL}/individual`, data);
  return res.data;
};

// ===============================
// INSCRIPCIÓN POR EQUIPOS (CLUB)
// ===============================
export const inscribirEquipo = async (data) => {
  const res = await api.post(`${BASE_URL}/equipo`, data);
  return res.data;
};

// ==========================================
// 🔍 CONSULTAS (Aquí es donde estaba el error)
// ==========================================

export const obtenerInscripcionesClub = async () => {
  // ✅ Antes tenías "/api/inscripciones/club" -> CAMBIAR A:
  const res = await api.get("inscripciones/club");
  return res.data;
};

export const obtenerInscripcionesCompetidor = async () => {
  // ✅ Antes tenías "/api/inscripciones/competidor" -> CAMBIAR A:
  const res = await api.get("inscripciones/competidor");
  return res.data;
};