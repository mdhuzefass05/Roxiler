import useAuth from '../../hooks/useAuth';

/**
 * AdminDashboard — Placeholder for SYSTEM_ADMIN role.
 * Full implementation in Phase 2.
 */
const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <main className="dashboard-page">
      <div className="dashboard__header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, <strong>{user?.name}</strong></p>
      </div>

      <div className="dashboard__stats-grid">
        <div className="stat-card stat-card--placeholder">
          <span className="stat-card__icon">👥</span>
          <h3>Total Users</h3>
          <p className="stat-card__value">—</p>
        </div>
        <div className="stat-card stat-card--placeholder">
          <span className="stat-card__icon">🏪</span>
          <h3>Total Stores</h3>
          <p className="stat-card__value">—</p>
        </div>
        <div className="stat-card stat-card--placeholder">
          <span className="stat-card__icon">⭐</span>
          <h3>Total Ratings</h3>
          <p className="stat-card__value">—</p>
        </div>
      </div>

      <div className="coming-soon">
        <p>🚧 Full admin features coming in Phase 2.</p>
      </div>
    </main>
  );
};

export default AdminDashboard;
