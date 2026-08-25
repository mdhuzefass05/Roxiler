import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import { getAdminStatsApi } from '../../api/admin.api';
import { getUsersApi } from '../../api/users.api';
import { getStoresApi } from '../../api/stores.api';
import Button from '../../components/common/Button';
import StarRating from '../../components/common/StarRating';
import ChangePasswordModal from '../../components/common/ChangePasswordModal';
import EditProfileModal from '../../components/common/EditProfileModal';
import { exportUsersCsv, exportStoresCsv } from '../../utils/export';
import { ROUTES } from '../../utils/constants';

/**
 * System Administrator Dashboard
 * Displays platform KPIs, Top Rated Stores, Recent Activity Feed, and CSV Data Export Hub.
 */
const AdminDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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

  const handleExportUsers = async () => {
    setExportLoading(true);
    try {
      const res = await getUsersApi({ limit: 1000 });
      const users = res?.data?.users || res?.data || [];
      if (users.length === 0) {
        toast.info('No users available to export.');
        return;
      }
      exportUsersCsv(users);
      toast.success(`Exported ${users.length} users to CSV!`);
    } catch {
      toast.error('Failed to export users list.');
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportStores = async () => {
    setExportLoading(true);
    try {
      const res = await getStoresApi({ limit: 1000 });
      const stores = res?.data?.stores || res?.data || [];
      if (stores.length === 0) {
        toast.info('No stores available to export.');
        return;
      }
      exportStoresCsv(stores);
      toast.success(`Exported ${stores.length} stores to CSV!`);
    } catch {
      toast.error('Failed to export stores directory.');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <main className="dashboard-page">
      {/* Header */}
      <div className="dashboard__header-wrapper">
        <div className="dashboard__header">
          <div className="dashboard__role-tag">SYSTEM ADMINISTRATOR</div>
          <h1>Platform Intelligence</h1>
          <p>
            Welcome, <strong>{user?.name}</strong>. Real-time platform metrics, leaderboards, and administrative tools.
          </p>
        </div>
        <div className="dashboard__actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsProfileModalOpen(true)}
          >
            👤 Edit Profile
          </Button>
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

      {/* ── KPI Metric Cards Grid ────────────────────────────────────────── */}
      <div className="dashboard__stats-grid">
        {/* Total Users */}
        <div className="stat-card stat-card--users">
          <div className="stat-card__top">
            <span className="stat-card__icon" aria-hidden="true">👥</span>
            <span className="stat-card__tag">Platform Users</span>
          </div>
          <h3>Total Users</h3>
          <p className="stat-card__value">
            {loading ? <span className="spinner spinner--sm" /> : (stats?.total_users ?? 0)}
          </p>
          <div className="stat-card__breakdown">
            <span>👤 {stats?.total_normal_users ?? 0} Customers</span>
            <span>🏪 {stats?.total_store_owners ?? 0} Store Owners</span>
            <span>🛡️ {stats?.total_admin_users ?? 0} Admins</span>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <Link to={ROUTES.ADMIN_USERS} className="btn btn--outline btn--sm" style={{ width: '100%' }}>
              Manage Users →
            </Link>
          </div>
        </div>

        {/* Total Stores */}
        <div className="stat-card stat-card--stores">
          <div className="stat-card__top">
            <span className="stat-card__icon" aria-hidden="true">🏪</span>
            <span className="stat-card__tag">Active Directory</span>
          </div>
          <h3>Total Stores</h3>
          <p className="stat-card__value">
            {loading ? <span className="spinner spinner--sm" /> : (stats?.total_stores ?? 0)}
          </p>
          <div className="stat-card__footer-link">
            <span>Verified businesses receiving reviews</span>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <Link to={ROUTES.ADMIN_STORES} className="btn btn--outline btn--sm" style={{ width: '100%' }}>
              Manage Stores →
            </Link>
          </div>
        </div>

        {/* Total Ratings */}
        <div className="stat-card stat-card--ratings">
          <div className="stat-card__top">
            <span className="stat-card__icon" aria-hidden="true">⭐</span>
            <span className="stat-card__tag">Customer Feedback</span>
          </div>
          <h3>Total Ratings Submitted</h3>
          <p className="stat-card__value">
            {loading ? <span className="spinner spinner--sm" /> : (stats?.total_ratings ?? 0)}
          </p>
          <div className="stat-card__footer-link">
            <span>Authentic user reviews</span>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              style={{ flex: 1 }}
              onClick={handleExportStores}
              disabled={exportLoading}
            >
              📥 Export Stores
            </button>
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              style={{ flex: 1 }}
              onClick={handleExportUsers}
              disabled={exportLoading}
            >
              📥 Export Users
            </button>
          </div>
        </div>
      </div>

      {/* ── Top Rated Stores Leaderboard & Recent Activity Feed ───────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem', marginBottom: '2.5rem' }}>
        {/* Top Rated Stores */}
        <section className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900 }}>🏆 Top Rated Stores</h2>
            <span className="badge badge--admin">Leaderboard</span>
          </div>

          {!stats?.top_stores || stats.top_stores.length === 0 ? (
            <p style={{ color: 'var(--color-muted)', fontWeight: 600 }}>No rated stores yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {stats.top_stores.map((s, idx) => (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'var(--color-input-bg)',
                    boxShadow: 'var(--shadow-clay-pressed)',
                    borderRadius: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.1rem', color: 'var(--color-accent-violet)' }}>
                      #{idx + 1}
                    </span>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.95rem' }}>{s.name}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>📍 {s.address}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <StarRating value={s.average_rating} size="sm" />
                      <strong style={{ fontSize: '0.9rem' }}>{s.average_rating.toFixed(1)}</strong>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                      {s.total_ratings} reviews
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Feedback Feed */}
        <section className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900 }}>⚡ Recent Customer Ratings</h2>
            <span className="badge badge--user">Live Activity</span>
          </div>

          {!stats?.recent_ratings || stats.recent_ratings.length === 0 ? (
            <p style={{ color: 'var(--color-muted)', fontWeight: 600 }}>No recent feedback yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {stats.recent_ratings.map((r) => (
                <div
                  key={r.id}
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'var(--color-input-bg)',
                    boxShadow: 'var(--shadow-clay-pressed)',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>
                      👤 {r.user_name} → <strong>{r.store_name}</strong>
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 800, color: 'var(--color-accent-amber)' }}>
                      {r.rating_value} ★
                    </span>
                  </div>
                  {r.comment && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-foreground)', fontStyle: 'italic', margin: 0 }}>
                      &ldquo;{r.comment}&rdquo;
                    </p>
                  )}
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', textAlign: 'right' }}>
                    {new Date(r.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </main>
  );
};

export default AdminDashboard;
