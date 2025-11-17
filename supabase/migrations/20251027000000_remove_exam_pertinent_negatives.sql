/*
  # Remove Exam Pertinent Negatives Field

  ## Summary
  This migration removes the `exam_pertinent_negatives` array field from the medical_cases table
  after all pertinent negatives have been redistributed to their appropriate exam category fields.

  ## Changes Made
  1. Dropped Column
    - `exam_pertinent_negatives` (text[]) - removed after data migration

  ## Rationale
  Pertinent negatives are now integrated directly into their appropriate exam category fields
  for better clinical organization:
    - Cardiovascular findings (e.g., "no chest pain") → exam_cardiovascular
    - Respiratory findings → exam_respiratory
    - Abdominal findings (e.g., "no suprapubic tenderness") → exam_abdominal
    - Neurological findings → exam_neurological
    - Musculoskeletal findings → exam_musculoskeletal
    - HEENT findings (e.g., "no jaundice") → exam_heent
    - Skin findings (e.g., "no rash") → exam_skin
    - Other findings → exam_other

  ## Data Migration
  All existing pertinent negatives were programmatically redistributed to their appropriate
  exam fields before this migration was applied.

  ## Notes
  - Pertinent negatives now provide clinical context within their relevant exam sections
  - This improves readability and clinical coherence of case presentations
  - Applications should now store pertinent negatives directly in exam category fields
*/

-- Remove the exam_pertinent_negatives field
ALTER TABLE medical_cases DROP COLUMN IF EXISTS exam_pertinent_negatives;
