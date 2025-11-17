import { ArrowLeft } from 'lucide-react';

interface GuideProps {
  onBack: () => void;
}

export function Guide({ onBack }: GuideProps) {
  return (
    <div className="min-h-screen bg-white">
      <header className="backdrop-blur-2xl bg-white/70 sticky top-0 z-40">
        <div className="max-w-[980px] mx-auto px-5 sm:px-8 h-20 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[18px] transition-colors duration-200"
            style={{ color: '#000229' }}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>
      </header>

      <main className="max-w-[980px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-6" style={{ color: '#000229' }}>Recording Guidelines</h1>
          </div>

          <div>
            <ol className="space-y-3 text-lg text-gray-700 list-decimal list-inside pl-4">
              <li>Review the case.</li>
              <li>Click Start Recording on the top right of the case.</li>
              <li>If you would like to pause the recording, press the hand.</li>
              <li>If recording complete and ready for analysis, press the checkmark to submit.</li>
              <li>The Analysis Page should appear.</li>
              <li>To understand how you are marked, press the rubric.</li>
            </ol>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-3" style={{ color: '#000229' }}>For best transcription accuracy</h2>
            <ul className="space-y-2 text-lg text-gray-700 list-disc list-inside pl-4">
              <li>Speak clearly and at a moderate pace</li>
              <li>Position your microphone 15-30 cm from your mouth</li>
              <li>Record in a quiet environment</li>
              <li>Include all relevant patient information</li>
              <li>Follow standard case presentation format</li>
              <li>Pause briefly between sections for clarity</li>
            </ul>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: '#000229' }}>Rubric</h2>

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
      </main>

      <footer className="max-w-[980px] mx-auto px-5 sm:px-8 py-12 sm:py-16 text-center">
        <p className="text-[16px] font-normal" style={{ color: '#000229' }}>
          CaseBuddy is a training tool for medical students. No data is stored between sessions.
        </p>
      </footer>
    </div>
  );
}
