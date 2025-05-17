import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useAbundanceStore } from '../../store/abundanceStore';
import Button from '../common/Button';
import StarRating from '../common/StarRating';
import TextareaAutosize from 'react-textarea-autosize';

function AlternativeFrameGeneration({ onComplete, onBack }) {
  const { alternativeFrames, updateAlternativeFrameCompletion, updateAlternativeFrameRating } = useAbundanceStore(state => ({
    alternativeFrames: state.alternativeFrames,
    updateAlternativeFrameCompletion: state.updateAlternativeFrameCompletion,
    updateAlternativeFrameRating: state.updateAlternativeFrameRating,
  }));
  
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  const handleCompletionChange = (id, value) => {
    updateAlternativeFrameCompletion(id, value);
  };

  const handleRatingChange = (id, rating) => {
    updateAlternativeFrameRating(id, rating);
  };
  
  // Check if at least one frame is completed and rated to allow proceeding
  const canProceed = () => {
    return alternativeFrames.some(frame => frame.userCompletion.trim() !== '' && frame.rating > 0);
  };

  return (
    <div className="space-y-8 animate-slideUp">
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Step 3: Alternative Frame Generation & Resonance</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Complete the following reframing templates. Then, rate how "believable" or "resonant" each completed frame feels to you on a scale of 1 to 5.
      </p>

      {alternativeFrames.map((frame, index) => (
        <div key={frame.id} className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg space-y-3">
          <label htmlFor={`frame-completion-${frame.id}`} className="block text-md font-medium text-gray-700 dark:text-gray-200">
            {frame.text}
          </label>
          <TextareaAutosize
            ref={index === 0 ? firstInputRef : null}
            id={`frame-completion-${frame.id}`}
            value={frame.userCompletion}
            onChange={(e) => handleCompletionChange(frame.id, e.target.value)}
            placeholder="Complete the sentence..."
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100"
            minRows={2}
            aria-label={`Completion for frame starting with '${frame.text.substring(0,20)}...'`}
          />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 space-y-2 sm:space-y-0">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2" id={`rating-label-${frame.id}`}>
              Resonance Rating:
            </p>
            <StarRating
              name={`rating-${frame.id}`}
              value={frame.rating}
              onChange={(rating) => handleRatingChange(frame.id, rating)}
              label={`Rate resonance for frame: ${frame.text}`} // More specific for screen readers
              aria-labelledby={`rating-label-${frame.id}`} // Associates visual label with rating
            />
          </div>
        </div>
      ))}

      <div className="flex justify-between items-center pt-4">
        <Button onClick={onBack} variant="secondary">
          Back
        </Button>
        <Button onClick={onComplete} disabled={!canProceed()}>
          Next: Commit & Anchor
        </Button>
      </div>
    </div>
  );
}

AlternativeFrameGeneration.propTypes = {
  onComplete: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default AlternativeFrameGeneration;