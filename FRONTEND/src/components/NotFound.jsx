import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="auth-container">
      <div className="auth-card text-center">
        <div className="mb-8">
          <div className="auth-icon-wrapper rounded-full">
            <span className="text-white text-3xl font-bold">404</span>
          </div>
        </div>

        <h1 className="auth-title text-2xl mb-3">
          Page non trouvée
        </h1>

        <p className="auth-subtitle mb-8 leading-relaxed">
          Oups ! La page que vous recherchez semble avoir disparu. 
          Elle a peut-être été déplacée ou n'existe plus.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleGoHome}
            className="submit-button flex items-center justify-center gap-2"
          >
            <Home size={18} />
            Retour à l'accueil
          </button>

          <button
            onClick={handleGoBack}
            className="modal-cancel w-full flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} />
            Page précédente
          </button>
        </div>

        <div className="mt-8 flex justify-center space-x-2">
          <div className="loading-dots loading-dot-1"></div>
          <div className="loading-dots loading-dot-2"></div>
          <div className="loading-dots loading-dot-3"></div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;