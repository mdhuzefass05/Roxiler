import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getStoresApi, getStoreByIdApi, createStoreApi } from '../../api/stores.api';
import { getUsersApi } from '../../api/users.api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import StarRating from '../../components/common/StarRating';
import useDebounce from '../../hooks/useDebounce';
import { validateEmail, validateAddress } from '../../utils/validators';
import { ROLES, ROUTES } from '../../utils/constants';

const INITIAL_STORE_FORM = {
  name: '',
  email: '',
  address: '',
  owner_id: '',
};

const validateStoreName = (name) => {
  if (!name || !name.trim()) return 'Store name is required.';
  const len = name.trim().length;
  if (len < 20 || len > 60) return 'Store name must be between 20 and 60 characters.';
  return null;
};

const StoreManagement = () => {
  // ── Table State ────────────────────────────────────────────────────
  const [stores, setStores] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: '',
  });

  const debouncedName = useDebounce(filters.name, 350);
  const debouncedEmail = useDebounce(filters.email, 350);
  const debouncedAddress = useDebounce(filters.address, 350);

  const [sort, setSort] = useState({
    column: 'name',
    order: 'asc',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // ── Add Store Modal State ──────────────────────────────────────────
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState(INITIAL_STORE_FORM);
  const [addErrors, setAddErrors] = useState({});
  const [addLoading, setAddLoading] = useState(false);
  const [addApiError, setAddApiError] = useState(null);
  const [ownerOptions, setOwnerOptions] = useState([]);
  const [ownerLoading, setOwnerLoading] = useState(false);

  // ── Store Details Modal State ──────────────────────────────────────
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

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
      if (debouncedEmail.trim()) params.email = debouncedEmail.trim();
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
    debouncedEmail,
    debouncedAddress,
  ]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // ── Fetch Store Owner options for dropdown ─────────────────────────
  const loadStoreOwners = useCallback(async () => {
    setOwnerLoading(true);
    try {
      const res = await getUsersApi({ role: ROLES.STORE_OWNER, limit: 100 });
      const userList = res?.data?.users || res?.data || [];
      setOwnerOptions(userList);
    } catch {
      setOwnerOptions([]);
    } finally {
      setOwnerLoading(false);
    }
  }, []);

  // ── Filter & Sort Handlers ─────────────────────────────────────────
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({ name: '', email: '', address: '' });
    setSort({ column: 'name', order: 'asc' });
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

  // ── Store Details Flow ─────────────────────────────────────────────
  const handleViewDetails = async (storeId) => {
    setIsDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const res = await getStoreByIdApi(storeId);
      setSelectedStore(res?.data || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch store details.');
      setIsDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // ── Add Store Flow ─────────────────────────────────────────────────
  const handleOpenAddModal = () => {
    setAddForm(INITIAL_STORE_FORM);
    setAddErrors({});
    setAddApiError(null);
    setIsAddModalOpen(true);
    loadStoreOwners();
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
    if (addErrors[name]) {
      setAddErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateAddForm = () => {
    const errs = {};
    const nameErr = validateStoreName(addForm.name);
    if (nameErr) errs.name = nameErr;

    const emailErr = validateEmail(addForm.email);
    if (emailErr) errs.email = emailErr;

    const addrErr = validateAddress(addForm.address);
    if (addrErr) errs.address = addrErr;

    setAddErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateAddForm()) return;

    setAddLoading(true);
    setAddApiError(null);
    try {
      const payload = {
        name: addForm.name,
        email: addForm.email,
        address: addForm.address,
        owner_id: addForm.owner_id ? parseInt(addForm.owner_id, 10) : null,
      };

      await createStoreApi(payload);
      setIsAddModalOpen(false);
      setAddForm(INITIAL_STORE_FORM);
      setSuccessMsg(`Store "${payload.name}" was registered successfully!`);
      setTimeout(() => setSuccessMsg(null), 5000);
      fetchStores();
    } catch (err) {
      setAddApiError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Failed to create store.'
      );
    } finally {
      setAddLoading(false);
    }
  };

  const renderSortIndicator = (column) => {
    if (sort.column !== column) return <span className="sort-icon">⇅</span>;
    return <span className="sort-icon active">{sort.order === 'asc' ? '▲' : '▼'}</span>;
  };

  return (
    <main className="dashboard-page">
      {/* Header */}
      <div className="dashboard__header-wrapper">
        <div>
          <Link to={ROUTES.ADMIN_DASHBOARD} className="back-link">
            ← Back to Dashboard
          </Link>
          <h1>Store Management</h1>
          <p>Register new stores, link store owners, and monitor customer ratings</p>
        </div>
        <div className="dashboard__actions">
          <Button variant="primary" onClick={handleOpenAddModal}>
            + Add New Store
          </Button>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="alert alert--success" role="alert">
          {successMsg}
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

      {/* Search & Filter Controls */}
      <section className="filter-panel">
        <div className="filter-grid">
          <div className="filter-item">
            <label htmlFor="filter-store-name" className="filter-label">Search Store Name</label>
            <input
              id="filter-store-name"
              name="name"
              type="text"
              placeholder="Search store name…"
              value={filters.name}
              onChange={handleFilterChange}
              className="form-input form-input--sm"
            />
          </div>

          <div className="filter-item">
            <label htmlFor="filter-store-email" className="filter-label">Search Store Email</label>
            <input
              id="filter-store-email"
              name="email"
              type="text"
              placeholder="Search store email…"
              value={filters.email}
              onChange={handleFilterChange}
              className="form-input form-input--sm"
            />
          </div>

          <div className="filter-item">
            <label htmlFor="filter-store-address" className="filter-label">Search Address</label>
            <input
              id="filter-store-address"
              name="address"
              type="text"
              placeholder="Search address or city…"
              value={filters.address}
              onChange={handleFilterChange}
              className="form-input form-input--sm"
            />
          </div>
        </div>

        {(filters.name || filters.email || filters.address) && (
          <div className="filter-actions">
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={handleResetFilters}
            >
              ✕ Clear Filters
            </button>
          </div>
        )}
      </section>

      {/* Stores Table */}
      <section className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} className="sortable-header">
                Store Name {renderSortIndicator('name')}
              </th>
              <th onClick={() => handleSort('email')} className="sortable-header">
                Email {renderSortIndicator('email')}
              </th>
              <th onClick={() => handleSort('address')} className="sortable-header">
                Address {renderSortIndicator('address')}
              </th>
              <th>Assigned Owner</th>
              <th onClick={() => handleSort('rating')} className="sortable-header">
                Overall Rating {renderSortIndicator('rating')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="table-loading">
                  <div className="spinner-wrapper">
                    <span className="spinner" />
                  </div>
                </td>
              </tr>
            ) : stores.length === 0 ? (
              <tr>
                <td colSpan="6" className="table-empty">
                  <p>No stores found matching your search criteria.</p>
                </td>
              </tr>
            ) : (
              stores.map((s) => (
                <tr key={s.id}>
                  <td className="table-cell-bold">{s.name}</td>
                  <td>{s.email}</td>
                  <td className="table-cell-truncate" title={s.address}>
                    {s.address}
                  </td>
                  <td>
                    {s.owner_name ? (
                      <span className="role-pill role-pill--owner" title={s.owner_email}>
                        👤 {s.owner_name}
                      </span>
                    ) : (
                      <span className="no-owner-text">Unassigned</span>
                    )}
                  </td>
                  <td>
                    <div className="store-rating-cell">
                      <StarRating
                        value={s.average_rating}
                        size="sm"
                        showNumber
                        totalCount={s.total_ratings}
                      />
                    </div>
                  </td>
                  <td>
                    <div className="table-actions">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(s.id)}
                      >
                        Details
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Reusable Pagination Component */}
        <Pagination
          page={pagination.page}
          limit={pagination.limit}
          total={pagination.total}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          itemLabel="stores"
        />
      </section>

      {/* ── Add Store Modal ───────────────────────────────────────────── */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Store"
      >
        <form onSubmit={handleAddSubmit} noValidate>
          {addApiError && (
            <div className="alert alert--error" role="alert">
              {addApiError}
            </div>
          )}

          <Input
            id="store-name"
            name="name"
            label="Store Name"
            placeholder="e.g. Apex Hardware Supplies Mega"
            value={addForm.name}
            onChange={handleAddChange}
            error={addErrors.name}
            helperText="Must be 20 to 60 characters"
            required
          />

          <Input
            id="store-email"
            name="email"
            type="email"
            label="Store Email Address"
            placeholder="store.contact@example.com"
            value={addForm.email}
            onChange={handleAddChange}
            error={addErrors.email}
            required
          />

          <Input
            id="store-address"
            name="address"
            label="Physical Store Address"
            placeholder="123 Commercial Plaza, Suite 100, City, State"
            value={addForm.address}
            onChange={handleAddChange}
            error={addErrors.address}
            helperText="Maximum 400 characters"
            required
          />

          <div className="form-group">
            <label htmlFor="store-owner" className="form-label">
              Assign Store Owner (Optional)
            </label>
            <select
              id="store-owner"
              name="owner_id"
              value={addForm.owner_id}
              onChange={handleAddChange}
              className="form-input form-select"
              disabled={ownerLoading}
            >
              <option value="">— Select a Store Owner (Optional) —</option>
              {ownerOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.email})
                </option>
              ))}
            </select>
            <p className="form-helper-text">
              Only verified STORE_OWNER accounts appear in this list.
            </p>
          </div>

          <div className="modal-actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={addLoading}
            >
              Register Store
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Store Details Modal ───────────────────────────────────────── */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Store Profile & Details"
      >
        {detailLoading ? (
          <div className="spinner-wrapper">
            <span className="spinner" />
          </div>
        ) : selectedStore ? (
          <div className="user-details-card">
            <div className="user-details-header">
              <div className="user-details-avatar" style={{ background: 'linear-gradient(135deg, #f59e0b, #ec4899)' }}>
                🏪
              </div>
              <div>
                <h3>{selectedStore.name}</h3>
                <p className="user-details-email">{selectedStore.email}</p>
                <div style={{ marginTop: '4px' }}>
                  <span className="role-pill role-pill--owner">Active Store</span>
                </div>
              </div>
            </div>

            <div className="user-details-body">
              <div className="detail-row">
                <span className="detail-label">Store ID:</span>
                <span className="detail-val">#{selectedStore.id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Address:</span>
                <span className="detail-val">{selectedStore.address}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Assigned Owner:</span>
                <span className="detail-val">
                  {selectedStore.owner_name
                    ? `${selectedStore.owner_name} (${selectedStore.owner_email})`
                    : 'None Assigned'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Registered Date:</span>
                <span className="detail-val">
                  {new Date(selectedStore.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Live Rating Analytics Box */}
            <div className="owner-store-summary">
              <h4>⭐ Real-Time Rating Analytics</h4>
              <div className="store-analytics-box">
                <div className="store-analytics-score">
                  <span className="big-rating-number">
                    {selectedStore.average_rating > 0 ? selectedStore.average_rating.toFixed(2) : '0.00'}
                  </span>
                  <span className="big-rating-max">/ 5.0</span>
                </div>
                <StarRating value={selectedStore.average_rating} size="lg" />
                <p className="store-analytics-count">
                  Based on <strong>{selectedStore.total_ratings}</strong> verified customer reviews.
                </p>
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: 'var(--space-xl)' }}>
              <Button
                variant="outline"
                fullWidth
                onClick={() => setIsDetailModalOpen(false)}
              >
                Close Store Details
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </main>
  );
};

export default StoreManagement;
