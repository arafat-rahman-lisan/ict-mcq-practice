// Run: node tests/check.cjs (Node.js 18+)
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'data/mcqs.json'),'utf8'));
assert.equal(data.mcqs.length,277);
assert.equal(new Set(data.mcqs.map(q=>q.id)).size,277);
const audit=JSON.parse(fs.readFileSync(path.join(root,'data/text-corrections-audit.json'),'utf8'));
assert(audit.every(row=>!row.changes.correctLetter),'Original answer letters must remain unchanged');
for(const q of data.mcqs){assert.equal(q.question,q.question.normalize('NFC'));assert(!/\uFFFD/.test(q.question));if(!q.needsReview){assert(q.options.length>=2);assert(q.options.some(o=>o.label===q.correctLetter));}assert(q.options.every(o=>!o.text.includes('উদ্দীপ টি')),'Merged context left in an option');}
const elements=new Map();const storage=new Map();
function el(id){if(!elements.has(id))elements.set(id,{textContent:'',innerHTML:'',hidden:false,open:false,value:'',disabled:false,addEventListener(){},setAttribute(){},classList:{toggle(){return false}},focus(){},showModal(){this.open=true},close(){this.open=false}});return elements.get(id);}
const context=vm.createContext({console,document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){},documentElement:{classList:{toggle(){return false}}}},window:{innerWidth:1280,addEventListener(){},EXPLAIN_API_URL:'https://example.invalid/explain'},location:{hash:''},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},setTimeout,clearTimeout,setInterval(){},AbortController,fetch:async()=>({ok:true,json:async()=>({explanation:'পরীক্ষামূলক ব্যাখ্যা'})})});
let code=fs.readFileSync(path.join(root,'script.js'),'utf8');code=code.slice(0,code.lastIndexOf('init().catch'));
vm.runInContext(code,context);context.fixture=data;
vm.runInContext('state.questions=fixture.mcqs;state.chapters=fixture.chapters;',context);
const run=code=>vm.runInContext(code,context);
const sample=data.mcqs.find(q=>q.id==='ch1-001');
context.sample=sample;
assert(!run("promptFor(sample,'hint')").includes('উৎসের উত্তর:'),'Pre-answer AI prompt must exclude answer key');
assert(run("promptFor(sample,'full')").includes('উৎসের উত্তর:'),'Post-answer AI prompt includes answer for explanation');
run("state.view='practice';state.answers={};state.revealed=[];");
assert(run('renderQuestion(sample)').includes('data-action="ai-hint"'),'AI hint must be available before answering');
run("state.answers={'ch1-001':'ঘ'};");
assert(run('renderQuestion(sample)').includes('data-action="explain"'),'Full AI explanation available after answering');
run("state.view='examRun';state.exam={answers:{},submitted:false};");
assert(!run('renderQuestion(sample)').includes('data-action="explain"'),'AI must stay hidden during exam');
run("state.view='practice';state.exam={};");
for(const size of [20,50,100])for(let n=0;n<20;n++){const ids=Array.from(run(`sampleExam(${size})`));assert.equal(ids.length,size);assert.equal(new Set(ids).size,size);assert(ids.every(id=>data.mcqs.some(q=>q.id===id&&!q.needsReview)));const counts=data.chapters.map(c=>ids.filter(id=>data.mcqs.find(q=>q.id===id).chapterId===c.id).length);assert(Math.max(...counts)-Math.min(...counts)<=1);}
run("state.answers={};state.revealed=['ch1-001'];");assert.equal(run('stats().answered'),0,'Revealed answers must not count as attempts');
run("state.answers={'ch1-001':'ঘ'}");assert.equal(run('stats().correct'),1);
run("state.chapter='db';state.topic='all';state.status='all';state.search='নির্দিষ্ট';");assert(run('practicePool().length')>0);assert(run("practicePool().every(q=>q.chapterId==='db'&&!q.needsReview)"));
run("state.chapter='all';state.search='';state.status='review';");assert.equal(run('practicePool().length'),118);
assert.equal(run('escapeHtml("<script>&")'),'&lt;script&gt;&amp;');
storage.set('ictMcqMultiV1:broken','{bad json');assert.equal(run("readStore('broken',false)"),false);
(async()=>{assert.equal(await run("callExplainApi('test','ch1-001')"),'পরীক্ষামূলক ব্যাখ্যা');context.fetch=async()=>({ok:false,status:429,json:async()=>({})});await assert.rejects(run("callExplainApi('test','ch1-001')"),/বিরতি/);context.fetch=async()=>({ok:true,json:async()=>({})});await assert.rejects(run("callExplainApi('test','ch1-001')"),/পাওয়া যায়নি/);console.log('PASS: 277 records, unchanged keys, Unicode, 60 balanced exams, review exclusion, scoring, search, malformed storage, API success/rate-limit/empty response.');})();
