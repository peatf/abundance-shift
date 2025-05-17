import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActivePerceptionReframingWorkshop from '@src/components/PerceptionWorkshop/ActivePerceptionReframingWorkshop';
import { useAbundanceStore } from '@src/store/abundanceStore';

// Mock the Zustand store
jest.mock('@src/store/abundanceStore', () => ({
  useAbundanceStore: jest.fn()
}));

// Mock the child components
jest.mock('@src/components/PerceptionWorkshop/IdentifyInterpretation', 
  () => () => <div data-testid="identify-interpretation">IdentifyInterpretation</div>
);
jest.mock('@src/components/PerceptionWorkshop/EvidenceInventory', 
  () => () => <div data-testid="evidence-inventory">EvidenceInventory</div>
);
jest.mock('@src/components/PerceptionWorkshop/AlternativeFrameGeneration', 
  () => () => <div data-testid="alternative-frame-generation">AlternativeFrameGeneration</div>
);
jest.mock('@src/components/PerceptionWorkshop/CommitAnchor', 
  () => () => <div data-testid="commit-anchor">CommitAnchor</div>
);

describe('ActivePerceptionReframingWorkshop', () => {
  const mockProceedFromWorkshop = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    useAbundanceStore.mockImplementation(selector => {
      const state = {
        proceedFromWorkshop: mockProceedFromWorkshop
      };
      return selector(state);
    });
  });

  it('renders the first step initially', () => {
    render(<ActivePerceptionReframingWorkshop />);
    expect(screen.getByTestId('identify-interpretation')).toBeInTheDocument();
    expect(screen.queryByTestId('evidence-inventory')).not.toBeInTheDocument();
    expect(screen.queryByTestId('alternative-frame-generation')).not.toBeInTheDocument();
    expect(screen.queryByTestId('commit-anchor')).not.toBeInTheDocument();
  });

  it('navigates to next step when Next button is clicked', () => {
    render(<ActivePerceptionReframingWorkshop />);
    
    // First step (Identify)
    expect(screen.getByTestId('identify-interpretation')).toBeInTheDocument();
    fireEvent.click(screen.getByText(/next/i));
    
    // Second step (Evidence)
    expect(screen.getByTestId('evidence-inventory')).toBeInTheDocument();
    fireEvent.click(screen.getByText(/next/i));
    
    // Third step (Generate Frames)
    expect(screen.getByTestId('alternative-frame-generation')).toBeInTheDocument();
    fireEvent.click(screen.getByText(/next/i));
    
    // Fourth step (Commit Anchor)
    expect(screen.getByTestId('commit-anchor')).toBeInTheDocument();
    fireEvent.click(screen.getByText(/next/i));
    
    // Should call the proceedFromWorkshop function
    expect(mockProceedFromWorkshop).toHaveBeenCalled();
  });

  it('allows navigation back to previous steps', () => {
    render(<ActivePerceptionReframingWorkshop />);
    
    // Navigate to the second step
    fireEvent.click(screen.getByText(/next/i));
    expect(screen.getByTestId('evidence-inventory')).toBeInTheDocument();
    
    // Go back to the first step
    fireEvent.click(screen.getByText(/back/i));
    expect(screen.getByTestId('identify-interpretation')).toBeInTheDocument();
  });
}); 