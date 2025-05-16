import { useState, useRef, useCallback } from 'react';

/**
 * @typedef {object} UseAudioRecorderResult
 * @property {boolean} isRecording - Whether recording is currently in progress.
 * @property {Blob | null} audioBlob - The recorded audio as a Blob.
 * @property {string | null} audioUrl - A URL for the recorded audio (for playback).
 * @property {(mimeType?: string) => Promise<void>} startRecording - Function to start recording.
 * @property {() => Promise<Blob | null>} stopRecording - Function to stop recording and return the audio Blob.
 * @property {() => void} clearRecording - Function to clear the current recording.
 * @property {string | null} error - Any error message encountered.
 */

/**
 * Hook to record audio using the MediaRecorder API.
 * @returns {UseAudioRecorderResult}
 */
export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = useCallback(async (mimeType = 'audio/webm') => {
    setError(null);
    setAudioBlob(null);
    setAudioUrl(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(audioBlob);
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        // Clean up stream tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        setError(`Recording error: ${event.error.name}`);
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError(`Could not access microphone: ${err.message}`);
      setIsRecording(false);
    }
  }, []);

  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current.mimeType });
          setAudioBlob(audioBlob);
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudioUrl(audioUrl);
          setIsRecording(false);
          // Clean up stream tracks - assuming this happens when recorder stops
          // mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
          resolve(audioBlob);
        };
        mediaRecorderRef.current.stop();
      } else {
        resolve(null);
      }
    });
  }, [isRecording]);

  const clearRecording = useCallback(() => {
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    audioChunksRef.current = [];
  }, [audioUrl]);

  // Clean up object URL when component unmounts or new recording is made
  // Moved URL.revokeObjectURL to clearRecording and onstop for explicit control

  return { isRecording, audioBlob, audioUrl, startRecording, stopRecording, clearRecording, error };
} 