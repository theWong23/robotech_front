import api from "./axiosConfig";

export const listarRobotsAdmin = async (filtros) => {
  const res = await api.get("/admin/robots", { params: filtros });
  return res.data;
};

export const listarClubesAdmin = async () => {
  const res = await api.get("/admin/clubes");
  return res.data;
};

