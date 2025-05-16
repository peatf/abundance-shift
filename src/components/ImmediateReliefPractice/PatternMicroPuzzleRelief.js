import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAbundanceStore } from '../../store/abundanceStore';
import { generateReliefPuzzleSet, availableShapes } from '../../utils/shapeUtils'; // Ensure availableShapes is exported if needed for icons
import Button from '../common/Button';

const GRID_SIZE = 4; // 4x4 grid

function PatternMicroPuzzleRelief() {
  const { completeImmediateReliefExercise, skipImmediateReliefPuzzle, showToast } = useAbundanceStore();
  
  const [puzzleSet, setPuzzleSet] = useState([]);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds
  const [feedbackCell, setFeedbackCell] = useState(null); // {row, col, correct: bool}
  const [isPaused, setIsPaused] = useState(false);

  const timerRef = useRef(null);
  const puzzleContainerRef = useRef(null);

  const setupNewPuzzleSet = useCallback(() => {
    const newSet = generateReliefPuzzleSet(); // Generates 3 puzzles
    setPuzzleSet(newSet);
    setCurrentPuzzleIndex(0);
    setFeedbackCell(null);
    if(puzzleContainerRef.current) puzzleContainerRef.current.focus();
  }, []);

  useEffect(() => {
    setupNewPuzzleSet();
  }, [setupNewPuzzleSet]);

  useEffect(() => {
    if (timeLeft <= 0) {
      showToast("Time's up!", "info");
      completeImmediateReliefExercise();
      return;
    }
    if (isPaused) {
        if(timerRef.current) clearInterval(timerRef.current);
        return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft, completeImmediateReliefExercise, showToast, isPaused]);
  
  useEffect(() => {
    // Auto-focus the first candidate of the current puzzle
    // This requires refs on candidate buttons, or focus the container
    if (puzzleContainerRef.current && puzzleSet.length > 0) {
        const firstCandidateButton = puzzleContainerRef.current.querySelector('button[data-candidate-index="0"]');
        if (firstCandidateButton) {
            // firstCandidateButton.focus(); // Can be too aggressive
        }
    }
  }, [currentPuzzleIndex, puzzleSet]);


  const handleCandidateClick = (selectedCandidate) => {
    if (isPaused || !puzzleSet[currentPuzzleIndex]) return;

    const currentPuzzle = puzzleSet[currentPuzzleIndex];
    const isCorrect = selectedCandidate.id === currentPuzzle.correctCandidate.id;

    setFeedbackCell({ ...currentPuzzle.targetCell, correct: isCorrect });
    showToast(isCorrect ? "Correct!" : "Try again!", isCorrect ? "success" : "error", 800);

    setTimeout(() => {
      setFeedbackCell(null);
      if (isCorrect) {
        if (currentPuzzleIndex < puzzleSet.length - 1) {
          setCurrentPuzzleIndex(prev => prev + 1);
        } else {
          showToast("Puzzle sequence complete!", "success");
          completeImmediateReliefExercise();
        }
      }
      // No penalty for incorrect, user just tries again on the same puzzle item
    }, 800);
  };
  
  const currentPuzzleData = puzzleSet[currentPuzzleIndex];

  if (!currentPuzzleData) {
    return <div className="flex items-center justify-center h-full p-4">Loading puzzle...</div>;
  }
  
  const { gridIcon, targetCell, candidates } = currentPuzzleData;


  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] md:min-h-screen p-4 bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-gray-100 animate-fadeIn transition-colors duration-300">
        <div className="absolute top-4 right-4 flex space-x-2 items-center">
            <span className="text-sm font-medium tabular-nums">Time: {timeLeft}s</span>
            <Button onClick={() => setIsPaused(!isPaused)} variant="secondary" size="sm">
                {isPaused ? "Resume" : "Pause"}
            </Button>
            <Button onClick={skipImmediateReliefPuzzle} variant="link" size="sm">
                Skip Puzzle
            </Button>
        </div>

        <h2 ref={puzzleContainerRef} tabIndex="-1" className="text-2xl font-semibold mb-6 text-center">Match the Highlighted Tile</h2>
        
        {/* 4x4 Grid */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-gray-300 dark:bg-slate-700 rounded-md shadow-lg mb-8" aria-label="Puzzle grid">
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, cellIndex) => {
                const row = Math.floor(cellIndex / GRID_SIZE);
                const col = cellIndex % GRID_SIZE;
                const isTarget = row === targetCell.row && col === targetCell.col;
                let cellBg = 'bg-gray-200 dark:bg-slate-800';
                
                if(isTarget) cellBg = 'bg-yellow-200 dark:bg-yellow-700 ring-2 ring-yellow-500'; // Highlight target

                if (feedbackCell && row === feedbackCell.row && col === feedbackCell.col) {
                    cellBg = feedbackCell.correct ? 'bg-green-400 dark:bg-green-600 animate-pulse' : 'bg-red-400 dark:bg-red-600 animate-pulse';
                }

                return (
                    <div
                        key={cellIndex}
                        className={`w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-sm transition-colors ${cellBg}`}
                        aria-label={`Grid cell ${row + 1}, ${col + 1}${isTarget ? ', target cell' : ''}`}
                    >
                        {isTarget && gridIcon && (!feedbackCell || (feedbackCell && !feedbackCell.correct)) && (
                            <gridIcon.component className="w-8 h-8 md:w-10 md:h-10 fill-current text-gray-700 dark:text-gray-200 opacity-50" aria-label={`Target shape: ${gridIcon.name}`} />
                        )}
                        {isTarget && feedbackCell && feedbackCell.correct && gridIcon && (
                             <gridIcon.component className="w-8 h-8 md:w-10 md:h-10 fill-current text-green-800 dark:text-green-200" aria-label={`Correctly matched shape: ${gridIcon.name}`} />
                        )}
                    </div>
                );
            })}
        </div>

        {/* Candidate Palette */}
        <div className="flex space-x-2 md:space-x-3 justify-center" role="group" aria-label="Candidate shapes">
            {candidates.map((candidate, idx) => {
                const CandidateIcon = candidate.component;
                return (
                    <button
                        key={candidate.id}
                        data-candidate-index={idx}
                        onClick={() => handleCandidateClick(candidate)}
                        disabled={isPaused || !!feedbackCell}
                        aria-label={`Select ${candidate.name}`}
                        className="p-2 md:p-3 bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-slate-600 rounded-md shadow-sm hover:border-blue-500 dark:hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <CandidateIcon className="w-8 h-8 md:w-10 md:h-10 fill-current text-gray-700 dark:text-gray-200" />
                    </button>
                );
            })}
        </div>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Match {currentPuzzleIndex + 1} of {puzzleSet.length}.
        </p>
    </div>
  );
}

export default PatternMicroPuzzleRelief; 