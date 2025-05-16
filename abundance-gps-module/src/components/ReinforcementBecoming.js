import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useAbundanceStore } from '../store/abundanceStore';
import Button from './common/Button';

/**
 * @typedef {object} ReinforcementBecomingProps
 * @property {() => void} onComplete - Callback when user clicks "Finish" or "Start Over".
 */

/**
 * Displays a final reinforcement message and optional premature exit message.
 * @param {ReinforcementBecomingProps} props
 */
function ReinforcementBecoming({ onComplete }) {
  const exitMessage = useAbundanceStore((state) => state.exitMessage);
  const finalReinforcementMessage = useAbundanceStore((state) => state.finalReinforcementMessage);
  const headingRef = useRef(null);

  useEffect(() => {
    if (headingRef.current) {
      headingRef.current.focus();
    }
  }, []);


  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8 py-10 animate-fadeIn">
      {exitMessage && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-800 border-l-4 border-yellow-400 dark:border-yellow-600 rounded-md">
          <p ref={headingRef} tabIndex="-1" className="text-yellow-700 dark:text-yellow-200 font-medium">{exitMessage}</p>
        </div>
      )}
      
      <h1 
        ref={!exitMessage ? headingRef : null} 
        tabIndex={!exitMessage ? -1 : undefined} 
        className="text-3xl md:text-4xl font-serif font-medium text-gray-700 dark:text-gray-200"
      >
        {finalReinforcementMessage}
      </h1>
      
      <Button onClick={onComplete} size="lg" variant="primary">
        {exitMessage ? "Acknowledge & Reset" : "Finish & Reset"}
      </Button>
    </div>
  );
}

ReinforcementBecoming.propTypes = {
  onComplete: PropTypes.func.isRequired,
};

export default ReinforcementBecoming; 