# ICT Practice — refined UI / UX

A lightweight Bengali ICT practice site. Static HTML, CSS and JavaScript; no build tools or database required.

## Run on Windows

1. Extract the ZIP completely.
2. Install Python 3 if it is not already installed.
3. Double-click `START.bat`. Keep its window open while practicing.

Alternatively use VS Code Live Server, or run `python serve.py` in this folder. Opening `index.html` by double-clicking can block the JSON request; use a local server.

## Deploy

Upload `index.html`, `styles.css`, `script.js`, `config.js`, `data/` and `assets/fonts/` to the existing GitHub Pages / static hosting directory. Relative asset paths work in repository subdirectories. No npm installation is needed. The existing explanation endpoint is retained in `config.js`; its CORS policy must allow your hosting origin. API keys belong only in Worker secrets.

## What's changed

- Compact dashboard, chapter cards, progress and saved-question counts.
- Desktop sidebar and fixed mobile navigation.
- One question at a time, a numbered question navigator and larger-text option.
- Search, chapter/topic/status filters, saved questions and retry controls.
- Clear correct/wrong feedback with text and symbols in addition to color.
- Showing an answer no longer records a correct attempt.
- 20/50/100-question mixed exams, saved answers, resume after reload, submission confirmation and result filters.
- Explanation dialog with follow-up questions, connection errors, timeout and retry. Closing a request prevents it from reopening the dialog later.
- Self-hosted Noto Sans Bengali variable font, Unicode normalization, readable spacing and a properly rendered truth table. Font license is included.
- Defensive storage handling and a useful loading-error screen.

## Question data: read before using for formal assessment

All **277 original question IDs** and all original answer-key letters have been preserved. Recoverable Bengali words and passages were edited individually. Nine passages merged into preceding options were relocated to their associated question pairs. `data/text-corrections-audit.json` records before/after changes for every affected record.

**159 questions** remain in normal practice and exams. **118 questions** are retained in the `যাচাই প্রয়োজন` filter: missing options or context, unclear wording, duplicated alternatives, or questionable original keys. They cannot be scored, used in an exam or sent to the explanation service. This does not claim the remaining answer keys have been independently verified against a textbook.

The original PDF/DOCX source documents were not included in the uploaded archive. Unrecoverable material and uncertain keys were not fabricated. Supply/consult those originals to resolve the review list and then set `needsReview` to `false` only after checking the complete question, options and answer.

Local question edits must retain stable IDs. Existing saved questions and usable practice answers are imported from the original browser keys. New practice answers use a separate V2 key, preserving the original data. Historical answers cannot distinguish genuine attempts from the original site's Show Answer action, which counted as correct; use Settings → reset practice if you want a fresh score. The new Show Answer action never adds to the score.

Progress remains specific to the browser and hosting origin. An export, cross-device account sync or automatic backup is not included. Exam answers are hidden in the interface until submission; like the original project, this is a client-side study tool rather than a secure exam platform.

`README_original.md` and `assets/screenshots/` describe the previous design.
