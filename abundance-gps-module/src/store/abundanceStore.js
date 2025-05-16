import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const stages = {
  WILLINGNESS_CALIBRATION: 'WILLINGNESS_CALIBRATION',
  OPENNESS_PRIMER: 'OPENNESS_PRIMER',
  PERCEPTION_WORKSHOP: 'PERCEPTION_WORKSHOP',
  CONTRAST_CLARITY_REFLECTION: 'CONTRAST_CLARITY_REFLECTION',
  IMMEDIATE_RELIEF_PRACTICE: 'IMMEDIATE_RELIEF_PRACTICE',
  REINFORCEMENT_BECOMING: 'REINFORCEMENT_BECOMING',
};

export const opennessPrimerSubStages = {
  PATTERN_PUZZLE: 'PATTERN_PUZZLE',
  SEQUENCE_TAP: 'SEQUENCE_TAP',
};

export const immediateReliefSubStages = {
  MENU: 'MENU',
  PATTERN_PUZZLE_RELIEF: 'PATTERN_PUZZLE_RELIEF',
  AUDIO_BREATHE_RELIEF: 'AUDIO_BREATHE_RELIEF',
};

const initialWorkshopState = {
  currentInterpretation: '',
  evidenceWrong: ['', ''],
  evidenceServing: ['', ''],
  alternativeFrames: [
    { id: 'temp', text: 'This is temporary because…', userCompletion: '', rating: 0 },
    { id: 'teaching', text: 'This stage is teaching me…', userCompletion: '', rating: 0 },
    { id: 'confirms', text: 'This experience confirms that I…', userCompletion: '', rating: 0 },
  ],
  anchoredFrame: null,
};

const initialClarityState = {
  clarityReflectionInput: '',
  clarityReflectionType: 'text', // 'text' or 'audioBlobUrl'
  clarityReflectionAudioBlob: null,
};

export const useAbundanceStore = create(
  persist(
    (set, get) => ({
      currentStage: stages.WILLINGNESS_CALIBRATION,
      willingnessScore: 50, // Default to a mid-range for dev
      opennessPrimerAttempts: 0,
      opennessPrimerCurrentExercise: opennessPrimerSubStages.PATTERN_PUZZLE,

      ...initialWorkshopState,
      ...initialClarityState,

      journal: [], // array of anchored frames: { text, userCompletion, timestamp }

      exitMessage: '', // For premature exits
      finalReinforcementMessage: '',

      immediateReliefCurrentSubStage: immediateReliefSubStages.MENU,
      
      toast: { message: '', type: 'info', visible: false, id: null }, // For toast notifications

      theme: 'light',
      toggleTheme: () => set(state => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

      // Actions
      setWillingnessScore: (score) => {
        set({ willingnessScore: score });
        if (score < 50) {
          const exitMsg = "Openness requires curiosity. Return when you're ready, or explore our Intro Guide for foundational practices.";
          set({
            exitMessage: exitMsg,
          });
          get()._prepareForReinforcement();
        } else if (score < 70) {
          set({
            currentStage: stages.OPENNESS_PRIMER,
            opennessPrimerAttempts: 0,
            opennessPrimerCurrentExercise: opennessPrimerSubStages.PATTERN_PUZZLE,
            exitMessage: '', // Clear any previous exit message
          });
        } else {
          set({ currentStage: stages.PERCEPTION_WORKSHOP, exitMessage: '' });
        }
      },

      failOpennessPrimerAttempt: () => {
        const attempts = get().opennessPrimerAttempts + 1;
        set({ opennessPrimerAttempts: attempts });
        if (attempts >= 2) {
          const exitMsg = "Openness requires curiosity. Return when you're ready, or explore our Intro Guide for foundational practices.";
          set({ exitMessage: exitMsg });
          get()._prepareForReinforcement();
          return true; // Indicates exit
        }
        // Switch to the other exercise
        if (get().opennessPrimerCurrentExercise === opennessPrimerSubStages.PATTERN_PUZZLE) {
            set({ opennessPrimerCurrentExercise: opennessPrimerSubStages.SEQUENCE_TAP });
        } else {
            // This case should ideally not be hit if logic in OpennessPrimer component is correct
            // (i.e., it tries PATTERN_PUZZLE then SEQUENCE_TAP).
            // If it does, it means both failed, handled by attempts >= 2.
        }
        return false; // Indicates can try another exercise
      },
      succeedOpennessPrimer: () => {
        set({ currentStage: stages.PERCEPTION_WORKSHOP, opennessPrimerAttempts: 0, exitMessage: '' });
        get().showToast("Alignment achieved!", "success");
      },

      updateCurrentInterpretation: (text) => set({ currentInterpretation: text }),
      updateEvidence: (type, index, text) => {
        const key = type === 'wrong' ? 'evidenceWrong' : 'evidenceServing';
        set(state => {
          const currentEvidence = [...state[key]];
          currentEvidence[index] = text;
          return { [key]: currentEvidence };
        });
      },
      addEvidenceBullet: (type) => {
        const key = type === 'wrong' ? 'evidenceWrong' : 'evidenceServing';
        set(state => {
            const currentEvidence = [...state[key], ''];
            if (currentEvidence.length <= 3) {
                return { [key]: currentEvidence };
            }
            return {}; // No change if already 3
        });
      },
      removeEvidenceBullet: (type, index) => {
        const key = type === 'wrong' ? 'evidenceWrong' : 'evidenceServing';
        set(state => {
            const currentEvidence = [...state[key]];
            if (currentEvidence.length > 2) { // Keep at least 2
                currentEvidence.splice(index, 1);
                return { [key]: currentEvidence };
            }
            return {};
        });
      },
      updateAlternativeFrameCompletion: (id, userCompletion) => {
        set(state => ({
          alternativeFrames: state.alternativeFrames.map(frame =>
            frame.id === id ? { ...frame, userCompletion } : frame
          ),
        }));
      },
      updateAlternativeFrameRating: (id, rating) => {
        set(state => ({
          alternativeFrames: state.alternativeFrames.map(frame =>
            frame.id === id ? { ...frame, rating: Number(rating) } : frame
          ),
        }));
      },
      commitAndAnchorFrame: () => {
        const frames = get().alternativeFrames;
        const topFrame = frames
          .filter(f => f.userCompletion.trim() !== '') // Only consider completed frames
          .reduce((max, frame) => (frame.rating > (max?.rating || 0) ? frame : max), null);
        
        if (topFrame) {
          const anchored = { 
            statement: topFrame.text, // The template part
            completion: topFrame.userCompletion, // The user's completion
            fullText: `${topFrame.text.replace('…', '')} ${topFrame.userCompletion}`, // Combined
            rating: topFrame.rating,
            timestamp: new Date().toISOString() 
          };
          set(state => ({
            anchoredFrame: anchored,
            journal: [...state.journal, anchored],
          }));
          get().showToast("Frame anchored to journal!", "success");
          return true; // Indicates success
        }
        get().showToast("Please complete and rate at least one frame to anchor.", "warning");
        return false; // Indicates failure or nothing to anchor
      },
      proceedFromWorkshop: () => {
        set({ currentStage: stages.CONTRAST_CLARITY_REFLECTION });
      },
      
      setClarityReflectionText: (input) => {
        set({
          clarityReflectionInput: input,
          clarityReflectionType: 'text',
          clarityReflectionAudioBlob: null,
        });
      },
      setClarityReflectionAudio: (audioBlob, audioUrl) => {
        set({
          clarityReflectionInput: audioUrl, // Store URL for playback
          clarityReflectionType: 'audio',
          clarityReflectionAudioBlob: audioBlob, // Store Blob for potential upload/processing
        });
      },
      proceedFromClarity: () => {
        set({
          currentStage: stages.IMMEDIATE_RELIEF_PRACTICE,
          immediateReliefCurrentSubStage: immediateReliefSubStages.MENU,
        });
      },

      startImmediateReliefExercise: (exerciseType) => {
        if (exerciseType === 'pattern') {
          set({ immediateReliefCurrentSubStage: immediateReliefSubStages.PATTERN_PUZZLE_RELIEF });
        } else if (exerciseType === 'audio') {
          set({ immediateReliefCurrentSubStage: immediateReliefSubStages.AUDIO_BREATHE_RELIEF });
        }
      },
      completeImmediateReliefExercise: () => {
        get().showToast("Relief achieved!", "success");
        get()._prepareForReinforcement();
      },
      skipImmediateReliefPuzzle: () => {
        set({ immediateReliefCurrentSubStage: immediateReliefSubStages.MENU });
      },
      returnToReliefMenu: () => { // Used by sub-relief practices to go back
        set({ immediateReliefCurrentSubStage: immediateReliefSubStages.MENU });
      },


      _prepareForReinforcement: () => {
        const messages = [
          "You are not wrong, you are becoming.",
          "This moment is the perfect launching pad.",
          "Relief is always available.",
        ];
        const randomIndex = Math.floor(Math.random() * messages.length);
        set({ 
            finalReinforcementMessage: messages[randomIndex],
            currentStage: stages.REINFORCEMENT_BECOMING 
        });
      },
      
      finishModuleAndReset: () => {
        set({
          currentStage: stages.WILLINGNESS_CALIBRATION,
          willingnessScore: 50,
          opennessPrimerAttempts: 0,
          opennessPrimerCurrentExercise: opennessPrimerSubStages.PATTERN_PUZZLE,
          ...initialWorkshopState,
          ...initialClarityState,
          // Journal is persisted, so it's not reset here.
          // Theme is also persisted.
          exitMessage: '',
          finalReinforcementMessage: '',
          immediateReliefCurrentSubStage: immediateReliefSubStages.MENU,
          toast: { message: '', type: 'info', visible: false, id: null },
        });
      },
      
      clearJournal: () => set({ journal: [] }),

      showToast: (message, type = 'info', duration = 3000) => {
        const id = Date.now();
        set({ toast: { message, type, visible: true, id } });
        setTimeout(() => {
          // Only hide if it's still the same toast
          if (get().toast.id === id) {
            set(state => ({ toast: { ...state.toast, visible: false } }));
          }
        }, duration);
      },
      hideToast: () => set(state => ({ toast: { ...state.toast, visible: false } })),

    }),
    {
      name: 'abundance-gps-storage',
      partialize: (state) => ({
        journal: state.journal,
        theme: state.theme,
      }),
    }
  )
); 