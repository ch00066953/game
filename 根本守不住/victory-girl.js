const canvas = document.getElementById('victoryCanvas');
const ctx = canvas.getContext('2d');

let animationTime = 0;

function drawBackground() {
  // 背景渐变
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#3d1a2a');
  gradient.addColorStop(1, '#1a0f1a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 绘制烟火效果
  drawFireworks();
}

function drawFireworks() {
  // 多个发光点创造烟火效果
  const particleCount = Math.floor(Math.random() * 3) + 8;
  
  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.PI * 2 * i) / particleCount + (animationTime * 0.02);
    const distance = 150 + Math.sin(animationTime * 0.005 + i) * 100;
    const x = canvas.width / 2 + Math.cos(angle) * distance;
    const y = canvas.height / 2.5 + Math.sin(angle) * distance;

    // 绘制发光球
    const glow = ctx.createRadialGradient(x, y, 0, x, y, 30);
    glow.addColorStop(0, 'rgba(255, 200, 100, 0.8)');
    glow.addColorStop(0.5, 'rgba(255, 100, 150, 0.3)');
    glow.addColorStop(1, 'rgba(255, 100, 150, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - 30, y - 30, 60, 60);

    // 绘制星星
    const starGlow = ctx.createRadialGradient(x, y, 0, x, y, 15);
    starGlow.addColorStop(0, 'rgba(255, 255, 200, 1)');
    starGlow.addColorStop(1, 'rgba(255, 255, 100, 0)');
    ctx.fillStyle = starGlow;
    drawStar(x, y, 5, 8, 4);
  }
}

function drawStar(cx, cy, spikes, outerRadius, innerRadius) {
  let rot = Math.PI / 2 * 3;
  let step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
}

function drawCharacter() {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2 - 20;

  // 绘制光晕
  drawAura(centerX, centerY);

  // 绘制头部
  drawHead(centerX, centerY - 100);

  // 绘制身体
  drawBody(centerX, centerY);

  // 绘制头发
  drawHair(centerX, centerY - 100);

  // 绘制手臂
  drawArms(centerX, centerY - 30);

  // 绘制腿部
  drawLegs(centerX, centerY + 80);
}

function drawAura(x, y) {
  // 外层光晕（金色）
  for (let i = 3; i > 0; i--) {
    const radius = 200 + i * 30;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
    const alpha = (0.3 - i * 0.08) * (0.5 + 0.5 * Math.sin(animationTime * 0.003));
    glow.addColorStop(0, `rgba(255, 200, 100, ${alpha})`);
    glow.addColorStop(0.5, `rgba(255, 150, 50, ${alpha * 0.5})`);
    glow.addColorStop(1, `rgba(255, 100, 150, 0)`);
    ctx.fillStyle = glow;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  // 内层光晕
  const innerGlow = ctx.createRadialGradient(x, y, 0, x, y, 150);
  const innerAlpha = 0.2 + 0.1 * Math.sin(animationTime * 0.003);
  innerGlow.addColorStop(0, `rgba(255, 220, 150, ${innerAlpha})`);
  innerGlow.addColorStop(1, `rgba(255, 200, 100, 0)`);
  ctx.fillStyle = innerGlow;
  ctx.fillRect(x - 150, y - 150, 300, 300);
}

function drawHead(x, y) {
  // 头部肤色
  ctx.fillStyle = '#f5c4a3';
  ctx.beginPath();
  ctx.ellipse(x, y, 35, 45, 0, 0, Math.PI * 2);
  ctx.fill();

  // 脸颊腮红
  ctx.fillStyle = 'rgba(255, 120, 160, 0.6)';
  ctx.beginPath();
  ctx.ellipse(x - 25, y + 5, 15, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 25, y + 5, 15, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // 眼睛
  drawEye(x - 12, y - 10);
  drawEye(x + 12, y - 10);

  // 嘴唇
  ctx.fillStyle = '#ff69b4';
  ctx.beginPath();
  ctx.ellipse(x, y + 20, 10, 8, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawEye(x, y) {
  // 眼白
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(x, y, 8, 12, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // 虹膜
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.ellipse(x + 2, y + 2, 6, 8, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // 瞳孔
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(x + 3, y + 3, 3, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // 眼睛高光
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.beginPath();
  ctx.arc(x + 5, y, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawHair(x, y) {
  // 长金色头发
  const hairColor = '#d4a574';
  const darkHairColor = '#b8925a';

  // 左侧头发
  ctx.fillStyle = darkHairColor;
  ctx.beginPath();
  ctx.moveTo(x - 35, y - 30);
  ctx.quadraticCurveTo(x - 50, y + 20, x - 40, y + 100);
  ctx.quadraticCurveTo(x - 30, y + 90, x - 25, y + 50);
  ctx.closePath();
  ctx.fill();

  // 右侧头发
  ctx.beginPath();
  ctx.moveTo(x + 35, y - 30);
  ctx.quadraticCurveTo(x + 50, y + 20, x + 40, y + 100);
  ctx.quadraticCurveTo(x + 30, y + 90, x + 25, y + 50);
  ctx.closePath();
  ctx.fill();

  // 顶部头发蓬松感
  ctx.fillStyle = hairColor;
  ctx.beginPath();
  ctx.ellipse(x, y - 50, 40, 25, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawBody(x, y) {
  // 身体肤色
  ctx.fillStyle = '#f5c4a3';
  ctx.beginPath();
  ctx.ellipse(x, y, 30, 50, 0, 0, Math.PI * 2);
  ctx.fill();

  // 衣服装饰 - 黑色上衣
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.moveTo(x - 30, y - 30);
  ctx.quadraticCurveTo(x, y - 50, x + 30, y - 30);
  ctx.lineTo(x + 30, y + 10);
  ctx.lineTo(x - 30, y + 10);
  ctx.closePath();
  ctx.fill();

  // 衣服边缘高光
  ctx.strokeStyle = 'rgba(255, 200, 100, 0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawArms(x, y) {
  // 左臂
  ctx.strokeStyle = '#f5c4a3';
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 30, y - 20);
  ctx.quadraticCurveTo(x - 60, y + 10, x - 50, y + 50);
  ctx.stroke();

  // 右臂
  ctx.beginPath();
  ctx.moveTo(x + 30, y - 20);
  ctx.quadraticCurveTo(x + 60, y + 10, x + 50, y + 50);
  ctx.stroke();

  // 手部
  ctx.fillStyle = '#f5c4a3';
  ctx.beginPath();
  ctx.arc(x - 50, y + 50, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 50, y + 50, 8, 0, Math.PI * 2);
  ctx.fill();
}

function drawLegs(x, y) {
  // 左腿
  ctx.strokeStyle = '#f5c4a3';
  ctx.lineWidth = 13;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 15, y);
  ctx.lineTo(x - 15, y + 60);
  ctx.stroke();

  // 右腿
  ctx.beginPath();
  ctx.moveTo(x + 15, y);
  ctx.lineTo(x + 15, y + 60);
  ctx.stroke();

  // 脚部
  ctx.fillStyle = '#f5c4a3';
  ctx.beginPath();
  ctx.arc(x - 15, y + 65, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 15, y + 65, 7, 0, Math.PI * 2);
  ctx.fill();
}

function drawVictoryText() {
  // "VICTORY! MISSION COMPLETE"文字
  const textY = 80;

  // 外层发光效果
  ctx.fillStyle = 'rgba(255, 107, 157, 0.3)';
  ctx.font = 'bold 48px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(255, 107, 157, 0.8)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // 绘制主文字
  ctx.fillStyle = '#ff6b9d';
  ctx.fillText('VICTORY!', canvas.width / 2, textY);
  ctx.fillText('MISSION COMPLETE', canvas.width / 2, textY + 60);

  // 中文文字
  ctx.font = 'bold 32px Microsoft YaHei';
  ctx.shadowBlur = 15;
  ctx.fillStyle = '#ffcc00';
  ctx.fillText('通关成功', canvas.width / 2, canvas.height - 60);

  // 重置阴影
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}

function drawBorder() {
  // 顶部边框装饰
  ctx.strokeStyle = 'rgba(255, 200, 100, 0.6)';
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  // 角落装饰
  ctx.fillStyle = '#ffcc00';
  drawCornerDecoration(35, 35, 12);
  drawCornerDecoration(canvas.width - 35, 35, 12);
  drawCornerDecoration(35, canvas.height - 35, 12);
  drawCornerDecoration(canvas.width - 35, canvas.height - 35, 12);
}

function drawCornerDecoration(x, y, size) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8;
    const r = size + (i % 2) * 3;
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function animate() {
  // 清空画布
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 绘制所有元素
  drawBackground();
  drawCharacter();
  drawVictoryText();
  drawBorder();

  animationTime += 1;
  requestAnimationFrame(animate);
}

// 启动动画
animate();
