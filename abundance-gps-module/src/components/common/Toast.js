import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'; // Assuming Heroicons

// You would need to install @heroicons/react or provide your own SVGs
// Fallback simple icons:
const SimpleCheckIcon = () => <span className="text-green-500">✓</span>;
const SimpleXIcon = () => <span className="text-red-500">✗</span>;
const SimpleInfoIcon = () => <span className="text-blue-500">ℹ</span>;
const SimpleWarningIcon = () => <span className="text-yellow-500">⚠</span>;


/**
 * @typedef {object} ToastProps
 * @property {string} message - Message to display.
 * @property {'success' | 'error' | 'warning' | 'info'} [type='info'] - Type of toast.
 * @property {() => void} onDismiss - Callback when toast is dismissed.
 */

/**
 * A toast notification component.
 * @param {ToastProps} props
 */
function Toast({ message, type = 'info', onDismiss }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true); // Animate in
    // Auto dismiss is handled by the store, this component just renders
  }, [message]); // Re-trigger animation if message changes while visible

  const baseStyles = 'fixed bottom-5 right-5 md:bottom-10 md:right-10 p-4 rounded-lg shadow-lg flex items-center space-x-3 z-50 transition-all duration-300 ease-out';
  
  const typeStyles = {
    success: 'bg-green-50 dark:bg-green-800 border-l-4 border-green-500 text-green-700 dark:text-green-200',
    error: 'bg-red-50 dark:bg-red-800 border-l-4 border-red-500 text-red-700 dark:text-red-200',
    warning: 'bg-yellow-50 dark:bg-yellow-800 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-200',
    info: 'bg-blue-50 dark:bg-blue-800 border-l-4 border-blue-500 text-blue-700 dark:text-blue-200',
  };

  const IconComponent = {
    success: CheckCircleIcon || SimpleCheckIcon,
    error: XMarkIcon || SimpleXIcon, // This XMarkIcon is for closing, maybe ExclamationCircleIcon for error
    warning: ExclamationTriangleIcon || SimpleWarningIcon,
    info: InformationCircleIcon || SimpleInfoIcon,
  }[type];


  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={`${baseStyles} ${typeStyles[type]} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
    >
      <IconComponent className="h-6 w-6" />
      <p className="flex-grow">{message}</p>
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-current"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  );
}

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  onDismiss: PropTypes.func.isRequired,
};

export default Toast; 