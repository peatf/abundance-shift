import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';

const { speak, cancel, isSpeaking: speechIsSpeaking, isSupported: speechSupported, initSpeech } = useSpeechSynthesis();

const startBreathLoop = async () => {
  if (!topRatedFrame.current || !topRatedFrame.current.fullText) {
    showToast("No statement to anchor for breathwork.", "warning");
    return;
  }

  setIsBreathExerciseActive(true);
  if (!chimeAudioReady) await resumeChimeContext() || await initChimeAudio();
  initSpeech();

  const statement = topRatedFrame.current.fullText;
  const cycleDuration = 8000; // 8 seconds
  const numCycles = Math.floor(30000 / cycleDuration);

  for (let i = 0; i < numCycles; i++) {
    if (!isBreathExerciseActive) break;

    setBreathPrompt(`Inhale... (${statement})`);
    if (speechSupported && !speechIsSpeaking) {
      speak(statement);
    }
    playTone(0);
    await new Promise(r => setTimeout(r, 3000));
    if (!isBreathExerciseActive) break;

    setBreathPrompt("Hold...");
    playTone(0);
    await new Promise(r => setTimeout(r, 1000));
    if (!isBreathExerciseActive) break;

    setBreathPrompt("Exhale...");
    playTone(0);
    await new Promise(r => setTimeout(r, 3000));
    if (!isBreathExerciseActive) break;
    
    setBreathPrompt("Rest...");
    playTone(0);
    await new Promise(r => setTimeout(r, 1000));
  }
  
  setIsBreathExerciseActive(false);
  setBreathPrompt(anchoredFrame ? "Breathwork complete. Your frame is anchored." : "Breathwork complete.");
  cancel();
};

const stopBreathLoop = () => {
  setIsBreathExerciseActive(false);
  setBreathPrompt(anchoredFrame ? "Breathwork stopped. Your frame is anchored." : "Breathwork stopped.");
  cancel();
}; 