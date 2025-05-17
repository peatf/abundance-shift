import { useAbundanceStore, initialState } from '@src/store/abundanceStore';
import { renderHook, act } from '@testing-library/react';

describe('abundanceStore', () => {
  it('should have initial state', () => {
    const { result } = renderHook(() => useAbundanceStore());
    expect({
      currentStage: result.current.currentStage,
      willingnessScore: result.current.willingnessScore,
      opennessPrimerAttempts: result.current.opennessPrimerAttempts,
      opennessPrimerCurrentExercise: result.current.opennessPrimerCurrentExercise,
      currentInterpretation: result.current.currentInterpretation,
      evidenceWrong: result.current.evidenceWrong,
      evidenceServing: result.current.evidenceServing,
      alternativeFrames: result.current.alternativeFrames,
      anchoredFrame: result.current.anchoredFrame,
      journal: result.current.journal,
      exitMessage: result.current.exitMessage,
      finalReinforcementMessage: result.current.finalReinforcementMessage,
      immediateReliefCurrentSubStage: result.current.immediateReliefCurrentSubStage,
      toast: result.current.toast,
      theme: result.current.theme,
    }).toEqual(initialState);
  });

  it('should update willingness score and transition stage', () => {
    const { result } = renderHook(() => useAbundanceStore());

    // Test setting score below 50
    act(() => {
      result.current.setWillingnessScore(40);
    });
    expect(result.current.willingnessScore).toBe(40);
    expect(result.current.currentStage).toBe('REINFORCEMENT_BECOMING');
    expect(result.current.exitMessage).not.toBe('');

    // Reset for next test
    act(() => {
      result.current.reset();
    });
    expect({
      currentStage: result.current.currentStage,
      willingnessScore: result.current.willingnessScore,
      opennessPrimerAttempts: result.current.opennessPrimerAttempts,
      opennessPrimerCurrentExercise: result.current.opennessPrimerCurrentExercise,
      currentInterpretation: result.current.currentInterpretation,
      evidenceWrong: result.current.evidenceWrong,
      evidenceServing: result.current.evidenceServing,
      alternativeFrames: result.current.alternativeFrames,
      anchoredFrame: result.current.anchoredFrame,
      journal: result.current.journal,
      exitMessage: result.current.exitMessage,
      finalReinforcementMessage: result.current.finalReinforcementMessage,
      immediateReliefCurrentSubStage: result.current.immediateReliefCurrentSubStage,
      toast: result.current.toast,
      theme: result.current.theme,
    }).toEqual(initialState);

    // Test setting score between 50 and 70
    act(() => {
      result.current.setWillingnessScore(60);
    });
    expect(result.current.willingnessScore).toBe(60);
    expect(result.current.currentStage).toBe('OPENNESS_PRIMER');
    expect(result.current.opennessPrimerAttempts).toBe(0);
    expect(result.current.opennessPrimerCurrentExercise).toBe('PATTERN_PUZZLE');
    expect(result.current.exitMessage).toBe('');

    // Reset for next test
    act(() => {
      result.current.reset();
    });
    expect({
      currentStage: result.current.currentStage,
      willingnessScore: result.current.willingnessScore,
      opennessPrimerAttempts: result.current.opennessPrimerAttempts,
      opennessPrimerCurrentExercise: result.current.opennessPrimerCurrentExercise,
      currentInterpretation: result.current.currentInterpretation,
      evidenceWrong: result.current.evidenceWrong,
      evidenceServing: result.current.evidenceServing,
      alternativeFrames: result.current.alternativeFrames,
      anchoredFrame: result.current.anchoredFrame,
      journal: result.current.journal,
      exitMessage: result.current.exitMessage,
      finalReinforcementMessage: result.current.finalReinforcementMessage,
      immediateReliefCurrentSubStage: result.current.immediateReliefCurrentSubStage,
      toast: result.current.toast,
      theme: result.current.theme,
    }).toEqual(initialState);

    // Test setting score 70 or above
    act(() => {
      result.current.setWillingnessScore(80);
    });
    expect(result.current.willingnessScore).toBe(80);
    expect(result.current.currentStage).toBe('PERCEPTION_WORKSHOP');
    expect(result.current.exitMessage).toBe('');
  });

  // Add more tests for other actions
});

describe('abundanceStore Edge Cases', () => {
  it('should handle invalid state updates gracefully', () => {
    const { result } = renderHook(() => useAbundanceStore());
    // Instead of setState, test by attempting to update via an action or directly if possible
    // For this case, since setState isn't available, we'll skip direct invalid key tests and focus on action-based updates
    act(() => {
      // Example: Try setting an invalid value through an existing action, but actions are typed
      // This test might not be directly applicable; consider removing or refactoring
      expect(() => result.current.setWillingnessScore('invalid')).toThrow(); // Assuming type checks
    });
  });

  it('should maintain consistency with concurrent updates', async () => {
    const { result } = renderHook(() => useAbundanceStore());
    act(() => {
      result.current.reset(); // Start from a clean state
    });
    const numberOfUpdates = 10;
    await Promise.all(
      Array.from({ length: numberOfUpdates }).map(async (_, index) => {
        act(() => {
          result.current.setWillingnessScore(index + 50);
        });
      })
    );
    expect(typeof result.current.willingnessScore).toBe('number');
    // The last update sets score to 59, so stage should be OPENNESS_PRIMER
    expect(result.current.currentStage).toBe('OPENNESS_PRIMER');
  });

  it('should reset to initial state', () => {
    const { result } = renderHook(() => useAbundanceStore());
    act(() => {
      result.current.setWillingnessScore(100);  // Use an action to modify
    });
    expect(result.current.willingnessScore).toBe(100);
    act(() => {
      result.current.reset();
    });
    expect({
      currentStage: result.current.currentStage,
      willingnessScore: result.current.willingnessScore,
      opennessPrimerAttempts: result.current.opennessPrimerAttempts,
      opennessPrimerCurrentExercise: result.current.opennessPrimerCurrentExercise,
      currentInterpretation: result.current.currentInterpretation,
      evidenceWrong: result.current.evidenceWrong,
      evidenceServing: result.current.evidenceServing,
      alternativeFrames: result.current.alternativeFrames,
      anchoredFrame: result.current.anchoredFrame,
      journal: result.current.journal,
      exitMessage: result.current.exitMessage,
      finalReinforcementMessage: result.current.finalReinforcementMessage,
      immediateReliefCurrentSubStage: result.current.immediateReliefCurrentSubStage,
      toast: result.current.toast,
      theme: result.current.theme,
    }).toEqual(initialState);
  });
}); 