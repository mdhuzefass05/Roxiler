import { useState } from 'react';

/**
 * StarRating — accessible visual star display and input component.
 *
 * Supports readonly mode (for displaying overall/average ratings with decimals)
 * and interactive mode with full keyboard navigation (Left/Right arrow, Space, Enter, 1-5 keys).
 */
const StarRating = ({
  value = 0,
  max = 5,
  interactive = false,
  onChange,
  size = 'md', // 'xs' | 'sm' | 'md' | 'lg'
  showNumber = false,
  totalCount = null,
}) => {
  const [hoverValue, setHoverValue] = useState(null);
  const numericValue = parseFloat(value) || 0;
  const activeRating = hoverValue !== null ? hoverValue : numericValue;

  const handleStarClick = (starIndex) => {
    if (interactive && onChange) {
      onChange(starIndex);
    }
  };

  const handleKeyDown = (e, starIndex) => {
    if (!interactive || !onChange) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(starIndex);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(max, starIndex + 1);
      onChange(next);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      const prev = Math.max(1, starIndex - 1);
      onChange(prev);
    }
  };

  return (
    <div
      className={`star-rating star-rating--${size} ${interactive ? 'star-rating--interactive' : ''}`}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={
        interactive
          ? 'Star Rating Selection'
          : `Rating: ${numericValue > 0 ? numericValue.toFixed(1) : 0} out of ${max}`
      }
    >
      <div
        className="star-rating__stars"
        onMouseLeave={() => interactive && setHoverValue(null)}
      >
        {Array.from({ length: max }, (_, index) => {
          const starNumber = index + 1;
          const isFilled = starNumber <= Math.round(activeRating);
          const isChecked = starNumber === Math.round(numericValue);

          if (!interactive) {
            return (
              <span
                key={index}
                className={`star-btn ${isFilled ? 'star-btn--filled' : 'star-btn--empty'}`}
                aria-hidden="true"
              >
                ★
              </span>
            );
          }

          return (
            <button
              key={index}
              type="button"
              role="radio"
              aria-checked={isChecked}
              aria-label={`${starNumber} star${starNumber > 1 ? 's' : ''}`}
              className={`star-btn ${isFilled ? 'star-btn--filled' : 'star-btn--empty'} ${
                hoverValue !== null && starNumber <= hoverValue ? 'star-btn--hovered' : ''
              }`}
              onClick={() => handleStarClick(starNumber)}
              onMouseEnter={() => setHoverValue(starNumber)}
              onKeyDown={(e) => handleKeyDown(e, starNumber)}
              tabIndex={0}
            >
              ★
            </button>
          );
        })}
      </div>

      {showNumber && (
        <span className="star-rating__score">
          {numericValue > 0 ? (
            <>
              <strong>{numericValue.toFixed(1)}</strong> / 5.0
            </>
          ) : (
            <span className="text-muted">No ratings yet</span>
          )}
          {totalCount !== null && numericValue > 0 && (
            <span className="star-rating__count">
              ({totalCount} {totalCount === 1 ? 'review' : 'reviews'})
            </span>
          )}
        </span>
      )}
    </div>
  );
};

export default StarRating;
