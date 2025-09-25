import TaskItem from './TaskItem';
import { useTodo } from '../../contexte/useTodo';
import Pagination from './Pagination';

export default function TaskList() {
  const { todos, pagination, changePage } = useTodo();

  
  return (
    <div className="px-4 py-2">
      {!todos || todos.length === 0 ? (
        <div className="empty-state">
          <svg
            className="empty-state-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="empty-state-title">Aucune tâche</h3>
          <p className="empty-state-description">
            Commencez par créer une nouvelle tâche
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {todos.map(task => (
            <TaskItem key={task.id} task={task} />
          ))}
          
          {pagination && pagination.totalPages && pagination.totalPages > 1 && (
            <Pagination 
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={changePage}
            />
          )}
        </div>
      )}
    </div>
  );
}