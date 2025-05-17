// abundance-shift/tests/components/PerceptionWorkshop/AlternativeFrameGeneration.test.js

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AlternativeFrameGeneration from '@src/components/PerceptionWorkshop/AlternativeFrameGeneration';
import { useAbundanceStore } from '@src/store/abundanceStore';

// Your mock for StarRating
jest.mock('@src/components/common/StarRating', () => { // Assuming StarRating is in common
  const MockStarRating = function MockStarRating(props) { // Give it a name for displayName
    // eslint-disable-next-line react/prop-types
    const { onChange } = props;
    return (
      <div data-testid="star-rating">
        {/* Simulate a few rating options for more granular testing if needed */}
        <button onClick={() => onChange(1)}>Rate 1 Star</button>
        <button onClick={() => onChange(3)}>Rate 3 Stars</button>
        <button onClick={() => onChange(5)}>Rate 5 Stars</button>
        {/* Display current value for verification if helpful */}
        {/* eslint-disable-next-line react/prop-types */}
        <span>Current Rating: {props.value}</span>
      </div>
    );
  };
  MockStarRating.displayName = 'MockStarRating'; // Good practice
  return MockStarRating;
});


// Mock Zustand store
const mockUpdateAlternativeFrameRating = jest.fn();
const mockUpdateAlternativeFrameCompletion = jest.fn();
// ... other store mocks

const initialFramesData = [
  { id: 'temp', text: 'This is temporary because…', userCompletion: '', rating: 0 },
  { id: 'teaching', text: 'This stage is teaching me…', userCompletion: '', rating: 0 },
  { id: 'confirms', text: 'This experience confirms that I…', userCompletion: '', rating: 0 },
];

const setupMockStore = (frames = initialFramesData) => {
  (useAbundanceStore).mockImplementation(selector => selector({
    alternativeFrames: frames,
    updateAlternativeFrameRating: mockUpdateAlternativeFrameRating,
    updateAlternativeFrameCompletion: mockUpdateAlternativeFrameCompletion,
    // ... other necessary store state/actions
  }));
};

jest.mock('@src/store/abundanceStore', () => ({
  useAbundanceStore: jest.fn(),
}));


describe('AlternativeFrameGeneration Component', () => {
  beforeEach(() => {
    mockUpdateAlternativeFrameRating.mockClear();
    mockUpdateAlternativeFrameCompletion.mockClear();
    setupMockStore(); // Reset store with default frames
  });

  test('renders frames and their text areas', () => {
    render(<AlternativeFrameGeneration onComplete={jest.fn()} onBack={jest.fn()} />);
    expect(screen.getAllByRole('textbox').length).toBe(initialFramesData.length);
    expect(screen.getByText(initialFramesData[0].text)).toBeInTheDocument();
  });

  test('updates frame completion when user types in textarea', () => {
    render(<AlternativeFrameGeneration onComplete={jest.fn()} onBack={jest.fn()} />);
    const textareas = screen.getAllByRole('textbox');
    fireEvent.change(textareas[0], { target: { value: 'new completion' } });
    expect(mockUpdateAlternativeFrameCompletion).toHaveBeenCalledWith(initialFramesData[0].id, 'new completion');
  });

  test('updates frame rating when mock StarRating onChange is triggered', () => {
    render(<AlternativeFrameGeneration onComplete={jest.fn()} onBack={jest.fn()} />);
    
    // Find all mocked StarRating instances (there will be one per frame)
    const starRatingMocks = screen.getAllByTestId('star-rating');
    
    // Interact with the first StarRating mock's "Rate 3 Stars" button
    const rate3ButtonForFirstFrame = within(starRatingMocks[0]).getByRole('button', { name: 'Rate 3 Stars' });
    fireEvent.click(rate3ButtonForFirstFrame);
    
    expect(mockUpdateAlternativeFrameRating).toHaveBeenCalledWith(initialFramesData[0].id, 3);

    // Interact with the second StarRating mock's "Rate 5 Stars" button
    const rate5ButtonForSecondFrame = within(starRatingMocks[1]).getByRole('button', { name: 'Rate 5 Stars' });
    fireEvent.click(rate5ButtonForSecondFrame);
    expect(mockUpdateAlternativeFrameRating).toHaveBeenCalledWith(initialFramesData[1].id, 5);
  });

  test('"Next" button is disabled until at least one frame is completed and rated', () => {
    // Initial render, button should be disabled
    let frames = [
        { id: 'temp', text: 'This is temporary because…', userCompletion: '', rating: 0 },
    ];
    setupMockStore(frames);
    render(<AlternativeFrameGeneration onComplete={jest.fn()} onBack={jest.fn()} />);
    const nextButton = screen.getByRole('button', { name: /Next: Commit & Anchor/i });
    expect(nextButton).toBeDisabled();

    // User completes the frame
    mockUpdateAlternativeFrameCompletion.mockImplementationOnce((id, value) => {
        frames = frames.map(f => f.id === id ? {...f, userCompletion: value} : f);
        setupMockStore(frames); // Update mock store to reflect change
    });
    const textareas = screen.getAllByRole('textbox');
    fireEvent.change(textareas[0], { target: { value: 'some completion' } });
    
    // Re-render might be needed if the component itself re-evaluates `canProceed`
    // In many cases, if `canProceed` depends on store state that `setupMockStore` updates,
    // the component might not automatically re-render with the new `disabled` status in the test
    // unless the mocked store update triggers a re-render of the component under test.
    // For simplicity, we'll assume the store update + component logic handles it.
    // If not, you might need to re-render or use a more sophisticated store mock that forces updates.
    // For now, check the state that `canProceed` relies on.

    // Button still disabled because it's not rated
    // This part of the test is tricky because `canProceed` is internal to the component.
    // We are testing the effect (button disabled/enabled).
    // The component re-renders when its props or state changes. Here, alternativeFrames comes from the store.
    // If the mock store update doesn't trigger a re-render of AlternativeFrameGeneration, the button's state won't update.
    // A more robust way is to simulate the store actually changing and having the component re-render.

    // Simulate rating the frame (which should enable the button)
    mockUpdateAlternativeFrameRating.mockImplementationOnce((id, value) => {
        frames = frames.map(f => f.id === id ? {...f, rating: value} : f);
        setupMockStore(frames); // Update store
    });
    
    // To ensure the component re-renders with the new store state for the `disabled` prop calculation
    // we can pass the updated frames directly if the component structure allows,
    // or rely on the mocked store to provide the updated values.
    // Let's re-render with the updated store state.
    // This is a common pattern when testing components that derive enabled/disabled states from store.
    
    // After completion:
    frames[0].userCompletion = "some completion";
    setupMockStore(frames);
    // No need to re-render explicitly if the component correctly subscribes to store changes.
    // However, to test the disabled state transition, we need to ensure `canProceed` is re-evaluated.
    
    // Now rate it
    const starRatingMocks = screen.getAllByTestId('star-rating');
    const rateButton = within(starRatingMocks[0]).getByRole('button', { name: /Rate 1 Star/i });
    fireEvent.click(rateButton);

    // After rating, the button should be enabled.
    // This relies on the component re-rendering due to the store update via mockUpdateAlternativeFrameRating.
    // If it doesn't, the test will fail. The store actions themselves call `set` which should trigger re-renders.
    // Let's assume the store actions trigger re-renders in the actual component.
    // For the test, we need to ensure our mock setup reflects this.
    // The `setupMockStore` call inside the mockImplementation for the actions is key.
    
    // Re-query the button to get its current state
    expect(screen.getByRole('button', { name: /Next: Commit & Anchor/i })).not.toBeDisabled();
  });

  // ... more tests for onComplete, onBack calls, etc.
});