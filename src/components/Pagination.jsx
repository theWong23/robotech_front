export default function Pagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const go = (p) => {
    if (p < 1 || p > totalPages) return;
    onPageChange(p);
  };

  const getPages = () => {
    const pages = new Set();
    pages.add(1);
    pages.add(totalPages);
    for (let p = page - 2; p <= page + 2; p++) {
      if (p > 1 && p < totalPages) pages.add(p);
    }
    return Array.from(pages).sort((a, b) => a - b);
  };

  const pages = getPages();
  const items = [];
  pages.forEach((p, i) => {
    const prev = pages[i - 1];
    if (prev && p - prev > 1) {
      items.push({ type: "gap", key: `gap-${prev}-${p}` });
    }
    items.push({ type: "page", key: `page-${p}`, p });
  });

  return (
    <nav className="d-flex justify-content-center mt-4" aria-label="Paginacion">
      <ul className="pagination mb-0">
        <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => go(page - 1)}>
            Anterior
          </button>
        </li>
        {items.map((item) =>
          item.type === "gap" ? (
            <li key={item.key} className="page-item disabled">
              <span className="page-link">...</span>
            </li>
          ) : (
            <li key={item.key} className={`page-item ${item.p === page ? "active" : ""}`}>
              <button className="page-link" onClick={() => go(item.p)}>
                {item.p}
              </button>
            </li>
          )
        )}
        <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => go(page + 1)}>
            Siguiente
          </button>
        </li>
      </ul>
    </nav>
  );
}
