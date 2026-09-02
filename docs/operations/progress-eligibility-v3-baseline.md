# Progress Eligibility V3 Baseline

Production baseline captured on 2026-09-02 at commit
`d6f794a2b226c4d9aa493210e5df07364b29933a` (`v0.26.0`).

The snapshot contains aggregate values only. It does not include names, email
addresses, document numbers, or user identifiers.

| Metric | Baseline |
| --- | ---: |
| Authenticated users | 251 |
| Profiles | 251 |
| Enrollments | 287 |
| Active or completed enrollments | 287 |
| Course progress histories | 283 |
| Protected progress floors | 285 |
| Learning sessions | 863 |
| Verified assessment attempts | 334 |
| Answered assessment questions | 1,837 |
| Unique correct-question achievements | 1,179 |
| Completed chapter-practice achievements | 10 |
| Courses above 10% | 6 |
| Valid certificates | 4 |
| Progress records below their floor | 0 |

## Release Invariants

Every later phase must satisfy all of these conditions:

1. Existing enrollment, progress-history, achievement, attempt, session, and
   certificate rows are not deleted or rewritten by a deployment.
2. The effective verified percentage is never lower than its protected floor.
3. Cancelling or hiding a course does not remove its learning history.
4. Repeated submissions remain idempotent and cannot erase a previous correct
   achievement.
5. New activity may increase the counters after this snapshot. Therefore,
   post-release totals must be greater than or equal to the applicable baseline,
   while `regressions_below_floor` must remain zero.

Use `tools/progress-release-integrity.sql` before and after every progress-related
production deployment. The pgTAP guard in
`supabase/tests/progress_integrity_guard_test.sql` enforces the restoration and
non-regression behavior in CI.
