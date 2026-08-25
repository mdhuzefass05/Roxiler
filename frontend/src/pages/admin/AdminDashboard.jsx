import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { getAdminStatsApi } from '../../api/admin.api';
import Button from '../../components/common/Button';
import { ROUTES } from '../../utils/constants';

/**
 * System Administrator Dashboard
 * Displays platform statistics: Total Users, Total Stores, and Total Ratings.
 */
const AdminDashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminStatsApi();
      if (res?.data) {
        setStats(res.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load platform statistics. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <main className="dashboard-page">
      {/* Header */}
      <div className="dashboard__header-wrapper">
        <div className="dashboard__header">
          <div className="dashboard__role-tag">SYSTEM ADMINISTRATOR</div>
          <h1>Platform Overview</h1>
          <p>
            Welcome, <strong>{user?.name}</strong>. Here is the real-time activity and platform summary.
          </p>
        </div>
        <div className="dashboard__actions">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            loading={loading}
          >
            ↻ Refresh Metrics
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert--error" role="alert">
          <span>{error}</span>
          <Button variant="danger" size="sm" onClick={fetchStats}>
            Retry
          </Button>
        </div>
      )}

      {/* Loading Skeleton / Stats Grid */}
      <div className="dashboard__stats-grid">
        {/* Total Users */}
        <div className="stat-card stat-card--users">
          <div className="stat-card__top">
            <span className="stat-card__icon" aria-hidden="true">👥</span>
            <span className="stat-card__tag">Registered</span>
          </div>
          <h3>Total Users</h3>
          <p className="stat-card__value">
            {loading ? <span className="skeleton-text" /> : (stats?.total_users ?? 0)}
          </p>
          <div className="stat-card__breakdown">
            <span title="Normal Users">👤 {stats?.total_normal_users ?? 0} Users</span>
            <span title="Store Owners">🏪 {stats?.total_store_owners ?? 0} Owners</span>
            <span title="System Admins">🛡️ {stats?.total_admin_users ?? 0} Admins</span>
          </div>
        </div>

        {/* Total Stores */}
        <div className="stat-card stat-card--stores">
          <div className="stat-card__top">
            <span className="stat-card__icon" aria-hidden="true">🏪</span>
            <span className="stat-card__tag">Active</span>
          </div>
          <h3>Total Stores</h3>
          <p className="stat-card__value">
            {loading ? <span className="skeleton-text" /> : (stats?.total_stores ?? 0)}
          </p>
          <div className="stat-card__footer-link">
            <span>Verified businesses</span>
          </div>
        </div>

        {/* Total Ratings */}
        <div className="stat-card stat-card--ratings">
          <div className="stat-card__top">
            <span className="stat-card__icon" aria-hidden="true">⭐</span>
            <span className="stat-card__tag">Feedback</span>
          </div>
          <h3>Total Ratings Submitted</h3>
          <p className="stat-card__value">
            {loading ? <span className="skeleton-text" /> : (stats?.total_ratings ?? 0)}
          </p>
          <div className="stat-card__footer-link">
            <span>Verified user reviews</span>
          </div>
        </div>
      </div>

      {/* Admin Quick Action Navigation Hub */}
      <section className="admin-quick-hub">
        <div className="section-header">
          <h2>Administrative Management</h2>
          <p>Quick access to platform management tools</p>
        </div>

        <div className="admin-quick-grid">
          <div className="quick-action-card">
            <div className="quick-action-card__icon">👤</div>
            <h3>User Management</h3>
            <p>View all users, filter by role or name, inspect user details, and add new users.</p>
            <Link to={ROUTES.ADMIN_USERS} className="btn btn--outline btn--sm">
              Manage Users →
            </Link>
          </div>

          <div className="quick-action-card">
            <div className="quick-action-card__icon">🏬</div>
            <h3>Store Management</h3>
            <p>Create stores, assign store owners, view ratings, and sort stores by rating.</p>
            <Link to={ROUTES.ADMIN_STORES} className="btn btn--outline btn--sm">
              Manage Stores →
            </Link>
          </div>

          <div className="quick-action-card">
            <div className="quick-action-card__icon">⭐</div>
            <h3>Live Store Browser</h3>
            <p>Explore the store catalog and check how stores appear to normal customers.</p>
            <Link to={ROUTES.STORES} className="btn btn--outline btn--sm">
              Browse Stores →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AdminDashboard;
