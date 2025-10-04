const $ = (s)=>document.querySelector(s);
const urlParams = new URLSearchParams(location.search);
const setId = urlParams.get('set') || '1';

let questions = [];
let order = [];
let optionOrders = {};
let current = 0;
let selected = {};
let timerSec = 60*60;
let tick;

init();

async function init(){
  try{
    const mod = await import(`./questions/questions${setId}.js`);
    questions = (mod.default || []).map(q=>({...q}));
  }catch(e){
    alert('Không tải được đề này. Hãy kiểm tra questions' + setId + '.js');
    return;
  }
  if(!questions.length){
    $('#quiz').innerHTML = '<p class="muted">Đề này chưa có câu hỏi.</p>';
    return;
  }
  order = Array.from(questions.keys());
  order.forEach(i=>{
    const idxs = [0,1,2,3];
    idxs.sort(()=>Math.random()-0.5);
    optionOrders[i] = idxs;
  });
  $('#backBtn').addEventListener('click', goBack);
  $('#submitBtn').addEventListener('click', submitExam);
  $('#retryWrongBtn').addEventListener('click', retryWrong);
  updateProgress();
  renderQuestion();
  tick = setInterval(()=>{
    timerSec--;
    if (timerSec<=0){ clearInterval(tick); submitExam(); return; }
    $('#timer').textContent = formatTime(timerSec);
  },1000);
  $('#timer').textContent = formatTime(timerSec);
}
function formatTime(sec){
  const m = Math.floor(sec/60).toString().padStart(2,'0');
  const s = (sec%60).toString().padStart(2,'0');
  return `${m}:${s}`;
}
function renderQuestion(){
  const i = order[current];
  const q = questions[i];
  const shuffledIdx = optionOrders[i];
  const opts = shuffledIdx.map((origIdx, pos)=>({
    text: q.options[origIdx],
    orig: origIdx+1
  }));
  const chosen = selected[i] || null;
  const html = `
    <div class="card">
      <div class="qtext"><b>${q.question}</b></div>
      <div class="options">
        ${opts.map((o,idx)=>`
          <label class="opt">
            <input type="radio" name="q${i}" value="${o.orig}" ${chosen==o.orig?'checked':''} />
            <span>${o.text}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `;
  $('#quiz').innerHTML = html;
  document.querySelectorAll(`input[name="q${i}"]`).forEach(inp=>{
    inp.addEventListener('change', (ev)=>{
      selected[i] = parseInt(ev.target.value,10);
      if (current < order.length-1){
        current++; updateProgress(); renderQuestion();
      } else {
        $('#submitBtn').classList.add('pulse');
      }
    });
  });
  $('#backBtn').disabled = current===0;
}
function updateProgress(){ $('#progress').textContent = `Câu ${current+1}/${order.length}`; }
function goBack(){ if (current>0){ current--; updateProgress(); renderQuestion(); } }
function submitExam(){
  clearInterval(tick);
  let score = 0;
  let wrongIdxs = [];
  order.forEach(i=>{
    const ans = questions[i].answer;
    const sel = selected[i];
    if (sel===ans) score++; else wrongIdxs.push(i);
  });
  let out = `<h2>Bạn làm đúng ${score}/${order.length}</h2>`;
  order.forEach(i=>{
    const q = questions[i];
    out += `<div class="card">
      <div class="qtext"><b>${q.question}</b></div>
      <div class="options review">
        ${q.options.map((opt,k)=>{
          const num = k+1;
          const isCorrect = (num===q.answer);
          const isChosen = (selected[i]===num);
          const cls = isCorrect ? 'correct' : (isChosen ? 'incorrect' : '');
          const mark = isCorrect ? '✅' : (isChosen ? '❌' : '');
          return `<div class="opt ${cls}">${num}. ${opt} ${mark}</div>`;
        }).join('')}
      </div>
      ${q.translation ? `<div class="translation"><i>${q.translation}</i></div>`:''}
      ${q.explanation ? `<div class="explain"><small>${q.explanation}</small></div>`:''}
    </div>`;
  });
  $('#app').innerHTML = `<div class="results">${out}
      <div class="center"><a class="btn" href="index.html">Trang chủ</a></div>
    </div>`;
  const btn = document.getElementById('retryWrongBtn');
  if (wrongIdxs.length){
    btn.classList.remove('hidden');
    btn.dataset.wrong = JSON.stringify(wrongIdxs);
  }
}
function retryWrong(){
  const wrong = JSON.parse(this.dataset.wrong || '[]');
  if (!wrong.length) return;
  questions = wrong.map(i=>questions[i]);
  order = Array.from(questions.keys());
  optionOrders = {};
  order.forEach(i=>{
    const idxs = [0,1,2,3];
    idxs.sort(()=>Math.random()-0.5);
    optionOrders[i] = idxs;
  });
  current = 0; selected = {}; timerSec = 20*60;
  document.getElementById('app').innerHTML = `
    <div id="meta" class="meta">
      <div id="progress" class="progress">Câu 0/0</div>
      <div id="timer" class="timer">20:00</div>
    </div>
    <div id="quiz"></div>
    <div id="nav" class="nav">
      <button class="btn" id="backBtn">◀ Quay lại</button>
      <button class="btn primary" id="submitBtn">Nộp bài</button>
    </div>`;
  document.getElementById('retryWrongBtn').classList.add('hidden');
  document.getElementById('backBtn').addEventListener('click', goBack);
  document.getElementById('submitBtn').addEventListener('click', submitExam);
  updateProgress(); renderQuestion();
  clearInterval(tick);
  tick = setInterval(()=>{
    timerSec--;
    if (timerSec<=0){ clearInterval(tick); submitExam(); return; }
    document.getElementById('timer').textContent = formatTime(timerSec);
  },1000);
  document.getElementById('timer').textContent = formatTime(timerSec);
}
