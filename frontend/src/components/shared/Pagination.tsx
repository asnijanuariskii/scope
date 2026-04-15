interface Props { currentPage: number; totalPages: number; onPageChange: (p: number) => void; }

function pages(cur: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const p: (number | '...')[] = [1];
  if (cur > 3) p.push('...');
  for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) p.push(i);
  if (cur < total - 2) p.push('...');
  p.push(total);
  return p;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;
  return (
    <nav className="flex items-center gap-0.5" aria-label="Pagination">
      <button disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}
        className="w-8 h-8 flex items-center justify-center rounded-sm text-body-md text-N-400 hover:bg-N-30 disabled:text-N-50 disabled:cursor-not-allowed transition-colors">
        ‹
      </button>
      {pages(currentPage, totalPages).map((p, i) =>
        p === '...' ? <span key={`e${i}`} className="px-1 text-N-200">…</span> : (
          <button key={p} onClick={() => onPageChange(p)} aria-current={p === currentPage ? 'page' : undefined}
            className={`w-8 h-8 flex items-center justify-center rounded-sm text-body-md transition-colors ${
              p === currentPage
                ? 'bg-brand text-white font-medium'
                : 'text-N-400 hover:bg-N-30'
            }`}>{p}</button>
        )
      )}
      <button disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}
        className="w-8 h-8 flex items-center justify-center rounded-sm text-body-md text-N-400 hover:bg-N-30 disabled:text-N-50 disabled:cursor-not-allowed transition-colors">
        ›
      </button>
    </nav>
  );
}
