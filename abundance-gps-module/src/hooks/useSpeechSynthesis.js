import { useCallback, useState } from 'react';

/**
 * @typedef {object} UseSpeechSynthesisOptions
 * @property {string} [lang='en-US'] - The language of the speech.
 * @property {number} [pitch=1] - The pitch of the speech (0 to 2).
 * @property {number} [rate=1] - The speed of the speech (0.1 to 10).
 * @property {number} [volume=1] - The volume of the speech (0 to 1).
 */

/**
 * Hook to use the Web Speech Synthesis API.
 * @param {UseSpeechSynthesisOptions} options
 * @returns {{ speak: (text: string, onEnd?: () => void) => void, cancel: () => void, speaking: boolean, supported: boolean }}
 */
export function useSpeechSynthesis({ lang = 'en-US', pitch = 1, rate = 1, volume = 1 } = {}) {
  const [speaking, setSpeaking] = useState(false);
  const supported = !!window.speechSynthesis;

  const speak = useCallback((text, onEnd) => {
    if (!supported || !text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.pitch = pitch;
    utterance.rate = rate;
    utterance.volume = volume;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => {
      setSpeaking(false);
      if (onEnd) onEnd();
    };
    utterance.onerror = (event) => {
      console.error('SpeechSynthesisUtterance.onerror', event);
      setSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [supported, lang, pitch, rate, volume]);

  const cancel = useCallback(() => {
    if (supported && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, [supported]);

  return { speak, cancel, speaking, supported };
} 