import { CheckCircle } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-wrapper">
            <CheckCircle className="auth-icon" />
          </div>
          <h1 className="auth-title">{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
        </div>
        <div className="form-container">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;