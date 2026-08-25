/**
 * StarRating — visual star display component.
 *
 * Supports readonly mode (for displaying overall/average ratings with decimals)
 * and interactive mode (for submitting/modifying ratings 1 to 5).
 */
const StarRating = ({
  value = 0,
  max = 5,
  interactive = false,
  onChange,
  size = 'md', // 'sm' | 'md' | 'lg'
  showNumber = false,
  totalCount = null,
}) => {
  const numericValue = parseFloat(value) || 0;

  const handleStarClick = (starIndex) => {
    if (interactive && onChange) {
      onChange(starIndex);
    }
  };

  return (
    <div className={`star-rating star-rating--${size} ${interactive ? 'star-rating--interactive' : ''}`}>
      <div className="star-rating__stars" aria-label={`Rating: ${numericValue} out of ${max}`}>
        {Array.from({ length: max }, (_, index) => {
          const starNumber = index + 1;
          const isFilled = starNumber <= Math.round(numericValue);

          return (
            <button
              key={index}
              type="button"
              className={`star-btn ${isFilled ? 'star-btn--filled' : 'star-btn--empty'}`}
              disabled={!interactive}
              onClick={() => handleStarClick(starNumber)}
              title={interactive ? `Rate ${starNumber} star${starNumber > 1 ? 's' : ''}` : undefined}
            >
              ★
            </button>
          );
        })}
      </div>

      {showNumber && (
        <span className="star-rating__score">
          {numericValue > 0 ? numericValue.toFixed(1) : 'Not Rated'}
          {totalCount !== null && (
            <span className="star-rating__count">
              ({totalCount} {totalCount === 1 ? 'rating' : 'ratings'})
            </span>
          )}
        </span>
      )}
    </div>
  );
};

export default StarRating;
