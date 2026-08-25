import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

/**
 * NotFound — 404 page shown for unmatched routes.
 */
const NotFound = () => {
  return (
    <main className="not-found-page">
      <div className="not-found__content">
        <h1 className="not-found__code">404</h1>
        <h2>Page not found</h2>
        <p>The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <Link to={ROUTES.HOME} className="btn btn--primary">
          Go home
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
