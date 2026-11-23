# UI/UX Redesign Verification · 23 November 2026

## Updated
- Replaced the busy dashboard with a short primary action, one compact progress summary, and three distinctly color-coded chapter cards.
- Collapsed optional question-index grid; kept one-question-at-a-time workflow, previous/next navigation and saved progress.
- Collapsed filters by default on mobile to show the current question sooner.
- Made the AI entry point visible **before** answering, via the question header and global AI button.
- Pre-answer AI requests send only the MCQ and ask for a **hint** (no answer key). Post-answer requests include the key for a full explanation. Both offer follow-up questions.
- Maintained 20/50/100 question exam modes. AI is intentionally unavailable during an active exam and becomes available after submission.
- Simplified AI modal and safely formatted bold/list Markdown in generated explanations.
- Kept existing frontend API URL, original question data, storage keys and Cloudflare backend routing unchanged.

## Checked
- `node --check script.js` passed.
- `node tests/check.cjs` passed for 277 original IDs, unchanged answer-key letters, exclusion of flagged MCQs, balanced exam sampling, score behaviour, search and API error responses.
- Chromium browser preview using the **real included MCQ JSON** and mocked fetch responses passed for: dashboard, chapter selection, pre-answer hints without supplying answer keys, hint follow-up, post-answer full explanation, exam start/submission/review.
- Browser previews at 1440px, 768px, 390px and 360px had no horizontal overflow.
- No live request was made to the deployed Cloudflare Worker or Gemini; verify the external Worker from your deployed GitHub Pages origin separately. Mocked AI answers test the client workflow, not model accuracy.

## Existing dataset limitations
The question texts were not re-authored or fact-checked in this UI revision. Original review flags remain: 118 of 277 need source checks and are not scored/tested; 159 are usable. This design does not claim textbook verification of the remaining keys.

## v4 bilingual and theme enhancement

- Added persistent EN / BN interface language switch and saved dark/light appearance.
- English question content translates on demand using the existing Worker; original answer letters remain unchanged. Translation responses are cached in the browser and never supplied with the answer key. Unavailable translations fall back explicitly to the source Bengali text.
- Gemini guidance supports English prompts in EN mode; hint and explanation caches are separated by language.
- Added a version-pinned Three.js decorative particle scene in the hero, capped at ~30 FPS, with mobile and reduced-motion safeguards.
- New styling supports glass/translucency and contrast-aware dark mode without modifying MCQ data.
- Browser smoke checks: desktop (1440px), mobile (390px / 360px), language toggle, theme toggle, translation success with mock endpoint, return to Bangla, pre-answer hint, English exam mode and no AI answer before submission. API runtime and actual Third-party model output are not guaranteed by local mock tests.
