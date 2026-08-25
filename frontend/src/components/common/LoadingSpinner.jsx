/**
 * LoadingSpinner — Simple animated spinner.
 *
 * @param {boolean} fullPage - If true, centers spinner in the full viewport
 */
const LoadingSpinner = ({ fullPage = false }) => {
  return (
    <div className={fullPage ? 'spinner-overlay' : 'spinner-wrapper'}>
      <div className="spinner" role="status" aria-label="Loading...">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
