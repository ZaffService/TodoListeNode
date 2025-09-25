import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexte/useAuth';
import { validateAuthForm } from '../validations/authValidation';
import AuthLayout from './layouts/AuthLayout';
import Input from './common/Input';

export default function FormConnexion() {
  const [formData, setFormData] = useState({
    login: '',
    password: ''
  });
  const [validationErrors, setValidationErrors] = useState({
    login: [],
    password: [],
    hasError: false
  });
  
  const { login: connexion, error, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('Changement détecté:', { name, value }); // Debug
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer les erreurs pour ce champ
    setValidationErrors(prev => ({ 
      ...prev, 
      [name]: [], 
      hasError: false 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationResult = validateAuthForm(formData);
    setValidationErrors(validationResult);

    if (!validationResult.hasError) {
      try {
        const success = await connexion(formData.login, formData.password);
        if (success) {
          navigate('/todolist');
        }
      } catch (err) {
        console.error('Erreur lors de la connexion:', err);
      }
    }
  };

  return (
    <AuthLayout 
      title="TodoList en React js"
      subtitle="Connectez-vous pour gérer vos tâches"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {(error || validationErrors.hasError) && (
          <div className="error-container">
            <div>
                {error && (
                  <p className="error-text">{error}</p>
                )}
                {validationErrors.hasError && (
                  <>
                    {validationErrors.login.map((err, index) => (
                      <p key={`login-${index}`} className="input-error-message">{err}</p>
                    ))}
                    {validationErrors.password.map((err, index) => (
                      <p key={`password-${index}`} className="input-error-message">{err}</p>
                    ))}
                  </>
                )}
            </div>
          </div>
        )}

        <Input
          label="Login"
          type="text"
          name="login"
          value={formData.login}
          onChange={handleChange}
          error={validationErrors.login.length > 0}
          errorMessages={validationErrors.login}
          placeholder="Entrez votre login"
        />

        <Input
          label="Mot de passe"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={validationErrors.password.length > 0}
          errorMessages={validationErrors.password}
          placeholder="Entrez votre mot de passe"
        />

        <div>
          <button
            type="submit"
            disabled={loading}
            className={`submit-button ${loading ? 'submit-button-disabled' : ''}`}
          >
            {loading ? (
              <>
                <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connexion...
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </div>

        <div className="text-center">
          <Link 
            to="/register" 
            className="link-text"
          >
            Pas encore de compte ? S'inscrire
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}