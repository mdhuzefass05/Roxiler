import { useState, useEffect, useCallback } from 'react';
import useAuth from '../../hooks/useAuth';
import { getAdminStatsApi } from '../../api/admin.api';
import Button from '../../components/common/Button';
import ChangePasswordModal from '../../components/common/ChangePasswordModal';

/**
 * System Administrator Dashboard
 * Displays platform statistics: Total Users, Total Stores, and Total Ratings.
 */
const AdminDashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

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
        <div className="dashboard__actions" style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPasswordModalOpen(true)}
          >
            🔒 Change Password
          </Button>
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

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </main>
  );
};

export default AdminDashboard;
