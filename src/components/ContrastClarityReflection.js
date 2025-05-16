import React, { useState, useEffect, useRef } from 'react';
import { useAbundanceStore } from '../store/abundanceStore';
import Button from './common/Button';
import TextareaAutosize from 'react-textarea-autosize';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
// Example icons, replace with Heroicons or SVGs as needed
const RecordIcon = () => <svg className="w-6 h-6" fill="red" viewBox="0 0 24 24"><circle cx="12" cy="12" r="7"/></svg>;
const StopIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><rect x="7" y="7" width="10" height="10" rx="1"/></svg>;
const PlayIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>;
const PauseIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>;
const TrashIcon = () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/></svg>;


function ContrastClarityReflection() {
  const {
    clarityReflectionInput,
    clarityReflectionType,
    setClarityReflectionText,
    setClarityReflectionAudio,
    proceedFromClarity,
    showToast,
  } = useAbundanceStore();

  const [inputType, setInputType] = useState(clarityReflectionType || 'text'); // 'text' or 'audio'
  const [textInput, setTextInput] = useState(clarityReflectionType === 'text' ? clarityReflectionInput : '');
  
  const {
    startRecording, stopRecording, audioBlob, audioUrl, recorderState,
    isSupported: audioRecorderSupported, resetRecording, recordingTime
  } = useAudioRecorder({ mimeType: 'audio/mp3; codecs=opus' }); // opus in mp3 or webm for better quality/compression

  const audioPlayerRef = useRef(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const headingRef = useRef(null);

  useEffect(() => {
    if (headingRef.current) headingRef.current.focus();
  }, []);

  // Sync with store if audio was already recorded
  useEffect(() => {
    if (clarityReflectionType === 'audio' && clarityReflectionInput && !audioUrl) {
      // This scenario implies the audioUrl was from a previous session and needs re-creation
      // or the store only persists the blob data (which is harder with zustand persist).
      // For now, we assume if clarityReflectionInput is a URL, it's usable.
      // If it were a blob, we'd recreate object URL here.
      // The current store saves URL (clarityReflectionInput) and blob (clarityReflectionAudioBlob)
    }
  }, [clarityReflectionType, clarityReflectionInput, audioUrl]);

  const handleProceed = () => {
    if (inputType === 'text' && textInput.trim()) {
      setClarityReflectionText(textInput.trim());
      proceedFromClarity();
    } else if (inputType === 'audio' && audioBlob && audioUrl) {
      setClarityReflectionAudio(audioBlob, audioUrl); // Persist blob and URL
      proceedFromClarity();
    } else {
      showToast("Please provide your reflection or record an audio note.", "warning");
    }
  };
  
  const handleTextChange = (e) => {
    setTextInput(e.target.value);
    if (clarityReflectionType === 'audio') { // If user types while audio was selected, switch back to text input
        resetRecording(); // Clear any audio
        setClarityReflectionText(e.target.value); // Update store immediately for text
    }
  };

  const toggleInputType = () => {
    if (inputType === 'text') {
      setInputType('audio');
      if (textInput) setClarityReflectionText(textInput); // Save current text before switching
    } else {
      setInputType('text');
      if (audioBlob) setClarityReflectionAudio(audioBlob, audioUrl); // Save current audio before switching
      resetRecording();
    }
  };
  
  const handlePlayPause = () => {
    if (audioPlayerRef.current) {
      if (isPlayingAudio) {
        audioPlayerRef.current.pause();
      } else {
        audioPlayerRef.current.play();
      }
      setIsPlayingAudio(!isPlayingAudio);
    }
  };

  useEffect(() => {
    const player = audioPlayerRef.current;
    if (player) {
      const endedHandler = () => setIsPlayingAudio(false);
      const playHandler = () => setIsPlayingAudio(true);
      const pauseHandler = () => setIsPlayingAudio(false);
      player.addEventListener('ended', endedHandler);
      player.addEventListener('play', playHandler);
      player.addEventListener('pause', pauseHandler);
      return () => {
        player.removeEventListener('ended', endedHandler);
        player.removeEventListener('play', playHandler);
        player.removeEventListener('pause', pauseHandler);
      };
    }
  }, [audioUrl]);


  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-6 animate-fadeIn p-2 md:p-4">
      <h1 ref={headingRef} tabIndex="-1" className="text-2xl md:text-3xl font-bold text-center text-gray-800 dark:text-gray-100">
        Contrast & Clarity Reflection
      </h1>
      <p className="text-md text-center text-gray-600 dark:text-gray-300">
        What new clarity about your desires, or next steps, emerges from where you are now and the reframing you've just done?
      </p>

      <div className="flex justify-center mb-4">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <Button
            onClick={() => { if(inputType !== 'text') toggleInputType(); }}
            variant={inputType === 'text' ? 'primary' : 'secondary'}
            className={`rounded-r-none ${inputType === 'text' ? 'z-10 ring-2 ring-blue-500' : ''}`}
            aria-pressed={inputType === 'text'}
          >
            Text Input
          </Button>
          <Button
            onClick={() => { if(inputType !== 'audio') toggleInputType(); }}
            variant={inputType === 'audio' ? 'primary' : 'secondary'}
            className={`rounded-l-none ${inputType === 'audio' ? 'z-10 ring-2 ring-blue-500' : ''}`}
            disabled={!audioRecorderSupported}
            aria-pressed={inputType === 'audio'}
          >
            Audio Note
          </Button>
        </div>
      </div>
      {!audioRecorderSupported && inputType === 'audio' && (
         <p className="text-center text-sm text-yellow-600 dark:text-yellow-400">Audio recording is not supported by your browser. Please use text input.</p>
      )}


      {inputType === 'text' ? (
        <TextareaAutosize
          value={textInput}
          onChange={handleTextChange}
          placeholder="Capture your new clarity here..."
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-100"
          minRows={3}
          aria-label="Clarity reflection text input"
        />
      ) : (
        audioRecorderSupported && (
          <div className="p-4 border border-dashed border-gray-300 dark:border-slate-600 rounded-lg space-y-4 text-center">
            {recorderState === 'inactive' && !audioUrl && (
              <Button onClick={startRecording} aria-label="Start recording audio note" className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full flex items-center justify-center mx-auto">
                <RecordIcon /> <span className="ml-2">Start Recording</span>
              </Button>
            )}
            {recorderState === 'recording' && (
              <div className="space-y-2">
                <Button onClick={stopRecording} aria-label="Stop recording" className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-full flex items-center justify-center mx-auto">
                  <StopIcon /> <span className="ml-2">Stop Recording</span>
                </Button>
                <p className="text-sm text-red-500 dark:text-red-400 animate-pulse">Recording... {formatTime(recordingTime)}</p>
              </div>
            )}
            {/* Add pause/resume if desired, useAudioRecorder supports it */}
            {audioUrl && (recorderState === 'finished' || recorderState === 'inactive') && (
              <div className="space-y-3">
                <p className="text-sm text-green-600 dark:text-green-400">Audio note recorded ({formatTime(recordingTime)}).</p>
                <audio ref={audioPlayerRef} src={audioUrl} className="w-full hidden" controls={false} />
                <div className="flex items-center justify-center space-x-2">
                    <Button onClick={handlePlayPause} aria-label={isPlayingAudio ? "Pause audio" : "Play audio"} variant="secondary">
                        {isPlayingAudio ? <PauseIcon /> : <PlayIcon />}
                    </Button>
                    <Button onClick={() => { resetRecording(); setClarityReflectionAudio(null, null); }} aria-label="Delete recording" variant="danger" className="p-2">
                        <TrashIcon/>
                    </Button>
                </div>
                <Button onClick={startRecording} aria-label="Record again" variant="link" size="sm">
                    Record Again
                </Button>
              </div>
            )}
          </div>
        )
      )}

      <div className="flex justify-end pt-4">
        <Button onClick={handleProceed} size="lg">
          Continue to Immediate Relief
        </Button>
      </div>
    </div>
  );
}

export default ContrastClarityReflection; 