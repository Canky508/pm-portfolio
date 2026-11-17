// 原画主体始终是 PNG，不再将整张贴纸自动描摹成 SVG。
// 首页使用独立的奶油猫捧书分层图；其他场景按姿势选用贴纸合集裁切并清理背景后的 PNG。
(() => {
  const poses = {
    reading: ['03-reading-heart.png', 'reading'],
    wave: ['01-hello-book.png', 'wave'],
    happy: ['10-thumbs-up.png', 'happy'],
    support: ['13-thinking.png', 'support'],
    clap: ['06-clap.png', 'clap'],
    jump: ['08-jump.png', 'jump'],
    sleep: ['11-sleep.png', 'sleep'],
    peek: ['07-peek.png', 'peek'],
    think: ['05-tutor.png', 'think'],
    tutor: ['05-tutor.png', 'think']
  };
  // 姿势本身已带爱心、星星、彩带等手绘装饰，不再重复画一遍；
  // 只在“全部掌握”时额外加一层向上飘的矢量星点动效。
  const accents = {
    jump: '<path d="m20 18 2.6 7 7 2.6-7 2.6-2.6 7-2.6-7-7-2.6 7-2.6Z" fill="#FFD064"/><path d="m110 26 2 5.4 5.4 2-5.4 2-2 5.4-2-5.4-5.4-2 5.4-2Z" fill="#F5B8A6"/><path d="m22 108 1.8 4.6 4.6 1.8-4.6 1.8-1.8 4.6-1.8-4.6-4.6-1.8 4.6-1.8Z" fill="#FFE29B"/>'
  };
  const escape = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  window.yayaMascot = function ({mood='reading', context='', label='芽芽', decorative=true, still=false} = {}) {
    const safeContext = String(context).replace(/[^a-z0-9-]/gi,'');
    const role = decorative ? 'aria-hidden="true"' : `role="img" aria-label="${escape(label)}"`;
    if (safeContext === 'greeting') {
      const cls = ['mascot','reading-cat','mascot--greeting',mood==='wave'?'reading-cat--hello':'',still?'reading-cat--still':''].filter(Boolean).join(' ');
      const src = 'assets/reading-cat/';
      return `<span class="${cls}" ${role}><img class="reading-cat__base" src="${src}base.png" alt="" draggable="false"><img class="reading-cat__eyes reading-cat__eyes--open" src="${src}eyes-open.png" alt="" draggable="false"><img class="reading-cat__eyes reading-cat__eyes--closed" src="${src}eyes-closed.png" alt="" draggable="false"></span>`;
    }
    const [file,pose] = poses[mood] || poses.reading;
    const poseClass = pose === 'think' ? 'think' : pose;
    const cls = ['mascot','pose-cat',safeContext && `mascot--${safeContext}`,`pose-cat--${poseClass}`,still && 'pose-cat--still'].filter(Boolean).join(' ');
    const accent = accents[poseClass] ? `<svg class="pose-cat__accent" viewBox="0 0 130 130" aria-hidden="true" focusable="false">${accents[poseClass]}</svg>` : '';
    return `<span class="${cls}" ${role} data-pose="${pose}"><img class="pose-cat__art" src="assets/stickers/${file}" alt="" draggable="false">${accent}</span>`;
  };
})();
