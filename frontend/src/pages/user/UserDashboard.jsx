import { useState, useEffect, useCallback } from 'react';
import { getStoresApi } from '../../api/stores.api';
import { submitRatingApi, updateRatingApi } from '../../api/ratings.api';
import useAuth from '../../hooks/useAuth';
import useDebounce from '../../hooks/useDebounce';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import StarRating from '../../components/common/StarRating';

const RATING_LABELS = {
  1: '1 Star — Poor',
  2: '2 Stars — Fair',
  3: '3 Stars — Good',
  4: '4 Stars — Very Good',
  5: '5 Stars — Excellent',
};

const UserDashboard = () => {
  const { user } = useAuth();

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
  });

  const debouncedName = useDebounce(filters.name, 350);
  const debouncedAddress = useDebounce(filters.address, 350);

  const [sort, setSort] = useState({
    column: 'name',
    order: 'asc',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // ── Rating Modal State ─────────────────────────────────────────────
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedScore, setSelectedScore] = useState(5);
  const [isModifying, setIsModifying] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingError, setRatingError] = useState(null);

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

      const res = await getStoresApi(params);
      const storeList = res?.data?.stores || res?.data || [];
      const meta = res?.data?.pagination || res?.meta || {
        page: pagination.page,
        limit: pagination.limit,
        total: storeList.length,
        totalPages: 1,
      };

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
  ]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // ── Filter & Sort Handlers ─────────────────────────────────────────
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({ name: '', address: '' });
    setSort({ column: 'name', order: 'asc' });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (e) => {
    const [column, order] = e.target.value.split(':');
    setSort({ column, order });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit) => {
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
  };

  // ── Rating Actions ─────────────────────────────────────────────────
  const handleOpenRatingModal = (store) => {
    setSelectedStore(store);
    const hasRated = store.user_rating !== null && store.user_rating !== undefined;
    setIsModifying(hasRated);
    setSelectedScore(hasRated ? store.user_rating : 5);
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
        await updateRatingApi(selectedStore.id, selectedScore);
        setFeedbackMsg(`Your rating for "${selectedStore.name}" was updated to ${selectedScore} stars!`);
      } else {
        await submitRatingApi({
          store_id: selectedStore.id,
          rating_value: selectedScore,
        });
        setFeedbackMsg(`Thank you! Your ${selectedScore}-star rating for "${selectedStore.name}" was submitted.`);
      }

      // Optimistic update
      setStores((prevStores) =>
        prevStores.map((s) => {
          if (s.id === selectedStore.id) {
            const oldRating = s.user_rating;
            const isNew = oldRating === null || oldRating === undefined;
            const newTotalCount = isNew ? s.total_ratings + 1 : s.total_ratings;
            const oldSum = (s.average_rating || 0) * (s.total_ratings || 0);
            const newSum = isNew ? oldSum + selectedScore : oldSum - (oldRating || 0) + selectedScore;
            const newAvg = newTotalCount > 0 ? parseFloat((newSum / newTotalCount).toFixed(2)) : selectedScore;

            return {
              ...s,
              user_rating: selectedScore,
              average_rating: newAvg,
              total_ratings: newTotalCount,
            };
          }
          return s;
        })
      );

      setIsRatingModalOpen(false);
      setTimeout(() => setFeedbackMsg(null), 5000);
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

  return (
    <main className="dashboard-page">
      {/* Header */}
      <div className="dashboard__header-wrapper">
        <div>
          <span className="dashboard__role-tag">Customer Portal</span>
          <h1>Explore & Rate Stores</h1>
          <p>
            Welcome, <strong>{user?.name}</strong>! Discover local stores and share your authentic ratings.
          </p>
        </div>
      </div>

      {/* Success Notification */}
      {feedbackMsg && (
        <div className="alert alert--success" role="alert">
          {feedbackMsg}
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="alert alert--error" role="alert">
          <span>{error}</span>
          <Button variant="danger" size="sm" onClick={fetchStores}>
            Retry
          </Button>
        </div>
      )}

      {/* Search & Sort Panel */}
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

        {(filters.name || filters.address) && (
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
      </section>

      {/* Stores Grid / Cards Layout */}
      {loading ? (
        <div className="stores-loading-state">
          <div className="spinner-wrapper">
            <span className="spinner" />
          </div>
          <p>Loading registered stores…</p>
        </div>
      ) : stores.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-state-icon">🏬</div>
          <h3>No Stores Found</h3>
          <p>No registered businesses matched your current search filters.</p>
          {(filters.name || filters.address) && (
            <Button variant="outline" size="sm" onClick={handleResetFilters} style={{ marginTop: 'var(--space-md)' }}>
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <section className="stores-grid">
          {stores.map((s) => {
            const hasUserRated = s.user_rating !== null && s.user_rating !== undefined;

            return (
              <article key={s.id} className="store-card">
                <div className="store-card__header">
                  <div className="store-card__icon">🏪</div>
                  <div className="store-card__title-wrap">
                    <h2 className="store-card__name">{s.name}</h2>
                    <p className="store-card__address">📍 {s.address}</p>
                  </div>
                </div>

                <div className="store-card__body">
                  {/* Overall Store Rating */}
                  <div className="store-card__metric-row">
                    <span className="store-metric-label">Overall Rating:</span>
                    <div className="store-metric-val">
                      <StarRating
                        value={s.average_rating}
                        size="md"
                        showNumber
                        totalCount={s.total_ratings}
                      />
                    </div>
                  </div>

                  {/* Authenticated User Rating Status */}
                  <div className="store-card__metric-row user-rating-row">
                    <span className="store-metric-label">Your Rating:</span>
                    <div className="store-metric-val">
                      {hasUserRated ? (
                        <div className="my-rating-badge">
                          <StarRating value={s.user_rating} size="sm" />
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
              </article>
            );
          })}
        </section>
      )}

      {/* Pagination Footer */}
      {!loading && pagination.total > 0 && (
        <div style={{ marginTop: 'var(--space-xl)' }}>
          <Pagination
            page={pagination.page}
            limit={pagination.limit}
            total={pagination.total}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
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

              <div className="rating-store-summary-box">
                <div className="summary-row">
                  <span>Store:</span>
                  <strong>{selectedStore.name}</strong>
                </div>
                <div className="summary-row">
                  <span>Address:</span>
                  <span>{selectedStore.address}</span>
                </div>
                <div className="summary-row">
                  <span>Current Overall Rating:</span>
                  <span>{selectedStore.average_rating > 0 ? `${selectedStore.average_rating.toFixed(1)} / 5.0 (${selectedStore.total_ratings} reviews)` : 'No ratings yet'}</span>
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
    </main>
  );
};

export default UserDashboard;
