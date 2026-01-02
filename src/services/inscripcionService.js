import api from "./axiosConfig";

const BASE_URL = "/api/club/inscripciones";

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


