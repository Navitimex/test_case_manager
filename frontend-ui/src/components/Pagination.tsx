import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  rangeStart: number;
  rangeEnd: number;
  onPageChange: (page: number) => void;
}

/** Returns the page numbers (and '…' gaps) to render in the page picker. */
function getPageRange(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '…')[] = [1];

  if (current > 3) pages.push('…');

  const lo = Math.max(2, current - 1);
  const hi = Math.min(total - 1, current + 1);
  for (let i = lo; i <= hi; i++) pages.push(i);

  if (current < total - 2) pages.push('…');
  pages.push(total);

  return pages;
}

export default function Pagination({
  page,
  totalPages,
  totalItems,
  rangeStart,
  rangeEnd,
  onPageChange,
}: PaginationProps) {
  if (totalItems === 0 || totalPages <= 1) return null;

  const range = getPageRange(page, totalPages);

  return (
    <div className="flex items-center justify-between px-1 pt-4">
      <p className="text-xs text-[#6B778C]">
        Showing <span className="font-medium text-[#172B4D]">{rangeStart}–{rangeEnd}</span> of{' '}
        <span className="font-medium text-[#172B4D]">{totalItems}</span>
      </p>

      <div className="flex items-center gap-1">
        <NavButton
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          title="Previous page"
        >
          <ChevronLeft size={14} strokeWidth={2} />
        </NavButton>

        {range.map((entry, idx) =>
          entry === '…' ? (
            <span key={`gap-${idx}`} className="w-8 text-center text-xs text-[#6B778C] select-none">
              …
            </span>
          ) : (
            <button
              key={entry}
              onClick={() => onPageChange(entry)}
              className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                entry === page
                  ? 'bg-[#0C66E4] text-white'
                  : 'text-[#42526E] hover:bg-[#DFE1E6]'
              }`}
            >
              {entry}
            </button>
          )
        )}

        <NavButton
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          title="Next page"
        >
          <ChevronRight size={14} strokeWidth={2} />
        </NavButton>
      </div>
    </div>
  );
}

function NavButton({
  onClick,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="w-8 h-8 flex items-center justify-center rounded text-[#42526E] hover:bg-[#DFE1E6] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    >
      {children}
    </button>
  );
}
