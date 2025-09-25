import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from './TodoComponents/Header';
import SearchBar from './TodoComponents/SearchBar';
import TaskList from './TodoComponents/TaskList';
import { useTodo } from '../contexte/useTodo';

export default function TodoList() {
  const [searchParams] = useSearchParams();
  const { setSearch, setFilters, getTodos } = useTodo();

  useEffect(() => {
    const page = searchParams.get('page') || '1';
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';

    console.log('TodoList useEffect - Params:', { page, search, status });

    // Éviter les re-renders inutiles en vérifiant les changements
    setSearch(search);
    setFilters({ status });
    
    // Appeler getTodos avec les paramètres corrects
    getTodos(parseInt(page), search, status);
  }, [searchParams.toString()]); // Utiliser searchParams.toString() pour éviter les re-renders

  return (
    <div className="todo-container">
      <Header />
      <main className="container mx-auto max-w-5xl p-4">
        <SearchBar />
        <TaskList />
      </main>
    </div>
  );
}