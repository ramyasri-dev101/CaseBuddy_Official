/*
  # Add ECG Field

  ## Summary
  This migration adds a dedicated ECG field to the medical_cases table for storing
  electrocardiogram findings separately from other investigations.

  ## Changes Made
  1. New Column
    - `ecg` (text) - Electrocardiogram findings
  
  ## Notes
  - This creates a dedicated field for ECG results
  - Separates ECG from the generic investigations fields
*/

ALTER TABLE medical_cases
ADD COLUMN IF NOT EXISTS ecg text;