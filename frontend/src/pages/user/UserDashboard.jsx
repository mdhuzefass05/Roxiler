import { useState, useEffect, useCallback } from 'react';
import { getStoresApi } from '../../api/stores.api';
import { submitRatingApi, updateRatingApi, getMyRatingsApi } from '../../api/ratings.api';
import useAuth from '../../hooks/useAuth';
import useDebounce from '../../hooks/useDebounce';
import useToast from '../../hooks/useToast';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import StarRating from '../../components/common/StarRating';
import SkeletonCard from '../../components/common/SkeletonCard';
import ChangePasswordModal from '../../components/common/ChangePasswordModal';
import EditProfileModal from '../../components/common/EditProfileModal';
import { getStorePhoto, getUserAvatar } from '../../utils/storeImages';

const STORE_CATEGORIES = [
  'All',
  'Tech & Electronics',
  'Grocery & Mart',
  'Fashion & Boutique',
  'Cafe & Dining',
  'Services & Wellness',
];

const RATING_LABELS = {
  1: '1 Star — Poor',
  2: '2 Stars — Fair',
  3: '3 Stars — Good',
  4: '4 Stars — Very Good',
  5: '5 Stars — Excellent',
};

const FAVORITES_STORAGE_KEY = 'storerate_favorites';

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

const UserDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();

  // ── Store List State ───────────────────────────────────────────────
  const [stores, setStores] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 1,
  });

  const [filters, setFilters] = useState({
    name: '',
    address: '',
    category: 'All',
    minRating: 'all', // 'all' | '4.0' | '4.5'
    favoritesOnly: false,
  });

  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const debouncedName = useDebounce(filters.name, 350);
  const debouncedAddress = useDebounce(filters.address, 350);

  const [sort, setSort] = useState({
    column: 'name',
    order: 'asc',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [myRatingsHistory, setMyRatingsHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // ── Rating Modal State ─────────────────────────────────────────────
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedScore, setSelectedScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [isModifying, setIsModifying] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingError, setRatingError] = useState(null);

  // ── Save Favorites ─────────────────────────────────────────────────
  const toggleFavorite = (storeId) => {
    setFavorites((prev) => {
      const next = prev.includes(storeId)
        ? prev.filter((id) => id !== storeId)
        : [...prev, storeId];
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  // ── Fetch Stores ───────────────────────────────────────────────────
  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sort: sort.column,
        order: sort.order,
      };

      if (debouncedName.trim()) params.name = debouncedName.trim();
      if (debouncedAddress.trim()) params.address = debouncedAddress.trim();
      if (filters.category && filters.category !== 'All') params.category = filters.category;

      const res = await getStoresApi(params);
      let storeList = res?.data?.stores || res?.data || [];
      const meta = res?.data?.pagination || res?.meta || {
        page: pagination.page,
        limit: pagination.limit,
        total: storeList.length,
        totalPages: 1,
      };

      // Client rating filters
      if (filters.minRating === '4.0') {
        storeList = storeList.filter((s) => Number(s.average_rating) >= 4.0);
      } else if (filters.minRating === '4.5') {
        storeList = storeList.filter((s) => Number(s.average_rating) >= 4.5);
      }

      if (filters.favoritesOnly) {
        storeList = storeList.filter((s) => favorites.includes(s.id));
      }

      setStores(storeList);
      setPagination(meta);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load stores. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    sort.column,
    sort.order,
    debouncedName,
    debouncedAddress,
    filters.category,
    filters.minRating,
    filters.favoritesOnly,
    favorites,
  ]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // ── Filter & Sort Handlers ─────────────────────────────────────────
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleCategorySelect = (category) => {
    setFilters((prev) => ({ ...prev, category }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleMinRatingSelect = (rating) => {
    setFilters((prev) => ({ ...prev, minRating: rating }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({ name: '', address: '', category: 'All', minRating: 'all', favoritesOnly: false });
    setSort({ column: 'name', order: 'asc' });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (e) => {
    const [column, order] = e.target.value.split(':');
    setSort({ column, order });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // ── Rating Actions ─────────────────────────────────────────────────
  const handleOpenRatingModal = (store) => {
    setSelectedStore(store);
    const hasRated = store.user_rating !== null && store.user_rating !== undefined;
    setIsModifying(hasRated);
    setSelectedScore(hasRated ? store.user_rating : 5);
    setRatingComment('');
    setRatingError(null);
    setIsRatingModalOpen(true);
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStore) return;

    setRatingLoading(true);
    setRatingError(null);

    try {
      if (isModifying) {
        await updateRatingApi(selectedStore.id, selectedScore, ratingComment.trim() || undefined);
        toast.success(`Updated rating for "${selectedStore.name}" to ${selectedScore} stars!`);
      } else {
        await submitRatingApi({
          store_id: selectedStore.id,
          rating_value: selectedScore,
          comment: ratingComment.trim() || undefined,
        });
        toast.success(`Submitted your ${selectedScore}-star review for "${selectedStore.name}"!`);
      }

      setIsRatingModalOpen(false);
      fetchStores();
    } catch (err) {
      setRatingError(
        err.response?.data?.message ||
        'Failed to save your rating. Please try again.'
      );
    } finally {
      setRatingLoading(false);
    }
  };

  const handleOpenHistoryModal = async () => {
    setIsHistoryModalOpen(true);
    setHistoryLoading(true);
    try {
      const res = await getMyRatingsApi();
      setMyRatingsHistory(res?.data || []);
    } catch {
      toast.error('Failed to load ratings history.');
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <main className="dashboard-page">
      {/* Header */}
      <div className="dashboard__header-wrapper">
        <div>
          <span className="dashboard__role-tag">Customer Portal</span>
          <h1>Explore & Rate Stores</h1>
          <p>
            Welcome, <strong>{user?.name}</strong>! Discover verified local stores, leave authentic reviews, and bookmark your favorites.
          </p>
        </div>
        <div className="dashboard__actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenHistoryModal}
          >
            ⭐ My Ratings History
          </Button>
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
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert--error" role="alert">
          <span>{error}</span>
          <Button variant="danger" size="sm" onClick={fetchStores}>
            Retry
          </Button>
        </div>
      )}

      {/* Category Filter Chips Bar */}
      <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
        {STORE_CATEGORIES.map((cat) => {
          const isActive = filters.category === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategorySelect(cat)}
              className="btn btn--sm"
              style={{
                background: isActive ? 'var(--gradient-primary)' : 'var(--color-card-bg)',
                color: isActive ? '#ffffff' : 'var(--color-foreground)',
                boxShadow: isActive ? 'var(--shadow-clay-button)' : 'var(--shadow-clay-card)',
                borderRadius: '16px',
                whiteSpace: 'nowrap',
                fontWeight: 800,
              }}
            >
              {cat === 'All' ? '🏬 All Stores' : `${getCategoryIcon(cat)} ${cat}`}
            </button>
          );
        })}
      </div>

      {/* Search & Sort Panel with Minimum Rating Chips */}
      <section className="filter-panel">
        <div className="filter-grid">
          <div className="filter-item">
            <label htmlFor="filter-user-store-name" className="filter-label">Search Store Name</label>
            <input
              id="filter-user-store-name"
              name="name"
              type="text"
              placeholder="Search by store name…"
              value={filters.name}
              onChange={handleFilterChange}
              className="form-input form-input--sm"
            />
          </div>

          <div className="filter-item">
            <label htmlFor="filter-user-address" className="filter-label">Search Address / City</label>
            <input
              id="filter-user-address"
              name="address"
              type="text"
              placeholder="Search by street, city, or zip…"
              value={filters.address}
              onChange={handleFilterChange}
              className="form-input form-input--sm"
            />
          </div>

          <div className="filter-item">
            <label htmlFor="sort-user-stores" className="filter-label">Sort Stores By</label>
            <select
              id="sort-user-stores"
              value={`${sort.column}:${sort.order}`}
              onChange={handleSortChange}
              className="form-input form-input--sm form-select"
            >
              <option value="name:asc">Name (A → Z)</option>
              <option value="name:desc">Name (Z → A)</option>
              <option value="rating:desc">Highest Rated (5 → 1)</option>
              <option value="rating:asc">Lowest Rated (1 → 5)</option>
              <option value="address:asc">Address (A → Z)</option>
              <option value="address:desc">Address (Z → A)</option>
            </select>
          </div>
        </div>

        {/* Rating Score Chips & Favorites Checkbox */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem', flexWrap: 'wrap', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-muted)' }}>Rating Filter:</span>
            {['all', '4.0', '4.5'].map((r) => {
              const active = filters.minRating === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleMinRatingSelect(r)}
                  style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    border: 'none',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    background: active ? 'var(--gradient-amber)' : 'var(--color-input-bg)',
                    color: active ? '#ffffff' : 'var(--color-foreground)',
                    boxShadow: active ? 'var(--shadow-clay-orb-amber)' : 'var(--shadow-clay-pressed)',
                  }}
                >
                  {r === 'all' ? '⭐ Any Rating' : `⭐ ${r}+ Stars`}
                </button>
              );
            })}
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.9rem' }}>
            <input
              type="checkbox"
              name="favoritesOnly"
              checked={filters.favoritesOnly}
              onChange={handleFilterChange}
              style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--color-accent-pink)' }}
            />
            <span>❤️ Saved Favorites ({favorites.length})</span>
          </label>

          {(filters.name || filters.address || filters.category !== 'All' || filters.minRating !== 'all' || filters.favoritesOnly) && (
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={handleResetFilters}
            >
              ✕ Reset All Filters
            </button>
          )}
        </div>
      </section>

      {/* Stores Grid / Cards Layout with Shimmer Skeletons */}
      <section className="stores-grid">
        {loading ? (
          <SkeletonCard count={6} />
        ) : stores.length === 0 ? (
          <div className="empty-state-card" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-state-icon">🏬</div>
            <h3>No Stores Found</h3>
            <p>No registered businesses matched your current search filters.</p>
            {(filters.name || filters.address || filters.category !== 'All' || filters.minRating !== 'all' || filters.favoritesOnly) && (
              <Button variant="outline" size="sm" onClick={handleResetFilters} style={{ marginTop: '1rem' }}>
                Reset Filters
              </Button>
            )}
          </div>
        ) : (
          stores.map((s) => {
            const hasUserRated = s.user_rating !== null && s.user_rating !== undefined;
            const isFav = favorites.includes(s.id);
            const isTopRated = Number(s.average_rating) >= 4.8;
            const isPopular = Number(s.total_ratings) >= 3;

            return (
              <article key={s.id} className="store-card">
                {/* Natural Storefront Cover Photography */}
                <div className="store-card__photo-container">
                  <img
                    src={getStorePhoto(s.name, s.category)}
                    alt={s.name}
                    className="store-card__photo-img"
                    loading="lazy"
                  />
                  <div className="store-card__photo-scrim">
                    <span className="store-card__banner-badge">
                      {getCategoryIcon(s.category)} {s.category || 'General'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="status-dot--open" style={{ background: 'var(--color-banner-badge-bg)', padding: '0.2rem 0.5rem', borderRadius: '10px' }}>
                        Open Today
                      </span>
                    </div>
                  </div>
                </div>

                <div className="store-card__content">
                  <div>
                    <div className="store-card__header">
                      <img
                        src={getStorePhoto(s.name, s.category)}
                        alt={s.name}
                        className="store-thumb-photo"
                      />
                      <div className="store-card__title-wrap" style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                          <h2 className="store-card__name">{s.name}</h2>
                          <button
                            type="button"
                            onClick={() => toggleFavorite(s.id)}
                            title={isFav ? 'Remove from favorites' : 'Save to favorites'}
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: '1.3rem',
                              cursor: 'pointer',
                              padding: '0.2rem',
                              lineHeight: 1,
                            }}
                          >
                            {isFav ? '❤️' : '🤍'}
                          </button>
                        </div>

                        {/* Trust Badges */}
                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                          {isTopRated && (
                            <span className="trust-badge trust-badge--top-rated">🏆 Top Rated</span>
                          )}
                          {isPopular && (
                            <span className="trust-badge" style={{ background: 'rgba(219, 39, 119, 0.15)', color: 'var(--color-accent-pink)' }}>🔥 Popular</span>
                          )}
                        </div>

                        <p className="store-card__address">📍 {s.address}</p>
                      </div>
                    </div>

                    <div className="store-card__body">
                      {/* Overall Store Rating Box */}
                      <div className="store-rating-box">
                        <div className="store-rating-box__top">
                          <span className="store-metric-label">Overall Score</span>
                          <span className="store-metric-reviews">
                            {s.total_ratings} {s.total_ratings === 1 ? 'review' : 'reviews'}
                          </span>
                        </div>
                        <div className="store-rating-box__bottom">
                          <StarRating value={s.average_rating} size="sm" />
                          <div className="store-score-pill">
                            <strong>{s.average_rating > 0 ? Number(s.average_rating).toFixed(1) : '0.0'}</strong>
                            <span className="store-score-pill__max">/ 5.0</span>
                          </div>
                        </div>
                      </div>

                      {/* Authenticated User Rating Status */}
                      <div className="store-user-rating-box">
                        <span className="store-metric-label">Your Rating:</span>
                        <div className="store-user-rating-val">
                          {hasUserRated ? (
                            <div className="my-rating-badge">
                              <StarRating value={s.user_rating} size="xs" />
                              <span className="my-rating-text">
                                <strong>{s.user_rating}</strong> / 5
                              </span>
                            </div>
                          ) : (
                            <span className="unrated-badge">Not Rated Yet</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="store-card__footer">
                    <Button
                      variant={hasUserRated ? 'outline' : 'primary'}
                      size="sm"
                      fullWidth
                      onClick={() => handleOpenRatingModal(s)}
                    >
                      {hasUserRated ? '✏️ Modify Your Rating' : '⭐ Rate This Store'}
                    </Button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* Pagination Footer */}
      {!loading && pagination.total > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <Pagination
            page={pagination.page}
            limit={pagination.limit}
            total={pagination.total}
            totalPages={pagination.totalPages}
            onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
            onLimitChange={(l) => setPagination((prev) => ({ ...prev, limit: l, page: 1 }))}
            itemLabel="stores"
          />
        </div>
      )}

      {/* ── Submit / Modify Rating Modal ──────────────────────────────── */}
      <Modal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        title={isModifying ? `Modify Rating for ${selectedStore?.name}` : `Rate ${selectedStore?.name}`}
      >
        {selectedStore && (
          <form onSubmit={handleRatingSubmit} noValidate>
            {ratingError && (
              <div className="alert alert--error" role="alert">
                {ratingError}
              </div>
            )}

            <div className="rating-modal-content">
              <p className="rating-modal-prompt">
                Select your rating from 1 to 5 stars:
              </p>

              {/* Interactive Star Picker */}
              <div className="rating-picker-wrapper">
                <StarRating
                  value={selectedScore}
                  size="lg"
                  interactive
                  onChange={(newScore) => setSelectedScore(newScore)}
                />
                <div className="rating-selected-label">
                  {RATING_LABELS[selectedScore]}
                </div>
              </div>

              {/* Optional Review Commentary */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="rating-comment" className="form-label">
                  Written Feedback (Optional)
                </label>
                <textarea
                  id="rating-comment"
                  rows="3"
                  maxLength={500}
                  placeholder="Share details about your experience, product quality, or customer service…"
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  className="form-input"
                  style={{ height: 'auto', padding: '0.75rem 1.25rem', borderRadius: '18px' }}
                />
                <span className="form-helper-text" style={{ textAlign: 'right', display: 'block' }}>
                  {ratingComment.length}/500 characters
                </span>
              </div>

              <div className="rating-store-summary-box">
                <div className="summary-row">
                  <span>Store:</span>
                  <strong>{selectedStore.name}</strong>
                </div>
                <div className="summary-row">
                  <span>Category:</span>
                  <span className="badge badge--user" style={{ fontSize: '0.75rem' }}>
                    {selectedStore.category || 'General'}
                  </span>
                </div>
                <div className="summary-row">
                  <span>Current Overall:</span>
                  <span>{selectedStore.average_rating > 0 ? `${Number(selectedStore.average_rating).toFixed(1)} / 5.0 (${selectedStore.total_ratings} reviews)` : 'No ratings yet'}</span>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRatingModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={ratingLoading}
              >
                {isModifying ? 'Update Rating' : 'Submit Rating'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── My Ratings History Modal ──────────────────────────────────── */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="My Submitted Ratings History"
      >
        <div>
          {historyLoading ? (
            <div className="spinner-wrapper" style={{ padding: '2rem' }}>
              <span className="spinner" />
              <p>Loading your reviews…</p>
            </div>
          ) : myRatingsHistory.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-muted)', fontWeight: 600 }}>
              You haven&apos;t rated any stores yet. Browse the catalog and leave your first review!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '380px', overflowY: 'auto' }}>
              {myRatingsHistory.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '1rem',
                    background: 'var(--color-input-bg)',
                    boxShadow: 'var(--shadow-clay-pressed)',
                    borderRadius: '18px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={getStorePhoto(item.store_name)}
                        alt=""
                        className="store-thumb-photo"
                        style={{ width: '2.2rem', height: '2.2rem', borderRadius: '10px' }}
                      />
                      <strong>{item.store_name}</strong>
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <StarRating value={item.rating_value} size="sm" />
                      <strong style={{ color: 'var(--color-accent-amber)' }}>{item.rating_value} ★</strong>
                    </div>
                  </div>
                  {item.comment && (
                    <p style={{ fontSize: '0.85rem', fontStyle: 'italic', margin: '0.35rem 0', color: 'var(--color-foreground)' }}>
                      &ldquo;{item.comment}&rdquo;
                    </p>
                  )}
                  {/* Store Owner Official Response */}
                  {item.owner_reply && (
                    <div className="owner-reply-bubble">
                      <strong>🏬 Store Response:</strong>
                      <p>&ldquo;{item.owner_reply}&rdquo;</p>
                      {item.owner_replied_at && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>
                          Replied on {new Date(item.owner_replied_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  )}
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', display: 'block', marginTop: '0.35rem' }}>
                    Reviewed on {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="modal-actions">
            <Button variant="outline" onClick={() => setIsHistoryModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

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

export default UserDashboard;
