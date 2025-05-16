import React from 'react';
import PropTypes from 'prop-types';

/**
 * @typedef {object} SliderProps
 * @property {string} id - Unique ID for the slider.
 * @property {string} label - Label for the slider (visible or screen-reader only).
 * @property {number} value - Current value of the slider.
 * @property {(value: number) => void} onChange - Callback when slider value changes.
 * @property {number} [min=0] - Minimum slider value.
 * @property {number} [max=100] - Maximum slider value.
 * @property {number} [step=1] - Step increment.
 * @property {boolean} [showValue=true] - Whether to display the current value.
 * @property {string} [className] - Additional Tailwind classes for the container.
 */

/**
 * An accessible slider component.
 * @param {SliderProps} props
 */
function Slider({ id, label, value, onChange, min = 0, max = 100, step = 1, showValue = true, className = '' }) {
  const handleChange = (event) => {
    onChange(Number(event.target.value));
  };

  return (
    <div className={`slider-container ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <div className="flex items-center space-x-3">
        <input
          type="range"
          id={id}
          name={id}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-labelledby={`${id}-label`}
        />
        {showValue && (
          <span className="text-sm text-gray-600 dark:text-gray-400 w-10 text-right tabular-nums">
            {value}
          </span>
        )}
      </div>
      {/* Hidden label for ARIA */}
      <span id={`${id}-label`} className="sr-only">{label}</span>
    </div>
  );
}

Slider.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  showValue: PropTypes.bool,
  className: PropTypes.string,
};

export default Slider; 