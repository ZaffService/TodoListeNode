import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTodo } from '../../contexte/useTodo';
import AddTaskForm from './AddTaskForm';
import FilterModal from './FilterModal';
import debounce from 'lodash/debounce';

export default function SearchBar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const { setSearch, getTodos } = useTodo();

  // Créer la fonction debounced avec useCallback pour éviter les recréations
  const debouncedSearch = useCallback(
    debounce((value) => {
      console.log('Recherche déclenchée:', value);
      setSearch(value);
      
      const newParams = new URLSearchParams(searchParams);
      if (value.trim()) {
        newParams.set('search', value);
      } else {
        newParams.delete('search');
      }
      newParams.set('page', '1'); // Reset to page 1 when searching
      
      setSearchParams(newParams);
      
      // Récupérer les tâches avec les nouveaux paramètres
      const currentPage = 1;
      const currentStatus = searchParams.get('status') || 'all';
      getTodos(currentPage, value, currentStatus);
    }, 300),
    [setSearch, setSearchParams, getTodos] // Dépendances stables
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Synchroniser searchTerm avec les paramètres URL uniquement au montage
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    if (searchTerm !== urlSearch) {
      setSearchTerm(urlSearch);
    }
  }, []); // Vide pour éviter les boucles

  // Nettoyer le debounce au démontage
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <>
      {showFilters && (
        <FilterModal
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
        />
      )}
      <div className="search-container">
        <div className="search-input-wrapper">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher une tâche..."
              className="search-input"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <div className="search-icon">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="search-actions">
          <button 
            onClick={() => setShowFilters(true)}
            className="filter-button"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtres
          </button>
          
          <button
            className="new-task-button"
            onClick={() => setShowAddForm(true)} 
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nouvelle tâche
          </button>
        </div>
      </div>

      {showAddForm && (
        <AddTaskForm onClose={() => setShowAddForm(false)} />
      )}
    </>
  );
}




























