import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import { getAdminStatsApi } from '../../api/admin.api';
import { getUsersApi } from '../../api/users.api';
import { getStoresApi } from '../../api/stores.api';
import Button from '../../components/common/Button';
import StarRating, { getRatingColor } from '../../components/common/StarRating';
import ChangePasswordModal from '../../components/common/ChangePasswordModal';
import EditProfileModal from '../../components/common/EditProfileModal';
import { exportUsersCsv, exportStoresCsv } from '../../utils/export';
import { ROUTES } from '../../utils/constants';
import { getStorePhoto, getUserAvatar } from '../../utils/storeImages';

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return 'just now';
  if (diffMin === 1) return '1 min ago';
  if (diffMin < 60) return `${diffMin} mins ago`;
  if (diffHours === 1) return '1 hour ago';
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
};

const getCategoryIcon = (category) => {
  switch (category) {
    case 'Tech & Electronics':
      return '⚡';
    case 'Grocery & Mart':
      return '🥑';
    case 'Fashion & Boutique':
      return '👗';
    case 'Cafe & Dining':
      return '☕';
    case 'Services & Wellness':
      return '🌿';
    default:
      return '🏬';
  }
};

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
      toast.error('Failed to export stores list.');
    } finally {
      setExportLoading(false);
    }
  };

  const counts = {
    total_users: stats?.counts?.total_users ?? stats?.total_users ?? 0,
    total_stores: stats?.counts?.total_stores ?? stats?.total_stores ?? 0,
    total_ratings: stats?.counts?.total_ratings ?? stats?.total_ratings ?? 0,
    total_normal_users: stats?.counts?.total_normal_users ?? stats?.total_normal_users ?? 0,
    total_store_owners: stats?.counts?.total_store_owners ?? stats?.total_store_owners ?? 0,
    total_admin_users: stats?.counts?.total_admin_users ?? stats?.total_admin_users ?? 0,
    platform_avg_rating: stats?.platform_avg_rating ?? stats?.counts?.platform_avg_rating ?? 0.0,
    five_star_ratings: stats?.five_star_ratings ?? stats?.counts?.five_star_ratings ?? 0,
    active_stores_rated: stats?.active_stores_rated ?? stats?.counts?.active_stores_rated ?? 0,
  };

  const topStores = stats?.top_stores || [];
  const recentRatings = stats?.recent_ratings || [];
  const recentUsers = stats?.recent_users || [];
  const categoryDistribution = stats?.category_distribution || [];

  const totalUsersCount = counts.total_users || 1;
  const normalUserPct = Math.round((counts.total_normal_users / totalUsersCount) * 100);
  const storeOwnerPct = Math.round((counts.total_store_owners / totalUsersCount) * 100);
  const adminUserPct = Math.round((counts.total_admin_users / totalUsersCount) * 100);

  const fiveStarPercent = counts.total_ratings > 0
    ? Math.round((counts.five_star_ratings / counts.total_ratings) * 100)
    : 0;

  const storeCoveragePercent = counts.total_stores > 0
    ? Math.round((counts.active_stores_rated / counts.total_stores) * 100)
    : 0;

  return (
    <main className="dashboard-page">
      {/* Header */}
      <div className="dashboard__header-wrapper">
        <div>
          <div className="dashboard__role-tag">SYSTEM ADMINISTRATOR</div>
          <h1>Platform Operations Command Center</h1>
          <p>
            Welcome, <strong>{user?.name}</strong>! High-level performance metrics, user analytics, and system oversight.
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
          >
            ↻ Refresh Data
          </Button>
        </div>
      </div>

      {/* Navigation Sub-Nav Tabs */}
      <nav className="nav-clay-pill" style={{ marginBottom: '2rem', height: '3.75rem' }} aria-label="Admin sub-navigation">
        <div className="nav-links">
          <Link to={ROUTES.ADMIN_DASHBOARD} className="nav-link nav-link--active">
            📊 Overview
          </Link>
          <Link to={ROUTES.ADMIN_USERS} className="nav-link">
            👥 User Management
          </Link>
          <Link to={ROUTES.ADMIN_STORES} className="nav-link">
            🏬 Store Management
          </Link>
        </div>
      </nav>

      {/* Error Alert */}
      {error && (
        <div className="alert alert--error" role="alert">
          <span>{error}</span>
          <Button variant="danger" size="sm" onClick={fetchStats}>
            Retry
          </Button>
        </div>
      )}

      {/* ── Key Performance Cards ─────────────────────────────────────── */}
      <div className="dashboard__stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {/* Total Users */}
        <div className="stat-card stat-card--users">
          <div className="stat-card__top">
            <span className="stat-card__icon" aria-hidden="true">👥</span>
            <span className="stat-card__tag">Platform Users</span>
          </div>
          <h3>Registered Users</h3>
          <p className="stat-card__value">{counts.total_users}</p>
          <div className="stat-card__breakdown">
            <span>🛍️ {counts.total_normal_users} Shoppers</span>
            <span>🏬 {counts.total_store_owners} Store Owners</span>
          </div>
          <div className="stat-card__footer-link" style={{ marginTop: '0.5rem' }}>
            <Link to={ROUTES.ADMIN_USERS}>Manage user directory →</Link>
          </div>
        </div>

        {/* Total Stores */}
        <div className="stat-card stat-card--stores">
          <div className="stat-card__top">
            <span className="stat-card__icon" aria-hidden="true">🏬</span>
            <span className="stat-card__tag">Business Directory</span>
          </div>
          <h3>Registered Stores</h3>
          <p className="stat-card__value">{counts.total_stores}</p>
          <div className="stat-card__breakdown">
            <span>🟢 {counts.active_stores_rated} Stores with Reviews</span>
            <span>📍 {storeCoveragePercent}% Review Coverage</span>
          </div>
          <div className="stat-card__footer-link" style={{ marginTop: '0.5rem' }}>
            <Link to={ROUTES.ADMIN_STORES}>Manage store directory →</Link>
          </div>
        </div>

        {/* Total Ratings */}
        <div className="stat-card stat-card--ratings">
          <div className="stat-card__top">
            <span className="stat-card__icon" aria-hidden="true">💬</span>
            <span className="stat-card__tag">Feedback Volume</span>
          </div>
          <h3>Total Reviews</h3>
          <p className="stat-card__value">{counts.total_ratings}</p>
          <div className="stat-card__breakdown">
            <span>⭐ {counts.five_star_ratings} Five-Star Ratings</span>
            <span>🔥 {fiveStarPercent}% Top-Tier Satisfaction</span>
          </div>
          <div className="stat-card__footer-link" style={{ marginTop: '0.5rem' }}>
            <span>Aggregated across all stores</span>
          </div>
        </div>

        {/* Platform Quality Index */}
        <div className="stat-card stat-card--ratings">
          <div className="stat-card__top">
            <span className="stat-card__icon" aria-hidden="true">⭐</span>
            <span className="stat-card__tag">Quality Index</span>
          </div>
          <h3>Platform Avg Rating</h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
            <p className="stat-card__value" style={{ color: getRatingColor(counts.platform_avg_rating) }}>
              {counts.platform_avg_rating > 0 ? Number(counts.platform_avg_rating).toFixed(1) : '0.0'}
            </p>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-muted)' }}>/ 5.0</span>
          </div>
          <div style={{ marginTop: '0.25rem' }}>
            <StarRating value={counts.platform_avg_rating} size="sm" />
          </div>
          <div className="stat-card__footer-link" style={{ marginTop: '0.5rem' }}>
            <span>Platform-wide satisfaction</span>
          </div>
        </div>
      </div>

      {/* ── Analytical Visual Breakdowns (Row 2) ───────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        {/* User Demographics & Persona Breakdown */}
        <section className="filter-panel" style={{ margin: 0 }}>
          <div className="section-header" style={{ marginBottom: '1.25rem' }}>
            <h2>👥 User Demographics & Personas</h2>
            <p>Distribution of registered user roles across the platform</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Multi-segment Progress Bar */}
            <div style={{ height: '14px', borderRadius: '10px', overflow: 'hidden', display: 'flex', background: 'var(--color-input-bg)', boxShadow: 'var(--shadow-clay-pressed)' }}>
              <div style={{ width: `${normalUserPct}%`, background: 'var(--gradient-primary)' }} title={`Shoppers: ${normalUserPct}%`} />
              <div style={{ width: `${storeOwnerPct}%`, background: 'var(--gradient-secondary)' }} title={`Store Owners: ${storeOwnerPct}%`} />
              <div style={{ width: `${adminUserPct}%`, background: 'var(--gradient-amber)' }} title={`Admins: ${adminUserPct}%`} />
            </div>

            {/* Persona Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '0.5rem' }}>
              <div style={{ padding: '0.85rem', background: 'var(--color-input-bg)', boxShadow: 'var(--shadow-clay-pressed)', borderRadius: '16px', textAlign: 'center' }}>
                <span style={{ fontSize: '1.4rem', display: 'block', marginBottom: '0.2rem' }}>🛍️</span>
                <strong style={{ display: 'block', fontSize: '1.1rem' }}>{counts.total_normal_users}</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 700 }}>Shoppers ({normalUserPct}%)</span>
              </div>

              <div style={{ padding: '0.85rem', background: 'var(--color-input-bg)', boxShadow: 'var(--shadow-clay-pressed)', borderRadius: '16px', textAlign: 'center' }}>
                <span style={{ fontSize: '1.4rem', display: 'block', marginBottom: '0.2rem' }}>🏬</span>
                <strong style={{ display: 'block', fontSize: '1.1rem' }}>{counts.total_store_owners}</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 700 }}>Owners ({storeOwnerPct}%)</span>
              </div>

              <div style={{ padding: '0.85rem', background: 'var(--color-input-bg)', boxShadow: 'var(--shadow-clay-pressed)', borderRadius: '16px', textAlign: 'center' }}>
                <span style={{ fontSize: '1.4rem', display: 'block', marginBottom: '0.2rem' }}>👑</span>
                <strong style={{ display: 'block', fontSize: '1.1rem' }}>{counts.total_admin_users}</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 700 }}>Admins ({adminUserPct}%)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Store Category Distribution */}
        <section className="filter-panel" style={{ margin: 0 }}>
          <div className="section-header" style={{ marginBottom: '1.25rem' }}>
            <h2>🏬 Industry & Category Distribution</h2>
            <p>Catalog breakdown by commercial retail vertical</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {categoryDistribution.length === 0 ? (
              <p className="text-muted">No category data available.</p>
            ) : (
              categoryDistribution.map((cat) => {
                const pct = counts.total_stores > 0 ? Math.round((cat.count / counts.total_stores) * 100) : 0;
                return (
                  <div key={cat.category} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 800 }}>
                      <span>{getCategoryIcon(cat.category)} {cat.category}</span>
                      <span>{cat.count} {cat.count === 1 ? 'store' : 'stores'} ({pct}%)</span>
                    </div>
                    <div style={{ height: '8px', borderRadius: '8px', overflow: 'hidden', background: 'var(--color-input-bg)', boxShadow: 'var(--shadow-clay-pressed)' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'var(--gradient-primary)', borderRadius: '8px' }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* ── Quick Data Export & Action Hub ────────────────────────────── */}
      <section className="filter-panel" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>⚡ Executive Action & Data Hub</h3>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>Fast management shortcuts and catalog data exports.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to={ROUTES.ADMIN_STORES} className="btn btn--primary btn--sm" style={{ textDecoration: 'none' }}>
              + Register Store
            </Link>
            <Link to={ROUTES.ADMIN_USERS} className="btn btn--secondary btn--sm" style={{ textDecoration: 'none' }}>
              + Onboard User
            </Link>
            <Button variant="outline" size="sm" onClick={handleExportUsers} loading={exportLoading}>
              👥 Export Users CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportStores} loading={exportLoading}>
              🏬 Export Stores CSV
            </Button>
          </div>
        </div>
      </section>

      {/* ── Triple Live Activity Feeds ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        {/* 1. Top 5 Rated Stores Leaderboard */}
        <section className="filter-panel" style={{ margin: 0 }}>
          <div className="section-header" style={{ marginBottom: '1.25rem' }}>
            <h2>🏆 Top Rated Stores</h2>
            <p>Highest customer satisfaction ratings</p>
          </div>

          {loading ? (
            <div className="spinner-wrapper" style={{ padding: '2rem' }}>
              <span className="spinner" />
            </div>
          ) : topStores.length === 0 ? (
            <p className="text-muted">No ratings recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {topStores.map((s, idx) => (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    background: 'var(--color-input-bg)',
                    boxShadow: 'var(--shadow-clay-pressed)',
                    borderRadius: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 900, width: '1.5rem', textAlign: 'center' }}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </span>
                    <img
                      src={getStorePhoto(s.name, s.category)}
                      alt=""
                      className="store-thumb-photo"
                      style={{ width: '2.5rem', height: '2.5rem', borderRadius: '12px' }}
                    />
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.95rem' }}>{s.name}</strong>
                      <span className="badge badge--user" style={{ fontSize: '0.7rem' }}>{s.category || 'General'}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <StarRating value={s.average_rating} size="sm" />
                    <strong style={{ color: getRatingColor(s.average_rating) }}>
                      {s.average_rating ? Number(s.average_rating).toFixed(1) : '0.0'}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 2. Live Ratings Feed with Relative Timestamps */}
        <section className="filter-panel" style={{ margin: 0 }}>
          <div className="section-header" style={{ marginBottom: '1.25rem' }}>
            <h2>⚡ Recent Customer Ratings</h2>
            <p>Live stream of reviews submitted across the platform</p>
          </div>

          {loading ? (
            <div className="spinner-wrapper" style={{ padding: '2rem' }}>
              <span className="spinner" />
            </div>
          ) : recentRatings.length === 0 ? (
            <p className="text-muted">No recent ratings found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentRatings.map((r) => (
                <div
                  key={r.id}
                  style={{
                    padding: '0.85rem 1rem',
                    background: 'var(--color-input-bg)',
                    boxShadow: 'var(--shadow-clay-pressed)',
                    borderRadius: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img
                        src={getUserAvatar(r.user_name || r.user_id)}
                        alt=""
                        className="user-avatar-photo"
                        style={{ width: '2rem', height: '2rem' }}
                      />
                      <strong>{r.user_name} → {r.store_name}</strong>
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <StarRating value={r.rating_value} size="sm" />
                      <strong style={{ color: getRatingColor(r.rating_value) }}>{r.rating_value} ★</strong>
                    </div>
                  </div>
                  {r.comment && (
                    <p style={{ fontSize: '0.85rem', fontStyle: 'italic', margin: '0.25rem 0', color: 'var(--color-foreground)', paddingLeft: '2.5rem' }}>
                      &ldquo;{r.comment}&rdquo;
                    </p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.2rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 700 }}>
                      🕒 {timeAgo(r.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 3. Newest User Registrations Feed */}
        <section className="filter-panel" style={{ margin: 0 }}>
          <div className="section-header" style={{ marginBottom: '1.25rem' }}>
            <h2>👤 Newest Members</h2>
            <p>Recent user and business registrations</p>
          </div>

          {loading ? (
            <div className="spinner-wrapper" style={{ padding: '2rem' }}>
              <span className="spinner" />
            </div>
          ) : recentUsers.length === 0 ? (
            <p className="text-muted">No recent users found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentUsers.map((u) => (
                <div
                  key={u.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    background: 'var(--color-input-bg)',
                    boxShadow: 'var(--shadow-clay-pressed)',
                    borderRadius: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img
                      src={getUserAvatar(u.id || u.email || u.name)}
                      alt=""
                      className="user-avatar-photo"
                      style={{ width: '2rem', height: '2rem' }}
                    />
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.9rem' }}>{u.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{u.email}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                    <span className={`badge ${u.role === 'SYSTEM_ADMIN' ? 'badge--admin' : u.role === 'STORE_OWNER' ? 'badge--owner' : 'badge--user'}`} style={{ fontSize: '0.65rem' }}>
                      {u.role?.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)', fontWeight: 700 }}>
                      {timeAgo(u.created_at)}
                    </span>
                  </div>
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
