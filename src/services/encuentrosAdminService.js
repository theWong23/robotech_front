import api from "./axiosConfig";

export const listarCategoriasEncuentros = async () => {
  const res = await api.get("/admin/encuentros/categorias");
  return res.data;
};

export const generarEncuentros = async (data) => {
  const res = await api.post("/admin/encuentros/generar", data);
  return res.data;
};
