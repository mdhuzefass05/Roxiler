import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

/**
 * NotFound — 404 page shown for unmatched routes.
 */
const NotFound = () => {
  return (
    <main className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-header-orb" style={{ background: 'var(--gradient-secondary)' }}>
          🔍
        </div>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--color-accent-pink)' }}>
          404
        </h1>
        <h2>Page Not Found</h2>
        <p style={{ margin: '1rem 0 2rem', color: 'var(--color-muted)' }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link to={ROUTES.HOME} className="btn btn--primary" style={{ display: 'inline-flex' }}>
          Back to Home
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
