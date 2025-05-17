import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * @typedef {object} UseSpeechSynthesisOptions
 * @property {() => void} [onEnd] - Callback when speech ends naturally.
 * @property {(event: SpeechSynthesisErrorEvent) => void} [onError] - Callback on speech error.
 */

/**
 * Hook to use the browser's Speech Synthesis API.
 * @param {UseSpeechSynthesisOptions} [options={}]
 * @returns {{
 *   speak: (text: string, lang?: string, voiceURI?: string, rate?: number, pitch?: number) => void,
 *   cancel: () => void,
 *   isSpeaking: boolean,
 *   isSupported: boolean,
 *   voices: SpeechSynthesisVoice[],
 *   initSpeech: () => void // Function to explicitly initialize/load voices
 * }}
 */
export function useSpeechSynthesis(options = {}) {
  const { onEnd, onError } = options;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState([]);
  const synthRef = useRef(null);
  const utteranceRef = useRef(null);

  const populateVoiceList = useCallback(() => {
    if (!synthRef.current) return;
    const availableVoices = synthRef.current.getVoices();
    if (availableVoices.length > 0) {
      setVoices(availableVoices);
    }
    // Some browsers load voices asynchronously. If they are not immediately available,
    // the 'voiceschanged' event will fire when they are.
  }, []);

  const initSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      synthRef.current = window.speechSynthesis;
      populateVoiceList(); // Initial attempt
      if (synthRef.current.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = populateVoiceList;
      }
    } else {
      setIsSupported(false);
    }
  }, [populateVoiceList]);
  
  useEffect(() => {
    initSpeech(); // Initialize on mount

    return () => {
      // Cleanup: remove event listener and cancel any ongoing speech
      if (synthRef.current) {
        synthRef.current.onvoiceschanged = null;
        synthRef.current.cancel(); // Cancel any speech on unmount
      }
    };
  }, [initSpeech]);


  const speak = useCallback((text, lang = 'en-US', voiceURI = null, rate = 1, pitch = 1) => {
    if (!isSupported || !synthRef.current || !text) {
      if (onEnd) onEnd(); // Call onEnd if not supported to unblock logic
      return;
    }

    // Cancel any ongoing speech before starting new
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
      // Wait a moment for cancel to take effect, especially in some browsers
      // This might need a more robust solution like a queue if rapid firing is an issue
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;

    if (voiceURI) {
      const selectedVoice = voices.find(voice => voice.voiceURI === voiceURI);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };

    utterance.onerror = (event) => {
      setIsSpeaking(false);
      console.error('SpeechSynthesis Error:', event);
      if (onError) onError(event);
      if (onEnd) onEnd(); // Also call onEnd in case of error to not block flows
    };
    
    // Need to make sure synth isn't speaking from a previous quick call
    // A small delay can sometimes help, or a more complex queueing system
    // For this use case, immediate speaking is fine
    synthRef.current.speak(utterance);

  }, [isSupported, voices, onEnd, onError]);

  const cancel = useCallback(() => {
    if (isSupported && synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false); // Manually set as onend might not fire immediately or if not speaking
  }, [isSupported]);


  return { speak, cancel, isSpeaking, isSupported, voices, initSpeech };
}