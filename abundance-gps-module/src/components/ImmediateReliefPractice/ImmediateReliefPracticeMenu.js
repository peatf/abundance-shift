import React from 'react';
import { useAbundanceStore } from '../../store/abundanceStore';

/**
 * Stub component for the Immediate Relief Practice Menu.
 */
function ImmediateReliefPracticeMenu() {
    const startImmediateReliefExercise = useAbundanceStore(state => state.startImmediateReliefExercise);

  return (
    <div className="space-y-6 animate-fadeIn text-center">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Immediate Relief Practice (Stub)</h1>
      <p className="text-gray-600 dark:text-gray-300">Choose a quick practice for immediate relief.</p>
       <div className="flex flex-col space-y-4 mt-6">
           <button onClick={() => startImmediateReliefExercise('pattern')} className="px-4 py-2 bg-blue-500 text-white rounded">Pattern Micro-Puzzle (Stub)</button>
           <button onClick={() => startImmediateReliefExercise('audio')} className="px-4 py-2 bg-blue-500 text-white rounded">Audio Breathe Cue (Stub)</button>
       </div>
       <p className="mt-4 text-orange-500">Implementation pending.</p>
    </div>
  );
}

export default ImmediateReliefPracticeMenu; 