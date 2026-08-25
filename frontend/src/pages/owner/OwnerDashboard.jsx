import useAuth from '../../hooks/useAuth';

/**
 * OwnerDashboard — Placeholder for STORE_OWNER role.
 * Full ratings view implementation in Phase 4.
 */
const OwnerDashboard = () => {
  const { user } = useAuth();

  return (
    <main className="dashboard-page">
      <div className="dashboard__header">
        <h1>My Store</h1>
        <p>Welcome, <strong>{user?.name}</strong>! View and manage your store&apos;s ratings.</p>
      </div>

      <div className="dashboard__stats-grid">
        <div className="stat-card stat-card--placeholder">
          <span className="stat-card__icon">⭐</span>
          <h3>Average Rating</h3>
          <p className="stat-card__value">—</p>
        </div>
        <div className="stat-card stat-card--placeholder">
          <span className="stat-card__icon">📊</span>
          <h3>Total Ratings</h3>
          <p className="stat-card__value">—</p>
        </div>
      </div>

      <div className="coming-soon">
        <p>🚧 Ratings breakdown coming in Phase 4.</p>
      </div>
    </main>
  );
};

export default OwnerDashboard;
