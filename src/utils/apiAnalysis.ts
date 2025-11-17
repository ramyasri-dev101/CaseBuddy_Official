import { MedicalCase } from '../lib/supabase';

export async function analyzePresentation(
  medicalCase: MedicalCase,
  transcript: string
): Promise<string> {
  const emrCase = formatCaseForAPI(medicalCase);

  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transcript,
      emrCase,
    }),
  });

  if (!response.ok) {
    throw new Error('Analysis failed');
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let result = '';

  if (!reader) {
    throw new Error('No response body');
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }

  return result;
}

function formatCaseForAPI(medicalCase: MedicalCase): string {
  return `
PATIENT INFORMATION
-------------------
Name: ${medicalCase.patient_name || 'Not provided'}
Age: ${medicalCase.age || 'Not provided'}
Sex: ${medicalCase.sex || 'Not provided'}
Chief Complaint: ${medicalCase.chief_complaint || 'Not provided'}

HISTORY OF PRESENT ILLNESS
---------------------------
${medicalCase.history_present_illness || 'Not provided'}

PAST MEDICAL HISTORY
---------------------
${medicalCase.past_medical_history || 'None documented'}

MEDICATIONS
-----------
${medicalCase.medications || 'None documented'}

ALLERGIES
---------
${medicalCase.allergies || 'NKDA'}

SOCIAL HISTORY
--------------
${medicalCase.social_history || 'Not provided'}

FAMILY HISTORY
--------------
${medicalCase.family_history || 'Not provided'}

REVIEW OF SYSTEMS
-----------------
${medicalCase.review_of_systems || 'Not provided'}

VITAL SIGNS
-----------
${medicalCase.vital_signs || 'Not provided'}

PHYSICAL EXAMINATION
--------------------
General: ${medicalCase.general_appearance || 'Not documented'}
HEENT: ${medicalCase.heent || 'Not documented'}
Cardiovascular: ${medicalCase.cardiovascular || 'Not documented'}
Respiratory: ${medicalCase.respiratory || 'Not documented'}
Abdomen: ${medicalCase.abdomen || 'Not documented'}
Neurological: ${medicalCase.neurological || 'Not documented'}
Musculoskeletal: ${medicalCase.musculoskeletal || 'Not documented'}
Skin: ${medicalCase.skin || 'Not documented'}

INVESTIGATIONS
--------------
${medicalCase.investigations || 'Not provided'}

ASSESSMENT & PLAN
-----------------
${medicalCase.assessment_plan || 'Not provided'}
  `.trim();
}
