import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqwowndvaomlvctprcsb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxd293bmR2YW9tbHZjdHByY3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MDA1MTYsImV4cCI6MjA3NjM3NjUxNn0.xdJEEECw1-vk0K2QZRjsddKxbagHZvKN5XoDf7AqYPs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function redistributeOtherFindings() {
  console.log('Fetching cases with "Other Findings"...\n');

  const { data: cases, error: fetchError } = await supabase
    .from('medical_cases')
    .select('id, patient_name, exam_other, exam_abdominal, exam_genitourinary')
    .not('exam_other', 'is', null);

  if (fetchError) {
    console.error('Error fetching cases:', fetchError);
    return;
  }

  console.log(`Found ${cases.length} case(s) with Other Findings\n`);

  for (const caseData of cases) {
    console.log(`Processing: ${caseData.patient_name || caseData.id}`);
    console.log(`Other Findings: ${caseData.exam_other}`);

    const otherText = caseData.exam_other || '';
    const updates = {};

    // Parse the findings
    const sentences = otherText.split('.').map(s => s.trim()).filter(s => s.length > 0);

    const abdominalFindings = [];
    const genitourinaryFindings = [];

    sentences.forEach(sentence => {
      const lower = sentence.toLowerCase();

      // Costovertebral angle tenderness goes to abdominal (kidneys)
      if (lower.includes('costovertebral angle') || lower.includes('cvat')) {
        abdominalFindings.push(sentence);
      }
      // Pelvic exam, genital exam, urinary findings go to genitourinary
      else if (
        lower.includes('pelvic exam') ||
        lower.includes('genital') ||
        lower.includes('urinary') ||
        lower.includes('bladder') ||
        lower.includes('prostate') ||
        lower.includes('vaginal') ||
        lower.includes('cervical')
      ) {
        genitourinaryFindings.push(sentence);
      }
    });

    // Update abdominal findings
    if (abdominalFindings.length > 0) {
      const existingAbdominal = caseData.exam_abdominal || '';
      const newAbdominalText = abdominalFindings.join('. ') + '.';
      updates.exam_abdominal = existingAbdominal
        ? `${existingAbdominal} ${newAbdominalText}`
        : newAbdominalText;
      console.log(`  → Adding to Abdominal: ${abdominalFindings.join('. ')}`);
    }

    // Update genitourinary findings
    if (genitourinaryFindings.length > 0) {
      const existingGU = caseData.exam_genitourinary || '';
      const newGUText = genitourinaryFindings.join('. ') + '.';
      updates.exam_genitourinary = existingGU
        ? `${existingGU} ${newGUText}`
        : newGUText;
      console.log(`  → Adding to Genitourinary: ${genitourinaryFindings.join('. ')}`);
    }

    // Clear the exam_other field
    updates.exam_other = null;

    // Apply updates
    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from('medical_cases')
        .update(updates)
        .eq('id', caseData.id);

      if (updateError) {
        console.error(`  ❌ Error updating case:`, updateError);
      } else {
        console.log(`  ✓ Updated successfully`);
      }
    }

    console.log('---\n');
  }

  console.log('Redistribution complete!');
}

redistributeOtherFindings();
