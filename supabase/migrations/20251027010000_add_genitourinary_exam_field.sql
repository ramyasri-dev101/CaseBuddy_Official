/*
  # Add Genitourinary Exam Field

  ## Summary
  This migration adds a new exam field for genitourinary findings to properly categorize
  these clinical findings separately from general "other" findings.

  ## Changes Made
  1. New Column
    - `exam_genitourinary` (text) - stores genitourinary examination findings including:
      - Costovertebral angle tenderness/non-tenderness
      - Pelvic examination findings
      - Genital examination findings
      - Urinary system examination findings

  ## Rationale
  Genitourinary findings are a distinct body system and should have their own dedicated
  exam field rather than being grouped with miscellaneous "other" findings. This improves:
    - Clinical organization and documentation
    - Ease of finding relevant exam findings
    - Consistency with other body system exam categories

  ## Notes
  - This field follows the same pattern as other exam fields (cardiovascular, respiratory, etc.)
  - Existing "other" findings will be redistributed to appropriate categories
  - No data migration needed as this is a new field
*/

-- Add the exam_genitourinary field
ALTER TABLE medical_cases
ADD COLUMN IF NOT EXISTS exam_genitourinary text;
