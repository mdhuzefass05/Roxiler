import useTheme from '../../hooks/useTheme';

const ThemeToggle = ({ size = 'md' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      className={`theme-toggle theme-toggle--${size}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'Day Candy ☀️' : 'Cyber Dark 🌙'} theme`}
    >
      <div className={`theme-toggle__track ${isDark ? 'theme-toggle__track--dark' : ''}`}>
        <div className={`theme-toggle__thumb ${isDark ? 'theme-toggle__thumb--dark' : ''}`}>
          <span>{isDark ? '🌙' : '☀️'}</span>
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;
