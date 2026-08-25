/**
 * Reusable Form Input Component
 */
const Input = ({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  error = '',
  helperText = '',
  disabled = false,
  autoComplete = 'off',
  ...props
}) => {
  return (
    <div className={`form-group ${error ? 'form-group--error' : ''}`}>
      {label && (
        <label htmlFor={id || name} className="form-label">
          {label} {required && <span className="form-required">*</span>}
        </label>
      )}
      <input
        id={id || name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        className={`form-input ${error ? 'form-input--error' : ''}`}
        {...props}
      />
      {error ? (
        <p className="form-error-text" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p className="form-helper-text">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Input;
