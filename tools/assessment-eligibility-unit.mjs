import assert from 'node:assert/strict';
import fs from 'node:fs';

const migration = fs.readFileSync(
  new URL('../supabase/migrations/20260902224751_assessment_server_eligibility_v3.sql', import.meta.url),
  'utf8'
);

assert.match(migration, /create or replace function private\.assessment_eligibility_decision/i,
  'A single server decision must own the eligibility rule.');
assert.match(migration, /v_activity_type in \('practice', 'simulator'\)[\s\S]*v_eligible := true/i,
  'Practice and simulator must remain available to enrolled users.');
assert.match(migration, /v_completed < v_chapter_count[\s\S]*complete_all_chapters/i,
  'The final exam must require every chapter practice.');
assert.match(migration, /v_progress < 95[\s\S]*verified_progress_required/i,
  'The final exam must require 95 percent verified progress.');
assert.match(migration, /before insert or update of status on private\.verified_assessment_attempts/i,
  'Eligibility must be enforced when attempts start and complete.');
assert.match(migration, /final_exam_eligible[\s\S]*v_final_exam->'eligible'/i,
  'The authoritative dashboard must publish the server decision.');
assert.match(migration, /revoke all on function public\.get_my_assessment_eligibility\(text, text\)[\s\S]*grant execute[\s\S]*to authenticated/i,
  'Only authenticated users may call the public eligibility endpoint.');
assert.doesNotMatch(migration, /delete\s+from\s+(public\.course_progress|public\.course_enrollments|private\.practice_question_achievements)/i,
  'The eligibility migration must not delete learning history.');
assert.doesNotMatch(migration, /update\s+(public\.course_progress|private\.verified_progress_checkpoints)/i,
  'The eligibility migration must not rewrite progress or its protected floor.');

console.log('Assessment eligibility unit OK: server rule, permissions and non-destructive migration.');
