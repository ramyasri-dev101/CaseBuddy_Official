/*
  # Add Patient Name and Remove Category Fields

  1. New Fields
    - `patient_name` (text) - Patient's name for the case
  
  2. Removed Fields
    - `category` - System categorization field
    - `difficulty` - Difficulty level field
  
  3. Notes
    - Patient name added for better case identification
    - Category and difficulty fields removed as cases should not be pre-categorized
*/

-- Add patient name field
ALTER TABLE medical_cases ADD COLUMN IF NOT EXISTS patient_name text;

-- Remove category and difficulty fields
ALTER TABLE medical_cases DROP COLUMN IF EXISTS category;
ALTER TABLE medical_cases DROP COLUMN IF EXISTS difficulty;
