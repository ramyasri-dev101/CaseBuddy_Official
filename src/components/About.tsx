import { ArrowLeft } from 'lucide-react';

interface AboutProps {
  onBack: () => void;
}

export function About({ onBack }: AboutProps) {
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
            <h1 className="text-4xl font-bold mb-6" style={{ color: '#000229' }}>About</h1>
          </div>

          <div>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              CaseBuddy is an AI-powered training platform that helps medical students practice and refine their clinical case presentations. It simulates realistic patient encounters, guides learners through the F-SOAP structure, and provides instant, structured feedback on clarity, organization, and clinical reasoning. The goal is to help students present cases efficiently and accurately, building confidence and communication skills essential for clerkship and residency.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3" style={{ color: '#000229' }}>Principal Investigator</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              Dr. Anthony Seto, Clinical Associate Professor<br />
              Cumming School of Medicine, Department of Family Medicine
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3" style={{ color: '#000229' }}>Developed by Medical Students, Cumming School of Medicine</h2>
            <ul className="space-y-2 text-lg text-gray-700">
              <li>Ramya Sridhar (BScN Hons)</li>
              <li>Palak Patel (BSc, MBT)</li>
              <li>Saloni Koshti (MPH, BSc Hons)</li>
            </ul>
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
