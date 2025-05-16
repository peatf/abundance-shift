import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * @typedef {object} UseWebAudioTonesOptions
 * @property {'sine'|'square'|'sawtooth'|'triangle'} [waveType='sine'] - Waveform type.
 * @property {number[]} [frequencies=[261.63, 329.63, 392.00, 440.00]] - Frequencies for tones (C4, E4, G4, A4).
 * @property {number} [duration=0.3] - Duration of each tone in seconds.
 * @property {number} [volume=0.3] - Volume (0 to 1).
 */

/**
 * Hook to play simple tones using Web Audio API.
 * @param {UseWebAudioTonesOptions} options
 * @returns {{ playTone: (index: number, onEnded?: () => void) => void, audioContext: AudioContext | null, isReady: boolean, resumeContext: () => Promise<void> }}
 */
export function useWebAudioTones({
  waveType = 'sine',
  frequencies = [261.63, 329.63, 392.00, 440.00], // C4, E4, G4, A4
  duration = 0.3, // seconds
  volume = 0.3,
} = {}) {
  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  const initAudio = useCallback(async () => {
    if (audioContextRef.current) return; // Already initialized

    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = context;
      const gain = context.createGain();
      gain.gain.setValueAtTime(volume, context.currentTime);
      gain.connect(context.destination);
      gainNodeRef.current = gain;

      // AudioContext might start suspended, especially in Safari/Chrome
      // We don't auto-resume here; user interaction (like clicking a button) should trigger resume.
      // The component using this hook should call resumeContext on first interaction.
      if (context.state === 'running') {
         setIsReady(true); // Ready if already running (unlikely without user gesture)
      } else {
         setIsReady(false); // Not ready until resumed by user gesture
      }

    } catch (e) {
      console.error('Web Audio API initialization failed:', e);
      setIsReady(false);
    }
  }, [volume]);

  const resumeContext = useCallback(async () => {
     const audioContext = audioContextRef.current;
    if (audioContext && audioContext.state === 'suspended') {
      try {
        await audioContext.resume();
        setIsReady(true);
        console.log('AudioContext resumed successfully.');
      } catch (error) {
        console.error('Failed to resume AudioContext:', error);
        setIsReady(false);
        throw error; // Re-throw to allow component to handle
      }
    } else if (!audioContext) {
       // If context wasn't even initialized, try that first
       await initAudio();
        if(audioContextRef.current && audioContextRef.current.state === 'suspended'){
             await resumeContext(); // Then try to resume the newly created context
        } else if (audioContextRef.current && audioContextRef.current.state === 'running'){
             setIsReady(true); // Successfully initialized and running
        }
    } else if (audioContext.state === 'running'){
         setIsReady(true); // Already running
    }
     // If context is closed, a new one would be needed, but that's complex
     // and usually handled by re-mounting the component using the hook.
  }, [initAudio]);

  useEffect(() => {
    // Initialize AudioContext on mount
     initAudio();

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
        audioContextRef.current = null;
      }
    };
  }, [initAudio]);

  const playTone = useCallback(
    (index, onEnded) => {
      const audioContext = audioContextRef.current;
      const gainNode = gainNodeRef.current;

      // Only play if audioContext exists and is ready (running)
      if (!audioContext || audioContext.state !== 'running') {
        console.warn('AudioContext not running. Cannot play tone.');
        if (onEnded) onEnded(); // Call onEnded to not block sequence flow
        return;
      }
      if (index < 0 || index >= frequencies.length) {
        console.warn('Invalid tone index.');
        if (onEnded) onEnded();
        return;
      }

      const oscillator = audioContext.createOscillator();
      oscillator.type = waveType;
      oscillator.frequency.setValueAtTime(frequencies[index], audioContext.currentTime);

      oscillator.connect(gainNode);
      oscillator.start();

      // Use onended event for more reliable sequence timing
       if (onEnded) {
         // Schedule the stop and the onEnded callback at the same time
         const stopTime = audioContext.currentTime + duration;
         oscillator.stop(stopTime);
         // Using setTimeout for onEnded is less precise than the oscillator.onended event, but simpler
         // For simple sequencing, setTimeout is often sufficient. For perfect sync, use onended.
         // Let's stick with setTimeout for simplicity based on the original code structure.
         setTimeout(onEnded, duration * 1000); // Convert seconds to milliseconds
       } else {
            oscillator.stop(audioContext.currentTime + duration);
       }

    },
    [waveType, frequencies, duration]
  ); // Removed isReady from dependencies as playTone checks context state directly

  return { playTone, audioContext: audioContextRef.current, isReady, resumeContext };
} 