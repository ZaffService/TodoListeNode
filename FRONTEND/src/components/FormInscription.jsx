import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ENDPOINTS } from '../config/api';
import { validateRegisterForm } from '../validations/authValidation';
import toast from 'react-hot-toast';
import AuthLayout from './layouts/AuthLayout';
import Input from './common/Input';

export default function FormInscription() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: '',
    login: '',
    password: '',
    passwordConfirm: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer les erreurs quand l'utilisateur commence à taper
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: []
      }));
    }
  };

  const validateAndSubmit = async () => {
    const validationErrors = validateRegisterForm(formData);
    setErrors(validationErrors);
    
    if (!validationErrors.hasError) {
      return true;
    }
    
    // Afficher un toast pour la première erreur trouvée
    const firstError = [
      ...validationErrors.nom || [],
      ...validationErrors.login || [],
      ...validationErrors.password || [],
      ...validationErrors.passwordConfirm || []
    ][0];
    
    if (firstError) {
      toast.error(firstError);
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!await validateAndSubmit()) {
      return;
    }

    setLoading(true);
    try {
      console.log('Tentative d\'inscription avec:', {
        nom: formData.nom,
        login: formData.login,
        password: formData.password
      });

      const response = await fetch(ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          nom: formData.nom,
          login: formData.login,
          password: formData.password
        })
      });

      const data = await response.json();
      console.log('Réponse du serveur:', data);

      if (response.ok) {
        toast.success('Inscription réussie ! Vous pouvez maintenant vous connecter.', {
          duration: 3000
        });
        navigate('/login');
      } else {
        toast.error(data.message || 'Erreur lors de l\'inscription');
        console.error('Erreur d\'inscription:', data);
      }
    } catch (error) {
      console.error('Erreur complète:', error);
      toast.error('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Créer un compte"
      subtitle="Rejoignez-nous pour gérer vos tâches"
    >
      <form onSubmit={handleSubmit} className="form-container">
        <Input
          label="Nom complet"
          type="text"
          name="nom"
          value={formData.nom}
          onChange={handleChange}
          placeholder="Nom complet"
          error={errors.nom?.length > 0}
          errorMessages={errors.nom || []}
        />

        <Input
          label="Login"
          type="text"
          name="login"
          value={formData.login}
          onChange={handleChange}
          placeholder="Login"
          error={errors.login?.length > 0}
          errorMessages={errors.login || []}
        />

        <Input
          label="Mot de passe"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Mot de passe"
          error={errors.password?.length > 0}
          errorMessages={errors.password || []}
        />

        <Input
          label="Confirmer le mot de passe"
          type="password"
          name="passwordConfirm"
          value={formData.passwordConfirm}
          onChange={handleChange}
          placeholder="Confirmer le mot de passe"
          error={errors.passwordConfirm?.length > 0}
          errorMessages={errors.passwordConfirm || []}
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
                Inscription...
              </>
            ) : (
              'S\'inscrire'
            )}
          </button>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="link-text"
          >
            Déjà inscrit ? Se connecter
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}