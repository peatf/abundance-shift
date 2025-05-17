import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAbundanceStore } from '../../store/abundanceStore';
import { useWebAudioTones } from '../../hooks/useWebAudioTones';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';
import Button from '../common/Button';

const TOTAL_DURATION_S = 90; // 90 seconds
const CYCLE_INHALE_S = 3;  // Fixed variable naming to avoid conflicts
const CYCLE_hold_S = 3; // Requirement: 3s inhale/hold/exhale/rest
const CYCLE_exhale_S = 3;
const CYCLE_rest_S = 3;
const FULL_CYCLE_S = CYCLE_INHALE_S + CYCLE_hold_S + CYCLE_exhale_S + CYCLE_rest_S; // 12 seconds per cycle

function AudioBreatheCue() {
  const { completeImmediateReliefExercise, returnToReliefMenu, showToast } = useAbundanceStore();
  
  const [prompt, setPrompt] = useState("Get Ready...");
  const [timeLeft, setTimeLeft] = useState(TOTAL_DURATION_S);
  const [isChimeOnly, setIsChimeOnly] = useState(false);
  const [isActive, setIsActive] = useState(false); // To control start/stop of the exercise itself
  const [pulseState, setPulseState] = useState('resting'); // 'inhaling', 'holding', 'exhaling', 'resting'

  // Audio Hooks
  const { playTone: playChime, initAudio: initChimeAudio, resumeContext: resumeChimeContext, isReady: chimeAudioReady } = useWebAudioTones({ 
    frequencies: [523.25], // C5 chime
    duration: 0.4, 
    volume: 0.5 
  });
  const { speak, cancel: cancelSpeech, isSupported: speechSynthSupported, initSpeech } = useSpeechSynthesis();

  const mainIntervalRef = useRef(null);
  const cycleTimeoutRef = useRef(null);
  const containerRef = useRef(null);

  const runBreathCycle = useCallback(async (remainingDuration) => {
    if (remainingDuration <= 0) {
      setPrompt("Breathe complete.");
      showToast("Relief achieved!", "success");
      if (containerRef.current) containerRef.current.classList.remove('animate-pulseRingBg');
      setTimeout(completeImmediateReliefExercise, 1500);
      return;
    }
    
    // INHALE
    setPrompt("Inhale...");
    setPulseState('inhaling');
    if (!isChimeOnly && speechSynthSupported) speak("Inhale");
    playChime(0);
    await new Promise(r => cycleTimeoutRef.current = setTimeout(r, CYCLE_INHALE_S * 1000));
    if (!isActive) return; // Check if stopped during await

    // HOLD
    setPrompt("Hold...");
    setPulseState('holding');
    if (!isChimeOnly && speechSynthSupported) speak("Hold");
    playChime(0);
    await new Promise(r => cycleTimeoutRef.current = setTimeout(r, CYCLE_hold_S * 1000));
    if (!isActive) return;

    // EXHALE
    setPrompt("Exhale...");
    setPulseState('exhaling');
    if (!isChimeOnly && speechSynthSupported) speak("Exhale");
    playChime(0);
    await new Promise(r => cycleTimeoutRef.current = setTimeout(r, CYCLE_exhale_S * 1000));
    if (!isActive) return;

    // REST
    setPrompt("Rest...");
    setPulseState('resting');
    if (!isChimeOnly && speechSynthSupported) speak("Rest");
    playChime(0);
    await new Promise(r => cycleTimeoutRef.current = setTimeout(r, CYCLE_rest_S * 1000));
    if (!isActive) return;
    
    // Loop
    runBreathCycle(remainingDuration - FULL_CYCLE_S);

  }, [isChimeOnly, speechSynthSupported, speak, playChime, showToast, completeImmediateReliefExercise, isActive]);


  const startExercise = async () => {
    if (!chimeAudioReady) {
        await resumeChimeContext() || await initChimeAudio();
    }
    initSpeech(); // Ensure speech is ready
    
    if (!chimeAudioReady && !isChimeOnly) { // If chime still not ready, and we need it
        showToast("Audio could not be initialized. Please check browser settings.", "error");
        return;
    }

    setIsActive(true);
    setTimeLeft(TOTAL_DURATION_S); // Reset timer
    
    mainIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { // When it hits 1, it will become 0 next, then stop
          clearInterval(mainIntervalRef.current);
          // runBreathCycle will handle final completion
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    runBreathCycle(TOTAL_DURATION_S);
    if (containerRef.current) containerRef.current.focus();
  };

  const stopExercise = (returnToMenu = false) => {
    setIsActive(false);
    if (mainIntervalRef.current) clearInterval(mainIntervalRef.current);
    if (cycleTimeoutRef.current) clearTimeout(cycleTimeoutRef.current);
    cancelSpeech();
    setPrompt("Paused. Ready to resume or exit.");
    setPulseState('resting'); // Reset pulse animation
    if (returnToMenu) {
        returnToReliefMenu();
    }
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => stopExercise();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Pulse animation styling based on state
  // The Tailwind config has a `pulseRing` keyframe. We'll apply it conditionally.
  // The keyframe: '0%': { transform: 'scale(0.33)', opacity: '1' }, '80%, 100%': { transform: 'scale(1)', opacity: '0' }
  // For inhale, expand: start small, grow big. For exhale, contract: start big, grow small.
  // We need different animations or to manipulate one cleverly.
  // A simpler approach: just toggle a class that applies a continuous pulse animation.
  // For precise inhale/exhale visuals, CSS transitions on scale/opacity are better.
  let pulseRingClasses = "w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-blue-400 dark:border-blue-300 transition-transform duration-[3000ms] ease-in-out"; // 3s for inhale/exhale
  if (pulseState === 'inhaling') {
    pulseRingClasses += " scale-150 opacity-70"; // Target state for end of inhale
  } else if (pulseState === 'exhaling') {
    pulseRingClasses += " scale-50 opacity-30"; // Target state for end of exhale
  } else { // holding or resting
    pulseRingClasses += " scale-100 opacity-50"; // Default mid state
  }


  return (
    <div
      ref={containerRef}
      tabIndex="-1"
      className="fixed inset-0 bg-gray-800 dark:bg-black text-white flex flex-col items-center justify-center space-y-8 p-4 transition-colors duration-300 outline-none"
      aria-live="polite"
    >
      {/* Timer and Controls */}
      <div className="absolute top-5 left-5 text-sm">Time Left: {timeLeft}s</div>
      <div className="absolute top-5 right-5 flex flex-col space-y-2 items-end">
        {!isActive ? (
            <Button onClick={startExercise} className="bg-green-500 hover:bg-green-600 text-white">Start Breathing</Button>
        ) : (
            <Button onClick={() => stopExercise(false)} className="bg-yellow-500 hover:bg-yellow-600 text-white">Pause</Button>
        )}
        <Button onClick={() => stopExercise(true)} variant="secondary" size="sm" className="bg-opacity-50 dark:bg-opacity-50">
            Exit to Menu
        </Button>
         {speechSynthSupported && (
            <label className="flex items-center space-x-2 text-xs cursor-pointer p-1 bg-black/20 rounded">
                <input type="checkbox" checked={isChimeOnly} onChange={() => setIsChimeOnly(prev => !prev)} className="form-checkbox rounded text-blue-500 focus:ring-blue-400"/>
                <span>Chime-Only Mode</span>
            </label>
         )}
      </div>

      {/* Pulse Ring Visual */}
      <div className="relative flex items-center justify-center w-48 h-48 md:w-64 md:h-64">
        {/* Static outer ring for reference */}
        <div className="absolute w-full h-full rounded-full border-2 border-white/20"></div>
        {/* Pulsing ring */}
        <div className={pulseRingClasses}></div>
      </div>
      
      {/* On-Screen Prompt */}
      <p className="text-3xl md:text-4xl font-semibold h-12">{prompt}</p>

      {!chimeAudioReady && !isChimeOnly && (
        <p className="text-xs text-yellow-300">Attempting to initialize audio. Click &quot;Start&quot; to enable if prompted.</p>
      )}
       {!speechSynthSupported && !isChimeOnly && (
        <p className="text-xs text-yellow-300">Verbal prompts may not be supported by your browser. Chimes will still play.</p>
      )}

    </div>
  );
}

export default AudioBreatheCue;