import useAuth from '../../hooks/useAuth';

/**
 * UserDashboard — Placeholder for NORMAL_USER role.
 * Full store listing + rating implementation in Phase 3.
 */
const UserDashboard = () => {
  const { user } = useAuth();

  return (
    <main className="dashboard-page">
      <div className="dashboard__header">
        <h1>Browse Stores</h1>
        <p>Hello, <strong>{user?.name}</strong>! Discover and rate stores.</p>
      </div>

      <div className="coming-soon">
        <p>🚧 Store listing and rating features coming in Phase 3.</p>
      </div>
    </main>
  );
};

export default UserDashboard;
