/**
 * switcher.js — 风格切换器（自动注入版）
 * 在任意主题页末尾引入此文件即可，无需页面内写入 HTML/CSS/JS。
 * 新增主题只需在此文件中添加一条 .tsw-item 及对应的 .tsw-prev 样式。
 */
(function () {
  /* ── HTML ── */
  var wrap = document.createElement('div');
  wrap.id = 'tsw';
  wrap.innerHTML = [
    '<button id="tsw-btn" class="tsw-toggle" aria-label="切换风格" aria-expanded="false">🎨</button>',
    '<div id="tsw-panel" class="tsw-panel" role="menu">',
    '  <p class="tsw-heading">选择风格</p>',
    '  <a href="index.html"       class="tsw-item" data-page="index"       role="menuitem"><span class="tsw-prev tsw-prev--default"></span><span class="tsw-name">经典暗色</span></a>',
    '  <a href="index_alt.html"   class="tsw-item" data-page="index_alt"   role="menuitem"><span class="tsw-prev tsw-prev--alt"></span>    <span class="tsw-name">黑白编辑</span></a>',
    '  <a href="index_pixel.html" class="tsw-item" data-page="index_pixel" role="menuitem"><span class="tsw-prev tsw-prev--pixel"></span>  <span class="tsw-name">像素终端</span></a>',
    '  <a href="index_neon.html"  class="tsw-item" data-page="index_neon"  role="menuitem"><span class="tsw-prev tsw-prev--neon"></span>   <span class="tsw-name">赛博霓虹</span></a>',
    '  <a href="index_paper.html" class="tsw-item" data-page="index_paper" role="menuitem"><span class="tsw-prev tsw-prev--paper"></span>  <span class="tsw-name">纸质手账</span></a>',
    '</div>'
  ].join('');
  document.body.appendChild(wrap);

  /* ── CSS ── */
  var style = document.createElement('style');
  style.textContent = [
    '#tsw{position:fixed;bottom:24px;right:24px;z-index:99001;font-family:system-ui,sans-serif}',
    '.tsw-toggle{width:48px;height:48px;border-radius:50%;border:none;font-size:1.35rem;cursor:pointer;background:#fff;box-shadow:0 4px 20px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;transition:transform .25s ease;padding:0}',
    '.tsw-toggle:hover{transform:scale(1.1)}',
    '.tsw-toggle.tsw-open{transform:rotate(25deg) scale(1.05)}',
    '.tsw-panel{position:absolute;bottom:58px;right:0;background:rgba(18,18,28,.96);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:10px;box-shadow:0 16px 56px rgba(0,0,0,.65);min-width:190px;opacity:0;transform:translateY(10px) scale(.96);pointer-events:none;transition:opacity .22s ease,transform .22s ease}',
    '.tsw-panel.tsw-open{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}',
    '.tsw-heading{font-size:.65rem;letter-spacing:.2em;color:rgba(255,255,255,.3);text-transform:uppercase;padding:2px 8px 8px;margin:0}',
    '.tsw-item{display:flex;align-items:center;gap:12px;padding:7px 8px;border-radius:8px;text-decoration:none;color:rgba(255,255,255,.55);font-size:.8rem;white-space:nowrap;transition:background .15s,color .15s;cursor:pointer}',
    '.tsw-item:hover{background:rgba(255,255,255,.09);color:#fff}',
    '.tsw-item.tsw-cur{color:#fff;font-weight:700}',
    '.tsw-name{flex:1}',
    '.tsw-prev{width:60px;height:40px;border-radius:5px;flex-shrink:0;position:relative;overflow:hidden;display:block}',
    '.tsw-prev::before{content:\'\';position:absolute;top:0;left:0;right:0;height:8px;z-index:1}',
    '.tsw-prev::after{content:\'\';position:absolute;top:12px;left:8px;right:8px;height:2px;border-radius:1px;background:rgba(255,255,255,.15)}',
    '.tsw-item.tsw-cur .tsw-prev{outline:2.5px solid rgba(255,255,255,.9);outline-offset:2px}',
    /* — theme thumbnails — */
    '.tsw-prev--default{background:linear-gradient(160deg,#0f0c29 0%,#1a1a2e 50%,#24243e 100%)}',
    '.tsw-prev--default::before{background:linear-gradient(90deg,#6c63ff,#a374db)}',
    '.tsw-prev--alt{background:#fff;border:1px solid #ccc}',
    '.tsw-prev--alt::before{background:#111}',
    '.tsw-prev--alt::after{background:rgba(0,0,0,.12)}',
    '.tsw-prev--pixel{background:radial-gradient(ellipse at top,#061606 0%,#020b02 100%)}',
    '.tsw-prev--pixel::before{background:#006614;border-bottom:1px solid #00cc33}',
    '.tsw-prev--pixel::after{background:rgba(0,255,65,.2)}',
    '.tsw-prev--neon{background:linear-gradient(160deg,#080812 0%,#0d0d1a 100%);background-image:linear-gradient(rgba(139,92,246,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,.06) 1px,transparent 1px),linear-gradient(160deg,#080812 0%,#0d0d1a 100%);background-size:8px 8px,8px 8px,100% 100%}',
    '.tsw-prev--neon::before{background:linear-gradient(90deg,#a855f7,#22d3ee)}',
    '.tsw-prev--neon::after{background:rgba(168,85,247,.25)}',
    '.tsw-prev--paper{background:#faf4e8;border:1px solid #d6c8b0}',
    '.tsw-prev--paper::before{background:#2d2420}',
    '.tsw-prev--paper::after{background:rgba(45,36,32,.1)}'
  ].join('');
  document.head.appendChild(style);

  /* ── Events ── */
  var btn   = document.getElementById('tsw-btn');
  var panel = document.getElementById('tsw-panel');

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    var o = panel.classList.toggle('tsw-open');
    btn.classList.toggle('tsw-open', o);
    btn.setAttribute('aria-expanded', o);
  });

  document.addEventListener('click', function (e) {
    if (!document.getElementById('tsw').contains(e.target)) {
      panel.classList.remove('tsw-open');
      btn.classList.remove('tsw-open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  /* ── Highlight current page ── */
  var seg = location.pathname.split('/').pop().replace('.html', '') || 'index';
  var cur = document.querySelector('.tsw-item[data-page="' + seg + '"]');
  if (cur) cur.classList.add('tsw-cur');
})();
