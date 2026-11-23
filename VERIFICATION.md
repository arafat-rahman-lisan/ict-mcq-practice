# Verification

Checked on 23 November 2026.

- JavaScript syntax check passed.
- 277 unique original question IDs retained; original answer letters unchanged.
- Unicode normalization and bundled Bengali-font glyph coverage checked.
- 60 randomized test generations checked across 20/50/100-question sizes: unique IDs, balanced chapter selection, no review-only questions.
- Scoring checks: revealed answers do not count as attempts; correct answers do.
- Search, review filtering, malformed stored JSON and explanation success/rate-limit/empty-response handling checked programmatically.
- Browser: desktop dashboard and practice; 390px/360px iframe viewports render mobile navigation without horizontal overflow.
- Browser: practice answer checking, bookmarks, answer reveal, exam selection, hidden answers before submission, reload/resume at the saved question, incomplete submission confirmation, results and locked answers after submission checked.
- Browser: database text and unscored review view checked.
- The existing external AI endpoint could not be reached from the preview origin. Its user-facing connection-error state worked. Actual AI generation and follow-up require the existing Worker to be reachable and allow the deployed origin; backend configuration was not changed. API response paths were tested with mocks.
- Source question documents were unavailable. This release repairs text and isolates ambiguity; it is not a complete factual verification of the question bank.

Run `node tests/check.cjs` to repeat the automated checks. Local launch requires Python 3; no additional packages are needed. The Windows launcher itself was not executed on Windows in this Linux environment.
