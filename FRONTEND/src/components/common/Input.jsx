import PropTypes from 'prop-types';

export default function Input({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error = false,
  errorMessages = [],
  className = '',
  required = false
}) {
  return (
    <div className="input-wrapper">
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`base-input ${
          error ? 'input-error' : ''
        } ${className}`}
      />
      {error && errorMessages && errorMessages.length > 0 && (
        <div>
          {errorMessages.map((message, index) => (
            <p key={index} className="input-error-message">
              {message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.bool,
  errorMessages: PropTypes.arrayOf(PropTypes.string),
  className: PropTypes.string,
  required: PropTypes.bool
};