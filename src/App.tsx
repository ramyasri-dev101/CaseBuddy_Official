import { useState, useEffect, useRef } from 'react';
import { supabase, MedicalCase } from './lib/supabase';
import { CaseDisplay } from './components/CaseDisplay';
import { RecordingInterface, RecordingInterfaceRef } from './components/RecordingInterface';
import { FeedbackDisplay } from './components/FeedbackDisplay';
import { About } from './components/About';
import { Guide } from './components/Guide';
import { analyzePresentation } from './utils/apiAnalysis';
import { NeuronLogo } from './components/NeuronLogo';
import { RotateCcw, Home, ArrowLeft, Info, ChevronDown, Menu, X } from 'lucide-react';

type AppState = 'idle' | 'disclaimer' | 'case-loaded' | 'recording' | 'feedback';

function App() {
  const [state, setState] = useState<AppState>('idle');
  const [currentCase, setCurrentCase] = useState<MedicalCase | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showPresentations, setShowPresentations] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showRubricPage, setShowRubricPage] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showTypeResponse, setShowTypeResponse] = useState(false);
  const [typedResponse, setTypedResponse] = useState('');
  const [processingTranscript, setProcessingTranscript] = useState(false);
  const recordingControlRef = useRef<RecordingInterfaceRef>(null);
  const presentationsRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Scroll to top when state changes to feedback
  useEffect(() => {
    if (state === 'feedback') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [state]);

  // Close presentations dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (presentationsRef.current && !presentationsRef.current.contains(event.target as Node)) {
        setShowPresentations(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showPresentations || showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPresentations, showMenu]);

  const loadNewCase = async () => {
    setLoading(true);

    // Reset recording interface if it exists
    if (recordingControlRef.current) {
      recordingControlRef.current.reset();
    }

    // Reset all state to ensure clean slate
    setTranscript('');
    setFeedback(null);
    setAudioBlob(null);
    setShowGuidelines(false);
    setShowPresentations(false);
    setProcessingTranscript(false);

    try {
      const { data, error } = await supabase
        .from('medical_cases')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        const randomCase = data[Math.floor(Math.random() * data.length)];
        setCurrentCase(randomCase);
        setState('case-loaded');
      }
    } catch (error) {
      console.error('Error loading case:', error);
      alert('Failed to load case. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadSpecificCase = async (caseId: string) => {
    setLoading(true);

    // Close presentations dropdown
    setShowPresentations(false);

    // Reset recording interface if it exists
    if (recordingControlRef.current) {
      recordingControlRef.current.reset();
    }

    // Reset all state to ensure clean slate
    setTranscript('');
    setFeedback(null);
    setAudioBlob(null);
    setShowGuidelines(false);
    setProcessingTranscript(false);

    try {
      const { data, error } = await supabase
        .from('medical_cases')
        .select('*')
        .eq('id', caseId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setCurrentCase(data);
        setState('case-loaded');
      }
    } catch (error) {
      console.error('Error loading case:', error);
      alert('Failed to load case. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTranscriptReady = async (transcriptText: string, audio: Blob | null) => {
    if (!currentCase) return;

    setTranscript(transcriptText);
    setAudioBlob(audio);
    setState('feedback');
    setFeedback('Analyzing your presentation...');

    try {
      const analysis = await analyzePresentation(currentCase, transcriptText);
      setFeedback(analysis);
    } catch (error) {
      console.error('Analysis error:', error);
      setFeedback('Error analyzing presentation. Please try again.');
    }
  };

  const resetToStart = () => {
    setState('idle');
    setCurrentCase(null);
    setTranscript('');
    setFeedback(null);
    setAudioBlob(null);
  };

  const goBack = () => {
    if (state === 'feedback') {
      setState('case-loaded');
      setFeedback(null);
    } else if (state === 'case-loaded') {
      setState('idle');
      setCurrentCase(null);
    }
  };


  if (showAbout) {
    return <About onBack={() => setShowAbout(false)} />;
  }

  if (showRubricPage) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setShowRubricPage(false)}
            className="mb-6 text-[#000229] hover:text-[#000229]/80 transition-colors duration-200 flex items-center gap-2"
          >
            ← Back
          </button>
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-6 sm:p-8">
            <h1 className="text-4xl font-bold mb-6" style={{ color: '#000229' }}>Grading Rubric</h1>
            <div className="space-y-6 text-base text-gray-700">
              <div>
                <h3 className="font-semibold text-lg mb-2" style={{ color: '#000229' }}>FRAME</h3>
                <ul className="space-y-1.5 pl-4">
                  <li>✓ States age and gender of patient</li>
                  <li>✓ Includes relevant contextual PMHx (if applicable)</li>
                  <li>✓ States chief complaint or main concern</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2" style={{ color: '#000229' }}>STORY</h3>
                <ul className="space-y-1.5 pl-4">
                  <li>✓ Provides an easy-to-follow HPI that clearly describes the situation</li>
                  <li>✓ Includes focused ROS with pertinent positives and negatives grouped by likely ddx</li>
                  <li>✓ Provides focused PMHx, Allergies, Medications, SocHx, and FamHx with pertinent positives and negatives relevant to ddx</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2" style={{ color: '#000229' }}>OBJECTIVE</h3>
                <ul className="space-y-1.5 pl-4">
                  <li>✓ Begins with vital signs</li>
                  <li>✓ Reports focused and significant physical exam findings</li>
                  <li>✓ Includes relevant investigation results</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2" style={{ color: '#000229' }}>ASSESSMENT</h3>
                <ul className="space-y-1.5 pl-4">
                  <li>✓ States most likely diagnosis(es) based on encounter</li>
                  <li>✓ Lists differential including dangerous and common alternative diagnoses</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2" style={{ color: '#000229' }}>PLAN</h3>
                <ul className="space-y-1.5 pl-4">
                  <li>✓ Outlines symptomatic treatment</li>
                  <li>✓ Lists further investigations and interventions</li>
                  <li>✓ Considers appropriate disposition plan</li>
                  <li>✓ Includes patient education</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2" style={{ color: '#000229' }}>STYLE POINTS</h3>
                <ul className="space-y-1.5 pl-4">
                  <li>✓ Presentation is logically organized</li>
                  <li>✓ Uses clear signposting for key sections (e.g., "My overall impression is…")</li>
                  <li>✓ Delivery is clear, paced appropriately, with suitable pauses and volume</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showGuide) {
    return <Guide onBack={() => setShowGuide(false)} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="backdrop-blur-2xl bg-white/70 sticky top-0 z-40">
        <div className="max-w-[980px] mx-auto px-4 sm:px-5 md:px-8">
          <div className="flex items-center justify-between h-11">
            <div className="flex items-center gap-2 sm:gap-4">
              {state !== 'idle' && (
                <button
                  onClick={goBack}
                  className="flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity duration-200 p-1"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-[15px] h-[15px] sm:w-[17px] sm:h-[17px]" style={{ color: '#000229' }} />
                </button>
              )}
              <h1 className="text-[18px] sm:text-[21px] font-semibold tracking-tight animate-[fadeIn_0.8s_ease-out_2.8s_both]" style={{ color: '#000229' }}>CaseBuddy</h1>
            </div>

            {state !== 'idle' && state !== 'feedback' && state !== 'case-loaded' && (
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4">
                <button
                  onClick={() => setShowRubricPage(true)}
                  className="text-[14px] sm:text-[16px] md:text-[18px] transition-colors duration-200 relative group whitespace-nowrap"
                  style={{ color: '#000229' }}
                >
                  Rubric
                  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-[#000229] transition-all duration-300 group-hover:w-full"></span>
                </button>
                <button
                  onClick={loadNewCase}
                  disabled={loading}
                  className="text-[14px] sm:text-[16px] md:text-[18px] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative group whitespace-nowrap"
                  style={{ color: '#000229' }}
                >
                  New Case
                  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-[#000229] transition-all duration-300 group-hover:w-full"></span>
                </button>
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity duration-200 p-1"
                    aria-label="Menu"
                  >
                    <Menu className="w-[15px] h-[15px] sm:w-[17px] sm:h-[17px]" style={{ color: '#000229' }} />
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 mt-2 z-50 min-w-[120px] bg-white/95 backdrop-blur-2xl rounded-xl shadow-2xl p-2 border border-black/[0.08]">
                      <button
                        onClick={() => { setShowGuide(true); setShowMenu(false); }}
                        className="w-full text-left px-2 sm:px-3 py-2 rounded-lg text-[13px] sm:text-[16px] hover:bg-black/[0.04] transition-all duration-200"
                        style={{ color: '#000229' }}
                      >
                        Guide
                      </button>
                      <button
                        onClick={() => { /* TODO: Add archive functionality */ setShowMenu(false); }}
                        className="w-full text-left px-2 sm:px-3 py-2 rounded-lg text-[13px] sm:text-[16px] hover:bg-black/[0.04] transition-all duration-200"
                        style={{ color: '#000229' }}
                      >
                        Archive
                      </button>
                      <button
                        onClick={() => { setShowAbout(true); setShowMenu(false); }}
                        className="w-full text-left px-2 sm:px-3 py-2 rounded-lg text-[13px] sm:text-[16px] hover:bg-black/[0.04] transition-all duration-200"
                        style={{ color: '#000229' }}
                      >
                        About
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={resetToStart}
                  className="flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity duration-200 p-1"
                  aria-label="Go to home"
                >
                  <Home className="w-[15px] h-[15px] sm:w-[17px] sm:h-[17px]" style={{ color: '#000229' }} />
                </button>
              </div>
            )}

            {state === 'case-loaded' && (
              <div className="flex items-center gap-2 sm:gap-3 md:gap-6">
                <button
                  onClick={() => setShowRubricPage(true)}
                  className="text-[14px] sm:text-[16px] md:text-[18px] transition-colors duration-200 relative group whitespace-nowrap"
                  style={{ color: '#000229' }}
                >
                  Rubric
                  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-[#000229] transition-all duration-300 group-hover:w-full"></span>
                </button>
                <button
                  onClick={loadNewCase}
                  disabled={loading}
                  className="text-[14px] sm:text-[16px] md:text-[18px] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative group whitespace-nowrap"
                  style={{ color: '#000229' }}
                >
                  New Case
                  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-[#000229] transition-all duration-300 group-hover:w-full"></span>
                </button>
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity duration-200 p-1"
                    aria-label="Menu"
                  >
                    <Menu className="w-[15px] h-[15px] sm:w-[17px] sm:h-[17px]" style={{ color: '#000229' }} />
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 mt-2 z-50 min-w-[120px] bg-white/95 backdrop-blur-2xl rounded-xl shadow-2xl p-2 border border-black/[0.08]">
                      <button
                        onClick={() => { setShowGuide(true); setShowMenu(false); }}
                        className="w-full text-left px-2 sm:px-3 py-2 rounded-lg text-[13px] sm:text-[16px] hover:bg-black/[0.04] transition-all duration-200"
                        style={{ color: '#000229' }}
                      >
                        Guide
                      </button>
                      <button
                        onClick={() => { /* TODO: Add archive functionality */ setShowMenu(false); }}
                        className="w-full text-left px-2 sm:px-3 py-2 rounded-lg text-[13px] sm:text-[16px] hover:bg-black/[0.04] transition-all duration-200"
                        style={{ color: '#000229' }}
                      >
                        Archive
                      </button>
                      <button
                        onClick={() => { setShowAbout(true); setShowMenu(false); }}
                        className="w-full text-left px-2 sm:px-3 py-2 rounded-lg text-[13px] sm:text-[16px] hover:bg-black/[0.04] transition-all duration-200"
                        style={{ color: '#000229' }}
                      >
                        About
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={resetToStart}
                  className="flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity duration-200 p-1"
                  aria-label="Go to home"
                >
                  <Home className="w-[15px] h-[15px] sm:w-[17px] sm:h-[17px]" style={{ color: '#000229' }} />
                </button>
              </div>
            )}

            {state === 'feedback' && (
              <div className="flex items-center gap-2 sm:gap-3 md:gap-6">
                <button
                  onClick={() => setShowRubricPage(true)}
                  className="text-[14px] sm:text-[16px] md:text-[18px] transition-colors duration-200 relative group whitespace-nowrap"
                  style={{ color: '#000229' }}
                >
                  Rubric
                  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-[#000229] transition-all duration-300 group-hover:w-full"></span>
                </button>
                <button
                  onClick={loadNewCase}
                  disabled={loading}
                  className="text-[14px] sm:text-[16px] md:text-[18px] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative group whitespace-nowrap"
                  style={{ color: '#000229' }}
                >
                  New Case
                  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-[#000229] transition-all duration-300 group-hover:w-full"></span>
                </button>
                <button
                  onClick={resetToStart}
                  className="flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity duration-200 p-1"
                  aria-label="Go to home"
                >
                  <Home className="w-[15px] h-[15px] sm:w-[17px] sm:h-[17px]" style={{ color: '#000229' }} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[980px] mx-auto px-4 sm:px-5 md:px-8">
        {state === 'idle' && (
          <div className="text-center py-12 sm:py-20 md:py-32 lg:py-40 px-4">
            <h2 className="text-[32px] sm:text-[48px] md:text-[56px] lg:text-[80px] font-semibold mb-3 sm:mb-4 tracking-[-0.015em] leading-[1.05] text-[#807E78] uppercase animate-[slideInFromLeft_1.2s_ease-out]">
              Practice Medical<br />
              Case Presentations.
            </h2>
            <p className="text-[16px] sm:text-[19px] md:text-[21px] lg:text-[24px] text-[#000229] mb-10 sm:mb-16 leading-[1.4] max-w-[750px] mx-auto font-normal animate-[fadeIn_0.8s_ease-out_1.2s_both]" style={{ fontFamily: "'Hubballi', sans-serif", fontWeight: '400' }}>
              Review realistic patient encounters, record your presentation, and receive detailed feedback.
            </p>
            <div className="inline-block relative">
              <button
                onClick={() => setState('disclaimer')}
                disabled={loading}
                className="px-5 sm:px-6 py-2.5 sm:py-3 bg-[#000229] text-white text-lg sm:text-xl font-normal rounded-full hover:bg-[#000229]/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed animate-[fadeIn_0.8s_ease-out_1.8s_both]"
              >
                Get started
              </button>
              {/* Animated line under button - appears slightly later */}
              <div className="absolute left-0 right-0 h-[2px] top-[calc(100%+8px)] overflow-hidden pointer-events-none animate-[fadeIn_0.8s_ease-out_1.4s_both]">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#000229] to-transparent -translate-x-[200%] animate-[moveLineLeft_4s_ease-in-out_infinite]"></div>
              </div>
            </div>
          </div>
        )}

        {state === 'disclaimer' && (
          <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-6 sm:py-12 px-4">
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-6 sm:p-8 md:p-12 max-w-3xl w-full">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-4 sm:mb-6 text-[#000229]">Disclaimer</h2>
              <div className="space-y-3 sm:space-y-4 text-gray-700 text-base sm:text-lg md:text-xl leading-relaxed mb-6 sm:mb-8">
                <p>
                  All cases presented in CaseBuddy are hypothetical and created for educational and training purposes only. They are designed to imitate common medical scenarios and do not represent real patients.
                </p>
                <p>
                  Case scripts and related materials have been developed and reviewed by physicians at the Cumming School of Medicine, University of Calgary, but may not encompass every clinical nuance, diagnostic variation, or management option encountered in real practice.
                </p>
                <p>
                  Users should apply clinical judgment, refer to current evidence-based guidelines, and consult supervising clinicians when applying similar reasoning in real clinical settings.
                </p>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={loadNewCase}
                  disabled={loading}
                  className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#000229] text-white text-lg sm:text-xl font-normal rounded-full hover:bg-[#000229]/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'I agree'}
                </button>
              </div>
            </div>
          </div>
        )}

        {state === 'case-loaded' && currentCase && (
          <div className="space-y-4 sm:space-y-6 lg:space-y-8 py-6 sm:py-8 lg:py-12">
            <CaseDisplay
              medicalCase={currentCase}
              recordingControls={
                <RecordingInterface
                  ref={recordingControlRef}
                  onTranscriptReady={handleTranscriptReady}
                  renderControlsOnly={true}
                  showGuidelines={showGuidelines}
                  onCloseGuidelines={() => setShowGuidelines(false)}
                  isProcessing={processingTranscript}
                />
              }
              onTypeResponse={() => setShowTypeResponse(true)}
            />
          </div>
        )}

        {state === 'feedback' && currentCase && feedback && (
          <div className="space-y-4 sm:space-y-6 lg:space-y-8 py-6 sm:py-8 lg:py-12">
            <FeedbackDisplay
              transcript={transcript}
              feedback={feedback}
              medicalCase={currentCase}
              audioBlob={audioBlob}
            />
          </div>
        )}

        {/* Type Response Modal */}
        {showTypeResponse && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowTypeResponse(false)}>
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-[0_8px_30px_rgba(0,0,0,0.2)] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl sm:text-2xl font-semibold text-black">Type Your Response</h3>
                <button
                  onClick={() => setShowTypeResponse(false)}
                  className="p-1 hover:bg-black/10 rounded-full transition-smooth"
                >
                  <X className="w-5 h-5 text-black" />
                </button>
              </div>
              <textarea
                value={typedResponse}
                onChange={(e) => setTypedResponse(e.target.value)}
                placeholder="Type your case presentation here..."
                className="w-full h-64 p-4 border border-black/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#000229] resize-none text-base"
              />
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowTypeResponse(false);
                    setTypedResponse('');
                  }}
                  className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-colors font-medium text-base sm:text-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (typedResponse.trim()) {
                      handleTranscriptReady(typedResponse, null);
                      setShowTypeResponse(false);
                      setTypedResponse('');
                    }
                  }}
                  disabled={!typedResponse.trim() || processingTranscript}
                  className="px-6 py-2.5 bg-[#000229] text-white rounded-full hover:bg-[#000229]/90 transition-colors font-medium text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingTranscript ? 'Processing...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="max-w-[980px] mx-auto px-5 sm:px-8 py-12 sm:py-16 text-center">
        <p className="text-[16px] font-normal" style={{ color: '#000229' }}>CaseBuddy is a training tool for medical students. No data is stored between sessions.</p>
      </footer>
    </div>
  );
}

export default App;
