import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAbundanceStore, stages } from '../store/abundanceStore';

// Stage Components (import them as they are created)
import WillingnessCalibration from './WillingnessCalibration';
import OpennessPrimer from './OpennessPrimer/OpennessPrimer';
import ActivePerceptionReframingWorkshop from './PerceptionWorkshop/ActivePerceptionReframingWorkshop';
import ContrastClarityReflection from './ContrastClarityReflection';
import ImmediateReliefPracticeMenu from './ImmediateReliefPractice/ImmediateReliefPracticeMenu';
import PatternMicroPuzzleRelief from './ImmediateReliefPractice/PatternMicroPuzzleRelief';
import AudioBreatheCue from './ImmediateReliefPractice/AudioBreatheCue';
import ReinforcementBecoming from './ReinforcementBecoming';

// Common Components
import Toast from './common/Toast';
import ThemeToggleButton from './common/ThemeToggleButton'; // Assuming you create this

/**
 * @typedef {object} AbundanceGPSProps
 * @property {() => void} [onModuleComplete] - Optional callback when the module is fully completed (or reset).
 * @property {string} [initialTheme] - Optional initial theme ('light' or 'dark').
 */

/**
 * Main orchestrator for the Abundance GPS module.
 * Manages flow through different stages based on global state.
 * @param {AbundanceGPSProps} props
 */
function AbundanceGPS({ onModuleComplete, initialTheme }) {
  const currentStage = useAbundanceStore((state) => state.currentStage);
  const theme = useAbundanceStore((state) => state.theme);
  const toast = useAbundanceStore((state) => state.toast);
  const hideToast = useAbundanceStore((state) => state.hideToast);
  const toggleTheme = useAbundanceStore((state) => state.toggleTheme);
  const finishModuleAndReset = useAbundanceStore((state) => state.finishModuleAndReset);
  const { immediateReliefCurrentSubStage } = useAbundanceStore();


  useEffect(() => {
    if (initialTheme && (initialTheme === 'light' || initialTheme === 'dark')) {
      if (theme !== initialTheme) {
         // This assumes toggleTheme is the only way to set theme.
         // A direct setTheme action would be better for initialization.
         // For now, let's ensure persist middleware doesn't override initial prop too aggressively.
         // A better approach: useAbundanceStore.setState({ theme: initialTheme }) on mount if different.
         // This should be done carefully to not conflict with persisted theme.
         // Simplest for now: If host provides initialTheme, it overrides persisted one on first load.
         // This requires `useAbundanceStore.setState` to be callable outside component.
         // Or, do it in a one-time effect:
         useAbundanceStore.setState({ theme: initialTheme });
      }
    }
  }, [initialTheme, theme, toggleTheme]);

  useEffect(() => {
    // Apply dark class to a wrapper or html element
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const renderCurrentStage = () => {
    switch (currentStage) {
      case stages.WILLINGNESS_CALIBRATION:
        return <WillingnessCalibration />;
      case stages.OPENNESS_PRIMER:
        return <OpennessPrimer />;
      case stages.PERCEPTION_WORKSHOP:
        return <ActivePerceptionReframingWorkshop />;
      case stages.CONTRAST_CLARITY_REFLECTION:
        return <ContrastClarityReflection />;
      case stages.IMMEDIATE_RELIEF_PRACTICE:
        // Further route based on immediateReliefCurrentSubStage
        switch (immediateReliefCurrentSubStage) {
          case 'PATTERN_PUZZLE_RELIEF':
            return <PatternMicroPuzzleRelief />;
          case 'AUDIO_BREATHE_RELIEF':
            return <AudioBreatheCue />;
          case 'MENU':
          default:
            return <ImmediateReliefPracticeMenu />;
        }
      case stages.REINFORCEMENT_BECOMING:
        return <ReinforcementBecoming onComplete={() => {
          if (onModuleComplete) onModuleComplete();
          finishModuleAndReset(); // Reset the module state for a new run
        }} />;
      default:
        // This case should ideally not be reached if logic is correct
        return (
          <div className="p-4 text-red-500">
            Error: Unknown stage or flow corruption. Please reset.
            <button onClick={finishModuleAndReset} className="mt-2 p-2 bg-blue-500 text-white rounded">Reset Module</button>
          </div>
        );
    }
  };

  return (
    <div className={`abundance-gps-module min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 p-4 flex flex-col items-center justify-center font-sans`}>
      <div className="absolute top-4 right-4">
        <ThemeToggleButton />
      </div>
      <div className="w-full max-w-2xl mx-auto shadow-xl rounded-lg bg-white dark:bg-slate-800 p-6 md:p-8">
        {renderCurrentStage()}
      </div>
      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={hideToast}
        />
      )}
    </div>
  );
}

AbundanceGPS.propTypes = {
  onModuleComplete: PropTypes.func,
  initialTheme: PropTypes.oneOf(['light', 'dark']),
};

export default AbundanceGPS; 