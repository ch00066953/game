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
