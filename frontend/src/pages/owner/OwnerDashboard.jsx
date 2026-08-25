import { useState, useEffect, useCallback } from 'react';
import { getMyStoreApi, getMyStoreRatingsApi, getMyStoreStatsApi } from '../../api/stores.api';
import useAuth from '../../hooks/useAuth';
import useDebounce from '../../hooks/useDebounce';
import useToast from '../../hooks/useToast';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import StarRating from '../../components/common/StarRating';
import SkeletonTable from '../../components/common/SkeletonTable';
import OwnerReplyModal from '../../components/common/OwnerReplyModal';
import ChangePasswordModal from '../../components/common/ChangePasswordModal';
import EditProfileModal from '../../components/common/EditProfileModal';
import { exportReviewsCsv } from '../../utils/export';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();

  // ── Dashboard State ────────────────────────────────────────────────
  const [store, setStore] = useState(null);
  const [stats, setStats] = useState({
    average_rating: 0,
    total_ratings: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    percentages: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });

  const [ratings, setRatings] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [filters, setFilters] = useState({
    name: '',
    email: '',
  });

  const debouncedName = useDebounce(filters.name, 350);
  const debouncedEmail = useDebounce(filters.email, 350);

  const [sort, setSort] = useState({
    column: 'date',
    order: 'desc',
  });

  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // ── Review Response Modal State ────────────────────────────────────
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [selectedReviewForReply, setSelectedReviewForReply] = useState(null);

  // ── Initial Store & Stats Load ─────────────────────────────────────
  const fetchStoreProfileAndStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [storeRes, statsRes] = await Promise.all([
        getMyStoreApi(),
        getMyStoreStatsApi(),
      ]);

      const storeData = storeRes?.data;
      const statsData = statsRes?.data;

      if (storeData) {
        setStore(storeData);
        if (statsData) {
          setStats(statsData);
        } else {
          setStats({
            average_rating: storeData.average_rating || 0,
            total_ratings: storeData.total_ratings || 0,
            distribution: storeData.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            percentages: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          });
        }
      } else {
        setStore(null);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to load store profile and analytics. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStoreProfileAndStats();
  }, [fetchStoreProfileAndStats]);

  // ── Fetch Paginated Ratings Table ──────────────────────────────────
  const fetchRatingsTable = useCallback(async () => {
    if (!store) return;
    setTableLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sort: sort.column,
        order: sort.order,
      };

      if (debouncedName.trim()) params.name = debouncedName.trim();
      if (debouncedEmail.trim()) params.email = debouncedEmail.trim();

      const res = await getMyStoreRatingsApi(params);
      const ratingList = res?.data?.ratings || [];
      const meta = res?.data?.pagination || res?.meta || {
        page: pagination.page,
        limit: pagination.limit,
        total: ratingList.length,
        totalPages: 1,
      };

      setRatings(ratingList);
      setPagination(meta);
    } catch {
      // Keep existing list on transient error
    } finally {
      setTableLoading(false);
    }
  }, [
    store,
    pagination.page,
    pagination.limit,
    sort.column,
    sort.order,
    debouncedName,
    debouncedEmail,
  ]);

  useEffect(() => {
    if (store) {
      fetchRatingsTable();
    }
  }, [store, fetchRatingsTable]);

  // ── Handlers ───────────────────────────────────────────────────────
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({ name: '', email: '' });
    setSort({ column: 'date', order: 'desc' });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSort = (column) => {
    setSort((prev) => ({
      column,
      order: prev.column === column && prev.order === 'asc' ? 'desc' : 'asc',
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit) => {
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const renderSortIndicator = (column) => {
    if (sort.column !== column) return <span className="sort-icon">⇅</span>;
    return <span className="sort-icon active">{sort.order === 'asc' ? '▲' : '▼'}</span>;
  };

  const handleExportReviews = () => {
    if (ratings.length === 0) {
      toast.info('No reviews available to export.');
      return;
    }
    exportReviewsCsv(ratings, store?.name);
    toast.success(`Exported ${ratings.length} reviews to CSV!`);
  };

  const handleOpenReplyModal = (review) => {
    setSelectedReviewForReply(review);
    setIsReplyModalOpen(true);
  };

  // ── Stats & Sentiment Calculations ─────────────────────────────────
  const totalReviews = stats?.total_ratings ?? store?.total_ratings ?? 0;
  const avgRating = stats?.average_rating ?? store?.average_rating ?? 0.0;
  const distribution = stats?.distribution || store?.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const fiveStarCount = distribution[5] || 0;
  const fiveStarPercent = totalReviews > 0 ? ((fiveStarCount / totalReviews) * 100).toFixed(0) : 0;

  // Sentiment Breakdown
  const positiveCount = (distribution[5] || 0) + (distribution[4] || 0);
  const neutralCount = distribution[3] || 0;
  const negativeCount = (distribution[2] || 0) + (distribution[1] || 0);
  const positivePct = totalReviews > 0 ? ((positiveCount / totalReviews) * 100).toFixed(0) : 0;
  const neutralPct = totalReviews > 0 ? ((neutralCount / totalReviews) * 100).toFixed(0) : 0;
  const negativePct = totalReviews > 0 ? ((negativeCount / totalReviews) * 100).toFixed(0) : 0;

  if (loading) {
    return (
      <main className="dashboard-page">
        <div className="stores-loading-state">
          <span className="spinner" />
          <p>Connecting to database and calculating store metrics…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="dashboard-page">
        <div className="alert alert--error" role="alert">
          <span>{error}</span>
          <Button variant="danger" size="sm" onClick={fetchStoreProfileAndStats}>
            Retry
          </Button>
        </div>
      </main>
    );
  }

  if (!store) {
    return (
      <main className="dashboard-page">
        <div className="dashboard__header-wrapper">
          <div>
            <span className="dashboard__role-tag">Store Owner Portal</span>
            <h1>Store Dashboard</h1>
            <p>Welcome, <strong>{user?.name}</strong>!</p>
          </div>
        </div>

        <div className="empty-state-card" style={{ marginTop: '2rem' }}>
          <div className="empty-state-icon">🏪</div>
          <h3>No Store Assigned Yet</h3>
          <p>
            Your account is registered as a Store Owner, but no store has been linked to your profile yet.
          </p>
          <p className="text-muted" style={{ marginTop: '0.5rem' }}>
            Please contact the System Administrator to register and assign your business.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      {/* Header */}
      <div className="dashboard__header-wrapper">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <span className="dashboard__role-tag">Store Owner Portal</span>
            <span className="badge badge--user">{store.category || 'General'}</span>
          </div>
          <h1>{store.name}</h1>
          <p>📍 {store.address} &nbsp;•&nbsp; ✉️ {store.email}</p>
        </div>
        <div className="dashboard__actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button variant="outline" size="sm" onClick={handleExportReviews}>
            📥 Export Reviews CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsProfileModalOpen(true)}>
            👤 Edit Profile
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsPasswordModalOpen(true)}>
            🔒 Change Password
          </Button>
          <Button variant="outline" size="sm" onClick={fetchStoreProfileAndStats}>
            ↻ Refresh Analytics
          </Button>
        </div>
      </div>

      {/* ── Key Performance Cards ─────────────────────────────────────── */}
      <div className="dashboard__stats-grid">
        {/* Average Rating Card */}
        <div className="stat-card stat-card--ratings">
          <div className="stat-card__top">
            <span className="stat-card__icon" aria-hidden="true">⭐</span>
            <span className="stat-card__tag">Overall Score</span>
          </div>
          <h3>Average Rating</h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <p className="stat-card__value">
              {avgRating > 0 ? Number(avgRating).toFixed(1) : '0.0'}
            </p>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-muted)' }}>/ 5.0</span>
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <StarRating value={avgRating} size="sm" />
          </div>
        </div>

        {/* Total Reviews Card */}
        <div className="stat-card stat-card--users">
          <div className="stat-card__top">
            <span className="stat-card__icon" aria-hidden="true">👥</span>
            <span className="stat-card__tag">Customer Feedback</span>
          </div>
          <h3>Total Customer Ratings</h3>
          <p className="stat-card__value">{totalReviews}</p>
          <div className="stat-card__footer-link">
            <span>Verified user reviews</span>
          </div>
        </div>

        {/* 5-Star Satisfaction Card */}
        <div className="stat-card stat-card--stores">
          <div className="stat-card__top">
            <span className="stat-card__icon" aria-hidden="true">🏆</span>
            <span className="stat-card__tag">Satisfaction Rate</span>
          </div>
          <h3>5-Star Customer Share</h3>
          <p className="stat-card__value">{fiveStarPercent}%</p>
          <div className="stat-card__footer-link">
            <span>{fiveStarCount} top-tier reviews</span>
          </div>
        </div>
      </div>

      {/* ── Customer Sentiment Meter ──────────────────────────────────── */}
      <section className="sentiment-card">
        <div className="section-header" style={{ marginBottom: '0.5rem' }}>
          <h2>Customer Sentiment Meter</h2>
          <p>Holistic distribution of patron satisfaction based on rating scores</p>
        </div>

        {/* Multi-Segment Sentiment Bar */}
        <div className="sentiment-bar-track">
          <div
            className="sentiment-segment--positive"
            style={{ width: `${positivePct}%` }}
            title={`Positive: ${positivePct}% (${positiveCount} reviews)`}
          />
          <div
            className="sentiment-segment--neutral"
            style={{ width: `${neutralPct}%` }}
            title={`Neutral: ${neutralPct}% (${neutralCount} reviews)`}
          />
          <div
            className="sentiment-segment--negative"
            style={{ width: `${negativePct}%` }}
            title={`Needs Attention: ${negativePct}% (${negativeCount} reviews)`}
          />
        </div>

        <div className="sentiment-legend">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>😍</span>
            <span><strong>{positivePct}%</strong> Positive ({positiveCount})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>😐</span>
            <span><strong>{neutralPct}%</strong> Neutral ({neutralCount})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>🙁</span>
            <span><strong>{negativePct}%</strong> Needs Attention ({negativeCount})</span>
          </div>
        </div>
      </section>

      {/* ── Rating Distribution Progress Bars ─────────────────────────── */}
      <section className="distribution-section">
        <div className="section-header">
          <h2>Rating Breakdown</h2>
          <p>Distribution of all customer feedback by star score</p>
        </div>

        <div className="distribution-card">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star] || 0;
            const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

            return (
              <div key={star} className="distribution-row">
                <div className="distribution-label">
                  <strong>{star}</strong> ★
                </div>
                <div className="distribution-track">
                  <div
                    className="distribution-fill"
                    style={{ width: `${pct}%` }}
                    title={`${count} reviews (${pct.toFixed(1)}%)`}
                  />
                </div>
                <div className="distribution-meta">
                  <span className="distribution-count">{count}</span>
                  <span className="distribution-pct">({pct.toFixed(0)}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Customer Reviews Section with Search & Sorting ────────────── */}
      <section className="owner-reviews-section">
        <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2>Customer Reviews & Feedback</h2>
            <p>Verified patron ratings, commentary notes, and official store responses</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportReviews}>
            📥 Export to CSV
          </Button>
        </div>

        {/* Reviewer Filter Controls */}
        <div className="filter-panel" style={{ marginTop: '1.25rem', marginBottom: '1.5rem' }}>
          <div className="filter-grid">
            <div className="filter-item">
              <label htmlFor="filter-reviewer-name" className="filter-label">Search Customer Name</label>
              <input
                id="filter-reviewer-name"
                name="name"
                type="text"
                placeholder="Search customer name…"
                value={filters.name}
                onChange={handleFilterChange}
                className="form-input form-input--sm"
              />
            </div>

            <div className="filter-item">
              <label htmlFor="filter-reviewer-email" className="filter-label">Search Customer Email</label>
              <input
                id="filter-reviewer-email"
                name="email"
                type="text"
                placeholder="Search email…"
                value={filters.email}
                onChange={handleFilterChange}
                className="form-input form-input--sm"
              />
            </div>
          </div>

          {(filters.name || filters.email) && (
            <div className="filter-actions">
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={handleResetFilters}
              >
                ✕ Clear Search
              </button>
            </div>
          )}
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} className="sortable-header">
                  Customer {renderSortIndicator('name')}
                </th>
                <th onClick={() => handleSort('email')} className="sortable-header">
                  Email {renderSortIndicator('email')}
                </th>
                <th onClick={() => handleSort('rating')} className="sortable-header">
                  Rating {renderSortIndicator('rating')}
                </th>
                <th>Feedback & Store Reply</th>
                <th onClick={() => handleSort('date')} className="sortable-header">
                  Date {renderSortIndicator('date')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tableLoading ? (
                <SkeletonTable rows={5} cols={6} />
              ) : ratings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="table-empty">
                    <p>{filters.name || filters.email ? 'No reviews matched your search criteria.' : 'No customer ratings yet.'}</p>
                  </td>
                </tr>
              ) : (
                ratings.map((r) => (
                  <tr key={r.id}>
                    <td className="table-cell-bold">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="customer-avatar-badge">
                          {r.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                        <span>{r.user?.name}</span>
                      </div>
                    </td>
                    <td>{r.user?.email}</td>
                    <td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <StarRating value={r.rating_value} size="sm" />
                        <strong style={{ color: 'var(--color-accent-amber)' }}>
                          {r.rating_value} ★
                        </strong>
                      </div>
                    </td>
                    <td>
                      {r.comment ? (
                        <div style={{ fontStyle: 'italic', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                          &ldquo;{r.comment}&rdquo;
                        </div>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.85rem' }}>—</span>
                      )}

                      {/* Store Owner Official Reply */}
                      {r.owner_reply && (
                        <div className="owner-reply-bubble">
                          <strong>🏬 Store Response:</strong>
                          <p>&ldquo;{r.owner_reply}&rdquo;</p>
                          {r.owner_replied_at && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>
                              Replied on {new Date(r.owner_replied_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <Button
                        variant={r.owner_reply ? 'outline' : 'secondary'}
                        size="sm"
                        onClick={() => handleOpenReplyModal(r)}
                        title={r.owner_reply ? 'Edit Store Reply' : 'Reply to Customer'}
                      >
                        {r.owner_reply ? '✏️ Edit Reply' : '💬 Reply'}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination Footer */}
          {!tableLoading && pagination.total > 0 && (
            <Pagination
              page={pagination.page}
              limit={pagination.limit}
              total={pagination.total}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
              itemLabel="customer ratings"
            />
          )}
        </div>
      </section>

      {/* Reply Modal */}
      <OwnerReplyModal
        isOpen={isReplyModalOpen}
        onClose={() => {
          setIsReplyModalOpen(false);
          setSelectedReviewForReply(null);
        }}
        review={selectedReviewForReply}
        onReplied={() => {
          fetchRatingsTable();
          fetchStoreProfileAndStats();
        }}
      />

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

export default OwnerDashboard;
