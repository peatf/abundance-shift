import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useAbundanceStore } from '../../store/abundanceStore';
import Button from '../common/Button';
import TextareaAutosize from 'react-textarea-autosize'; // npm install react-textarea-autosize

function IdentifyInterpretation({ onComplete }) {
  const currentInterpretation = useAbundanceStore(state => state.currentInterpretation);
  const updateCurrentInterpretation = useAbundanceStore(state => state.updateCurrentInterpretation);
  const [localInterpretation, setLocalInterpretation] = useState(currentInterpretation);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const handleNext = () => {
    if (localInterpretation.trim()) {
      updateCurrentInterpretation(localInterpretation.trim());
      onComplete();
    } else {
      // Add some validation feedback
      alert("Please enter your current interpretation.");
    }
  };

  return (
    <div className="space-y-4 animate-slideUp">
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Step 1: Identify Current Interpretation</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        In a single sentence, what's the thought or belief about your current situation that feels "wrong" or limiting? 
        (e.g., "My income shouldn't be this low," or "I'm not good enough for that opportunity.")
      </p>
      <TextareaAutosize
        ref={inputRef}
        id="currentInterpretation"
        value={localInterpretation}
        onChange={(e) => setLocalInterpretation(e.target.value)}
        placeholder="e.g., I'll never be truly abundant..."
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100"
        minRows={2}
        maxRows={5}
        aria-label="Current interpretation input"
      />
      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={!localInterpretation.trim()}>
          Next: Evidence Inventory
        </Button>
      </div>
    </div>
  );
}

IdentifyInterpretation.propTypes = {
  onComplete: PropTypes.func.isRequired,
};
export default IdentifyInterpretation;