interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav aria-label="Navigasi halaman" className="tds-pagination">
      <button className="tds-pagination__btn" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} aria-label="Halaman sebelumnya">‹</button>
      {pages.map((page, idx) =>
        page === '...' ? (
          <span key={`e-${idx}`} className="tds-pagination__ellipsis">…</span>
        ) : (
          <button
            key={page}
            className={`tds-pagination__btn ${page === currentPage ? 'tds-pagination__btn--active' : ''}`}
            onClick={() => onPageChange(page)}
            aria-label={`Halaman ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >{page}</button>
        )
      )}
      <button className="tds-pagination__btn" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Halaman berikutnya">›</button>
    </nav>
  );
}
