import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  getUsersApi,
  getUserByIdApi,
  createUserApi,
  deleteUserApi,
} from '../../api/users.api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import StarRating from '../../components/common/StarRating';
import useDebounce from '../../hooks/useDebounce';
import {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
} from '../../utils/validators';
import { exportUsersCsv } from '../../utils/export';
import { ROLES, ROUTES } from '../../utils/constants';

const INITIAL_FORM = {
  name: '',
  email: '',
  password: '',
  address: '',
  role: ROLES.NORMAL_USER,
};

const UserManagement = () => {
  // ── Table State ────────────────────────────────────────────────────
  const [users, setUsers] = useState([]);
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
    role: '',
  });

  const debouncedName = useDebounce(filters.name, 350);
  const debouncedEmail = useDebounce(filters.email, 350);
  const debouncedAddress = useDebounce(filters.address, 350);

  const [sort, setSort] = useState({
    column: 'created_at',
    order: 'desc',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // ── Modal States ───────────────────────────────────────────────────
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState(INITIAL_FORM);
  const [addErrors, setAddErrors] = useState({});
  const [addLoading, setAddLoading] = useState(false);
  const [addApiError, setAddApiError] = useState(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ── Data Fetching ──────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
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
      if (filters.role) params.role = filters.role;

      const res = await getUsersApi(params);
      const userList = res?.data?.users || res?.data || [];
      const meta = res?.data?.pagination || res?.meta || {
        page: pagination.page,
        limit: pagination.limit,
        total: userList.length,
        totalPages: 1,
      };

      setUsers(userList);
      setPagination(meta);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load users. Please try again.'
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
    filters.role,
  ]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ── Handlers ───────────────────────────────────────────────────────
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({ name: '', email: '', address: '', role: '' });
    setSort({ column: 'created_at', order: 'desc' });
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

  // ── Details Modal ──────────────────────────────────────────────────
  const handleViewDetails = async (userId) => {
    setIsDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const res = await getUserByIdApi(userId);
      setSelectedUser(res?.data || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch user details.');
      setIsDetailModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // ── Add User Flow ──────────────────────────────────────────────────
  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
    if (addErrors[name]) {
      setAddErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateAddForm = () => {
    const errs = {};
    const nameErr = validateName(addForm.name);
    if (nameErr) errs.name = nameErr;

    const emailErr = validateEmail(addForm.email);
    if (emailErr) errs.email = emailErr;

    const passErr = validatePassword(addForm.password);
    if (passErr) errs.password = passErr;

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
      await createUserApi(addForm);
      setIsAddModalOpen(false);
      setAddForm(INITIAL_FORM);
      setSuccessMsg(`User "${addForm.name}" created successfully!`);
      setTimeout(() => setSuccessMsg(null), 5000);
      fetchUsers();
    } catch (err) {
      setAddApiError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Failed to create user.'
      );
    } finally {
      setAddLoading(false);
    }
  };

  // ── Delete Flow ────────────────────────────────────────────────────
  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete user "${user.name}" (${user.email})?`
    );
    if (!confirmed) return;

    try {
      await deleteUserApi(user.id);
      setSuccessMsg(`User "${user.name}" was deleted successfully.`);
      setTimeout(() => setSuccessMsg(null), 5000);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  // ── Render Helpers ─────────────────────────────────────────────────
  const renderRoleBadge = (role) => {
    switch (role) {
      case ROLES.SYSTEM_ADMIN:
        return <span className="role-pill role-pill--admin">System Admin</span>;
      case ROLES.STORE_OWNER:
        return <span className="role-pill role-pill--owner">Store Owner</span>;
      case ROLES.NORMAL_USER:
      default:
        return <span className="role-pill role-pill--user">Normal User</span>;
    }
  };

  const renderSortIndicator = (column) => {
    if (sort.column !== column) return <span className="sort-icon">⇅</span>;
    return <span className="sort-icon active">{sort.order === 'asc' ? '▲' : '▼'}</span>;
  };

  return (
    <main className="dashboard-page">
      {/* Breadcrumb & Header */}
      <div className="dashboard__header-wrapper">
        <div>
          <Link to={ROUTES.ADMIN_DASHBOARD} className="back-link">
            ← Back to Dashboard
          </Link>
          <h1>User Management</h1>
          <p>Search, filter, sort, inspect, and add platform users</p>
        </div>
        <div className="dashboard__actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (users.length === 0) return;
              exportUsersCsv(users);
            }}
          >
            📥 Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setAddForm(INITIAL_FORM);
              setAddErrors({});
              setAddApiError(null);
              setIsAddModalOpen(true);
            }}
          >
            + Add New User
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
          <Button variant="danger" size="sm" onClick={fetchUsers}>
            Retry
          </Button>
        </div>
      )}

      {/* Search & Filter Controls */}
      <section className="filter-panel">
        <div className="filter-grid">
          <div className="filter-item">
            <label htmlFor="filter-name" className="filter-label">Filter by Name</label>
            <input
              id="filter-name"
              name="name"
              type="text"
              placeholder="Search name…"
              value={filters.name}
              onChange={handleFilterChange}
              className="form-input form-input--sm"
            />
          </div>

          <div className="filter-item">
            <label htmlFor="filter-email" className="filter-label">Filter by Email</label>
            <input
              id="filter-email"
              name="email"
              type="text"
              placeholder="Search email…"
              value={filters.email}
              onChange={handleFilterChange}
              className="form-input form-input--sm"
            />
          </div>

          <div className="filter-item">
            <label htmlFor="filter-address" className="filter-label">Filter by Address</label>
            <input
              id="filter-address"
              name="address"
              type="text"
              placeholder="Search address…"
              value={filters.address}
              onChange={handleFilterChange}
              className="form-input form-input--sm"
            />
          </div>

          <div className="filter-item">
            <label htmlFor="filter-role" className="filter-label">Filter by Role</label>
            <select
              id="filter-role"
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="form-input form-input--sm form-select"
            >
              <option value="">All Roles</option>
              <option value={ROLES.NORMAL_USER}>Normal User</option>
              <option value={ROLES.STORE_OWNER}>Store Owner</option>
              <option value={ROLES.SYSTEM_ADMIN}>System Admin</option>
            </select>
          </div>
        </div>

        {(filters.name || filters.email || filters.address || filters.role) && (
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

      {/* Users Table */}
      <section className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} className="sortable-header">
                Name {renderSortIndicator('name')}
              </th>
              <th onClick={() => handleSort('email')} className="sortable-header">
                Email {renderSortIndicator('email')}
              </th>
              <th onClick={() => handleSort('address')} className="sortable-header">
                Address {renderSortIndicator('address')}
              </th>
              <th onClick={() => handleSort('role')} className="sortable-header">
                Role {renderSortIndicator('role')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="table-loading">
                  <div className="spinner-wrapper">
                    <span className="spinner" />
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" className="table-empty">
                  <p>No users found matching your search criteria.</p>
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td className="table-cell-bold">{u.name}</td>
                  <td>{u.email}</td>
                  <td className="table-cell-truncate" title={u.address}>
                    {u.address || '—'}
                  </td>
                  <td>{renderRoleBadge(u.role)}</td>
                  <td>
                    <div className="table-actions">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(u.id)}
                      >
                        Details
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteUser(u)}
                      >
                        Delete
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
          itemLabel="users"
        />
      </section>

      {/* ── Add User Modal ────────────────────────────────────────────── */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New User"
      >
        <form onSubmit={handleAddSubmit} noValidate>
          {addApiError && (
            <div className="alert alert--error" role="alert">
              {addApiError}
            </div>
          )}

          <Input
            id="add-name"
            name="name"
            label="Full Name"
            placeholder="Johnathan Doe Administrator"
            value={addForm.name}
            onChange={handleAddChange}
            error={addErrors.name}
            helperText="Between 20 and 60 characters"
            required
          />

          <Input
            id="add-email"
            name="email"
            type="email"
            label="Email Address"
            placeholder="user@example.com"
            value={addForm.email}
            onChange={handleAddChange}
            error={addErrors.email}
            required
          />

          <Input
            id="add-password"
            name="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            value={addForm.password}
            onChange={handleAddChange}
            error={addErrors.password}
            helperText="8–16 chars, 1+ uppercase letter, 1+ special char"
            required
          />

          <Input
            id="add-address"
            name="address"
            label="Address"
            placeholder="123 Corporate Way, City, State"
            value={addForm.address}
            onChange={handleAddChange}
            error={addErrors.address}
            helperText="Maximum 400 characters"
            required
          />

          <div className="form-group">
            <label htmlFor="add-role" className="form-label">
              User Role <span className="form-required">*</span>
            </label>
            <select
              id="add-role"
              name="role"
              value={addForm.role}
              onChange={handleAddChange}
              className="form-input form-select"
            >
              <option value={ROLES.NORMAL_USER}>Normal User</option>
              <option value={ROLES.STORE_OWNER}>Store Owner (for store ownership)</option>
              <option value={ROLES.SYSTEM_ADMIN}>System Administrator</option>
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
            <Button
              type="submit"
              variant="primary"
              loading={addLoading}
            >
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── User Details Modal ────────────────────────────────────────── */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="User Details"
      >
        {detailLoading ? (
          <div className="spinner-wrapper">
            <span className="spinner" />
          </div>
        ) : selectedUser ? (
          <div className="user-details-card">
            <div className="user-details-header">
              <div className="user-details-avatar">
                {selectedUser.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h3>{selectedUser.name}</h3>
                <p className="user-details-email">{selectedUser.email}</p>
                <div style={{ marginTop: '4px' }}>
                  {renderRoleBadge(selectedUser.role)}
                </div>
              </div>
            </div>

            <div className="user-details-body">
              <div className="detail-row">
                <span className="detail-label">User ID:</span>
                <span className="detail-val">#{selectedUser.id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Address:</span>
                <span className="detail-val">{selectedUser.address || '—'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Registered On:</span>
                <span className="detail-val">
                  {new Date(selectedUser.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Store Owner specific analytics */}
            {selectedUser.role === ROLES.STORE_OWNER && (
              <div className="owner-store-summary">
                <h4>🏪 Owned Store & Rating Overview</h4>
                {selectedUser.store ? (
                  <div className="owner-store-box">
                    <div className="owner-store-title">
                      {selectedUser.store.name}
                    </div>
                    <p className="owner-store-addr">
                      📍 {selectedUser.store.address}
                    </p>
                    <div className="owner-store-stats">
                      <div className="owner-stat-pill">
                        <StarRating value={selectedUser.store.average_rating} size="sm" />
                        <span><strong>{selectedUser.store.average_rating.toFixed(2)} / 5</strong></span>
                      </div>
                      <div className="owner-stat-pill">
                        👥 Total Ratings: <strong>{selectedUser.store.total_ratings}</strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="no-store-notice">
                    No store has been assigned to this owner yet.
                  </p>
                )}
              </div>
            )}

            <div className="modal-actions" style={{ marginTop: 'var(--space-xl)' }}>
              <Button
                variant="outline"
                fullWidth
                onClick={() => setIsDetailModalOpen(false)}
              >
                Close Details
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </main>
  );
};

export default UserManagement;
