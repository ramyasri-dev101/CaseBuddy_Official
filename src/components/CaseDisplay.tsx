import { MedicalCase } from '../lib/supabase';
import { Activity, Volume2, Hand, FileText, RotateCcw, Pencil, Stethoscope, ClipboardList } from 'lucide-react';
import { useState, ReactNode, useEffect, useRef } from 'react';

interface CaseDisplayProps {
  medicalCase: MedicalCase;
  recordingControls?: ReactNode;
  onTypeResponse?: () => void;
}

export function CaseDisplay({ medicalCase, recordingControls, onTypeResponse }: CaseDisplayProps) {
  const [activeTab, setActiveTab] = useState<'conversation' | 'physical' | 'investigations'>('conversation');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const isPausedRef = useRef(false);
  const playbackRateRef = useRef(1.0);
  const currentLineIndexRef = useRef(0);
  const lines = medicalCase.conversation.split('\n').filter(line => line.trim());
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    playbackRateRef.current = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    return () => {
      // Cleanup speech synthesis on unmount
      speechSynthesis.cancel();
    };
  }, []);

  // Parse vital signs from the exam_vitals (can be JSON object or string)
  const parseVitalSigns = (vitalsData: any) => {
    const vitals = {
      bp: '',
      hr: '',
      rr: '',
      temperature: '',
      o2_saturation: '',
      weight: '',
      height: '',
      bmi: ''
    };

    if (!vitalsData) return vitals;

    console.log('Raw vitalsData:', vitalsData, 'Type:', typeof vitalsData);

    // Parse the data if it's a string
    let parsedData = vitalsData;
    if (typeof vitalsData === 'string') {
      try {
        parsedData = JSON.parse(vitalsData);
        console.log('Parsed once:', parsedData, 'Type:', typeof parsedData);
      } catch (e) {
        console.log('Parse error:', e);
      }
    }

    // If it's a JSON object, extract values directly
    if (typeof parsedData === 'object' && parsedData !== null) {
      vitals.bp = parsedData['Blood pressure'] || parsedData.bp || '';
      vitals.hr = parsedData['Heart rate'] || parsedData.hr || '';
      vitals.rr = parsedData['Respiratory rate'] || parsedData.rr || '';
      vitals.temperature = parsedData['Temperature'] || parsedData.temperature || '';
      vitals.o2_saturation = parsedData['SpO₂'] || parsedData.o2_saturation || '';
      vitals.weight = parsedData['Weight'] || parsedData.weight || '';
      vitals.height = parsedData['Height'] || parsedData.height || '';
      vitals.bmi = parsedData['BMI'] || parsedData.bmi || '';

      console.log('Extracted vitals:', vitals);
      return vitals;
    }

    // Otherwise, parse as text string
    const vitalsText = String(vitalsData);

    // Extract BP (various formats) - look for patterns like "120/80" with optional text before
    const bpMatch = vitalsText.match(/(\d{2,3}\/\d{2,3})/i);
    if (bpMatch) vitals.bp = bpMatch[1];

    // Extract HR - look for 2-3 digit numbers near "HR" or "Heart Rate" or "bpm"
    const hrMatch = vitalsText.match(/(?:HR|Heart\s*Rate|Pulse)[:\s]*(\d{2,3})(?:\s*bpm)?/i) ||
                    vitalsText.match(/(\d{2,3})\s*bpm/i);
    if (hrMatch) vitals.hr = hrMatch[1];

    // Extract RR
    const rrMatch = vitalsText.match(/(?:RR|Respiratory\s*Rate|Resp)[:\s]*(\d{1,2})(?:\s*(?:breaths?\/min|rpm))?/i);
    if (rrMatch) vitals.rr = rrMatch[1];

    // Extract Temperature
    const tempMatch = vitalsText.match(/(?:Temp(?:erature)?)[:\s]*([\d.]+)\s*°?[CF]?/i) ||
                      vitalsText.match(/([\d.]+)\s*°[CF]/i);
    if (tempMatch) vitals.temperature = tempMatch[1];

    // Extract O2 Saturation
    const o2Match = vitalsText.match(/(?:O2|SpO2|Oxygen\s*Sat(?:uration)?)[:\s]*([\d.]+)\s*%?/i) ||
                    vitalsText.match(/([\d]{2,3})\s*%/i);
    if (o2Match) vitals.o2_saturation = o2Match[1];

    // Extract Weight
    const weightMatch = vitalsText.match(/(?:Weight)[:\s]*([\d.]+)\s*(?:kg|lbs?)?/i);
    if (weightMatch) vitals.weight = weightMatch[1];

    // Extract Height
    const heightMatch = vitalsText.match(/(?:Height)[:\s]*([\d.]+)\s*(?:cm|m)?/i);
    if (heightMatch) vitals.height = heightMatch[1];

    // Extract BMI
    const bmiMatch = vitalsText.match(/(?:BMI)[:\s]*([\d.]+)/i);
    if (bmiMatch) vitals.bmi = bmiMatch[1];

    return vitals;
  };

  const vitalSigns = parseVitalSigns(medicalCase.exam_vitals);

  const detectSpeakerGenders = () => {
    const patientGender = medicalCase.patient_sex?.toLowerCase() || '';
    const patientIsFemale = patientGender.includes('female');

    const studentIsFemale = !patientIsFemale;

    return {
      patient: patientIsFemale,
      student: studentIsFemale
    };
  };

  const speakerGenders = detectSpeakerGenders();

  const playConversation = async () => {
    // If resuming from pause, continue from current line
    if (isPaused) {
      setIsPaused(false);
      isPausedRef.current = false;
      setIsPlaying(true);
      await speakFromIndex(currentLineIndexRef.current);
      return;
    }

    // Starting fresh
    setIsPlaying(true);
    setIsPaused(false);
    isPausedRef.current = false;
    setCurrentLineIndex(0);
    currentLineIndexRef.current = 0;
    await speakFromIndex(0);
  };

  const speakFromIndex = async (startIndex: number) => {
    let currentIndex = startIndex;

    const speakNext = async () => {
      // Check if we've been paused
      if (isPausedRef.current) {
        return;
      }

      if (currentIndex >= lines.length) {
        setIsPlaying(false);
        setIsPaused(false);
        isPausedRef.current = false;
        setCurrentLineIndex(0);
        return;
      }

      // Update current line index BEFORE speaking
      setCurrentLineIndex(currentIndex);
      currentLineIndexRef.current = currentIndex;

      const line = lines[currentIndex];
      const isStudent = line.startsWith('Student:');
      const isMedicalStudent = line.startsWith('Medical Student:');
      const isProvider = line.startsWith('Provider:') || line.startsWith('Physician:');

      let text = '';
      if (isStudent) {
        text = line.replace(/^Student:\s*/, '');
      } else if (isMedicalStudent) {
        text = line.replace(/^Medical Student:\s*/, '');
      } else if (isProvider) {
        text = line.replace(/^(Provider:|Physician:)\s*/, '');
      } else {
        text = line.replace(/^Patient:\s*/, '');
      }

      if (text.trim()) {
        const isFemale = (isStudent || isMedicalStudent)
          ? speakerGenders.student
          : speakerGenders.patient;

        console.log(`Line ${currentIndex + 1}: ${(isStudent || isMedicalStudent) ? 'Student' : 'Patient'} - isFemale: ${isFemale}`);

        try {
          const utterance = new SpeechSynthesisUtterance(text);
          currentUtteranceRef.current = utterance;

          const voices = speechSynthesis.getVoices();
          const usEnglishVoices = voices.filter(v =>
            v.lang.startsWith('en-US') || v.lang.startsWith('en_US')
          );

          let selectedVoice = null;
          if (isFemale) {
            selectedVoice = usEnglishVoices.find(v =>
              v.name.toLowerCase().includes('karen') ||
              v.name.toLowerCase().includes('victoria') ||
              v.name.toLowerCase().includes('zira') ||
              v.name.toLowerCase().includes('google us english')
            );
          } else {
            selectedVoice = usEnglishVoices.find(v =>
              v.name.toLowerCase().includes('david') ||
              v.name.toLowerCase().includes('mark') ||
              v.name.toLowerCase().includes('google us english')
            );
          }

          if (selectedVoice) {
            utterance.voice = selectedVoice;
          } else if (usEnglishVoices.length > 0) {
            utterance.voice = usEnglishVoices[0];
          }

          utterance.rate = 1.20;
          utterance.pitch = isFemale ? 1.1 : 0.95;
          utterance.volume = 1.0;

          await new Promise<void>((resolve, reject) => {
            utterance.onend = () => {
              currentUtteranceRef.current = null;
              resolve();
            };
            utterance.onerror = (error) => {
              currentUtteranceRef.current = null;
              reject(error);
            };
            utterance.onpause = () => {
              currentUtteranceRef.current = null;
              reject(new Error('Paused'));
            };
            speechSynthesis.speak(utterance);
          });

          // Check if paused after speaking
          if (isPausedRef.current) {
            return;
          }

          // Only move to next line after successfully completing this one
          currentIndex++;

          // Check again if paused before continuing
          if (!isPausedRef.current) {
            setTimeout(() => {
              speakNext();
            }, 500);
          }
        } catch (error) {
          // If paused during speech, stay on current line
          if (isPausedRef.current) {
            return;
          }
          console.error('Error generating speech:', error);
          currentIndex++;
          if (!isPausedRef.current) {
            speakNext();
          }
        }
      } else {
        currentIndex++;
        if (!isPausedRef.current) {
          speakNext();
        }
      }
    };

    await speakNext();
  };

  const stopAudio = () => {
    // Set the ref first so callbacks check the right value immediately
    isPausedRef.current = true;
    setIsPaused(true);
    // Keep isPlaying true so we can resume from the same position
    // setIsPlaying(false); - removed this

    // Cancel speech synthesis
    speechSynthesis.cancel();
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.16)] transition-shadow duration-300">
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 pb-0 border-b border-black/[0.06]">
        <div className="mb-3 sm:mb-4 md:mb-6 lg:mb-8">
          <div className="flex justify-between items-start gap-3">
            {/* Patient info on left */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight text-black">{medicalCase.patient_name || medicalCase.title}</h2>
              </div>
              <div className="text-black/80 text-sm sm:text-base md:text-lg font-light mt-1 space-y-0.5">
              {medicalCase.patient_age && (
                <div>{medicalCase.patient_age} years old</div>
              )}
              {medicalCase.patient_birthdate && (
                <div>Birthdate: {(() => {
                  const date = new Date(medicalCase.patient_birthdate);
                  const month = date.toLocaleString('en-US', { month: 'long' });
                  const day = date.getDate();
                  const year = date.getFullYear();
                  return `${month} ${day}, ${year}`;
                })()}</div>
              )}
              {medicalCase.patient_sex && (
                <div>Biological Sex: {medicalCase.patient_sex}</div>
              )}
                {medicalCase.patient_gender && (
                  <div>Pronouns: {medicalCase.patient_gender}</div>
                )}
              </div>
            </div>

            {/* Recording controls at top right - all screen sizes */}
            {recordingControls && (
              <div className="flex-shrink-0">
                <div className="flex flex-col gap-2">
                  {recordingControls}
                  {onTypeResponse && (
                    <button
                      onClick={onTypeResponse}
                      className="flex items-center justify-center gap-1.5 bg-[#000229] text-white px-4 sm:px-5 py-2 sm:py-3 rounded-full hover:bg-[#000229]/90 transition-all duration-100 font-medium text-base sm:text-lg w-full"
                    >
                      <Pencil className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                      Type
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Audio controls below patient info */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3 items-center">
            <div className="relative group">
                <button
                  onClick={playConversation}
                  disabled={isPlaying && !isPaused}
                  className="flex items-center justify-center p-2 sm:p-2.5 md:p-3 rounded-full transition-smooth text-white border-none disabled:cursor-not-allowed disabled:opacity-50 bg-[#000229] hover:bg-[#000229]/90"
                >
                  <Volume2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-[#000229] text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                  Hear script
                </div>
              </div>
            <div className="relative group">
              <button
                onClick={stopAudio}
                disabled={!isPlaying}
                className="flex items-center justify-center p-2 sm:p-3 rounded-full transition-smooth text-white border-none disabled:cursor-not-allowed disabled:opacity-50 bg-[#000229] hover:bg-[#000229]/90"
              >
                <Hand className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-[#000229] text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                Pause script
              </div>
            </div>
            <div className="relative group">
              <button
                onClick={() => {
                  speechSynthesis.cancel();
                  setIsPlaying(false);
                  setIsPaused(false);
                  setCurrentLineIndex(0);
                  currentLineIndexRef.current = 0;
                  isPausedRef.current = false;
                  currentUtteranceRef.current = null;
                  playConversation();
                }}
                className="flex items-center justify-center p-2 sm:p-3 rounded-full transition-smooth text-white border-none bg-[#000229] hover:bg-[#000229]/90"
              >
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-[#000229] text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                Restart script
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-1 sm:gap-2 border-b border-black/[0.06] overflow-x-auto">
          <button
            onClick={() => setActiveTab('conversation')}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 lg:px-5 py-2 sm:py-3 text-lg sm:text-xl font-medium transition-smooth whitespace-nowrap ${
              activeTab === 'conversation'
                ? 'text-black border-b-2 border-black'
                : 'text-black/70 hover:text-black'
            }`}
          >
            Interview
          </button>
          <button
            onClick={() => setActiveTab('physical')}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 lg:px-5 py-2 sm:py-3 text-lg sm:text-xl font-medium transition-smooth whitespace-nowrap ${
              activeTab === 'physical'
                ? 'text-black border-b-2 border-black'
                : 'text-black/70 hover:text-black'
            }`}
          >
            <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 md:hidden" />
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 hidden md:inline" />
            <span className="hidden md:inline">Physical Exam</span>
          </button>
          <button
            onClick={() => setActiveTab('investigations')}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 lg:px-5 py-2 sm:py-3 text-lg sm:text-xl font-medium transition-smooth whitespace-nowrap ${
              activeTab === 'investigations'
                ? 'text-black border-b-2 border-black'
                : 'text-black/70 hover:text-black'
            }`}
          >
            <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 md:hidden" />
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 hidden md:inline" />
            <span className="hidden md:inline">Investigations</span>
          </button>
        </div>
      </div>

      <div className="p-3 sm:p-4 md:p-6 lg:p-8">
        {activeTab === 'conversation' && (
          <div className="bg-white rounded-2xl p-3 sm:p-4 md:p-6 max-h-[300px] sm:max-h-[400px] md:max-h-[500px] overflow-y-auto shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <div className="space-y-4">
              {lines.map((line, index) => {
                const isStudent = line.startsWith('Student:');
                const isMedicalStudent = line.startsWith('Medical Student:');
                const isProvider = line.startsWith('Provider:') || line.startsWith('Physician:');
                const isPatient = line.startsWith('Patient:');
                const isNarrator = line.startsWith('Narrator:');
                const isNurse = line.startsWith('Nurse:');

                let speaker = '';
                let text = '';

                if (isStudent) {
                  speaker = 'Student:';
                  text = line.replace(/^Student:\s*/, '');
                } else if (isMedicalStudent) {
                  speaker = 'Medical Student:';
                  text = line.replace(/^Medical Student:\s*/, '');
                } else if (isProvider) {
                  speaker = 'Physician:';
                  text = line.replace(/^(Provider:|Physician:)\s*/, '');
                } else if (isPatient) {
                  speaker = 'Patient:';
                  text = line.replace(/^Patient:\s*/, '');
                } else if (isNarrator) {
                  speaker = 'Narrator:';
                  text = line.replace(/^Narrator:\s*/, '');
                } else if (isNurse) {
                  speaker = 'Nurse:';
                  text = line.replace(/^Nurse:\s*/, '');
                } else {
                  text = line;
                }

                return (
                  <div key={index} className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                    <div className="text-base sm:text-lg md:text-xl text-black/80 min-w-0 sm:min-w-32 flex-shrink-0 font-bold">
                      {speaker}
                    </div>
                    <div className="text-base sm:text-lg md:text-xl text-black/80 flex-1 leading-relaxed">{text}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'physical' && (
          <div className="bg-white rounded-2xl p-3 sm:p-4 md:p-6 max-h-[300px] sm:max-h-[400px] md:max-h-[500px] overflow-y-auto shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="space-y-4">
            {medicalCase.exam_vitals && (
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <h4 className="font-semibold text-black mb-3 sm:mb-4 text-lg sm:text-xl">Vital Signs</h4>
                {(vitalSigns.bp || vitalSigns.hr || vitalSigns.rr || vitalSigns.temperature ||
                  vitalSigns.o2_saturation || vitalSigns.weight || vitalSigns.height || vitalSigns.bmi) ? (
                  <div className="space-y-2">
                    {vitalSigns.temperature && (
                      <div className="flex items-center">
                        <span className="text-black/75 font-medium w-28 sm:w-36 text-lg sm:text-xl">Temp:</span>
                        <span className="text-black font-light text-lg sm:text-xl">{vitalSigns.temperature}</span>
                      </div>
                    )}
                    {vitalSigns.hr && (
                      <div className="flex items-center">
                        <span className="text-black/75 font-medium w-28 sm:w-36 text-lg sm:text-xl">HR:</span>
                        <span className="text-black font-light text-lg sm:text-xl">{vitalSigns.hr}</span>
                      </div>
                    )}
                    {vitalSigns.rr && (
                      <div className="flex items-center">
                        <span className="text-black/75 font-medium w-28 sm:w-36 text-lg sm:text-xl">RR:</span>
                        <span className="text-black font-light text-lg sm:text-xl">{vitalSigns.rr}</span>
                      </div>
                    )}
                    {vitalSigns.bp && (
                      <div className="flex items-center">
                        <span className="text-black/75 font-medium w-28 sm:w-36 text-lg sm:text-xl">BP:</span>
                        <span className="text-black font-light text-lg sm:text-xl">{vitalSigns.bp}</span>
                      </div>
                    )}
                    {vitalSigns.o2_saturation && (
                      <div className="flex items-center">
                        <span className="text-black/75 font-medium w-28 sm:w-36 text-lg sm:text-xl">SpO₂:</span>
                        <span className="text-black font-light text-lg sm:text-xl">{vitalSigns.o2_saturation}</span>
                      </div>
                    )}
                    {vitalSigns.weight && (
                      <div className="flex items-center">
                        <span className="text-black/75 font-medium w-28 sm:w-36 text-lg sm:text-xl">Weight:</span>
                        <span className="text-black font-light text-lg sm:text-xl">{vitalSigns.weight}</span>
                      </div>
                    )}
                    {vitalSigns.height && (
                      <div className="flex items-center">
                        <span className="text-black/75 font-medium w-28 sm:w-36 text-lg sm:text-xl">Height:</span>
                        <span className="text-black font-light text-lg sm:text-xl">{vitalSigns.height}</span>
                      </div>
                    )}
                    {vitalSigns.bmi && (
                      <div className="flex items-center">
                        <span className="text-black/75 font-medium w-28 sm:w-36 text-lg sm:text-xl">BMI:</span>
                        <span className="text-black font-light text-lg sm:text-xl">{vitalSigns.bmi}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-black/85 leading-relaxed">{medicalCase.exam_vitals}</p>
                )}
              </div>
            )}

            {medicalCase.exam_general_appearance && (
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <h4 className="font-semibold text-black mb-3 text-lg sm:text-xl">General Appearance</h4>
                <p className="text-lg sm:text-xl text-black/85 leading-relaxed">{medicalCase.exam_general_appearance}</p>
              </div>
            )}

            {medicalCase.exam_cardiovascular && (
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <h4 className="font-semibold text-black mb-3 text-lg sm:text-xl">Cardiovascular</h4>
                <p className="text-base sm:text-lg text-black/85 leading-relaxed">{medicalCase.exam_cardiovascular}</p>
              </div>
            )}

            {medicalCase.exam_respiratory && (
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <h4 className="font-semibold text-black mb-3 text-lg sm:text-xl">Respiratory</h4>
                <p className="text-base sm:text-lg text-black/85 leading-relaxed">{medicalCase.exam_respiratory}</p>
              </div>
            )}

            {medicalCase.exam_abdominal && (
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <h4 className="font-semibold text-black mb-3 text-lg sm:text-xl">Abdominal</h4>
                <p className="text-base sm:text-lg text-black/85 leading-relaxed">{medicalCase.exam_abdominal}</p>
              </div>
            )}

            {medicalCase.exam_heent && (
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <h4 className="font-semibold text-black mb-3 text-lg sm:text-xl">HEENT</h4>
                <p className="text-base sm:text-lg text-black/85 leading-relaxed">{medicalCase.exam_heent}</p>
              </div>
            )}

            {medicalCase.exam_musculoskeletal && (
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <h4 className="font-semibold text-black mb-3 text-lg sm:text-xl">Musculoskeletal</h4>
                <p className="text-base sm:text-lg text-black/85 leading-relaxed">{medicalCase.exam_musculoskeletal}</p>
              </div>
            )}

            {medicalCase.exam_neurological && (
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <h4 className="font-semibold text-black mb-3 text-lg sm:text-xl">Neurological</h4>
                <p className="text-base sm:text-lg text-black/85 leading-relaxed">{medicalCase.exam_neurological}</p>
              </div>
            )}

            {medicalCase.exam_skin && (
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <h4 className="font-semibold text-black mb-3 text-lg sm:text-xl">Integumentary</h4>
                <p className="text-base sm:text-lg text-black/85 leading-relaxed">{medicalCase.exam_skin}</p>
              </div>
            )}

            {medicalCase.exam_genitourinary && (
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <h4 className="font-semibold text-black mb-3 text-lg sm:text-xl">Genitourinary</h4>
                <p className="text-base sm:text-lg text-black/85 leading-relaxed">{medicalCase.exam_genitourinary}</p>
              </div>
            )}

            {medicalCase.exam_peripheral_vascular && (
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <h4 className="font-semibold text-black mb-3 text-lg sm:text-xl">Peripheral Vascular</h4>
                <p className="text-base sm:text-lg text-black/85 leading-relaxed">{medicalCase.exam_peripheral_vascular}</p>
              </div>
            )}

            {medicalCase.exam_psychiatric && (
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <h4 className="font-semibold text-black mb-3 text-lg sm:text-xl">Psychiatric</h4>
                <p className="text-base sm:text-lg text-black/85 leading-relaxed">{medicalCase.exam_psychiatric}</p>
              </div>
            )}
          </div>
          </div>
        )}

        {activeTab === 'investigations' && (
          <div className="bg-white rounded-2xl p-3 sm:p-4 md:p-6 max-h-[300px] sm:max-h-[400px] md:max-h-[500px] overflow-y-auto shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="space-y-4">
            {medicalCase.ecg && (
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <h4 className="font-semibold text-black mb-3 text-lg sm:text-xl">ECG</h4>
                <p className="text-black/85 leading-relaxed">{medicalCase.ecg}</p>
              </div>
            )}

            {!medicalCase.ecg && (
              <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <p className="text-base sm:text-lg text-black/85 text-center">No investigations available</p>
              </div>
            )}
          </div>
          </div>
        )}
      </div>
    </div>
  );
}
