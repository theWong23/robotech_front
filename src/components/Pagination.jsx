export default function Pagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const go = (p) => {
    if (p < 1 || p > totalPages) return;
    onPageChange(p);
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="d-flex justify-content-center mt-4" aria-label="Paginacion">
      <ul className="pagination mb-0">
        <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => go(page - 1)}>
            Anterior
          </button>
        </li>
        {pages.map((p) => (
          <li key={p} className={`page-item ${p === page ? "active" : ""}`}>
            <button className="page-link" onClick={() => go(p)}>
              {p}
            </button>
          </li>
        ))}
        <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => go(page + 1)}>
            Siguiente
          </button>
        </li>
      </ul>
    </nav>
  );
}
