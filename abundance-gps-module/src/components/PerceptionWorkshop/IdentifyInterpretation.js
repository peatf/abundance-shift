import React from 'react';
import PropTypes from 'prop-types';

/**
 * Stub component for the Identify Interpretation step.
 * @param {{ onComplete: () => void }} props
 */
function IdentifyInterpretation({ onComplete }) {
  return (
    <div className="space-y-4 animate-slideUp">
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Step 1: Identify Current Interpretation (Stub)</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300">Implementation pending.</p>
      <div className="flex justify-end">
        <button onClick={onComplete} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Next (Stub)</button>
      </div>
    </div>
  );
}

IdentifyInterpretation.propTypes = {
  onComplete: PropTypes.func.isRequired,
};

export default IdentifyInterpretation; 