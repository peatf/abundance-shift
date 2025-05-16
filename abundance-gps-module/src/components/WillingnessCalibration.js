import React, { useState, useEffect, useRef } from 'react';
import { useAbundanceStore } from '../store/abundanceStore';
import Slider from './common/Slider';
import Button from './common/Button';

function WillingnessCalibration() {
  const setWillingnessScore = useAbundanceStore((state) => state.setWillingnessScore);
  const initialScore = useAbundanceStore((state) => state.willingnessScore); // Use persisted score as initial
  const [currentScore, setCurrentScore] = useState(initialScore || 50); // Default to 50 if no persisted score
  const headingRef = useRef(null);

  useEffect(() => {
    if (headingRef.current) {
      headingRef.current.focus();
    }
  }, []);


  const handleSubmit = () => {
    setWillingnessScore(currentScore);
  };

  return (
    <div className="flex flex-col items-center space-y-8 animate-fadeIn">
      <h1 ref={headingRef} tabIndex="-1" className="text-2xl md:text-3xl font-semibold text-center text-gray-800 dark:text-gray-100">
        Willingness Calibration
      </h1>
      <p className="text-center text-gray-600 dark:text-gray-300 max-w-md">
        How ready are you to reframe your current perceptions and explore new perspectives on abundance?
      </p>
      
      <div className="w-full max-w-sm">
        <Slider
          id="willingness-slider"
          label="Readiness to Reframe:"
          value={currentScore}
          onChange={setCurrentScore}
          min={0}
          max={100}
          step={1}
        />
      </div>
      
      <p className="text-sm text-center text-gray-500 dark:text-gray-400 italic">
        {currentScore < 50 && "A score below 50 suggests you might not be fully open to this process right now."}
        {currentScore >= 50 && currentScore < 70 && "A moderate score. We'll start with some exercises to enhance openness."}
        {currentScore >= 70 && "Great! You seem ready to dive in."}
      </p>

      <Button onClick={handleSubmit} size="lg" ariaLabel={`Submit readiness score of ${currentScore}`}>
        Continue
      </Button>
    </div>
  );
}

export default WillingnessCalibration; 