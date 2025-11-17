/*
  # Medical Presentation Teaching App Schema

  ## Overview
  This migration creates the database schema for a medical teaching app where users can:
  - Access AI-generated medical cases
  - Record and upload audio presentations
  - Receive analysis and feedback on their presentations

  ## New Tables

  ### `medical_cases`
  Stores generated medical case scenarios for presentation practice
  - `id` (uuid, primary key) - Unique case identifier
  - `title` (text) - Brief case title
  - `chief_complaint` (text) - Patient's main complaint
  - `history` (text) - Patient history details
  - `physical_exam` (text) - Physical examination findings
  - `lab_results` (text) - Laboratory and diagnostic results
  - `diagnosis` (text) - Expected diagnosis
  - `teaching_points` (text[]) - Key learning objectives
  - `difficulty_level` (text) - beginner, intermediate, advanced
  - `specialty` (text) - Medical specialty (cardiology, neurology, etc.)
  - `created_at` (timestamptz) - When case was generated

  ### `presentations`
  Stores user presentation attempts and recordings
  - `id` (uuid, primary key) - Unique presentation identifier
  - `user_id` (uuid) - References auth.users (presenter)
  - `case_id` (uuid) - References medical_cases
  - `audio_url` (text) - URL to stored audio file
  - `duration_seconds` (integer) - Length of presentation
  - `transcript` (text) - Auto-generated transcript (optional)
  - `analysis` (jsonb) - AI analysis results with feedback
  - `score` (integer) - Overall score (0-100)
  - `created_at` (timestamptz) - When presentation was recorded
  - `updated_at` (timestamptz) - Last update time

  ### `user_progress`
  Tracks user learning progress and statistics
  - `id` (uuid, primary key) - Unique record identifier
  - `user_id` (uuid) - References auth.users
  - `cases_completed` (integer) - Number of cases practiced
  - `average_score` (integer) - Average presentation score
  - `specialties_practiced` (text[]) - List of specialties covered
  - `total_practice_time` (integer) - Total seconds of practice
  - `created_at` (timestamptz) - Record creation time
  - `updated_at` (timestamptz) - Last update time

  ## Security

  ### Row Level Security (RLS)
  All tables have RLS enabled to protect user data

  ### Policies

  #### medical_cases
  - Anyone (authenticated or not) can view cases for practice
  - Only authenticated users can create cases (for future admin features)

  #### presentations
  - Users can only view their own presentations
  - Users can create presentations for themselves
  - Users can update their own presentations
  - Users can delete their own presentations

  #### user_progress
  - Users can only view their own progress
  - Users can create their own progress record
  - Users can update their own progress
*/

-- Create medical_cases table
CREATE TABLE IF NOT EXISTS medical_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  chief_complaint text NOT NULL,
  history text NOT NULL,
  physical_exam text NOT NULL,
  lab_results text NOT NULL,
  diagnosis text NOT NULL,
  teaching_points text[] DEFAULT '{}',
  difficulty_level text NOT NULL DEFAULT 'intermediate',
  specialty text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create presentations table
CREATE TABLE IF NOT EXISTS presentations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id uuid NOT NULL REFERENCES medical_cases(id) ON DELETE CASCADE,
  audio_url text,
  duration_seconds integer DEFAULT 0,
  transcript text,
  analysis jsonb,
  score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cases_completed integer DEFAULT 0,
  average_score integer DEFAULT 0,
  specialties_practiced text[] DEFAULT '{}',
  total_practice_time integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE medical_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Policies for medical_cases
CREATE POLICY "Anyone can view medical cases"
  ON medical_cases FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create cases"
  ON medical_cases FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policies for presentations
CREATE POLICY "Users can view own presentations"
  ON presentations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own presentations"
  ON presentations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presentations"
  ON presentations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own presentations"
  ON presentations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for user_progress
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_presentations_user_id ON presentations(user_id);
CREATE INDEX IF NOT EXISTS idx_presentations_case_id ON presentations(case_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_cases_specialty ON medical_cases(specialty);
CREATE INDEX IF NOT EXISTS idx_medical_cases_difficulty ON medical_cases(difficulty_level);

-- Insert sample medical cases
INSERT INTO medical_cases (title, chief_complaint, history, physical_exam, lab_results, diagnosis, teaching_points, difficulty_level, specialty)
VALUES 
(
  'Acute Chest Pain in Emergency Department',
  '65-year-old male presenting with acute onset chest pain',
  'Patient reports crushing substernal chest pain radiating to left arm for 2 hours. Associated with diaphoresis and nausea. Past medical history includes hypertension and hyperlipidemia. Smoker with 40 pack-year history.',
  'Vital signs: BP 160/95, HR 105, RR 22, O2 sat 94% on room air. Patient appears diaphoretic and anxious. Cardiovascular exam reveals tachycardia, no murmurs. Lungs clear bilaterally.',
  'ECG shows ST elevation in leads II, III, aVF. Troponin I elevated at 2.5 ng/mL. CBC and BMP within normal limits.',
  'Acute Inferior Wall ST-Elevation Myocardial Infarction (STEMI)',
  ARRAY['Recognition of STEMI on ECG', 'Time-critical management', 'Cardiac biomarkers interpretation', 'Risk factor assessment'],
  'intermediate',
  'Cardiology'
),
(
  'Pediatric Fever and Rash',
  '4-year-old female with fever and widespread rash',
  'Mother reports 3 days of high fever (102-104°F) followed by appearance of rash today. Child has been irritable but eating and drinking adequately. No recent travel. Immunizations up to date.',
  'Vital signs: Temp 100.2°F, HR 110, RR 24. Alert, active child. Maculopapular rash on trunk and extremities, blanching. No lymphadenopathy. Ears, throat normal. Lungs clear.',
  'CBC shows mild leukopenia. Rapid strep negative. Urinalysis normal.',
  'Roseola Infantum (Human Herpesvirus 6)',
  ARRAY['Pediatric fever management', 'Rash differential diagnosis', 'Viral exanthem recognition', 'Parent education'],
  'beginner',
  'Pediatrics'
),
(
  'Acute Neurological Deficit',
  '58-year-old female with sudden onset right-sided weakness',
  'Patient awoke this morning unable to move right arm and leg. Husband noted facial droop and slurred speech. Symptom onset approximately 90 minutes ago. History of atrial fibrillation, not on anticoagulation. No recent trauma.',
  'Vital signs: BP 178/102, HR 88 irregular, RR 18. NIH Stroke Scale score 12. Right facial droop, right arm and leg weakness 2/5, decreased sensation right side. Speech slurred but comprehensible.',
  'Fingerstick glucose 110 mg/dL. Head CT shows no hemorrhage or early ischemic changes. ECG confirms atrial fibrillation.',
  'Acute Ischemic Stroke - Left Middle Cerebral Artery Territory',
  ARRAY['Stroke recognition and FAST criteria', 'Time-sensitive tPA decision-making', 'NIH Stroke Scale assessment', 'Thrombolytic therapy contraindications'],
  'advanced',
  'Neurology'
);
