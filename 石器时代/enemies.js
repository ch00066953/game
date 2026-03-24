// ==================== 石器时代 - 敌人像素绘制模块 ====================

const ENEMY_DRAW = {
    '小恐龙':   { body: '#6B8E23', eye: '#FF0', accent: '#4A6B14', type: 'dino',    scale: 0.7 },
    '野猪':     { body: '#8B6914', eye: '#000', accent: '#6B4226', type: 'boar',    scale: 0.8 },
    '毒蛇':     { body: '#228B22', eye: '#FF0', accent: '#006400', type: 'snake',   scale: 0.8 },
    '迅猛龙':   { body: '#2E8B57', eye: '#FF4444', accent: '#1B5E3B', type: 'raptor', scale: 1.0 },
    '巨蜥':     { body: '#556B2F', eye: '#FFD700', accent: '#3B4A1F', type: 'dino',  scale: 1.1 },
    '森林猛犸': { body: '#8B6914', eye: '#222', accent: '#6B4B10', type: 'mammoth', scale: 1.2 },
    '沙漠蝎':   { body: '#8B4513', eye: '#FF0', accent: '#5D2E0C', type: 'scorpion', scale: 0.9 },
    '骆驼龙':   { body: '#D2B48C', eye: '#333', accent: '#A0825A', type: 'camel',   scale: 1.0 },
    '沙暴巨虫': { body: '#DAA520', eye: '#FF4444', accent: '#B8860B', type: 'worm',  scale: 1.1 },
    '火蜥蜴':   { body: '#FF4500', eye: '#FFD700', accent: '#CC3700', type: 'dino',  scale: 0.9 },
    '熔岩龙':   { body: '#CC0000', eye: '#FFD700', accent: '#8B0000', type: 'dragon', scale: 1.2 },
    '火山暴龙': { body: '#800000', eye: '#FF4444', accent: '#4A0000', type: 'raptor', scale: 1.4 },
    '冰霜狼':   { body: '#B0C4DE', eye: '#00BFFF', accent: '#7A9AB8', type: 'wolf',  scale: 1.0 },
    '猛犸象':   { body: '#A0522D', eye: '#222', accent: '#6B3410', type: 'mammoth', scale: 1.5 },
    '冰龙王':   { body: '#4169E1', eye: '#FFD700', accent: '#1E3A8A', type: 'dragon', scale: 1.5 },
};

function drawPixelEnemy(ctx, name, size, frame) {
    const info = ENEMY_DRAW[name];
    if (!info) return;
    const s = (size / 100) * (info.scale || 1);
    const bob = Math.sin((frame || 0) * 0.04) * 3;
    ctx.save();
    ctx.translate(size * 0.5, size * 0.5 + bob);
    switch (info.type) {
        case 'dino': drawDino(ctx, s, info); break;
        case 'raptor': drawRaptor(ctx, s, info); break;
        case 'boar': drawBoar(ctx, s, info); break;
        case 'snake': drawSnake(ctx, s, info, frame); break;
        case 'mammoth': drawMammoth(ctx, s, info); break;
        case 'scorpion': drawScorpion(ctx, s, info); break;
        case 'camel': drawCamel(ctx, s, info); break;
        case 'worm': drawWorm(ctx, s, info, frame); break;
        case 'dragon': drawDragon(ctx, s, info, frame); break;
        case 'wolf': drawWolf(ctx, s, info); break;
    }
    ctx.restore();
}

function drawDino(ctx, s, c) {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath(); ctx.ellipse(0, 38*s, 22*s, 6*s, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = c.accent;
    ctx.fillRect(18*s, -5*s, 20*s, 10*s);
    ctx.fillRect(35*s, -10*s, 10*s, 8*s);
    ctx.fillStyle = c.body;
    ctx.fillRect(-18*s, -15*s, 36*s, 30*s);
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(-12*s, -2*s, 24*s, 16*s);
    ctx.fillStyle = c.body;
    ctx.fillRect(-32*s, -25*s, 22*s, 22*s);
    ctx.fillStyle = c.accent;
    ctx.fillRect(-38*s, -12*s, 16*s, 8*s);
    ctx.fillStyle = '#FFF';
    ctx.fillRect(-36*s, -6*s, 3*s, 4*s);
    ctx.fillRect(-30*s, -6*s, 3*s, 4*s);
    ctx.fillStyle = '#FFF';
    ctx.fillRect(-28*s, -22*s, 8*s, 7*s);
    ctx.fillStyle = c.eye;
    ctx.fillRect(-24*s, -20*s, 4*s, 5*s);
    ctx.fillStyle = c.accent;
    ctx.fillRect(-14*s, 14*s, 8*s, 20*s);
    ctx.fillRect(6*s, 14*s, 8*s, 20*s);
    ctx.fillStyle = '#333';
    ctx.fillRect(-17*s, 32*s, 4*s, 4*s);
    ctx.fillRect(-12*s, 32*s, 4*s, 4*s);
    ctx.fillRect(3*s, 32*s, 4*s, 4*s);
    ctx.fillRect(8*s, 32*s, 4*s, 4*s);
    ctx.fillStyle = c.accent;
    for (let i = 0; i < 4; i++) {
        ctx.fillRect((-10 + i*8)*s, (-18 - i*2)*s, 4*s, 5*s);
    }
}

function drawRaptor(ctx, s, c) {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath(); ctx.ellipse(0, 38*s, 20*s, 5*s, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = c.accent;
    ctx.beginPath();
    ctx.moveTo(15*s, -5*s);
    ctx.lineTo(45*s, -20*s);
    ctx.lineTo(44*s, -10*s);
    ctx.lineTo(15*s, 5*s);
    ctx.fill();
    ctx.fillStyle = c.body;
    ctx.fillRect(-15*s, -12*s, 30*s, 24*s);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(-10*s, 0, 20*s, 12*s);
    ctx.fillStyle = c.body;
    ctx.fillRect(-35*s, -22*s, 25*s, 18*s);
    ctx.fillStyle = c.accent;
    ctx.beginPath();
    ctx.moveTo(-35*s, -18*s);
    ctx.lineTo(-48*s, -12*s);
    ctx.lineTo(-35*s, -5*s);
    ctx.fill();
    ctx.fillStyle = '#FFF';
    for (let i = 0; i < 4; i++) ctx.fillRect((-46+i*3)*s, -7*s, 2*s, 4*s);
    ctx.fillStyle = '#FFF';
    ctx.fillRect(-30*s, -20*s, 8*s, 7*s);
    ctx.fillStyle = c.eye;
    ctx.fillRect(-26*s, -18*s, 5*s, 5*s);
    ctx.fillStyle = c.accent;
    ctx.fillRect(-10*s, 12*s, 7*s, 22*s);
    ctx.fillRect(5*s, 12*s, 7*s, 22*s);
    ctx.fillStyle = '#333';
    ctx.fillRect(-14*s, 32*s, 5*s, 4*s);
    ctx.fillRect(-8*s, 32*s, 5*s, 4*s);
    ctx.fillRect(2*s, 32*s, 5*s, 4*s);
    ctx.fillRect(8*s, 32*s, 5*s, 4*s);
    ctx.fillStyle = c.body;
    ctx.fillRect(-18*s, -2*s, 5*s, 10*s);
}

function drawBoar(ctx, s, c) {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath(); ctx.ellipse(0, 28*s, 24*s, 6*s, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = c.body;
    ctx.beginPath(); ctx.ellipse(0, 0, 28*s, 20*s, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath(); ctx.ellipse(0, 6*s, 20*s, 12*s, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = c.body;
    ctx.fillRect(-38*s, -14*s, 18*s, 20*s);
    ctx.fillStyle = '#D4837A';
    ctx.fillRect(-44*s, -4*s, 10*s, 10*s);
    ctx.fillStyle = '#333';
    ctx.fillRect(-42*s, -1*s, 3*s, 3*s);
    ctx.fillRect(-37*s, -1*s, 3*s, 3*s);
    ctx.fillStyle = '#FFFFF0';
    ctx.fillRect(-40*s, -8*s, 3*s, 8*s);
    ctx.fillRect(-34*s, -8*s, 3*s, 8*s);
    ctx.fillStyle = '#FFF';
    ctx.fillRect(-34*s, -12*s, 7*s, 5*s);
    ctx.fillStyle = c.eye;
    ctx.fillRect(-31*s, -11*s, 4*s, 4*s);
    ctx.fillStyle = c.accent;
    ctx.fillRect(-36*s, -20*s, 6*s, 8*s);
    ctx.fillRect(-28*s, -20*s, 6*s, 8*s);
    ctx.fillStyle = c.accent;
    ctx.fillRect(26*s, -8*s, 10*s, 4*s);
    ctx.fillRect(34*s, -12*s, 4*s, 8*s);
    ctx.fillStyle = c.accent;
    ctx.fillRect(-18*s, 16*s, 7*s, 14*s);
    ctx.fillRect(-6*s, 16*s, 7*s, 14*s);
    ctx.fillRect(6*s, 16*s, 7*s, 14*s);
    ctx.fillRect(16*s, 16*s, 7*s, 14*s);
    ctx.fillStyle = '#333';
    ctx.fillRect(-18*s, 28*s, 7*s, 3*s);
    ctx.fillRect(-6*s, 28*s, 7*s, 3*s);
    ctx.fillRect(6*s, 28*s, 7*s, 3*s);
    ctx.fillRect(16*s, 28*s, 7*s, 3*s);
    ctx.fillStyle = c.accent;
    for (let i = 0; i < 5; i++) ctx.fillRect((-20+i*6)*s, -22*s, 4*s, 6*s);
}

function drawSnake(ctx, s, c, frame) {
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath(); ctx.ellipse(0, 25*s, 30*s, 5*s, 0, 0, Math.PI*2); ctx.fill();
    const wave = Math.sin((frame || 0) * 0.08) * 5;
    ctx.fillStyle = c.body;
    ctx.lineWidth = 12 * s;
    ctx.strokeStyle = c.body;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(30*s, 20*s);
    ctx.quadraticCurveTo((15+wave)*s, 0, 0, -5*s);
    ctx.quadraticCurveTo((-15-wave)*s, -10*s, -20*s, -20*s);
    ctx.stroke();
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 4 * s;
    ctx.setLineDash([6*s, 8*s]);
    ctx.beginPath();
    ctx.moveTo(30*s, 20*s);
    ctx.quadraticCurveTo((15+wave)*s, 0, 0, -5*s);
    ctx.quadraticCurveTo((-15-wave)*s, -10*s, -20*s, -20*s);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = c.body;
    ctx.fillRect(-28*s, -28*s, 16*s, 14*s);
    ctx.fillStyle = c.eye;
    ctx.fillRect(-26*s, -26*s, 4*s, 4*s);
    ctx.fillStyle = '#FF0000';
    const tongueLen = Math.sin((frame || 0) * 0.12) * 3 + 5;
    ctx.fillRect(-30*s, -18*s, 2*s, tongueLen*s);
    ctx.fillRect(-32*s, (-18+tongueLen)*s, 2*s, 3*s);
    ctx.fillRect(-28*s, (-18+tongueLen)*s, 2*s, 3*s);
    ctx.fillStyle = c.accent;
    ctx.beginPath();
    ctx.moveTo(30*s, 20*s);
    ctx.lineTo(38*s, 16*s);
    ctx.lineTo(36*s, 22*s);
    ctx.fill();
}

function drawMammoth(ctx, s, c) {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath(); ctx.ellipse(0, 35*s, 28*s, 7*s, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = c.body;
    ctx.beginPath(); ctx.ellipse(0, -2*s, 30*s, 25*s, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = c.accent;
    for (let i = 0; i < 8; i++) {
        ctx.fillRect((-24+i*7)*s, (10+Math.sin(i)*3)*s, 5*s, 10*s);
    }
    ctx.fillStyle = c.body;
    ctx.fillRect(-36*s, -22*s, 20*s, 28*s);
    ctx.fillStyle = c.accent;
    ctx.fillRect(-40*s, -5*s, 10*s, 6*s);
    ctx.fillRect(-44*s, 0, 8*s, 6*s);
    ctx.fillRect(-48*s, 5*s, 8*s, 6*s);
    ctx.fillRect(-44*s, 10*s, 6*s, 6*s);
    ctx.fillStyle = '#FFFFF0';
    ctx.fillRect(-42*s, -2*s, 4*s, 14*s);
    ctx.fillRect(-42*s, 10*s, 8*s, 4*s);
    ctx.fillStyle = '#FFF';
    ctx.fillRect(-32*s, -16*s, 8*s, 6*s);
    ctx.fillStyle = c.eye;
    ctx.fillRect(-28*s, -14*s, 4*s, 4*s);
    ctx.fillStyle = c.accent;
    ctx.fillRect(-20*s, -18*s, 8*s, 14*s);
    ctx.fillStyle = c.accent;
    for (let i = 0; i < 4; i++) ctx.fillRect((-34+i*5)*s, -26*s, 4*s, 6*s);
    ctx.fillStyle = c.accent;
    ctx.fillRect(-20*s, 18*s, 10*s, 18*s);
    ctx.fillRect(-6*s, 18*s, 10*s, 18*s);
    ctx.fillRect(8*s, 18*s, 10*s, 18*s);
    ctx.fillRect(20*s, 18*s, 10*s, 18*s);
    ctx.fillStyle = '#555';
    ctx.fillRect(-22*s, 34*s, 12*s, 4*s);
    ctx.fillRect(-8*s, 34*s, 12*s, 4*s);
    ctx.fillRect(6*s, 34*s, 12*s, 4*s);
    ctx.fillRect(18*s, 34*s, 12*s, 4*s);
}

function drawScorpion(ctx, s, c) {
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath(); ctx.ellipse(0, 22*s, 25*s, 5*s, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = c.body;
    ctx.beginPath(); ctx.ellipse(0, 0, 20*s, 14*s, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = c.accent;
    ctx.fillRect(-8*s, -12*s, 16*s, 4*s);
    ctx.fillRect(-4*s, -6*s, 8*s, 4*s);
    ctx.fillStyle = c.body;
    ctx.fillRect(-30*s, -8*s, 14*s, 6*s);
    ctx.fillRect(-38*s, -14*s, 10*s, 10*s);
    ctx.fillRect(16*s, -8*s, 14*s, 6*s);
    ctx.fillRect(28*s, -14*s, 10*s, 10*s);
    ctx.fillStyle = c.accent;
    ctx.fillRect(-40*s, -14*s, 4*s, 4*s);
    ctx.fillRect(-40*s, -6*s, 4*s, 4*s);
    ctx.fillRect(36*s, -14*s, 4*s, 4*s);
    ctx.fillRect(36*s, -6*s, 4*s, 4*s);
    ctx.fillStyle = c.body;
    ctx.fillRect(-4*s, -20*s, 8*s, 10*s);
    ctx.fillRect(-3*s, -30*s, 6*s, 12*s);
    ctx.fillRect(-2*s, -38*s, 5*s, 10*s);
    ctx.fillStyle = '#FF4444';
    ctx.beginPath();
    ctx.moveTo(0, -38*s);
    ctx.lineTo(-4*s, -44*s);
    ctx.lineTo(4*s, -44*s);
    ctx.fill();
    ctx.fillStyle = c.eye;
    ctx.fillRect(-6*s, -6*s, 3*s, 3*s);
    ctx.fillRect(3*s, -6*s, 3*s, 3*s);
    ctx.fillStyle = c.accent;
    for (let i = 0; i < 4; i++) {
        ctx.fillRect((-18-i*4)*s, 10*s, 3*s, (10+i*2)*s);
        ctx.fillRect((15+i*4)*s, 10*s, 3*s, (10+i*2)*s);
    }
}

function drawCamel(ctx, s, c) {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath(); ctx.ellipse(0, 35*s, 25*s, 6*s, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = c.body;
    ctx.fillRect(-22*s, -8*s, 44*s, 22*s);
    ctx.fillStyle = c.body;
    ctx.beginPath(); ctx.ellipse(-8*s, -14*s, 10*s, 10*s, 0, Math.PI, 0); ctx.fill();
    ctx.beginPath(); ctx.ellipse(10*s, -14*s, 10*s, 10*s, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = c.accent;
    for (let i = 0; i < 6; i++) ctx.fillRect((-16+i*6)*s, -6*s, 4*s, 3*s);
    ctx.fillStyle = c.body;
    ctx.fillRect(-32*s, -28*s, 12*s, 24*s);
    ctx.fillRect(-40*s, -32*s, 16*s, 14*s);
    ctx.fillStyle = c.accent;
    ctx.fillRect(-44*s, -24*s, 10*s, 6*s);
    ctx.fillStyle = '#FFF';
    ctx.fillRect(-36*s, -30*s, 6*s, 5*s);
    ctx.fillStyle = c.eye;
    ctx.fillRect(-33*s, -29*s, 3*s, 4*s);
    ctx.fillStyle = '#DDD';
    ctx.fillRect(-36*s, -36*s, 3*s, 5*s);
    ctx.fillRect(-30*s, -36*s, 3*s, 5*s);
    ctx.fillStyle = c.accent;
    ctx.fillRect(-18*s, 14*s, 8*s, 20*s);
    ctx.fillRect(-6*s, 14*s, 8*s, 20*s);
    ctx.fillRect(6*s, 14*s, 8*s, 20*s);
    ctx.fillRect(16*s, 14*s, 8*s, 20*s);
    ctx.fillStyle = c.accent;
    ctx.fillRect(22*s, -4*s, 16*s, 5*s);
    ctx.fillRect(36*s, -8*s, 5*s, 10*s);
}

function drawWorm(ctx, s, c, frame) {
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath(); ctx.ellipse(0, 30*s, 22*s, 5*s, 0, 0, Math.PI*2); ctx.fill();
    const wave = Math.sin((frame || 0) * 0.06) * 4;
    ctx.fillStyle = c.body;
    for (let i = 0; i < 6; i++) {
        const ox = Math.sin(i * 0.8 + (frame || 0) * 0.05) * wave;
        const r = (14 - i) * s;
        ctx.beginPath();
        ctx.ellipse(ox * s, (-20 + i * 10) * s, r, r * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = c.accent;
        ctx.fillRect((ox - r / s + 2) * s, (-20 + i * 10 - 1) * s, (r / s * 2 - 4) * s, 2 * s);
        ctx.fillStyle = c.body;
    }
    ctx.fillStyle = c.body;
    ctx.beginPath(); ctx.ellipse(0, -25*s, 16*s, 14*s, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#8B0000';
    ctx.beginPath(); ctx.ellipse(0, -30*s, 10*s, 8*s, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#4a0000';
    ctx.beginPath(); ctx.ellipse(0, -30*s, 6*s, 5*s, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#FFF';
    for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        ctx.fillRect(Math.cos(a)*8*s - 1.5*s, -30*s + Math.sin(a)*6*s - 1.5*s, 3*s, 3*s);
    }
    ctx.fillStyle = c.eye;
    ctx.fillRect(-8*s, -22*s, 4*s, 4*s);
    ctx.fillRect(4*s, -22*s, 4*s, 4*s);
}

function drawDragon(ctx, s, c, frame) {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath(); ctx.ellipse(0, 38*s, 28*s, 6*s, 0, 0, Math.PI*2); ctx.fill();
    const wingFlap = Math.sin((frame || 0) * 0.06) * 8;
    ctx.fillStyle = c.accent;
    ctx.beginPath();
    ctx.moveTo(-15*s, -10*s);
    ctx.lineTo(-45*s, (-30+wingFlap)*s);
    ctx.lineTo(-40*s, (-15+wingFlap)*s);
    ctx.lineTo(-30*s, (-5+wingFlap/2)*s);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(15*s, -10*s);
    ctx.lineTo(45*s, (-30+wingFlap)*s);
    ctx.lineTo(40*s, (-15+wingFlap)*s);
    ctx.lineTo(30*s, (-5+wingFlap/2)*s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = c.body;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(-15*s, -8*s);
    ctx.lineTo(-42*s, (-26+wingFlap)*s);
    ctx.lineTo(-28*s, (-3+wingFlap/2)*s);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(15*s, -8*s);
    ctx.lineTo(42*s, (-26+wingFlap)*s);
    ctx.lineTo(28*s, (-3+wingFlap/2)*s);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = c.accent;
    ctx.beginPath();
    ctx.moveTo(10*s, 5*s);
    ctx.quadraticCurveTo(35*s, 15*s, 40*s, -5*s);
    ctx.lineTo(38*s, 0);
    ctx.quadraticCurveTo(30*s, 12*s, 10*s, 10*s);
    ctx.fill();
    ctx.fillStyle = c.body;
    ctx.beginPath(); ctx.ellipse(0, 0, 20*s, 18*s, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,200,0.2)';
    for (let i = 0; i < 4; i++) ctx.fillRect(-8*s, (-6+i*5)*s, 16*s, 3*s);
    ctx.fillStyle = c.body;
    ctx.fillRect(-22*s, -22*s, 14*s, 16*s);
    ctx.fillRect(-32*s, -28*s, 18*s, 14*s);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(-30*s, -34*s, 3*s, 8*s);
    ctx.fillRect(-22*s, -34*s, 3*s, 8*s);
    ctx.fillStyle = c.accent;
    ctx.fillRect(-38*s, -20*s, 12*s, 6*s);
    if (c.body.includes('CC0000') || c.body.includes('800')) {
        ctx.fillStyle = '#FF6600';
        ctx.globalAlpha = 0.6;
        ctx.fillRect(-48*s, -22*s, 12*s, 4*s);
        ctx.fillRect(-52*s, -20*s, 8*s, 3*s);
        ctx.globalAlpha = 1;
    } else {
        ctx.fillStyle = '#87CEEB';
        ctx.globalAlpha = 0.5;
        ctx.fillRect(-48*s, -22*s, 12*s, 4*s);
        ctx.fillRect(-52*s, -20*s, 8*s, 3*s);
        ctx.globalAlpha = 1;
    }
    ctx.fillStyle = '#FFF';
    ctx.fillRect(-28*s, -26*s, 7*s, 6*s);
    ctx.fillStyle = c.eye;
    ctx.fillRect(-25*s, -24*s, 4*s, 4*s);
    ctx.fillStyle = c.accent;
    ctx.fillRect(-12*s, 14*s, 8*s, 20*s);
    ctx.fillRect(4*s, 14*s, 8*s, 20*s);
    ctx.fillStyle = '#333';
    ctx.fillRect(-15*s, 32*s, 5*s, 4*s);
    ctx.fillRect(-9*s, 32*s, 5*s, 4*s);
    ctx.fillRect(1*s, 32*s, 5*s, 4*s);
    ctx.fillRect(7*s, 32*s, 5*s, 4*s);
}

function drawWolf(ctx, s, c) {
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath(); ctx.ellipse(0, 28*s, 22*s, 5*s, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = c.accent;
    ctx.beginPath();
    ctx.moveTo(20*s, -6*s);
    ctx.quadraticCurveTo(35*s, -20*s, 38*s, -28*s);
    ctx.quadraticCurveTo(32*s, -18*s, 22*s, -2*s);
    ctx.fill();
    ctx.fillStyle = c.body;
    ctx.beginPath(); ctx.ellipse(0, 0, 24*s, 16*s, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath(); ctx.ellipse(0, 5*s, 16*s, 10*s, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = c.body;
    ctx.fillRect(-34*s, -16*s, 18*s, 18*s);
    ctx.fillStyle = c.accent;
    ctx.beginPath();
    ctx.moveTo(-34*s, -10*s);
    ctx.lineTo(-46*s, -4*s);
    ctx.lineTo(-34*s, 2*s);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.fillRect(-46*s, -6*s, 4*s, 4*s);
    ctx.fillStyle = '#FFF';
    ctx.fillRect(-42*s, -2*s, 2*s, 4*s);
    ctx.fillRect(-38*s, -2*s, 2*s, 4*s);
    ctx.fillStyle = c.body;
    ctx.beginPath();
    ctx.moveTo(-32*s, -16*s);
    ctx.lineTo(-36*s, -28*s);
    ctx.lineTo(-28*s, -16*s);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-22*s, -16*s);
    ctx.lineTo(-26*s, -28*s);
    ctx.lineTo(-18*s, -16*s);
    ctx.fill();
    ctx.fillStyle = '#FFB6C1';
    ctx.beginPath();
    ctx.moveTo(-30*s, -16*s);
    ctx.lineTo(-33*s, -24*s);
    ctx.lineTo(-27*s, -16*s);
    ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.fillRect(-30*s, -14*s, 7*s, 5*s);
    ctx.fillStyle = c.eye;
    ctx.fillRect(-27*s, -13*s, 4*s, 4*s);
    ctx.fillStyle = c.accent;
    ctx.fillRect(-16*s, 12*s, 6*s, 18*s);
    ctx.fillRect(-6*s, 12*s, 6*s, 18*s);
    ctx.fillRect(4*s, 12*s, 6*s, 18*s);
    ctx.fillRect(14*s, 12*s, 6*s, 18*s);
    ctx.fillStyle = '#555';
    ctx.fillRect(-17*s, 28*s, 8*s, 3*s);
    ctx.fillRect(-7*s, 28*s, 8*s, 3*s);
    ctx.fillRect(3*s, 28*s, 8*s, 3*s);
    ctx.fillRect(13*s, 28*s, 8*s, 3*s);
}

// ===== 战斗动画 =====
let battleEnemyAnimId = null;
function startBattleEnemyAnim() {
    if (battleEnemyAnimId) cancelAnimationFrame(battleEnemyAnimId);
    let tick = 0;
    function loop() {
        const canvas = $('enemySprite');
        if (!canvas || !canvas.getContext) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPixelEnemy(ctx, battle.enemy.name, canvas.width, tick);
        tick++;
        battleEnemyAnimId = requestAnimationFrame(loop);
    }
    loop();
}
function stopBattleEnemyAnim() {
    if (battleEnemyAnimId) { cancelAnimationFrame(battleEnemyAnimId); battleEnemyAnimId = null; }
}

function drawPetSprite(petName) {
    const canvas = $('petSprite');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPixelEnemy(ctx, petName, canvas.width, 0);
}

let battleAllyAnimId = null;
function drawBattleAlly(tick) {
    const canvas = $('allySprite');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const bob = Math.sin(tick * 0.05) * 3;
    drawPixelChar(ctx, 8, 10 + bob, 64, game.player.class, 'right', tick);
}
function startBattleAllyAnim() {
    cancelAnimationFrame(battleAllyAnimId);
    let t = 0;
    function loop() { drawBattleAlly(t++); battleAllyAnimId = requestAnimationFrame(loop); }
    loop();
}
function stopBattleAllyAnim() { cancelAnimationFrame(battleAllyAnimId); battleAllyAnimId = null; }
