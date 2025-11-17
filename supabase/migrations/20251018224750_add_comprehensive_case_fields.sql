/*
  # Add Comprehensive Case Information Fields

  This migration expands the medical_cases table to include all clinically relevant
  information fields for complete case presentations.

  ## New Fields Added

  ### 1. Patient Identifiers & Context
  - patient_age (integer)
  - patient_sex (text)
  - patient_gender (text)
  - encounter_setting (text) - clinic, ER, ward, etc.
  - encounter_datetime (timestamptz)
  - info_source (text) - patient, family, chart, etc.
  - info_reliability (text)

  ### 2. Chief Concern
  - chief_complaint (text) - in patient's own words
  - complaint_duration (text)

  ### 3. History of Present Illness (HPI)
  - hpi_onset (text)
  - hpi_location (text)
  - hpi_duration (text)
  - hpi_character (text)
  - hpi_aggravating_factors (text)
  - hpi_relieving_factors (text)
  - hpi_associated_symptoms (text[])
  - hpi_severity (text)
  - hpi_progression (text)
  - hpi_functional_impact (text)
  - hpi_previous_episodes (text)
  - patient_concerns (text)

  ### 4. Systems Review
  - ros_pertinent_positives (text[])
  - ros_pertinent_negatives (text[])

  ### 5. Past Medical History
  - pmh_chronic_diseases (text[])
  - pmh_psychiatric (text)
  - pmh_childhood_illnesses (text)
  - pmh_recent_infections (text)
  - pmh_hospitalizations (text)

  ### 6. Surgical History
  - surgical_history (jsonb) - array of {procedure, date, complications}

  ### 7. Medications
  - medications_current (text[])
  - medications_otc (text[])
  - medication_adherence (text)
  - medication_recent_changes (text)

  ### 8. Allergies
  - allergies_drug (jsonb) - array of {drug, reaction}
  - allergies_food (text[])
  - allergies_environmental (text[])

  ### 9. Family History
  - family_history (jsonb) - array of {relation, condition, age}
  - family_sudden_deaths (text)

  ### 10. Social History
  - social_tobacco (text)
  - social_alcohol (text)
  - social_cannabis (text)
  - social_other_substances (text)
  - social_occupation (text)
  - social_occupational_exposures (text)
  - social_living_situation (text)
  - social_home_support (text)
  - social_recent_travel (text)
  - social_diet (text)
  - social_exercise (text)
  - social_caffeine (text)

  ### 11. Sexual History
  - sexual_relationship_status (text)
  - sexual_practices (text)
  - sexual_sti_history (text)
  - sexual_contraception (text)
  - sexual_concerns (text)

  ### 12. Obstetric/Gynecologic
  - ob_gyn_gravida (integer)
  - ob_gyn_para (integer)
  - ob_gyn_menstrual_history (text)
  - ob_gyn_lmp (date)
  - ob_gyn_contraception (text)
  - ob_gyn_pregnancy_outcomes (text)

  ### 13. Mental Health
  - mental_mood (text)
  - mental_anxiety (text)
  - mental_stressors (text)
  - mental_coping (text)
  - mental_supports (text)
  - mental_impact_on_life (text)

  ### 14. Functional Status
  - functional_adls (text)
  - functional_mobility (text)
  - functional_vision (text)
  - functional_hearing (text)

  ### 15. Physical Exam
  - exam_vitals (jsonb) - {bp, hr, rr, temp, o2_sat, weight, height, bmi}
  - exam_general_appearance (text)
  - exam_cardiovascular (text)
  - exam_respiratory (text)
  - exam_abdominal (text)
  - exam_neurological (text)
  - exam_musculoskeletal (text)
  - exam_skin (text)
  - exam_heent (text)
  - exam_other (text)
  - exam_pertinent_negatives (text[])

  ### 16. Investigations
  - labs_ordered (text[])
  - labs_results (jsonb)
  - imaging_ordered (text[])
  - imaging_results (jsonb)
  - other_tests (jsonb)
  - investigations_pending (text[])

  ### 17. Assessment
  - assessment_summary (text)
  - assessment_primary_diagnosis (text)
  - assessment_differential (jsonb) - array of {diagnosis, reasoning, likelihood}
  - assessment_reasoning (text)

  ### 18. Plan
  - plan_immediate (text[])
  - plan_investigations (text[])
  - plan_medications (text[])
  - plan_referrals (text[])
  - plan_follow_up (text)
  - plan_lifestyle_advice (text)
  - plan_patient_education (text)
  - plan_monitoring (text)
  - plan_disposition (text)

  ### 19. Summary
  - case_summary (text) - one-liner summary

  ## Notes
  - All fields are nullable to allow gradual population
  - Existing conversation field is preserved for the conversational interface
  - key_elements array is preserved for evaluation
  - JSONB fields allow structured but flexible data storage
*/

-- Add patient identifiers and context
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS patient_age integer;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS patient_sex text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS patient_gender text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS encounter_setting text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS encounter_datetime timestamptz;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS info_source text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS info_reliability text;

-- Chief concern
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS chief_complaint text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS complaint_duration text;

-- HPI fields
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS hpi_onset text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS hpi_location text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS hpi_duration text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS hpi_character text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS hpi_aggravating_factors text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS hpi_relieving_factors text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS hpi_associated_symptoms text[] DEFAULT '{}';
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS hpi_severity text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS hpi_progression text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS hpi_functional_impact text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS hpi_previous_episodes text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS patient_concerns text;

-- Systems review
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS ros_pertinent_positives text[] DEFAULT '{}';
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS ros_pertinent_negatives text[] DEFAULT '{}';

-- Past medical history
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS pmh_chronic_diseases text[] DEFAULT '{}';
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS pmh_psychiatric text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS pmh_childhood_illnesses text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS pmh_recent_infections text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS pmh_hospitalizations text;

-- Surgical history
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS surgical_history jsonb DEFAULT '[]';

-- Medications
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS medications_current text[] DEFAULT '{}';
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS medications_otc text[] DEFAULT '{}';
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS medication_adherence text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS medication_recent_changes text;

-- Allergies
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS allergies_drug jsonb DEFAULT '[]';
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS allergies_food text[] DEFAULT '{}';
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS allergies_environmental text[] DEFAULT '{}';

-- Family history
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS family_history jsonb DEFAULT '[]';
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS family_sudden_deaths text;

-- Social history
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS social_tobacco text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS social_alcohol text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS social_cannabis text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS social_other_substances text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS social_occupation text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS social_occupational_exposures text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS social_living_situation text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS social_home_support text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS social_recent_travel text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS social_diet text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS social_exercise text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS social_caffeine text;

-- Sexual history
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS sexual_relationship_status text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS sexual_practices text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS sexual_sti_history text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS sexual_contraception text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS sexual_concerns text;

-- OB/GYN
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS ob_gyn_gravida integer;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS ob_gyn_para integer;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS ob_gyn_menstrual_history text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS ob_gyn_lmp date;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS ob_gyn_contraception text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS ob_gyn_pregnancy_outcomes text;

-- Mental health
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS mental_mood text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS mental_anxiety text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS mental_stressors text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS mental_coping text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS mental_supports text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS mental_impact_on_life text;

-- Functional status
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS functional_adls text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS functional_mobility text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS functional_vision text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS functional_hearing text;

-- Physical exam
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS exam_vitals jsonb;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS exam_general_appearance text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS exam_cardiovascular text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS exam_respiratory text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS exam_abdominal text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS exam_neurological text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS exam_musculoskeletal text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS exam_skin text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS exam_heent text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS exam_other text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS exam_pertinent_negatives text[] DEFAULT '{}';

-- Investigations
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS labs_ordered text[] DEFAULT '{}';
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS labs_results jsonb DEFAULT '{}';
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS imaging_ordered text[] DEFAULT '{}';
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS imaging_results jsonb DEFAULT '{}';
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS other_tests jsonb DEFAULT '{}';
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS investigations_pending text[] DEFAULT '{}';

-- Assessment
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS assessment_summary text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS assessment_primary_diagnosis text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS assessment_differential jsonb DEFAULT '[]';
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS assessment_reasoning text;

-- Plan
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS plan_immediate text[] DEFAULT '{}';
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS plan_investigations text[] DEFAULT '{}';
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS plan_medications text[] DEFAULT '{}';
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS plan_referrals text[] DEFAULT '{}';
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS plan_follow_up text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS plan_lifestyle_advice text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS plan_patient_education text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS plan_monitoring text;
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS plan_disposition text;

-- Case summary
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS case_summary text;
