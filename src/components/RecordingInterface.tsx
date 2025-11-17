import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Mic, Hand, Check, X, Info, RotateCcw } from 'lucide-react';

interface RecordingInterfaceProps {
  onTranscriptReady: (transcript: string, audioBlob: Blob | null) => void;
  renderControlsOnly?: boolean;
  showGuidelines?: boolean;
  onCloseGuidelines?: () => void;
  isProcessing?: boolean;
  hideControlsOnDesktop?: boolean;
}

export interface RecordingInterfaceRef {
  startRecording: () => void;
  pauseRecording: () => void;
  stopRecording: () => void;
  discardRecording: () => void;
  reset: () => void;
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
}

export const RecordingInterface = forwardRef<RecordingInterfaceRef, RecordingInterfaceProps>(({ onTranscriptReady, renderControlsOnly = false, showGuidelines = false, onCloseGuidelines, isProcessing: externalProcessing = false, hideControlsOnDesktop = false }, ref) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [internalProcessing, setInternalProcessing] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');

  const isProcessing = externalProcessing || internalProcessing;

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>('');

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const formatTranscript = (text: string): string => {
    let formatted = text.trim();

    if (formatted.length === 0) return formatted;

    formatted = formatted.replace(/\s+/g, ' ');

    formatted = formatted.replace(/\b(okay|so|well|um|uh)\s+/gi, (match, word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() + ', ';
    });

    formatted = formatted.replace(/\s+(and|but|or)\s+/gi, (match, conj) => {
      const prevChar = formatted.charAt(formatted.indexOf(match) - 1);
      if (prevChar && /[a-zA-Z0-9]/.test(prevChar)) {
        return ', ' + conj.toLowerCase() + ' ';
      }
      return ' ' + conj.toLowerCase() + ' ';
    });

    formatted = formatted.replace(/\s+(who's|that's|which|where|when)\s+/gi, (match, rel) => {
      return ', ' + rel.toLowerCase() + ' ';
    });

    formatted = formatted.replace(/\b(\d+\.?\d*)\s*°?\s*c\b/gi, '$1°C');
    formatted = formatted.replace(/\b(\d+\.?\d*)\s*°?\s*f\b/gi, '$1°F');

    formatted = formatted.replace(/\.\s+([a-z])/g, (match, letter) => {
      return '. ' + letter.toUpperCase();
    });

    formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);

    formatted = formatted.replace(/\bi\b/g, 'I');
    formatted = formatted.replace(/\bi'm\b/gi, "I'm");
    formatted = formatted.replace(/\bi've\b/gi, "I've");
    formatted = formatted.replace(/\bi'd\b/gi, "I'd");
    formatted = formatted.replace(/\bi'll\b/gi, "I'll");
    formatted = formatted.replace(/\bdr\b/gi, 'Dr');
    formatted = formatted.replace(/\bmr\b/gi, 'Mr');
    formatted = formatted.replace(/\bmrs\b/gi, 'Mrs');
    formatted = formatted.replace(/\bms\b/gi, 'Ms');

    formatted = formatted.replace(/\s+([.!?,;:])/g, '$1');
    formatted = formatted.replace(/([,;:])\s*/g, '$1 ');

    const hasProperEnding = /[.!?]$/.test(formatted);
    const endsWithConjunction = /\b(and|or|but|so|because|if|when|while|that|which|with|in|at|to|for|from|as|of)\s*$/i.test(formatted);
    const seemsIncomplete = /\b(presenting|going|having|seeing|talking|saying|thinking|being|doing|the|a|an|this|that|these|those|my|his|her|their|our|your|is|are|was|were|has|have|had|will|would|should|could|can|may|might)\s*$/i.test(formatted);

    if (!hasProperEnding && !endsWithConjunction && !seemsIncomplete) {
      formatted += '.';
    }

    formatted = formatted.replace(/([.!?])\s*([a-z])/g, (match, punctuation, letter) => {
      return punctuation + ' ' + letter.toUpperCase();
    });

    formatted = formatted.replace(/([.!?])([A-Z])/g, '$1 $2');

    formatted = formatted.replace(/\s{2,}/g, ' ');

    return formatted + ' ';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        }
      });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      finalTranscriptRef.current = '';
      setInterimTranscript('');

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());

        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (e) {
            // Recognition may already be stopped
          }
        }

        // Give speech recognition time to process final results
        await new Promise(resolve => setTimeout(resolve, 500));

        const finalText = finalTranscriptRef.current.trim();

        // Create audio blob from recorded chunks
        const audioBlob = chunksRef.current.length > 0
          ? new Blob(chunksRef.current, { type: 'audio/webm' })
          : null;

        if (finalText) {
          setInternalProcessing(true);
          onTranscriptReady(finalText, audioBlob);
        } else {
          setInternalProcessing(false);
          alert('No speech was detected. Please try recording again and speak clearly into your microphone.');
          // Reset state so user can try again
          setIsRecording(false);
          setRecordingTime(0);
        }
      };

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 3;

        recognition.onresult = (event: any) => {
          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              final += transcript + ' ';
            } else {
              interim += transcript;
            }
          }

          if (final) {
            const formatted = formatTranscript(final);
            finalTranscriptRef.current += formatted;
          }
          setInterimTranscript(interim);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          if (event.error === 'no-speech') {
            console.log('No speech detected, continuing...');
          } else if (event.error === 'audio-capture') {
            console.error('Audio capture error - check microphone');
          } else if (event.error === 'not-allowed') {
            alert('Microphone access denied. Please allow microphone access and try again.');
          }
        };

        recognition.onend = () => {
          // Auto-restart recognition if still recording and not paused
          if (isRecording && !isPaused && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.log('Recognition restart skipped');
            }
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } else {
        console.warn('Speech recognition not supported, transcription will not be available');
        alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      }

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        if (recognitionRef.current) {
          recognitionRef.current.start();
        }
        timerRef.current = window.setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  };

  const discardRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      chunksRef.current = [];
      finalTranscriptRef.current = '';
      setInterimTranscript('');
      setIsRecording(false);
      setIsPaused(false);
      setRecordingTime(0);
      setInternalProcessing(false);
    }
  };

  const reset = () => {
    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        // Already stopped
      }
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Already stopped
      }
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    chunksRef.current = [];
    finalTranscriptRef.current = '';
    setInterimTranscript('');
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    setInternalProcessing(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useImperativeHandle(ref, () => ({
    startRecording,
    pauseRecording,
    stopRecording,
    discardRecording,
    reset,
    isRecording,
    isPaused,
    recordingTime
  }));

  const controlButtons = (
    <div className={`flex flex-col gap-2 ${hideControlsOnDesktop ? 'md:hidden' : ''}`}>
      <button
        onClick={startRecording}
        disabled={isRecording || isProcessing}
        className="flex items-center justify-center gap-1.5 bg-[#000229] text-white px-4 sm:px-5 py-2 sm:py-3 rounded-full hover:bg-[#000229]/90 transition-all duration-100 font-medium text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed w-full"
      >
        {isProcessing ? (
          <span className="text-base sm:text-lg font-medium">Processing...</span>
        ) : isRecording ? (
          <span className="text-base sm:text-lg font-medium tabular-nums">{formatTime(recordingTime)}</span>
        ) : (
          <>
            <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
            Start
          </>
        )}
      </button>

      {isRecording && (
        <div className="flex items-center justify-center gap-2">
          <div className="relative group">
            <button
              onClick={pauseRecording}
              className="flex items-center justify-center p-2 sm:p-3 rounded-full transition-smooth text-white border-none bg-[#000229] hover:bg-[#000229]/90"
              aria-label={isPaused ? 'Resume recording' : 'Pause recording'}
            >
              <Hand className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div className="hidden sm:block absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-[#000229] text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
              {isPaused ? 'Resume recording' : 'Pause recording'}
            </div>
          </div>

          <div className="relative group">
            <button
              onClick={discardRecording}
              className="flex items-center justify-center p-2 sm:p-3 rounded-full transition-smooth text-white border-none bg-[#000229] hover:bg-[#000229]/90"
              aria-label="Restart recording"
            >
              <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div className="hidden sm:block absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-[#000229] text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
              Restart recording
            </div>
          </div>

          <div className="relative group">
            <button
              onClick={stopRecording}
              className="flex items-center justify-center p-2 sm:p-3 rounded-full transition-smooth text-white border-none bg-[#000229] hover:bg-[#000229]/90"
              aria-label="Submit recording"
            >
              <Check className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div className="hidden sm:block absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-[#000229] text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
              Submit recording
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (renderControlsOnly) {
    return (
      <>
        {controlButtons}
        {showGuidelines && onCloseGuidelines && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" onClick={onCloseGuidelines}>
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_8px_30px_rgba(0,0,0,0.2)]" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl sm:text-2xl font-semibold text-black">Recording Guidelines</h3>
                <button
                  onClick={onCloseGuidelines}
                  className="p-1 hover:bg-[#0B2B26]/10 rounded-full transition-smooth"
                >
                  <X className="w-5 h-5 text-black" />
                </button>
              </div>
              <ul className="space-y-3 text-black/85 text-sm sm:text-base">
                <li className="flex gap-2">
                  <span className="text-[#0B2B26] font-bold">•</span>
                  <span>Speak clearly and at a natural pace</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#0B2B26] font-bold">•</span>
                  <span>Include all relevant patient information</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#0B2B26] font-bold">•</span>
                  <span>Follow standard case presentation format</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#0B2B26] font-bold">•</span>
                  <span>Pause briefly between sections for clarity</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#0B2B26] font-bold">•</span>
                  <span>You can pause and resume your recording</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="glass rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8">
      <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-black mb-3 sm:mb-4 md:mb-6 lg:mb-8 tracking-tight">Record Your Presentation</h3>

      <div className="bg-white rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 mb-3 sm:mb-4 md:mb-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        {isRecording && (
          <div className="text-center mb-3 sm:mb-4 md:mb-6">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-copper rounded-full animate-pulse copper-glow-sm"></div>
              <span className="text-xs sm:text-sm text-black/85">
                {isPaused ? 'Paused' : 'Recording...'}
              </span>
            </div>
            {isRecording && interimTranscript && (
              <div className="mt-2 sm:mt-3 md:mt-4 text-xs text-black/70 italic max-w-md mx-auto leading-relaxed px-2">
                {interimTranscript}
              </div>
            )}
          </div>
        )}
        {isProcessing && (
          <div className="text-center mb-3 sm:mb-4 md:mb-6">
            <div className="text-xs sm:text-sm text-black/80 font-medium">Processing recording...</div>
          </div>
        )}

        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3">
          {controlButtons}
        </div>
      </div>

      {showGuidelines && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" onClick={() => setShowGuidelines(false)}>
          <div className="bg-[#DAF1DE] rounded-3xl p-6 sm:p-8 max-w-md w-full border-2 border-[#0B2B26]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-semibold text-black">Recording Guidelines</h3>
              <button
                onClick={() => setShowGuidelines(false)}
                className="p-1 hover:bg-[#0B2B26]/10 rounded-full transition-smooth"
              >
                <X className="w-5 h-5 text-[#0B2B26]" />
              </button>
            </div>
            <div className="space-y-4 text-sm text-black leading-relaxed">
              <p>Click "Start Recording" to begin your oral presentation of the case above.</p>
              <p>You can pause and resume as needed. Click the checkmark when finished.</p>
              <div>
                <p className="font-medium mb-2">For best transcription accuracy:</p>
                <ul className="space-y-1 list-disc list-inside pl-2 text-black/80">
                  <li>Speak clearly and at a moderate pace</li>
                  <li>Position your microphone 6-12 inches from your mouth</li>
                  <li>Record in a quiet environment</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

RecordingInterface.displayName = 'RecordingInterface';
