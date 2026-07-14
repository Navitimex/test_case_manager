'use client';

import { useState, useEffect } from 'react';

export const ITEMS_PER_PAGE = 10;

/**
 * Client-side pagination over an array.
 * Pass a `resetKey` (e.g. selectedElementId) to jump back to page 1
 * whenever it changes.
 */
export function usePagination<T>(
  items: T[],
  resetKey?: unknown,
  itemsPerPage = ITEMS_PER_PAGE
) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));

  // Jump to page 1 when the dataset itself changes context (e.g. new element selected)
  useEffect(() => {
    setPage(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  // Clamp to last valid page when a filter shrinks the result set
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const start = (page - 1) * itemsPerPage;
  const paginated = items.slice(start, start + itemsPerPage);

  return {
    page,
    setPage,
    totalPages,
    paginated,
    totalItems: items.length,
    itemsPerPage,
    /** First 1-based index on current page */
    rangeStart: items.length === 0 ? 0 : start + 1,
    /** Last 1-based index on current page */
    rangeEnd: Math.min(start + itemsPerPage, items.length),
  };
}
