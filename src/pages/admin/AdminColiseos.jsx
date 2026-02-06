import { useEffect, useState } from "react";
import { API_ORIGIN } from "../../services/config";
import Swal from "sweetalert2";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaMapMarkerAlt, FaImage, FaLandmark } from "react-icons/fa";
import api from "../../services/axiosConfig"; // Asegúrate de que apunte a tu config

export default function AdminColiseos() {
  // =========================
  // ESTADOS
  // =========================
  const [coliseos, setColiseos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalColiseos, setTotalColiseos] = useState(0);

  // Modal & Form
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [form, setForm] = useState({ nombre: "", ubicacion: "" });
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);

  // =========================
  // CARGAR DATOS
  // =========================
  const cargar = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/coliseos", {
        params: {
          page: page - 1,
          size: 20,
          q: busqueda?.trim() || undefined
        }
      });
      setColiseos(res.data?.content || []);
      setTotalPages(res.data?.totalPages ?? 1);
      setTotalColiseos(res.data?.totalElements ?? 0);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo conectar con el servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [page, busqueda]);

  useEffect(() => {
    setPage(1);
  }, [busqueda]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages || 1);
  }, [page, totalPages]);

  // =========================
  // MANEJO DEL MODAL
  // =========================
  const abrirCrear = () => {
    setForm({ nombre: "", ubicacion: "" });
    setImagenFile(null);
    setImagenPreview(null);
    setEditingId(null);
    setModal(true);
  };

  const abrirEditar = (c) => {
    setForm({ nombre: c.nombre, ubicacion: c.ubicacion });
    setEditingId(c.idColiseo);
    setImagenFile(null);
    // Mostrar imagen existente si la hay
    setImagenPreview(c.imagenUrl ? `${API_ORIGIN}${c.imagenUrl}` : null); 
    setModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenFile(file);
      setImagenPreview(URL.createObjectURL(file));
    }
  };

  // =========================
  // GUARDAR (LÓGICA DELEGADA AL BACKEND)
  // =========================
  const guardar = async () => {
    // 1. Validación mínima (campos obligatorios)
    if (!form.nombre.trim() || !form.ubicacion.trim()) {
      return Swal.fire("Atención", "Nombre y ubicación son obligatorios", "warning");
    }

    try {
      Swal.fire({ title: 'Guardando...', didOpen: () => Swal.showLoading() });

      let idColiseo = editingId;
      
      // 2. Guardar Datos de Texto
      if (!editingId) {
        const res = await api.post("/admin/coliseos", form);
        idColiseo = res.data.idColiseo;
      } else {
        await api.put(`/admin/coliseos/${editingId}`, form);
      }

      // 3. Subir Imagen (si se seleccionó una nueva)
      if (imagenFile && idColiseo) {
        const formData = new FormData();
        formData.append("file", imagenFile);
        await api.post(`/admin/coliseos/${idColiseo}/imagen`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      Swal.fire({ icon: 'success', title: 'Éxito', text: 'Coliseo guardado correctamente', timer: 1500 });
      setModal(false);
      cargar();

    } catch (err) {
      console.error(err);
      // 4. Mostrar error específico del backend
      const msg = err.response?.data?.mensaje || "No se pudo guardar los cambios";
      Swal.fire("Error", msg, "error");
    }
  };

  // =========================
  // ELIMINAR
  // =========================
  const eliminar = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar coliseo?",
      text: "El backend verificará si tiene eventos asociados antes de eliminar.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar"
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/admin/coliseos/${id}`);
        Swal.fire("Eliminado", "El coliseo ha sido eliminado.", "success");
        cargar();
      } catch (err) {
        const msg = err.response?.data?.mensaje || "No se pudo eliminar el coliseo";
        Swal.fire("Error", msg, "error");
      }
    }
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div className="container-fluid px-4 mt-4">
      
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-0"><FaLandmark className="me-2"/>Gestión de Coliseos</h2>
          <p className="text-muted mb-0">Administra las sedes de los eventos.</p>
        </div>
        <button className="btn btn-primary shadow-sm" onClick={abrirCrear}>
          <FaPlus className="me-2" /> Nuevo Coliseo
        </button>
      </div>

      {/* BUSCADOR */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="input-group">
            <span className="input-group-text bg-light border-0"><FaSearch className="text-muted"/></span>
            <input 
              type="text" 
              className="form-control border-0 bg-light" 
              placeholder="Buscar por nombre o ubicación..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* TABLA */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4">Imagen</th>
                  <th>Coliseo</th>
                  <th>Ubicación</th>
                  <th className="text-end pe-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="text-center py-5"><div className="spinner-border text-primary"/></td></tr>
                ) : coliseos.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-5">
                      <div className="text-muted opacity-50 mb-2"><FaLandmark size={40}/></div>
                      <h6 className="text-muted">No se encontraron coliseos</h6>
                      <small className="text-muted">Intenta con otro término de búsqueda.</small>
                    </td>
                  </tr>
                ) : (
                  coliseos.map(c => (
                    <tr key={c.idColiseo}>
                      <td className="ps-4" style={{width: "100px"}}>
                        <div style={{width: "60px", height: "60px", overflow: "hidden", borderRadius: "8px"}} className="bg-light border d-flex align-items-center justify-content-center">
                          {c.imagenUrl ? (
                            <img 
                              src={`${API_ORIGIN}${c.imagenUrl}`} 
                              alt="Coliseo" 
                              style={{width: "100%", height: "100%", objectFit: "cover"}}
                              onError={(e) => { e.target.onerror = null; e.target.src = ""; }} // Fallback si falla la carga
                            />
                          ) : (
                            <FaImage className="text-muted" size={20}/>
                          )}
                        </div>
                      </td>
                      <td className="fw-bold text-primary">{c.nombre}</td>
                      <td>
                         <span className="text-muted d-flex align-items-center">
                           <FaMapMarkerAlt className="me-2 text-danger"/>{c.ubicacion}
                         </span>
                      </td>
                      <td className="text-end pe-4">
                        <button className="btn btn-outline-primary btn-sm me-2" onClick={() => abrirEditar(c)} title="Editar">
                          <FaEdit />
                        </button>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => eliminar(c.idColiseo)} title="Eliminar">
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer bg-white border-top-0 py-3">
          <small className="text-muted">Mostrando {coliseos.length} de {totalColiseos} resultados</small>
        </div>
      </div>

      {!loading && totalColiseos > 0 && (
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3 gap-2">
          <div className="text-muted small">
            Página {page} de {totalPages}
          </div>
          <div className="btn-group">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage(1)} disabled={page <= 1}>Primero</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Anterior</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Siguiente</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage(totalPages)} disabled={page >= totalPages}>Último</button>
          </div>
        </div>
      )}

      {/* MODAL */}
      {modal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title fw-bold">
                    {editingId ? <><FaEdit className="me-2"/>Editar Coliseo</> : <><FaPlus className="me-2"/>Crear Coliseo</>}
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setModal(false)}></button>
                </div>
                
                <div className="modal-body p-4">
                  
                  {/* PREVIEW DE IMAGEN */}
                  <div className="text-center mb-4">
                      <div 
                        className="mx-auto border bg-light d-flex align-items-center justify-content-center"
                        style={{width: "100%", height: "180px", borderRadius: "10px", overflow: "hidden", position: "relative"}}
                      >
                        {imagenPreview ? (
                          <img src={imagenPreview} alt="Preview" style={{width: "100%", height: "100%", objectFit: "cover"}} />
                        ) : (
                          <div className="text-muted text-center">
                             <FaImage size={40} className="mb-2 d-block mx-auto"/>
                             <small>Sin imagen seleccionada</small>
                          </div>
                        )}
                      </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold small text-muted">NOMBRE DEL COLISEO</label>
                    <input 
                      className="form-control" 
                      value={form.nombre} 
                      onChange={e => setForm({ ...form, nombre: e.target.value })}
                      placeholder="Ej: Coliseo Gran Chimú"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold small text-muted">UBICACIÓN</label>
                    <div className="input-group">
                        <span className="input-group-text bg-light"><FaMapMarkerAlt/></span>
                        <input 
                          className="form-control" 
                          value={form.ubicacion} 
                          onChange={e => setForm({ ...form, ubicacion: e.target.value })}
                          placeholder="Ej: Av. Mansiche 123"
                        />
                    </div>
                  </div>

                  <div className="mb-3">
                      <label className="form-label fw-bold small text-muted">IMAGEN (Opcional)</label>
                      <input 
                        type="file" 
                        className="form-control" 
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <small className="text-muted" style={{fontSize: "0.8rem"}}>Formatos: JPG, PNG, WEBP</small>
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
                  <button className="btn btn-primary px-4" onClick={guardar}>
                    {editingId ? "Actualizar Datos" : "Guardar Coliseo"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}