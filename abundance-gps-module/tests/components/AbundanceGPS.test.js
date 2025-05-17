import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AbundanceGPS from '@src/AbundanceGPS'; // Assuming AbundanceGPS is at src/AbundanceGPS.js
import { useAbundanceStore, stages, immediateReliefSubStages } from '@src/store/abundanceStore';

// Mock child components (stages) to simplify testing the orchestrator
const MockWillingnessCalibration = () => <div data-testid="willingness-calibration-stage">Willingness Calibration</div>;
MockWillingnessCalibration.displayName = 'MockWillingnessCalibration';
jest.mock('@src/components/WillingnessCalibration', () => MockWillingnessCalibration);

const MockOpennessPrimer = () => <div data-testid="openness-primer-stage">Openness Primer</div>;
MockOpennessPrimer.displayName = 'MockOpennessPrimer';
jest.mock('@src/components/OpennessPrimer/OpennessPrimer', () => MockOpennessPrimer);

const MockPerceptionWorkshop = () => <div data-testid="perception-workshop-stage">Perception Workshop</div>;
MockPerceptionWorkshop.displayName = 'MockPerceptionWorkshop';
jest.mock('@src/components/PerceptionWorkshop/ActivePerceptionReframingWorkshop', () => MockPerceptionWorkshop);

const MockClarityReflection = () => <div data-testid="clarity-reflection-stage">Clarity Reflection</div>;
MockClarityReflection.displayName = 'MockClarityReflection';
jest.mock('@src/components/ContrastClarityReflection', () => MockClarityReflection);

const MockReliefMenu = () => <div data-testid="relief-menu-stage">Relief Menu</div>;
MockReliefMenu.displayName = 'MockReliefMenu';
jest.mock('@src/components/ImmediateReliefPractice/ImmediateReliefPracticeMenu', () => MockReliefMenu);

const MockReliefPuzzle = () => <div data-testid="relief-puzzle-stage">Relief Puzzle</div>;
MockReliefPuzzle.displayName = 'MockReliefPuzzle';
jest.mock('@src/components/ImmediateReliefPractice/PatternMicroPuzzleRelief', () => MockReliefPuzzle);

const MockReliefAudio = () => <div data-testid="relief-audio-stage">Relief Audio</div>;
MockReliefAudio.displayName = 'MockReliefAudio';
jest.mock('@src/components/ImmediateReliefPractice/AudioBreatheCue', () => MockReliefAudio);

// Mock ReinforcementBecoming - disabling prop-types for this mock as it's specific to the test
// eslint-disable-next-line react/prop-types
const MockReinforcementBecoming = ({ onComplete }) => (
  <div data-testid="reinforcement-stage">
    Reinforcement <button onClick={onComplete}>Finish</button>
  </div>
);
MockReinforcementBecoming.displayName = 'MockReinforcementBecoming';
jest.mock('@src/components/ReinforcementBecoming', () => MockReinforcementBecoming);

// Mock Toast - make it a button to satisfy a11y, or disable a11y for this line.
// For mocks, using a button is simpler if it needs to be interactive for the test.
// eslint-disable-next-line react/prop-types
const MockToast = ({ message, type, onDismiss }) => (
  <button data-testid="toast" onClick={onDismiss}>
    {message} ({type})
  </button>
);
MockToast.displayName = 'MockToast';
jest.mock('@src/components/common/Toast', () => MockToast);

const MockThemeToggleButton = () => <button data-testid="theme-toggle-button">Toggle Theme</button>;
MockThemeToggleButton.displayName = 'MockThemeToggleButton';
jest.mock('@src/components/common/ThemeToggleButton', () => MockThemeToggleButton);

// Mock Zustand store
const mockFinishModuleAndReset = jest.fn();
const mockHideToast = jest.fn();
const mockToggleTheme = jest.fn();

// Helper to set up the mock store state for a specific test
const setupMockStore = (stateOverrides = {}) => {
  const defaultState = {
    currentStage: stages.WILLINGNESS_CALIBRATION,
    theme: 'light',
    toast: { message: '', type: 'info', visible: false, id: null },
    immediateReliefCurrentSubStage: immediateReliefSubStages.MENU,
    finishModuleAndReset: mockFinishModuleAndReset,
    hideToast: mockHideToast,
    toggleTheme: mockToggleTheme,
    // Add any other state properties AbundanceGPS directly reads
    ...stateOverrides,
  };

  // This ensures that each call to useAbundanceStore gets the current state of our mock
  (useAbundanceStore).mockImplementation(selector => selector(defaultState));
  
  // Allow AbundanceGPS to call setState if it needs to (e.g., for initialTheme)
  // But generally, we control state via selector for reads.
  useAbundanceStore.setState = jest.fn(updater => {
    const newState = typeof updater === 'function' ? updater(defaultState) : updater;
    Object.assign(defaultState, newState); // Mutate our 'defaultState' for subsequent selections
  });
};

jest.mock('@src/store/abundanceStore', () => {
  const originalModule = jest.requireActual('@src/store/abundanceStore');
  return {
    __esModule: true,
    ...originalModule, // Export stages, etc.
    useAbundanceStore: jest.fn(), // Will be implemented by setupMockStore
  };
});

describe('AbundanceGPS Component', () => {
  beforeEach(() => {
    mockFinishModuleAndReset.mockClear();
    mockHideToast.mockClear();
    mockToggleTheme.mockClear();
    // DocumentElement classList mock for dark mode
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add = jest.fn();
    document.documentElement.classList.remove = jest.fn();
  });

  test('renders WillingnessCalibration stage by default', () => {
    setupMockStore({ currentStage: stages.WILLINGNESS_CALIBRATION });
    render(<AbundanceGPS />);
    expect(screen.getByTestId('willingness-calibration-stage')).toBeInTheDocument();
  });

  test('renders OpennessPrimer stage when currentStage is OPENNESS_PRIMER', () => {
    setupMockStore({ currentStage: stages.OPENNESS_PRIMER });
    render(<AbundanceGPS />);
    expect(screen.getByTestId('openness-primer-stage')).toBeInTheDocument();
  });

  test('renders PerceptionWorkshop stage when currentStage is PERCEPTION_WORKSHOP', () => {
    setupMockStore({ currentStage: stages.PERCEPTION_WORKSHOP });
    render(<AbundanceGPS />);
    expect(screen.getByTestId('perception-workshop-stage')).toBeInTheDocument();
  });

  test('renders ContrastClarityReflection stage when currentStage is CONTRAST_CLARITY_REFLECTION', () => {
    setupMockStore({ currentStage: stages.CONTRAST_CLARITY_REFLECTION });
    render(<AbundanceGPS />);
    expect(screen.getByTestId('clarity-reflection-stage')).toBeInTheDocument();
  });

  describe('Immediate Relief Practice Stage Routing', () => {
    test('renders ReliefMenu when stage is IMMEDIATE_RELIEF_PRACTICE and sub-stage is MENU', () => {
      setupMockStore({
        currentStage: stages.IMMEDIATE_RELIEF_PRACTICE,
        immediateReliefCurrentSubStage: immediateReliefSubStages.MENU,
      });
      render(<AbundanceGPS />);
      expect(screen.getByTestId('relief-menu-stage')).toBeInTheDocument();
    });

    test('renders ReliefPuzzle when sub-stage is PATTERN_PUZZLE_RELIEF', () => {
      setupMockStore({
        currentStage: stages.IMMEDIATE_RELIEF_PRACTICE,
        immediateReliefCurrentSubStage: immediateReliefSubStages.PATTERN_PUZZLE_RELIEF,
      });
      render(<AbundanceGPS />);
      expect(screen.getByTestId('relief-puzzle-stage')).toBeInTheDocument();
    });

    test('renders ReliefAudio when sub-stage is AUDIO_BREATHE_RELIEF', () => {
      setupMockStore({
        currentStage: stages.IMMEDIATE_RELIEF_PRACTICE,
        immediateReliefCurrentSubStage: immediateReliefSubStages.AUDIO_BREATHE_RELIEF,
      });
      render(<AbundanceGPS />);
      expect(screen.getByTestId('relief-audio-stage')).toBeInTheDocument();
    });
  });

  test('renders ReinforcementBecoming stage and calls onModuleComplete and finishModuleAndReset on completion', () => {
    const mockOnCompleteProp = jest.fn();
    setupMockStore({ currentStage: stages.REINFORCEMENT_BECOMING });
    render(<AbundanceGPS onModuleComplete={mockOnCompleteProp} />);
    
    expect(screen.getByTestId('reinforcement-stage')).toBeInTheDocument();
    
    // Simulate the ReinforcementBecoming component calling its onComplete prop
    // This means clicking the "Finish" button inside the mocked ReinforcementBecoming
    fireEvent.click(screen.getByRole('button', {name: 'Finish'}));

    expect(mockOnCompleteProp).toHaveBeenCalledTimes(1);
    expect(mockFinishModuleAndReset).toHaveBeenCalledTimes(1);
  });
  
  test('renders ThemeToggleButton', () => {
    setupMockStore();
    render(<AbundanceGPS />);
    expect(screen.getByTestId('theme-toggle-button')).toBeInTheDocument();
  });

  test('displays Toast when toast is visible in store', () => {
    setupMockStore({
      toast: { message: 'Test Toast', type: 'success', visible: true, id: 1 },
    });
    render(<AbundanceGPS />);
    expect(screen.getByTestId('toast')).toBeInTheDocument();
    expect(screen.getByText(/Test Toast/i)).toBeInTheDocument();
    expect(screen.getByText(/\(success\)/i)).toBeInTheDocument();
  });

  test('calls hideToast when Toast is dismissed', () => {
    setupMockStore({
      toast: { message: 'Dismissible Toast', type: 'info', visible: true, id: 2 },
    });
    render(<AbundanceGPS />);
    
    const toastElement = screen.getByTestId('toast');
    fireEvent.click(toastElement); // Assuming mock Toast calls onDismiss on click
    
    expect(mockHideToast).toHaveBeenCalledTimes(1);
  });

  test('applies dark mode class to html element when theme is dark', () => {
    setupMockStore({ theme: 'dark' });
    render(<AbundanceGPS />);
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
    expect(document.documentElement.classList.remove).not.toHaveBeenCalledWith('dark');
  });

  test('removes dark mode class from html element when theme is light', () => {
    setupMockStore({ theme: 'light' });
    // Simulate it was dark before
    document.documentElement.classList.contains = jest.fn(() => true); 
    render(<AbundanceGPS />);
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark');
    expect(document.documentElement.classList.add).not.toHaveBeenCalledWith('dark');
  });
  
  test('sets initial theme from prop if provided', () => {
    // This test relies on the mockStore.setState to be effective
    // The AbundanceGPS useEffect calls useAbundanceStore.setState directly
    const mockSetStateFromStore = jest.fn();
    useAbundanceStore.setState = mockSetStateFromStore; // Override global mock's setState for this test

    setupMockStore({ theme: 'light' }); // Initial store theme
    render(<AbundanceGPS initialTheme="dark" />);
    
    // The useEffect in AbundanceGPS should call setState to update the theme
    expect(mockSetStateFromStore).toHaveBeenCalledWith({ theme: 'dark' });
  });

});