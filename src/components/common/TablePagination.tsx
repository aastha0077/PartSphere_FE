import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface TablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  /** Plural noun for the summary line, e.g. "orders", "rows" */
  itemLabel?: string;
  className?: string;
}

const TablePagination: React.FC<TablePaginationProps> = ({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 25, 50],
  itemLabel = 'rows',
  className = '',
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, total);

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 bg-white/[0.02] border-t border-white/5 text-sm ${className}`}
    >
      <p className="text-gray-500">
        {total === 0 ? (
          <>No {itemLabel}</>
        ) : (
          <>
            Showing <span className="text-white font-medium">{from}</span>
            {'–'}
            <span className="text-white font-medium">{to}</span> of{' '}
            <span className="text-white font-medium">{total}</span> {itemLabel}
          </>
        )}
      </p>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {onPageSizeChange && (
          <label className="flex items-center gap-2 text-gray-500">
            <span className="text-gray-500 whitespace-nowrap">Per page</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="bg-[#0d0d12] border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs outline-none focus:border-indigo-500"
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous page"
            disabled={safePage <= 1}
            onClick={() => onPageChange(safePage - 1)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-25 disabled:pointer-events-none rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="min-w-[5.5rem] text-center px-2 py-1 text-white font-medium bg-white/5 rounded-lg text-xs">
            {safePage} / {totalPages}
          </span>
          <button
            type="button"
            aria-label="Next page"
            disabled={safePage >= totalPages}
            onClick={() => onPageChange(safePage + 1)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-25 disabled:pointer-events-none rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TablePagination;
