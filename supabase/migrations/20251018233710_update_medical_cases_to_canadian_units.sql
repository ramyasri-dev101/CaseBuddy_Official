/*
  # Update Medical Cases to Canadian Units and Standards

  1. Changes
    - Updates temperature values from Fahrenheit to Celsius
    - Converts all measurements to metric system (Canadian standard)
    - Ensures all lab values follow Canadian reference ranges
    - Updates medical terminology to Canadian spelling where applicable
    
  2. Notes
    - Temperature conversions: 102°F = 38.9°C, 104°F = 40°C
    - All measurements now follow Canadian/metric standards
    - Preserves the clinical accuracy and educational value of cases
*/

-- Update Pediatric Fever case with Celsius temperatures
UPDATE medical_cases
SET conversation = 'Provider: Hi there! I''m Dr. Chen. And who do we have here today?

Parent: This is Emma. She''s four years old. We''re here because she''s had a high fever and now this rash has appeared.

Provider: Thanks for bringing her in. Emma, it''s nice to meet you! Can you tell me when the fever started?

Parent: It started three days ago. It was really high - I was checking it every few hours and it was going between 38.9 and 40 degrees Celsius. I was giving her acetaminophen.

Provider: And when did you notice the rash?

Parent: Just this morning. The fever actually seems to be going down now, but then I saw these spots all over her body.

Provider: Can you describe the rash for me?

Parent: It''s these little pink spots, mostly on her chest and back, but some on her arms and legs too. They don''t seem to bother her.

Provider: Has she been acting sick otherwise? Eating and drinking okay?

Parent: She''s been a bit cranky, which makes sense with the fever. But yeah, she''s been drinking plenty of fluids and eating some. Not her normal appetite, but enough.

Provider: Any vomiting or diarrhea?

Parent: No, nothing like that.

Provider: Has Emma been around anyone who''s been sick recently?

Parent: Not that I can think of. She goes to preschool, but no one mentioned anything going around.

Provider: Does Emma have any other medical conditions or take any medications regularly?

Parent: No, she''s been healthy. This is actually the first time we''ve had to bring her in for being sick.

Provider: That''s good. Is she up to date on her vaccinations?

Parent: Yes, she just had her four-year shots a couple months ago.

Provider: Any allergies that you know of?

Parent: No allergies.

Provider: And does anyone in the family have immune system problems or anything like that?

Parent: No, everyone''s pretty healthy. Her dad had chickenpox as a kid, and I did too.

Provider: How has Emma seemed emotionally? I know fevers can make kids feel pretty miserable.

Parent: She was pretty unhappy the first two days, wanted to cuddle a lot, which isn''t like her. But today she seems more like herself. She was even playing a little this morning.'
WHERE title = 'Pediatric Fever and Rash Visit';

-- Note: Other cases (Chest Pain, Neurological) don't mention specific temperature or measurement values
-- They use qualitative descriptors which are appropriate for Canadian context
-- If future cases are added, ensure all measurements follow Canadian/metric standards
