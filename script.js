const state = {
  mcqs: [],
  answers: JSON.parse(localStorage.getItem('mcqAnswers') || '{}'),
  bookmarks: JSON.parse(localStorage.getItem('mcqBookmarks') || '[]'),
  explanations: JSON.parse(localStorage.getItem('mcqExplanations') || '{}'),
  filters: { search: '', topic: 'all', status: 'all' }
};

const $ = (id) => document.getElementById(id);
const list = $('mcqList');

function saveProgress() {
  localStorage.setItem('mcqAnswers', JSON.stringify(state.answers));
  localStorage.setItem('mcqBookmarks', JSON.stringify(state.bookmarks));
  localStorage.setItem('mcqExplanations', JSON.stringify(state.explanations));
}

function escapeHtml(text = '') {
  return String(text).replace(/[&<>'"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[ch]));
}

function getOptionText(q, letter) {
  const found = q.options.find(o => o.label === letter);
  return found ? found.text : 'উৎস ফাইলে অস্পষ্ট';
}

function updateScore() {
  const answered = Object.keys(state.answers).length;
  const correct = state.mcqs.filter(q => state.answers[q.id] && state.answers[q.id] === q.correctLetter).length;
  $('scoreText').textContent = `${correct} / ${answered}`;
  $('progressText').textContent = answered ? `${answered} answered from ${state.mcqs.length}` : 'No answers yet';
  $('totalPill').textContent = `${state.mcqs.length} MCQs`;
}

function buildFilters() {
  const topics = [...new Set(state.mcqs.map(q => q.topic))];
  $('topicFilter').insertAdjacentHTML('beforeend', topics.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join(''));
}

function isBookmarked(id) {
  return state.bookmarks.includes(String(id));
}

function filteredMcqs() {
  const s = state.filters.search.trim().toLowerCase();
  return state.mcqs.filter(q => {
    const selected = state.answers[q.id];
    const isCorrect = selected && selected === q.correctLetter;
    const haystack = [q.question, q.stimulus, q.topic, q.section, q.answerRaw, ...q.options.map(o => o.text)].join(' ').toLowerCase();
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

function render() {
  updateScore();
  const data = filteredMcqs();
  if (!data.length) {
    list.innerHTML = `<div class="card empty">No MCQs found for this filter.</div>`;
    return;
  }

  list.innerHTML = data.map(q => {
    const selected = state.answers[q.id];
    const answered = Boolean(selected);
    const correctText = getOptionText(q, q.correctLetter);
    const optionsHtml = q.options.map(opt => {
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
    const reviewNotes = q.needsReview ? `<div class="review-note">⚠ উৎস ফাইল থেকে এই প্রশ্ন/উত্তরটি একবার যাচাই করা ভালো। ${escapeHtml((q.reviewNotes || []).join(' '))}</div>` : '';
    const feedback = answered ? `<div class="feedback ${selected === q.correctLetter ? 'good' : 'bad'}">
      ${selected === q.correctLetter ? '✅ Correct!' : '❌ Wrong.'} সঠিক উত্তর: <strong>${escapeHtml(q.correctLetter || '?')}) ${escapeHtml(correctText)}</strong>
    </div>` : '';

    return `
      <article class="mcq-card" data-id="${q.id}">
        <div class="question-head">
          <div>
            <div class="question-meta">
              <span class="tag">#${q.id}</span>
              <span class="tag">${escapeHtml(q.topic)}</span>
              ${review}
            </div>
            ${q.stimulus ? `<div class="stimulus">${escapeHtml(q.stimulus)}</div>` : ''}
            <h2 class="question-title">${escapeHtml(q.question)}</h2>
          </div>
        </div>
        <div class="options">${optionsHtml}</div>
        <div class="question-actions">
          <div class="left-actions">
            <button class="btn check-btn" type="button" ${answered ? 'disabled' : ''}>Check Answer</button>
            <button class="btn ghost reveal-btn" type="button">Show Answer</button>
          </div>
          <div class="right-actions">
            <button class="btn ghost bookmark-btn ${isBookmarked(q.id) ? 'bookmarked' : ''}" type="button">${isBookmarked(q.id) ? '★ Bookmarked' : '☆ Bookmark'}</button>
            <button class="btn explain explain-btn" type="button">Explain</button>
          </div>
        </div>
        ${feedback}
        ${reviewNotes}
      </article>`;
  }).join('');
}

function showDialog(content) {
  $('explainContent').textContent = content;
  $('explainDialog').showModal();
}

function makePrompt(q) {
  const options = q.options.map(o => `${o.label}) ${o.text}`).join('\n');
  return `তুমি একজন ধৈর্যশীল ICT শিক্ষক। নিচের MCQ টি বাংলা ভাষায় সহজভাবে ব্যাখ্যা কর।

নিয়ম:
- ৫ থেকে ৮ লাইনের মধ্যে রাখো।
- প্রথমে সঠিক উত্তর বলো।
- তারপর কেন উত্তরটি সঠিক, ধাপে ধাপে বোঝাও।
- ভুল অপশনগুলো কেন ঠিক নয়, খুব সংক্ষেপে বলো।
- যদি প্রশ্ন/উত্তরে অস্পষ্টতা থাকে, শিক্ষকের কাছে যাচাই করতে বলো।

Context:
${q.stimulus || 'N/A'}

Question:
${q.question}

Options:
${options}

Correct answer from teacher file:
${q.correctLetter}) ${getOptionText(q, q.correctLetter)}
`;
}

async function explain(q) {
  if (state.explanations[q.id]) {
    showDialog(state.explanations[q.id]);
    return;
  }
  if (!window.EXPLAIN_API_URL) {
    showDialog('Explain API এখনো সেট করা হয়নি।\n\n১) Cloudflare Worker deploy করুন।\n২) Worker URL কপি করুন।\n৩) github-pages-site/config.js ফাইলে EXPLAIN_API_URL এর মধ্যে বসান।\n\nAPI key কখনো এই static site-এ রাখবেন না।');
    return;
  }
  showDialog('Gemini explanation loading...');
  try {
    const res = await fetch(window.EXPLAIN_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: makePrompt(q), questionId: q.id })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
    const text = data.explanation || 'No explanation returned.';
    state.explanations[q.id] = text;
    saveProgress();
    showDialog(text);
  } catch (err) {
    showDialog(`Explanation failed.\n\nReason: ${err.message}\n\nCheck Worker URL, CORS origin, and Gemini API key.`);
  }
}

list.addEventListener('click', (e) => {
  const card = e.target.closest('.mcq-card');
  if (!card) return;
  const q = state.mcqs.find(item => String(item.id) === card.dataset.id);
  if (!q) return;

  if (e.target.closest('.check-btn')) {
    const chosen = card.querySelector(`input[name="q-${q.id}"]:checked`);
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
    state.bookmarks = isBookmarked(id) ? state.bookmarks.filter(x => x !== id) : [...state.bookmarks, id];
    saveProgress();
    render();
  }

  if (e.target.closest('.explain-btn')) {
    explain(q);
  }
});

$('searchInput').addEventListener('input', (e) => { state.filters.search = e.target.value; render(); });
$('topicFilter').addEventListener('change', (e) => { state.filters.topic = e.target.value; render(); });
$('statusFilter').addEventListener('change', (e) => { state.filters.status = e.target.value; render(); });
$('resetBtn').addEventListener('click', () => {
  if (!confirm('Reset all saved answers and bookmarks?')) return;
  state.answers = {};
  state.bookmarks = [];
  state.explanations = {};
  saveProgress();
  render();
});
$('closeDialog').addEventListener('click', () => $('explainDialog').close());

async function init() {
  const res = await fetch('data/mcqs.json');
  const data = await res.json();
  state.mcqs = data.mcqs;
  buildFilters();
  render();
}
init();
