import Button from './Button';

/**
 * Reusable Pagination Bar Component
 */
const Pagination = ({
  page = 1,
  limit = 10,
  total = 0,
  totalPages = 1,
  onPageChange,
  onLimitChange,
  itemLabel = 'records',
}) => {
  if (total === 0) return null;

  const startRecord = (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  return (
    <div className="pagination-bar">
      <div className="pagination-info">
        Showing <strong>{startRecord}–{endRecord}</strong> of <strong>{total}</strong> {itemLabel}
      </div>

      <div className="pagination-controls">
        {onLimitChange && (
          <div className="pagination-limit-wrapper">
            <span className="pagination-limit-label">Per page:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(parseInt(e.target.value, 10))}
              className="pagination-limit-select"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous Page"
        >
          ◀ Previous
        </Button>

        <span className="pagination-current">
          Page <strong>{page}</strong> of <strong>{totalPages || 1}</strong>
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next Page"
        >
          Next ▶
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
