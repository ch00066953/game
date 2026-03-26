// ==================== 石器时代 - 数据定义模块 ====================

const CLASS_DATA = {
    warrior: { name: '战士', icon: '⚔️', baseHp: 120, baseMp: 30, atk: 15, def: 12, spd: 8, skills: ['猛击', '旋风斩'] },
    hunter:  { name: '猎人', icon: '🏹', baseHp: 100, baseMp: 40, atk: 12, def: 8, spd: 14, skills: ['精准射击', '捕兽陷阱'] },
    shaman:  { name: '巫师', icon: '🔮', baseHp: 90,  baseMp: 60, atk: 8,  def: 10, spd: 9, skills: ['火焰术', '治愈之光'] },
};

const SKILL_DATA = {
    '猛击':     { cost: 8,  power: 1.8, type: 'attack', desc: '全力一击，造成1.8倍伤害' },
    '旋风斩':   { cost: 15, power: 1.5, type: 'aoe',    desc: '旋转攻击（对Boss附加效果）', hitAll: true },
    '精准射击': { cost: 10, power: 2.0, type: 'attack', desc: '瞄准弱点，2.0倍伤害+高暴击' , critBonus: 30 },
    '捕兽陷阱': { cost: 12, power: 0,   type: 'catch',  desc: '提高本次捕获成功率30%', catchBonus: 30 },
    '火焰术':   { cost: 12, power: 2.2, type: 'attack', desc: '释放火焰，2.2倍伤害' },
    '治愈之光': { cost: 15, power: 0,   type: 'heal',   desc: '恢复30%最大HP', healPercent: 0.3 },
    '撕咬':     { cost: 5,  power: 1.5, type: 'attack', desc: '凶猛撕咬' },
    '冲撞':     { cost: 8,  power: 1.8, type: 'attack', desc: '全力冲撞' },
    '火焰吐息': { cost: 12, power: 2.0, type: 'attack', desc: '喷射火焰' },
    '治愈':     { cost: 10, power: 0,   type: 'heal',   desc: '自我恢复20%HP', healPercent: 0.2 },
    '冰冻吐息': { cost: 15, power: 2.2, type: 'attack', desc: '冰霜攻击' },
    '雷击':     { cost: 14, power: 2.5, type: 'attack', desc: '召唤雷电' },
    '尾击':     { cost: 6,  power: 1.6, type: 'attack', desc: '甩尾攻击' },
    '毒液':     { cost: 10, power: 1.4, type: 'attack', desc: '喷射毒液' },
};

const AREAS = [
    { id: 'village',  name: '加加村',     icon: '🏘️', desc: '宁静的原始部落，适合新手', levelReq: 1,  bgClass: '', enemies: ['小恐龙', '野猪', '毒蛇'] },
    { id: 'forest',   name: '密林深处',   icon: '🌲', desc: '茂密的原始森林，危机四伏', levelReq: 3,  bgClass: 'area-forest', enemies: ['迅猛龙', '巨蜥', '森林猛犸'] },
    { id: 'desert',   name: '灼热荒漠',   icon: '🏜️', desc: '广袤的沙漠地带，酷热难耐', levelReq: 6,  bgClass: 'area-desert', enemies: ['沙漠蝎', '骆驼龙', '沙暴巨虫'] },
    { id: 'volcano',  name: '烈焰火山',   icon: '🌋', desc: '危险的火山区域，充满岩浆', levelReq: 10, bgClass: 'area-volcano', enemies: ['火蜥蜴', '熔岩龙', '火山暴龙'] },
    { id: 'ice',      name: '极寒冰原',   icon: '🏔️', desc: '冰封的远古大陆，终极试炼', levelReq: 15, bgClass: 'area-ice', enemies: ['冰霜狼', '猛犸象', '冰龙王'] },
];

const ENEMY_DATA = {
    '小恐龙':   { icon: '🦎', hp: 60,  atk: 8,  def: 4,  spd: 6,  exp: 25,  gold: 15, catchRate: 40, level: 1, skills: ['撕咬'] },
    '野猪':     { icon: '🐗', hp: 80,  atk: 10, def: 6,  spd: 5,  exp: 30,  gold: 20, catchRate: 35, level: 2, skills: ['冲撞'] },
    '毒蛇':     { icon: '🐍', hp: 50,  atk: 12, def: 3,  spd: 10, exp: 28,  gold: 18, catchRate: 38, level: 2, skills: ['毒液'] },
    '迅猛龙':   { icon: '🦖', hp: 120, atk: 16, def: 8,  spd: 12, exp: 50,  gold: 35, catchRate: 28, level: 4, skills: ['撕咬', '冲撞'] },
    '巨蜥':     { icon: '🦎', hp: 150, atk: 14, def: 12, spd: 6,  exp: 55,  gold: 40, catchRate: 25, level: 5, skills: ['尾击', '毒液'] },
    '森林猛犸': { icon: '🦣', hp: 200, atk: 18, def: 15, spd: 4,  exp: 70,  gold: 50, catchRate: 18, level: 6, skills: ['冲撞'] },
    '沙漠蝎':   { icon: '🦂', hp: 140, atk: 20, def: 10, spd: 11, exp: 65,  gold: 45, catchRate: 25, level: 7, skills: ['毒液', '撕咬'] },
    '骆驼龙':   { icon: '🐪', hp: 180, atk: 18, def: 14, spd: 8,  exp: 75,  gold: 55, catchRate: 20, level: 8, skills: ['冲撞', '尾击'] },
    '沙暴巨虫': { icon: '🪱', hp: 220, atk: 22, def: 12, spd: 7,  exp: 90,  gold: 65, catchRate: 15, level: 9, skills: ['撕咬', '毒液'] },
    '火蜥蜴':   { icon: '🔥', hp: 200, atk: 24, def: 14, spd: 10, exp: 100, gold: 70, catchRate: 18, level: 11, skills: ['火焰吐息', '撕咬'] },
    '熔岩龙':   { icon: '🐉', hp: 300, atk: 28, def: 18, spd: 8,  exp: 130, gold: 90, catchRate: 12, level: 13, skills: ['火焰吐息', '冲撞'] },
    '火山暴龙': { icon: '🦖', hp: 400, atk: 32, def: 20, spd: 6,  exp: 160, gold: 110, catchRate: 8,  level: 15, skills: ['火焰吐息', '冲撞', '尾击'] },
    '冰霜狼':   { icon: '🐺', hp: 260, atk: 26, def: 16, spd: 14, exp: 120, gold: 80, catchRate: 15, level: 16, skills: ['撕咬', '冰冻吐息'] },
    '猛犸象':   { icon: '🦣', hp: 450, atk: 30, def: 24, spd: 5,  exp: 170, gold: 120, catchRate: 10, level: 18, skills: ['冲撞', '冰冻吐息'] },
    '冰龙王':   { icon: '🐲', hp: 600, atk: 36, def: 28, spd: 10, exp: 250, gold: 180, catchRate: 5,  level: 20, skills: ['冰冻吐息', '雷击', '尾击'] },
};

const SHOP_ITEMS = [
    { id: 'potion',      name: '生命药水',   icon: '💉', desc: '恢复50HP',           price: 30,  effect: { type: 'heal', value: 50 } },
    { id: 'hiPotion',    name: '高级药水',   icon: '💊', desc: '恢复150HP',          price: 80,  effect: { type: 'heal', value: 150 } },
    { id: 'mpPotion',    name: '灵力药水',   icon: '💧', desc: '恢复30MP',           price: 40,  effect: { type: 'healMp', value: 30 } },
    { id: 'catchStone',  name: '捕兽石',     icon: '💎', desc: '捕获率+15%',         price: 50,  effect: { type: 'catchBonus', value: 15 } },
    { id: 'atkCharm',    name: '力量护符',   icon: '💪', desc: '战斗中攻击+5(单次)', price: 100, effect: { type: 'atkBuff', value: 5 } },
    { id: 'petPotion',   name: '宠物药水',   icon: '🍖', desc: '恢复出战宠物50HP',  price: 40,  effect: { type: 'petHeal', value: 50 } },
];

// ===== 地砖类型 =====
const TILE = { GRASS: 0, PATH: 1, WATER: 2, WALL: 3, TREE: 4, SAND: 5, LAVA: 6, ICE: 7, TALLGRASS: 8, SNOW: 9 };
const TILE_WALKABLE = { 0: true, 1: true, 5: true, 7: true, 8: true, 9: true };
const TILE_ENCOUNTER_RATE = { 0: 0.08, 5: 0.10, 7: 0.08, 8: 0.18, 9: 0.06 };
const TILE_COLORS = {
    0: '#7EC850', 1: '#C4A86A', 2: '#4A90D9', 3: '#8B7355',
    4: '#2D5016', 5: '#E8C872', 6: '#FF4500', 7: '#B8D8E8',
    8: '#5DAF34', 9: '#E8F0F0'
};

// ===== 区域地图定义 =====
const AREA_MAPS = {
    village: {
        width: 30, height: 22, playerStart: { x: 15, y: 18 },
        pois: [
            { x: 7,  y: 5,  icon: '🏪', name: '部落商店', type: 'shop' },
            { x: 15, y: 3,  icon: '⛺', name: '族长帐篷', type: 'heal', msg: '族长为你治疗了伤势！' },
            { x: 23, y: 5,  icon: '🔥', name: '篝火存档', type: 'save' },
            { x: 27, y: 10, icon: '➡️', name: '前往密林', type: 'exit', target: 1 },
            { x: 4,  y: 15, icon: '👴', name: '老猎人',   type: 'npc', msg: '老猎人: 在草丛中行走会遇到野兽！高草丛遇敌率更高。' },
            { x: 15, y: 8,  icon: '🗿', name: '石碑',     type: 'npc', msg: '远古石碑: 驯服恐龙，成为最强的原始人！' },
        ],
    },
    forest: {
        width: 35, height: 24, playerStart: { x: 2, y: 12 },
        pois: [
            { x: 0,  y: 12, icon: '⬅️', name: '返回加加村', type: 'exit', target: 0 },
            { x: 17, y: 4,  icon: '🔥', name: '营地篝火', type: 'save' },
            { x: 17, y: 6,  icon: '🏪', name: '流浪商人', type: 'shop' },
            { x: 32, y: 12, icon: '➡️', name: '前往荒漠', type: 'exit', target: 2 },
            { x: 17, y: 12, icon: '⛺', name: '休息帐篷', type: 'heal', msg: '在帐篷中休息，恢复了体力！' },
        ],
    },
    desert: {
        width: 35, height: 22, playerStart: { x: 2, y: 11 },
        pois: [
            { x: 0,  y: 11, icon: '⬅️', name: '返回密林', type: 'exit', target: 1 },
            { x: 17, y: 5,  icon: '🏪', name: '沙漠商人', type: 'shop' },
            { x: 17, y: 3,  icon: '⛺', name: '绿洲帐篷', type: 'heal', msg: '在绿洲恢复了体力！' },
            { x: 17, y: 7,  icon: '🔥', name: '篝火',     type: 'save' },
            { x: 32, y: 11, icon: '➡️', name: '前往火山', type: 'exit', target: 3 },
        ],
    },
    volcano: {
        width: 35, height: 24, playerStart: { x: 2, y: 12 },
        pois: [
            { x: 0,  y: 12, icon: '⬅️', name: '返回荒漠', type: 'exit', target: 2 },
            { x: 12, y: 6,  icon: '🏪', name: '矮人商队', type: 'shop' },
            { x: 12, y: 4,  icon: '⛺', name: '避难所',   type: 'heal', msg: '在避难所恢复了体力！' },
            { x: 12, y: 8,  icon: '🔥', name: '篝火',     type: 'save' },
            { x: 32, y: 12, icon: '➡️', name: '前往冰原', type: 'exit', target: 4 },
        ],
    },
    ice: {
        width: 35, height: 24, playerStart: { x: 2, y: 12 },
        pois: [
            { x: 0,  y: 12, icon: '⬅️', name: '返回火山', type: 'exit', target: 3 },
            { x: 17, y: 6,  icon: '🏪', name: '冰原商人', type: 'shop' },
            { x: 17, y: 4,  icon: '🏠', name: '温暖小屋', type: 'heal', msg: '在温暖的小屋中恢复了体力！' },
            { x: 17, y: 8,  icon: '🔥', name: '篝火',     type: 'save' },
            { x: 17, y: 12, icon: '🐲', name: '冰龙巢穴', type: 'npc', msg: '冰龙巢穴：前方极度危险，传说冰龙王在此沉睡...' },
        ],
    },
};

// ===== 材料信息 =====
const MATERIAL_INFO = {
    bone:         { name: '骨头',     icon: '🦴' },
    leather:      { name: '皮革',     icon: '🟫' },
    hard_stone:   { name: '坚硬石块', icon: '🪨' },
    fire_stone:   { name: '火焰石',   icon: '🔴' },
    ice_crystal:  { name: '冰晶',     icon: '💠' },
    poison_gland: { name: '毒腺',     icon: '💚' },
};

// ===== 敌人掉落表 =====
const ENEMY_DROPS = {
    '小恐龙':   [{ id: 'bone',         chance: 0.50 }],
    '野猪':     [{ id: 'leather',      chance: 0.40 }, { id: 'bone',         chance: 0.30 }],
    '毒蛇':     [{ id: 'poison_gland', chance: 0.45 }],
    '迅猛龙':   [{ id: 'bone',         chance: 0.60 }, { id: 'leather',      chance: 0.35 }],
    '巨蜥':     [{ id: 'leather',      chance: 0.55 }, { id: 'poison_gland', chance: 0.30 }],
    '森林猛犸': [{ id: 'leather',      chance: 0.65 }, { id: 'bone',         chance: 0.40 }],
    '沙漠蝎':   [{ id: 'poison_gland', chance: 0.50 }, { id: 'hard_stone',   chance: 0.25 }],
    '骆驼龙':   [{ id: 'leather',      chance: 0.40 }, { id: 'hard_stone',   chance: 0.35 }],
    '沙暴巨虫': [{ id: 'bone',         chance: 0.55 }, { id: 'poison_gland', chance: 0.40 }],
    '火蜥蜴':   [{ id: 'fire_stone',   chance: 0.50 }, { id: 'bone',         chance: 0.30 }],
    '熔岩龙':   [{ id: 'fire_stone',   chance: 0.65 }, { id: 'bone',         chance: 0.40 }],
    '火山暴龙': [{ id: 'fire_stone',   chance: 0.75 }, { id: 'leather',      chance: 0.30 }],
    '冰霜狼':   [{ id: 'ice_crystal',  chance: 0.50 }, { id: 'leather',      chance: 0.30 }],
    '猛犸象':   [{ id: 'ice_crystal',  chance: 0.45 }, { id: 'bone',         chance: 0.55 }],
    '冰龙王':   [{ id: 'ice_crystal',  chance: 0.80 }, { id: 'fire_stone',   chance: 0.30 }],
};

// ===== 商店名称 =====
const SHOP_NAMES = {
    village: '🏘️ 加加村商店',
    forest:  '🌲 流浪商人',
    desert:  '🏜️ 沙漠商队',
    volcano: '🌋 矮人铁匠',
    ice:     '🏔️ 冰原行商',
};

// ===== 各村落商店商品 =====
const VILLAGE_SHOPS = {
    village: [
        { id: 'potion',     name: '生命药水',   icon: '💉', desc: '恢复50HP',              price: 30,  effect: { type: 'heal',       value: 50  } },
        { id: 'mpPotion',   name: '灵力药水',   icon: '💧', desc: '恢复30MP',              price: 40,  effect: { type: 'healMp',     value: 30  } },
        { id: 'catchStone', name: '捕兽石',     icon: '💎', desc: '战斗时捕获率+15%',      price: 50,  effect: { type: 'catchBonus', value: 15  } },
        { id: 'bone',       name: '骨头',       icon: '🦴', desc: '合成材料',              price: 10,  effect: { type: 'material'                } },
        { id: 'leather',    name: '皮革',       icon: '🟫', desc: '合成材料',              price: 15,  effect: { type: 'material'                } },
    ],
    forest: [
        { id: 'potion',     name: '生命药水',   icon: '💉', desc: '恢复50HP',              price: 30,  effect: { type: 'heal',       value: 50  } },
        { id: 'hiPotion',   name: '高级药水',   icon: '💊', desc: '恢复150HP',             price: 80,  effect: { type: 'heal',       value: 150 } },
        { id: 'mpPotion',   name: '灵力药水',   icon: '💧', desc: '恢复30MP',              price: 40,  effect: { type: 'healMp',     value: 30  } },
        { id: 'bone',       name: '骨头',       icon: '🦴', desc: '合成材料',              price: 10,  effect: { type: 'material'                } },
        { id: 'leather',    name: '皮革',       icon: '🟫', desc: '合成材料',              price: 15,  effect: { type: 'material'                } },
        { id: 'hard_stone', name: '坚硬石块',   icon: '🪨', desc: '合成材料',              price: 20,  effect: { type: 'material'                } },
    ],
    desert: [
        { id: 'hiPotion',   name: '高级药水',   icon: '💊', desc: '恢复150HP',             price: 80,  effect: { type: 'heal',       value: 150 } },
        { id: 'mpPotion',   name: '灵力药水',   icon: '💧', desc: '恢复30MP',              price: 40,  effect: { type: 'healMp',     value: 30  } },
        { id: 'catchStone', name: '捕兽石',     icon: '💎', desc: '战斗时捕获率+15%',      price: 50,  effect: { type: 'catchBonus', value: 15  } },
        { id: 'atkCharm',   name: '力量护符',   icon: '💪', desc: '战斗中攻击+5(单次)',    price: 100, effect: { type: 'atkBuff',    value: 5   } },
        { id: 'hard_stone', name: '坚硬石块',   icon: '🪨', desc: '合成材料',              price: 20,  effect: { type: 'material'                } },
        { id: 'fire_stone', name: '火焰石',     icon: '🔴', desc: '合成材料',              price: 35,  effect: { type: 'material'                } },
    ],
    volcano: [
        { id: 'hiPotion',   name: '高级药水',   icon: '💊', desc: '恢复150HP',             price: 80,  effect: { type: 'heal',       value: 150 } },
        { id: 'fullPotion', name: '满血药水',   icon: '🧬', desc: '完全恢复HP与MP',        price: 200, effect: { type: 'fullHeal'                } },
        { id: 'petPotion',  name: '宠物药水',   icon: '🍖', desc: '恢复出战宠物50HP',      price: 40,  effect: { type: 'petHeal',    value: 50  } },
        { id: 'fire_stone', name: '火焰石',     icon: '🔴', desc: '合成材料',              price: 35,  effect: { type: 'material'                } },
        { id: 'poison_gland', name: '毒腺',     icon: '💚', desc: '合成材料',              price: 30,  effect: { type: 'material'                } },
    ],
    ice: [
        { id: 'fullPotion', name: '满血药水',   icon: '🧬', desc: '完全恢复HP与MP',        price: 200, effect: { type: 'fullHeal'                } },
        { id: 'superMp',    name: '超级灵力',   icon: '💠', desc: '恢复80MP',              price: 120, effect: { type: 'healMp',     value: 80  } },
        { id: 'petPotion',  name: '宠物药水',   icon: '🍖', desc: '恢复出战宠物50HP',      price: 40,  effect: { type: 'petHeal',    value: 50  } },
        { id: 'ice_crystal', name: '冰晶',      icon: '💠', desc: '合成材料',              price: 50,  effect: { type: 'material'                } },
        { id: 'atkCharm',   name: '力量护符',   icon: '💪', desc: '战斗中攻击+5(单次)',    price: 100, effect: { type: 'atkBuff',    value: 5   } },
    ],
};

// ===== 合成配方 =====
const CRAFT_RECIPES = [
    // 武器
    { id: 'stone_axe',    name: '石斧',     icon: '🪓', category: '武器',
      desc: '原始石制武器，装备后攻击+6',
      materials: [{ id: 'hard_stone', count: 2 }, { id: 'bone', count: 1 }],
      result: { id: 'stone_axe',    name: '石斧',     icon: '🪓', count: 1, desc: '装备后攻击+6',   effect: { type: 'equipAtk', value: 6  } } },
    { id: 'bone_spear',   name: '骨矛',     icon: '🗡️', category: '武器',
      desc: '以骨头制成的长矛，装备后攻击+10',
      materials: [{ id: 'bone', count: 3 }, { id: 'leather', count: 1 }],
      result: { id: 'bone_spear',   name: '骨矛',     icon: '🗡️', count: 1, desc: '装备后攻击+10',  effect: { type: 'equipAtk', value: 10 } } },
    { id: 'flame_knife',  name: '火焰刀',   icon: '🔥', category: '武器',
      desc: '蕴含火焰之力，装备后攻击+14',
      materials: [{ id: 'fire_stone', count: 2 }, { id: 'bone', count: 2 }],
      result: { id: 'flame_knife',  name: '火焰刀',   icon: '🔥', count: 1, desc: '装备后攻击+14',  effect: { type: 'equipAtk', value: 14 } } },
    { id: 'ice_bow',      name: '冰霜弓',   icon: '🏹', category: '武器',
      desc: '凝结冰晶之力，装备后攻击+12',
      materials: [{ id: 'ice_crystal', count: 2 }, { id: 'bone', count: 2 }],
      result: { id: 'ice_bow',      name: '冰霜弓',   icon: '🏹', count: 1, desc: '装备后攻击+12',  effect: { type: 'equipAtk', value: 12 } } },
    { id: 'poison_dagger', name: '毒匕首', icon: '💀', category: '武器',
      desc: '涂有致命毒素，装备后攻击+9',
      materials: [{ id: 'poison_gland', count: 2 }, { id: 'bone', count: 2 }],
      result: { id: 'poison_dagger', name: '毒匕首',  icon: '💀', count: 1, desc: '装备后攻击+9',   effect: { type: 'equipAtk', value: 9  } } },
    // 防具
    { id: 'leather_armor', name: '皮甲',   icon: '🛡️', category: '防具',
      desc: '坚韧的皮革甲，装备后防御+7',
      materials: [{ id: 'leather', count: 3 }],
      result: { id: 'leather_armor', name: '皮甲',    icon: '🛡️', count: 1, desc: '装备后防御+7',   effect: { type: 'equipDef', value: 7  } } },
    { id: 'bone_helmet',  name: '骨盔',    icon: '⛑️', category: '防具',
      desc: '骨头制成的头盔，装备后防御+4',
      materials: [{ id: 'bone', count: 2 }, { id: 'leather', count: 1 }],
      result: { id: 'bone_helmet',  name: '骨盔',     icon: '⛑️', count: 1, desc: '装备后防御+4',   effect: { type: 'equipDef', value: 4  } } },
    // 饰品
    { id: 'fire_amulet',  name: '火焰护符', icon: '🔮', category: '饰品',
      desc: '蕴含火焰生命力，最大HP永久+40',
      materials: [{ id: 'fire_stone', count: 1 }, { id: 'leather', count: 1 }],
      result: { id: 'fire_amulet',  name: '火焰护符', icon: '🔮', count: 1, desc: '最大HP永久+40',  effect: { type: 'equipHp',  value: 40 } } },
    { id: 'ice_totem',    name: '冰霜图腾', icon: '❄️', category: '饰品',
      desc: '凝聚寒气，最大HP永久+60',
      materials: [{ id: 'ice_crystal', count: 2 }, { id: 'leather', count: 1 }],
      result: { id: 'ice_totem',    name: '冰霜图腾', icon: '❄️', count: 1, desc: '最大HP永久+60',  effect: { type: 'equipHp',  value: 60 } } },
    // 道具
    { id: 'super_catch',  name: '超级捕兽石', icon: '🟢', category: '道具',
      desc: '战斗时捕获率+30%',
      materials: [{ id: 'hard_stone', count: 1 }, { id: 'bone', count: 2 }],
      result: { id: 'super_catch',  name: '超级捕兽石', icon: '🟢', count: 1, desc: '捕获率+30%',   effect: { type: 'catchBonus', value: 30 } } },
    { id: 'mega_potion',  name: '超级药水',   icon: '🧪', category: '道具',
      desc: '恢复300HP的强效药水',
      materials: [{ id: 'bone', count: 1 }, { id: 'leather', count: 2 }],
      result: { id: 'mega_potion',  name: '超级药水',   icon: '🧪', count: 1, desc: '恢复300HP',     effect: { type: 'heal',       value: 300 } } },
    { id: 'power_stone',  name: '力量之石',   icon: '💥', category: '道具',
      desc: '战斗中攻击力大幅提升+10(单次)',
      materials: [{ id: 'hard_stone', count: 2 }, { id: 'fire_stone', count: 1 }],
      result: { id: 'power_stone',  name: '力量之石',   icon: '💥', count: 1, desc: '战斗攻击+10',   effect: { type: 'atkBuff',    value: 10 } } },
];

// ===== 地图生成 =====
function generateAreaTiles(areaId) {
    const def = AREA_MAPS[areaId];
    const w = def.width, h = def.height;
    const tiles = Array.from({ length: h }, () => Array(w).fill(TILE.GRASS));

    if (areaId === 'village') {
        for (let x = 3; x < 27; x++) { tiles[10][x] = TILE.PATH; tiles[11][x] = TILE.PATH; }
        for (let y = 3; y < 20; y++) { tiles[y][15] = TILE.PATH; tiles[y][14] = TILE.PATH; }
        for (let x = 5; x < 25; x++) { tiles[5][x] = TILE.PATH; tiles[6][x] = TILE.PATH; }
        for (let x = 5; x < 25; x++) tiles[15][x] = TILE.PATH;
        for (let y = 12; y < 15; y++) for (let x = 20; x < 24; x++) tiles[y][x] = TILE.WATER;
        for (let x = 0; x < w; x++) { tiles[0][x] = TILE.TREE; tiles[h - 1][x] = TILE.TREE; }
        for (let y = 0; y < h; y++) { tiles[y][0] = TILE.TREE; tiles[y][w - 1] = TILE.TREE; }
        tiles[10][w - 1] = TILE.PATH; tiles[11][w - 1] = TILE.PATH;
        for (let y = 16; y < 20; y++) for (let x = 7; x < 13; x++) tiles[y][x] = TILE.TALLGRASS;
        for (let y = 7; y < 10; y++) for (let x = 20; x < 27; x++) tiles[y][x] = TILE.TALLGRASS;
        [{x:3,y:3},{x:5,y:8},{x:10,y:3},{x:20,y:3},{x:25,y:3},{x:3,y:17},{x:25,y:17}].forEach(p => tiles[p.y][p.x] = TILE.TREE);
        [{x:8,y:9},{x:22,y:16},{x:3,y:13}].forEach(p => tiles[p.y][p.x] = TILE.WALL);
    } else if (areaId === 'forest') {
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) tiles[y][x] = TILE.TREE;
        for (let x = 0; x < w; x++) { tiles[12][x] = TILE.PATH; tiles[11][x] = TILE.PATH; }
        for (let y = 2; y < 22; y++) { tiles[y][17] = TILE.PATH; tiles[y][16] = TILE.PATH; }
        for (let x = 8; x < 26; x++) { tiles[5][x] = TILE.PATH; tiles[4][x] = TILE.PATH; }
        for (let x = 8; x < 26; x++) { tiles[18][x] = TILE.PATH; tiles[19][x] = TILE.PATH; }
        for (let y = 6; y < 10; y++) for (let x = 5; x < 15; x++) tiles[y][x] = TILE.TALLGRASS;
        for (let y = 14; y < 18; y++) for (let x = 20; x < 30; x++) tiles[y][x] = TILE.TALLGRASS;
        for (let y = 2; y < 4; y++) for (let x = 20; x < 28; x++) tiles[y][x] = TILE.GRASS;
        for (let y = 20; y < 22; y++) for (let x = 5; x < 15; x++) tiles[y][x] = TILE.GRASS;
        for (let y = 7; y < 10; y++) for (let x = 24; x < 28; x++) tiles[y][x] = TILE.WATER;
    } else if (areaId === 'desert') {
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) tiles[y][x] = TILE.SAND;
        for (let x = 0; x < w; x++) { tiles[11][x] = TILE.PATH; tiles[10][x] = TILE.PATH; }
        for (let y = 2; y < 20; y++) { tiles[y][17] = TILE.PATH; tiles[y][16] = TILE.PATH; }
        for (let i = 0; i < 20; i++) {
            const rx = (i * 7 + 3) % w, ry = (i * 5 + 2) % h;
            if (tiles[ry][rx] === TILE.SAND) tiles[ry][rx] = TILE.WALL;
        }
        for (let y = 2; y < 5; y++) for (let x = 15; x < 20; x++) tiles[y][x] = TILE.GRASS;
        tiles[3][16] = TILE.WATER; tiles[3][17] = TILE.WATER; tiles[3][18] = TILE.WATER;
    } else if (areaId === 'volcano') {
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) tiles[y][x] = TILE.WALL;
        for (let x = 0; x < w; x++) { tiles[12][x] = TILE.PATH; tiles[11][x] = TILE.PATH; }
        for (let y = 2; y < 22; y++) { tiles[y][12] = TILE.PATH; tiles[y][11] = TILE.PATH; }
        for (let x = 4; x < 28; x++) { tiles[6][x] = TILE.PATH; tiles[5][x] = TILE.PATH; }
        for (let x = 4; x < 28; x++) { tiles[18][x] = TILE.PATH; tiles[17][x] = TILE.PATH; }
        for (let y = 7; y < 11; y++) for (let x = 16; x < 28; x++) tiles[y][x] = TILE.TALLGRASS;
        for (let y = 13; y < 17; y++) for (let x = 4; x < 10; x++) tiles[y][x] = TILE.TALLGRASS;
        for (let y = 1; y < 4; y++) for (let x = 20; x < 30; x++) tiles[y][x] = TILE.LAVA;
        for (let y = 19; y < 23; y++) for (let x = 20; x < 30; x++) tiles[y][x] = TILE.LAVA;
    } else if (areaId === 'ice') {
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) tiles[y][x] = TILE.SNOW;
        for (let x = 0; x < w; x++) { tiles[12][x] = TILE.PATH; tiles[11][x] = TILE.PATH; }
        for (let y = 2; y < 22; y++) { tiles[y][17] = TILE.PATH; tiles[y][16] = TILE.PATH; }
        for (let x = 6; x < 28; x++) { tiles[6][x] = TILE.PATH; tiles[5][x] = TILE.PATH; }
        for (let x = 6; x < 28; x++) { tiles[18][x] = TILE.PATH; tiles[19][x] = TILE.PATH; }
        for (let y = 7; y < 11; y++) for (let x = 4; x < 14; x++) tiles[y][x] = TILE.ICE;
        for (let y = 14; y < 18; y++) for (let x = 20; x < 30; x++) tiles[y][x] = TILE.ICE;
        for (let y = 2; y < 5; y++) for (let x = 24; x < 30; x++) tiles[y][x] = TILE.WATER;
        const treeSpots = [[2,3],[5,1],[8,0],[12,2],[22,4],[27,1],[30,3],[10,20],[15,22],[25,21],[3,18],[8,15]];
        treeSpots.forEach(([tx, ty]) => { if (ty < h && tx < w && tiles[ty][tx] === TILE.SNOW) tiles[ty][tx] = TILE.TREE; });
    }

    def.pois.forEach(poi => {
        tiles[poi.y][poi.x] = TILE.PATH;
        [[0,1],[0,-1],[1,0],[-1,0]].forEach(([dy,dx]) => {
            const ny = poi.y+dy, nx = poi.x+dx;
            if (ny >= 0 && ny < h && nx >= 0 && nx < w && !TILE_WALKABLE[tiles[ny][nx]]) tiles[ny][nx] = TILE.PATH;
        });
    });
    const sp = def.playerStart;
    tiles[sp.y][sp.x] = TILE.PATH;
    [[0,1],[0,-1],[1,0],[-1,0]].forEach(([dy,dx]) => {
        const ny = sp.y+dy, nx = sp.x+dx;
        if (ny >= 0 && ny < h && nx >= 0 && nx < w && !TILE_WALKABLE[tiles[ny][nx]]) tiles[ny][nx] = TILE.PATH;
    });
    return tiles;
}
