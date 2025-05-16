import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AbundanceGPS from '@src/AbundanceGPS'; // Assuming AbundanceGPS is at src/AbundanceGPS
import { useAbundanceStore, stages } from '@src/store/abundanceStore';

// Mocking the Zustand store
jest.mock('@src/store/abundanceStore', () => ({
  ...jest.requireActual('@src/store/abundanceStore'),
  useAbundanceStore: jest.fn(),
  stages: jest.requireActual('@src/store/abundanceStore').stages, // Keep actual stages enum
}));

// Mock child components that represent different stages
// This prevents testing the children's implementation details here
jest.mock('@src/components/WillingnessCalibration', () => () => <div>WillingnessCalibration</div>);
jest.mock('@src/components/OpennessPrimer', () => () => <div>OpennessPrimer</div>);
jest.mock('@src/components/ActivePerceptionReframingWorkshop', () => () => <div>ActivePerceptionReframingWorkshop</div>);
jest.mock('@src/components/ContrastClarityReflection', () => () => <div>ContrastClarityReflection</div>);
jest.mock('@src/components/ImmediateReliefPracticeMenu', () => () => <div>ImmediateReliefPracticeMenu</div>);
jest.mock('@src/components/ReinforcementBecoming', () => () => <div>ReinforcementBecoming</div>);
jest.mock('@src/components/Toast', () => ({ visible, message }) => visible ? <div data-testid="toast">{message}</div> : null); // Mock Toast visibility
jest.mock('@src/components/ThemeToggleButton', () => () => <div>ThemeToggleButton</div>);

// Helper to mock the store state
const mockStoreState = (state) => {
  useAbundanceStore.mockImplementation((selector) => selector(state));
};

describe('AbundanceGPS Component', () => {
  const mockOnModuleComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Default state for tests, can be overridden in individual tests
    mockStoreState({
      currentStage: stages.WILLINGNESS_CALIBRATION,
      toast: { visible: false, message: '', type: 'info' },
    });
  });

  test('renders WillingnessCalibration when currentStage is WILLINGNESS_CALIBRATION', () => {
    mockStoreState({
      currentStage: stages.WILLINGNESS_CALIBRATION,
      toast: { visible: false, message: '', type: 'info' },
    });
    render(<AbundanceGPS onModuleComplete={mockOnModuleComplete} />);
    expect(screen.getByText('WillingnessCalibration')).toBeInTheDocument();
  });

  test('renders OpennessPrimer when currentStage is OPENNESS_PRIMER', () => {
    mockStoreState({
      currentStage: stages.OPENNESS_PRIMER,
      toast: { visible: false, message: '', type: 'info' },
    });
    render(<AbundanceGPS onModuleComplete={mockOnModuleComplete} />);
    expect(screen.getByText('OpennessPrimer')).toBeInTheDocument();
  });

  test('renders ActivePerceptionReframingWorkshop when currentStage is PERCEPTION_WORKSHOP', () => {
    mockStoreState({
      currentStage: stages.PERCEPTION_WORKSHOP,
      toast: { visible: false, message: '', type: 'info' },
    });
    render(<AbundanceGPS onModuleComplete={mockOnModuleComplete} />);
    expect(screen.getByText('ActivePerceptionReframingWorkshop')).toBeInTheDocument();
  });

  test('renders ContrastClarityReflection when currentStage is CONTRAST_CLARITY_REFLECTION', () => {
    mockStoreState({
      currentStage: stages.CONTRAST_CLARITY_REFLECTION,
      toast: { visible: false, message: '', type: 'info' },
    });
    render(<AbundanceGPS onModuleComplete={mockOnModuleComplete} />);
    expect(screen.getByText('ContrastClarityReflection')).toBeInTheDocument();
  });

   test('renders ImmediateReliefPracticeMenu when currentStage is IMMEDIATE_RELIEF_PRACTICE', () => {
    mockStoreState({
      currentStage: stages.IMMEDIATE_RELIEF_PRACTICE,
      toast: { visible: false, message: '', type: 'info' },
    });
    render(<AbundanceGPS onModuleComplete={mockOnModuleComplete} />);
    expect(screen.getByText('ImmediateReliefPracticeMenu')).toBeInTheDocument();
  });

  test('renders ReinforcementBecoming when currentStage is REINFORCEMENT_BECOMING', () => {
    mockStoreState({
      currentStage: stages.REINFORCEMENT_BECOMING,
      toast: { visible: false, message: '', type: 'info' },
    });
    render(<AbundanceGPS onModuleComplete={mockOnModuleComplete} />);
    expect(screen.getByText('ReinforcementBecoming')).toBeInTheDocument();
  });

  test('renders Toast when toast is visible in store state', () => {
    mockStoreState({
      currentStage: stages.WILLINGNESS_CALIBRATION, // Can be any stage
      toast: { visible: true, message: 'Test Toast Message', type: 'success' },
    });
    render(<AbundanceGPS onModuleComplete={mockOnModuleComplete} />);
    expect(screen.getByTestId('toast')).toHaveTextContent('Test Toast Message');
  });

  // TODO: Add tests for onModuleComplete callback when a stage triggers completion
  // This might require mocking a child component's prop function call
  // TODO: Test ThemeToggleButton rendering (if not tested separately)
}); 