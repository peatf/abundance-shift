import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * @typedef {'inactive' | 'recording' | 'paused' | 'finished'} RecorderState
 */

/**
 * @typedef {object} UseAudioRecorderResult
 * @property {() => Promise<void>} startRecording - Function to start recording.
 * @property {() => void} stopRecording - Function to stop recording and get the blob.
 * @property {() => void} pauseRecording - Function to pause recording.
 * @property {() => void} resumeRecording - Function to resume recording.
 * @property {Blob | null} audioBlob - The recorded audio data as a Blob.
 * @property {string | null} audioUrl - Object URL for the recorded audio Blob.
 * @property {RecorderState} recorderState - Current state of the recorder.
 * @property {boolean} isSupported - Whether MediaRecorder API is supported.
 * @property {() => void} resetRecording - Clears audioBlob and audioUrl, resets state.
 * @property {number} recordingTime - Duration of the current recording in seconds.
 */

/**
 * Hook for recording audio using the MediaRecorder API.
 * @param {object} [options]
 * @param {string} [options.mimeType='audio/webm'] - Preferred mimeType for recording.
 * @returns {UseAudioRecorderResult}
 */
export function useAudioRecorder({ mimeType = 'audio/webm' } = {}) {
  const [recorderState, setRecorderState] = useState('inactive');
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
      console.warn('MediaRecorder API or getUserMedia is not supported in this browser.');
    }

    return () => {
      // Cleanup: stop stream and revoke URL
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // audioUrl should not be in deps here, it's for cleanup

  const startTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setRecordingTime(0); // Reset on new start
    timerIntervalRef.current = setInterval(() => {
      setRecordingTime(prevTime => prevTime + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      console.error('Audio recording is not supported.');
      setRecorderState('inactive');
      return;
    }
    if (recorderState === 'recording') return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = []; // Reset chunks

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setRecorderState('finished');
        stopTimer();
        // Clean up stream tracks only when fully done, or if re-recording
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
      };
      
      mediaRecorderRef.current.onstart = () => {
        setRecorderState('recording');
        startTimer();
      };

      mediaRecorderRef.current.onpause = () => {
        setRecorderState('paused');
        stopTimer();
      };
      
      mediaRecorderRef.current.onresume = () => {
        setRecorderState('recording');
        startTimer(); // Resume timer from where it was, or simply continue counting
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setRecorderState('inactive');
        stopTimer();
      };

      mediaRecorderRef.current.start();

    } catch (err) {
      console.error('Error accessing microphone or starting recorder:', err);
      setRecorderState('inactive');
      // Potentially set an error state for the UI
    }
  }, [isSupported, mimeType, recorderState]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && (recorderState === 'recording' || recorderState === 'paused')) {
      mediaRecorderRef.current.stop();
      // onstop will handle state changes and blob creation
    }
  }, [recorderState]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && recorderState === 'recording') {
      mediaRecorderRef.current.pause();
    }
  }, [recorderState]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && recorderState === 'paused') {
      mediaRecorderRef.current.resume();
    }
  }, [recorderState]);

  const resetRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecorderState('inactive');
    setRecordingTime(0);
    audioChunksRef.current = [];
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        // mediaRecorderRef.current.stop(); // This might trigger onstop prematurely
    }
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

  }, [audioUrl]);


  return {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    audioBlob,
    audioUrl,
    recorderState,
    isSupported,
    resetRecording,
    recordingTime
  };
} 