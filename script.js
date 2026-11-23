'use strict';
const PREFIX = 'ictMcqMultiV1';
const $ = id => document.getElementById(id);
const escapeHtml = (v = '') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const bn = n => Number(n).toLocaleString('bn-BD');
function readStore(key, fallback) { try { const v = JSON.parse(localStorage.getItem(`${PREFIX}:${key}`)); return v !== null && typeof v === typeof fallback && Array.isArray(v) === Array.isArray(fallback) ? v : fallback; } catch { return fallback; } }
let storageWarned = false;
function writeStore(key, value) { try { localStorage.setItem(`${PREFIX}:${key}`, JSON.stringify(value)); } catch { if (!storageWarned) { storageWarned = true; toast('ব্রাউজারে সেভ করা যাচ্ছে না। এই ট্যাবেই চর্চা চালিয়ে যেতে পারো।'); } } }
const state = { chapters:[], questions:[], view:'home', chapter:'all', topic:'all', status:'all', feedbackId:null, search:'', index:0, examSize:100, examFilter:'all', answers:readStore('practiceAnswersV2',readStore('practiceAnswers',{})), drafts:readStore('draftsV2',{}), revealed:readStore('revealedV2',[]), bookmarks:readStore('bookmarks',[]), explanations:readStore('explanationsV2',{}), exam:readStore('examV2',{}), last:readStore('lastV2',{}), navOpen:false, mobileFiltersOpen:false, loaded:false };
const iconPaths = {
 home:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
 book:'<path d="M12 5v16M3 4c4-1 7-1 9 1 2-2 5-2 9-1v15c-4-1-7-1-9 2-2-3-5-3-9-2Z"/>',
 bookmark:'<path d="M6 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17l-6-4-6 4Z"/>',
 exam:'<rect x="5" y="4" width="14" height="18" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="m8 13 3 3 5-6"/>',
 spark:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/><path d="M20 2v4m-2-2h4"/>',
 settings:'<path d="M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1Z"/><circle cx="12" cy="12" r="3"/>',
 globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 7h14M5 17h14"/>',
 circuit:'<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 3v3m6-3v3M9 18v3m6-3v3M3 9h3m-3 6h3m12-6h3m-3 6h3"/>',
 database:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
 check:'<path d="m5 12 4 4L19 6"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
 search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 shield:'<path d="m12 3 8 3v6c0 4-4 7-8 9-4-2-8-5-8-9V6Z"/><path d="m8 12 3 3 5-6"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/>',
 chevron:'<path d="m6 9 6 6 6-6"/>',
 play:'<path d="m9 5 11 7-11 7Z"/>',
 reset:'<path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/>'
};
function icon(name){return `<svg viewBox="0 0 24 24" aria-hidden="true">${iconPaths[name]||iconPaths.book}</svg>`;}
document.querySelectorAll('[data-icon]').forEach(e=>e.innerHTML=icon(e.dataset.icon));
const chapterUI = {ch1:{name:'তথ্য ও যোগাযোগ প্রযুক্তি',label:'১ম অধ্যায়',short:'বিশ্ব ও বাংলাদেশ',detail:'বিশ্বগ্রাম · AI · রোবোটিক্স',icon:'globe'},ch3:{name:'সংখ্যা পদ্ধতি ও ডিজিটাল সিস্টেম',label:'৩য় অধ্যায়',short:'সংখ্যা পদ্ধতি',detail:'সংখ্যা রূপান্তর · লজিক গেট',icon:'circuit'},db:{name:'ডেটাবেজ ম্যানেজমেন্ট',label:'ডেটাবেজ',short:'ডেটাবেজ',detail:'SQL · টেবিল · রিলেশন',icon:'database'}};
function chapterInfo(id){return chapterUI[id] || {name:state.chapters.find(c=>c.id===id)?.title||id,label:'অধ্যায়',detail:'ICT',icon:'book'};}
function usable(q){return !q.needsReview && q.options.length>=2 && q.options.some(o=>o.label===q.correctLetter);}
function bookmarked(id){return state.bookmarks.includes(id);}
function answerText(q){return q.options.find(o=>o.label===q.correctLetter)?.text || '';}
function savePractice(){writeStore('practiceAnswersV2',state.answers);writeStore('draftsV2',state.drafts);writeStore('revealedV2',state.revealed);writeStore('bookmarks',state.bookmarks);}
function saveExam(){writeStore('examV2',state.exam);}
let toastTimer;
function toast(text){$('toast').textContent=text;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,3800);}
function confirmAction(title,text,action){return new Promise(resolve=>{const d=$('confirmDialog');$('confirmTitle').textContent=title;$('confirmText').textContent=text;$('acceptConfirm').textContent=action;$('acceptConfirm').onclick=()=>{d.close();resolve(true);};$('cancelConfirm').onclick=()=>{d.close();resolve(false);};d.oncancel=()=>resolve(false);d.showModal();});}
function stats(qs=state.questions.filter(usable)){const answered=qs.filter(q=>state.answers[q.id]);return {total:qs.length,answered:answered.length,correct:answered.filter(q=>state.answers[q.id]===q.correctLetter).length};}
function statCard(ico,value,label){return `<div class="stat-card"><div class="stat-icon">${icon(ico)}</div><div><div class="stat-value">${value}</div><div class="stat-label">${label}</div></div></div>`;}
function progress(value){return `<div class="progress-track"><span style="width:${Math.min(100,Math.max(0,value))}%"></span></div>`;}
function header(title,sub,extra=''){return `<div class="page-heading"><div><h1>${title}</h1><p>${sub}</p></div>${extra}</div>`;}
function empty(title,sub,button=''){return `<div class="empty-state">${icon('search')}<h2>${title}</h2><p>${sub}</p>${button}</div>`;}
function renderHome(){
 const s=stats(),last=state.questions.find(q=>q.id===state.last.id&&usable(q));
 return `
  <section class="home-intro" aria-label="আজকের অনুশীলন">
   <div class="home-copy">
    <span class="section-tag"><span class="tag-dot"></span> HSC ICT · তোমার শেখার জায়গা</span>
    <h1>পড়ো। চর্চা করো।<br><span>বুঝে এগিয়ে যাও।</span></h1>
    <p>একটি অধ্যায় বেছে নাও, প্রশ্নের উত্তর দাও, প্রয়োজনে AI-কে জিজ্ঞেস করো।</p>
    <div class="hero-actions"><button class="button primary" data-action="continue">${icon('play')} ${last?'যেখান থেকে থেমেছিলে':'অনুশীলন শুরু করো'}</button><button class="button outline" data-view="exam">${icon('exam')} মডেল টেস্ট</button></div>
   </div>
   <div class="home-progress" aria-label="তোমার অগ্রগতি"><div class="progress-emblem">${icon('target')}</div><span class="home-progress-label">এ পর্যন্ত চর্চা</span><strong>${bn(s.answered)} <small>/ ${bn(s.total)}</small></strong><p>প্রশ্নের উত্তর দিয়েছ</p>${progress(s.answered/Math.max(1,s.total)*100)}<div class="progress-caption">${s.answered?bn(Math.round(s.correct/s.answered*100))+'% সঠিক':'আজই শুরু হোক'}</div></div>
  </section>
  <section class="chapter-section" aria-labelledby="chooseChapter"><div class="section-heading"><div><span class="eyebrow">তোমার পাঠ্যসূচি</span><h2 id="chooseChapter">অধ্যায় বেছে নাও</h2></div><span class="chapter-count">${bn(state.chapters.length)}টি অধ্যায়</span></div>
   <div class="chapter-grid">${state.chapters.map(ch=>{const ui=chapterInfo(ch.id),cs=stats(state.questions.filter(q=>q.chapterId===ch.id&&usable(q)));return `<button class="chapter-card chapter-${escapeHtml(ch.id)}" data-chapter="${escapeHtml(ch.id)}" aria-label="${escapeHtml(ui.label)} ${escapeHtml(ui.name)} অনুশীলন শুরু করো"><span class="chapter-card-top"><span class="chapter-icon">${icon(ui.icon)}</span><span class="chapter-arrow" aria-hidden="true">↗</span></span><span class="chapter-kicker">${ui.label}</span><strong class="chapter-name">${escapeHtml(ui.name)}</strong><span class="chapter-description">${escapeHtml(ui.detail)}</span><span class="chapter-foot"><span>${bn(cs.answered)} / ${bn(cs.total)}টি সম্পন্ন</span><span>${cs.total?Math.round(cs.answered/cs.total*100):0}%</span></span>${progress(cs.answered/Math.max(1,cs.total)*100)}</button>`;}).join('')}</div>
  </section>
  <div class="home-ai" role="note"><span class="ai-spark">${icon('spark')}</span><div><strong>পড়তে গিয়ে আটকে গেছ?</strong><span>প্রতিটি অনুশীলন প্রশ্নে AI ইঙ্গিত ও সহজ বাংলা ব্যাখ্যা আছে।</span></div><button class="button ai-outline" data-action="continue">AI সহ চর্চা করো ${icon('play')}</button></div>
  <button class="text-button mobile-settings" data-action="settings">${icon('settings')} সেটিংস</button>`;
}
function practicePool(){const search=state.search.normalize('NFC').trim().toLocaleLowerCase();return state.questions.filter(q=>{
 if(state.chapter!=='all'&&q.chapterId!==state.chapter)return false;
 if(state.topic!=='all'&&q.topic!==state.topic)return false;
 if(state.view==='saved'&&!bookmarked(q.id))return false;
 if(state.status==='review'){if(usable(q))return false;} else if(!usable(q))return false;
 const a=state.answers[q.id];
 if(state.feedbackId===q.id)return true;
 if(state.status==='unanswered'&&a)return false;
 if(state.status==='correct'&&a!==q.correctLetter)return false;
 if(state.status==='wrong'&&(!a||a===q.correctLetter))return false;
 if(search&&!([q.question,q.stimulus,q.topic,...q.options.map(o=>o.text)].join(' ').normalize('NFC').toLocaleLowerCase().includes(search)))return false;
 return true;
 });}
function examPool(){if(!state.exam.questions)return [];return state.exam.questions.map(id=>state.questions.find(q=>q.id===id)).filter(Boolean).filter(q=>{const a=state.exam.answers[q.id];if(!state.exam.submitted)return true;return state.examFilter==='all'||(state.examFilter==='correct'&&a===q.correctLetter)||(state.examFilter==='wrong'&&a&&a!==q.correctLetter)||(state.examFilter==='unanswered'&&!a);});}
function currentPool(){return state.view==='examRun'?examPool():practicePool();}
function filters(){
 const topics=[...new Set(state.questions.filter(q=>state.chapter==='all'||q.chapterId===state.chapter).map(q=>q.topic).filter(Boolean))];
 const expanded=state.topic!=='all'||state.status!=='all';
 return `<details class="filter-shell" ${window.innerWidth>700||state.mobileFiltersOpen||expanded?'open':''}><summary class="filter-summary">${icon('search')} অধ্যায় / প্রশ্ন খুঁজো <span>${state.chapter==='all'?'সব অধ্যায়':escapeHtml(chapterInfo(state.chapter).label)}</span>${icon('chevron')}</summary><div class="filters-main"><div class="field"><label for="chapterFilter">অধ্যায়</label><select id="chapterFilter"><option value="all">সব অধ্যায়</option>${state.chapters.map(c=>`<option value="${escapeHtml(c.id)}" ${c.id===state.chapter?'selected':''}>${escapeHtml(chapterInfo(c.id).name)}</option>`).join('')}</select></div><div class="field search-field"><label for="searchInput">প্রশ্ন খুঁজে নাও</label><div class="search-wrap">${icon('search')}<input id="searchInput" type="search" placeholder="প্রশ্ন বা শব্দ লিখো" value="${escapeHtml(state.search)}" autocomplete="off"></div></div></div><details class="advanced-filters" ${expanded?'open':''}><summary>${icon('settings')} আরও ফিল্টার ${icon('chevron')}</summary><div class="advanced-fields"><div class="field"><label for="topicFilter">বিষয়</label><select id="topicFilter"><option value="all">সব বিষয়</option>${topics.map(t=>`<option ${t===state.topic?'selected':''}>${escapeHtml(t)}</option>`).join('')}</select></div><div class="field"><label for="statusFilter">অবস্থা</label><select id="statusFilter">${Object.entries({all:'সব প্রশ্ন',unanswered:'বাকি প্রশ্ন',wrong:'ভুল উত্তর',correct:'সঠিক উত্তর',review:'যাচাই প্রয়োজন'}).map(([v,t])=>`<option value="${v}" ${v===state.status?'selected':''}>${t}</option>`).join('')}</select></div></div></details></details>`;
}
function renderPractice(){
 const title=state.view==='saved'?'সংরক্ষিত প্রশ্ন':state.status==='review'?'যাচাইয়ের তালিকা':state.chapter==='all'?'অনুশীলন':chapterInfo(state.chapter).name;
 const sub=state.view==='saved'?'তোমার চিহ্নিত প্রশ্নগুলো এখানে আছে।':state.status==='review'?'যেসব প্রশ্নের মূল উৎস যাচাই প্রয়োজন।':'একবারে একটি প্রশ্ন। নিজের গতিতে চর্চা করো।';
 return `<div class="practice-page">${header(title,sub,'<span class="count-chip" id="poolCount"></span>')}${filters()}<div id="questionArea"></div></div>`;
}
function tableHtml(t){if(!t)return '';return `<table><thead><tr>${t.headers.map(v=>`<th scope="col">${escapeHtml(v)}</th>`).join('')}</tr></thead><tbody>${t.rows.map(r=>`<tr>${r.map(v=>`<td>${escapeHtml(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;}
function renderQuestion(q){
 const exam=state.view==='examRun',submitted=exam&&state.exam.submitted;
 const answer=exam?state.exam.answers[q.id]:state.answers[q.id];
 const revealed=!exam&&state.revealed.includes(q.id);
 const locked=exam?submitted:!!answer||revealed;
 const showCorrect=usable(q)&&(submitted||(!exam&&locked));
 const draft=exam?answer:answer||state.drafts[q.id];const ready=usable(q);
 return `<article class="question-card ${exam?'exam-question':''}" data-id="${escapeHtml(q.id)}">
  <div class="question-top"><div class="question-kicker"><span class="question-chapter chapter-mark-${escapeHtml(q.chapterId)}">${escapeHtml(chapterInfo(q.chapterId).label)}</span><span class="topic-label">${escapeHtml(q.topic||chapterInfo(q.chapterId).short)}</span></div><div class="question-head-tools">${ready&&(!exam||submitted)?`<button class="quick-ai" data-action="${locked?'explain':'ai-hint'}" aria-label="${locked?'AI দিয়ে পূর্ণ ব্যাখ্যা দেখো':'AI থেকে উত্তর ছাড়া ইঙ্গিত নাও'}">${icon('spark')} ${locked?'AI ব্যাখ্যা':'AI ইঙ্গিত'}</button>`:''}<button class="icon-button bookmark ${bookmarked(q.id)?'active':''}" data-action="bookmark" aria-label="${bookmarked(q.id)?'সংরক্ষণ সরাও':'প্রশ্ন সংরক্ষণ করো'}" title="${bookmarked(q.id)?'সংরক্ষিত':'সংরক্ষণ'}" aria-pressed="${bookmarked(q.id)}">${icon('bookmark')}</button></div></div>
  ${q.stimulus||q.stimulusTable?`<details class="stimulus" open><summary>উদ্দীপক</summary>${escapeHtml(q.stimulus)}${tableHtml(q.stimulusTable)}</details>`:''}
  <h2 class="question-title" id="questionTitle" tabindex="-1">${escapeHtml(q.question)}</h2>
  <div class="options" role="radiogroup" aria-labelledby="questionTitle">${q.options.map(o=>{const correct=showCorrect&&o.label===q.correctLetter,wrong=showCorrect&&answer===o.label&&o.label!==q.correctLetter;return `<label class="option ${correct?'correct':''} ${wrong?'wrong':''} ${locked||!ready?'locked':''}"><input type="radio" name="answer" value="${escapeHtml(o.label)}" ${draft===o.label?'checked':''} ${locked||!ready?'disabled':''}><span class="letter">${escapeHtml(o.label)}</span><span class="option-text">${escapeHtml(o.text)}</span>${correct||wrong?`<span class="option-status" aria-label="${correct?'সঠিক উত্তর':'ভুল উত্তর'}">${correct?'✓':'✕'}</span>`:''}</label>`;}).join('')}</div>
  ${!ready?'<div class="quality-note">এই প্রশ্নের উৎস যাচাই প্রয়োজন। যাচাইয়ের আগে উত্তর ও স্কোর দেখানো হচ্ছে না।</div>':''}
  ${showCorrect?`<div class="feedback ${answer?answer===q.correctLetter?'good':'bad':'neutral'}" role="status"><span class="feedback-icon">${answer===q.correctLetter?'✓':'↗'}</span><div><strong>${answer?answer===q.correctLetter?'দারুণ! সঠিক উত্তর।':'উত্তরটা মিলিয়ে দেখো।':'সঠিক উত্তর'}</strong><p>${escapeHtml(q.correctLetter)}) ${escapeHtml(answerText(q))}</p></div></div>`:''}
  ${ready&&!exam?`<div class="learning-actions"><div class="answer-actions">${!locked?`<button class="button primary" data-action="check" ${!draft?'disabled':''}>উত্তর যাচাই করো ${icon('check')}</button><button class="button subtle" data-action="reveal">উত্তর দেখো</button>`:`<button class="button subtle" data-action="retry">${icon('reset')} আবার চেষ্টা</button>`}</div></div>`:''}
  ${exam?(submitted?'':`<div class="exam-running-note">${icon('shield')} টেস্ট চলাকালীন উত্তর ও AI ব্যাখ্যা লুকানো থাকবে। জমা দিলে দেখতে পারবে।</div>`):''}
 </article>`;
}
function navigator(pool){
 const exam=state.view==='examRun',answered=pool.filter(q=>exam?state.exam.answers[q.id]:state.answers[q.id]).length;
 return `<details class="navigator" ${state.navOpen?'open':''}><summary>${icon('book')} প্রশ্ন সূচি <span class="nav-summary-progress">${bn(answered)} / ${bn(pool.length)}টি উত্তর</span> ${icon('chevron')}</summary><div class="navigator-inner"><div class="nav-progress">${progress(answered/Math.max(pool.length,1)*100)}</div><div class="question-grid" aria-label="প্রশ্নে যাও">${pool.map((q,i)=>{const a=exam?state.exam.answers[q.id]:state.answers[q.id],wrong=a&&a!==q.correctLetter&&(!exam||state.exam.submitted);return `<button class="question-dot ${i===state.index?'current':''} ${a?(wrong?'wrong':'answered'):!exam&&state.drafts[q.id]?'drafted':''}" data-jump="${i}" aria-label="প্রশ্ন ${bn(i+1)}${a?' · উত্তর দেওয়া হয়েছে':''}" ${i===state.index?'aria-current="true"':''}>${bn(i+1)}</button>`;}).join('')}</div><p class="navigator-note">নম্বরে ক্লিক করে যেকোনো প্রশ্নে যাও।</p></div></details>`;
}
function drawQuestion(focus=false){
 const pool=currentPool();state.index=Math.min(Math.max(0,state.index),Math.max(0,pool.length-1));
 if($('poolCount'))$('poolCount').textContent=`${bn(pool.length)}টি প্রশ্ন`;
 if(!pool.length){$('questionArea').innerHTML=empty(state.view==='saved'?'কোনো প্রশ্ন সংরক্ষিত নেই':'এই ফিল্টারে প্রশ্ন পাওয়া যায়নি',state.view==='saved'?'যেকোনো প্রশ্নের বুকমার্ক চিহ্নে চাপ দাও।':'অন্য অধ্যায় বা ফিল্টার বেছে নাও।',`<button class="button subtle" data-action="clear-filters">${state.view==='examRun'?'সব উত্তর দেখো':'সব অনুশীলন দেখো'}</button>`);return;}
 const q=pool[state.index],pct=Math.round((state.index+1)/pool.length*100);
 $('questionArea').innerHTML=`<div class="question-session"><div class="session-top"><div><span class="session-eyebrow">${state.view==='examRun'?'মডেল টেস্ট':'প্রশ্নে প্রশ্নে শিখি'}</span><strong>প্রশ্ন ${bn(state.index+1)} <span>/ ${bn(pool.length)}</span></strong></div><span class="session-percent">${bn(pct)}%</span></div><div class="session-track" role="progressbar" aria-label="প্রশ্নের অবস্থান" aria-valuenow="${state.index+1}" aria-valuemin="1" aria-valuemax="${pool.length}"><span style="width:${pct}%"></span></div>${renderQuestion(q)}<nav class="question-footer" aria-label="প্রশ্ন পরিবর্তন"><button class="button subtle" data-action="previous" ${state.index===0?'disabled':''}>← আগের</button><span class="position">${bn(state.index+1)} / ${bn(pool.length)}</span><button class="button next-button" data-action="next" ${state.index===pool.length-1?'disabled':''}>পরের প্রশ্ন →</button></nav>${navigator(pool)}</div>`;
 const nav=$('questionArea').querySelector('.navigator');nav.addEventListener('toggle',e=>state.navOpen=e.target.open);
 if(state.view!=='examRun'&&usable(q)){state.last={id:q.id};writeStore('lastV2',state.last);}else if(state.view==='examRun'){state.exam.cursor=q.id;saveExam();}
 if(focus)$('questionTitle').focus({preventScroll:true});
}
function renderSetup(){
 const active=state.exam.questions?.length&&!state.exam.submitted;
 return `<div class="exam-page">${header('মডেল টেস্ট','নিজের প্রস্তুতি যাচাই করো।')}
 <div class="exam-setup">${active?`<div class="resume-card"><div><strong>একটি টেস্ট চলছে</strong><p>${bn(Object.keys(state.exam.answers).length)} / ${bn(state.exam.questions.length)}টি উত্তর দিয়েছ</p></div><button class="button outline" data-action="resume">চালিয়ে যাও →</button></div>`:state.exam.submitted?'<div class="resume-card"><strong>আগের টেস্টের ফলাফল আছে</strong><button class="button outline" data-action="resume">ফলাফল দেখো →</button></div>':''}
 <section class="setup-card"><div class="setup-icon">${icon('exam')}</div><h2>কতটি প্রশ্নে পরীক্ষা দেবে?</h2><p>অধ্যায় মিলিয়ে র‍্যান্ডম প্রশ্ন। জমা দেওয়ার আগে সঠিক উত্তর দেখা যাবে না।</p><div class="segmented" role="group" aria-label="প্রশ্নের সংখ্যা">${[20,50,100].map(n=>`<button data-size="${n}" class="${state.examSize===n?'active':''}" aria-pressed="${state.examSize===n}">${bn(n)}টি</button>`).join('')}</div><button class="button primary" data-action="start-exam">${icon('play')} টেস্ট শুরু করো</button><div class="setup-note">${icon('shield')} সময়সীমা নেই · জমার পর ফলাফল ও AI ব্যাখ্যা</div></section></div></div>`;
}
function renderResult(){const qs=state.exam.questions.map(id=>state.questions.find(q=>q.id===id));const correct=qs.filter(q=>state.exam.answers[q.id]===q.correctLetter).length,answered=Object.keys(state.exam.answers).length;const percent=Math.round(correct/qs.length*100);return `<section class="result-card"><div class="score-ring" style="--score:${percent}"><div class="score-ring-inner">${bn(percent)}%<small>তোমার স্কোর</small></div></div><div class="result-copy"><h2>টেস্ট শেষ। এবার দেখে শেখো।</h2><div class="result-stats"><div><strong>${bn(correct)}</strong><span>সঠিক</span></div><div><strong>${bn(answered-correct)}</strong><span>ভুল</span></div><div><strong>${bn(qs.length-answered)}</strong><span>উত্তর বাকি</span></div></div></div><div class="result-actions"><button class="button soft" data-view="exam">নতুন টেস্ট</button></div></section><div class="exam-review-filters">${Object.entries({all:'সব উত্তর',wrong:'ভুলগুলো',unanswered:'উত্তর বাকি',correct:'সঠিকগুলো'}).map(([v,t])=>`<button data-exam-filter="${v}" class="${state.examFilter===v?'active':''}">${t}</button>`).join('')}</div>`;}
function renderExam(){return header(state.exam.submitted?'টেস্টের ফলাফল':'মডেল টেস্ট',`${bn(state.exam.questions.length)}টি প্রশ্ন · ${state.exam.submitted?'উত্তরগুলো মিলিয়ে দেখো':'চাইলে জমা দেওয়ার আগে উত্তর বদলাতে পারো'}`,`<div class="exam-status"><span class="timer">${icon('clock')}<span id="elapsed"></span></span><button class="button ${state.exam.submitted?'secondary':'primary'}" ${state.exam.submitted?'data-view="exam"':'data-action="submit-exam"'}>${state.exam.submitted?'নতুন টেস্ট':'টেস্ট জমা দাও'}</button></div>`)+(state.exam.submitted?renderResult():'')+'<div id="questionArea"></div>';}
function render(){if(!state.loaded)return;$('viewLabel').textContent=({home:'হোম',practice:'অনুশীলন',saved:'সংরক্ষিত',exam:'মডেল টেস্ট',examRun:'মডেল টেস্ট'})[state.view];$('main').dataset.view=state.view;document.querySelectorAll('.main-nav [data-view]').forEach(el=>{const active=el.dataset.view===(state.view==='examRun'?'exam':state.view);el.classList.toggle('active',active);if(active)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});$('savedBadge').textContent=state.bookmarks.length;$('main').innerHTML=state.view==='home'?renderHome():state.view==='exam'?renderSetup():state.view==='examRun'?renderExam():renderPractice();if($('questionArea'))drawQuestion();tick();}
function navigate(view,reset=true){if(!state.loaded)return;state.feedbackId=null;state.view=view;if(reset){state.index=0;state.chapter='all';state.topic='all';state.status='all';state.search='';}history.replaceState(null,'',`#${view==='examRun'?'exam':view}`);render();window.scrollTo({top:0,behavior:'instant'});$('main').focus({preventScroll:true});}
function shuffled(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function sampleExam(size){const groups=state.chapters.map(ch=>shuffled(state.questions.filter(q=>q.chapterId===ch.id&&usable(q))));const picked=[];while(picked.length<size&&groups.some(g=>g.length)){for(const g of shuffled(groups)){if(g.length&&picked.length<size)picked.push(g.pop());}}return shuffled(picked).map(q=>q.id);}
async function startExam(){if(state.exam.questions?.length&&!state.exam.submitted&&!await confirmAction('নতুন টেস্ট শুরু করবে?','চলমান টেস্টের উত্তর মুছে নতুন প্রশ্ন নেওয়া হবে।','নতুন টেস্ট'))return;const ids=sampleExam(state.examSize);if(!ids.length){toast('টেস্টের জন্য প্রশ্ন পাওয়া যায়নি।');return;}state.exam={questions:ids,answers:{},started:Date.now(),submitted:false,cursor:ids[0]};state.examFilter='all';state.index=0;saveExam();navigate('examRun');}
async function submitExam(){if(state.exam.submitted)return;const left=state.exam.questions.length-Object.keys(state.exam.answers).length;if(!await confirmAction('টেস্ট জমা দেবে?',left?`${bn(left)}টি প্রশ্নের উত্তর বাকি। জমা দেওয়ার পর উত্তর বদলানো যাবে না।`:'জমা দেওয়ার পর ফলাফল ও সঠিক উত্তর দেখা যাবে।','জমা দাও'))return;state.exam.submitted=true;state.exam.finished=Date.now();state.examFilter='all';state.index=0;saveExam();render();window.scrollTo({top:0,behavior:'smooth'});$('main').focus({preventScroll:true});}
function tick(){if(!$('elapsed')||!state.exam.started)return;const seconds=Math.max(0,Math.floor(((state.exam.finished||Date.now())-state.exam.started)/1000));$('elapsed').textContent=`${bn(Math.floor(seconds/60))}:${String(seconds%60).padStart(2,'0').replace(/\d/g,d=>'০১২৩৪৫৬৭৮৯'[d])}`;}
setInterval(tick,1000);
let searchTimer;
$('main').addEventListener('toggle',e=>{if(e.target.matches('.filter-shell')&&window.innerWidth<=700)state.mobileFiltersOpen=e.target.open;},true);
window.addEventListener('resize',()=>{const f=$('main').querySelector('.filter-shell');if(f&&window.innerWidth>700)f.open=true;});
$('main').addEventListener('input',e=>{if(e.target.id==='searchInput'){state.feedbackId=null;state.search=e.target.value;state.index=0;clearTimeout(searchTimer);searchTimer=setTimeout(()=>{if($('questionArea'))drawQuestion();},120);}});
$('main').addEventListener('change',e=>{const el=e.target;if(['chapterFilter','topicFilter','statusFilter'].includes(el.id)){state.feedbackId=null;state.index=0;if(el.id==='chapterFilter'){state.chapter=el.value;state.topic='all';}if(el.id==='topicFilter')state.topic=el.value;if(el.id==='statusFilter')state.status=el.value;render();$(el.id)?.focus();return;}if(el.matches('input[name="answer"]')){const q=currentPool()[state.index];if(!q||!usable(q))return;if(state.view==='examRun'){if(state.exam.submitted)return;state.exam.answers[q.id]=el.value;saveExam();}else{state.drafts[q.id]=el.value;writeStore('draftsV2',state.drafts);const b=$('main').querySelector('[data-action="check"]');if(b)b.disabled=false;}const nav=$('main').querySelector('.navigator');if(nav){nav.outerHTML=navigator(currentPool());$('main').querySelector('.navigator').addEventListener('toggle',e=>state.navOpen=e.target.open);}}});
document.addEventListener('click',async e=>{const el=e.target.closest('button,a');if(!el)return;if(el.dataset.view){navigate(el.dataset.view);return;}if(el.matches('.brand')){e.preventDefault();navigate('home');return;}if(el.dataset.chapter){navigate('practice');state.chapter=el.dataset.chapter;render();return;}if(el.dataset.size){state.examSize=Number(el.dataset.size);render();$('main').querySelector(`[data-size="${state.examSize}"]`).focus();return;}if(el.dataset.jump!==undefined){const next=currentPool()[Number(el.dataset.jump)]?.id;state.feedbackId=null;state.index=Math.max(0,currentPool().findIndex(item=>item.id===next));drawQuestion(true);$('questionArea').scrollIntoView({block:'start',behavior:'smooth'});return;}if(el.dataset.examFilter){state.examFilter=el.dataset.examFilter;state.index=0;render();return;}const action=el.dataset.action;if(!action)return;
 if(action==='continue'){const id=state.last.id;navigate('practice');const pool=practicePool();state.index=Math.max(0,pool.findIndex(q=>q.id===id));drawQuestion();return;}
 if(action==='review'){navigate('practice');state.status='review';render();return;}
 if(action==='clear-filters'){if(state.view==='examRun'){state.examFilter='all';state.index=0;render();}else navigate('practice');return;}
 if(action==='start-exam'){await startExam();return;}if(action==='submit-exam'){await submitExam();return;}
 if(action==='resume'){const cursor=state.exam.cursor;state.examFilter='all';navigate('examRun');state.index=Math.max(0,examPool().findIndex(q=>q.id===cursor));drawQuestion();return;}
 if(action==='settings'){$('settingsDialog').showModal();return;}
 const q=currentPool()[state.index];if(!q)return;
 if(action==='next'||action==='previous'){const next=currentPool()[state.index+(action==='next'?1:-1)]?.id;state.feedbackId=null;state.index=Math.max(0,currentPool().findIndex(item=>item.id===next));drawQuestion(true);$('questionArea').scrollIntoView({block:'start',behavior:'smooth'});return;}
 if(action==='bookmark'){state.bookmarks=bookmarked(q.id)?state.bookmarks.filter(id=>id!==q.id):[...state.bookmarks,q.id];savePractice();$('savedBadge').textContent=state.bookmarks.length;toast(bookmarked(q.id)?'প্রশ্ন সংরক্ষণ করা হয়েছে':'সংরক্ষিত তালিকা থেকে সরানো হয়েছে');drawQuestion();return;}
 if(!usable(q))return;
 if(action==='check'&&state.drafts[q.id]){state.feedbackId=q.id;state.answers[q.id]=state.drafts[q.id];delete state.drafts[q.id];savePractice();drawQuestion();toast(state.answers[q.id]===q.correctLetter?'সঠিক উত্তর!':'উত্তরটি মিলিয়ে দেখো।');}
 if(action==='reveal'){if(!state.revealed.includes(q.id))state.revealed.push(q.id);delete state.drafts[q.id];savePractice();drawQuestion();}
 if(action==='retry'){state.feedbackId=q.id;delete state.answers[q.id];delete state.drafts[q.id];state.revealed=state.revealed.filter(id=>id!==q.id);savePractice();drawQuestion(true);}
 if(action==='ai-hint')explain(q,'hint');if(action==='explain')explain(q,'full');
});
$('fontBtn').onclick=()=>{const on=document.documentElement.classList.toggle('large-text');$('fontBtn').setAttribute('aria-pressed',on);$('fontBtn').setAttribute('aria-label',on?'লেখা স্বাভাবিক আকারে আনুন':'লেখা বড় করুন');writeStore('largeText',on);};
if(readStore('largeText',false)){$('fontBtn').click();}
$('settingsBtn').onclick=()=>$('settingsDialog').showModal();$('closeSettings').onclick=()=>$('settingsDialog').close();
$('resetBtn').onclick=async()=>{if(!await confirmAction('অনুশীলনের অগ্রগতি মুছবে?','সেভ করা উত্তর ও দেখা উত্তর মুছে যাবে। সংরক্ষিত প্রশ্ন ও টেস্ট থাকবে।','অগ্রগতি মুছুন'))return;state.answers={};state.drafts={};state.revealed=[];savePractice();$('settingsDialog').close();render();toast('অনুশীলনের অগ্রগতি মুছে দেওয়া হয়েছে');};
let apiController=null,activeQuestion=null,requestSequence=0,activeAiMode='full';
$('closeDialog').onclick=()=>$('explainDialog').close();
$('explainDialog').addEventListener('close',()=>{requestSequence++;apiController?.abort();activeQuestion=null;});
async function callExplainApi(prompt,questionId){
 if(!window.EXPLAIN_API_URL)throw new Error('AI সেবা সংযুক্ত নেই। পরে আবার চেষ্টা করো।');
 apiController?.abort();const controller=new AbortController();apiController=controller;
 const timeout=setTimeout(()=>controller.abort(),30000);
 try{const res=await fetch(window.EXPLAIN_API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt,questionId}),signal:controller.signal});const data=await res.json().catch(()=>({}));if(!res.ok)throw new Error(res.status===429?'একটু বিরতি দিয়ে আবার চেষ্টা করো।':'AI সেবা এখন সাড়া দিচ্ছে না। পরে আবার চেষ্টা করো।');if(typeof data.explanation!=='string'||!data.explanation.trim())throw new Error('ব্যাখ্যা পাওয়া যায়নি। আবার চেষ্টা করো।');return data.explanation;}catch(err){if(err.name==='AbortError')throw new Error('সময় বেশি লাগছে। আবার চেষ্টা করো।');if(err instanceof TypeError)throw new Error('সংযোগ পাওয়া যায়নি। ইন্টারনেট দেখে আবার চেষ্টা করো।');throw err;}finally{clearTimeout(timeout);}
}
function promptFor(q,mode='full'){
 const shared=`অধ্যায়: ${q.chapterTitle}\nউদ্দীপক: ${q.stimulus||'নেই'}\nপ্রশ্ন: ${q.question}\n${q.options.map(o=>`${o.label}) ${o.text}`).join('\n')}`;
 if(mode==='hint')return `তুমি একজন সহায়ক ICT শিক্ষক। শিক্ষার্থী এখনও প্রশ্নের উত্তর দেয়নি। বাংলা ভাষায় মাত্র ২–৪ লাইনে উত্তর বের করার জন্য প্রয়োজনীয় ধারণা এবং একটি ছোট ইঙ্গিত দাও। সঠিক অপশন, সঠিক অক্ষর বা চূড়ান্ত উত্তর কখনো বলবে না। প্রশ্নের অপশনগুলো থেকে কোনটি সঠিক তাও স্পষ্ট করবে না।\n${shared}`;
 return `তুমি একজন ধৈর্যশীল ICT শিক্ষক। ৫–৮ লাইনে সহজ বাংলায় প্রশ্নটি ব্যাখ্যা করো। সঠিক উত্তর, যুক্তি ও অন্য অপশনগুলো ভুল হওয়ার কারণ সংক্ষেপে বলো। উৎসের উত্তর ভুল বা অস্পষ্ট মনে হলে তা স্পষ্ট করো।\n${shared}\nউৎসের উত্তর: ${q.correctLetter}) ${answerText(q)}`;
}
function renderAiText(text){
 const safe=escapeHtml(text).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
 return safe.split(/\n\s*\n/).map(block=>{const lines=block.trim().split('\n');if(!lines[0])return '';if(lines.every(l=>/^\s*[-*•]\s+/.test(l)))return `<ul>${lines.map(l=>`<li>${l.replace(/^\s*[-*•]\s+/,'')}</li>`).join('')}</ul>`;return `<p>${lines.join('<br>')}</p>`;}).join('');
}
function showExplanation(text){
 $('explainContent').innerHTML=`<div class="answer-block">${renderAiText(text)}</div><p class="ai-note">${icon('info')} AI-এর উত্তরে ভুল থাকতে পারে। পাঠ্যবইয়ের সাথে মিলিয়ে নাও।</p>`;
 $('followupBox').hidden=false;
}
async function explain(q,mode='full'){
 if(state.view==='examRun'&&!state.exam.submitted)return;
 activeQuestion=q;activeAiMode=mode;const seq=++requestSequence;
 $('dialogTitle').textContent=mode==='hint'?'AI থেকে ইঙ্গিত':'AI দিয়ে বুঝে নাও';
 $('dialogMode').textContent=mode==='hint'?'উত্তর না বলে ধারণা দেবে':'প্রশ্নের সহজ বাংলা ব্যাখ্যা';
 $('followupBox').hidden=true;$('followupInput').value='';$('followupHistory').innerHTML='';$('askFollowupBtn').disabled=false;$('askFollowupBtn').textContent='জিজ্ঞেস করো';
 $('explainContent').innerHTML='<div class="loading-state"><span class="spinner"></span><p>AI সাহায্য তৈরি করছে…</p></div>';
 if(!$('explainDialog').open)$('explainDialog').showModal();
 const cache=mode==='hint'?(state.hints||(state.hints=readStore('hintsV3',{}))):state.explanations;
 if(cache[q.id]){showExplanation(cache[q.id]);return;}
 try{const text=await callExplainApi(promptFor(q,mode),q.id);if(seq!==requestSequence||!$('explainDialog').open)return;cache[q.id]=text;writeStore(mode==='hint'?'hintsV3':'explanationsV2',cache);showExplanation(text);}catch(err){if(seq!==requestSequence||!$('explainDialog').open)return;$('explainContent').innerHTML=`<div class="ai-error"><p>${escapeHtml(err.message)}</p><button id="retryExplain" class="button outline">আবার চেষ্টা</button></div>`;$('retryExplain').onclick=()=>explain(q,mode);}
}
$('followupBox').onsubmit=async e=>{
 e.preventDefault();const text=$('followupInput').value.trim();const q=activeQuestion;
 if(!q||!text||$('askFollowupBtn').disabled)return;
 const seq=requestSequence,mode=activeAiMode,btn=$('askFollowupBtn');btn.disabled=true;btn.textContent='উত্তর তৈরি হচ্ছে…';
 const row=document.createElement('div');row.className='followup-item student';row.textContent=text;$('followupHistory').append(row);
 const reply=document.createElement('div');reply.className='followup-item';reply.textContent='AI লিখছে…';$('followupHistory').append(reply);
 try{
  const last=(mode==='hint'?state.hints?.[q.id]:state.explanations[q.id])||'';
  const instruction=mode==='hint'?'সরাসরি সঠিক উত্তর, অপশন বা অক্ষর বলবে না; শুধু ইঙ্গিত দাও।':'ছোট করে সহজ বাংলায় বোঝাও।';
  const answer=await callExplainApi(`${promptFor(q,mode)}\nআগের AI সহায়তা: ${last}\nশিক্ষার্থীর প্রশ্ন: ${text}\n${instruction}`,q.id);
  if(seq===requestSequence){reply.textContent=answer;$('followupInput').value='';}
 }catch(err){if(seq===requestSequence)reply.textContent=err.message;}finally{if(seq===requestSequence){btn.disabled=false;btn.textContent='জিজ্ঞেস করো';}}
};
$('globalAiBtn').onclick=()=>{
 if(state.view==='examRun'&&!state.exam.submitted){toast('মডেল টেস্ট জমা দেওয়ার পর AI ব্যাখ্যা দেখা যাবে।');return;}
 if(['practice','saved','examRun'].includes(state.view)){
  const q=currentPool()[state.index];if(q&&usable(q)){
   const locked=state.view==='examRun'?!!state.exam.submitted:!!state.answers[q.id]||state.revealed.includes(q.id);
   explain(q,locked?'full':'hint');return;
  }
 }
 navigate('practice');
};
async function init(){const res=await fetch('data/mcqs.json');if(!res.ok)throw new Error('প্রশ্ন লোড করা যায়নি।');const data=await res.json();if(!Array.isArray(data.chapters)||!Array.isArray(data.mcqs))throw new Error('প্রশ্নের ফাইলটি সঠিক নয়।');state.chapters=data.chapters;const ids=new Set();state.questions=data.mcqs.map(q=>{if(!q.id||ids.has(q.id)||typeof q.question!=='string')throw new Error('প্রশ্নের তথ্য যাচাই করা প্রয়োজন।');ids.add(q.id);const options=Array.isArray(q.options)?q.options:[];return {...q,options,needsReview:!!q.needsReview||options.length<2||!options.some(o=>o.label===q.correctLetter)};});
 const valid=id=>ids.has(id);state.bookmarks=[...new Set(state.bookmarks.filter(id=>typeof id==='string'&&valid(id)))];state.revealed=state.revealed.filter(valid);state.answers=Object.fromEntries(Object.entries(state.answers).filter(([id,a])=>state.questions.some(q=>q.id===id&&usable(q)&&q.options.some(o=>o.label===a))));

 if(!Array.isArray(state.exam.questions)||!state.exam.questions.length||new Set(state.exam.questions).size!==state.exam.questions.length||state.exam.questions.some(id=>!state.questions.some(q=>q.id===id&&usable(q)))||!state.exam.answers||typeof state.exam.answers!=='object'||Array.isArray(state.exam.answers)||!Number.isFinite(state.exam.started)){state.exam={};}else{state.exam.answers=Object.fromEntries(Object.entries(state.exam.answers).filter(([id,a])=>state.exam.questions.includes(id)&&state.questions.find(q=>q.id===id).options.some(o=>o.label===a)));}
 state.loaded=true;const route=location.hash.slice(1);state.view=['home','practice','saved','exam'].includes(route)?route:'home';render();}
init().catch(()=>{$('main').innerHTML=empty('প্রশ্ন লোড করা যায়নি','ইন্টারনেট সংযোগ দেখে পেজটি আবার লোড করো। কম্পিউটারে চালাতে START.bat ব্যবহার করো।','<button class="button primary" id="reloadBtn">আবার লোড করো</button>');$('reloadBtn').onclick=()=>location.reload();});
