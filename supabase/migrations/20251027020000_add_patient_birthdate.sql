/*
  # Add Patient Birthdate Field

  ## Summary
  This migration adds a patient_birthdate field to store the patient's date of birth
  for display in the EMR alongside age.

  ## Changes Made
  1. New Column
    - `patient_birthdate` (text) - stores patient's date of birth in readable format
      (e.g., "May 12, 1997")

  ## Notes
  - This field complements the existing patient_age field
  - Displayed as "DOB: [date]" after the age in the EMR header
  - Uses text format for flexibility in date representation
*/

ALTER TABLE medical_cases
ADD COLUMN IF NOT EXISTS patient_birthdate text;
