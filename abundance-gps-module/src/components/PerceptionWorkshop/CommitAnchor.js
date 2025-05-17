import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useAbundanceStore } from '../../store/abundanceStore';
import Button from '../common/Button';
import { useWebAudioTones } from '../../hooks/useWebAudio'; // For chimes
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis'; // To be created for statement

function CommitAnchor({ onComplete, onBack }) {
  const { alternativeFrames, anchoredFrame, commitAndAnchorFrame, showToast } = useAbundanceStore(state => ({
    alternativeFrames: state.alternativeFrames,
    anchoredFrame: state.anchoredFrame,
    commitAndAnchorFrame: state.commitAndAnchorFrame,
    showToast: state.showToast,
  }));

  const [showBreathExercise, setShowBreathExercise] = useState(false);
  const [isBreathExerciseActive, setIsBreathExerciseActive] = useState(false);
  const [breathPrompt, setBreathPrompt] = useState('');
  const topRatedFrame = useRef(null); // To store the frame determined as top-rated

  // Placeholder hooks - actual implementation in next chunk
  const { playTone, initAudio: initChimeAudio, resumeContext: resumeChimeContext, isReady: chimeAudioReady } = useWebAudioTones({ frequencies: [880], duration: 0.5, volume: 0.4 }); // A pleasant chime (A5)
  const { speak, cancel: cancelSpeech, isSpeaking, isSupported: speechSynthSupported, initSpeech } = useSpeechSynthesis();

  const anchorButtonRef = useRef(null);
  const breathExerciseRef = useRef(null);


  useEffect(() => {
    // Determine the top-rated, completed frame when component mounts or frames change
    const frames = alternativeFrames;
    const highestRated = frames
        .filter(f => f.userCompletion.trim() !== '')
        .reduce((max, frame) => (frame.rating > (max?.rating || 0) ? frame : max), null);
    topRatedFrame.current = highestRated;

    if (anchorButtonRef.current) {
        anchorButtonRef.current.focus();
    }
  }, [alternativeFrames]);


  const handleAnchor = () => {
    const success = commitAndAnchorFrame(); // This action now finds the top frame
    if (success) {
      // `anchoredFrame` in store is now set. The `topRatedFrame.current` is for local use before store update.
      // The success toast is handled by the store action.
      setShowBreathExercise(true); // Offer breath exercise
      if(breathExerciseRef.current) breathExerciseRef.current.focus();
    } else {
      // Toast for failure (e.g. no frame rated) is handled by store action
    }
  };

  const startBreathLoop = async () => {
    if (!topRatedFrame.current || !topRatedFrame.current.fullText) {
        showToast("No statement to anchor for breathwork.", "warning");
        return;
    }

    setIsBreathExerciseActive(true);
    // Initialize audio contexts if not already
    if (!chimeAudioReady) await resumeChimeContext() || await initChimeAudio();
    initSpeech(); // Ensure speech synthesis is ready

    const statement = topRatedFrame.current.fullText;
    const cycleDuration = 8000; // 8 seconds: Inhale (3s), Hold (1s), Exhale (3s), Rest (1s) (approx)
    const numCycles = Math.floor(30000 / cycleDuration); // For approx 30s

    for (let i = 0; i < numCycles; i++) {
      if (!isBreathExerciseActive) break; // Check if cancelled

      setBreathPrompt(`Inhale... (${statement})`);
      speak(statement); // Read statement during inhale
      playTone(0); // Chime for inhale start
      await new Promise(r => setTimeout(r, 3000));
      if (!isBreathExerciseActive) break;

      setBreathPrompt("Hold...");
      playTone(0); // Chime for hold
      await new Promise(r => setTimeout(r, 1000));
      if (!isBreathExerciseActive) break;

      setBreathPrompt("Exhale...");
      playTone(0); // Chime for exhale start
      await new Promise(r => setTimeout(r, 3000));
      if (!isBreathExerciseActive) break;
      
      setBreathPrompt("Rest...");
      playTone(0); // Chime for rest
      await new Promise(r => setTimeout(r, 1000));
    }
    
    setIsBreathExerciseActive(false);
    setBreathPrompt(anchoredFrame ? "Breathwork complete. Your frame is anchored." : "Breathwork complete.");
    cancelSpeech(); // Ensure speech stops
  };

  const stopBreathLoop = () => {
    setIsBreathExerciseActive(false);
    setBreathPrompt(anchoredFrame ? "Breathwork stopped. Your frame is anchored." : "Breathwork stopped.");
    cancelSpeech();
  };
  
  const handleProceed = () => {
    if(isBreathExerciseActive) stopBreathLoop();
    onComplete();
  }

  return (
    <div className="space-y-6 animate-slideUp">
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Step 4: Commit & Anchor</h2>
      
      {topRatedFrame.current ? (
        <div className="p-4 bg-blue-50 dark:bg-slate-700 rounded-lg shadow">
          <p className="text-sm text-gray-600 dark:text-gray-300">Your highest-rated frame to anchor:</p>
          <p className="mt-1 text-lg font-semibold text-blue-700 dark:text-blue-300">
            "{topRatedFrame.current.text.replace('…', '')} {topRatedFrame.current.userCompletion}" (Rated: {topRatedFrame.current.rating}/5)
          </p>
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-400">
          Once you have completed and rated your alternative frames, your top-rated frame will appear here.
        </p>
      )}

      {!anchoredFrame && (
        <Button ref={anchorButtonRef} onClick={handleAnchor} disabled={!topRatedFrame.current} size="lg">
          Anchor Top Frame to Journal
        </Button>
      )}

      {anchoredFrame && showBreathExercise && (
        <div ref={breathExerciseRef} tabIndex="-1" className="mt-6 p-4 border border-dashed border-green-500 dark:border-green-400 rounded-lg space-y-4 bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200">
          <h3 className="text-lg font-semibold">Optional: Somatic Reinforcement (30s)</h3>
          <p className="text-sm">
            Embed this new perception with a short audio-guided breath loop of your anchored statement:
            <strong className="block mt-1">"{anchoredFrame.fullText}"</strong>
          </p>
          {!isBreathExerciseActive ? (
            <Button onClick={startBreathLoop} variant="secondary" className="bg-green-500 hover:bg-green-600 text-white">
              Start 30s Breath Loop
            </Button>
          ) : (
            <Button onClick={stopBreathLoop} variant="danger">
              Stop Breath Loop
            </Button>
          )}
          {breathPrompt && <p role="status" className="text-sm italic mt-2">{breathPrompt}</p>}
          {!speechSynthSupported && <p className="text-xs text-yellow-600 dark:text-yellow-400">Note: Speech synthesis for statement reading may not be supported by your browser. Chimes will still play.</p>}
        </div>
      )}
      
      {anchoredFrame && (
         <p className="text-green-600 dark:text-green-400 font-semibold">
            Your frame has been anchored!
        </p>
      )}


      <div className="flex justify-between items-center pt-6">
        <Button onClick={onBack} variant="secondary" disabled={isBreathExerciseActive}>
          Back
        </Button>
        <Button onClick={handleProceed} variant="primary" disabled={isBreathExerciseActive}>
          {anchoredFrame ? "Continue to Clarity Reflection" : "Skip to Clarity Reflection"}
        </Button>
      </div>
    </div>
  );
}

CommitAnchor.propTypes = {
  onComplete: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default CommitAnchor;