import api from "./axiosConfig";

export const obtenerMisTorneosCompetidor = () =>
  api.get("competidor/torneos/mis");
