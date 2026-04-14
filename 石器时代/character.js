// ==================== 石器时代 - 角色模块 ====================

const CLASS_COLORS = {
    warrior: { hair: '#8B4513', shirt: '#C0392B', pants: '#7D3C1E', weapon: '#A0A0A0', cape: '#8B0000' },
    hunter:  { hair: '#DAA520', shirt: '#27AE60', pants: '#6B4226', weapon: '#8B6914', cape: '#2E7D32' },
    shaman:  { hair: '#E0E0E0', shirt: '#8E44AD', pants: '#4A235A', weapon: '#9B59B6', cape: '#6C3483' },
};
const SKIN_COLOR = '#F5CBA7';
const SKIN_SHADOW = '#D4A574';

// ===== 性别 =====
const GENDERS = [
    { id: 'male',   name: '男' },
    { id: 'female', name: '女' },
];

// ===== 身材（按性别区分）=====
const BODY_TYPES = {
    male: [
        { id: 'lean',   name: '精瘦' },
        { id: 'normal', name: '匀称' },
        { id: 'strong', name: '健壮' },
        { id: 'burly',  name: '魁梧' },
    ],
    female: [
        { id: 'slim',     name: '纤细' },
        { id: 'normal',   name: '匀称' },
        { id: 'curvy',    name: '丰满' },
        { id: 'athletic', name: '矫健' },
    ],
};

// ===== 发型（按性别区分）=====
const HAIR_STYLES = {
    male: [
        { id: 'short',   name: '短发' },
        { id: 'tied',    name: '束发' },
        { id: 'wild',    name: '狂野发' },
        { id: 'bald',    name: '光头' },
        { id: 'wolftail',name: '狼尾' },
        { id: 'braided', name: '编发' },
        { id: 'samurai', name: '武士髻' },
    ],
    female: [
        { id: 'short',      name: '短发' },
        { id: 'medium',     name: '中长发' },
        { id: 'longstraight',name: '长直发' },
        { id: 'curly',      name: '卷发' },
        { id: 'updo',       name: '盘发' },
        { id: 'shoulder',   name: '披肩发' },
        { id: 'ponytail',   name: '马尾发' },
        { id: 'twintails',  name: '双马尾' },
        { id: 'braidedF',   name: '编辫' },
        { id: 'hime',       name: '公主切' },
    ],
};

// ===== 发色 =====
const HAIR_COLORS = [
    '#8B4513', '#2C1608', '#DAA520', '#E0E0E0', '#C0392B', '#1A1A2E', '#FF8C00', '#F5F5DC',
];

// ===== 肤色（7色）=====
const SKIN_COLORS = [
    { id: 'light',     name: '较浅', color: '#FDDCB5' },
    { id: 'medium',    name: '中等', color: '#F5CBA7' },
    { id: 'dark',      name: '较深', color: '#D4A574' },
    { id: 'bronze',    name: '古铜', color: '#C68642' },
    { id: 'cool',      name: '苍冷', color: '#D5C4A1' },
    { id: 'warmBrown', name: '暖棕', color: '#A0724A' },
    { id: 'deepBrown', name: '深褐', color: '#5E3A1A' },
];

// ===== 服装风格分类 =====
const CLOTHING_CATEGORIES = [
    { id: 'simple',  name: '简约风' },
    { id: 'battle',  name: '战斗风' },
    { id: 'tribal',  name: '部落风' },
    { id: 'elegant', name: '典雅风' },
];

const CLOTHING_STYLES = {
    male: {
        simple: [
            { id: 'm_rough_tunic',  name: '粗布短衣', top: 'tunic',  bottom: 'long' },
            { id: 'm_hide_vest',    name: '兽皮背心', top: 'vest',   bottom: 'shorts' },
            { id: 'm_hemp_shirt',   name: '麻布衫',   top: 'tunic',  bottom: 'long', deco: 'hemp' },
            { id: 'm_grass_poncho', name: '草编罩衫', top: 'poncho', bottom: 'shorts' },
        ],
        battle: [
            { id: 'm_bone_armor',   name: '骨甲战衣', top: 'armor',  bottom: 'long', deco: 'bone' },
            { id: 'm_fang_plate',   name: '兽牙铠甲', top: 'armor_heavy', bottom: 'long', deco: 'fang' },
            { id: 'm_stone_guard',  name: '石盾护胸', top: 'vest',   bottom: 'shorts', deco: 'stone' },
            { id: 'm_beast_armor',  name: '猛兽皮铠', top: 'armor',  bottom: 'shorts', deco: 'fur' },
        ],
        tribal: [
            { id: 'm_totem_shirt',  name: '图腾短衣', top: 'tunic',  bottom: 'loincloth', deco: 'totem' },
            { id: 'm_chief_fur',    name: '首领裘皮', top: 'poncho', bottom: 'long', deco: 'chief' },
            { id: 'm_ritual_drape', name: '仪式披挂', top: 'wrap',   bottom: 'skirt', deco: 'ritual' },
            { id: 'm_shaman_robe',  name: '萨满法衣', top: 'robe',   bottom: 'long', deco: 'shaman' },
        ],
        elegant: [
            { id: 'm_fine_leather', name: '精织皮衣', top: 'tunic',  bottom: 'long', deco: 'fine' },
            { id: 'm_long_robe',    name: '长裘大袍', top: 'robe',   bottom: 'long', deco: 'fur' },
            { id: 'm_noble_war',    name: '贵族战袍', top: 'armor',  bottom: 'long', deco: 'noble' },
            { id: 'm_beast_king',   name: '兽王披风', top: 'poncho', bottom: 'long', deco: 'king' },
        ],
    },
    female: {
        simple: [
            { id: 'f_wrap_top',     name: '简约裹胸', top: 'crop',   bottom: 'skirt' },
            { id: 'f_hemp_jacket',  name: '麻布短褂', top: 'tunic',  bottom: 'shorts' },
            { id: 'f_grass_top',    name: '草编短装', top: 'crop',   bottom: 'skirt', deco: 'hemp' },
            { id: 'f_light_shawl',  name: '轻薄披肩', top: 'shawl',  bottom: 'long' },
            { id: 'f_bark_vest',    name: '树皮罩衫', top: 'vest',   bottom: 'shorts', deco: 'bark' },
        ],
        battle: [
            { id: 'f_warrior_chest',name: '战士胸甲', top: 'armor',  bottom: 'skirt', deco: 'bone' },
            { id: 'f_agile_wrap',   name: '灵巧战裹', top: 'wrap',   bottom: 'shorts' },
            { id: 'f_bone_leather', name: '骨刺皮甲', top: 'armor',  bottom: 'long', deco: 'fang' },
            { id: 'f_light_skirt',  name: '轻甲裹裙', top: 'vest',   bottom: 'skirt', deco: 'stone' },
        ],
        tribal: [
            { id: 'f_tribal_body',  name: '部落绘身', top: 'crop',   bottom: 'loincloth', deco: 'totem' },
            { id: 'f_chief_dress',  name: '首领裙装', top: 'tunic',  bottom: 'skirt_long', deco: 'chief' },
            { id: 'f_ritual_silk',  name: '仪式披纱', top: 'shawl',  bottom: 'skirt_long', deco: 'ritual' },
            { id: 'f_spirit_robe',  name: '灵女法衣', top: 'robe',   bottom: 'long', deco: 'shaman' },
        ],
        elegant: [
            { id: 'f_woven_dress',  name: '精编花裙', top: 'tunic',  bottom: 'skirt_long', deco: 'fine' },
            { id: 'f_noble_dress',  name: '贵族长裙', top: 'tunic',  bottom: 'skirt_long', deco: 'noble' },
            { id: 'f_feather_dress',name: '羽饰华服', top: 'robe',   bottom: 'skirt', deco: 'feather' },
            { id: 'f_queen_dress',  name: '王妃华裳', top: 'robe',   bottom: 'skirt_long', deco: 'queen' },
        ],
    },
};

// ===== 服装配件（多选）=====
const CLOTHING_DETAILS = {
    male: [
        { id: 'bone_necklace',  name: '骨项链' },
        { id: 'fang_pendant',   name: '兽牙挂饰' },
        { id: 'arm_ring',       name: '臂环' },
        { id: 'bone_buckle',    name: '腰带骨扣' },
        { id: 'shoulder_guard', name: '肩甲' },
        { id: 'wrist_guard',    name: '护腕' },
        { id: 'leg_guard',      name: '腿甲' },
        { id: 'tattoo',         name: '纹身' },
        { id: 'war_paint',      name: '战争彩绘' },
        { id: 'feather_deco',   name: '羽毛装饰' },
    ],
    female: [
        { id: 'flower_crown',  name: '花环头饰' },
        { id: 'shell_necklace',name: '贝壳项链' },
        { id: 'bracelet',      name: '手镯' },
        { id: 'rope_belt',     name: '腰带编绳' },
        { id: 'shoulder_deco', name: '肩饰' },
        { id: 'anklet',        name: '足环' },
        { id: 'earring',       name: '耳坠' },
        { id: 'tattoo',        name: '纹身' },
        { id: 'tribal_paint',  name: '部落彩绘' },
        { id: 'fur_scarf',     name: '毛皮领巾' },
    ],
};

// ===== 服装配色（12色）=====
const OUTFIT_COLORS = [
    { id: 'red',    name: '赤', color: '#C0392B' },
    { id: 'orange', name: '橙', color: '#E67E22' },
    { id: 'gold',   name: '金', color: '#F39C12' },
    { id: 'green',  name: '绿', color: '#27AE60' },
    { id: 'cyan',   name: '青', color: '#1ABC9C' },
    { id: 'blue',   name: '蓝', color: '#2980B9' },
    { id: 'purple', name: '紫', color: '#8E44AD' },
    { id: 'brown',  name: '棕', color: '#795548' },
    { id: 'gray',   name: '灰', color: '#7F8C8D' },
    { id: 'white',  name: '白', color: '#ECF0F1' },
    { id: 'black',  name: '墨', color: '#2C3E50' },
    { id: 'yellow', name: '黄', color: '#F1C40F' },
];

// ===== 材质纹理 =====
const MATERIAL_TEXTURES = [
    { id: 'matte',   name: '哑光' },
    { id: 'metal',   name: '金属' },
    { id: 'leather', name: '皮质' },
    { id: 'cloth',   name: '布料' },
    { id: 'silk',    name: '丝绸' },
    { id: 'beast',   name: '兽纹' },
];

// ===== 查找服装定义 =====
function findClothingDef(styleId, gender) {
    if (!styleId) return null;
    const gStyles = CLOTHING_STYLES[gender] || CLOTHING_STYLES.male;
    for (const cat of Object.values(gStyles)) {
        const found = cat.find(c => c.id === styleId);
        if (found) return found;
    }
    return null;
}

// ===== 兼容旧存档外观 =====
function normalizeAppearance(appear) {
    if (!appear) return null;
    // 已是新格式
    if (appear.clothingStyle) return appear;
    // 旧格式转换
    const a = { ...appear };
    if (a.shirtStyle || a.pantsStyle) {
        a.clothingStyle = a.gender === 'female' ? 'f_wrap_top' : 'm_rough_tunic';
        a.outfitColor = a.shirtColor || '#C0392B';
        a.outfitColor2 = a.pantsColor || '#7D3C1E';
        a.material = 'cloth';
        a.details = [];
        delete a.shirtStyle; delete a.shirtColor;
        delete a.pantsStyle; delete a.pantsColor;
    }
    // 旧肤色是hex字符串
    if (typeof a.skinColor === 'string' && a.skinColor.startsWith('#')) {
        // 保持不变，drawPixelChar 可以处理hex
    }
    return a;
}

function drawPixelChar(ctx, x, y, size, cls, facing, frame, customAppear) {
    const s = size / 32;
    const baseColors = CLASS_COLORS[cls] || CLASS_COLORS.warrior;
    let appear = customAppear || (game && game.appearance) || null;
    appear = normalizeAppearance(appear);
    const colors = appear ? {
        hair: appear.hairColor || baseColors.hair,
        shirt: appear.outfitColor || appear.shirtColor || baseColors.shirt,
        pants: appear.outfitColor2 || appear.pantsColor || baseColors.pants,
        weapon: baseColors.weapon,
        cape: baseColors.cape,
    } : baseColors;
    const skinColor = (appear && appear.skinColor) || SKIN_COLOR;
    const hairStyle = (appear && appear.hairStyle) || (cls === 'shaman' ? 'longstraight' : cls === 'warrior' ? 'wild' : 'short');
    const gender = (appear && appear.gender) || 'male';
    const bodyType = (appear && appear.bodyType) || 'normal';
    const material = (appear && appear.material) || 'cloth';
    const details = (appear && appear.details) || [];
    // 获取服装模板
    const clothDef = appear ? findClothingDef(appear.clothingStyle, gender) : null;
    const topType = clothDef ? clothDef.top : 'tunic';
    const bottomType = clothDef ? clothDef.bottom : 'long';
    const decoType = clothDef ? clothDef.deco : null;
    const walkOffset = Math.sin(frame * 0.15) * 2 * s;
    const isWalking = frame > 0;
    const leftLeg = isWalking ? walkOffset : 0;
    const rightLeg = isWalking ? -walkOffset : 0;
    const armSwing = isWalking ? Math.sin(frame * 0.15) * 3 * s : 0;

    // 身材参数
    let bodyW = 14, shoulderOff = 0, armW = 3, legW = 4, headW = 12;
    let hipExtra = 0, bustSize = 0;
    if (gender === 'male') {
        if (bodyType === 'lean')   { bodyW = 12; armW = 2; legW = 3; shoulderOff = -1; }
        else if (bodyType === 'strong') { bodyW = 16; armW = 4; legW = 4; shoulderOff = 1; }
        else if (bodyType === 'burly')  { bodyW = 18; armW = 4; legW = 5; shoulderOff = 2; }
    } else {
        hipExtra = 1;
        if (bodyType === 'slim')      { bodyW = 11; armW = 2; legW = 3; shoulderOff = -1; }
        else if (bodyType === 'normal') { bodyW = 13; armW = 3; legW = 3; }
        else if (bodyType === 'curvy')  { bodyW = 14; armW = 3; legW = 4; hipExtra = 2; bustSize = 3; }
        else if (bodyType === 'athletic') { bodyW = 14; armW = 3; legW = 4; shoulderOff = 1; }
    }
    const bodyX = Math.floor((32 - bodyW) / 2);

    ctx.save();
    ctx.translate(x, y);

    // 阴影
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(16 * s, 31 * s, 8 * s, 3 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // === 下装 ===
    const legInset = Math.floor((bodyW - legW * 2 - 2) / 2);
    const leftLegX = bodyX + legInset;
    const rightLegX = bodyX + bodyW - legInset - legW;
    drawBottom(ctx, s, bottomType, colors.pants, skinColor, bodyX, bodyW, leftLegX, rightLegX, legW, leftLeg, rightLeg, hipExtra);

    // 脚
    ctx.fillStyle = '#5D4E37';
    ctx.fillRect((leftLegX - 1) * s, (29 + leftLeg) * s, (legW + 2) * s, 2 * s);
    ctx.fillRect((rightLegX - 1) * s, (29 + rightLeg) * s, (legW + 2) * s, 2 * s);

    // === 上装 ===
    const shirtX = bodyX - shoulderOff;
    const shirtW = bodyW + shoulderOff * 2;
    drawTop(ctx, s, topType, colors.shirt, skinColor, shirtX, shirtW, gender, bustSize);

    // 服装装饰
    if (decoType) drawClothingDeco(ctx, s, decoType, shirtX, shirtW, colors.shirt);

    // 材质纹理
    if (material && material !== 'cloth' && material !== 'matte') {
        drawMaterialOverlay(ctx, s, material, shirtX, shirtW);
    }

    // 皮带
    ctx.fillStyle = '#5D4E37';
    ctx.fillRect(shirtX * s, 21 * s, shirtW * s, 2 * s);

    // 手臂
    ctx.fillStyle = skinColor;
    const armY = 14;
    ctx.save();
    ctx.translate((shirtX) * s, armY * s);
    ctx.rotate((-armSwing) * Math.PI / 180 * 3);
    ctx.fillRect(-armW * s, 0, armW * s, 10 * s);
    ctx.restore();
    ctx.save();
    ctx.translate((shirtX + shirtW) * s, armY * s);
    ctx.rotate((armSwing) * Math.PI / 180 * 3);
    ctx.fillRect(0, 0, armW * s, 10 * s);
    // 武器
    if (cls === 'warrior') {
        ctx.fillStyle = colors.weapon;
        ctx.fillRect(0, -6 * s, 2 * s, 12 * s);
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(-1 * s, -6 * s, 4 * s, 3 * s);
    } else if (cls === 'hunter') {
        ctx.fillStyle = colors.weapon;
        ctx.fillRect(0, -4 * s, 2 * s, 14 * s);
        ctx.strokeStyle = '#DAA520'; ctx.lineWidth = s;
        ctx.beginPath();
        ctx.moveTo(1 * s, -4 * s);
        ctx.quadraticCurveTo(6 * s, 3 * s, 1 * s, 10 * s);
        ctx.stroke();
    } else if (cls === 'shaman') {
        ctx.fillStyle = colors.weapon;
        ctx.fillRect(0, -8 * s, 2 * s, 16 * s);
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(1 * s, -8 * s, 3 * s, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();

    // 头
    ctx.fillStyle = skinColor;
    ctx.fillRect(10 * s, 3 * s, headW * s, 11 * s);
    ctx.fillRect(8 * s, 6 * s, 3 * s, 4 * s);
    ctx.fillRect(21 * s, 6 * s, 3 * s, 4 * s);

    // 头发
    drawHair(ctx, s, hairStyle, colors.hair, gender);

    // 眼睛
    ctx.fillStyle = '#2C3E50';
    if (facing === 'left') {
        ctx.fillRect(11 * s, 7 * s, 3 * s, 3 * s);
        ctx.fillRect(17 * s, 7 * s, 2 * s, 3 * s);
    } else if (facing === 'right') {
        ctx.fillRect(13 * s, 7 * s, 2 * s, 3 * s);
        ctx.fillRect(19 * s, 7 * s, 3 * s, 3 * s);
    } else {
        ctx.fillRect(12 * s, 7 * s, 3 * s, 3 * s);
        ctx.fillRect(18 * s, 7 * s, 3 * s, 3 * s);
    }
    ctx.fillStyle = '#FFF';
    ctx.fillRect(12 * s, 7 * s, 1 * s, 1 * s);
    ctx.fillRect(18 * s, 7 * s, 1 * s, 1 * s);

    // 女性睫毛
    if (gender === 'female') {
        ctx.fillStyle = '#2C3E50';
        ctx.fillRect(12 * s, 6 * s, 3 * s, 1 * s);
        ctx.fillRect(18 * s, 6 * s, 3 * s, 1 * s);
    }

    // 嘴巴
    ctx.fillStyle = '#C0392B';
    ctx.fillRect(14 * s, 11 * s, 4 * s, 1 * s);

    // 服装配件
    if (details.length > 0) {
        drawClothingDetails(ctx, s, details, gender, skinColor, colors, shirtX, shirtW, bodyX, bodyW);
    }

    ctx.restore();
}

// ===== 下装渲染 =====
function drawBottom(ctx, s, type, pantsColor, skinColor, bodyX, bodyW, leftLegX, rightLegX, legW, leftLeg, rightLeg, hipExtra) {
    ctx.fillStyle = pantsColor;
    if (type === 'shorts') {
        ctx.fillRect(leftLegX * s, (22 + leftLeg) * s, legW * s, 4 * s);
        ctx.fillRect(rightLegX * s, (22 + rightLeg) * s, legW * s, 4 * s);
        ctx.fillStyle = skinColor;
        ctx.fillRect(leftLegX * s, (26 + leftLeg) * s, legW * s, 4 * s);
        ctx.fillRect(rightLegX * s, (26 + rightLeg) * s, legW * s, 4 * s);
    } else if (type === 'skirt') {
        ctx.beginPath();
        ctx.moveTo((bodyX - 1) * s, 22 * s);
        ctx.lineTo((bodyX + bodyW + 1) * s, 22 * s);
        ctx.lineTo((bodyX + bodyW + 2) * s, 28 * s);
        ctx.lineTo((bodyX - 2) * s, 28 * s);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = skinColor;
        ctx.fillRect(leftLegX * s, (28 + leftLeg) * s, legW * s, 2 * s);
        ctx.fillRect(rightLegX * s, (28 + rightLeg) * s, legW * s, 2 * s);
    } else if (type === 'skirt_long') {
        ctx.beginPath();
        ctx.moveTo((bodyX - 1) * s, 22 * s);
        ctx.lineTo((bodyX + bodyW + 1) * s, 22 * s);
        ctx.lineTo((bodyX + bodyW + 3) * s, 29 * s);
        ctx.lineTo((bodyX - 3) * s, 29 * s);
        ctx.closePath(); ctx.fill();
        // 裙摆褶皱
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect((bodyX + 2) * s, 25 * s, 2 * s, 4 * s);
        ctx.fillRect((bodyX + bodyW - 4) * s, 25 * s, 2 * s, 4 * s);
    } else if (type === 'loincloth') {
        ctx.fillStyle = skinColor;
        ctx.fillRect(leftLegX * s, (22 + leftLeg) * s, legW * s, 8 * s);
        ctx.fillRect(rightLegX * s, (22 + rightLeg) * s, legW * s, 8 * s);
        ctx.fillStyle = pantsColor;
        const loinW = bodyW - 2;
        ctx.fillRect((bodyX + 1) * s, 21 * s, loinW * s, 6 * s);
        for (let i = 0; i < 3; i++) {
            ctx.fillRect((bodyX + 2 + i * Math.floor(loinW / 3)) * s, 27 * s, Math.floor(loinW / 3 - 1) * s, 2 * s);
        }
    } else {
        // long
        ctx.fillRect(leftLegX * s, (22 + leftLeg) * s, legW * s, 8 * s);
        ctx.fillRect(rightLegX * s, (22 + rightLeg) * s, legW * s, 8 * s);
    }
}

// ===== 上装渲染 =====
function drawTop(ctx, s, type, shirtColor, skinColor, shirtX, shirtW, gender, bustSize) {
    ctx.fillStyle = shirtColor;
    if (type === 'vest') {
        ctx.fillRect(shirtX * s, 13 * s, shirtW * s, 10 * s);
        ctx.fillStyle = skinColor;
        ctx.fillRect((shirtX + 3) * s, 14 * s, (shirtW - 6) * s, 8 * s);
        ctx.fillStyle = shirtColor;
        ctx.fillRect(shirtX * s, 13 * s, 3 * s, 9 * s);
        ctx.fillRect((shirtX + shirtW - 3) * s, 13 * s, 3 * s, 9 * s);
    } else if (type === 'wrap') {
        ctx.fillRect(shirtX * s, 13 * s, shirtW * s, 10 * s);
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath();
        ctx.moveTo(shirtX * s, 14 * s);
        ctx.lineTo((shirtX + shirtW) * s, 20 * s);
        ctx.lineTo((shirtX + shirtW) * s, 22 * s);
        ctx.lineTo(shirtX * s, 16 * s);
        ctx.closePath(); ctx.fill();
    } else if (type === 'poncho') {
        ctx.fillRect((shirtX - 2) * s, 12 * s, (shirtW + 4) * s, 11 * s);
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            const bx = shirtX - 2 + i * Math.floor((shirtW + 4) / 4);
            ctx.moveTo(bx * s, 23 * s);
            ctx.lineTo((bx + Math.floor((shirtW + 4) / 8)) * s, 25 * s);
            ctx.lineTo((bx + Math.floor((shirtW + 4) / 4)) * s, 23 * s);
            ctx.fill();
        }
    } else if (type === 'crop') {
        // 短上装，只覆盖胸部
        ctx.fillRect(shirtX * s, 13 * s, shirtW * s, 5 * s);
        ctx.fillStyle = skinColor;
        ctx.fillRect(shirtX * s, 18 * s, shirtW * s, 5 * s);
    } else if (type === 'armor') {
        ctx.fillRect(shirtX * s, 13 * s, shirtW * s, 10 * s);
        // 肩甲
        ctx.fillRect((shirtX - 2) * s, 12 * s, 4 * s, 4 * s);
        ctx.fillRect((shirtX + shirtW - 2) * s, 12 * s, 4 * s, 4 * s);
        // 护甲高光
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect((shirtX + 1) * s, 14 * s, 3 * s, 6 * s);
    } else if (type === 'armor_heavy') {
        ctx.fillRect((shirtX - 1) * s, 12 * s, (shirtW + 2) * s, 11 * s);
        // 大肩甲
        ctx.fillRect((shirtX - 3) * s, 11 * s, 5 * s, 5 * s);
        ctx.fillRect((shirtX + shirtW - 2) * s, 11 * s, 5 * s, 5 * s);
        // 中央胸甲纹
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fillRect((shirtX + Math.floor(shirtW / 2) - 2) * s, 14 * s, 4 * s, 6 * s);
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect((shirtX + Math.floor(shirtW / 2) - 1) * s, 15 * s, 2 * s, 4 * s);
    } else if (type === 'robe') {
        // 长袍，延伸到腿部
        ctx.fillRect((shirtX - 1) * s, 13 * s, (shirtW + 2) * s, 14 * s);
        // 袍摆
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(shirtX * s, 24 * s, shirtW * s, 1 * s);
        // 领口
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect((shirtX + Math.floor(shirtW / 2) - 1) * s, 13 * s, 2 * s, 4 * s);
    } else if (type === 'shawl') {
        // 先画皮肤底
        ctx.fillStyle = skinColor;
        ctx.fillRect(shirtX * s, 13 * s, shirtW * s, 10 * s);
        // 披肩覆盖肩部和上胸
        ctx.fillStyle = shirtColor;
        ctx.fillRect((shirtX - 1) * s, 12 * s, (shirtW + 2) * s, 6 * s);
        // 披肩下摆斜线
        ctx.beginPath();
        ctx.moveTo((shirtX - 1) * s, 18 * s);
        ctx.lineTo((shirtX + shirtW + 1) * s, 18 * s);
        ctx.lineTo((shirtX + shirtW - 2) * s, 21 * s);
        ctx.lineTo((shirtX + 1) * s, 21 * s);
        ctx.closePath(); ctx.fill();
    } else {
        // tunic (default)
        ctx.fillRect(shirtX * s, 13 * s, shirtW * s, 10 * s);
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect((shirtX + 1) * s, 14 * s, 5 * s, 8 * s);
    }
    // 女性身体特征
    if (gender === 'female' && type !== 'armor_heavy') {
        const bs = bustSize || 2;
        ctx.fillStyle = 'rgba(0,0,0,0.08)';
        ctx.beginPath();
        ctx.arc((shirtX + Math.floor(shirtW * 0.35)) * s, 17 * s, bs * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc((shirtX + Math.floor(shirtW * 0.65)) * s, 17 * s, bs * s, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ===== 头发渲染 =====
function drawHair(ctx, s, style, color, gender) {
    ctx.fillStyle = color;
    switch (style) {
        case 'bald':
            ctx.fillRect(10 * s, 2 * s, 12 * s, 2 * s);
            break;
        case 'short':
            ctx.fillRect(9 * s, 2 * s, 14 * s, 5 * s);
            break;
        case 'wild': // 狂野发（男）
            ctx.fillRect(8 * s, 1 * s, 16 * s, 6 * s);
            ctx.fillRect(7 * s, 3 * s, 3 * s, 5 * s);
            ctx.fillRect(22 * s, 3 * s, 3 * s, 5 * s);
            ctx.fillRect(9 * s, -1 * s, 4 * s, 4 * s);
            ctx.fillRect(15 * s, -1 * s, 4 * s, 3 * s);
            ctx.fillRect(20 * s, 0 * s, 3 * s, 3 * s);
            break;
        case 'tied': // 束发（男）
            ctx.fillRect(9 * s, 2 * s, 14 * s, 5 * s);
            // 顶部发髻
            ctx.fillRect(13 * s, 0 * s, 6 * s, 3 * s);
            ctx.fillRect(14 * s, -1 * s, 4 * s, 2 * s);
            break;
        case 'wolftail': // 狼尾（男）
            ctx.fillRect(9 * s, 2 * s, 14 * s, 5 * s);
            // 后面长尾
            ctx.fillRect(21 * s, 4 * s, 3 * s, 3 * s);
            ctx.fillRect(23 * s, 6 * s, 2 * s, 8 * s);
            ctx.fillRect(22 * s, 13 * s, 2 * s, 4 * s);
            break;
        case 'braided': // 编发（男）
            ctx.fillRect(9 * s, 2 * s, 14 * s, 5 * s);
            // 两侧编辫
            ctx.fillRect(7 * s, 5 * s, 3 * s, 8 * s);
            ctx.fillRect(22 * s, 5 * s, 3 * s, 8 * s);
            // 辫子结
            ctx.fillRect(7 * s, 12 * s, 2 * s, 2 * s);
            ctx.fillRect(23 * s, 12 * s, 2 * s, 2 * s);
            break;
        case 'samurai': // 武士髻（男）
            ctx.fillRect(9 * s, 3 * s, 14 * s, 4 * s);
            // 顶髻
            ctx.fillRect(14 * s, 0 * s, 4 * s, 4 * s);
            ctx.fillRect(15 * s, -1 * s, 2 * s, 2 * s);
            // 剃两侧
            ctx.fillStyle = 'rgba(0,0,0,0.05)';
            ctx.fillRect(9 * s, 5 * s, 4 * s, 2 * s);
            ctx.fillRect(19 * s, 5 * s, 4 * s, 2 * s);
            ctx.fillStyle = color;
            break;
        case 'medium': // 中长发（女）
            ctx.fillRect(9 * s, 2 * s, 14 * s, 5 * s);
            ctx.fillRect(8 * s, 4 * s, 3 * s, 8 * s);
            ctx.fillRect(21 * s, 4 * s, 3 * s, 8 * s);
            break;
        case 'longstraight': // 长直发（女）
            ctx.fillRect(9 * s, 2 * s, 14 * s, 5 * s);
            ctx.fillRect(7 * s, 3 * s, 3 * s, 14 * s);
            ctx.fillRect(22 * s, 3 * s, 3 * s, 14 * s);
            // 后发
            ctx.fillRect(9 * s, 7 * s, 2 * s, 10 * s);
            ctx.fillRect(21 * s, 7 * s, 2 * s, 10 * s);
            break;
        case 'curly': // 卷发
            ctx.fillRect(8 * s, 1 * s, 16 * s, 6 * s);
            ctx.fillRect(7 * s, 4 * s, 4 * s, 6 * s);
            ctx.fillRect(21 * s, 4 * s, 4 * s, 6 * s);
            ctx.fillRect(10 * s, 0 * s, 4 * s, 3 * s);
            ctx.fillRect(18 * s, 0 * s, 4 * s, 3 * s);
            ctx.fillRect(7 * s, 8 * s, 3 * s, 3 * s);
            ctx.fillRect(22 * s, 8 * s, 3 * s, 3 * s);
            break;
        case 'updo': // 盘发（女）
            ctx.fillRect(9 * s, 2 * s, 14 * s, 5 * s);
            // 盘起的发髻
            ctx.fillRect(12 * s, -1 * s, 8 * s, 4 * s);
            ctx.fillRect(13 * s, -2 * s, 6 * s, 2 * s);
            // 发簪
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(11 * s, 0 * s, 1 * s, 3 * s);
            ctx.fillStyle = color;
            break;
        case 'shoulder': // 披肩发（女）
            ctx.fillRect(9 * s, 2 * s, 14 * s, 5 * s);
            ctx.fillRect(7 * s, 3 * s, 4 * s, 10 * s);
            ctx.fillRect(21 * s, 3 * s, 4 * s, 10 * s);
            // 微卷发梢
            ctx.fillRect(6 * s, 12 * s, 3 * s, 2 * s);
            ctx.fillRect(23 * s, 12 * s, 3 * s, 2 * s);
            break;
        case 'ponytail': // 马尾发（女）
            ctx.fillRect(9 * s, 2 * s, 14 * s, 5 * s);
            ctx.fillRect(21 * s, 3 * s, 3 * s, 4 * s);
            ctx.fillRect(23 * s, 5 * s, 3 * s, 8 * s);
            ctx.fillRect(24 * s, 12 * s, 2 * s, 3 * s);
            break;
        case 'twintails': // 双马尾（女）
            ctx.fillRect(9 * s, 2 * s, 14 * s, 5 * s);
            // 左马尾
            ctx.fillRect(7 * s, 5 * s, 3 * s, 4 * s);
            ctx.fillRect(6 * s, 8 * s, 3 * s, 8 * s);
            ctx.fillRect(5 * s, 14 * s, 2 * s, 3 * s);
            // 右马尾
            ctx.fillRect(22 * s, 5 * s, 3 * s, 4 * s);
            ctx.fillRect(23 * s, 8 * s, 3 * s, 8 * s);
            ctx.fillRect(25 * s, 14 * s, 2 * s, 3 * s);
            break;
        case 'braidedF': // 编辫（女）
            ctx.fillRect(9 * s, 2 * s, 14 * s, 5 * s);
            // 单辫从后面垂下
            ctx.fillRect(14 * s, 7 * s, 4 * s, 2 * s);
            ctx.fillRect(15 * s, 9 * s, 3 * s, 3 * s);
            ctx.fillRect(16 * s, 12 * s, 2 * s, 5 * s);
            // 辫尾
            ctx.fillRect(15 * s, 16 * s, 3 * s, 2 * s);
            break;
        case 'hime': // 公主切（女）
            ctx.fillRect(9 * s, 2 * s, 14 * s, 5 * s);
            // 齐刘海
            ctx.fillRect(10 * s, 5 * s, 12 * s, 2 * s);
            // 两侧直发（不对称，略长）
            ctx.fillRect(7 * s, 3 * s, 4 * s, 12 * s);
            ctx.fillRect(21 * s, 3 * s, 4 * s, 12 * s);
            // 后面长发
            ctx.fillRect(9 * s, 7 * s, 2 * s, 8 * s);
            ctx.fillRect(21 * s, 7 * s, 2 * s, 8 * s);
            break;
        default:
            ctx.fillRect(9 * s, 2 * s, 14 * s, 5 * s);
    }
}

// ===== 服装装饰 =====
function drawClothingDeco(ctx, s, deco, shirtX, shirtW, shirtColor) {
    switch (deco) {
        case 'hemp':
            ctx.fillStyle = 'rgba(255,255,200,0.2)';
            for (let i = 0; i < 3; i++) ctx.fillRect((shirtX + 2 + i * 4) * s, (15 + i * 2) * s, 3 * s, 1 * s);
            break;
        case 'bone':
            ctx.fillStyle = '#F5F5DC';
            ctx.fillRect((shirtX + 2) * s, 15 * s, 2 * s, 1 * s);
            ctx.fillRect((shirtX + shirtW - 4) * s, 15 * s, 2 * s, 1 * s);
            ctx.fillRect((shirtX + Math.floor(shirtW / 2) - 1) * s, 14 * s, 2 * s, 2 * s);
            break;
        case 'fang':
            ctx.fillStyle = '#F5F5DC';
            for (let i = 0; i < 4; i++) {
                ctx.fillRect((shirtX + 1 + i * Math.floor(shirtW / 4)) * s, 22 * s, 1 * s, 2 * s);
            }
            break;
        case 'stone':
            ctx.fillStyle = 'rgba(150,150,150,0.4)';
            ctx.fillRect((shirtX + 2) * s, 15 * s, 4 * s, 4 * s);
            break;
        case 'fur':
            ctx.fillStyle = 'rgba(139,90,43,0.3)';
            ctx.fillRect(shirtX * s, 13 * s, shirtW * s, 2 * s);
            ctx.fillRect(shirtX * s, 21 * s, shirtW * s, 2 * s);
            break;
        case 'totem':
            ctx.fillStyle = 'rgba(255,50,50,0.4)';
            ctx.fillRect((shirtX + Math.floor(shirtW / 2) - 1) * s, 14 * s, 2 * s, 6 * s);
            ctx.fillRect((shirtX + Math.floor(shirtW / 2) - 2) * s, 16 * s, 4 * s, 2 * s);
            break;
        case 'chief':
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(shirtX * s, 13 * s, shirtW * s, 1 * s);
            ctx.fillRect((shirtX + Math.floor(shirtW / 2) - 1) * s, 13 * s, 2 * s, 3 * s);
            break;
        case 'ritual':
            ctx.fillStyle = 'rgba(255,215,0,0.3)';
            ctx.beginPath();
            ctx.moveTo(shirtX * s, 14 * s);
            ctx.lineTo((shirtX + shirtW) * s, 20 * s);
            ctx.lineTo((shirtX + shirtW) * s, 21 * s);
            ctx.lineTo(shirtX * s, 15 * s);
            ctx.closePath(); ctx.fill();
            break;
        case 'shaman':
            ctx.fillStyle = 'rgba(147,112,219,0.4)';
            ctx.fillRect((shirtX + 2) * s, 16 * s, 2 * s, 2 * s);
            ctx.fillRect((shirtX + shirtW - 4) * s, 16 * s, 2 * s, 2 * s);
            ctx.fillStyle = '#FFD700';
            ctx.fillRect((shirtX + Math.floor(shirtW / 2)) * s, 15 * s, 1 * s, 1 * s);
            break;
        case 'fine':
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            for (let i = 0; i < 3; i++) {
                ctx.fillRect((shirtX + 1) * s, (14 + i * 3) * s, (shirtW - 2) * s, 1 * s);
            }
            break;
        case 'noble':
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(shirtX * s, 13 * s, shirtW * s, 1 * s);
            ctx.fillRect(shirtX * s, 22 * s, shirtW * s, 1 * s);
            ctx.fillStyle = 'rgba(255,215,0,0.2)';
            ctx.fillRect((shirtX + 1) * s, 14 * s, 2 * s, 8 * s);
            break;
        case 'king':
            ctx.fillStyle = '#FFD700';
            ctx.fillRect((shirtX - 2) * s, 12 * s, 2 * s, 2 * s);
            ctx.fillRect((shirtX + shirtW) * s, 12 * s, 2 * s, 2 * s);
            ctx.fillStyle = 'rgba(255,215,0,0.15)';
            ctx.fillRect(shirtX * s, 14 * s, shirtW * s, 8 * s);
            break;
        case 'bark':
            ctx.fillStyle = 'rgba(101,67,33,0.3)';
            for (let i = 0; i < 2; i++) {
                ctx.fillRect((shirtX + 1 + i * (shirtW - 3)) * s, 14 * s, 2 * s, 7 * s);
            }
            break;
        case 'feather':
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fillRect((shirtX - 1) * s, 12 * s, 2 * s, 3 * s);
            ctx.fillRect((shirtX + shirtW - 1) * s, 12 * s, 2 * s, 3 * s);
            ctx.fillStyle = 'rgba(255,200,100,0.3)';
            ctx.fillRect((shirtX) * s, 13 * s, shirtW * s, 1 * s);
            break;
        case 'queen':
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(shirtX * s, 13 * s, shirtW * s, 1 * s);
            ctx.fillRect((shirtX + Math.floor(shirtW / 2) - 1) * s, 13 * s, 2 * s, 2 * s);
            ctx.fillStyle = 'rgba(255,105,180,0.2)';
            ctx.fillRect(shirtX * s, 14 * s, shirtW * s, 8 * s);
            break;
    }
}

// ===== 材质纹理叠加 =====
function drawMaterialOverlay(ctx, s, material, shirtX, shirtW) {
    switch (material) {
        case 'metal':
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            ctx.fillRect((shirtX + 1) * s, 14 * s, 2 * s, 8 * s);
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect((shirtX + shirtW - 3) * s, 14 * s, 2 * s, 8 * s);
            break;
        case 'leather':
            ctx.fillStyle = 'rgba(0,0,0,0.06)';
            for (let i = 0; i < 4; i++) ctx.fillRect(shirtX * s, (14 + i * 2) * s, shirtW * s, 1 * s);
            break;
        case 'silk':
            ctx.fillStyle = 'rgba(255,255,255,0.12)';
            ctx.fillRect(shirtX * s, 13 * s, shirtW * s, 10 * s);
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.fillRect((shirtX + 2) * s, 15 * s, (shirtW - 4) * s, 1 * s);
            break;
        case 'beast':
            ctx.fillStyle = 'rgba(0,0,0,0.12)';
            ctx.fillRect((shirtX + 2) * s, 15 * s, 2 * s, 2 * s);
            ctx.fillRect((shirtX + 6) * s, 17 * s, 2 * s, 2 * s);
            ctx.fillRect((shirtX + shirtW - 5) * s, 14 * s, 2 * s, 3 * s);
            ctx.fillRect((shirtX + 3) * s, 19 * s, 3 * s, 2 * s);
            break;
    }
}

// ===== 服装配件渲染 =====
function drawClothingDetails(ctx, s, details, gender, skinColor, colors, shirtX, shirtW, bodyX, bodyW) {
    details.forEach(d => {
        switch (d) {
            // 男性配件
            case 'bone_necklace':
                ctx.fillStyle = '#F5F5DC';
                ctx.fillRect((shirtX + 2) * s, 13 * s, (shirtW - 4) * s, 1 * s);
                ctx.fillRect((shirtX + Math.floor(shirtW / 2)) * s, 13 * s, 1 * s, 2 * s);
                break;
            case 'fang_pendant':
                ctx.fillStyle = '#F5F5DC';
                ctx.fillRect((shirtX + Math.floor(shirtW / 2) - 1) * s, 13 * s, 2 * s, 1 * s);
                ctx.fillRect((shirtX + Math.floor(shirtW / 2)) * s, 14 * s, 1 * s, 2 * s);
                break;
            case 'arm_ring':
                ctx.fillStyle = '#DAA520';
                ctx.fillRect((shirtX - 1) * s, 17 * s, 1 * s, 2 * s);
                ctx.fillRect((shirtX + shirtW) * s, 17 * s, 1 * s, 2 * s);
                break;
            case 'bone_buckle':
                ctx.fillStyle = '#F5F5DC';
                ctx.fillRect((shirtX + Math.floor(shirtW / 2) - 1) * s, 21 * s, 2 * s, 2 * s);
                break;
            case 'shoulder_guard':
                ctx.fillStyle = '#8B7355';
                ctx.fillRect((shirtX - 2) * s, 13 * s, 3 * s, 3 * s);
                ctx.fillRect((shirtX + shirtW - 1) * s, 13 * s, 3 * s, 3 * s);
                break;
            case 'wrist_guard':
                ctx.fillStyle = '#8B7355';
                ctx.fillRect((shirtX - 2) * s, 21 * s, 2 * s, 3 * s);
                ctx.fillRect((shirtX + shirtW) * s, 21 * s, 2 * s, 3 * s);
                break;
            case 'leg_guard':
                ctx.fillStyle = '#8B7355';
                ctx.fillRect((bodyX) * s, 26 * s, 3 * s, 3 * s);
                ctx.fillRect((bodyX + bodyW - 3) * s, 26 * s, 3 * s, 3 * s);
                break;
            case 'tattoo':
                ctx.fillStyle = 'rgba(0,100,150,0.3)';
                ctx.fillRect((shirtX - 1) * s, 15 * s, 1 * s, 4 * s);
                ctx.fillRect((shirtX + shirtW) * s, 15 * s, 1 * s, 4 * s);
                break;
            case 'war_paint':
                ctx.fillStyle = 'rgba(200,0,0,0.4)';
                ctx.fillRect(11 * s, 9 * s, 2 * s, 1 * s);
                ctx.fillRect(19 * s, 9 * s, 2 * s, 1 * s);
                ctx.fillRect(13 * s, 10 * s, 6 * s, 1 * s);
                break;
            case 'feather_deco':
                ctx.fillStyle = '#FF6347';
                ctx.fillRect(8 * s, 2 * s, 1 * s, 4 * s);
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(7 * s, 2 * s, 1 * s, 3 * s);
                break;
            // 女性配件
            case 'flower_crown':
                ctx.fillStyle = '#FF69B4';
                ctx.fillRect(10 * s, 1 * s, 2 * s, 2 * s);
                ctx.fillRect(14 * s, 0 * s, 2 * s, 2 * s);
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(18 * s, 1 * s, 2 * s, 2 * s);
                ctx.fillStyle = '#90EE90';
                ctx.fillRect(12 * s, 1 * s, 2 * s, 1 * s);
                ctx.fillRect(16 * s, 1 * s, 2 * s, 1 * s);
                break;
            case 'shell_necklace':
                ctx.fillStyle = '#FFE4C4';
                ctx.fillRect((shirtX + 2) * s, 13 * s, (shirtW - 4) * s, 1 * s);
                ctx.fillStyle = '#FFC0CB';
                ctx.fillRect((shirtX + Math.floor(shirtW / 2)) * s, 14 * s, 1 * s, 1 * s);
                break;
            case 'bracelet':
                ctx.fillStyle = '#DAA520';
                ctx.fillRect((shirtX - 1) * s, 22 * s, 1 * s, 1 * s);
                ctx.fillRect((shirtX + shirtW) * s, 22 * s, 1 * s, 1 * s);
                break;
            case 'rope_belt':
                ctx.fillStyle = '#DEB887';
                ctx.fillRect(shirtX * s, 21 * s, shirtW * s, 1 * s);
                ctx.fillStyle = '#D2B48C';
                ctx.fillRect((shirtX + 1) * s, 22 * s, 2 * s, 2 * s);
                break;
            case 'shoulder_deco':
                ctx.fillStyle = '#FFD700';
                ctx.fillRect((shirtX - 1) * s, 13 * s, 2 * s, 2 * s);
                ctx.fillRect((shirtX + shirtW - 1) * s, 13 * s, 2 * s, 2 * s);
                break;
            case 'anklet':
                ctx.fillStyle = '#DAA520';
                ctx.fillRect((bodyX - 1) * s, 28 * s, 2 * s, 1 * s);
                ctx.fillRect((bodyX + bodyW - 1) * s, 28 * s, 2 * s, 1 * s);
                break;
            case 'earring':
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(7 * s, 8 * s, 1 * s, 2 * s);
                ctx.fillRect(24 * s, 8 * s, 1 * s, 2 * s);
                break;
            case 'tribal_paint':
                ctx.fillStyle = 'rgba(100,0,200,0.3)';
                ctx.fillRect(10 * s, 10 * s, 3 * s, 1 * s);
                ctx.fillRect(19 * s, 10 * s, 3 * s, 1 * s);
                break;
            case 'fur_scarf':
                ctx.fillStyle = '#D2B48C';
                ctx.fillRect((shirtX - 1) * s, 12 * s, (shirtW + 2) * s, 2 * s);
                ctx.fillStyle = 'rgba(139,90,43,0.4)';
                ctx.fillRect(shirtX * s, 12 * s, 2 * s, 1 * s);
                ctx.fillRect((shirtX + shirtW - 2) * s, 12 * s, 2 * s, 1 * s);
                break;
        }
    });
}

// ===== 发型预览（小头像）=====
function drawHairPreview(ctx, style, color, skinColor) {
    const sc = skinColor || '#F5CBA7';
    ctx.fillStyle = sc;
    ctx.fillRect(10, 10, 16, 16);
    ctx.fillStyle = '#2C3E50';
    ctx.fillRect(14, 17, 3, 3);
    ctx.fillRect(20, 17, 3, 3);
    ctx.fillStyle = color;
    switch (style) {
        case 'bald':
            ctx.fillRect(10, 9, 16, 3);
            break;
        case 'short':
            ctx.fillRect(9, 9, 18, 6);
            break;
        case 'wild':
            ctx.fillRect(8, 8, 20, 6);
            ctx.fillRect(7, 10, 3, 5);
            ctx.fillRect(26, 10, 3, 5);
            ctx.fillRect(10, 5, 4, 4);
            ctx.fillRect(16, 5, 4, 3);
            ctx.fillRect(22, 6, 3, 3);
            break;
        case 'tied':
            ctx.fillRect(9, 9, 18, 6);
            ctx.fillRect(14, 5, 8, 5);
            ctx.fillRect(16, 3, 4, 3);
            break;
        case 'wolftail':
            ctx.fillRect(9, 9, 18, 6);
            ctx.fillRect(25, 10, 3, 4);
            ctx.fillRect(27, 13, 3, 8);
            break;
        case 'braided':
            ctx.fillRect(9, 9, 18, 6);
            ctx.fillRect(7, 12, 3, 8);
            ctx.fillRect(26, 12, 3, 8);
            ctx.fillRect(7, 19, 2, 2);
            ctx.fillRect(27, 19, 2, 2);
            break;
        case 'samurai':
            ctx.fillRect(9, 10, 18, 5);
            ctx.fillRect(15, 5, 6, 6);
            ctx.fillRect(17, 3, 3, 3);
            break;
        case 'medium':
            ctx.fillRect(9, 9, 18, 6);
            ctx.fillRect(7, 11, 4, 8);
            ctx.fillRect(25, 11, 4, 8);
            break;
        case 'longstraight':
            ctx.fillRect(9, 9, 18, 6);
            ctx.fillRect(7, 9, 3, 15);
            ctx.fillRect(26, 9, 3, 15);
            break;
        case 'curly':
            ctx.fillRect(8, 8, 20, 6);
            ctx.fillRect(7, 11, 4, 6);
            ctx.fillRect(25, 11, 4, 6);
            ctx.fillRect(10, 5, 4, 4);
            ctx.fillRect(18, 5, 4, 4);
            break;
        case 'updo':
            ctx.fillRect(9, 9, 18, 6);
            ctx.fillRect(12, 4, 12, 6);
            ctx.fillRect(14, 2, 8, 3);
            break;
        case 'shoulder':
            ctx.fillRect(9, 9, 18, 6);
            ctx.fillRect(7, 9, 4, 12);
            ctx.fillRect(25, 9, 4, 12);
            ctx.fillRect(6, 19, 3, 2);
            ctx.fillRect(27, 19, 3, 2);
            break;
        case 'ponytail':
            ctx.fillRect(9, 9, 18, 6);
            ctx.fillRect(25, 10, 3, 4);
            ctx.fillRect(27, 13, 3, 6);
            break;
        case 'twintails':
            ctx.fillRect(9, 9, 18, 6);
            ctx.fillRect(7, 12, 3, 4);
            ctx.fillRect(6, 15, 3, 8);
            ctx.fillRect(26, 12, 3, 4);
            ctx.fillRect(27, 15, 3, 8);
            break;
        case 'braidedF':
            ctx.fillRect(9, 9, 18, 6);
            ctx.fillRect(15, 14, 5, 2);
            ctx.fillRect(16, 16, 3, 5);
            ctx.fillRect(15, 20, 4, 2);
            break;
        case 'hime':
            ctx.fillRect(9, 9, 18, 6);
            ctx.fillRect(10, 13, 16, 2);
            ctx.fillRect(7, 9, 4, 13);
            ctx.fillRect(25, 9, 4, 13);
            break;
        default:
            ctx.fillRect(9, 9, 18, 6);
    }
}

// ===== 角色创建 =====
function initCharCreate() {
    let selectedClass = null;
    let customAppear = {
        gender: 'male',
        bodyType: 'normal',
        hairStyle: 'short',
        hairColor: HAIR_COLORS[0],
        skinColor: SKIN_COLORS[1].color,
        clothingStyle: 'm_rough_tunic',
        clothingCategory: 'simple',
        outfitColor: OUTFIT_COLORS[0].color,
        outfitColor2: OUTFIT_COLORS[7].color,
        material: 'cloth',
        details: [],
    };

    // ----- 通用UI构建 -----
    function buildSwatches(containerId, colors, key) {
        const wrap = $(containerId);
        wrap.innerHTML = '';
        colors.forEach(c => {
            const d = document.createElement('div');
            d.className = 'appear-swatch' + (c === customAppear[key] ? ' selected' : '');
            d.style.background = c;
            d.onclick = () => {
                customAppear[key] = c;
                wrap.querySelectorAll('.appear-swatch').forEach(s => s.classList.remove('selected'));
                d.classList.add('selected');
                refreshPreview();
            };
            wrap.appendChild(d);
        });
    }

    function buildNamedSwatches(containerId, items, key) {
        const wrap = $(containerId);
        wrap.innerHTML = '';
        items.forEach(item => {
            const d = document.createElement('div');
            const cur = customAppear[key];
            d.className = 'appear-swatch' + (item.color === cur ? ' selected' : '');
            d.style.background = item.color;
            d.title = item.name;
            d.onclick = () => {
                customAppear[key] = item.color;
                wrap.querySelectorAll('.appear-swatch').forEach(s => s.classList.remove('selected'));
                d.classList.add('selected');
                if (key === 'skinColor') rebuildHairStyles();
                refreshPreview();
            };
            wrap.appendChild(d);
        });
    }

    function buildOptionBtns(containerId, options, key) {
        const wrap = $(containerId);
        wrap.innerHTML = '';
        options.forEach(opt => {
            const btn = document.createElement('div');
            btn.className = 'appear-option-btn' + (opt.id === customAppear[key] ? ' selected' : '');
            btn.textContent = opt.name;
            btn.onclick = () => {
                customAppear[key] = opt.id;
                wrap.querySelectorAll('.appear-option-btn').forEach(s => s.classList.remove('selected'));
                btn.classList.add('selected');
                refreshPreview();
            };
            wrap.appendChild(btn);
        });
    }

    // ----- 性别切换 -----
    function buildGender() {
        const wrap = $('genderPicks');
        wrap.innerHTML = '';
        GENDERS.forEach(g => {
            const btn = document.createElement('div');
            btn.className = 'appear-option-btn' + (g.id === customAppear.gender ? ' selected' : '');
            btn.textContent = g.name;
            btn.onclick = () => {
                if (customAppear.gender === g.id) return;
                customAppear.gender = g.id;
                wrap.querySelectorAll('.appear-option-btn').forEach(s => s.classList.remove('selected'));
                btn.classList.add('selected');
                // 重置性别相关选项
                const bTypes = BODY_TYPES[g.id];
                customAppear.bodyType = bTypes[1] ? bTypes[1].id : bTypes[0].id;
                const hStyles = HAIR_STYLES[g.id];
                customAppear.hairStyle = hStyles[0].id;
                // 重置服装
                const cat = customAppear.clothingCategory || 'simple';
                const cStyles = CLOTHING_STYLES[g.id][cat];
                customAppear.clothingStyle = cStyles[0].id;
                customAppear.details = [];
                rebuildGenderDependentUI();
                refreshPreview();
            };
            wrap.appendChild(btn);
        });
    }

    function rebuildGenderDependentUI() {
        const g = customAppear.gender;
        buildOptionBtns('bodyTypePicks', BODY_TYPES[g], 'bodyType');
        rebuildHairStyles();
        rebuildClothingStyles();
        rebuildDetails();
    }

    // ----- 发型（canvas预览）-----
    function rebuildHairStyles() {
        const wrap = $('hairStylePicks');
        wrap.innerHTML = '';
        const styles = HAIR_STYLES[customAppear.gender];
        styles.forEach(hs => {
            const c = document.createElement('canvas');
            c.width = 36; c.height = 36;
            c.className = 'appear-swatch-style' + (hs.id === customAppear.hairStyle ? ' selected' : '');
            c.title = hs.name;
            const cx = c.getContext('2d');
            drawHairPreview(cx, hs.id, customAppear.hairColor, customAppear.skinColor);
            c.onclick = () => {
                customAppear.hairStyle = hs.id;
                wrap.querySelectorAll('.appear-swatch-style').forEach(s => s.classList.remove('selected'));
                c.classList.add('selected');
                refreshPreview();
            };
            wrap.appendChild(c);
        });
    }

    // ----- 服装分类切换 -----
    function rebuildClothingStyles() {
        const g = customAppear.gender;
        const tabWrap = $('clothingCategoryTabs');
        const styleWrap = $('clothingStylePicks');
        tabWrap.innerHTML = '';
        CLOTHING_CATEGORIES.forEach(cat => {
            const btn = document.createElement('div');
            btn.className = 'appear-tab-btn' + (cat.id === customAppear.clothingCategory ? ' active' : '');
            btn.textContent = cat.name;
            btn.onclick = () => {
                customAppear.clothingCategory = cat.id;
                const styles = CLOTHING_STYLES[g][cat.id];
                customAppear.clothingStyle = styles[0].id;
                tabWrap.querySelectorAll('.appear-tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                buildClothingOptions(g, cat.id);
                refreshPreview();
            };
            tabWrap.appendChild(btn);
        });
        buildClothingOptions(g, customAppear.clothingCategory);
    }

    function buildClothingOptions(gender, catId) {
        const wrap = $('clothingStylePicks');
        wrap.innerHTML = '';
        const styles = CLOTHING_STYLES[gender][catId];
        styles.forEach(cs => {
            const btn = document.createElement('div');
            btn.className = 'appear-option-btn' + (cs.id === customAppear.clothingStyle ? ' selected' : '');
            btn.textContent = cs.name;
            btn.onclick = () => {
                customAppear.clothingStyle = cs.id;
                wrap.querySelectorAll('.appear-option-btn').forEach(s => s.classList.remove('selected'));
                btn.classList.add('selected');
                refreshPreview();
            };
            wrap.appendChild(btn);
        });
    }

    // ----- 服装配件（多选）-----
    function rebuildDetails() {
        const wrap = $('detailPicks');
        wrap.innerHTML = '';
        const items = CLOTHING_DETAILS[customAppear.gender];
        items.forEach(det => {
            const btn = document.createElement('div');
            const isOn = customAppear.details.includes(det.id);
            btn.className = 'appear-detail-btn' + (isOn ? ' active' : '');
            btn.textContent = det.name;
            btn.onclick = () => {
                const idx = customAppear.details.indexOf(det.id);
                if (idx >= 0) {
                    customAppear.details.splice(idx, 1);
                    btn.classList.remove('active');
                } else {
                    customAppear.details.push(det.id);
                    btn.classList.add('active');
                }
                refreshPreview();
            };
            wrap.appendChild(btn);
        });
    }

    // ----- 构建所有UI -----
    buildGender();
    rebuildGenderDependentUI();
    rebuildHairStyles();
    buildSwatches('hairColorPicks', HAIR_COLORS, 'hairColor');
    buildNamedSwatches('skinColorPicks', SKIN_COLORS, 'skinColor');
    buildNamedSwatches('outfitColorPicks', OUTFIT_COLORS, 'outfitColor');
    buildNamedSwatches('outfitColor2Picks', OUTFIT_COLORS, 'outfitColor2');
    buildOptionBtns('materialPicks', MATERIAL_TEXTURES, 'material');

    // ----- 预览循环 -----
    let previewTick = 0;
    let previewAnimId = null;
    function refreshPreview() {
        // 刷新发型canvas
        const wrap = $('hairStylePicks');
        const styles = HAIR_STYLES[customAppear.gender];
        wrap.querySelectorAll('.appear-swatch-style').forEach((c, i) => {
            if (i < styles.length) {
                const cx = c.getContext('2d');
                cx.clearRect(0, 0, 36, 36);
                drawHairPreview(cx, styles[i].id, customAppear.hairColor, customAppear.skinColor);
            }
        });
    }
    function previewLoop() {
        const canvas = $('charPreview');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawSVGChar(ctx, 16, 10, 96, selectedClass, 'right', previewTick, customAppear);
        previewTick++;
        previewAnimId = requestAnimationFrame(previewLoop);
    }
    previewLoop();

    document.querySelectorAll('.class-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.class-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedClass = card.dataset.class;
        });
    });
    $('btnCreate').onclick = () => {
        const name = $('charName').value.trim() || '原始人';
        game = newGameState(name, null, customAppear);
        if (previewAnimId) cancelAnimationFrame(previewAnimId);
        showScreen('main');
        initMainUI();
        toast(`${name}踏上了冒险之旅！`);
    };
}

// ==================== SVG 可组合角色渲染引擎 ====================

const CHAR_SVG_PARTS = {
    body:   ['male-lean','male-normal','male-strong','male-burly','female-slim','female-normal','female-curvy','female-athletic'],
    hair:   ['bald','short','wild','tied','wolftail','braided','samurai','medium','longstraight','curly','updo','shoulder','ponytail','twintails','braidedF','hime'],
    bottom: ['long','shorts','skirt','skirt_long','loincloth'],
    top:    ['tunic','vest','wrap','poncho','crop','armor','armor_heavy','robe','shawl'],
    weapon: ['warrior','hunter','shaman'],
    deco:   ['hemp','bone','fang','stone','fur','totem','chief','ritual','shaman','fine','noble','king','bark','feather','queen'],
    material: ['metal','leather','silk','beast'],
    detail: ['bone_necklace','fang_pendant','arm_ring','bone_buckle','shoulder_guard','wrist_guard','leg_guard','tattoo','war_paint','feather_deco','flower_crown','shell_necklace','bracelet','rope_belt','shoulder_deco','anklet','earring','tribal_paint','fur_scarf'],
};

// 走路帧名称后缀
const WALK_FRAMES = ['walk1', 'walk2'];

const _charSvgTextCache = {};   // path → raw SVG text
const _charSvgImageCache = {};  // cacheKey → Image
let _charSvgReady = false;

async function preloadCharSVGs() {
    const promises = [];
    for (const [cat, parts] of Object.entries(CHAR_SVG_PARTS)) {
        for (const p of parts) {
            // 加载 idle 帧
            const path = `assets/char/${cat}/${p}.svg`;
            if (!_charSvgTextCache[path]) {
                promises.push(
                    fetch(path).then(r => r.text()).then(t => { _charSvgTextCache[path] = t; })
                        .catch(e => console.warn('SVG char part load failed:', path, e))
                );
            }
            // body 和 bottom 额外加载走路帧
            if (cat === 'body' || cat === 'bottom') {
                for (const wf of WALK_FRAMES) {
                    const wpath = `assets/char/${cat}/${p}-${wf}.svg`;
                    if (!_charSvgTextCache[wpath]) {
                        promises.push(
                            fetch(wpath).then(r => r.text()).then(t => { _charSvgTextCache[wpath] = t; })
                                .catch(e => console.warn('SVG walk frame load failed:', wpath, e))
                        );
                    }
                }
            }
        }
    }
    await Promise.all(promises);
    _charSvgReady = true;
}

function _replaceClass(svg, cls, color) {
    const re = new RegExp('\\.' + cls + '\\s*\\{[^}]*fill:\\s*[^;\\}]+', 'g');
    return svg.replace(re, '.' + cls + ' { fill: ' + color);
}

function getCharSVGImage(path, colors) {
    const vals = [];
    for (const k of ['skin','primary','secondary','hairFill']) vals.push(colors[k] || '');
    const cacheKey = path + '|' + vals.join(',');
    if (_charSvgImageCache[cacheKey]) return _charSvgImageCache[cacheKey];
    const raw = _charSvgTextCache[path];
    if (!raw) return null;
    let svg = raw;
    if (colors.skin)      svg = _replaceClass(svg, 'skin', colors.skin);
    if (colors.primary)   svg = _replaceClass(svg, 'primary', colors.primary);
    if (colors.secondary) svg = _replaceClass(svg, 'secondary', colors.secondary);
    if (colors.hairFill)  svg = _replaceClass(svg, 'hair-fill', colors.hairFill);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => URL.revokeObjectURL(url);
    img.src = url;
    _charSvgImageCache[cacheKey] = img;
    return img;
}

function _imgReady(img) {
    return img && img.complete && img.naturalWidth > 0;
}

function drawSVGChar(ctx, x, y, size, cls, facing, frame, customAppear) {
    if (!_charSvgReady) {
        drawPixelChar(ctx, x, y, size, cls, facing, frame, customAppear);
        return;
    }
    const baseColors = CLASS_COLORS[cls] || CLASS_COLORS.warrior;
    let appear = customAppear || (typeof game !== 'undefined' && game && game.appearance) || null;
    appear = normalizeAppearance(appear);
    const skinColor  = (appear && appear.skinColor) || SKIN_COLOR;
    const hairColor  = (appear && appear.hairColor) || baseColors.hair;
    const outfitColor  = (appear && (appear.outfitColor || appear.shirtColor)) || baseColors.shirt;
    const outfitColor2 = (appear && (appear.outfitColor2 || appear.pantsColor)) || baseColors.pants;
    const gender    = (appear && appear.gender) || 'male';
    const bodyType  = (appear && appear.bodyType) || 'normal';
    const hairStyle = (appear && appear.hairStyle) || (cls === 'shaman' ? 'longstraight' : cls === 'warrior' ? 'wild' : 'short');
    const clothDef  = appear ? findClothingDef(appear.clothingStyle, gender) : null;
    const topType    = clothDef ? clothDef.top : 'tunic';
    const bottomType = clothDef ? clothDef.bottom : 'long';
    const decoType   = clothDef ? clothDef.deco : null;
    const material   = (appear && appear.material) || 'cloth';
    const details    = (appear && appear.details) || [];

    const bodyPath   = `assets/char/body/${gender}-${bodyType}.svg`;
    const hairPath   = `assets/char/hair/${hairStyle}.svg`;
    const bottomPath = `assets/char/bottom/${bottomType}.svg`;
    const topPath    = `assets/char/top/${topType}.svg`;
    const weaponPath = `assets/char/weapon/${cls}.svg`;

    // 根据行走相位选择动作帧
    const isWalking = frame > 0;
    const walkPhase = isWalking ? Math.sin(frame * 0.15) : 0;
    let walkSuffix = '';
    if (isWalking) {
        walkSuffix = walkPhase > 0.25 ? '-walk1' : walkPhase < -0.25 ? '-walk2' : '';
    }
    const bodyFramePath   = walkSuffix ? `assets/char/body/${gender}-${bodyType}${walkSuffix}.svg` : bodyPath;
    const bottomFramePath = walkSuffix ? `assets/char/bottom/${bottomType}${walkSuffix}.svg` : bottomPath;

    const bodyImg   = getCharSVGImage(bodyFramePath,   { skin: skinColor });
    const hairImg   = getCharSVGImage(hairPath,   { hairFill: hairColor });
    const bottomImg = getCharSVGImage(bottomFramePath, { primary: outfitColor2 });
    const topImg    = getCharSVGImage(topPath,    { primary: outfitColor });
    const weaponImg = getCharSVGImage(weaponPath, {});

    if (!_imgReady(bodyImg) || !_imgReady(hairImg) || !_imgReady(bottomImg) || !_imgReady(topImg)) {
        drawPixelChar(ctx, x, y, size, cls, facing, frame, customAppear);
        return;
    }

    const s = size / 32;
    const walkBob = isWalking ? Math.sin(frame * 0.15) * 2 * s : 0;
    const armSwing = isWalking ? Math.sin(frame * 0.15) * 15 : 0; // degrees

    ctx.save();
    ctx.translate(x, y);

    // 阴影
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(16 * s, 31 * s, 8 * s, 3 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // 朝向翻转
    if (facing === 'left') {
        ctx.translate(size, 0);
        ctx.scale(-1, 1);
    }

    // === 下装：使用动作帧 SVG ===
    ctx.drawImage(bottomImg, 0, walkBob, size, size);

    // === 身体：使用动作帧 SVG ===
    ctx.drawImage(bodyImg, 0, walkBob, size, size);

    // === 上装 ===
    ctx.drawImage(topImg, 0, walkBob, size, size);

    // === 装饰层 (deco)：绘制在上装上方 ===
    if (decoType) {
        const decoImg = getCharSVGImage(`assets/char/deco/${decoType}.svg`, {});
        if (_imgReady(decoImg)) ctx.drawImage(decoImg, 0, walkBob, size, size);
    }

    // === 材质纹理 (material)：半透明叠加 ===
    if (material && material !== 'cloth' && material !== 'matte') {
        const matImg = getCharSVGImage(`assets/char/material/${material}.svg`, {});
        if (_imgReady(matImg)) ctx.drawImage(matImg, 0, walkBob, size, size);
    }

    // === 头发：跟随身体移动 ===
    ctx.drawImage(hairImg, 0, walkBob, size, size);

    // === 配件 (details)：最上层叠加 ===
    if (details.length > 0) {
        for (const d of details) {
            const detImg = getCharSVGImage(`assets/char/detail/${d}.svg`, {});
            if (_imgReady(detImg)) ctx.drawImage(detImg, 0, walkBob, size, size);
        }
    }

    // === 武器：放在手上，跟随手臂摆动 ===
    if (_imgReady(weaponImg)) {
        ctx.save();
        // 武器定位到右手位置 (shirtX + shirtW 附近)
        const handX = 23 * s;  // 右手 x 位置
        const handY = 14 * s + walkBob;  // 肩膀 y 位置
        ctx.translate(handX, handY);
        ctx.rotate(armSwing * Math.PI / 180);
        // 武器绘制尺寸缩小到手持比例
        const wpnSize = size * 0.55;
        ctx.drawImage(weaponImg, -wpnSize * 0.2, -wpnSize * 0.3, wpnSize, wpnSize);
        ctx.restore();
    }

    ctx.restore();
}
