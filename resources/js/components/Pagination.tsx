import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type PaginationProps<T> = {
  items: T[];
  itemsPerPage: number;
  children: (paginatedItems: T[]) => React.ReactNode;
};

function Pagination<T>({ items, itemsPerPage, children }: PaginationProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const displayPages = () => {
    const result: (number | string)[] = [1];
    if (totalPages <= 7) {
      return [...pages];
    }

    const lastPage = totalPages;
    let startPage = Math.max(2, currentPage - 2);
    let endPage = Math.min(totalPages - 1, startPage + 4);

    if (endPage - startPage < 4) {
      startPage = Math.max(2, endPage - 4);
    }

    if (startPage > 2) result.push('ellipsis-start');
    for (let i = startPage; i <= endPage; i++) result.push(i);
    if (endPage < totalPages - 1) result.push('ellipsis-end');
    if (totalPages > 1) result.push(lastPage);

    return result;
  };

  if (totalPages <= 1) {
    return <>{children(items)}</>;
  }

  return (
    <>
      {children(paginatedItems)}
      <div className="flex items-center justify-center py-6 space-x-1">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="inline-flex items-center justify-center w-9 h-9 rounded-md text-gray-500 dark:text-gray-400 
                   bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                   hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {displayPages().map((page, index) =>
          typeof page === 'number' ? (
            <button
              key={index}
              onClick={() => setCurrentPage(page)}
              className={`inline-flex items-center justify-center w-9 h-9 rounded-md font-medium
                        ${currentPage === page
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md border-transparent'
                  : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                } transition-colors transform hover:-translate-y-0.5 hover:shadow-md`}
              aria-label={`Ir a página ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          ) : (
            <span
              key={`ellipsis-${index}`}
              className="inline-flex items-center justify-center w-9 h-9 text-gray-500 dark:text-gray-400"
            >
              ...
            </span>
          )
        )}

        <button
          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="inline-flex items-center justify-center w-9 h-9 rounded-md text-gray-500 dark:text-gray-400 
                   bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                   hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Página siguiente"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </>
  );
}

export default Pagination;