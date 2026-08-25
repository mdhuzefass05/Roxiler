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
import SkeletonTable from '../../components/common/SkeletonTable';
import useDebounce from '../../hooks/useDebounce';
import useToast from '../../hooks/useToast';
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
  const toast = useToast();

  // ── Table State ────────────────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
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

  // ── Modal State: Add User ──────────────────────────────────────────
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState(INITIAL_FORM);
  const [addErrors, setAddErrors] = useState({});
  const [addLoading, setAddLoading] = useState(false);
  const [addApiError, setAddApiError] = useState(null);

  // ── Modal State: User Details ──────────────────────────────────────
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ── Fetch Users ────────────────────────────────────────────────────
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
        err.response?.data?.message ||
        'Failed to load users. Please try again.'
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

  // ── Filter Handlers ────────────────────────────────────────────────
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({ name: '', email: '', address: '', role: '' });
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

  // ── Multi-Selection Handlers ───────────────────────────────────────
  const handleToggleSelectAll = () => {
    if (selectedIds.length === users.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(users.map((u) => u.id));
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExportSelected = () => {
    const selectedUsers = users.filter((u) => selectedIds.includes(u.id));
    if (selectedUsers.length === 0) return;
    exportUsersCsv(selectedUsers);
    toast.success(`Exported ${selectedUsers.length} selected users to CSV!`);
    setSelectedIds([]);
  };

  // ── View Details Flow ──────────────────────────────────────────────
  const handleViewDetails = async (userId) => {
    setIsDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const res = await getUserByIdApi(userId);
      setSelectedUser(res?.data || null);
    } catch {
      setError('Failed to fetch user details.');
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

    const addressErr = validateAddress(addForm.address);
    if (addressErr) errs.address = addressErr;

    const passwordErr = validatePassword(addForm.password);
    if (passwordErr) errs.password = passwordErr;

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
      toast.success(`User "${addForm.name}" created successfully!`);
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
  const handleDeleteUser = async (userToDelete) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete user "${userToDelete.name}" (${userToDelete.email})?`
    );
    if (!confirmed) return;

    try {
      await deleteUserApi(userToDelete.id);
      toast.success(`User "${userToDelete.name}" was deleted successfully.`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const renderRoleBadge = (role) => {
    switch (role) {
      case ROLES.SYSTEM_ADMIN:
        return <span className="badge badge--admin">System Admin</span>;
      case ROLES.STORE_OWNER:
        return <span className="badge badge--owner">Store Owner</span>;
      case ROLES.NORMAL_USER:
      default:
        return <span className="badge badge--user">Normal User</span>;
    }
  };

  const renderSortIndicator = (column) => {
    if (sort.column !== column) return <span className="sort-icon">⇅</span>;
    return <span className="sort-icon active">{sort.order === 'asc' ? '▲' : '▼'}</span>;
  };

  const isAllSelected = users.length > 0 && selectedIds.length === users.length;

  return (
    <main className="dashboard-page">
      {/* Breadcrumb & Header */}
      <div className="dashboard__header-wrapper">
        <div>
          <Link to={ROUTES.ADMIN_DASHBOARD} className="back-link">
            ← Back to Dashboard
          </Link>
          <h1>User Management</h1>
          <p>Search, filter, sort, inspect, and register platform users</p>
        </div>
        <div className="dashboard__actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (users.length === 0) return;
              exportUsersCsv(users);
              toast.success(`Exported ${users.length} users to CSV!`);
            }}
          >
            📥 Export All CSV
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
              placeholder="Search full name…"
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
              placeholder="Search email address…"
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
              <th style={{ width: '40px' }}>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleToggleSelectAll}
                  aria-label="Select all users on page"
                  style={{ width: '1.1rem', height: '1.1rem', accentColor: 'var(--color-accent-violet)' }}
                />
              </th>
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
              <SkeletonTable rows={5} cols={6} />
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="6" className="table-empty">
                  <p>No users found matching your search criteria.</p>
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isSelected = selectedIds.includes(u.id);
                return (
                  <tr key={u.id} style={{ background: isSelected ? 'rgba(124, 58, 237, 0.06)' : undefined }}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(u.id)}
                        aria-label={`Select ${u.name}`}
                        style={{ width: '1.1rem', height: '1.1rem', accentColor: 'var(--color-accent-violet)' }}
                      />
                    </td>
                    <td className="table-cell-bold">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="customer-avatar-badge">
                          {u.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                        <span>{u.name}</span>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td className="table-cell-truncate" title={u.address}>
                      {u.address || '—'}
                    </td>
                    <td>{renderRoleBadge(u.role)}</td>
                    <td>
                      <div className="action-btn-group">
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
                );
              })
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
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            itemLabel="users"
          />
        )}
      </section>

      {/* Floating Bulk Action Toolbar */}
      {selectedIds.length > 0 && (
        <div className="bulk-toolbar">
          <div className="bulk-toolbar__inner">
            <span style={{ fontWeight: 800 }}>📌 {selectedIds.length} users selected</span>
            <Button variant="primary" size="sm" onClick={handleExportSelected}>
              📥 Export Selected ({selectedIds.length})
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSelectedIds([])}>
              ✕ Deselect All
            </Button>
          </div>
        </div>
      )}

      {/* ── Add User Modal ──────────────────────────────────────────────── */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Platform User"
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
            type="text"
            label="Full Name"
            placeholder="Johnathan Doe Customer"
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
            placeholder="Min 8 chars, 1 uppercase, 1 special char"
            value={addForm.password}
            onChange={handleAddChange}
            error={addErrors.password}
            helperText="8–16 chars, 1 uppercase, 1 special character"
            required
          />

          <Input
            id="add-address"
            name="address"
            type="text"
            label="Address"
            placeholder="123 Shopping Avenue, Suite 400"
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
              <option value={ROLES.NORMAL_USER}>Normal User (Customer)</option>
              <option value={ROLES.STORE_OWNER}>Store Owner</option>
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
            <Button type="submit" variant="primary" loading={addLoading}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── User Details Modal ──────────────────────────────────────────── */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedUser(null);
        }}
        title="User Account Details"
      >
        {detailLoading ? (
          <div className="spinner-wrapper" style={{ padding: '2rem' }}>
            <span className="spinner" />
          </div>
        ) : selectedUser ? (
          <div>
            <div className="detail-modal-grid">
              <div className="detail-field">
                <span className="detail-label">User ID</span>
                <span className="detail-val">#{selectedUser.id}</span>
              </div>
              <div className="detail-field">
                <span className="detail-label">Role</span>
                <span className="detail-val">{renderRoleBadge(selectedUser.role)}</span>
              </div>
              <div className="detail-field" style={{ gridColumn: 'span 2' }}>
                <span className="detail-label">Full Name</span>
                <span className="detail-val">{selectedUser.name}</span>
              </div>
              <div className="detail-field" style={{ gridColumn: 'span 2' }}>
                <span className="detail-label">Email Address</span>
                <span className="detail-val">{selectedUser.email}</span>
              </div>
              <div className="detail-field" style={{ gridColumn: 'span 2' }}>
                <span className="detail-label">Address</span>
                <span className="detail-val">{selectedUser.address || '—'}</span>
              </div>
              {selectedUser.role === ROLES.STORE_OWNER && selectedUser.store && (
                <div className="detail-field" style={{ gridColumn: 'span 2' }}>
                  <span className="detail-label">Owned Store</span>
                  <span className="detail-val">
                    {selectedUser.store.name} — Rating: {selectedUser.store.rating || 'N/A'} ★
                  </span>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedUser(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </main>
  );
};

export default UserManagement;
