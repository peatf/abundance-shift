/* global global */
import React from 'react';
// Removed 'waitFor' as it wasn't used directly in these tests.
// If you need it for more complex async UI updates, you can add it back.
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import SequenceMemoryTap from '@src/components/OpennessPrimer/SequenceMemoryTap';
// Removed direct import of useAbundanceStore as we are mocking it fully.
// import { useAbundanceStore } from '@src/store/abundanceStore';
import { useWebAudioTones } from '@src/hooks/useWebAudio';

// Mock the Zustand store
const mockShowToast = jest.fn();
const mockOnSuccess = jest.fn();
const mockOnFailure = jest.fn();

jest.mock('@src/store/abundanceStore', () => ({
  // We only need to mock useAbundanceStore, not the entire module unless other named exports are used by the component
  useAbundanceStore: jest.fn(selector => selector({
    showToast: mockShowToast,
  })),
}));

// Mock the useWebAudioTones hook
const mockPlayTone = jest.fn();
const mockResumeContext = jest.fn().mockResolvedValue(undefined);
const mockInitAudio = jest.fn();

jest.mock('@src/hooks/useWebAudio', () => ({
  useWebAudioTones: jest.fn(() => ({
    playTone: mockPlayTone,
    resumeContext: mockResumeContext,
    isReady: true,
    initAudio: mockInitAudio,
  })),
}));


describe('SequenceMemoryTap Component', () => {
  let originalMath; // To store the original Math object

  beforeEach(() => {
    jest.useFakeTimers();
    mockShowToast.mockClear();
    mockPlayTone.mockClear();
    mockResumeContext.mockClear();
    mockInitAudio.mockClear();
    mockOnSuccess.mockClear();
    mockOnFailure.mockClear();

    (useWebAudioTones).mockImplementation(() => ({
      playTone: mockPlayTone,
      resumeContext: mockResumeContext,
      isReady: true,
      initAudio: mockInitAudio,
    }));

    // Store original Math object before mocking
    originalMath = global.Math;
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    // Restore original Math object after each test
    global.Math = originalMath;
  });

  test('renders initial state with heading and status message', () => {
    render(<SequenceMemoryTap onSuccess={mockOnSuccess} onFailure={mockOnFailure} />);
    expect(screen.getByRole('heading', { name: /Sequence Memory Tap/i })).toBeInTheDocument();
    expect(screen.getByText(/Get ready to memorize the sequence.../i)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Circle/i })).toHaveLength(4);
  });

  test('attempts to initialize audio on mount', () => {
    render(<SequenceMemoryTap onSuccess={mockOnSuccess} onFailure={mockOnFailure} />);
    expect(mockInitAudio).toHaveBeenCalledTimes(1);
  });
  
  test('displays "Start Sequence" button if audio is not ready', () => {
    (useWebAudioTones).mockImplementation(() => ({
      playTone: mockPlayTone,
      resumeContext: mockResumeContext,
      isReady: false,
      initAudio: mockInitAudio,
    }));
    render(<SequenceMemoryTap onSuccess={mockOnSuccess} onFailure={mockOnFailure} />);
    expect(screen.getByRole('button', {name: /Start Sequence/i})).toBeInTheDocument();
  });

  test('clicking "Start Sequence" button attempts to resume audio context and play sequence', async () => {
    (useWebAudioTones).mockImplementation(() => ({
        playTone: mockPlayTone,
        resumeContext: mockResumeContext,
        isReady: false,
        initAudio: mockInitAudio,
    }));
    render(<SequenceMemoryTap onSuccess={mockOnSuccess} onFailure={mockOnFailure} />);
    
    const startButton = screen.getByRole('button', {name: /Start Sequence/i});
    fireEvent.click(startButton);

    expect(mockResumeContext).toHaveBeenCalledTimes(1);
    
    (useWebAudioTones).mockImplementation(() => ({
        playTone: mockPlayTone,
        resumeContext: mockResumeContext,
        isReady: true, 
        initAudio: mockInitAudio,
    }));
    
    await act(async () => {
      jest.advanceTimersByTime(1500);
    });
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    expect(mockPlayTone).toHaveBeenCalledTimes(4);
    expect(screen.getByText(/Your turn! Repeat the sequence./i)).toBeInTheDocument();
  });


  test('AI plays a sequence of 4 steps after initial delay', async () => {
    render(<SequenceMemoryTap onSuccess={mockOnSuccess} onFailure={mockOnFailure} />);
    
    await act(async () => {
      jest.advanceTimersByTime(1500);
    });
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    expect(mockPlayTone).toHaveBeenCalledTimes(4);
    expect(screen.getByText(/Your turn! Repeat the sequence./i)).toBeInTheDocument();
    const circles = screen.getAllByRole('button', { name: /Circle/i });
    circles.forEach(circle => expect(circle).not.toBeDisabled());
  });

  test('user correctly replicates the sequence', async () => {
    const mockMath = Object.create(global.Math);
    let randomCallCount = 0;
    const predictableRandomValues = [0.1, 0.3, 0.6, 0.8];
    mockMath.random = () => predictableRandomValues[randomCallCount++ % predictableRandomValues.length];
    global.Math = mockMath; // Assign the mocked Math object to global.Math

    render(<SequenceMemoryTap onSuccess={mockOnSuccess} onFailure={mockOnFailure} />);
    
    await act(async () => { jest.advanceTimersByTime(1500 + 3000); });
    expect(mockPlayTone).toHaveBeenCalledTimes(4);
    mockPlayTone.mockClear();

    const circles = screen.getAllByRole('button', { name: /Circle/i });
    const expectedSequence = [0, 1, 2, 3];

    for (let i = 0; i < expectedSequence.length; i++) {
      fireEvent.click(circles[expectedSequence[i]]);
      expect(mockPlayTone).toHaveBeenCalledTimes(i + 1);
      expect(mockPlayTone).toHaveBeenLastCalledWith(expectedSequence[i]);
      await act(async () => { jest.advanceTimersByTime(500); });
    }

    expect(screen.getByText(/Correct! Focus restored./i)).toBeInTheDocument();
    expect(mockShowToast).toHaveBeenCalledWith("Focus restored!", "success");
    
    await act(async () => { jest.advanceTimersByTime(1000); });
    expect(mockOnSuccess).toHaveBeenCalledTimes(1);

    // No need to restore global.Math here, it's done in afterEach
  });

  test('user makes an incorrect step in the sequence', async () => {
    const mockMath = Object.create(global.Math);
    let randomCallCount = 0;
    const predictableRandomValues = [0.1, 0.3, 0.6, 0.8];
    mockMath.random = () => predictableRandomValues[randomCallCount++ % predictableRandomValues.length];
    global.Math = mockMath; // Assign the mocked Math object to global.Math

    render(<SequenceMemoryTap onSuccess={mockOnSuccess} onFailure={mockOnFailure} />);
    
    await act(async () => { jest.advanceTimersByTime(1500 + 3000); });
    mockPlayTone.mockClear();

    const circles = screen.getAllByRole('button', { name: /Circle/i });
    fireEvent.click(circles[0]); 
    await act(async () => { jest.advanceTimersByTime(500); });
    
    fireEvent.click(circles[0]); 
    await act(async () => { jest.advanceTimersByTime(500); });

    expect(screen.getByText(/Incorrect sequence. Try again after reset./i)).toBeInTheDocument();
    expect(mockShowToast).toHaveBeenCalledWith("Oops! That wasn't the right step.", "error");
    
    await act(async () => { jest.advanceTimersByTime(1500); });
    expect(mockOnFailure).toHaveBeenCalledTimes(1);

    // No need to restore global.Math here, it's done in afterEach
  });
  
  test('circles are keyboard accessible', async () => {
    render(<SequenceMemoryTap onSuccess={mockOnSuccess} onFailure={mockOnFailure} />);
    await act(async () => { jest.advanceTimersByTime(1500 + 3000); });
    mockPlayTone.mockClear();

    const firstCircle = screen.getAllByRole('button', {name: /Circle/i})[0];
    // In jsdom, focus doesn't always behave like a real browser.
    // We can check if the element is focusable, then simulate focus.
    expect(firstCircle).not.toBeDisabled(); // A prerequisite for focus usually
    act(() => { // Wrap state updates or direct DOM manipulations in act
      firstCircle.focus();
    });
    expect(firstCircle).toHaveFocus();

    fireEvent.keyDown(firstCircle, { key: 'Enter', code: 'Enter' });
    expect(mockPlayTone).toHaveBeenCalledWith(expect.any(Number));
  });

});