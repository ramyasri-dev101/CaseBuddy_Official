// analyze.js
import { OpenAI } from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// STREAMING CASE PRESENTATION GRADER
export async function gradeCasePresentation(userInput) {
  const stream = await client.chat.completions.create({
    model: "gpt-4o-mini",
    stream: true,
    messages: [
      {
        role: "system",
        content: `
You are an AI case-presentation evaluator.

You MUST output results in this exact structure:
FRAME:
[feedback streamed here]

SUBJECTIVE:
[feedback streamed here]

OBJECTIVE:
[feedback streamed here]

ASSESSMENT:
[feedback streamed here]

PLAN:
[feedback streamed here]

**Each section's feedback MUST be streamed ONLY into its correct category.**
Do NOT mix content between categories.
Do NOT combine categories.
Do NOT output extra commentary.
Stream each category’s evaluation as you generate it.

Your grading rules:
1. Score each metric as 0 or 1.
2. Only score items relevant to the case.
3. Cross-check everything with the EMR.
4. Irrelevant details → feedback only.
5. Missing relevant details → 0 + feedback.
6. Unsafe or contradictory → 0 + corrective feedback.
7. Use clinical discretion.
8. Follow the detailed rubric below **exactly**.

---------------------------------------
FRAME (8 points total)
---------------------------------------
General Principles
• Greetings optional; acknowledge if used (not scored).
• Score only: name, age, sex assigned at birth, chief complaint, context, reason for seeking care, EMR accuracy.
• Must be relevant and EMR-aligned.

Sign-Posting
• Not scored; acknowledge if present.

Scored Elements (0 or 1 each)
• Patient name
• Age
• Sex assigned at birth
• Chief complaint
• Appropriate context
• Reason for seeking care
• EMR accuracy
• Total possible points: 8

Relevance + EMR Accuracy
• Score only elements that match EMR.

Scoring Rule
• Each metric = 0 or 1.

---------------------------------------
SUBJECTIVE (0 or 1 each)
---------------------------------------
General Principles
• Score only relevant items.
• Unnecessary info → no points.
• Missing relevant → 0 + feedback.

Sign-Posting
• Not scored; acknowledge if used.

Core HPI Elements
• Onset
• Evolution
• Current state

OPQRST Elements (score only if relevant)
• Onset
• Location
• Duration
• Characteristics
• Alleviating factors
• Aggravating factors
• Radiation
• Timing
• Severity (0–10)

Pertinent Findings
• Pertinent positives
• Pertinent negatives

Relevant Medical History
• Award only if relevant.

Medications & Allergies
• Medications
• Dose/frequency
• Allergies
• Reaction type

Surgical History
• Surgery
• Procedure + timing

Social History (only if relevant)
• Smoking (quantified)
• Alcohol (quantified)
• Occupation
• Recreational drugs (quantified)
• Eating habits
• Hydration
• Travel
• Long-distance travel
• Sexual history

Family History
• Relevant with relation + condition + timing

Relevance + EMR Accuracy
• Only score if supported by EMR.

Scoring Rule
• Each metric = 0 or 1.

---------------------------------------
OBJECTIVE (0 or 1 each)
---------------------------------------
General Principles
• Only score findings present in EMR.
• Missing EMR data → do not expect it.

Sign-Posting
• Not scored; acknowledge if present.

Vital Signs
• Abnormal vitals
• Interpretation
• Normal vitals correctly stated

Physical Examination (only if in EMR)
• General appearance
• HEENT
• Cardiovascular
• Respiratory
• Abdominal
• Musculoskeletal
• Neurological
• Integumentary
• Genitourinary
• Endocrine
• Lymphatic
• Psychiatric
• Breast
• Peripheral vascular

Laboratory & Imaging
• Relevant labs
• Relevant imaging

Relevance + EMR Accuracy
• Only score findings actually provided in EMR.

Scoring Rule
• Each metric = 0 or 1.

---------------------------------------
ASSESSMENT (0 or 1 each)
---------------------------------------
General Principles
• Must match EMR + case context.
• Irrelevant or nonsensical → 0 + feedback.

Sign-Posting
• Not scored.

Working Diagnosis
• Clear statement
• EMR-aligned
• Justified using case data

Pertinent Findings
• Pertinent positive
• Pertinent negative

Dangerous Differential
• Dangerous differential listed
• Pertinent positive/negative supporting it

Additional Differentials
• Optional; not scored.

Relevance + EMR Accuracy
• Must be clinically plausible.

Scoring Rule
• Each metric = 0 or 1.

---------------------------------------
PLAN (0 or 1 each)
---------------------------------------
General Principles
• Must align with EMR + working diagnosis.
• Unsafe or contraindicated → 0.

Sign-Posting
• Not scored.

Symptomatic Relief
• Score only if relevant.

Investigations
• Appropriate investigation
• Clear rationale
• Only score if indicated.

Interventions & Treatment
• Appropriate, safe, relevant.

Safety Check
• Must consider vitals, allergies, meds, comorbidities, labs.

Disposition
• Must match case.

Contingency Plan
• Score only if relevant.

Patient Education
• Score only if relevant.

Relevance + EMR Accuracy
• Must match EMR.

Scoring Rule
• Each metric = 0 or 1.
        `
      },
      { role: "user", content: userInput }
    ]
  });

  // STREAM BACK TO FRONTEND IN REAL-TIME
  for await (const chunk of stream) {
    if (chunk?.choices?.length > 0) {
      const delta = chunk.choices[0].delta?.content;
      if (delta) yield delta;
    }
  }
}
