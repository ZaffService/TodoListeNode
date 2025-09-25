import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTodo } from '../../contexte/useTodo';
import { X } from 'lucide-react';

export default function FilterModal({ isOpen, onClose }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filters, setFilters, getTodos } = useTodo();
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters);
    }
  }, [filters, isOpen]);

  if (!isOpen) return null;

  const handleStatusChange = async (status) => {
    console.log('Changement de filtre vers:', status);
    
    try {
      // Mettre à jour les filtres dans le contexte
      const newFilters = { ...filters, status };
      setFilters(newFilters);
      setLocalFilters(newFilters);
      
      // Mettre à jour les paramètres URL
      const newParams = new URLSearchParams(searchParams);
      if (status !== 'all') {
        newParams.set('status', status);
      } else {
        newParams.delete('status');
      }
      newParams.set('page', '1'); // Reset to page 1 when filtering
      setSearchParams(newParams);
      
      // Récupérer les tâches avec les nouveaux filtres
      const currentPage = 1;
      const currentSearch = searchParams.get('search') || '';
      await getTodos(currentPage, currentSearch, status);
      
      console.log('Nouveaux filtres appliqués:', newFilters);
      
      // Fermer le modal après application du filtre
      setTimeout(() => {
        onClose();
      }, 100);
      
    } catch (error) {
      console.error('Erreur lors de l\'application du filtre:', error);
    }
  };

  const getButtonClass = (status) =>
    `w-full px-4 py-3 rounded-md transition-colors text-left ${
      localFilters.status === status 
        ? 'bg-indigo-600 text-white shadow-sm' 
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`;

  const getStatusLabel = (status) => {
    switch(status) {
      case 'all': return 'Toutes les tâches';
      case 'En_Cours': return 'En cours';
      case 'Termine': return 'Terminées';
      default: return status;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Filtrer les tâches</h3>
          <button 
            onClick={onClose}
            className="modal-close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-4">Statut des tâches :</p>
          
          <button 
            className={getButtonClass('all')} 
            onClick={() => handleStatusChange('all')}
          >
            <div className="flex items-center justify-between w-full">
              <span>{getStatusLabel('all')}</span>
              {localFilters.status === 'all' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </button>

          <button 
            className={getButtonClass('En_Cours')} 
            onClick={() => handleStatusChange('En_Cours')}
          >
            <div className="flex items-center justify-between w-full">
              <span>{getStatusLabel('En_Cours')}</span>
              {localFilters.status === 'En_Cours' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </button>

          <button 
            className={getButtonClass('Termine')} 
            onClick={() => handleStatusChange('Termine')}
          >
            <div className="flex items-center justify-between w-full">
              <span>{getStatusLabel('Termine')}</span>
              {localFilters.status === 'Termine' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </button>
        </div>

        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Filtre actuel : <span className="font-medium text-indigo-600">{getStatusLabel(localFilters.status)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}