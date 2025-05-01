import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange
}: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  // Mostrar 5 páginas a la vez con elipsis para páginas adicionales
  const displayPages = () => {
    if (totalPages <= 7) return pages;
    
    // Siempre mostrar la primera y última página
    const firstPage = 1;
    const lastPage = totalPages;
    
    // Determinar las páginas a mostrar alrededor de la página actual
    let startPage = Math.max(2, currentPage - 2);
    let endPage = Math.min(totalPages - 1, startPage + 4);
    
    // Ajustar startPage si endPage está demasiado cerca del final
    if (endPage - startPage < 4) {
      startPage = Math.max(2, endPage - 4);
    }
    
    // Construir el array de páginas con elipsis
    const result = [];
    result.push(firstPage);
    
    // Elipsis al inicio si es necesario
    if (startPage > 2) {
      result.push('ellipsis-start');
    }
    
    // Páginas intermedias
    for (let i = startPage; i <= endPage; i++) {
      result.push(i);
    }
    
    // Elipsis al final si es necesario
    if (endPage < totalPages - 1) {
      result.push('ellipsis-end');
    }
    
    // Última página
    if (totalPages > 1) {
      result.push(lastPage);
    }
    
    return result;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center py-6 space-x-1">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="inline-flex items-center justify-center w-9 h-9 rounded-md text-gray-500 dark:text-gray-400 
                 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      
      {displayPages().map((page, index) => (
        page === 'ellipsis-start' || page === 'ellipsis-end' ? (
          <span 
            key={`ellipsis-${index}`} 
            className="inline-flex items-center justify-center w-9 h-9 text-gray-500 dark:text-gray-400"
          >
            ...
          </span>
        ) : (
          <button
            key={index}
            onClick={() => onPageChange(Number(page))}
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
        )
      ))}
      
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="inline-flex items-center justify-center w-9 h-9 rounded-md text-gray-500 dark:text-gray-400 
                 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Página siguiente"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}