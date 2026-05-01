const STORAGE_PREFIX = 'ictMcqMultiV1';

const state = {
  chapters: [],
  allMcqs: [],
  mcqs: [],
  mode: 'practice',
  activeChapter: 'all',
  examQuestions: [],
  examSubmitted: false,
  examStartedAt: null,
  answers: JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}:practiceAnswers`) || '{}'),
  examAnswers: {},
  bookmarks: JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}:bookmarks`) || '[]'),
  explanations: JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}:explanations`) || '{}'),
  filters: { search: '', topic: 'all', status: 'all' },
  activeQuestion: null
};

const $ = (id) => document.getElementById(id);
const list = $('mcqList');

function saveProgress() {
  localStorage.setItem(`${STORAGE_PREFIX}:practiceAnswers`, JSON.stringify(state.answers));
  localStorage.setItem(`${STORAGE_PREFIX}:bookmarks`, JSON.stringify(state.bookmarks));
  localStorage.setItem(`${STORAGE_PREFIX}:explanations`, JSON.stringify(state.explanations));
}

function escapeHtml(text = '') {
  return String(text).replace(/[&<>'"]/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[ch]));
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getChapter(id) {
  return state.chapters.find(c => c.id === id);
}

function isExamEligible(q) {
  return q.correctLetter && Array.isArray(q.options) && q.options.length >= 2;
}

function getOptionText(q, letter) {
  const found = (q.options || []).find(o => o.label === letter);
  return found ? found.text : 'উৎস ফাইলে অস্পষ্ট';
}

function isBookmarked(id) {
  return state.bookmarks.includes(String(id));
}

function setHeroForPractice() {
  state.mode = 'practice';
  $('modeLabel').textContent = 'Chapter Practice Mode';
  const chapter = state.activeChapter === 'all' ? null : getChapter(state.activeChapter);
  $('pageTitle').textContent = chapter ? chapter.title : 'সব অধ্যায়ের Practice';
  $('pageSubtitle').textContent = chapter
    ? `${chapter.subtitle || ''} — প্রতিটি MCQ practice করতে পারবেন এবং Explain button ব্যবহার করতে পারবেন।`
    : 'সব অধ্যায় একসাথে practice করুন, অথবা নির্দিষ্ট chapter নির্বাচন করুন।';
  $('scoreLabel').textContent = 'Practice Score';
}

function updateScore() {
  if (state.mode === 'exam') {
    const total = state.examQuestions.length;
    const answered = Object.keys(state.examAnswers).length;
    if (!state.examSubmitted) {
      $('scoreText').textContent = `${answered} / ${total}`;
      $('progressText').textContent = 'Answered in exam';
    } else {
      const correct = state.examQuestions.filter(q => state.examAnswers[q.id] === q.correctLetter).length;
      $('scoreText').textContent = `${correct} / ${total}`;
      $('progressText').textContent = `${Math.round((correct / Math.max(total, 1)) * 100)}% final score`;
    }
    $('totalPill').textContent = `${state.allMcqs.length} MCQs`;
    return;
  }

  const scope = filteredByChapter();
  const answered = scope.filter(q => state.answers[q.id]).length;
  const correct = scope.filter(q => state.answers[q.id] && state.answers[q.id] === q.correctLetter).length;
  $('scoreText').textContent = `${correct} / ${answered}`;
  $('progressText').textContent = answered ? `${answered} answered from ${scope.length}` : 'No answers yet';
  $('totalPill').textContent = `${state.allMcqs.length} MCQs`;
}

function buildChapterCards() {
  $('chapterGrid').innerHTML = state.chapters.map(ch => `
    <button class="chapter-card ${state.activeChapter === ch.id ? 'active' : ''}" type="button" data-chapter="${escapeHtml(ch.id)}">
      <span class="tag">${escapeHtml(ch.shortTitle || ch.title)}</span>
      <h3>${escapeHtml(ch.title)}</h3>
      <p>${escapeHtml(ch.subtitle || '')}</p>
      <div class="chapter-stats">
        <span class="tag">${ch.count || 0} Practice MCQ</span>
        <span class="tag">${ch.examEligible || 0} Exam Ready</span>
      </div>
    </button>
  `).join('');
}

function buildFilters() {
  $('chapterFilter').insertAdjacentHTML(
    'beforeend',
    state.chapters.map(ch => `<option value="${escapeHtml(ch.id)}">${escapeHtml(ch.shortTitle || ch.title)}</option>`).join('')
  );

  const topics = [...new Set(state.allMcqs.map(q => q.topic).filter(Boolean))];
  $('topicFilter').insertAdjacentHTML(
    'beforeend',
    topics.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('')
  );
}

function filteredByChapter() {
  return state.allMcqs.filter(q => state.activeChapter === 'all' || q.chapterId === state.activeChapter);
}

function filteredMcqs() {
  const s = state.filters.search.trim().toLowerCase();
  return filteredByChapter().filter(q => {
    const selected = state.answers[q.id];
    const isCorrect = selected && selected === q.correctLetter;
    const haystack = [
      q.question,
      q.stimulus,
      q.topic,
      q.section,
      q.chapterTitle,
      q.answerRaw,
      ...(q.options || []).map(o => o.text)
    ].join(' ').toLowerCase();

    const matchSearch = !s || haystack.includes(s);
    const matchTopic = state.filters.topic === 'all' || q.topic === state.filters.topic;
    let matchStatus = true;

    if (state.filters.status === 'unanswered') matchStatus = !selected;
    if (state.filters.status === 'correct') matchStatus = Boolean(isCorrect);
    if (state.filters.status === 'wrong') matchStatus = Boolean(selected && !isCorrect);
    if (state.filters.status === 'review') matchStatus = q.needsReview;
    if (state.filters.status === 'bookmarked') matchStatus = isBookmarked(q.id);

    return matchSearch && matchTopic && matchStatus;
  });
}

function renderPracticeCard(q) {
  const selected = state.answers[q.id];
  const answered = Boolean(selected);
  const correctText = getOptionText(q, q.correctLetter);
  const canAnswer = Array.isArray(q.options) && q.options.length > 0 && q.correctLetter;

  const optionsHtml = (q.options || []).map(opt => {
    let cls = 'option';
    if (answered && opt.label === q.correctLetter) cls += ' correct';
    if (answered && opt.label === selected && selected !== q.correctLetter) cls += ' wrong';

    return `
      <label class="${cls}">
        <input type="radio" name="q-${q.id}" value="${escapeHtml(opt.label)}" ${selected === opt.label ? 'checked' : ''} ${answered ? 'disabled' : ''} />
        <span class="letter">${escapeHtml(opt.label)}</span>
        <span>${escapeHtml(opt.text)}</span>
      </label>`;
  }).join('');

  const review = q.needsReview ? `<span class="tag review">Need review</span>` : '';
  const reviewNotes = q.needsReview
    ? `<div class="review-note">⚠ উৎস ফাইল থেকে এই প্রশ্ন/উত্তরটি একবার যাচাই করা ভালো। ${escapeHtml((q.reviewNotes || []).join(' '))}</div>`
    : '';

  const feedback = answered
    ? `<div class="feedback ${selected === q.correctLetter ? 'good' : 'bad'}">
        ${selected === q.correctLetter ? '✅ Correct!' : '❌ Wrong.'}
        সঠিক উত্তর: <strong>${escapeHtml(q.correctLetter || '?')}) ${escapeHtml(correctText)}</strong>
      </div>`
    : '';

  const noOptions = !q.options || !q.options.length
    ? `<div class="review-note">এই প্রশ্নের অপশন PDF extraction থেকে পরিষ্কারভাবে পাওয়া যায়নি। পরে manual review করে ঠিক করুন।</div>`
    : '';

  return `
    <article class="mcq-card" data-id="${escapeHtml(q.id)}">
      <div class="question-meta">
        <span class="tag">#${escapeHtml(q.id)}</span>
        <span class="tag">${escapeHtml(q.chapterTitle || '')}</span>
        <span class="tag">${escapeHtml(q.topic || '')}</span>
        ${review}
      </div>
      ${q.stimulus ? `<div class="stimulus">${escapeHtml(q.stimulus)}</div>` : ''}
      <h2 class="question-title">${escapeHtml(q.question)}</h2>
      <div class="options">${optionsHtml}</div>
      ${noOptions}
      <div class="question-actions">
        <div class="left-actions">
          <button class="btn check-btn" type="button" ${answered || !canAnswer ? 'disabled' : ''}>Check Answer</button>
          <button class="btn ghost reveal-btn" type="button" ${!canAnswer ? 'disabled' : ''}>Show Answer</button>
        </div>
        <div class="right-actions">
          <button class="btn ghost bookmark-btn ${isBookmarked(q.id) ? 'bookmarked' : ''}" type="button">${isBookmarked(q.id) ? '★ Bookmarked' : '☆ Bookmark'}</button>
          <button class="btn explain explain-btn" type="button">Explain</button>
        </div>
      </div>
      ${feedback}
      ${reviewNotes}
    </article>`;
}

function renderExamCard(q, index) {
  const selected = state.examAnswers[q.id];
  const submitted = state.examSubmitted;
  const correctText = getOptionText(q, q.correctLetter);

  const optionsHtml = (q.options || []).map(opt => {
    let cls = 'option';
    if (submitted && opt.label === q.correctLetter) cls += ' correct';
    if (submitted && selected === opt.label && selected !== q.correctLetter) cls += ' wrong';

    return `
      <label class="${cls}">
        <input type="radio" name="exam-${q.id}" value="${escapeHtml(opt.label)}" ${selected === opt.label ? 'checked' : ''} ${submitted ? 'disabled' : ''} />
        <span class="letter">${escapeHtml(opt.label)}</span>
        <span>${escapeHtml(opt.text)}</span>
      </label>`;
  }).join('');

  const feedback = submitted
    ? `<div class="feedback ${selected === q.correctLetter ? 'good' : 'bad'}">
        ${selected === q.correctLetter ? '✅ Correct' : selected ? '❌ Wrong' : '⚠ Not answered'}
        — সঠিক উত্তর: <strong>${escapeHtml(q.correctLetter)}) ${escapeHtml(correctText)}</strong>
      </div>`
    : '';

  const explainBtn = submitted
    ? `<button class="btn explain explain-btn" type="button">Explain</button>`
    : '';

  return `
    <article class="mcq-card exam-card" data-id="${escapeHtml(q.id)}">
      <div class="question-meta">
        <span class="tag">Exam ${index + 1}</span>
        <span class="tag">${escapeHtml(q.chapterTitle || '')}</span>
        <span class="tag">Original: ${escapeHtml(q.id)}</span>
      </div>
      ${q.stimulus ? `<div class="stimulus">${escapeHtml(q.stimulus)}</div>` : ''}
      <h2 class="question-title">${escapeHtml(q.question)}</h2>
      <div class="options">${optionsHtml}</div>
      <div class="question-actions">
        <div class="left-actions">${submitted ? '<span class="tag gold">Answer revealed after submission</span>' : '<span class="tag">Answer hidden until submit</span>'}</div>
        <div class="right-actions">${explainBtn}</div>
      </div>
      ${feedback}
    </article>`;
}

function render() {
  buildChapterCards();
  updateScore();

  if (state.mode === 'exam') {
    $('practiceControls').hidden = true;
    $('examIntro').hidden = true;
    $('examToolbar').hidden = false;

    if (!state.examQuestions.length) {
      list.innerHTML = `<div class="card empty">No exam started yet.</div>`;
      return;
    }

    list.innerHTML = state.examQuestions.map(renderExamCard).join('');
    updateExamResult();
    return;
  }

  setHeroForPractice();
  $('practiceControls').hidden = false;
  $('examIntro').hidden = false;
  $('examToolbar').hidden = true;
  $('examResult').hidden = true;

  const data = filteredMcqs();

  if (!data.length) {
    list.innerHTML = `<div class="card empty">No MCQs found for this filter.</div>`;
    return;
  }

  list.innerHTML = data.map(renderPracticeCard).join('');
}

function updateExamResult() {
  if (!state.examSubmitted) {
    $('examResult').hidden = true;
    return;
  }

  const total = state.examQuestions.length;
  const answered = Object.keys(state.examAnswers).length;
  const correct = state.examQuestions.filter(q => state.examAnswers[q.id] === q.correctLetter).length;
  const percent = Math.round((correct / Math.max(total, 1)) * 100);

  const byChapter = state.chapters.map(ch => {
    const qs = state.examQuestions.filter(q => q.chapterId === ch.id);
    if (!qs.length) return '';
    const chCorrect = qs.filter(q => state.examAnswers[q.id] === q.correctLetter).length;
    return `<span class="tag">${escapeHtml(ch.shortTitle || ch.title)}: ${chCorrect}/${qs.length}</span>`;
  }).join('');

  $('examResult').hidden = false;
  $('examResult').innerHTML = `
    <div>
      <span class="tag gold">Exam Result</span>
      <h2>Your Score: <strong>${correct} / ${total}</strong> (${percent}%)</h2>
      <p>Answered: ${answered}/${total}. Correct answers are now visible under every MCQ.</p>
      <div class="chapter-stats" style="margin-top:14px">${byChapter}</div>
    </div>
  `;
}

function sampleBalancedExam() {
  const eligible = state.allMcqs.filter(isExamEligible);
  const chapterIds = state.chapters.map(c => c.id);
  const target = Math.min(100, eligible.length);
  const per = Math.floor(target / chapterIds.length);
  let remainder = target % chapterIds.length;
  let selected = [];

  for (const id of chapterIds) {
    const pool = eligible.filter(q => q.chapterId === id);
    const take = Math.min(pool.length, per + (remainder > 0 ? 1 : 0));
    remainder = Math.max(0, remainder - 1);
    selected = selected.concat(shuffle(pool).slice(0, take));
  }

  if (selected.length < target) {
    const used = new Set(selected.map(q => q.id));
    const rest = shuffle(eligible.filter(q => !used.has(q.id)));
    selected = selected.concat(rest.slice(0, target - selected.length));
  }

  return shuffle(selected).slice(0, target);
}

function startExam() {
  if (state.mode === 'exam' && !state.examSubmitted && Object.keys(state.examAnswers).length) {
    if (!confirm('Current exam progress will be lost. Start a new random exam?')) return;
  }

  state.mode = 'exam';
  state.examQuestions = sampleBalancedExam();
  state.examAnswers = {};
  state.examSubmitted = false;
  state.examStartedAt = Date.now();

  $('modeLabel').textContent = '100 MCQ Mixed Exam';
  $('pageTitle').textContent = 'Mixed Random Exam';
  $('pageSubtitle').textContent = 'Answer first. Correct answers and Explain button will unlock after final submission.';
  $('scoreLabel').textContent = 'Exam Progress';
  $('examInfo').textContent = `${state.examQuestions.length} questions selected randomly from all chapters. Answers are hidden until submit.`;

  window.scrollTo({ top: 0, behavior: 'smooth' });
  render();
}

function submitExam() {
  if (state.mode !== 'exam') return;
  const unanswered = state.examQuestions.length - Object.keys(state.examAnswers).length;
  if (unanswered > 0 && !confirm(`${unanswered} questions are unanswered. Submit anyway?`)) return;

  state.examSubmitted = true;
  $('scoreLabel').textContent = 'Final Score';
  render();
  $('examResult').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function openDialog() {
  if (!$('explainDialog').open) $('explainDialog').showModal();
}

function hideFollowup() {
  $('followupBox').hidden = true;
  $('followupInput').value = '';
  $('followupHistory').innerHTML = '';
}

function showPlainDialog(title, content) {
  $('dialogTitle').textContent = title;
  $('explainContent').innerHTML = `<div class="answer-block">${escapeHtml(content)}</div>`;
  hideFollowup();
  openDialog();
}

function showLoadingDialog(q) {
  state.activeQuestion = q;
  $('dialogTitle').textContent = 'Explanation ✨';
  $('explainContent').innerHTML = `
    <div class="cool-loader">
      <div class="loader-orb" aria-hidden="true"></div>
      <h3>Preparing a clear explanation<span class="loading-dots"></span></h3>
      <p>AI teacher is checking the MCQ and making it easy for students.</p>
    </div>`;
  hideFollowup();
  openDialog();
}

function showExplanationDialog(q, text) {
  state.activeQuestion = q;
  $('dialogTitle').textContent = `Explanation for ${q.id} ✨`;
  $('explainContent').innerHTML = `<div class="answer-block">${escapeHtml(text)}</div>`;
  $('followupBox').hidden = false;
  $('followupInput').value = '';
  $('followupHistory').innerHTML = '';
  openDialog();
  setTimeout(() => $('followupInput').focus(), 80);
}

function makePrompt(q) {
  const options = (q.options || []).map(o => `${o.label}) ${o.text}`).join('\n');
  return `তুমি একজন ধৈর্যশীল ICT শিক্ষক। নিচের MCQ টি বাংলা ভাষায় সহজভাবে ব্যাখ্যা কর।

নিয়ম:
- ৫ থেকে ৮ লাইনের মধ্যে রাখো।
- প্রথমে সঠিক উত্তর বলো।
- তারপর কেন উত্তরটি সঠিক, ধাপে ধাপে বোঝাও।
- ভুল অপশনগুলো কেন ঠিক নয়, খুব সংক্ষেপে বলো।
- যদি প্রশ্ন/উত্তরে অস্পষ্টতা থাকে, শিক্ষকের কাছে যাচাই করতে বলো।

Chapter:
${q.chapterTitle || 'N/A'}

Context:
${q.stimulus || 'N/A'}

Question:
${q.question}

Options:
${options || 'N/A'}

Correct answer from teacher file:
${q.correctLetter ? `${q.correctLetter}) ${getOptionText(q, q.correctLetter)}` : 'Need manual review'}
`;
}

async function callExplainApi(prompt, questionId) {
  const res = await fetch(window.EXPLAIN_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, questionId })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const details = data.details || data.geminiError || data.cloudflareAIError || '';
    throw new Error(data.error ? `${data.error}${details ? ` — ${details}` : ''}` : `Request failed: ${res.status}`);
  }
  return data.explanation || 'No explanation returned.';
}

async function explain(q) {
  if (state.explanations[q.id]) {
    showExplanationDialog(q, state.explanations[q.id]);
    return;
  }

  if (!window.EXPLAIN_API_URL) {
    showPlainDialog(
      'Explanation setup needed',
      'Explain API এখনো সেট করা হয়নি। config.js ফাইলে Cloudflare Worker URL বসান। API key কখনো static site-এ রাখবেন না।'
    );
    return;
  }

  showLoadingDialog(q);

  try {
    const text = await callExplainApi(makePrompt(q), q.id);
    state.explanations[q.id] = text;
    saveProgress();
    showExplanationDialog(q, text);
  } catch (err) {
    showPlainDialog('Explanation failed', `Reason: ${err.message}\n\nCheck Worker URL, CORS origin, Gemini API key, and Workers AI binding.`);
  }
}

async function askFollowup() {
  const q = state.activeQuestion;
  const studentQuestion = $('followupInput').value.trim();
  if (!q || !studentQuestion) return;

  if (!window.EXPLAIN_API_URL) {
    showPlainDialog('Explanation setup needed', 'Explain API URL is missing in config.js.');
    return;
  }

  const btn = $('askFollowupBtn');
  const history = $('followupHistory');
  const previousExplanation = state.explanations[q.id] || $('explainContent').innerText || '';

  history.insertAdjacentHTML(
    'beforeend',
    `<div class="followup-item student"><strong>Student asked:</strong>\n${escapeHtml(studentQuestion)}</div>`
  );

  const loadingId = `followup-loading-${Date.now()}`;
  history.insertAdjacentHTML(
    'beforeend',
    `<div id="${loadingId}" class="followup-item loading">Thinking<span class="loading-dots"></span></div>`
  );

  btn.disabled = true;
  btn.textContent = 'Asking...';

  try {
    const followupPrompt = `তুমি একজন ধৈর্যশীল ICT শিক্ষক। একজন শিক্ষার্থী MCQ ব্যাখ্যার পরেও একটি follow-up প্রশ্ন করেছে।

মূল MCQ তথ্য:
${makePrompt(q)}

আগের ব্যাখ্যা:
${previousExplanation}

শিক্ষার্থীর প্রশ্ন:
${studentQuestion}

এখন শিক্ষার্থীর follow-up প্রশ্নের উত্তর সহজ বাংলায় দাও। খুব বড় করবে না। প্রয়োজন হলে ছোট উদাহরণ দাও।`;

    const answer = await callExplainApi(followupPrompt, q.id);
    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) {
      loadingEl.outerHTML = `<div class="followup-item ai"><strong>AI replied:</strong>\n${escapeHtml(answer)}</div>`;
    }
    $('followupInput').value = '';
  } catch (err) {
    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) {
      loadingEl.outerHTML = `<div class="followup-item ai"><strong>Failed:</strong> ${escapeHtml(err.message)}</div>`;
    }
  } finally {
    btn.disabled = false;
    btn.textContent = 'Ask Explanation';
  }
}

list.addEventListener('click', (e) => {
  const card = e.target.closest('.mcq-card');
  if (!card) return;

  const pool = state.mode === 'exam' ? state.examQuestions : state.allMcqs;
  const q = pool.find(item => String(item.id) === card.dataset.id);
  if (!q) return;

  if (e.target.matches('input[type="radio"]')) {
    if (state.mode === 'exam' && !state.examSubmitted) {
      state.examAnswers[q.id] = e.target.value;
      updateScore();
      return;
    }
  }

  if (e.target.closest('.check-btn')) {
    const chosen = card.querySelector('input[type="radio"]:checked');
    if (!chosen) {
      const old = card.querySelector('.feedback');
      if (old) old.remove();
      card.insertAdjacentHTML('beforeend', '<div class="feedback bad">একটি অপশন নির্বাচন করুন।</div>');
      return;
    }

    state.answers[q.id] = chosen.value;
    saveProgress();
    render();
  }

  if (e.target.closest('.reveal-btn')) {
    state.answers[q.id] = q.correctLetter || 'unknown';
    saveProgress();
    render();
  }

  if (e.target.closest('.bookmark-btn')) {
    const id = String(q.id);
    state.bookmarks = isBookmarked(id)
      ? state.bookmarks.filter(x => x !== id)
      : [...state.bookmarks, id];
    saveProgress();
    render();
  }

  if (e.target.closest('.explain-btn')) {
    explain(q);
  }
});

$('chapterGrid').addEventListener('click', (e) => {
  const card = e.target.closest('.chapter-card');
  if (!card) return;
  state.activeChapter = card.dataset.chapter;
  $('chapterFilter').value = state.activeChapter;
  state.mode = 'practice';
  render();
  $('practiceControls').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

$('homeBtn').addEventListener('click', () => {
  state.mode = 'practice';
  state.activeChapter = 'all';
  $('chapterFilter').value = 'all';
  $('searchInput').value = '';
  $('topicFilter').value = 'all';
  $('statusFilter').value = 'all';
  state.filters = { search: '', topic: 'all', status: 'all' };
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

$('searchInput').addEventListener('input', (e) => {
  state.filters.search = e.target.value;
  render();
});

$('chapterFilter').addEventListener('change', (e) => {
  state.activeChapter = e.target.value;
  state.mode = 'practice';
  render();
});

$('topicFilter').addEventListener('change', (e) => {
  state.filters.topic = e.target.value;
  render();
});

$('statusFilter').addEventListener('change', (e) => {
  state.filters.status = e.target.value;
  render();
});

$('resetBtn').addEventListener('click', () => {
  if (!confirm('Reset all saved practice answers, bookmarks, and explanations?')) return;
  state.answers = {};
  state.bookmarks = [];
  state.explanations = {};
  saveProgress();
  render();
});

$('startExamBtn').addEventListener('click', startExam);
$('startExamBtnTop').addEventListener('click', startExam);
$('newExamBtn').addEventListener('click', startExam);
$('submitExamBtn').addEventListener('click', submitExam);

$('closeDialog').addEventListener('click', () => $('explainDialog').close());
$('askFollowupBtn').addEventListener('click', askFollowup);
$('followupInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) askFollowup();
});

async function init() {
  const res = await fetch('data/mcqs.json');
  const data = await res.json();

  state.chapters = data.chapters || [];
  state.allMcqs = data.mcqs || [];
  state.mcqs = state.allMcqs;

  buildFilters();
  render();
}

init().catch(err => {
  list.innerHTML = `<div class="card empty">Failed to load MCQ data: ${escapeHtml(err.message)}</div>`;
});
