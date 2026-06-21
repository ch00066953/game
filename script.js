// 编程拾光 — 首页交互脚本

// 游戏卡片滚动入场动画（IntersectionObserver）
(function initCardAnimation() {
  const cards = document.querySelectorAll('.game-card');
  if (!cards.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // 按索引延迟，形成依次出现效果
          const index = Array.from(cards).indexOf(entry.target);
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, index * 80);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  cards.forEach((card) => observer.observe(card));
})();

// 区块标题 & 迷你卡片滚动入场动画
(function initSectionEntrance() {
  // Section headers: slide up gently
  const headers = document.querySelectorAll('.gsec-head');
  if (headers.length) {
    const hObs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          hObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    headers.forEach(function(h) { hObs.observe(h); });
  }

  // Mini-cards: stagger per batch of visible entries
  const minis = document.querySelectorAll('.cat-mini-card');
  if (!minis.length) return;
  const mObs = new IntersectionObserver(function(entries) {
    var batch = entries.filter(function(e) { return e.isIntersecting; });
    batch.forEach(function(e, i) {
      setTimeout(function() {
        e.target.classList.add('visible');
        mObs.unobserve(e.target);
      }, i * 45);
    });
  }, { threshold: 0.05 });
  minis.forEach(function(m) { mObs.observe(m); });
})();

// 导航栏滚动透明度
(function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      header.style.background = 'rgba(13, 15, 20, 0.96)';
    } else {
      header.style.background = 'rgba(13, 15, 20, 0.85)';
    }
  }, { passive: true });
})();

// 平滑滚动（兼容不支持 scroll-behavior 的浏览器）
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();

// 从 stats.json 加载实时统计数字（后续更新此文件填入真实数据）
(function initLiveStats() {
  const ids = {
    todayUv:    'stat-today-uv',
    totalUv:    'stat-total-uv',
    todayPlay:  'stat-today-play',
    totalPlay:  'stat-total-play',
  };

  function setNum(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val != null ? String(val) : '-';
  }

  fetch('stats.json', { cache: 'no-store' })
    .then(function(res) { return res.ok ? res.json() : Promise.reject(); })
    .then(function(data) {
      setNum(ids.todayUv,   data.today_uv);
      setNum(ids.totalUv,   data.total_uv);
      setNum(ids.todayPlay, data.today_play);
      setNum(ids.totalPlay, data.total_play);
    })
    .catch(function() { /* stats.json 不存在时保持 - 占位 */ });
})();

// 百度统计接入与首页游戏入口埋点
(function initBaiduTongjiTracking() {
  // 替换为你的百度统计站点 ID（hm.js 后面的那段）
  const BAIDU_TONGJI_SITE_ID = 'c1e5e0b226b2ebd860b7d2dba141a896';

  window._hmt = window._hmt || [];

  if (BAIDU_TONGJI_SITE_ID) {
    const script = document.createElement('script');
    script.src = `https://hm.baidu.com/hm.js?${BAIDU_TONGJI_SITE_ID}`;
    script.async = true;
    document.head.appendChild(script);
  }

  const cardButtons = document.querySelectorAll('.card-btn');
  if (!cardButtons.length) return;

  cardButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('.game-card');
      const titleNode = card ? card.querySelector('.card-title') : null;
      const gameName = titleNode ? titleNode.textContent.trim() : '未知游戏';

      if (window._hmt && typeof window._hmt.push === 'function') {
        // 口径：game / start_click / 游戏名
        window._hmt.push(['_trackEvent', 'game', 'start_click', gameName]);
      }
    });
  });
})();
