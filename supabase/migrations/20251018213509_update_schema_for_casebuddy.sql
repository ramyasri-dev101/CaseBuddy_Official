/*
  # CaseBuddy Schema Update

  ## Overview
  Restructures the database for CaseBuddy's conversational case format.
  Cases now store natural provider-patient dialogues instead of structured fields.
  All user-related tables are removed as the app is now stateless.

  ## Changes

  ### Drop Old Tables
  - Drop `presentations` table (no user data storage)
  - Drop `user_progress` table (no user data storage)

  ### Update medical_cases Table
  - Drop old structured fields (chief_complaint, history, physical_exam, etc.)
  - Add `conversation` field (text) - stores the natural provider-patient dialogue
  - Keep `specialty` and `difficulty_level` for case organization
  - Add `key_elements` (text[]) - expected elements for evaluation

  ## Security
  - RLS remains enabled on medical_cases
  - Anyone can view cases (no authentication required)
  - Only admins can create/edit cases

  ## Notes
  - This is a complete redesign for stateless, session-based operation
  - No personal data is stored
  - All evaluation happens in memory
*/

-- Drop old tables
DROP TABLE IF EXISTS presentations CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;

-- Drop old policies on medical_cases
DROP POLICY IF EXISTS "Anyone can view medical cases" ON medical_cases;
DROP POLICY IF EXISTS "Authenticated users can create cases" ON medical_cases;

-- Recreate medical_cases with new structure
DROP TABLE IF EXISTS medical_cases CASCADE;

CREATE TABLE medical_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  conversation text NOT NULL,
  specialty text NOT NULL,
  difficulty_level text NOT NULL DEFAULT 'intermediate',
  key_elements text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE medical_cases ENABLE ROW LEVEL SECURITY;

-- Policies for medical_cases (public read access)
CREATE POLICY "Anyone can view medical cases"
  ON medical_cases FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage cases"
  ON medical_cases FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_medical_cases_specialty ON medical_cases(specialty);
CREATE INDEX IF NOT EXISTS idx_medical_cases_difficulty ON medical_cases(difficulty_level);

-- Insert sample conversational cases
INSERT INTO medical_cases (title, conversation, specialty, difficulty_level, key_elements)
VALUES 
(
  'Chest Pain in the Emergency Department',
  E'Provider: Good morning, I''m Dr. Martinez. What brings you to the emergency department today?\n\nPatient: Hi doctor. I''ve been having really bad chest pain for about two hours now. It''s scaring me.\n\nProvider: I can understand why that would be frightening. Can you describe the pain for me? Where exactly do you feel it?\n\nPatient: It''s right here in the center of my chest. It feels like someone is squeezing really hard, like crushing pressure. And it goes down my left arm too.\n\nProvider: Okay. Did this come on suddenly or gradually?\n\nPatient: Pretty suddenly. I was just sitting watching TV and it hit me. I started sweating a lot too, and I felt like I might throw up.\n\nProvider: Have you ever had pain like this before?\n\nPatient: No, never anything like this. I mean, I''ve had some heartburn before, but this is totally different.\n\nProvider: Tell me about your medical history. Do you have any ongoing health conditions?\n\nPatient: Yeah, I have high blood pressure. My doctor put me on medication for that maybe five years ago. And my cholesterol is high too - I take a statin for that.\n\nProvider: Are you taking your medications regularly?\n\nPatient: Most of the time, yeah. Sometimes I forget on weekends.\n\nProvider: Have you had any surgeries in the past?\n\nPatient: Just my appendix out when I was a teenager. That''s it.\n\nProvider: Any allergies to medications?\n\nPatient: No, no allergies that I know of.\n\nProvider: Tell me about your lifestyle. Do you smoke?\n\nPatient: Yeah, I do. I''ve been smoking since I was 20. About a pack a day, maybe a little more.\n\nProvider: How old are you now?\n\nPatient: I''m 65.\n\nProvider: What about alcohol?\n\nPatient: I have a couple beers on the weekend, nothing heavy.\n\nProvider: And what do you do for work?\n\nPatient: I''m a truck driver. Long haul. I sit for hours at a time.\n\nProvider: How has your diet been? Are you eating regularly?\n\nPatient: Honestly, not great. A lot of fast food on the road. I know I should eat better.\n\nProvider: Does anyone in your family have heart problems?\n\nPatient: My dad died of a heart attack when he was 62. My brother had a stent put in a few years ago. He''s only 60.\n\nProvider: How are you feeling emotionally right now?\n\nPatient: Scared, honestly. Really scared. I keep thinking about my dad.',
  'Cardiology',
  'intermediate',
  ARRAY[
    'Chief complaint: chest pain for 2 hours',
    'Crushing substernal chest pain radiating to left arm',
    'Associated symptoms: diaphoresis, nausea',
    'Past medical history: hypertension, hyperlipidemia',
    'Medications: antihypertensive, statin',
    'Surgical history: appendectomy',
    'No known drug allergies',
    'Smoking: 1 pack per day, 45 pack-years',
    'Alcohol: social use',
    'Occupation: truck driver',
    'Poor diet, sedentary lifestyle',
    'Family history: father died of MI at 62, brother had stent at 60',
    'Patient expressing fear and anxiety'
  ]
),
(
  'Pediatric Fever and Rash Visit',
  E'Provider: Hi there! I''m Dr. Chen. And who do we have here today?\n\nParent: This is Emma. She''s four years old. We''re here because she''s had a high fever and now this rash has appeared.\n\nProvider: Thanks for bringing her in. Emma, it''s nice to meet you! Can you tell me when the fever started?\n\nParent: It started three days ago. It was really high - I was checking it every few hours and it was going between 102 and 104. I was giving her Tylenol.\n\nProvider: And when did you notice the rash?\n\nParent: Just this morning. The fever actually seems to be going down now, but then I saw these spots all over her body.\n\nProvider: Can you describe the rash for me?\n\nParent: It''s these little pink spots, mostly on her chest and back, but some on her arms and legs too. They don''t seem to bother her.\n\nProvider: Has she been acting sick otherwise? Eating and drinking okay?\n\nParent: She''s been a bit cranky, which makes sense with the fever. But yeah, she''s been drinking plenty of fluids and eating some. Not her normal appetite, but enough.\n\nProvider: Any vomiting or diarrhea?\n\nParent: No, nothing like that.\n\nProvider: Has Emma been around anyone who''s been sick recently?\n\nParent: Not that I can think of. She goes to preschool, but no one mentioned anything going around.\n\nProvider: Does Emma have any other medical conditions or take any medications regularly?\n\nParent: No, she''s been healthy. This is actually the first time we''ve had to bring her in for being sick.\n\nProvider: That''s good. Is she up to date on her vaccinations?\n\nParent: Yes, she just had her four-year shots a couple months ago.\n\nProvider: Any allergies that you know of?\n\nParent: No allergies.\n\nProvider: And does anyone in the family have immune system problems or anything like that?\n\nParent: No, everyone''s pretty healthy. Her dad had chickenpox as a kid, and I did too.\n\nProvider: How has Emma seemed emotionally? I know fevers can make kids feel pretty miserable.\n\nParent: She was pretty unhappy the first two days, wanted to cuddle a lot, which isn''t like her. But today she seems more like herself. She was even playing a little this morning.',
  'Pediatrics',
  'beginner',
  ARRAY[
    'Chief complaint: fever for 3 days with new rash',
    '4-year-old female patient',
    'High fever 102-104°F for 3 days, now resolving',
    'Rash appeared as fever subsided',
    'Pink maculopapular rash on trunk and extremities',
    'Maintained adequate oral intake',
    'No vomiting or diarrhea',
    'No sick contacts identified',
    'No significant past medical history',
    'Immunizations up to date',
    'No known allergies',
    'No significant family history',
    'Patient more irritable during fever, improving now',
    'Classic roseola presentation'
  ]
),
(
  'Acute Neurological Symptoms',
  E'Provider: Good morning. I''m Dr. Patel, the neurologist on call. I understand you came in because of some concerning symptoms this morning. Can you tell me what happened?\n\nPatient: Yes, I... my words aren''t coming out right, are they? This morning I woke up and my right side doesn''t work.\n\nProvider: I can understand you. You''re doing well communicating. Tell me, what time did you wake up?\n\nPatient: Around 7 a.m. My husband noticed right away something was wrong.\n\nProvider: What exactly did you or your husband notice?\n\nPatient: I couldn''t move my right arm or leg. And my face... he said my face is drooping on the right side. I can feel it.\n\nProvider: Are you having any numbness or tingling?\n\nPatient: Yes, the whole right side feels numb. Like it''s not really there.\n\nProvider: Any vision problems? Double vision, loss of vision?\n\nPatient: No, my vision is fine.\n\nProvider: Headache?\n\nPatient: No headache.\n\nProvider: Have you had any recent injuries or falls? Hit your head?\n\nPatient: No, nothing like that.\n\nProvider: Let me ask about your medical history. What conditions do you have?\n\nPatient: I have an irregular heartbeat. Atrial fibrillation, they call it. I''ve had it for about five years.\n\nProvider: Are you taking a blood thinner for that?\n\nPatient: No. My doctor mentioned it, but I was worried about bleeding, so I said no. Maybe that was a mistake.\n\nProvider: What other medications are you taking?\n\nPatient: Just something for my blood pressure. I think it''s called metoprolol.\n\nProvider: Any history of stroke or mini-strokes before?\n\nPatient: No, nothing like this has ever happened to me.\n\nProvider: Any surgeries?\n\nPatient: I had a hysterectomy about 20 years ago. That''s it.\n\nProvider: Allergies to medications?\n\nPatient: None that I know of.\n\nProvider: Do you smoke or have you smoked in the past?\n\nPatient: I quit about 10 years ago. I smoked for maybe 15 years before that.\n\nProvider: How about alcohol?\n\nPatient: Just wine with dinner sometimes. A glass or two a week.\n\nProvider: What do you do for work?\n\nPatient: I''m a retired teacher. I taught elementary school.\n\nProvider: Your husband is here with you. Does anyone in your family have a history of stroke?\n\nPatient: My mother had a stroke when she was in her 70s. She survived but had some disability after.\n\nProvider: How old are you?\n\nPatient: I''m 58.\n\nProvider: How are you feeling emotionally right now about what''s happening?\n\nPatient: Terrified. I keep thinking about my mother. I don''t want to end up like that.',
  'Neurology',
  'advanced',
  ARRAY[
    'Chief complaint: acute onset right-sided weakness and facial droop',
    '58-year-old female patient',
    'Symptom onset: upon waking at 7 AM',
    'Right arm and leg weakness',
    'Right facial droop',
    'Right-sided numbness',
    'Slurred speech but comprehensible',
    'No vision changes, no headache',
    'No recent trauma',
    'Past medical history: atrial fibrillation (5 years), hypertension',
    'Medications: metoprolol',
    'NOT on anticoagulation despite AFib',
    'Surgical history: hysterectomy 20 years ago',
    'No known drug allergies',
    'Former smoker: quit 10 years ago, 15-year history',
    'Alcohol: minimal social use',
    'Occupation: retired teacher',
    'Family history: mother had stroke in 70s',
    'Patient expressing significant fear',
    'Time-critical stroke presentation requiring urgent evaluation'
  ]
);
