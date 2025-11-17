/*
  # Add Comprehensive Physical Exam Fields

  ## Summary
  This migration adds additional physical exam system fields to support comprehensive
  clinical documentation in the medical cases table.

  ## Changes Made
  1. New Columns
    - `exam_genitourinary` (text) - Genitourinary system examination findings
    - `exam_lymphatic` (text) - Lymphatic system examination findings
    - `exam_endocrine` (text) - Endocrine system examination findings
    - `exam_psychiatric` (text) - Psychiatric/mental status examination findings
    - `exam_peripheral_vascular` (text) - Peripheral vascular examination findings

  ## Notes
  - Complements existing exam fields (general_appearance, heent, respiratory, etc.)
  - Allows for complete documentation of all body systems
  - Fields can be marked as "Not completed" when not assessed
*/

ALTER TABLE medical_cases
ADD COLUMN IF NOT EXISTS exam_genitourinary text,
ADD COLUMN IF NOT EXISTS exam_lymphatic text,
ADD COLUMN IF NOT EXISTS exam_endocrine text,
ADD COLUMN IF NOT EXISTS exam_psychiatric text,
ADD COLUMN IF NOT EXISTS exam_peripheral_vascular text;