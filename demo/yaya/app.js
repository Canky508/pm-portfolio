'use strict';

// 无构建依赖；内容、页面与交互集中在此，便于首轮设计评审。
const $ = s => document.querySelector(s);
const icons = {
  home: '<path d="m3 10 9-7 9 7v10h-6v-7H9v7H3z"/>',
  book: '<path d="M12 5C8 2 3 4 3 4v15s5-2 9 1c4-3 9-1 9-1V4s-5-2-9 1zm0 0v15"/>',
  check: '<path d="m6 12 4 4 8-9"/>',
  circle: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  back: '<path d="m15 5-7 7 7 7"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  bell: '<path d="M5 17h14l-2-4V9a5 5 0 0 0-10 0v4zm5 3h4"/>',
  calendar: '<rect x="4" y="5" width="16" height="16" rx="3"/><path d="M8 3v5m8-5v5m-9 7 3 3 5-6"/>',
  chart: '<path d="m3 16 5-5 5 3 7-9M3 21V3m0 18h18"/>',
  sound: '<path d="m10 5-5 4H2v6h3l5 4zm4 3a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  play: '<path d="m8 5 11 7-11 7z"/>',
  pause: '<path d="M8 5v14m8-14v14"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',
  leaf: '<path d="M5 19C2 5 12 3 21 3c0 9-3 19-16 16Zm0 0L16 8"/>',
  refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6 7a7 7 0 0 1 12-2l2 7M4 12l2 7a7 7 0 0 0 12-2"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>'
};
const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.book}</svg>`;
const mascot = options => window.yayaMascot(options);
document.body.classList.toggle('studio-mode', new URLSearchParams(location.search).get('studio') === '1');
let motionEnabled = true;
try { motionEnabled = localStorage.getItem('yaya-motion') !== 'off'; } catch { /* 使用默认偏好 */ }
document.body.classList.toggle('motion-off', !motionEnabled);
let greetingTimer;
let greetingResetTimer;
let greetingCount = 0;
const greetingLines = [
  '我在呢，一起翻开下一页吧。',
  '读懂一点点，也是在往前走。',
  '今天的线索，藏在故事里。',
  '不着急，我们慢慢读。'
];
const storageKey = 'yaya-prototype-v1';
const emptyRecord = () => ({first: {}, completed: false, quiz: {}, stage: 'hook', reviewDay: 1});
let record;
try { record = {...emptyRecord(), ...JSON.parse(localStorage.getItem(storageKey) || 'null')}; } catch { record = emptyRecord(); }
if (!record.first || typeof record.first !== 'object' || Array.isArray(record.first)) record.first = {};
if (!record.quiz || typeof record.quiz !== 'object' || Array.isArray(record.quiz)) record.quiz = {};
function save() { try { localStorage.setItem(storageKey, JSON.stringify(record)); } catch { /* file:// 隐私模式仍可继续体验 */ } }
function firstAnswer(dimension, correct) {
  if (!Object.hasOwn(record.first, dimension)) record.first[dimension] = correct;
  save();
}
const stages = [
  ['home', '首页', '从一个故事开始'], ['stories', '故事目录', '六话连续悬疑'],
  ['comic', '英文漫画', '听、读、点词'], ['meaning', '主动回忆', '词义 / 拼写 / 搭配'],
  ['reading', '考场阅读', '从语境到学术语言'], ['result', '学习结果', '四维掌握记录'],
  ['review', '延迟复习', 'D1 / D3 / D7']
];
const notes = {
  home: ['今天，从好奇心开始', '让下一段剧情成为学习的理由。奶油白承接信息，暖黄只留给线索和关键行动。', ['点故事封面，进入第一话的悬念', '点今日复习，体验不同时间的提示强度', '底部导航可切换首页、故事和复习']],
  stories: ['一个故事，六次推进', '只保留一条连续叙事主线，不让用户在频道、题库和学习模式之间反复做选择。', ['第一话开放，可随时重读', '后续话仅展示标题，尚无正式内容', '锁定状态不伪装成可用课程']],
  hook: ['先有一个想知道的答案', '不先摊开词表。一个异常样本、一句悬念，把用户带进英文语境。', ['点击“开始故事”触发浏览器配音', '预计时长仅为正式课程设计目标', '当前漫画为角色立绘合成示意']],
  comic: ['英文在前，帮助在手边', '连续纵向分镜、可点击的真实文本层。芽芽不进入严肃剧情，只在学习辅助时出现。', ['点黄色词块，先猜语境义', '点气泡空白，查看翻译和句子结构', '打开弹层暂停，只有被打断时才自动恢复']],
  meaning: ['把“眼熟”变成真正想起', '同一个场景中的表达，逐步完成词义、拼写与搭配。只记录首次作答，不被反复试答案覆盖。', ['选项提交后才展示解析', '字母块不唤起键盘，可撤销重排', '答错仍可继续，但结果保留首次表现']],
  reading: ['画面退场，理解留下', '把同一条科学逻辑换成原创学术短文。撤去漫画和默认中文，让所学迁移到篇章。', ['阅读原文后进入 3 道单选题', '答题过程中可随时返回文章', '提交后才解锁解析和芽芽答疑']],
  result: ['如实反馈，而非虚假分数', '结果对应一个示例表达的四项首次作答，不虚构雅思分数，也不把看过等同于掌握。', ['四项全对为本轮掌握，三项为学习中', '不足三项正确进入重点复习', '未完成训练时显示待完成，不生成假成绩']],
  review: ['记住，是隔一阵还能想起', '从画面提示到新语境逐步撤除支架。这里提供 D1、D3、D7 的独立样例，不模拟真实到期。', ['切换时间标签，比较提示强度', '复习答题与本轮首次记录分开', '正式提醒需后端调度，本原型不推送']]
};
let route = 'home';
let quizIndex = 0;
let selected = null;
let spelling = [];
let phrase = [];
let spellSubmitted = false;
let phraseSubmitted = false;
let reviewDay = [1, 3, 7].includes(record.reviewDay) ? record.reviewDay : 1;
let reviewStarted = false;
let reviewAnswer = null;
let reviewDone = false;
let sheetStack = [];
let focusBeforeSheet = null;
let toastTimer;
const syllables = ['d', 'e', 'n', 'i', 'v', 'e', 'c', 'e'];
const phraseBank = ['of', 'evidence'];
const questionData = [
  {q: 'The passage mainly discusses ________.', options: ['how to find life on Mars', 'why sample control is important', 'the design of Mars research stations', 'the possibility of life on Earth'], answer: 1, explain: '全文围绕样本污染及其控制展开。寻找生命是背景，不是文章的主要讨论内容。'},
  {q: 'Why do researchers analyse control materials?', options: ['To increase the number of discoveries', 'To replace samples from Mars', 'To check whether other factors explain a result', 'To expose the sample to air'], answer: 2, explain: '对照材料用于检查其他可能原因，帮助排除污染，而不是用来增加“发现”的数量。'},
  {q: 'In “potential evidence of ancient life”, evidence of is closest in meaning to ________.', options: ['proof suggesting the existence of', 'a reason for creating', 'a method of protecting', 'the final result of destroying'], answer: 0, explain: 'evidence of 表示“……存在的证据”。potential 提醒我们：它只是潜在证据，并不意味着已经证实火星上曾有生命。'}
];
const dialogue = [
  ['Mina', 'This sample came from two metres beneath the surface.', '这个样本来自地表以下两米深的地方。', 'beneath the surface'],
  ['Leo', 'Then it may contain evidence of ancient life.', '那么，它可能含有古代生命存在的证据。', 'evidence of'],
  ['Mina', 'The sensor has detected an organic gas.', '传感器探测到了一种有机气体。', 'detected'],
  ['Leo', 'That is exciting—but it is only potential evidence.', '这令人兴奋——但它只是潜在的证据。', 'potential'],
  ['Mina', 'Someone opened the storage chamber last night.', '昨晚有人打开了储存舱。', ''],
  ['Leo', 'If the tube was exposed to Earth air, the result may be useless.', '如果样本管接触过地球空气，这个结果可能就没有用了。', 'exposed to'],
  ['Mina', 'Let’s analyse the data before we accuse anyone.', '在指责任何人之前，我们先分析一下数据。', 'analyse the data'],
  ['Leo', 'Agreed. We must rule out contamination first.', '同意。我们必须先排除污染的可能。', 'rule out'],
  ['Mina', 'Wait. The rover did collect a sample, but this is not the tube it sent.', '等等，探测车确实采集了样本，但这不是它送来的那一管。', 'collect a sample'],
  ['Leo', 'Then the real sample is missing.', '那么，真正的样本失踪了。', '']
];
const terms = {
  'evidence of': ['evidence of', '/ˈevɪdəns əv/', '……的证据；……存在的迹象', '名词 evidence + 介词 of', 'The footprints are evidence of recent activity.'],
  'beneath the surface': ['beneath the surface', '/bɪˈniːθ ðə ˈsɜːfɪs/', '在地表之下', '介词短语；beneath 表示“在……下面”', 'Water may exist beneath the surface.'],
  detected: ['detect', '/dɪˈtekt/', '探测到；发现', '动词；detected 是过去式 / 过去分词', 'The device can detect small changes.'],
  potential: ['potential', '/pəˈtenʃl/', '潜在的；可能成为现实的', '形容词；这里修饰 evidence', 'The method has potential benefits.'],
  'exposed to': ['be exposed to', '/ɪkˈspəʊzd/', '暴露于；接触到', 'be + exposed + to + 接触的事物', 'The material must not be exposed to air.'],
  'analyse the data': ['analyse the data', '/ˈænəlaɪz ðə ˈdeɪtə/', '分析数据', '动词 analyse + 名词短语 the data', 'The team will analyse the data tomorrow.'],
  'rule out': ['rule out', '/ruːl aʊt/', '排除某种可能', '动词短语；常接原因、风险或解释', 'We cannot rule out a technical error.'],
  'collect a sample': ['collect a sample', '/kəˈlekt ə ˈsɑːmpl/', '采集样本', '动词 collect + 宾语 a sample', 'They collected a sample of the soil.']
};
const audio = { index: 0, playing: false, finished: false, utterance: null, token: 0, resumeAfterSheet: false };
const speechAvailable = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
function stopAudio() {
  audio.playing = false;
  audio.token++;
  if (speechAvailable) window.speechSynthesis.cancel();
  updatePlayer();
}
function playAudio() {
  if (!speechAvailable) { toast('当前浏览器不支持语音，请继续阅读漫画。'); return; }
  if (audio.finished) { audio.index = 0; audio.finished = false; }
  audio.playing = true;
  const token = ++audio.token;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(dialogue[audio.index][1]);
  utterance.lang = 'en-GB';
  utterance.rate = 0.88;
  const voice = window.speechSynthesis.getVoices().find(v => v.lang === 'en-GB');
  if (voice) utterance.voice = voice;
  audio.utterance = utterance;
  utterance.onend = () => {
    if (token !== audio.token || !audio.playing) return;
    if (audio.index < dialogue.length - 1) { audio.index++; playAudio(); }
    else { audio.finished = true; audio.playing = false; updatePlayer(); }
  };
  utterance.onerror = () => {
    if (token !== audio.token) return;
    stopAudio();
    toast('配音暂不可用，可点播放重试；不影响继续学习。');
  };
  updatePlayer();
  const panel = $(`#bubble-${audio.index}`);
  const scroller = $('.comic-scroll');
  if (panel && scroller) {
    const top = panel.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - 35;
    scroller.scrollTo({top: Math.max(0, top), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  }
  window.speechSynthesis.speak(utterance);
}
function updatePlayer() {
  const player = $('#player');
  if (!player) return;
  player.innerHTML = `<button class="icon-button" data-action="audio" aria-label="${audio.playing ? '暂停配音' : '播放配音'}">${icon(audio.playing ? 'pause' : audio.finished ? 'refresh' : 'play')}</button><div class="player-text">${audio.finished ? '本话配音已完成 · 点击重播' : `${audio.playing ? dialogue[audio.index][0] : '已暂停'} · ${audio.index + 1} / 10`}<small>浏览器合成配音 · 非正式人物音频</small><div class="progress-track"><i style="width:${(audio.index + (audio.finished ? 1 : 0)) * 10}%"></i></div></div>`;
  document.querySelectorAll('.bubble').forEach((bubble, i) => bubble.classList.toggle('playing', audio.playing && i === audio.index));
}
function speakWord(text) {
  if (!speechAvailable) return toast('当前浏览器不支持语音。');
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-GB'; u.rate = .8;
  u.onerror = () => toast('单词发音暂不可用，请稍后重试。');
  window.speechSynthesis.speak(u);
}
function toast(text) {
  $('#toast').textContent = text;
  $('#toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3300);
}
function greetingAllowed() { return route === 'home' && !document.hidden && !sheetStack.length; }
function resetGreeting() {
  clearTimeout(greetingResetTimer);
  const bubble = $('#yaya-bubble');
  if (bubble) bubble.hidden = true;
  const button = $('.mascot-button');
  if (button) button.innerHTML = mascot({mood:'reading',context:'greeting'});
  $('.greeting')?.classList.remove('has-yaya-message');
}
function showGreeting(force = false) {
  const button = $('.mascot-button');
  const bubble = $('#yaya-bubble');
  if (!button || !bubble || (!force && !greetingAllowed())) return;
  clearTimeout(greetingResetTimer);
  button.innerHTML = mascot({mood:'wave',context:'greeting'});
  bubble.textContent = greetingLines[greetingCount++ % greetingLines.length];
  bubble.hidden = false;
  $('.greeting')?.classList.add('has-yaya-message');
  greetingResetTimer = setTimeout(resetGreeting, 4600);
}
function scheduleGreeting(delay = 45000) {
  clearTimeout(greetingTimer);
  greetingTimer = setTimeout(() => {
    if (greetingAllowed()) showGreeting();
    scheduleGreeting();
  }, delay);
}
const actionButton = (text, action, style = 'primary', disabled = false) => `<button class="${style}" data-action="${action}" ${disabled ? 'disabled' : ''}>${text}</button>`;
function topbar(title, back = 'home', right = 'help') {
  return `<header class="topbar"><button class="icon-button" data-go="${back}" aria-label="返回">${icon('back')}</button><div class="bar-center">${title}</div><button class="icon-button" data-action="${right}" aria-label="页面说明">${icon('more')}</button></header>`;
}
function bottomNav(active) {
  return `<nav class="bottom-nav" aria-label="产品导航">${[['home','home','首页'],['stories','book','故事'],['review','circle','复习']].map(([id,ico,label]) => `<button class="${active === id ? 'active' : ''}" data-go="${id}">${icon(ico)}<span>${label}</span></button>`).join('')}</nav>`;
}
function stageProgress(stage) {
  return `<div class="stage-progress" aria-label="学习进度">${Array.from({length: 5}, (_, i) => `<i class="${i <= stage ? 'done' : ''}"></i>`).join('')}</div>`;
}
function footer(button, sub = '') { return `<footer class="stage-footer">${button}${sub ? `<p class="tiny">${sub}</p>` : ''}</footer>`; }
function homePage() {
  const completed = record.completed;
  return `<header class="topbar"><h2 class="home-wordmark">漫画学雅思<svg class="wordmark-sprout" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 14C2 14 2 4 5 4c5 0 7 5 7 10Zm0 0c0-8 5-12 9-10 2 5-2 10-9 10Z"/><path d="M12 13c1 5-2 8-6 9"/></svg></h2><div class="home-tools"><button class="icon-button" data-action="notifications" aria-label="复习提醒">${icon('bell')}</button><button class="icon-button" data-action="help" aria-label="原型菜单与动效设置">${icon('more')}</button></div></header>
  <div class="scroll page-padding">
    <div class="greeting"><p class="overline">Hi, 很高兴又见到你</p><h1>今天，和芽芽一起<br>读懂<span>一个好故事。</span></h1><p class="subtitle">不用急着记住每个词，<br>先跟着好奇心走。</p><div class="yaya-bubble" id="yaya-bubble" aria-live="polite" hidden></div><button class="mascot-button" data-action="greet-yaya" aria-label="和芽芽打个招呼">${mascot({mood:'reading',context:'greeting'})}</button></div>
    <button class="story-card" data-action="continue"><img src="assets/mars.svg" alt="暮色中的火星研究站"><span class="pill story-top">科学悬疑 · 第一季</span><div class="story-caption"><small>EPISODE 01 / 06</small><h2>来自地下的信号</h2><p>A Signal from Below</p><span class="play-disc">${icon('play')}</span></div></button>
    <div class="stats-row"><button class="stat-card" data-go="result"><span class="stat-label">${icon('chart')} 本轮掌握</span><strong class="stat-number">${completed && Object.values(record.first).filter(Boolean).length === 4 ? '1' : '0'} <small>/ 1 个示例表达</small></strong><div class="progress-track"><i style="width:${completed && Object.values(record.first).filter(Boolean).length === 4 ? 100 : 0}%"></i></div></button><button class="stat-card" data-go="review"><span class="stat-label">${icon('calendar')} 延迟复习</span><strong class="stat-number">D1 <small>/ D3 / D7</small></strong><span class="tiny muted">点击体验复习样例 →</span></button></div>
    <div class="section-heading"><h3>今天的小目标</h3><button data-go="stories">故事目录 →</button></div>
    <div class="daily-note" style="margin-top:0">${mascot({mood:completed?'happy':'reading',context:'note',still:true})}<p><b>${completed?'这一小步，也值得被记住。':'芽芽陪你，一次读懂一点。'}</b><br>${completed ? '可以重读故事，或换个语境复习。' : '读一段漫画，把 evidence of 真正用起来。'}</p></div>
  </div>${bottomNav('home')}`;
}
function storiesPage() {
  const titles = ['来自地下的信号','被改写的日志','第二个样本管','无法解释的误差','最后一次传输','藏在证据里的真相'];
  return `${topbar('故事目录')}<div class="scroll page-padding"><div class="series-banner"><span class="small-heading" style="color:#e1c398">SEASON ONE · SCIENCE MYSTERY</span><h1>火星样本失踪案</h1><p>一个被密封的样本，六个等待揭开的秘密。</p></div><div class="section-heading"><h3>故事章节</h3><span class="tiny muted">${record.completed ? '1' : '0'} / 6 话</span></div>${titles.map((title,i) => `<button class="episode ${i ? 'locked' : ''}" ${i ? 'data-action="locked"' : 'data-go="hook"'}><span class="episode-num">0${i+1}</span><div><h3>${title}</h3><p>${i ? '后续内容待制作 · 标题暂定' : `${record.completed ? '样例已完成 · 可重读' : '当前可读'} · 约 8 分钟（设计目标）`}</p></div>${icon(i ? 'lock' : 'arrow')}</button>`).join('')}<p class="tiny muted" style="margin-top:18px">原型阶段：仅第一话有可交互内容，后续标题为占位。</p></div>${bottomNav('stories')}`;
}
function hookPage() {
  return `<div class="app hook">${topbar('Episode 01', 'stories')}<div class="hook-cover"></div><div class="hook-copy"><span class="small-heading" style="color:#d2ad72">A SIGNAL FROM BELOW</span><h1>来自地下的信号</h1><p class="en-hook">The sample was sealed on Mars.<br>So why did the scanner detect<br>Earth air inside it?</p><div class="hook-meta"><span>◷ 约 8 分钟（设计目标）</span><span>1 个完整训练样例</span></div>${actionButton(`开始故事 ${icon('arrow')}`, 'start-story')}<p class="tiny">点击后尝试自动配音 · 请开启声音</p></div></div>`;
}
function comicPage() {
  let panels = '';
  for (let i = 0; i < 5; i++) {
    panels += `<section class="comic-panel ${i === 2 ? 'alarm' : ''}"><span class="panel-stamp">MARS RESEARCH STATION / ${String(i+1).padStart(2,'0')}</span><img class="portrait mina" src="assets/mina.webp" alt="样本分析员 Mina"><img class="portrait leo" src="assets/leo.webp" alt="工程师 Leo">${dialogue.slice(i*2, i*2+2).map(([person,text,translation,term],n) => `<div role="button" tabindex="0" class="bubble" id="bubble-${i*2+n}" data-action="translation" data-index="${i*2+n}" aria-label="${person}: ${text}（点击查看翻译）">${term ? text.replace(term, `<button class="word" data-action="word" data-term="${term}" data-index="${i*2+n}">${term}</button>`) : text}</div>`).join('')}</section>`;
  }
  return `<div class="app comic-page">${topbar('Episode 1 <small>来自地下的信号</small>', 'hook')}<div class="scroll comic-scroll"><p class="comic-intro">Sol 147. Something is not right.<br><span style="font:9px sans-serif;opacity:.65">点词块猜义 · 点气泡看翻译 · 立绘合成分镜示意</span></p>${panels}<p class="comic-intro">The real sample is missing.<br><span style="font:10px sans-serif;opacity:.6">故事，才刚刚开始。</span></p></div><footer class="comic-bottom"><div class="player" id="player"></div>${actionButton(`进入词汇训练 ${icon('arrow')}`, 'to-meaning')}</footer></div>`;
}
function optionsHTML(options, chosen, correctIndex, action) {
  return `<div class="options">${options.map((text,i) => `<button class="option ${chosen !== null ? (i === correctIndex ? 'correct' : i === chosen ? 'wrong' : 'dim') : ''}" data-action="${action}" data-index="${i}" ${chosen !== null ? 'disabled' : ''}><span class="letter">${String.fromCharCode(65+i)}</span><span>${text}</span>${chosen !== null && (i === correctIndex || i === chosen) ? `<span class="answer-icon">${i === correctIndex ? '✓' : '×'}</span>` : ''}</button>`).join('')}</div>`;
}
function feedback(correct, text, tutor = true, withMascot = true) {
  return `<div class="feedback ${correct ? '' : 'error'}"><div class="feedback-heading">${withMascot?mascot({mood:correct?'happy':'support',context:'feedback'}):''}<b>${correct ? '✓ 就是这个意思，你读懂了。' : '没关系，我们一起找找线索。'}</b></div><p class="feedback-body">${text}</p>${tutor ? `<button class="ask" data-action="tutor">${mascot({mood:'wave',context:'inline',still:true})}<span>让芽芽换个方式解释 ↗</span></button>` : ''}</div>`;
}
function meaningPage() {
  return `${topbar('词义训练 <small>1 / 3</small>', 'comic')}${stageProgress(0)}<div class="scroll training-content"><p class="training-kicker">从剧情里，想起它的意思</p><div class="word-header"><h1>evidence of</h1><button class="icon-button sound" data-action="pronounce" aria-label="播放单词发音">${icon('sound')}</button></div><p class="ipa">/ˈevɪdəns əv/</p><div class="example">Then it may contain <b>evidence of</b> ancient life.</div><p class="training-question">这里的 evidence of 是什么意思？</p>${optionsHTML(['……的原因','……的证据','……的影响','……的结果'], selected, 1, 'meaning-answer')}${selected === null ? actionButton('不确定 / 不会', 'meaning-unknown', 'skip') : feedback(selected === 1, 'evidence of 指“……存在的证据”。这里的样本可能含有古代生命存在的证据。')}</div>${footer(actionButton(`下一步 · 拼写 ${icon('arrow')}`, 'to-spelling', 'primary', selected === null), '仅首次作答计入本轮掌握记录')}`;
}
function spellingPage() {
  const answer = spelling.map(i => syllables[i]).join('');
  const correct = answer === 'evidence';
  return `${topbar('字母块拼写 <small>2 / 3</small>', 'meaning')}${stageProgress(1)}<div class="scroll training-content"><p class="training-kicker">从认识，到主动想起</p><h1 style="font-size:26px">把证据拼完整。</h1><p class="sheet-sub">名词 · 证据，迹象</p><div class="example">It may contain ________ of ancient life.</div><div class="spelling-slots" aria-label="已拼写 ${answer || '空'}">${Array.from({length:8},(_,i)=>`<span>${answer[i] || ''}</span>`).join('')}</div><div class="letter-bank">${syllables.map((letter,i)=>`<button class="tile ${spelling.includes(i) ? 'used' : ''}" data-action="spell-tile" data-index="${i}" ${spelling.includes(i) || spellSubmitted ? 'disabled' : ''}>${letter}</button>`).join('')}</div><div class="tools"><button data-action="spell-undo" ${spellSubmitted ? 'disabled' : ''}>↶ 撤销</button><button data-action="spell-reset">↻ 重新排列</button></div>${spellSubmitted ? feedback(correct, correct ? 'evidence 是不可数名词。想说“一条证据”时，用 a piece of evidence。' : '正确拼写为 evidence。可以重新排列再试，首次记录不会被覆盖。') : ''}</div>${footer(actionButton(spellSubmitted && correct ? `下一步 · 搭配 ${icon('arrow')}` : '确认拼写', spellSubmitted && correct ? 'to-phrase' : 'spell-submit', 'primary', answer.length !== 8 || (spellSubmitted && !correct)))}`;
}
function phrasePage() {
  const correct = phrase.map(i => phraseBank[i]).join(' ') === 'evidence of';
  return `${topbar('固定搭配 <small>3 / 3</small>', 'spelling')}${stageProgress(2)}<div class="scroll training-content"><p class="training-kicker">单词，结伴才有力量</p><h1 style="font-size:27px">什么的“证据”？</h1><p class="sheet-sub">点击单词块，组成“……的证据”。</p><div class="example">The sample may contain<br>________ ancient life.</div><div class="slot-phrase" aria-label="已组合的搭配">${phrase.length ? phrase.map(i=>`<span>${phraseBank[i]}</span>`).join('') : '<span style="background:none;color:#b9a98e;font-size:12px">在这里组成搭配</span>'}</div><div class="letter-bank">${phraseBank.map((word,i)=>`<button class="tile word-tile ${phrase.includes(i) ? 'used' : ''}" data-action="phrase-tile" data-index="${i}" ${phrase.includes(i) || phraseSubmitted ? 'disabled' : ''}>${word}</button>`).join('')}</div><div class="tools"><button data-action="phrase-reset">↻ 重新组合</button></div>${phraseSubmitted ? feedback(correct, correct ? 'evidence + of + 名词：of 引出“什么存在的证据”。' : '应该是 evidence of，而不是 of evidence。点“重新组合”再试一次。') : ''}</div>${footer(actionButton(phraseSubmitted && correct ? `走进考场版阅读 ${icon('arrow')}` : '确认搭配', phraseSubmitted && correct ? 'to-reading' : 'phrase-submit', 'primary', phrase.length !== 2 || (phraseSubmitted && !correct)), '同一条线索，换一种更学术的表达')}`;
}
function articleContent() {
  return `<div class="reading-head"><span class="pill">原创 · 考场版阅读</span><h1>When a discovery<br>is not yet proof.</h1></div><article class="article"><p>Scientists searching for signs of past life on Mars must prevent samples from being contaminated. Material collected beneath the planet’s surface may contain chemical evidence that cannot survive above ground.</p><p>However, a positive result does not necessarily prove that life once existed there. Equipment may carry organisms or gases from Earth. Researchers therefore seal each sample, record who has handled it and analyse control materials alongside it.</p><p>Only after alternative causes have been ruled out can a discovery be treated as potential <button class="inline-word" data-action="reading-word" aria-label="查看 evidence of 词卡">evidence of</button> ancient life.</p></article><p class="article-meta">86 WORDS · ORIGINAL LEARNING PASSAGE · 非雅思真题</p>`;
}
function readingPage() {
  return `${topbar('阅读迁移', 'phrase')}${stageProgress(3)}<div class="scroll page-padding">${articleContent()}<p class="reading-reminder">让画面暂时退场。试着用刚刚学过的表达，读懂同一段科学逻辑。</p></div>${footer(actionButton(`读完了，开始答题 ${icon('arrow')}`, 'to-quiz'))}`;
}
function quizPage() {
  const q = questionData[quizIndex];
  const done = Object.hasOwn(record.quiz, quizIndex);
  const answer = done ? record.quiz[quizIndex] : null;
  return `${topbar(`阅读理解 <small>${quizIndex+1} / 3</small>`, 'reading')}${stageProgress(4)}<div class="scroll training-content quiz-content"><div class="excerpt"><span class="pill" style="margin-bottom:9px">考场版阅读</span><p>Scientists searching for signs of past life on Mars must prevent samples from being contaminated. Material collected beneath ...</p><button data-action="view-article">展开完整原文 ⌄</button></div><h3 class="question-title"><span class="pill">Q${quizIndex+1}</span><span>${q.q}</span></h3>${optionsHTML(q.options, answer, q.answer, 'quiz-answer')}${done ? feedback(answer === q.answer, q.explain) : ''}</div>${footer(actionButton(quizIndex === 2 ? `查看学习结果 ${icon('arrow')}` : `下一题 ${icon('arrow')}`, 'quiz-next', 'primary', !done), '提交后展示解析 · 可随时查看原文')}`;
}
function resultPage() {
  const dimensions = [['meaning','词义'],['spelling','拼写'],['phrase','搭配'],['recognition','考场识别']];
  const count = dimensions.filter(([key])=>Object.hasOwn(record.first,key)).length;
  const good = dimensions.filter(([key])=>record.first[key] === true).length;
  const all = count === 4;
  const status = !all ? '待完成' : good === 4 ? '本轮掌握' : good === 3 ? '学习中' : '重点复习';
  return `${topbar('学习结果')}<div class="scroll page-padding"><div class="result-hero">${mascot({mood:!all?'reading':good===4?'jump':'clap',context:'result',decorative:false,label:!all?'芽芽陪你继续学习':good===4?'芽芽为真正掌握跳起来':'芽芽为你完成一轮练习鼓掌'})}<h1>${all ? '一个表达，四种理解。' : '每一步，都算数。'}</h1><p>${all ? '比起“好像认识”，你又多了一点真正的理解。' : `你已完成 ${count} / 4 个维度，继续把线索串起来。`}<br>第一话 · evidence of</p></div><div class="result-summary"><div><strong>${all && good===4 ? 1 : 0}</strong><small>本轮掌握</small></div><div><strong>${all && good===3 ? 1 : 0}</strong><small>学习中</small></div><div><strong>${all && good<3 ? 1 : 0}</strong><small>重点复习</small></div></div><div class="mastery-card"><div class="mastery-top"><b>evidence of</b><span class="pill">${status}</span></div><div class="dimensions">${dimensions.map(([key,label])=>`<div class="dimension"><i class="${record.first[key] === true ? '' : 'no'}">${!Object.hasOwn(record.first,key) ? '·' : record.first[key] ? '✓' : '↻'}</i>${label}</div>`).join('')}</div></div><p class="tiny muted" style="margin-top:10px">${all ? '首次作答记录保留；重答不覆盖。本原型仅统计 1 个表达。' : '尚未完成的维度不计为掌握，直接预览此页不会产生学习成绩。'}</p><div class="next-review">${icon('calendar')}<div><h3>${all ? '下一次，再和它见一面。' : '先读懂，再记牢。'}</h3><p>${all ? '正式产品将在完成后的 D1 / D3 / D7 安排复习。' : '完成词义、拼写、搭配与阅读识别后再安排复习。'}<br>原型提供复习演示，不发送提醒。</p></div></div></div>${footer(`<div class="button-row">${actionButton('返回首页','go-home','secondary')}${actionButton(all ? '体验复习 →' : '继续学习 →',all ? 'go-review' : 'resume-training')}</div>`)}`;
}
function reviewPage() {
  const copy = reviewDay === 1 ? ['熟悉的场景，还记得吗？','保留场景提示，把昨天的理解再唤醒一次。'] : reviewDay === 3 ? ['少一点提示，多一点回忆。','撤去画面和中文，试着独立辨认熟悉的搭配。'] : ['换个故事，你也能读懂。','不依赖火星剧情，在新的学术语境里辨认它。'];
  const sentence = reviewDay === 7 ? 'The damaged trees provide evidence of a recent storm.' : reviewDay === 3 ? 'The sample provides evidence of past life.' : 'It may contain evidence of ancient life.';
  const opts = reviewDay === 1 ? ['……的证据','……的原因','……的代价'] : ['signs suggesting something existed or happened', 'the reason something was created', 'a method for stopping an event'];
  return `${topbar('延迟复习')}<div class="scroll page-padding"><div class="review-tabs" role="tablist" aria-label="复习阶段">${[1,3,7].map(day=>`<button role="tab" aria-selected="${reviewDay===day}" class="${reviewDay===day ? 'active' : ''}" data-action="review-tab" data-index="${day}">D${day} · ${day===1?'场景':day===3?'弱提示':'新语境'}</button>`).join('')}</div><div class="review-hero with-yaya">${mascot({mood:reviewDone?'clap':!reviewStarted?'sleep':reviewAnswer===null?'peek':reviewAnswer===0?'happy':'support',context:'review',still:reviewDone||!reviewStarted})}<span class="small-heading">SPACED REPETITION · DEMO</span><h1>${copy[0]}</h1><p>${copy[1]}<br>阶段样例，不代表真实到期任务。</p></div>${reviewDay===1 ? '<div class="review-sample">回到那一晚的火星研究站。</div>' : ''}${reviewStarted ? `<div class="example">${sentence.replace('evidence of','<b>evidence of</b>')}</div><p class="training-question">${reviewDay===1 ? 'evidence of 在这里表示什么？' : 'What does “evidence of” mean here?'}</p>${optionsHTML(opts,reviewAnswer,0,'review-answer')}${reviewAnswer!==null ? feedback(reviewAnswer===0, '不论是生命迹象，还是风暴留下的痕迹，evidence of 都指向“某事存在或发生的证据”。',false,false) : ''}` : `<div class="review-modes"><div class="review-mode">${icon('book')}<div><h3>${reviewDay===1?'场景唤醒':reviewDay===3?'独立回忆':'新句识别'}</h3><p>${reviewDay===1?'漫画线索与中文选项':reviewDay===3?'仅英文句子与英文释义':'新的主题，相同的核心表达'}</p></div></div><div class="review-mode">${icon('circle')}<div><h3>轻量复习，不制造焦虑</h3><p>此处演示 1 道识别题，不改变课程首次记录。</p></div></div></div>`}</div>${footer(actionButton(reviewStarted ? reviewAnswer===null ? '先选一个答案' : '完成本次样例 ✓' : '开始复习样例 →',reviewStarted ? 'review-finish' : 'review-start','primary',reviewStarted && reviewAnswer===null))}${bottomNav('review')}`;
}
function updateStudio() {
  const active = ['meaning','spelling','phrase'].includes(route) ? 'meaning' : ['reading','quiz'].includes(route) ? 'reading' : route === 'hook' ? 'stories' : route;
  $('#studio-nav').innerHTML = stages.map(([id,title,sub],i)=>`<button class="studio-step ${active===id?'active':''}" data-go="${id}"><small>0${i+1}</small><span>${title}</span><span style="margin-left:auto;font-size:10px;opacity:.6">${sub}</span></button>`).join('');
  const [title,desc,actions] = notes[active === 'meaning' ? 'meaning' : route] || notes.reading;
  $('#note-title').textContent = title;
  $('#note-desc').textContent = desc;
  $('#note-actions').innerHTML = actions.map((text,i)=>`<div class="note-action"><b>${i+1}</b><span>${text}</span></div>`).join('');
}
const pages = {home:homePage,stories:storiesPage,hook:hookPage,comic:comicPage,meaning:meaningPage,spelling:spellingPage,phrase:phrasePage,reading:readingPage,quiz:quizPage,result:resultPage,review:reviewPage};
function render(arrive = false) {
  $('#app').classList.remove('page-arrive');
  $('#app').innerHTML = pages[route]();
  if (arrive && route !== 'comic') {
    void $('#app').offsetWidth;
    $('#app').classList.add('page-arrive');
  }
  updateStudio();
  if (route==='comic') updatePlayer();
}
function go(next, updateHash = true) {
  if (!Object.hasOwn(pages,next)) next='home';
  closeAllSheets(false);
  stopAudio();
  clearTimeout(greetingTimer);
  clearTimeout(greetingResetTimer);
  route=next;
  if (['hook','comic','meaning','spelling','phrase','reading','quiz'].includes(route)) { record.stage=route; save(); }
  if (route==='meaning') selected=null;
  if (['meaning','spelling','phrase','reading','quiz'].includes(route)) currentTerm='evidence of';
  if (updateHash) {
    // 使用 replaceState，浏览器后退不逐个堆叠演示状态；产品“返回”由页面按钮提供。
    try { history.replaceState(null,'',`#${route}`); } catch { /* file URL 限制不阻断页面 */ }
  }
  render(true);
  if (route === 'home') scheduleGreeting(1800);
}
const isHome = () => route === 'home';
function showSheet(html, push = true) {
  if (!sheetStack.length) {
    focusBeforeSheet=document.activeElement;
    audio.resumeAfterSheet=audio.playing;
    if (audio.playing) stopAudio();
    $('#app').inert=true;
  }
  if (push) sheetStack.push(html);
  else sheetStack[sheetStack.length-1]=html;
  $('#overlay').hidden=false;
  $('#overlay').innerHTML=`<section class="sheet" role="dialog" aria-modal="true" aria-label="学习辅助"><div class="sheet-handle"></div>${html}</section>`;
  $('#overlay').querySelector('button')?.focus();
}
function sheetHeader(title) { return `<div class="sheet-top"><span>${title}</span><button class="icon-button" data-action="close-sheet" aria-label="关闭弹层">${icon('close')}</button></div>`; }
function closeSheet() {
  if (speechAvailable) window.speechSynthesis.cancel();
  sheetStack.pop();
  if (sheetStack.length) { showSheet(sheetStack[sheetStack.length-1], false); return; }
  $('#overlay').hidden=true; $('#overlay').innerHTML=''; $('#app').inert=false;
  focusBeforeSheet?.focus?.();
  const resume=audio.resumeAfterSheet;
  audio.resumeAfterSheet=false;
  if (resume && route==='comic' && !document.hidden) playAudio();
}
function closeAllSheets(resume = false) {
  if (!sheetStack.length) return;
  sheetStack=[]; $('#overlay').hidden=true; $('#overlay').innerHTML=''; $('#app').inert=false;
  if (resume && audio.resumeAfterSheet && route==='comic') playAudio();
  audio.resumeAfterSheet=false;
}
let currentTerm='evidence of';
let currentDialogue=1;
function wordSheet(term, index=1, answer=null, direct=false, replace=false) {
  currentTerm=Object.hasOwn(terms,term)?term:'evidence of'; currentDialogue=index;
  const [word,ipa,meaning,structure,example]=terms[currentTerm];
  const original=dialogue[index]?.[1] || dialogue[1][1];
  const ready=direct || answer!==null;
  showSheet(`${sheetHeader(ready?'语境词卡 · 英文优先，中文按需':'先猜一猜 · 不计入训练成绩')}<div class="word-header"><h2>${word}</h2>${ready?`<button class="icon-button sound" data-action="pronounce-term" aria-label="播放词语发音">${icon('sound')}</button>`:''}</div>${ready?`<p class="ipa">${ipa}</p>`:''}<div class="example">${original}</div>${!ready?`<p class="training-question">它在这个场景里是什么意思？</p>${optionsHTML([meaning,'与当前情境无关的原因','完成这项工作的结果'],null,0,'word-guess')}${actionButton('不确定，看看词卡','word-unsure','skip')}`:`${answer!==null?`<p class="tiny" style="color:${answer===0?'#687c57':'#a47856'}">${answer===0?'✓ 猜对了，再把它放回原句。':'没关系，先建立起这个场景的联系。'}</p>`:''}<p class="meaning"><span class="pill">语境义</span>${meaning}</p><p class="sheet-sub">${structure}</p><div class="example" style="margin-bottom:0">${example}</div><button class="text-button tutor-link" data-action="tutor">${mascot({mood:'wave',context:'inline',still:true})}<span>问芽芽老师 ↗</span></button>${actionButton('回到刚才的内容','close-sheet')}`}`,!replace);
}
function tutorSheet(answer = null, replace = false) {
  const quizContext=route==='quiz';
  const questions=quizContext?['为什么这个选项正确？','找出题干和原文的同义改写','其他选项为什么不成立？']:['换个方式解释','再给一个新例子','解释这个搭配'];
  showSheet(`${sheetHeader('受约束导师 · 预设内容演示')}<div class="tutor-title">${mascot({mood:'think',context:'tutor'})}<div><h2>芽芽老师</h2><p>只解释眼前这一点，不偷偷给答案。</p></div></div><div class="tutor-options">${questions.map((q,i)=>`<button data-action="tutor-answer" data-index="${i}">${q} ↗</button>`).join('')}</div>${answer!==null?`<div class="tutor-answer">${answer}</div>`:'<p class="sheet-sub">选一个问题，我们把它讲清楚。</p>'}<p class="tutor-disclaimer">这是预设教研解释，并非实时 AI。AI 解释仅用于辅助理解，标准答案以课程内容为准。不影响任何掌握记录。</p>`,!replace);
}
function showHelp(replace = false) {
  const description=(notes[route] || notes.meaning);
  showSheet(`${sheetHeader('芽芽 · 原型菜单')}<div class="tutor-title">${mascot({mood:'reading',context:'tutor',still:true})}<div><h2>慢一点，也没关系。</h2><p>让陪伴留在身边，让注意力留给英文。</p></div></div><p class="sheet-sub">${description[1]}</p><div class="demo-settings"><h3>预览偏好</h3><button class="settings-row" data-action="toggle-motion" aria-pressed="${motionEnabled}" aria-label="芽芽动效"><span>芽芽与界面动效</span><i class="switch ${motionEnabled?'on':''}" aria-hidden="true"></i></button><a class="settings-row" href="mascot-lab.html" target="_blank" rel="noopener"><span>芽芽 PNG 分层动效与旧版对照</span><span>查看 ↗</span></a><a class="settings-row" href="index.html${document.body.classList.contains('studio-mode')?'':'?studio=1'}#${route}"><span>${document.body.classList.contains('studio-mode')?'只显示手机界面':'打开设计导览（可选）'}</span><span>切换 →</span></a><button class="settings-row" data-action="reset-settings"><span>重置本地学习记录</span><span>需确认 ↻</span></button></div><details class="demo-settings"><summary style="font-size:12px;cursor:pointer;min-height:35px">原型页面快速跳转</summary><div class="tutor-options">${stages.map(([id,label])=>`<button data-go="${id}">${label} →</button>`).join('')}</div></details><p class="tutor-disclaimer">已启用“减少动态效果”的系统会自动使用静态版本。配音、首次作答和学习记录不受动效开关影响。</p>`,!replace);
}
function handleAction(action, el) {
  const index=Number(el.dataset.index);
  switch(action) {
    case 'help': showHelp(); break;
    case 'toggle-motion':
      motionEnabled=!motionEnabled;
      document.body.classList.toggle('motion-off', !motionEnabled);
      try { localStorage.setItem('yaya-motion',motionEnabled?'on':'off'); } catch { /* 本次页面仍然有效 */ }
      showHelp(true);
      break;
    case 'greet-yaya': {
      showGreeting(true);
      break;
    }
    case 'reset-settings': showReset(); break;
    case 'notifications': showSheet(`${sheetHeader('复习提醒')}<h2>让理解，慢慢留下来。</h2><p class="sheet-sub">正式产品会在完成课程后的 D1、D3、D7 安排复习。当前是离线原型，不会发送通知，也不会读取个人信息。</p>${actionButton('去看看复习样例','go-review')}`); break;
    case 'locked': toast('后续章节尚未制作；当前先体验第一话完整样例。'); break;
    case 'continue': go(record.completed?'hook':record.stage); break;
    case 'start-story': audio.index=0; audio.finished=false; go('comic'); playAudio(); break;
    case 'audio': if(audio.playing) { audio.resumeAfterSheet=false; stopAudio(); } else playAudio(); break;
    case 'word': wordSheet(el.dataset.term,index); break;
    case 'word-guess': wordSheet(currentTerm,currentDialogue,index,false,true); break;
    case 'word-unsure': wordSheet(currentTerm,currentDialogue,-1,false,true); break;
    case 'translation': {
      currentDialogue=index;
      const [person,en,zh]=dialogue[index];
      showSheet(`${sheetHeader('整句翻译 · '+person)}<div class="example">${en}</div><p class="meaning">${zh}</p>${index===5 ? '<p class="sheet-sub">长难句 · 条件与结果</p><div class="example"><b>If</b> the tube was exposed to Earth air<br>→ 条件：样本管接触过地球空气<br><br><b>the result may be useless</b><br>→ 主干：这个结果可能无效</div><button class="text-button" data-action="sentence-tutor">问芽芽老师 · 找句子主干 ↗</button>' : '<p class="sheet-sub">先读英文，只有需要时再借助中文。</p>'}${actionButton('继续漫画','close-sheet')}`); break;
    }
    case 'sentence-tutor': showSheet(`${sheetHeader('句子结构 · 预设解释')}<h2 style="font-size:22px">先找到谁，发生了什么。</h2><div class="example">The result may be useless.</div><p class="sheet-sub">主语是 the result；may 表示可能性；be useless 表示“没有用”。If 引导的从句给出这个判断成立的条件，不是已经确定发生的事实。</p><p class="tutor-disclaimer">预设解释演示，不调用实时 AI。</p>`); break;
    case 'close-sheet': closeSheet(); break;
    case 'pronounce': speakWord('evidence of'); break;
    case 'pronounce-term': speakWord(terms[currentTerm][0]); break;
    case 'to-meaning': go('meaning'); break;
    case 'meaning-answer': if(selected!==null) return; selected=index; firstAnswer('meaning',index===1); render(); break;
    case 'meaning-unknown': if(selected!==null) return; selected=-1; firstAnswer('meaning',false); render(); break;
    case 'to-spelling': go('spelling'); break;
    case 'spell-tile': if(!spellSubmitted && !spelling.includes(index)) { spelling.push(index); render(); } break;
    case 'spell-undo': if(!spellSubmitted) { spelling.pop(); render(); } break;
    case 'spell-reset': spelling=[]; spellSubmitted=false; render(); break;
    case 'spell-submit': if(spelling.length!==8 || spellSubmitted) return; spellSubmitted=true; firstAnswer('spelling',spelling.map(i=>syllables[i]).join('')==='evidence'); render(); break;
    case 'to-phrase': go('phrase'); break;
    case 'phrase-tile': if(!phraseSubmitted && !phrase.includes(index)) { phrase.push(index); render(); } break;
    case 'phrase-reset': phrase=[]; phraseSubmitted=false; render(); break;
    case 'phrase-submit': if(phrase.length!==2 || phraseSubmitted) return; phraseSubmitted=true; firstAnswer('phrase',phrase.map(i=>phraseBank[i]).join(' ')==='evidence of'); render(); break;
    case 'to-reading': go('reading'); break;
    case 'reading-word': wordSheet('evidence of',1,null,true); break;
    case 'view-article': showSheet(`${sheetHeader('回看完整原文')}${articleContent()}${actionButton('回到题目','close-sheet')}`); break;
    case 'to-quiz': quizIndex=0; go('quiz'); break;
    case 'quiz-answer': if(Object.hasOwn(record.quiz,quizIndex)) return; record.quiz[quizIndex]=index; if(quizIndex===2) firstAnswer('recognition',index===questionData[2].answer); save(); render(); break;
    case 'quiz-next': if(!Object.hasOwn(record.quiz,quizIndex)) return; if(quizIndex<2) { quizIndex++; render(); } else { record.completed=['meaning','spelling','phrase','recognition'].every(key=>Object.hasOwn(record.first,key)); save(); go('result'); } break;
    case 'tutor': if(route==='quiz' && !Object.hasOwn(record.quiz,quizIndex)) return toast('先独立作答，提交后再看解释。'); tutorSheet(); break;
    case 'tutor-answer': {
      let answers;
      if(route==='quiz') {
        const q=questionData[quizIndex];
        answers=[q.explain, quizIndex===0?'prevent samples from being contaminated 与 sample control is important 是同一核心意思：控制污染，才能判断发现是否可靠。':quizIndex===1?'alternative causes have been ruled out 对应 check whether other factors explain a result，都是检查并排除其他解释。':'evidence of ancient life 对应 proof suggesting the existence of ancient life；potential 又限制了这种证据的确定程度。',q.options.map((text,i)=>`${String.fromCharCode(65+i)}：${i===q.answer?'符合原文。':'不是本题原文支持的结论。'}`).join('<br>')+'<br>'+q.explain];
      } else {
        const term=terms[currentTerm] || terms['evidence of'];
        answers=[`把它放回眼前这句话：<b>${term[0]}</b> 表示“${term[2]}”。先想清楚场景里发生了什么，再记住表达。`,`${term[4]}<br><br>试着先读英文，再回到“${term[2]}”这个核心意思。`,`${term[3]}。<br><br>${currentTerm==='evidence of'?'例如 evidence of life，of 后面的 life 指出“什么存在的证据”。不要把 evidence of 和 reason for（……的原因）混淆。':'记住整个词块，比单独翻译其中一个词更容易理解当前句子。'}`];
      }
      tutorSheet(answers[index],true); break;
    }
    case 'go-home': go('home'); break;
    case 'go-review': go('review'); break;
    case 'resume-training': go(!Object.hasOwn(record.first,'meaning')?'meaning':!Object.hasOwn(record.first,'spelling')?'spelling':!Object.hasOwn(record.first,'phrase')?'phrase':'quiz'); break;
    case 'review-tab': reviewDay=index; record.reviewDay=index; save(); reviewStarted=false; reviewAnswer=null; reviewDone=false; render(); break;
    case 'review-start': reviewStarted=true; reviewAnswer=null; reviewDone=false; render(); break;
    case 'review-answer': if(reviewAnswer===null) { reviewAnswer=index; render(); } break;
    case 'review-finish': if(reviewAnswer!==null) { reviewStarted=false; reviewAnswer=null; reviewDone=true; render(); toast('复习样例已完成，没有修改课程首次记录。'); } break;
  }
}
document.addEventListener('click', event => {
  const goEl=event.target.closest('[data-go]');
  if(goEl) { go(goEl.dataset.go); return; }
  const el=event.target.closest('[data-action]');
  if(el && !el.disabled) handleAction(el.dataset.action,el);
  if(event.target===$('#overlay')) closeSheet();
});
document.addEventListener('keydown',event=>{
  if(sheetStack.length) {
    if(event.key==='Escape') { event.preventDefault(); closeSheet(); return; }
    if(event.key==='Tab') {
      const focusable=[...$('#overlay').querySelectorAll('button:not(:disabled),a[href],summary,[tabindex="0"]')].filter(el=>el.getClientRects().length);
      const first=focusable[0], last=focusable.at(-1);
      if(event.shiftKey && document.activeElement===first) { event.preventDefault(); last?.focus(); }
      else if(!event.shiftKey && document.activeElement===last) { event.preventDefault(); first?.focus(); }
    }
  } else if((event.key==='Enter'||event.key===' ') && event.target.matches('.bubble')) { event.preventDefault(); handleAction('translation',event.target); }
});
document.addEventListener('visibilitychange',()=>{
  document.body.classList.toggle('page-hidden',document.hidden);
  if(document.hidden) { audio.resumeAfterSheet=false; stopAudio(); }
});
window.addEventListener('hashchange',()=>go(location.hash.slice(1),false));
window.addEventListener('pagehide',()=>stopAudio());
function showReset() {
  showSheet(`${sheetHeader('重置演示')}<h2>从第一条线索重新开始？</h2><p class="sheet-sub">只会清除当前浏览器中这个原型的首次作答与学习进度，不影响任何其他文件。</p><button class="primary" id="confirm-reset" style="margin-top:20px">确认重置</button>`);
}
$('#reset-demo').addEventListener('click',showReset);
document.addEventListener('click',event=>{ if(event.target.id==='confirm-reset') { record=emptyRecord(); save(); selected=null; spelling=[]; phrase=[]; spellSubmitted=false; phraseSubmitted=false; quizIndex=0; reviewStarted=false; reviewAnswer=null; reviewDone=false; reviewDay=1; go('home'); toast('已重置，可以重新体验。'); } });
go(location.hash.slice(1) || 'home',false);
