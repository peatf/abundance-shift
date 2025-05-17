import React, { useState, useId } from 'react';
import PropTypes from 'prop-types';
// Using a simple SVG star for now. Could use Heroicons or other libraries.
const StarIcon = ({ filled, className = "w-6 h-6 md:w-8 md:h-8" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="1.5"
    className={`${className} ${filled ? 'text-yellow-400 dark:text-yellow-300' : 'text-gray-300 dark:text-slate-600'}`}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.82.61l-4.725-2.885a.563.563 0 00-.652 0l-4.725 2.885a.562.562 0 01-.82-.61l1.285-5.385a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
    />
  </svg>
);

StarIcon.propTypes = {
  filled: PropTypes.bool,
  className: PropTypes.string,
};


/**
 * @typedef {object} StarRatingProps
 * @property {number} count - Total number of stars.
 * @property {number} value - Current rating value.
 * @property {(rating: number) => void} onChange - Callback when rating changes.
 * @property {string} [label] - Accessible label for the rating group.
 * @property {string} [name] - Name for the radio group (important for accessibility).
 * @property {boolean} [disabled=false] - If the rating is disabled.
 */

/**
 * An accessible star rating component using radio buttons.
 * @param {StarRatingProps} props
 */
function StarRating({ count = 5, value = 0, onChange, label = "Rate this item", name, disabled = false }) {
  const [hoverValue, setHoverValue] = useState(0);
  const uniqueName = useId() + (name || 'rating'); // Ensures unique name for radio group if multiple on page

  const handleStarClick = (ratingValue) => {
    if (disabled) return;
    onChange(ratingValue);
  };

  const handleStarHover = (ratingValue) => {
    if (disabled) return;
    setHoverValue(ratingValue);
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    setHoverValue(0); // Reset hover when mouse leaves the container
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex items-center space-x-1"
      onMouseLeave={handleMouseLeave}
    >
      {Array.from({ length: count }, (_, i) => {
        const ratingValue = i + 1;
        const starId = `${uniqueName}-star-${ratingValue}`;
        return (
          <label
            key={ratingValue}
            htmlFor={starId}
            className={`cursor-pointer ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
            onMouseEnter={() => handleStarHover(ratingValue)}
            onClick={(e) => { e.preventDefault(); handleStarClick(ratingValue);}} // Prevent default label behavior, handle via input
          >
            <input
              type="radio"
              id={starId}
              name={uniqueName}
              value={ratingValue}
              checked={ratingValue === value}
              onChange={() => handleStarClick(ratingValue)}
              disabled={disabled}
              className="sr-only" // Hide actual radio button
              aria-label={`${ratingValue} out of ${count} stars`}
            />
            <StarIcon filled={hoverValue >= ratingValue || (!hoverValue && value >= ratingValue)} />
          </label>
        );
      })}
      <span className="sr-only" aria-live="polite">{`${value} out of ${count} stars selected`}</span>
    </div>
  );
}

StarRating.propTypes = {
  count: PropTypes.number,
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  name: PropTypes.string,
  disabled: PropTypes.bool,
};

export default StarRating;