import React from 'react';
import PropTypes from 'prop-types';

/**
 * @typedef {object} ButtonProps
 * @property {React.ReactNode} children - Button content.
 * @property {() => void} onClick - Click handler.
 * @property {'primary' | 'secondary' | 'danger' | 'link'} [variant='primary'] - Button style variant.
 * @property {'sm' | 'md' | 'lg'} [size='md'] - Button size.
 * @property {boolean} [disabled=false] - Whether the button is disabled.
 * @property {string} [className] - Additional Tailwind classes.
 * @property {string} [type='button'] - Button type.
 * @property {string} [ariaLabel] - ARIA label for accessibility.
 */

/**
 * A styled, accessible button component.
 * @param {ButtonProps} props
 */
function Button({ children, onClick, variant = 'primary', size = 'md', disabled = false, className = '', type = 'button', ariaLabel }) {
  const baseStyles = 'font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-colors duration-150 ease-in-out';

  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-gray-200 focus:ring-gray-400',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    link: 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 focus:ring-blue-500 underline',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const disabledStyles = 'opacity-50 cursor-not-allowed';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${disabled ? disabledStyles : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'link']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  className: PropTypes.string,
  type: PropTypes.string,
  ariaLabel: PropTypes.string,
};

export default Button; 