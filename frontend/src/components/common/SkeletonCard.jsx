const SkeletonCard = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="store-card skeleton-card">
          <div className="skeleton-card__banner shimmer-block" />
          <div style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div className="skeleton-avatar shimmer-block" />
              <div style={{ flex: 1 }}>
                <div className="skeleton-line shimmer-block" style={{ width: '70%', height: '1.2rem', marginBottom: '0.4rem' }} />
                <div className="skeleton-line shimmer-block" style={{ width: '40%', height: '0.8rem' }} />
              </div>
            </div>

            <div className="skeleton-box shimmer-block" style={{ height: '70px', borderRadius: '18px', marginBottom: '0.8rem' }} />
            <div className="skeleton-box shimmer-block" style={{ height: '42px', borderRadius: '16px', marginBottom: '1rem' }} />
            <div className="skeleton-box shimmer-block" style={{ height: '40px', borderRadius: '16px' }} />
          </div>
        </div>
      ))}
    </>
  );
};

export default SkeletonCard;
