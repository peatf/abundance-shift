import React, { useEffect, useRef } from 'react';
import { useAbundanceStore } from '../../store/abundanceStore';
// Assuming you have or will create simple icons for puzzle and audio
// Or use Heroicons e.g. PuzzlePieceIcon, SpeakerWaveIcon
const PuzzleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mb-2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.59-.477-1.067-1.067-1.067H6.087c-.59 0-1.067.477-1.067 1.067v3.612c0 .59.477 1.067 1.067 1.067H9c.59 0 1.067-.477 1.067-1.067V9.067h1.067C11.877 9.067 13 7.877 13 6.087v0Zm2.133-.006v2.56c0 1.79-1.19 2.98-2.98 2.98h-2.56v1.067c0 .59.477 1.067 1.067 1.067h3.612c.59 0 1.067-.477 1.067-1.067V6.081c0-.59-.477-1.067-1.067-1.067h-1.067Zm-3.199 5.186H6.087c-.59 0-1.067.477-1.067 1.067v3.612c0 .59.477 1.067 1.067 1.067h2.56c1.79 0 2.98-1.19 2.98-2.98v-2.56H9.067c-.59 0-1.067.477-1.067 1.067Zm2.133.006v2.56c0 1.79 1.19 2.98 2.98 2.98h2.56V15c0-.59-.477-1.067-1.067-1.067h-3.612c-.59 0-1.067.477-1.067-1.067Z" /></svg>;
const AudioIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mb-2"><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>;


function ImmediateReliefPracticeMenu() {
  const { startImmediateReliefExercise, completeImmediateReliefExercise } = useAbundanceStore();
  // `completeImmediateReliefExercise` is called by the sub-modules themselves.
  // This menu might have a "skip this whole stage" if needed.
  const headingRef = useRef(null);

  useEffect(() => {
    if (headingRef.current) headingRef.current.focus();
  }, []);

  return (
    <div className="flex flex-col items-center space-y-8 animate-fadeIn p-4">
      <h1 ref={headingRef} tabIndex="-1" className="text-2xl md:text-3xl font-bold text-center text-gray-800 dark:text-gray-100">
        Immediate Relief Practice
      </h1>
      <p className="text-md text-center text-gray-600 dark:text-gray-300 max-w-lg">
        Can you find a moment of relief right now? Choose a short practice to shift your focus and soothe your nervous system.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-md md:max-w-xl">
        {/* Tile 1: Pattern Micro-Puzzle */}
        <button
          onClick={() => startImmediateReliefExercise('pattern')}
          className="flex flex-col items-center justify-center p-6 md:p-8 bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 rounded-lg shadow-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 group"
          aria-label="Start Pattern Micro-Puzzle"
        >
          <PuzzleIcon />
          <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-200">Pattern Micro-Puzzle</h2>
          <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">(60 seconds)</p>
          <p className="text-xs text-blue-500 dark:text-blue-400 mt-2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">Engage pattern recognition.</p>
        </button>

        {/* Tile 2: Audio-Breathe Cue */}
        <button
          onClick={() => startImmediateReliefExercise('audio')}
          className="flex flex-col items-center justify-center p-6 md:p-8 bg-green-100 dark:bg-green-800 hover:bg-green-200 dark:hover:bg-green-700 rounded-lg shadow-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 group"
          aria-label="Start Audio-Breathe Cue"
        >
          <AudioIcon />
          <h2 className="text-lg font-semibold text-green-700 dark:text-green-200">Audio-Breathe Cue</h2>
          <p className="text-sm text-green-600 dark:text-green-300 mt-1">(90 seconds)</p>
          <p className="text-xs text-green-500 dark:text-green-400 mt-2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity">Guided paced breathing.</p>
        </button>
      </div>
      
      <button 
        onClick={() => completeImmediateReliefExercise()} // This action in store now sets the Reinforcement stage
        className="mt-8 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline focus:outline-none focus:ring-1 focus:ring-gray-500 rounded-sm"
      >
        Skip Immediate Relief
      </button>
    </div>
  );
}

export default ImmediateReliefPracticeMenu; 