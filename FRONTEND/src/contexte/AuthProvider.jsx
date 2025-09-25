import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { ENDPOINTS } from '../config/api';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = async (login, password) => {
    try {
      setError(null);
      setLoading(true);
      const response = await fetch(ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ login, password })
      });
      
      const data = await response.json();
      
      if (response.ok && data.accessToken) {
        setToken(data.accessToken);
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        return true;
      } else {
        setError(data.message || 'Login ou Mot de passe incorrect');
        return false;
      }
    } catch (err) {
      setError(err?.message || 'Erreur de connexion au serveur');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setError(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ token, user, error, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}