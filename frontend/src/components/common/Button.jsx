/**
 * Reusable Button Component
 */
const Button = ({
  children,
  type = 'button',
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger'
  size = 'md',        // 'sm' | 'md' | 'lg'
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  className = '',
  ...props
}) => {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth ? 'btn--full' : '',
    loading ? 'btn--loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="btn__spinner-wrapper">
          <span className="spinner spinner--sm" aria-hidden="true" />
          <span>Loading…</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
