import { RouterProvider, createBrowserRouter } from "react-router-dom"
import { Toaster } from 'react-hot-toast'
import "./App.css"
import FormConnexion from "./components/FormConnexion"
import FormInscription from "./components/FormInscription"
import { AuthProvider } from "./contexte/AuthProvider"
import TodoList from "./components/TodoList"
import NotFound from "./components/NotFound"
import ProtectedRoute from "./components/ProtectedRoute"
import AddTaskForm from "./components/TodoComponents/AddTaskForm"
import { TodoProvider } from "./contexte/TodoProvider"

const router = createBrowserRouter([
  {
    path: "/",
    element: <FormConnexion />,
  },
  {
    path: "/login",
    element: <FormConnexion />
  },
  {
    path: "/register",
    element: <FormInscription />
  },
  {
    path: "/todolist",
    element: (
      <ProtectedRoute>
        <TodoList />
      </ProtectedRoute>
    )
  },
  {
    path: "*",
    element: <NotFound />
  }
])

function App() {
  return (
    <AuthProvider>
      <TodoProvider>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          toastOptions={{
            success: {
              duration: 3000,
              style: {
                background: '#22c55e',
                color: 'white',
              },
            },
            error: {
              duration: 3000,
              style: {
                background: '#ef4444',
                color: 'white',
              },
            },
          }}
        />
      </TodoProvider>
    </AuthProvider>
  )
}

export default App
