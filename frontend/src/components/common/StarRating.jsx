import { useState } from 'react';

/**
 * Helper to determine the rating color tier (5 = Emerald, 4 = Amber, 3 = Orange, 2 = Coral, 1 = Ruby)
 */
export const getRatingTier = (score) => {
  const num = parseFloat(score) || 0;
  if (num >= 4.5) return 'tier-5'; // 5 Stars: Emerald Green
  if (num >= 3.5) return 'tier-4'; // 4 Stars: Amber Gold
  if (num >= 2.5) return 'tier-3'; // 3 Stars: Tangerine Orange
  if (num >= 1.5) return 'tier-2'; // 2 Stars: Coral Rose
  if (num > 0) return 'tier-1';    // 1 Star: Ruby Crimson
  return 'tier-0';                // Unrated: Slate
};

/**
 * Helper to get the hex color matching the rating tier
 */
export const getRatingColor = (score) => {
  const num = parseFloat(score) || 0;
  if (num >= 4.5) return '#10b981'; // Emerald Green
  if (num >= 3.5) return '#f59e0b'; // Amber Gold
  if (num >= 2.5) return '#f97316'; // Tangerine Orange
  if (num >= 1.5) return '#e11d48'; // Coral Rose
  if (num > 0) return '#dc2626';    // Ruby Crimson
  return '#94a3b8';                // Slate
};

/**
 * StarRating — accessible visual star display and input component.
 * Features dynamic multi-tier color palette that adapts to rating score or hover state.
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
  const tierClass = getRatingTier(activeRating);

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
      className={`star-rating star-rating--${size} star-rating--${tierClass} ${
        interactive ? 'star-rating--interactive' : ''
      }`}
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
              <strong style={{ color: getRatingColor(numericValue) }}>
                {numericValue.toFixed(1)}
              </strong>{' '}
              / 5.0
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
