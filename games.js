/**
 * games.js — 游戏数据中心
 * 所有首页均从此文件动态渲染游戏列表，新增游戏只需在 GAMES 数组末尾追加一条即可。
 */

var GAMES = [
  {
    emoji: '🐍', title: '贪吃蛇', url: '贪吃蛇/index.html',
    coverClass: 'card-snake', category: '经典街机', popular: true,
    tags: [{ text: '经典', cls: 'tag-classic' }, { text: '键盘操控', cls: 'tag-keyboard' }],
    desc: '方向键 / WASD 操控，吃食物自动升级难度，本地最高分持久化。'
  },
  {
    emoji: '👻', title: '吃豆人', url: '吃豆人/index.html',
    coverClass: 'card-pacman', category: '经典街机', featured: true, popular: true,
    tags: [{ text: '经典', cls: 'tag-classic' }, { text: '幽灵AI', cls: 'tag-ai' }],
    desc: '21×21 经典迷宫，4 只幽灵独立 AI，炸弹系统、传送门与 8 关递进难度。'
  },
  {
    emoji: '💣', title: '扫雷', url: '扫雷/index.html',
    coverClass: 'card-mine', category: '益智解谜', popular: true,
    tags: [{ text: '经典', cls: 'tag-classic' }, { text: '益智', cls: 'tag-puzzle' }],
    desc: '初 / 中 / 高级难度及自定义配置，首次点击保护，支持命令行控制。'
  },
  {
    emoji: '🔢', title: '24 点', url: '24点/index.html',
    coverClass: 'card-24', category: '益智解谜',
    tags: [{ text: '益智', cls: 'tag-puzzle' }, { text: '数学', cls: 'tag-math' }],
    desc: '经典数学益智游戏，用 4 个随机数字的加减乘除凑出 24，内置提示系统。'
  },
  {
    emoji: '🔫', title: '魂斗罗', url: '魂斗罗/index.html',
    coverClass: 'card-contra', category: '动作射击', featured: true, popular: true,
    tags: [{ text: '动作', cls: 'tag-action' }, { text: 'Boss战', cls: 'tag-boss' }],
    desc: '横版卷轴射击，4 种武器系统，肌肉男 Boss，粒子特效与屏幕震动反馈。'
  },
  {
    emoji: '⚔️', title: '根本守不住', url: '根本守不住/index.html',
    coverClass: 'card-defense', category: '策略塔防', featured: true,
    tags: [{ text: '策略', cls: 'tag-strategy' }, { text: '对抗', cls: 'tag-pvp' }],
    desc: '左右对抗策略，10 种兵种 Canvas 渲染，资源管理 + 波次战役系统。'
  },
  {
    emoji: '🌻', title: '植物大战僵尸 2', url: '植物大战僵尸2/index.html',
    coverClass: 'card-pvz', category: '策略塔防',
    tags: [{ text: '策略', cls: 'tag-strategy' }, { text: '塔防', cls: 'tag-tower' }],
    desc: '经典道路防御，3 种植物卡牌对抗 3 型僵尸，阳光拾取与音效系统。'
  },
  {
    emoji: '🚣', title: '农户过河', url: '农户过河/index.html',
    coverClass: 'card-river', category: '益智解谜',
    tags: [{ text: '益智', cls: 'tag-puzzle' }, { text: '逻辑', cls: 'tag-logic' }],
    desc: '经典狼羊菜过河谜题，支持按钮与命令行双模式，BFS 算法提供最优解提示。'
  },
  {
    emoji: '🍄', title: '超级玛丽 2', url: '超级玛丽2/index.html',
    coverClass: 'card-contra', category: '动作射击', popular: true,
    tags: [{ text: '动作', cls: 'tag-action' }, { text: '横版闯关', cls: 'tag-classic' }],
    desc: '全新独立关卡，支持卷轴镜头、终点旗、金币收集、踩踏敌人与生命重开机制。'
  },
  {
    emoji: '⛏️', title: '我的世界', url: '我的世界/index.html',
    coverClass: 'card-craft', category: 'RPG探险',
    tags: [{ text: '沙盒', cls: 'tag-strategy' }, { text: '建造采集', cls: 'tag-keyboard' }],
    desc: '等距像素沙盒世界，支持程序地形、方块采集放置、小地图与本地存档。'
  },
  {
    emoji: '💰', title: '黄金矿工', url: '黄金矿工/index.html',
    coverClass: 'card-gold', category: '经典街机', popular: true,
    tags: [{ text: '经典', cls: 'tag-classic' }, { text: '休闲', cls: 'tag-action' }],
    desc: '经典挖矿游戏，操控钩子抓取金块宝石，商店道具系统与关卡递进难度。'
  },
  {
    emoji: '🦕', title: '石器时代', url: '石器时代/index.html',
    coverClass: 'card-stoneage', category: 'RPG探险', featured: true,
    tags: [{ text: '经典', cls: 'tag-classic' }, { text: '回合RPG', cls: 'tag-pvp' }],
    desc: '3 职业、15 种恐龙捕获养成、5 大区域探索、回合制战斗与宠物系统。'
  },
  {
    emoji: '🐉', title: '怪物猎人', url: '怪物猎人/index.html',
    coverClass: 'card-hunter', category: '动作射击',
    tags: [{ text: '动作', cls: 'tag-action' }, { text: 'Boss战', cls: 'tag-boss' }],
    desc: '4 种武器、5 大巨兽狩猎、素材收集与装备锻造、实时动作战斗系统。'
  },
  {
    emoji: '🔫', title: '反恐精英 2D', url: '反恐精英2D/index.html',
    coverClass: 'card-cs', category: '动作射击',
    tags: [{ text: '射击', cls: 'tag-action' }, { text: '双人合作', cls: 'tag-pvp' }],
    desc: '俯视角双人射击，3 张地图、3 种武器、AI 敌人波次作战，支持单人与双人合作。'
  },
  {
    emoji: '🧱', title: '打砖块', url: '打砖块/index.html',
    coverClass: 'card-breakout', category: '经典街机',
    tags: [{ text: '经典', cls: 'tag-classic' }, { text: '街机', cls: 'tag-action' }],
    desc: '操控挡板反弹小球，击碎所有砖块过关，多关卡递进难度与砖块血量系统。'
  },
  {
    emoji: '🔢', title: '2048', url: '2048/index.html',
    coverClass: 'card-2048', category: '经典街机', popular: true,
    tags: [{ text: '益智', cls: 'tag-puzzle' }, { text: '经典', cls: 'tag-classic' }],
    desc: '滑动合并相同数字方块，挑战 2048 及更高分数，本地最高分持久化。'
  },
  {
    emoji: '📦', title: '推箱子', url: '推箱子/index.html',
    coverClass: 'card-sokoban', category: '益智解谜', popular: true,
    tags: [{ text: '益智', cls: 'tag-puzzle' }, { text: '逻辑', cls: 'tag-logic' }],
    desc: '经典推箱子益智游戏，10 个关卡递进难度，撤销功能与关卡进度本地保存。'
  },
  {
    emoji: '🫧', title: '泡泡龙', url: '泡泡龙/index.html',
    coverClass: 'card-bubble', category: '经典街机',
    tags: [{ text: '益智', cls: 'tag-puzzle' }, { text: '经典', cls: 'tag-classic' }],
    desc: '经典泡泡龙射击消除，三个同色泡泡相连即可消除，多关卡递进难度。'
  },
  {
    emoji: '🏰', title: '塔防', url: '塔防/index.html',
    coverClass: 'card-td', category: '策略塔防',
    tags: [{ text: '策略', cls: 'tag-strategy' }, { text: '塔防', cls: 'tag-tower' }],
    desc: '经典塔防玩法，2 种防御塔对抗 3 类敌人，10 波递进难度。'
  },
  {
    emoji: '🏃', title: '平台跳跃', url: '平台跳跃/index.html',
    coverClass: 'card-platformer', category: '动作射击',
    tags: [{ text: '动作', cls: 'tag-action' }, { text: '横版闯关', cls: 'tag-classic' }],
    desc: '横版卷轴平台跳跃，金币收集与尖刺陷阱，多关卡递进难度。'
  },
  {
    emoji: '🎴', title: '卡牌地牢', url: '卡牌地牢/index.html',
    coverClass: 'card-carddungeon', category: '策略塔防',
    tags: [{ text: '策略', cls: 'tag-strategy' }, { text: 'Roguelike', cls: 'tag-classic' }],
    desc: '构建牌组击败地牢敌人，回合制卡牌战斗与战后奖励选择。'
  },
  {
    emoji: '⚡', title: '五位一体', url: '五位一体/index.html',
    coverClass: 'card-five', category: '动作射击', featured: true,
    tags: [{ text: '多人', cls: 'tag-pvp' }, { text: '格斗', cls: 'tag-action' }],
    desc: '5 种角色同台竞技，物理引擎驱动的格斗对战，支持多人本地游玩。'
  },
  {
    emoji: '⚔️', title: '战棋', url: '战棋/index.html',
    coverClass: 'card-tactics', category: '策略塔防',
    tags: [{ text: '策略', cls: 'tag-strategy' }, { text: '战棋', cls: 'tag-classic' }],
    desc: '网格战术回合制，指挥多兵种在复杂地形上战斗。'
  },
  {
    emoji: '🛡️', title: '轻量RPG', url: '轻量RPG/index.html',
    coverClass: 'card-rpg', category: 'RPG探险',
    tags: [{ text: '角色扮演', cls: 'tag-strategy' }, { text: 'RPG', cls: 'tag-classic' }],
    desc: '文字冒险 RPG，含角色成长、装备、任务链与存档系统。'
  },
  {
    emoji: '💣', title: '炸弹人', url: '炸弹人/index.html',
    coverClass: 'card-bomber', category: '经典街机', popular: true,
    tags: [{ text: '经典', cls: 'tag-classic' }, { text: '动作', cls: 'tag-action' }],
    desc: '网格迷宫爆破，放置炸弹炸开木箱，收集强化道具并击败敌人寻找出口。'
  },
  {
    emoji: '🧮', title: '肯肯数独', url: '肯肯数独/index.html',
    coverClass: 'card-kenken', category: '益智解谜', popular: true,
    tags: [{ text: '益智', cls: 'tag-puzzle' }, { text: '数学', cls: 'tag-math' }],
    desc: '肯肯数独逻辑谜题，支持 3×3 到 6×6 难度加减、低年级友好模式、检查与提示。'
  }
];

/**
 * renderGames(containerId, opts)
 * 为主题页（alt/pixel/neon/paper）渲染简洁卡片：图标 + 标题 + 按钮
 *
 * @param {string} containerId   目标容器 id
 * @param {object} [opts]
 *   opts.btnText   {string}  按钮文字，默认 '玩'
 *   opts.iconClass {string}  图标 div 的 class，默认 'game-icon'
 */
function renderGames(containerId, opts) {
  var el = document.getElementById(containerId);
  if (!el) return;
  var o = opts || {};
  var btnText   = o.btnText   || '玩';
  var iconClass = o.iconClass || 'game-icon';
  el.innerHTML = GAMES.map(function(g) {
    return '<div class="game-card">'
      + '<div class="' + iconClass + '">' + g.emoji + '</div>'
      + '<div class="game-title">' + g.title + '</div>'
      + '<a href="' + g.url + '" target="_blank" class="game-btn">' + btnText + '</a>'
      + '</div>';
  }).join('');
}

/**
 * renderGamesSectioned(containerId)
 * 为原版首页渲染三区块布局：主推区 / 游戏分类 / 热门推荐
 */
function renderGamesSectioned(containerId) {
  var el = document.getElementById(containerId);
  if (!el) return;

  var featured = GAMES.filter(function(g) { return g.featured; });
  var popular  = GAMES.filter(function(g) { return g.popular; });

  var CAT_ORDER = ['动作射击', '经典街机', '策略塔防', '益智解谜', 'RPG探险'];
  var CAT_ICON  = { '动作射击': '⚔️', '经典街机': '🕹️', '策略塔防': '🏰', '益智解谜': '🧩', 'RPG探险': '🗺️' };

  /* --- helpers --- */
  function richCard(g, extra) {
    var tagsHtml = (g.tags || []).map(function(t) {
      return '<span class="tag ' + t.cls + '">' + t.text + '</span>';
    }).join('');
    return '<article class="game-card' + (extra ? ' ' + extra : '') + '">'
      + '<div class="card-cover ' + (g.coverClass || 'card-default') + '">'
      + '<div class="card-emoji">' + g.emoji + '</div>'
      + '</div>'
      + '<div class="card-body">'
      + '<div class="card-tags">' + tagsHtml + '</div>'
      + '<h3 class="card-title">' + g.title + '</h3>'
      + '<p class="card-desc">' + (g.desc || '') + '</p>'
      + '<a class="card-btn" href="' + g.url + '" target="_blank">开始游戏 →</a>'
      + '</div></article>';
  }

  function miniCard(g) {
    return '<div class="cat-mini-card">'
      + '<div class="cat-mini-emoji">' + g.emoji + '</div>'
      + '<div class="cat-mini-name">' + g.title + '</div>'
      + '<a class="cat-mini-btn" href="' + g.url + '" target="_blank">玩</a>'
      + '</div>';
  }

  function secHead(num, title, sub) {
    return '<div class="gsec-head">'
      + '<span class="gsec-label" data-n="' + num + '">' + num + '</span>'
      + '<div class="gsec-info">'
      + '<div class="gsec-title">' + title + '</div>'
      + '<div class="gsec-subtitle">' + sub + '</div>'
      + '</div></div>';
  }

  /* --- group by category --- */
  var groups = {};
  GAMES.forEach(function(g) {
    var cat = g.category || '其他';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(g);
  });

  var html = '<div class="game-sections">';

  /* === Section 1: 主推区 === */
  html += '<div class="game-section gs-featured">'
    + secHead('01', '主推区', '精心挑选，品质为先')
    + '<div class="featured-grid">'
    + featured.map(function(g) { return richCard(g, 'featured-card'); }).join('')
    + '</div></div>';

  /* === Section 2: 游戏分类区 === */
  var catHtml = '';
  CAT_ORDER.forEach(function(cat) {
    var games = groups[cat];
    if (!games || !games.length) return;
    catHtml += '<div class="cat-group" data-cat="' + cat + '">'
      + '<div class="cat-group-head">'
      + '<span class="cat-group-icon">' + (CAT_ICON[cat] || '🎮') + '</span>'
      + '<span class="cat-group-name">' + cat + '</span>'
      + '<span class="cat-group-count">' + games.length + ' 款</span>'
      + '</div>'
      + '<div class="cat-mini-grid">'
      + games.map(miniCard).join('')
      + '</div></div>';
  });
  var tabsHtml = '<div class="cat-tabs">'
    + '<button class="cat-tab active" data-filter="all">🎮 全部</button>'
    + CAT_ORDER.map(function(cat) {
        return '<button class="cat-tab" data-filter="' + cat + '">'
          + (CAT_ICON[cat] || '🎮') + ' ' + cat + '</button>';
      }).join('')
    + '</div>';

  html += '<div class="game-section gs-cats">'
    + secHead('02', '游戏分类', '按类型浏览全部 ' + GAMES.length + ' 款作品')
    + tabsHtml
    + '<div class="cat-list">' + catHtml + '</div>'
    + '</div>';

  /* === Section 3: 热门推荐 === */
  html += '<div class="game-section gs-hot">'
    + secHead('03', '热门推荐', '大家最常玩的几款')
    + '<div class="hot-grid">'
    + popular.map(function(g) { return richCard(g, ''); }).join('')
    + '</div></div>';

  html += '</div>'; /* .game-sections */
  el.innerHTML = html;

  /* --- category tab filter --- */
  var tabsEl = el.querySelector('.cat-tabs');
  if (tabsEl) {
    tabsEl.addEventListener('click', function(e) {
      var btn = e.target.closest('.cat-tab');
      if (!btn) return;
      tabsEl.querySelectorAll('.cat-tab').forEach(function(t) { t.classList.remove('active'); });
      btn.classList.add('active');
      var filter = btn.dataset.filter;
      el.querySelectorAll('.cat-group').forEach(function(group) {
        var show = filter === 'all' || group.dataset.cat === filter;
        if (show) {
          group.style.display = '';
          group.style.opacity = '0';
          setTimeout(function() { group.style.opacity = '1'; }, 16);
        } else {
          group.style.display = 'none';
        }
      });
    });
  }
}
