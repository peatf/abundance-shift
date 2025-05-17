import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useAbundanceStore } from '../../store/abundanceStore.js';
import { useWebAudioTones } from '../../hooks/useWebAudioTones';
import Button from '../common/Button';

const NUM_CIRCLES = 4;
const SEQUENCE_LENGTH = 4;
const TONE_DURATION_MS = 300; // ms
const PAUSE_BETWEEN_TONES_MS = 200; // ms
const HIGHLIGHT_DURATION_MS = 400; // ms for user click feedback

// Circle positions: 0: Top, 1: Right, 2: Bottom, 3: Left
const circlePositions = [
  { top: 'top-2 left-1/2 -translate-x-1/2', label: 'Top Circle' },
  { top: 'top-1/2 right-2 -translate-y-1/2', label: 'Right Circle' },
  { top: 'bottom-2 left-1/2 -translate-x-1/2', label: 'Bottom Circle' },
  { top: 'top-1/2 left-2 -translate-y-1/2', label: 'Left Circle' },
];

/**
 * @typedef {object} SequenceMemoryTapProps
 * @property {() => void} onSuccess - Callback on successful completion.
 * @property {() => void} onFailure - Callback on failed attempt.
 */

function SequenceMemoryTap({ onSuccess, onFailure }) {
  const [sequence, setSequence] = useState([]);
  const [userInput, setUserInput] = useState([]);
  const [activeCircle, setActiveCircle] = useState(null); // For AI playback highlighting
  const [feedbackCircle, setFeedbackCircle] = useState(null); // For user click highlighting
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [isUserTurn, setIsUserTurn] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Watch the sequence carefully.');
  const showToast = useAbundanceStore(state => state.showToast);

  const { playTone, resumeContext, isReady: audioReady, initAudio } = useWebAudioTones({
    duration: TONE_DURATION_MS / 1000,
    frequencies: [261.63, 329.63, 392.00, 440.00, 523.25] // C4, E4, G4, A4, C5 (extra for variety if needed)
  });

  const headingRef = useRef(null);
  const circleRefs = useRef([]);

  const generateSequence = useCallback(() => {
    const newSequence = [];
    for (let i = 0; i < SEQUENCE_LENGTH; i++) {
      newSequence.push(Math.floor(Math.random() * NUM_CIRCLES));
    }
    setSequence(newSequence);
    return newSequence;
  }, []);

  const playSequence = useCallback(async (seq) => {
    setIsPlayingSequence(true);
    setIsUserTurn(false);
    setStatusMessage('Memorize this sequence...');
    setActiveCircle(null); // Clear any previous active circle
    setUserInput([]); // Clear user input before AI plays

    for (let i = 0; i < seq.length; i++) {
      const circleIndex = seq[i];
      setActiveCircle(circleIndex);
      playTone(circleIndex);
      await new Promise(resolve => setTimeout(resolve, TONE_DURATION_MS + PAUSE_BETWEEN_TONES_MS));
      setActiveCircle(null); // Turn off highlight after tone + pause
      if (i < seq.length -1) { // Add a small pause before next tone unless it's the last
          await new Promise(resolve => setTimeout(resolve, PAUSE_BETWEEN_TONES_MS / 2));
      }
    }
    setActiveCircle(null); // Ensure it's off
    setIsPlayingSequence(false);
    setIsUserTurn(true);
    setStatusMessage('Your turn! Repeat the sequence.');
    if (circleRefs.current[0]) circleRefs.current[0].focus(); // Focus first circle for keyboard nav
  }, [playTone]);

  const handleCircleClick = useCallback(async (clickedIndex) => {
    if (!isUserTurn || isPlayingSequence) return;

    if (!audioReady) { // Attempt to resume audio context on first user interaction
        await resumeContext();
        if (!audioReady && !isReady) { // Check audioReady from hook, isReady is local to component
             showToast("Audio not available. Please enable audio or check browser settings.", "error");
             return;
        }
    }

    playTone(clickedIndex);
    setFeedbackCircle(clickedIndex); // Visual feedback for user's click
    setTimeout(() => setFeedbackCircle(null), HIGHLIGHT_DURATION_MS);

    const newUserInput = [...userInput, clickedIndex];
    setUserInput(newUserInput);

    // Check if the current input is correct so far
    if (sequence[newUserInput.length - 1] !== clickedIndex) {
      // Incorrect step
      setIsUserTurn(false);
      setStatusMessage('Incorrect sequence. Try again after reset.');
      showToast("Oops! That wasn't the right step.", "error");
      setTimeout(() => {
        onFailure(); // Signal failure to parent
        // Parent will handle re-attempt or exit logic.
        // Here, we could reset for another try within this component if desired,
        // but current flow has parent managing attempts.
      }, 1500);
      return;
    }

    // If sequence is fully and correctly entered
    if (newUserInput.length === SEQUENCE_LENGTH) {
      setIsUserTurn(false);
      setStatusMessage('Correct! Focus restored.');
      showToast("Focus restored!", "success");
      // Optional: Flash all circles
      setActiveCircle('all'); // Special value to highlight all
      setTimeout(() => {
          setActiveCircle(null);
          onSuccess();
      }, 1000); // Flash duration
    }
  }, [isUserTurn, isPlayingSequence, userInput, sequence, playTone, onSuccess, onFailure, showToast, audioReady, resumeContext]);
  
  // Initialize component
  useEffect(() => {
    if (headingRef.current) headingRef.current.focus();
    initAudio(); // Attempt to initialize AudioContext on mount
    const newSeq = generateSequence();
    // Auto-play sequence after a brief delay to allow UI to render
    setStatusMessage('Get ready to memorize the sequence...');
    const timer = setTimeout(() => {
        if (!audioReady) {
            // This is a good place to prompt for interaction if audio is suspended
            setStatusMessage('Click "Start Sequence" to begin and enable audio.');
        } else {
            playSequence(newSeq);
        }
    }, 1500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // generateSequence, playSequence are stable if deps are correct, but playSequence depends on audioReady, so we only want to run this on mount

  const handleStartSequence = async () => {
    if (!audioReady) {
        await resumeContext(); // Try to enable audio
    }
    if (sequence.length > 0) { // Check if sequence is generated
        playSequence(sequence);
    } else {
        const newSeq = generateSequence();
        playSequence(newSeq);
    }
  }

  return (
    <div className="flex flex-col items-center space-y-6 p-4 animate-fadeIn">
      <h2 ref={headingRef} tabIndex="-1" className="text-xl font-semibold text-gray-800 dark:text-gray-100">
        Sequence Memory Tap
      </h2>
      <p id="status-message" role="status" className="text-sm text-center text-gray-600 dark:text-gray-300 min-h-[2em]">
        {statusMessage}
      </p>

      {!audioReady && !isPlayingSequence && (
        <Button onClick={handleStartSequence} variant="secondary" className="mb-4">
            Start Sequence (Click to enable audio if needed)
        </Button>
      )}

      <div className="relative w-48 h-48 md:w-60 md:h-60 rounded-full border-2 border-gray-300 dark:border-slate-600 flex items-center justify-center" aria-label="Sequence circles container">
        {circlePositions.map((pos, index) => (
          <button
            key={index}
            ref={el => circleRefs.current[index] = el}
            aria-label={pos.label}
            aria-pressed={activeCircle === index || feedbackCircle === index}
            disabled={!isUserTurn || isPlayingSequence}
            onClick={() => handleCircleClick(index)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCircleClick(index);
                }
            }}
            className={`
              absolute w-12 h-12 md:w-16 md:h-16 rounded-full transition-all duration-150 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800
              ${pos.top}
              ${(activeCircle === index || (activeCircle === 'all' && feedbackCircle !== index)) ? 'bg-blue-500 scale-110' : 
                (feedbackCircle === index) ? 'bg-green-500 scale-110' :
                'bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600'}
              ${(!isUserTurn || isPlayingSequence) ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
              ${(feedbackCircle === index && sequence[userInput.length-1] !== index && userInput.length <= sequence.length) ? '!bg-red-500' : ''}
            `}
          />
        ))}
        {/* Central point or just empty space */}
         <div className="w-4 h-4 bg-gray-400 dark:bg-slate-500 rounded-full"></div>
      </div>
      
      <div className="mt-4 h-8">
        {/* Can add "Try Again" button here if we want to manage retries within component */}
      </div>
    </div>
  );
}

SequenceMemoryTap.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onFailure: PropTypes.func.isRequired,
};

export default SequenceMemoryTap;