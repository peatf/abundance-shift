import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useAbundanceStore } from '../../store/abundanceStore.js';
import { generatePatternAlignmentPuzzle } from '../../utils/shapeUtils';

/**
 * @typedef {object} PatternAlignmentPuzzleProps
 * @property {() => void} onSuccess - Callback on successful completion.
 * @property {() => void} onFailure - Callback on failed attempt.
 */

/**
 * 3x3 SVG-shape grid puzzle for Openness Primer.
 * @param {PatternAlignmentPuzzleProps} props
 */
function PatternAlignmentPuzzle({ onSuccess, onFailure }) {
  const [puzzleData, setPuzzleData] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [feedback, setFeedback] = useState(''); // 'correct', 'incorrect'
  const showToast = useAbundanceStore(state => state.showToast);
  const gridRef = useRef(null);

  useEffect(() => {
    setPuzzleData(generatePatternAlignmentPuzzle());
    setSelectedCandidate(null);
    setFeedback('');
    if (gridRef.current) {
        gridRef.current.focus();
    }
  }, []); // Generate new puzzle on mount

  const { grid, missingShape, candidates, emptyCell } = puzzleData || {};

  const handleCandidateClick = (candidateShape) => {
    if (feedback) return; // Don't allow changes after an attempt
    setSelectedCandidate(candidateShape);

    if (candidateShape.id === missingShape.id) {
      setFeedback('correct');
      showToast("Alignment achieved!", "success");
      // Highlight completed line (row/column of emptyCell)
      // For simplicity, we'll just show a success message and proceed.
      // A visual highlight would require marking cells in the grid.
      setTimeout(onSuccess, 1500); // Delay for user to see feedback
    } else {
      setFeedback('incorrect');
      showToast("Not quite. Try to see the pattern.", "error");
      setTimeout(onFailure, 1500);
    }
  };
  
  const getCellStyle = (isMissing, isTargetForHighlight) => {
    let styles = "w-16 h-16 md:w-20 md:h-20 border border-gray-300 dark:border-slate-600 flex items-center justify-center";
    if (isMissing) {
      styles += " bg-gray-100 dark:bg-slate-700";
    } else {
      styles += " bg-white dark:bg-slate-800";
    }
    if (isTargetForHighlight && feedback === 'correct') {
        styles += " ring-2 ring-green-500";
    }
    return styles;
  }

  if (!puzzleData) {
    return <div className="text-center p-4">Loading puzzle...</div>;
  }

  return (
    <div className="flex flex-col items-center space-y-6 animate-fadeIn p-4">
      <h2 ref={gridRef} tabIndex="-1" className="text-xl font-semibold text-gray-800 dark:text-gray-100">Pattern Alignment Micro-Puzzle</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 text-center">Complete the pattern in the grid by selecting the correct shape.</p>
      
      <div className="grid grid-cols-3 gap-1 p-2 bg-gray-200 dark:bg-slate-700 rounded" aria-label="Pattern grid">
        {grid.map((row, rowIndex) =>
          row.map((cellShape, colIndex) => {
            const isMissingCell = rowIndex === emptyCell.row && colIndex === emptyCell.col;
            const isCompletedLineMember = (feedback === 'correct' && (rowIndex === emptyCell.row || colIndex === emptyCell.col));

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={getCellStyle(isMissingCell, isCompletedLineMember)}
                aria-label={isMissingCell ? "Empty cell" : `Cell containing ${cellShape?.name}`}
              >
                {isMissingCell ? (
                  selectedCandidate && feedback === 'correct' ? (
                    <selectedCandidate.component className="w-10 h-10 md:w-12 md:h-12 fill-current text-green-500" />
                  ) : (
                    <span className="text-2xl text-gray-400 dark:text-slate-500">?</span>
                  )
                ) : (
                  cellShape && <cellShape.component className="w-10 h-10 md:w-12 md:h-12 fill-current text-blue-500 dark:text-blue-400" />
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4" role="group" aria-label="Candidate shapes">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Choose the correct shape:</p>
        <div className="flex space-x-3 justify-center">
          {candidates.map((candidate) => (
            <button
              key={candidate.id}
              onClick={() => handleCandidateClick(candidate)}
              disabled={feedback}
              aria-label={`Select ${candidate.name}`}
              className={`p-2 border-2 rounded-md hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                ${feedback ? 
                  (feedback === 'correct' ? 'border-green-500 bg-green-100 dark:bg-green-900' : 
                   feedback === 'incorrect' ? 'border-red-500 bg-red-100 dark:bg-red-900' : 'border-blue-500') 
                  : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800'}
                ${feedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <candidate.component className="w-10 h-10 md:w-12 md:h-12 fill-current text-gray-700 dark:text-gray-200" />
            </button>
          ))}
        </div>
      </div>
      
      {feedback === 'incorrect' && (
          <p className="text-red-600 dark:text-red-400 text-sm mt-2">Incorrect. One more try on a different puzzle if this is your first attempt.</p>
      )}

    </div>
  );
}

PatternAlignmentPuzzle.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onFailure: PropTypes.func.isRequired,
};

export default PatternAlignmentPuzzle; 