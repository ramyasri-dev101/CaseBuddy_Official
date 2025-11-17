import { FileText, Volume2 } from 'lucide-react';
import { MedicalCase } from '../lib/supabase';
import { useState, useEffect } from 'react';
import { CaseDisplay } from './CaseDisplay';

interface FeedbackDisplayProps {
  transcript: string;
  feedback: string;
  medicalCase: MedicalCase;
  audioBlob: Blob | null;
}

export function FeedbackDisplay({
  transcript,
  feedback,
  medicalCase,
  audioBlob,
}: FeedbackDisplayProps) {
  const [showCaseScript, setShowCaseScript] = useState(false);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [audioBlob]);

  return (
    <div className="space-y-6">
      {/* Control Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowCaseScript(!showCaseScript)}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-black/10 hover:border-black/20 transition-colors"
        >
          <FileText className="w-4 h-4" />
          <span className="text-sm font-medium">
            {showCaseScript ? 'Hide' : 'Show'} Case Script
          </span>
        </button>

        {audioUrl && (
          <button
            onClick={() => setShowAudioPlayer(!showAudioPlayer)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-black/10 hover:border-black/20 transition-colors"
          >
            <Volume2 className="w-4 h-4" />
            <span className="text-sm font-medium">
              {showAudioPlayer ? 'Hide' : 'Show'} Audio
            </span>
          </button>
        )}
      </div>

      {/* Case Script */}
      {showCaseScript && (
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-6">
          <CaseDisplay medicalCase={medicalCase} />
        </div>
      )}

      {/* Audio Player */}
      {showAudioPlayer && audioUrl && (
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-6">
          <h3 className="text-lg font-semibold mb-4 text-[#000229]">Your Recording</h3>
          <audio controls src={audioUrl} className="w-full" />
        </div>
      )}

      {/* Transcript */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-6">
        <h3 className="text-lg font-semibold mb-4 text-[#000229]">Your Transcript</h3>
        <div className="text-gray-700 whitespace-pre-wrap">{transcript}</div>
      </div>

      {/* Feedback */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-6">
        <h3 className="text-lg font-semibold mb-4 text-[#000229]">Feedback</h3>
        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
          {feedback}
        </div>
      </div>
    </div>
  );
}
