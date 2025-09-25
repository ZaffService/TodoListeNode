import { createContext } from 'react';

export const TodoContext = createContext({
  todos: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 3,
    total: 0
  },
  search: '',
  filters: {
    status: 'all'
  },
  getTodos: () => {},
  addTodo: () => {},
  updateTodo: () => {},
  deleteTodo: () => {},
  getTaskHistory: () => {},
  setSearch: () => {},
  setFilters: () => {},
});