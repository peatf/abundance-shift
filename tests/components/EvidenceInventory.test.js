import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import EvidenceInventory from '@src/components/EvidenceInventory';
import { useAbundanceStore } from '@src/store/abundanceStore';

// Mock Zustand store
jest.mock('@src/store/abundanceStore');

const mockUpdateEvidence = jest.fn();
useAbundanceStore.mockReturnValue({
  updateEvidence: mockUpdateEvidence,
  evidence: {
    supporting: [],
    contradicting: []
  }
});

describe('EvidenceInventory Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders two evidence columns', () => {
    render(<EvidenceInventory />);
    expect(screen.getByText('Supporting Evidence')).toBeInTheDocument();
    expect(screen.getByText('Contradicting Evidence')).toBeInTheDocument();
  });

  test('allows adding items to supporting evidence', () => {
    render(<EvidenceInventory />);
    const input = screen.getByPlaceholderText('Add supporting evidence...');
    fireEvent.change(input, { target: { value: 'New supporting point' } });
    fireEvent.click(screen.getByText('Add', { selector: 'button' }));
    expect(mockUpdateEvidence).toHaveBeenCalledWith('supporting', 'New supporting point');
  });

  test('allows removing items from evidence lists', () => {
    useAbundanceStore.mockReturnValueOnce({
      evidence: {
        supporting: ['Existing point'],
        contradicting: []
      },
      updateEvidence: mockUpdateEvidence
    });
    
    render(<EvidenceInventory />);
    fireEvent.click(screen.getByLabelText('Remove Existing point'));
    expect(mockUpdateEvidence).toHaveBeenCalledWith('supporting', 'Existing point', true);
  });

  // TODO: Test validation (e.g., empty input)
  // TODO: Test navigation to next step
}); 