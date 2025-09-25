import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexte/useAuth';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
