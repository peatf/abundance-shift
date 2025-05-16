import React from 'react';
import PropTypes from 'prop-types';

/**
 * A basic star rating component.
 */
function StarRating({ rating, onRatingChange, maxStars = 5, disabled = false }) {
  const stars = Array.from({ length: maxStars }, (_, index) => {
    const starValue = index + 1;
    return (
      <span
        key={index}
        className={`cursor-pointer text-xl ${
          starValue <= rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
        onClick={() => !disabled && onRatingChange && onRatingChange(starValue)}
        role="button"
        aria-label={`${starValue} out of ${maxStars} stars`}
      >
        ★
      </span>
    );
  });

  return <div className="flex space-x-1">{stars}</div>;
}

StarRating.propTypes = {
  rating: PropTypes.number.isRequired,
  onRatingChange: PropTypes.func,
  maxStars: PropTypes.number,
  disabled: PropTypes.bool,
};

export default StarRating; 