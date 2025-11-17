import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface MedicalCase {
  id: string;
  title: string;
  conversation: string;
  specialty: string;
  key_elements: string[];
  created_at: string;

  patient_name?: string;
  patient_age?: number;
  patient_birthdate?: string;
  patient_sex?: string;
  patient_gender?: string;
  encounter_setting?: string;
  encounter_datetime?: string;
  info_source?: string;
  info_reliability?: string;

  chief_complaint?: string;
  complaint_duration?: string;

  hpi_onset?: string;
  hpi_location?: string;
  hpi_duration?: string;
  hpi_character?: string;
  hpi_aggravating_factors?: string;
  hpi_relieving_factors?: string;
  hpi_associated_symptoms?: string[];
  hpi_severity?: string;
  hpi_progression?: string;
  hpi_functional_impact?: string;
  hpi_previous_episodes?: string;
  patient_concerns?: string;

  ros_pertinent_positives?: string[];
  ros_pertinent_negatives?: string[];

  pmh_chronic_diseases?: string[];
  pmh_psychiatric?: string;
  pmh_childhood_illnesses?: string;
  pmh_recent_infections?: string;
  pmh_hospitalizations?: string;

  surgical_history?: Array<{ procedure: string; date?: string; complications?: string }>;

  medications_current?: string[];
  medications_otc?: string[];
  medication_adherence?: string;
  medication_recent_changes?: string;

  allergies_drug?: Array<{ drug: string; reaction: string }>;
  allergies_food?: string[];
  allergies_environmental?: string[];

  family_history?: Array<{ relation: string; condition: string; age?: string }>;
  family_sudden_deaths?: string;

  social_tobacco?: string;
  social_alcohol?: string;
  social_cannabis?: string;
  social_other_substances?: string;
  social_occupation?: string;
  social_occupational_exposures?: string;
  social_living_situation?: string;
  social_home_support?: string;
  social_recent_travel?: string;
  social_diet?: string;
  social_exercise?: string;
  social_caffeine?: string;

  sexual_relationship_status?: string;
  sexual_practices?: string;
  sexual_sti_history?: string;
  sexual_contraception?: string;
  sexual_concerns?: string;

  ob_gyn_gravida?: number;
  ob_gyn_para?: number;
  ob_gyn_menstrual_history?: string;
  ob_gyn_lmp?: string;
  ob_gyn_contraception?: string;
  ob_gyn_pregnancy_outcomes?: string;

  mental_mood?: string;
  mental_anxiety?: string;
  mental_stressors?: string;
  mental_coping?: string;
  mental_supports?: string;
  mental_impact_on_life?: string;

  functional_adls?: string;
  functional_mobility?: string;
  functional_vision?: string;
  functional_hearing?: string;

  exam_vitals?: string;
  exam_general_appearance?: string;
  exam_cardiovascular?: string;
  exam_respiratory?: string;
  exam_abdominal?: string;
  exam_neurological?: string;
  exam_musculoskeletal?: string;
  exam_skin?: string;
  exam_heent?: string;
  exam_genitourinary?: string;
  exam_lymphatic?: string;
  exam_endocrine?: string;
  exam_psychiatric?: string;
  exam_peripheral_vascular?: string;
  exam_other?: string;

  ecg?: string;

  labs_ordered?: string[];
  labs_results?: Record<string, any>;
  imaging_ordered?: string[];
  imaging_results?: Record<string, any>;
  other_tests?: Record<string, any>;
  investigations_pending?: string[];

  assessment_summary?: string;
  assessment_primary_diagnosis?: string;
  assessment_differential?: Array<{
    diagnosis: string;
    reasoning: string;
    likelihood?: string;
  }>;
  assessment_reasoning?: string;

  plan_immediate?: string[];
  plan_investigations?: string[];
  plan_medications?: string[];
  plan_referrals?: string[];
  plan_follow_up?: string;
  plan_lifestyle_advice?: string;
  plan_patient_education?: string;
  plan_monitoring?: string;
  plan_disposition?: string;

  case_summary?: string;
}
