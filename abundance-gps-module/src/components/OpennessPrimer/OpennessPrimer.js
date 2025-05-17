import React, { useEffect, useRef } from 'react';
import { useAbundanceStore, opennessPrimerSubStages } from '../../store/abundanceStore.js';
import PatternAlignmentPuzzle from './PatternAlignmentPuzzle';
import SequenceMemoryTap from './SequenceMemoryTap'; // To be implemented

function OpennessPrimer() {
  const currentExercise = useAbundanceStore(state => state.opennessPrimerCurrentExercise);
  const attempts = useAbundanceStore(state => state.opennessPrimerAttempts);
  const failOpennessPrimerAttempt = useAbundanceStore(state => state.failOpennessPrimerAttempt);
  const succeedOpennessPrimer = useAbundanceStore(state => state.succeedOpennessPrimer);
  const headingRef = useRef(null);

  useEffect(() => {
    if (headingRef.current) {
        headingRef.current.focus();
    }
  }, []);

  const handleSuccess = () => {
    succeedOpennessPrimer();
  };

  const handleFailure = () => {
    const isExiting = failOpennessPrimerAttempt(); // This action also handles switching exercise or exiting
    if (!isExiting && currentExercise === opennessPrimerSubStages.PATTERN_PUZZLE) {
      // Switched to SEQUENCE_TAP, can show a message or just render next component
    }
  };

  let exerciseComponent;
  if (currentExercise === opennessPrimerSubStages.PATTERN_PUZZLE) {
    exerciseComponent = <PatternAlignmentPuzzle onSuccess={handleSuccess} onFailure={handleFailure} />;
  } else if (currentExercise === opennessPrimerSubStages.SEQUENCE_TAP) {
    // exerciseComponent = <SequenceMemoryTap onSuccess={handleSuccess} onFailure={handleFailure} />;
    exerciseComponent = (
        <div className="p-4 text-center">
            <p className="text-lg font-semibold mb-2">Sequence Memory Tap</p>
            <p className="text-gray-600 dark:text-gray-300">This exercise will test your focus and memory with an audio-visual sequence.</p>
            <p className="mt-4 text-orange-500">(SequenceMemoryTap component implementation pending)</p>
            {/* TEMPORARY BUTTONS FOR FLOW TESTING */}
            <div className="mt-4 space-x-2">
                <button onClick={handleSuccess} className="bg-green-500 text-white px-3 py-1 rounded">Simulate Success</button>
                <button onClick={handleFailure} className="bg-red-500 text-white px-3 py-1 rounded">Simulate Failure</button>
            </div>
        </div>
    );
  } else {
    exerciseComponent = <p>Error: Unknown primer exercise.</p>;
  }

  return (
    <div className="animate-fadeIn">
      <h1 ref={headingRef} tabIndex="-1" className="text-2xl font-bold text-center mb-4 text-gray-800 dark:text-gray-100">Openness Primer</h1>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
        Let's engage your mind with a short exercise to enhance openness. You have {2 - attempts} attempt(s) remaining for this primer stage.
      </p>
      {exerciseComponent}
    </div>
  );
}

export default OpennessPrimer; 