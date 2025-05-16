import React from 'react';
import PropTypes from 'prop-types';

/**
 * Stub component for the Commit Anchor step.
 * @param {{ onComplete: () => void, onBack: () => void }} props
 */
function CommitAnchor({ onComplete, onBack }) {
  return (
    <div className="space-y-4 animate-slideUp">
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Step 4: Commit Anchor (Stub)</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300">Implementation pending. This will include the anchor button and optional breath loop.</p>
       <div className="flex justify-between mt-6">
        <button onClick={onBack} className="px-4 py-2 bg-gray-200 rounded">Back (Stub)</button>
        <button onClick={onComplete} className="px-4 py-2 bg-blue-500 text-white rounded">Complete Workshop (Stub)</button>
      </div>
    </div>
  );
}

CommitAnchor.propTypes = {
  onComplete: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default CommitAnchor; 