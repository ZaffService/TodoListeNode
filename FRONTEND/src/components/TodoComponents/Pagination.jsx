import { useSearchParams } from 'react-router-dom';
import { useTodo } from '../../contexte/useTodo';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getTodos } = useTodo();

  if (!totalPages || totalPages <= 1 || !currentPage) {
    return null;
  }

  const handlePageChange = async (page) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    try {
      console.log('Changement de page vers:', page);
      
      // Mettre à jour les paramètres URL
      const newParams = new URLSearchParams(searchParams);
      newParams.set('page', page.toString());
      setSearchParams(newParams);
      
      // Récupérer les paramètres actuels
      const currentSearch = searchParams.get('search') || '';
      const currentStatus = searchParams.get('status') || 'all';
      
      // Appeler getTodos avec les nouveaux paramètres
      await getTodos(page, currentSearch, currentStatus);
      
      // Appeler la fonction de callback si fournie
      if (onPageChange) {
        onPageChange(page);
      }
      
    } catch (error) {
      console.error('Erreur lors du changement de page:', error);
    }
  };

  // Générer la liste des pages à afficher
  const getVisiblePages = () => {
    const pages = [];
    const delta = 2; // Nombre de pages à afficher de chaque côté de la page courante
    
    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="pagination-container">
      {/* Bouton Précédent */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className={`pagination-button ${currentPage <= 1 ? 'pagination-button-disabled' : ''}`}
      >
        Précédent
      </button>
      
      {/* Première page si pas visible */}
      {visiblePages[0] > 1 && (
        <>
          <button
            onClick={() => handlePageChange(1)}
            className="pagination-button"
          >
            1
          </button>
          {visiblePages[0] > 2 && <span className="pagination-ellipsis">...</span>}
        </>
      )}
      
      {/* Pages visibles */}
      {visiblePages.map(page => (
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`pagination-button ${
            page === currentPage ? 'pagination-button-active' : ''
          }`}
        >
          {page}
        </button>
      ))}
      
      {/* Dernière page si pas visible */}
      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className="pagination-ellipsis">...</span>
          )}
          <button
            onClick={() => handlePageChange(totalPages)}
            className="pagination-button"
          >
            {totalPages}
          </button>
        </>
      )}
      
      {/* Bouton Suivant */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={`pagination-button ${currentPage >= totalPages ? 'pagination-button-disabled' : ''}`}
      >
        Suivant
      </button>
      
      {/* Info de pagination */}
      <div className="pagination-info">
        Page {currentPage} sur {totalPages}
      </div>
    </div>
  );
}