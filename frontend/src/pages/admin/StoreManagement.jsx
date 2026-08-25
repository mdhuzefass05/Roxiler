import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getStoresApi, getStoreByIdApi, createStoreApi, updateStoreApi, deleteStoreApi } from '../../api/stores.api';
import { getUsersApi } from '../../api/users.api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import StarRating from '../../components/common/StarRating';
import useDebounce from '../../hooks/useDebounce';
import useToast from '../../hooks/useToast';
import { exportStoresCsv } from '../../utils/export';
import { validateEmail, validateAddress } from '../../utils/validators';
import { ROLES, ROUTES } from '../../utils/constants';

const STORE_CATEGORIES = [
  'General',
  'Tech & Electronics',
  'Grocery & Mart',
  'Fashion & Boutique',
  'Cafe & Dining',
  'Services & Wellness',
];

const INITIAL_STORE_FORM = {
  name: '',
  email: '',
  address: '',
  category: 'General',
  owner_id: '',
};

const validateStoreName = (name) => {
  if (!name || !name.trim()) return 'Store name is required.';
  const len = name.trim().length;
  if (len < 20 || len > 60) return 'Store name must be between 20 and 60 characters.';
  return null;
};

const StoreManagement = () => {
  const toast = useToast();

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
    category: '',
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

  // ── Add Store Modal State ──────────────────────────────────────────
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState(INITIAL_STORE_FORM);
  const [addErrors, setAddErrors] = useState({});
  const [addLoading, setAddLoading] = useState(false);
  const [addApiError, setAddApiError] = useState(null);

  // ── Edit Store Modal State ─────────────────────────────────────────
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ id: null, ...INITIAL_STORE_FORM });
  const [editErrors, setEditErrors] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editApiError, setEditApiError] = useState(null);

  // ── Delete Confirmation Modal State ────────────────────────────────
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Store Details Modal State ──────────────────────────────────────
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [ownerOptions, setOwnerOptions] = useState([]);

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
      if (filters.category) params.category = filters.category;

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
    filters.category,
  ]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // ── Fetch Store Owner options for dropdown ─────────────────────────
  const loadStoreOwners = useCallback(async () => {
    try {
      const res = await getUsersApi({ role: ROLES.STORE_OWNER, limit: 100 });
      const owners = res?.data?.users || res?.data || [];
      setOwnerOptions(owners);
    } catch {
      // Non-blocking
    }
  }, []);

  useEffect(() => {
    loadStoreOwners();
  }, [loadStoreOwners]);

  // ── Handlers ───────────────────────────────────────────────────────
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({ name: '', email: '', address: '', category: '' });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSort = (column) => {
    setSort((prev) => ({
      column,
      order: prev.column === column && prev.order === 'asc' ? 'desc' : 'asc',
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const renderSortIndicator = (column) => {
    if (sort.column !== column) return <span className="sort-icon">⇅</span>;
    return <span className="sort-icon active">{sort.order === 'asc' ? '▲' : '▼'}</span>;
  };

  // ── Add Store Handlers ─────────────────────────────────────────────
  const handleOpenAddModal = () => {
    setAddForm(INITIAL_STORE_FORM);
    setAddErrors({});
    setAddApiError(null);
    setIsAddModalOpen(true);
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
    if (addErrors[name]) setAddErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateAddForm = () => {
    const errors = {};
    const nameErr = validateStoreName(addForm.name);
    if (nameErr) errors.name = nameErr;

    const emailErr = validateEmail(addForm.email);
    if (emailErr) errors.email = emailErr;

    const addrErr = validateAddress(addForm.address);
    if (addrErr) errors.address = addrErr;

    setAddErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateAddForm()) return;

    setAddLoading(true);
    setAddApiError(null);

    try {
      const payload = {
        name: addForm.name.trim(),
        email: addForm.email.trim(),
        address: addForm.address.trim(),
        category: addForm.category || 'General',
        owner_id: addForm.owner_id ? parseInt(addForm.owner_id, 10) : null,
      };

      await createStoreApi(payload);
      toast.success(`Store "${payload.name}" was registered successfully!`);
      setIsAddModalOpen(false);
      fetchStores();
    } catch (err) {
      setAddApiError(
        err.response?.data?.message || 'Failed to create store. Please check the details.'
      );
    } finally {
      setAddLoading(false);
    }
  };

  // ── Edit Store Handlers ────────────────────────────────────────────
  const handleOpenEditModal = (store) => {
    setEditForm({
      id: store.id,
      name: store.name || '',
      email: store.email || '',
      address: store.address || '',
      category: store.category || 'General',
      owner_id: store.owner_id ? String(store.owner_id) : '',
    });
    setEditErrors({});
    setEditApiError(null);
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    if (editErrors[name]) setEditErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateEditForm = () => {
    const errors = {};
    const nameErr = validateStoreName(editForm.name);
    if (nameErr) errors.name = nameErr;

    const emailErr = validateEmail(editForm.email);
    if (emailErr) errors.email = emailErr;

    const addrErr = validateAddress(editForm.address);
    if (addrErr) errors.address = addrErr;

    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateEditForm()) return;

    setEditLoading(true);
    setEditApiError(null);

    try {
      const payload = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        address: editForm.address.trim(),
        category: editForm.category || 'General',
        owner_id: editForm.owner_id ? parseInt(editForm.owner_id, 10) : null,
      };

      await updateStoreApi(editForm.id, payload);
      toast.success(`Store "${payload.name}" was updated successfully!`);
      setIsEditModalOpen(false);
      fetchStores();
    } catch (err) {
      setEditApiError(
        err.response?.data?.message || 'Failed to update store. Please try again.'
      );
    } finally {
      setEditLoading(false);
    }
  };

  // ── Delete Store Handlers ──────────────────────────────────────────
  const handleOpenDeleteModal = (store) => {
    setStoreToDelete(store);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!storeToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteStoreApi(storeToDelete.id);
      toast.success(`Store "${storeToDelete.name}" was deleted.`);
      setIsDeleteModalOpen(false);
      setStoreToDelete(null);
      fetchStores();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete store.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Detail Modal ───────────────────────────────────────────────────
  const handleOpenDetailModal = async (store) => {
    setSelectedStore(store);
    setIsDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const res = await getStoreByIdApi(store.id);
      if (res?.data) setSelectedStore(res.data);
    } catch {
      // Keep basic store data
    } finally {
      setDetailLoading(false);
    }
  };

  const handleExportCsv = () => {
    if (stores.length === 0) {
      toast.info('No stores to export.');
      return;
    }
    exportStoresCsv(stores);
    toast.success(`Exported ${stores.length} stores to CSV!`);
  };

  return (
    <main className="dashboard-page">
      {/* Header */}
      <div className="dashboard__header-wrapper">
        <div>
          <div className="dashboard__role-tag">SYSTEM ADMINISTRATOR</div>
          <h1>Store Directory Management</h1>
          <p>Register, modify, categorize, and oversee all business listings.</p>
        </div>
        <div className="dashboard__actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button variant="outline" size="sm" onClick={handleExportCsv}>
            📥 Export CSV
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenAddModal}>
            + Register New Store
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="nav-clay-pill" style={{ marginBottom: '2rem', height: '3.75rem' }} aria-label="Admin sub-navigation">
        <div className="nav-links">
          <Link to={ROUTES.ADMIN_DASHBOARD} className="nav-link">
            📊 Overview
          </Link>
          <Link to={ROUTES.ADMIN_USERS} className="nav-link">
            👥 User Management
          </Link>
          <Link to={ROUTES.ADMIN_STORES} className="nav-link nav-link--active">
            🏬 Store Management
          </Link>
        </div>
      </nav>

      {/* Error Alert */}
      {error && (
        <div className="alert alert--error" role="alert">
          <span>{error}</span>
          <Button variant="danger" size="sm" onClick={fetchStores}>
            Retry
          </Button>
        </div>
      )}

      {/* Search & Filter Panel */}
      <section className="filter-panel">
        <div className="filter-grid">
          <div className="filter-item">
            <label htmlFor="filter-store-name" className="filter-label">Store Name</label>
            <input
              id="filter-store-name"
              name="name"
              type="text"
              placeholder="Search by store name…"
              value={filters.name}
              onChange={handleFilterChange}
              className="form-input form-input--sm"
            />
          </div>

          <div className="filter-item">
            <label htmlFor="filter-store-email" className="filter-label">Store Email</label>
            <input
              id="filter-store-email"
              name="email"
              type="text"
              placeholder="Search by email…"
              value={filters.email}
              onChange={handleFilterChange}
              className="form-input form-input--sm"
            />
          </div>

          <div className="filter-item">
            <label htmlFor="filter-store-category" className="filter-label">Category</label>
            <select
              id="filter-store-category"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="form-input form-input--sm form-select"
            >
              <option value="">All Categories</option>
              {STORE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="filter-store-address" className="filter-label">Address / City</label>
            <input
              id="filter-store-address"
              name="address"
              type="text"
              placeholder="Search by address…"
              value={filters.address}
              onChange={handleFilterChange}
              className="form-input form-input--sm"
            />
          </div>
        </div>

        {(filters.name || filters.email || filters.address || filters.category) && (
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

      {/* Stores Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} className="sortable-header">
                Store Name {renderSortIndicator('name')}
              </th>
              <th>Category</th>
              <th onClick={() => handleSort('email')} className="sortable-header">
                Email {renderSortIndicator('email')}
              </th>
              <th>Address</th>
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
                    <p>Loading registered stores…</p>
                  </div>
                </td>
              </tr>
            ) : stores.length === 0 ? (
              <tr>
                <td colSpan="6" className="table-empty">
                  <div className="empty-state-card" style={{ padding: '2rem' }}>
                    <div className="empty-state-icon">🏬</div>
                    <h3>No Stores Found</h3>
                    <p>No stores matched your current search filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              stores.map((s) => (
                <tr key={s.id}>
                  <td className="table-cell-bold">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="customer-avatar-badge" style={{ background: 'var(--gradient-secondary)' }}>
                        🏬
                      </span>
                      <span>{s.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge--user" style={{ fontSize: '0.75rem' }}>
                      {s.category || 'General'}
                    </span>
                  </td>
                  <td>{s.email}</td>
                  <td className="table-cell-truncate" title={s.address}>
                    {s.address}
                  </td>
                  <td>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <StarRating value={s.average_rating} size="sm" />
                      <strong>{s.average_rating ? s.average_rating.toFixed(1) : '0.0'}</strong>
                      <span className="text-muted" style={{ fontSize: '0.8rem' }}>({s.total_ratings})</span>
                    </div>
                  </td>
                  <td>
                    <div className="action-btn-group">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDetailModal(s)}
                        title="View Details"
                      >
                        👁 View
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenEditModal(s)}
                        title="Edit Store"
                      >
                        ✏ Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleOpenDeleteModal(s)}
                        title="Delete Store"
                      >
                        🗑
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        {!loading && pagination.total > 0 && (
          <Pagination
            page={pagination.page}
            limit={pagination.limit}
            total={pagination.total}
            totalPages={pagination.totalPages}
            onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
            onLimitChange={(l) => setPagination((prev) => ({ ...prev, limit: l, page: 1 }))}
            itemLabel="stores"
          />
        )}
      </div>

      {/* ── Add Store Modal ─────────────────────────────────────────────── */}
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
            id="add-store-name"
            name="name"
            type="text"
            label="Store Name"
            placeholder="e.g. Apex Hypermarket & Electronics"
            value={addForm.name}
            onChange={handleAddChange}
            error={addErrors.name}
            helperText="Between 20 and 60 characters"
            required
          />

          <Input
            id="add-store-email"
            name="email"
            type="email"
            label="Store Email"
            placeholder="store@business.com"
            value={addForm.email}
            onChange={handleAddChange}
            error={addErrors.email}
            required
          />

          <div className="form-group">
            <label htmlFor="add-store-category" className="form-label">
              Category
            </label>
            <select
              id="add-store-category"
              name="category"
              value={addForm.category}
              onChange={handleAddChange}
              className="form-input form-select"
            >
              {STORE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <Input
            id="add-store-address"
            name="address"
            type="text"
            label="Store Address"
            placeholder="123 Market Square, Suite 100"
            value={addForm.address}
            onChange={handleAddChange}
            error={addErrors.address}
            helperText="Maximum 400 characters"
            required
          />

          <div className="form-group">
            <label htmlFor="add-store-owner" className="form-label">
              Assigned Store Owner (Optional)
            </label>
            <select
              id="add-store-owner"
              name="owner_id"
              value={addForm.owner_id}
              onChange={handleAddChange}
              className="form-input form-select"
            >
              <option value="">— Select a Store Owner (Optional) —</option>
              {ownerOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.email})
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={addLoading}>
              Register Store
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Edit Store Modal ────────────────────────────────────────────── */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Store: ${editForm.name}`}
      >
        <form onSubmit={handleEditSubmit} noValidate>
          {editApiError && (
            <div className="alert alert--error" role="alert">
              {editApiError}
            </div>
          )}

          <Input
            id="edit-store-name"
            name="name"
            type="text"
            label="Store Name"
            value={editForm.name}
            onChange={handleEditChange}
            error={editErrors.name}
            helperText="Between 20 and 60 characters"
            required
          />

          <Input
            id="edit-store-email"
            name="email"
            type="email"
            label="Store Email"
            value={editForm.email}
            onChange={handleEditChange}
            error={editErrors.email}
            required
          />

          <div className="form-group">
            <label htmlFor="edit-store-category" className="form-label">
              Category
            </label>
            <select
              id="edit-store-category"
              name="category"
              value={editForm.category}
              onChange={handleEditChange}
              className="form-input form-select"
            >
              {STORE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <Input
            id="edit-store-address"
            name="address"
            type="text"
            label="Store Address"
            value={editForm.address}
            onChange={handleEditChange}
            error={editErrors.address}
            helperText="Maximum 400 characters"
            required
          />

          <div className="form-group">
            <label htmlFor="edit-store-owner" className="form-label">
              Assigned Store Owner
            </label>
            <select
              id="edit-store-owner"
              name="owner_id"
              value={editForm.owner_id}
              onChange={handleEditChange}
              className="form-input form-select"
            >
              <option value="">— Unassigned —</option>
              {ownerOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.email})
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={editLoading}>
              Save Store Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirmation Modal ───────────────────────────────────── */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Store Deletion"
      >
        <div style={{ padding: '1rem 0' }}>
          <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>
            Are you sure you want to permanently delete <strong>{storeToDelete?.name}</strong>?
          </p>
          <p className="text-muted" style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
            ⚠️ This will remove the store and all associated customer ratings. This action cannot be undone.
          </p>
        </div>

        <div className="modal-actions">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDeleteConfirm}
            loading={deleteLoading}
          >
            Delete Store
          </Button>
        </div>
      </Modal>

      {/* ── Store Details Modal ─────────────────────────────────────────── */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Store Information"
      >
        {selectedStore && (
          <div>
            <div className="detail-modal-grid">
              <div className="detail-field">
                <span className="detail-label">Store ID</span>
                <span className="detail-val">#{selectedStore.id}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Category</span>
                <span className="detail-val">{selectedStore.category || 'General'}</span>
              </div>
              <div className="detail-field" style={{ gridColumn: 'span 2' }}>
                <span className="detail-label">Store Name</span>
                <span className="detail-val">{selectedStore.name}</span>
              </div>
              <div className="detail-field" style={{ gridColumn: 'span 2' }}>
                <span className="detail-label">Store Email</span>
                <span className="detail-val">{selectedStore.email}</span>
              </div>
              <div className="detail-field" style={{ gridColumn: 'span 2' }}>
                <span className="detail-label">Store Address</span>
                <span className="detail-val">{selectedStore.address}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Overall Rating</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <StarRating value={selectedStore.average_rating} size="sm" />
                  <strong>{selectedStore.average_rating ? selectedStore.average_rating.toFixed(1) : '0.0'}</strong>
                </div>
              </div>
              <div className="detail-field">
                <span className="detail-label">Total Reviews</span>
                <span className="detail-val">{selectedStore.total_ratings || 0}</span>
              </div>
            </div>

            <div className="modal-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
};

export default StoreManagement;
