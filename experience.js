/* UX preferences, bilingual interface and on-demand English rendering of source MCQs.
   Internal answer keys always remain in their original data format. */
(() => {
  'use strict';
  const store = (key, fallback) => { try { return localStorage.getItem(key) || fallback; } catch { return fallback; } };
  const persist = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
  const lang = store('ictUX:language', 'bn') === 'en' ? 'en' : 'bn';
  const themeChoice = store('ictUX:theme', 'light');
  const mode = themeChoice === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = mode;
  document.documentElement.lang = lang;

  const dictionary = {
    'হোম':'Home','অনুশীলন':'Practice','মডেল টেস্ট':'Mock exam','সংরক্ষিত':'Saved','সেটিংস':'Settings',
    'শেখার জায়গা':'YOUR STUDY SPACE','প্রধান মেনু':'Main navigation','তোমার শেখার জায়গা':'Your study space',
    'প্রশ্নগুলো প্রস্তুত হচ্ছে…':'Preparing questions…','মূল কনটেন্টে যান':'Skip to content',
    'প্রশ্ন লোড করা যায়নি':'Could not load questions','ইন্টারনেট সংযোগ দেখে পেজটি আবার লোড করো। কম্পিউটারে চালাতে START.bat ব্যবহার করো।':'Check your connection and reload. On a PC, use START.bat.',
    'আবার লোড করো':'Reload','AI সহায়তা':'AI Help','লেখা বড় করো':'Increase font size',
    'বন্ধ করুন':'Close','AI · LEARNING SUPPORT':'AI · LEARNING SUPPORT', 'AI দিয়ে বুঝে নাও':'Understand with AI',
    'এখনো বুঝতে সমস্যা? AI-কে আবার জিজ্ঞেস করো':'Still confused? Ask AI another question',
    'যেমন: আরও সহজভাবে বুঝিয়ে বলো…':'E.g. Explain it in simpler steps…','জিজ্ঞেস করো':'Ask AI',
    'নিশ্চিত?':'Are you sure?','ফিরে যাই':'Cancel','নিশ্চিত':'Confirm',
    'তোমার অগ্রগতি':'Your progress','উত্তর, সংরক্ষিত প্রশ্ন ও টেস্ট এই ব্রাউজারেই থাকে। অন্য ডিভাইসে স্বয়ংক্রিয়ভাবে সিঙ্ক হয় না।':'Answers, bookmarks and exams are stored in this browser only and do not sync across devices.',
    'অনুশীলনের অগ্রগতি মুছুন':'Reset practice progress','সংরক্ষিত প্রশ্ন ও বর্তমান টেস্ট থাকবে।':'Saved questions and the current exam will remain.',
    'শিখি · চর্চা করি · বুঝে এগোই':'Learn · Practice · Understand','AI-সহ ICT চর্চা':'Learn ICT with AI','প্রশ্নে প্রশ্নে সাহায্য':'Help on every question',
    'HSC ICT · তোমার শেখার জায়গা':'HSC ICT · YOUR STUDY SPACE',
    'মুখস্থ নয়।':'Not by memorizing.','বুঝে শেখো।':'Learn by understanding.',
    'চর্চা করো, পরীক্ষা দাও, আটকে গেলে AI-কে জিজ্ঞেস করো।':'Practice, test yourself, and ask AI whenever you get stuck.',
    'যেখান থেকে থেমেছিলে':'Continue learning','অনুশীলন শুরু করো':'Start practice',
    'এ পর্যন্ত চর্চা':'Your practice','প্রশ্নের উত্তর দিয়েছ':'Questions answered','আজই শুরু হোক':'Start today',
    'তোমার পাঠ্যসূচি':'YOUR CHAPTERS','অধ্যায় বেছে নাও':'Choose a chapter',
    'পড়তে গিয়ে আটকে গেছ?':'Stuck on a question?',
    'প্রতিটি অনুশীলন প্রশ্নে AI ইঙ্গিত ও সহজ বাংলা ব্যাখ্যা আছে।':'Get an AI hint before answering or a full explanation afterward.',
    'AI সহ চর্চা করো':'Practice with AI','AI-কে জিজ্ঞেস করো':'Ask AI',
    '১ম অধ্যায়':'Chapter 1','৩য় অধ্যায়':'Chapter 3','ডেটাবেজ':'Database',
    'তথ্য ও যোগাযোগ প্রযুক্তি':'Information & Communication Technology','সংখ্যা পদ্ধতি ও ডিজিটাল সিস্টেম':'Number Systems & Digital Logic',
    'ডেটাবেজ ম্যানেজমেন্ট':'Database Management','বিশ্ব ও বাংলাদেশ':'World & Bangladesh',
    'বিশ্বগ্রাম · AI · রোবোটিক্স':'Global village · AI · Robotics',
    'সংখ্যা রূপান্তর · লজিক গেট':'Conversions · Logic gates',
    'SQL · টেবিল · রিলেশন':'SQL · Tables · Relations',
    'অনুশীলন':'Practice','একবারে একটি প্রশ্ন। নিজের গতিতে চর্চা করো।':'One question at a time, at your own pace.',
    'তোমার চিহ্নিত প্রশ্নগুলো এখানে আছে।':'Your bookmarked questions appear here.',
    'যেসব প্রশ্নের মূল উৎস যাচাই প্রয়োজন।':'Questions that need their original source checked.',
    'যাচাইয়ের তালিকা':'Needs review',
    'অধ্যায় / প্রশ্ন খুঁজো':'Search chapters / questions','সব অধ্যায়':'All chapters',
    'অধ্যায়':'Chapter','প্রশ্ন খুঁজে নাও':'Search questions','প্রশ্ন বা শব্দ লিখো':'Search a question or keyword',
    'আরও ফিল্টার':'More filters','বিষয়':'Topic','অবস্থা':'Status',
    'সব বিষয়':'All topics','সব প্রশ্ন':'All questions','বাকি প্রশ্ন':'Unanswered',
    'ভুল উত্তর':'Wrong answers','সঠিক উত্তর':'Correct answers','যাচাই প্রয়োজন':'Needs review',
    'উদ্দীপক':'Context','উত্তর যাচাই করো':'Check answer','উত্তর দেখো':'Reveal answer',
    'আবার চেষ্টা':'Try again','AI ব্যাখ্যা':'AI explanation','AI ইঙ্গিত':'AI hint',
    'প্রশ্ন সংরক্ষণ করো':'Bookmark question','সংরক্ষণ সরাও':'Remove bookmark',
    'সংরক্ষিত':'Saved','সংরক্ষণ':'Save','প্রশ্নে প্রশ্নে শিখি':'ONE STEP AT A TIME',
    'প্রশ্ন সূচি':'Question navigator','আগের':'Previous','পরের প্রশ্ন':'Next question',
    'দারুণ! সঠিক উত্তর।':'Correct! Well done.','উত্তরটা মিলিয়ে দেখো।':'Review your answer.',
    'সঠিক উত্তর':'Correct answer','ভুল উত্তর':'Incorrect answer',
    'এই প্রশ্নের উৎস যাচাই প্রয়োজন। যাচাইয়ের আগে উত্তর ও স্কোর দেখানো হচ্ছে না।':'This source question needs review. Answer checking and scoring are unavailable.',
    'মডেল টেস্ট জমা দেওয়ার পর AI ব্যাখ্যা দেখা যাবে।':'AI explanations are available after you submit the exam.',
    'টেস্ট চলাকালীন উত্তর ও AI ব্যাখ্যা লুকানো থাকবে। জমা দিলে দেখতে পারবে।':'Answers and AI explanations are hidden until the exam is submitted.',
    'নিজের প্রস্তুতি যাচাই করো।':'Check your preparation.',
    'একটি টেস্ট চলছে':'An exam is in progress','চালিয়ে যাও':'Resume exam',
    'আগের টেস্টের ফলাফল আছে':'Your previous exam result is available','ফলাফল দেখো':'View results',
    'কতটি প্রশ্নে পরীক্ষা দেবে?':'Choose your exam length',
    'অধ্যায় মিলিয়ে র‍্যান্ডম প্রশ্ন। জমা দেওয়ার আগে সঠিক উত্তর দেখা যাবে না।':'Random questions from all chapters. Answers stay hidden until you submit.',
    'প্রশ্নের সংখ্যা':'Number of questions','টেস্ট শুরু করো':'Start exam',
    'সময়সীমা নেই · জমার পর ফলাফল ও AI ব্যাখ্যা':'No time limit · Results and AI explanations after submission',
    'টেস্টের ফলাফল':'Exam results','টেস্ট জমা দাও':'Submit exam','নতুন টেস্ট':'New exam',
    'টেস্ট শেষ। এবার দেখে শেখো।':'Exam complete. Review and learn.',
    'তোমার স্কোর':'Your score','সঠিক':'Correct','ভুল':'Incorrect','উত্তর বাকি':'Skipped',
    'সব উত্তর':'All answers','ভুলগুলো':'Incorrect','সঠিকগুলো':'Correct',
    'উত্তর না বলে ধারণা দেবে':'A clue without the answer','প্রশ্নের সহজ বাংলা ব্যাখ্যা':'An easy explanation of the question',
    'AI থেকে ইঙ্গিত':'Get an AI hint','AI সাহায্য তৈরি করছে…':'Preparing AI help…',
    'AI-এর উত্তরে ভুল থাকতে পারে। পাঠ্যবইয়ের সাথে মিলিয়ে নাও।':'AI can make mistakes. Verify important answers against your textbook.',
    'উত্তর তৈরি হচ্ছে…':'Preparing an answer…','AI লিখছে…':'AI is writing…',
    'AI সেবা সংযুক্ত নেই। পরে আবার চেষ্টা করো।':'AI service is not configured. Please try later.',
    'একটু বিরতি দিয়ে আবার চেষ্টা করো।':'Please wait a moment and try again.',
    'AI সেবা এখন সাড়া দিচ্ছে না। পরে আবার চেষ্টা করো।':'AI is not responding right now. Please try again later.',
    'ব্যাখ্যা পাওয়া যায়নি। আবার চেষ্টা করো।':'No explanation was returned. Please retry.',
    'সময় বেশি লাগছে। আবার চেষ্টা করো।':'The request timed out. Please try again.',
    'সংযোগ পাওয়া যায়নি। ইন্টারনেট দেখে আবার চেষ্টা করো।':'Connection failed. Check your internet and retry.',
    'প্রশ্ন সংরক্ষণ করা হয়েছে':'Question bookmarked','সংরক্ষিত তালিকা থেকে সরানো হয়েছে':'Bookmark removed',
    'সঠিক উত্তর!':'Correct answer!','উত্তরটি মিলিয়ে দেখো।':'Review the answer.',
    'এই ফিল্টারে প্রশ্ন পাওয়া যায়নি':'No questions match these filters',
    'কোনো প্রশ্ন সংরক্ষিত নেই':'No saved questions yet',
    'যেকোনো প্রশ্নের বুকমার্ক চিহ্নে চাপ দাও।':'Use the bookmark icon on any question.',
    'অন্য অধ্যায় বা ফিল্টার বেছে নাও।':'Try another chapter or filter.',
    'সব অনুশীলন দেখো':'See all practice','সব উত্তর দেখো':'See all answers',
    'নতুন টেস্ট শুরু করবে?':'Start a new exam?',
    'চলমান টেস্টের উত্তর মুছে নতুন প্রশ্ন নেওয়া হবে।':'This will replace your current unfinished exam.',
    'টেস্ট জমা দেবে?':'Submit this exam?',
    'জমা দেওয়ার পর ফলাফল ও সঠিক উত্তর দেখা যাবে।':'You can see your results and correct answers after submission.',
    'জমা দাও':'Submit','অগ্রগতি মুছুন':'Reset progress',
    'অনুশীলনের অগ্রগতি মুছবে?':'Reset practice progress?',
    'সেভ করা উত্তর ও দেখা উত্তর মুছে যাবে। সংরক্ষিত প্রশ্ন ও টেস্ট থাকবে।':'Your practice answers and revealed answers will be cleared. Bookmarks and exams remain.',
    'অনুশীলনের অগ্রগতি মুছে দেওয়া হয়েছে':'Practice progress was reset',
    'ব্রাউজারে সেভ করা যাচ্ছে না। এই ট্যাবেই চর্চা চালিয়ে যেতে পারো।':'Saving is unavailable. You can continue studying in this tab.',
    'প্রশ্ন প্রস্তুত হচ্ছে…':'Preparing question…','AI দিয়ে পূর্ণ ব্যাখ্যা দেখো':'See full AI explanation',
    'AI থেকে উত্তর ছাড়া ইঙ্গিত নাও':'Get an AI hint without revealing the answer',
    'বাংলা':'Bangla','English':'English',
    'আগের':'Previous','পরের প্রশ্ন':'Next question','উত্তর':'answers',
    'সম্পন্ন':'completed','সংরক্ষণ করা হয়েছে':'Saved successfully',
    'অধ্যায়':'Chapter','উত্তর দিয়েছ':'Answers submitted'
  };
  const substitutions = [
    [/^(\d+|[০-৯]+)টি অধ্যায়$/, '$1 chapters'],
    [/^(\d+|[০-৯]+)টি প্রশ্ন$/, '$1 questions'],
    [/^(\d+|[০-৯]+)টি উত্তর$/, '$1 answers'],
    [/^(\d+|[০-৯]+)টি সম্পন্ন$/, '$1 completed'],
    [/^(\d+|[০-৯]+)টি$/, '$1'],
    [/^প্রশ্ন (\d+|[০-৯]+)$/, 'Question $1'],
    [/^(.+?)টি উত্তর দিয়েছ$/, '$1 answered'],
    [/^(.+?)টি প্রশ্ন · (.+)$/, '$1 questions · $2'],
    [/^(\d+|[০-৯]+)% সঠিক$/, '$1% accuracy'],
    [/^(.+?)টি প্রশ্নের উত্তর বাকি। জমা দেওয়ার পর উত্তর বদলানো যাবে না।$/, '$1 questions are unanswered. You cannot change answers after submitting.']
  ];
  const digits = v => String(v).replace(/[০-৯]/g, c=> '০১২৩৪৫৬৭৮৯'.indexOf(c));
  function translated(value) {
    const original = String(value), trimmed = original.trim();
    if (!trimmed) return original;
    let out = dictionary[trimmed];
    if (out === undefined) {
      for (const [pattern, replacement] of substitutions) { if(pattern.test(trimmed)) { out=trimmed.replace(pattern,replacement); break; } }
    }
    if(out === undefined && /[\u0980-\u09FF]/.test(trimmed)) {
      // UI strings containing a dynamic count or decorative arrow, e.g. 0 / ৫২টি সম্পন্ন.
      out = trimmed;
      const fragments = [
        ['টি সম্পন্ন',' completed'],['টি উত্তর',' answers'],['টি প্রশ্ন',' questions'],
        ['পরের প্রশ্ন','Next question'],['আগের','Previous'],['উত্তর বাকি','Unanswered'],
        ['সঠিক উত্তর','Correct answer'],['প্রশ্নের উত্তর','questions answered'],
        ['অধ্যায়','Chapter'],['প্রশ্ন','Question'],['টেস্ট','Exam'],['সমাপ্ত','complete']
      ];
      for(const [src,dst] of fragments)out=out.replaceAll(src,dst);
      if(out===trimmed)out=undefined;
    }
    if(out === undefined) return /^[\s\d০-৯%/.:-]+$/.test(original)?digits(original):original;
    const leading=original.match(/^\s*/)?.[0]||'', trailing=original.match(/\s*$/)?.[0]||'';
    return leading + digits(out) + trailing;
  }
  let observer, busy=false;
  function translateElement(root=document.body) {
    if (!root || UX.lang !== 'en') return;
    const shouldSkip = e => !!(e?.closest?.('.question-title,.option-text,.stimulus .source-text,.answer-source,.raw-question'));
    function walk(element) {
      if (element.nodeType===3) {
        const p=element.parentElement;
        if(!p || shouldSkip(p) || p.closest('script,style'))return;
        if(element.__langOriginal===undefined) element.__langOriginal=element.nodeValue;
        const newValue=translated(element.__langOriginal);
        if (newValue!==element.nodeValue) element.nodeValue=newValue;
      } else if (element.nodeType===1) {
        for(const name of ['aria-label','title','placeholder']) {
          if(element.hasAttribute(name)) {
            const orig='__original_'+name;
            if(element[orig]===undefined)element[orig]=element.getAttribute(name);
            const val=translated(element[orig]);if(val!==element.getAttribute(name))element.setAttribute(name,val);
          }
        }
        for(const child of Array.from(element.childNodes))walk(child);
      }
    }
    busy=true;try{walk(root);}finally{busy=false;}
  }
  function restoreElement(root=document.body) {
    if(!root)return;
    function walk(n) {
      if(n.nodeType===3 && n.__langOriginal!==undefined){if(n.nodeValue!==n.__langOriginal)n.nodeValue=n.__langOriginal;}
      else if(n.nodeType===1){for(const name of ['aria-label','title','placeholder']){const o=n['__original_'+name];if(o!==undefined)n.setAttribute(name,o);}for(const ch of Array.from(n.childNodes))walk(ch);}
    }
    busy=true;try{walk(root);}finally{busy=false;}
  }
  const chapterEn = {
    ch1:{name:'Information & Communication Technology',label:'Chapter 1',short:'World & Bangladesh',detail:'Global village · AI · Robotics'},
    ch3:{name:'Number Systems & Digital Logic',label:'Chapter 3',short:'Number systems',detail:'Conversions · Logic gates'},
    db:{name:'Database Management',label:'Database',short:'Database',detail:'SQL · Tables · Relations'}
  };
  const topicEn = {
    'ICT: বিশ্ব ও বাংলাদেশ':'ICT: World & Bangladesh','সংখ্যা পদ্ধতি ও রূপান্তর':'Number systems & conversions',
    'ডেটাবেজ':'Database','ডেটাবেজ ম্যানেজমেন্ট':'Database Management'
  };
  const letterEn = {'ক':'A','খ':'B','গ':'C','ঘ':'D','ঙ':'E'};
  const translationCache = (()=>{try{return JSON.parse(localStorage.getItem('ictUX:englishQuestions')||'{}')||{};}catch{return {};}})();
  const failed = {};
  const pending = new Map();
  const optionLetter = letter => UX.lang==='en' ? (letterEn[letter]||letter) : letter;
  const getChapter = (id, source) => UX.lang==='en' && chapterEn[id] ? {...source, ...chapterEn[id]} : source;
  function englishView(q) {
    if(UX.lang!=='en')return q;
    const value=translationCache[q.id];
    if(value && value.source===q.question) {
      return {...q,question:value.question,stimulus:value.stimulus||'',topic:topicEn[q.topic]||value.topic||q.topic,options:q.options.map((o,i)=>({...o,text:value.options[i]??o.text})),stimulusTable:value.stimulusTable||q.stimulusTable,_translated:true};
    }
    if(failed[q.id])return {...q,topic:topicEn[q.topic]||'ICT',_translationFailed:true};
    return {...q,question:'Preparing English question…',stimulus:'',topic:topicEn[q.topic]||'ICT',options:q.options.map(o=>({...o,text:'Translating option…'})),_translating:true};
  }
  function parseTranslation(response,q) {
    let text=String(response||'').trim();
    const match=text.match(/\{[\s\S]*\}/);if(!match)throw new Error('No structured translation was returned');
    const parsed=JSON.parse(match[0]);
    if(typeof parsed.question!=='string'||!parsed.question.trim()||!Array.isArray(parsed.options)||parsed.options.length!==q.options.length||parsed.options.some(v=>typeof v!=='string'||!v.trim()))throw new Error('Translation had missing fields');
    if(/[\u0980-\u09FF]/.test(parsed.question+parsed.options.join('')))throw new Error('Translation is not fully in English');
    return {source:q.question,question:parsed.question.trim(),stimulus:typeof parsed.stimulus==='string'?parsed.stimulus:'',options:parsed.options.map(v=>v.trim()),topic:typeof parsed.topic==='string'?parsed.topic:'',stimulusTable:parsed.stimulusTable};
  }
  async function ensureEnglish(q,onReady) {
    if(UX.lang!=='en'||translationCache[q.id] && translationCache[q.id].source===q.question||failed[q.id])return;
    if(pending.has(q.id))return;
    const endpoint=window.EXPLAIN_API_URL;
    if(!endpoint){failed[q.id]='Translation service not configured';onReady?.();return;}
    const full=`Translate this ICT multiple-choice question faithfully from Bengali to English. Do not solve it, do not explain it, do not reveal the correct option. Preserve all formulas, identifiers, symbols and technical values exactly. Respond with exactly one JSON object, no markdown: {"question":"English question","stimulus":"English context or empty string","topic":"English topic","options":["option 1","option 2",...]} . The options array MUST have exactly ${q.options.length} strings in the original order.\nBengali question: ${q.question}\nContext: ${q.stimulus||''}\nTopic: ${q.topic||''}\nOptions: ${JSON.stringify(q.options.map(o=>o.text))}`;
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),25000);
    const work=(async()=>{
      try{
        const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:full,questionId:q.id}),signal:controller.signal});
        if(!r.ok)throw new Error('Translation request failed');
        const data=await r.json();const parsed=parseTranslation(data.explanation,q);
        translationCache[q.id]=parsed;
        try{localStorage.setItem('ictUX:englishQuestions',JSON.stringify(translationCache));}catch{}
      } catch(e) {failed[q.id]=e.message||'Translation unavailable';}
      finally {clearTimeout(timer);pending.delete(q.id);if(UX.lang==='en')onReady?.();}
    })();pending.set(q.id,work);
  }
  function retryEnglish(q,onReady){delete failed[q.id];ensureEnglish(q,onReady);}
  const UX={lang,theme:mode, translated, translateElement, restoreElement, chapter:getChapter, topic: (topic)=>UX.lang==='en'?(topicEn[topic]||'ICT topic'):topic,optionLetter,englishView,ensureEnglish,retryEnglish,failed, searchText:(q)=>translationCache[q.id]?[translationCache[q.id].question,...translationCache[q.id].options,translationCache[q.id].stimulus].join(' '):''};
  window.UX=UX;
  function refreshLabels(){
    const b=document.getElementById('languageBtn'),t=document.getElementById('themeBtn');
    if(b){b.textContent=UX.lang==='bn'?'EN':'BN';b.setAttribute('aria-label',UX.lang==='bn'?'Switch website to English':'ওয়েবসাইট বাংলায় দেখাও');b.title=UX.lang==='bn'?'English':'বাংলা';}
    if(t){t.innerHTML=UX.theme==='dark'?'☀':'☾';t.setAttribute('aria-label',UX.theme==='dark'?'Switch to light mode':'Switch to dark mode');t.setAttribute('aria-pressed',String(UX.theme==='dark'));t.title=UX.theme==='dark'?'Light theme':'Dark theme';}
    const modeMeta=document.querySelector('meta[name="theme-color"]');if(modeMeta)modeMeta.content=UX.theme==='dark'?'#0d1427':'#f7f8ff';
  }
  UX.refresh=()=>{UX.lang==='en'?translateElement():restoreElement();refreshLabels();};
  UX.setLanguage=next=>{
    if(UX.lang===next)return; UX.lang=next;document.documentElement.lang=next;persist('ictUX:language',next);
    if(document.getElementById('explainDialog')?.open)document.getElementById('explainDialog').close();
    if(typeof render==='function' && typeof state!=='undefined'&&state.loaded)render();
    UX.refresh();
  };
  UX.setTheme=next=>{
    UX.theme=next;document.documentElement.dataset.theme=next;persist('ictUX:theme',next);refreshLabels();
    window.dispatchEvent(new CustomEvent('ict:theme'));
  };
  document.addEventListener('DOMContentLoaded',()=>{
    document.getElementById('languageBtn')?.addEventListener('click',()=>UX.setLanguage(UX.lang==='bn'?'en':'bn'));
    document.getElementById('themeBtn')?.addEventListener('click',()=>UX.setTheme(UX.theme==='dark'?'light':'dark'));
    UX.refresh();
    observer=new MutationObserver(records=>{
      if(busy||UX.lang!=='en')return;
      for(const rec of records){
        if(rec.type==='childList')for(const node of rec.addedNodes){if(node.nodeType===1||node.nodeType===3)translateElement(node);}
        else if(rec.type==='characterData' && rec.target.nodeType===3){translateElement(rec.target);}
      }
    });observer.observe(document.body,{subtree:true,childList:true});
  });
})();
