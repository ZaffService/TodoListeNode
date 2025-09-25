import { useState, useMemo } from 'react';
import { useAuth } from "../../contexte/useAuth";
import { useTodo } from "../../contexte/useTodo";
import { Check, User, Bell } from 'lucide-react';
import AddTaskForm from './AddTaskForm';

export default function Header() {
  const { logout, user } = useAuth();
  const { todos } = useTodo();
  const [showAddForm, setShowAddForm] = useState(false);

  const completedCount = useMemo(() => {
    return todos.filter(task => task.etat === 'Termine').length;
  }, [todos]);

  return (
    <>
      <header className="todo-header">
        <div className="todo-logo">
          <div className="todo-logo-icon">
            <Check className="w-6 h-6 text-white" />
          </div>
          <h1 className="todo-title">TodoList</h1>
        </div>

        <div className="todo-user-info">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">
              <User className="w-5 h-5" />
            </span>
            <span className="user-name">{user?.nom}</span>
            <div className="relative">
              <Bell className="w-6 h-6 text-gray-600" />
              {completedCount > 0 && (
                <span className="notification-badge">{completedCount}</span>
              )}
            </div>
          </div>
          <button
            onClick={logout}
            className="logout-button"
          >
            Déconnexion
          </button>
        </div>
      </header>

      {showAddForm && (
        <AddTaskForm onClose={() => setShowAddForm(false)} />
      )}
    </>
  )
}
