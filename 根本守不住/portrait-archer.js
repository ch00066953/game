const canvas = document.getElementById('porCanvas');
const ctx = canvas.getContext('2d');
let variant = 0; // 0 = fresh, 1 = warm/darker

function drawPortrait(){
  const w = canvas.width, h = canvas.height;
  // background
  const bg = ctx.createLinearGradient(0,0,0,h);
  bg.addColorStop(0, variant===0? '#eef9ff' : '#fff6ec');
  bg.addColorStop(1, variant===0? '#fffef9' : '#fff3e8');
  ctx.fillStyle = bg; ctx.fillRect(0,0,w,h);

  // soft vignette
  const vg = ctx.createRadialGradient(w/2,h*0.45,100,w/2,h*0.45,600);
  vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,0.06)');
  ctx.fillStyle = vg; ctx.fillRect(0,0,w,h);

  // frame plate
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  roundRect(ctx,72,52,w-144,h-104,20); ctx.fill();

  // layout coords
  const px = w/2, py = 260; // push face a bit up

  // Draw layered elements: hair back -> torso -> face -> hair front -> features -> clothes/accessories
  drawHairBack(px, py);
  drawTorso(px, py+380);
  drawNeckAndShoulders(px, py+120);
  drawFace(px, py);
  drawHairFront(px, py);
  drawEyes(px, py);
  drawNose(px, py);
  drawMouth(px, py);
  drawAccessories(px, py);
  drawClothes(px, py+360);
  drawEdgeLighting(px, py);
}

function roundRect(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }

function drawTorso(x,y){
  // stronger torso shape with clear waist
  ctx.save();
  const base = variant===0? '#e8f4ff' : '#f7e8df';
  ctx.fillStyle = base;
  roundRect(ctx, x-170, y-40, 340, 380, 32); ctx.fill();
  // subtle shadow under bust
  ctx.fillStyle = 'rgba(0,0,0,0.06)'; ctx.beginPath(); ctx.ellipse(x, y+30, 120, 24, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawNeckAndShoulders(x,y){
  // neck
  ctx.fillStyle = variant===0? '#ffe9cf' : '#f6d6bd';
  ctx.beginPath(); ctx.ellipse(x, y-20, 36, 44, 0, 0, Math.PI*2); ctx.fill();
  // clavicle lines
  ctx.strokeStyle = 'rgba(0,0,0,0.08)'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x-44,y+6); ctx.quadraticCurveTo(x,y-2,x+44,y+6); ctx.stroke();
  // shoulders shading
  ctx.fillStyle = 'rgba(0,0,0,0.04)'; ctx.beginPath(); ctx.ellipse(x-100,y+40,60,30, -0.4,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.ellipse(x+100,y+40,60,30, 0.4,0,Math.PI*2); ctx.fill();
}

function drawFace(x,y){
  // smaller, more proportional head
  const rx = 110, ry = 140; // reduced from 140/170
  // skin gradient
  const skinTop = variant===0? '#fff7e8' : '#fff2e5';
  const skinBot = variant===0? '#ffdfbf' : '#f1c9a9';
  const g = ctx.createLinearGradient(x, y-120, x, y+40);
  g.addColorStop(0, skinTop); g.addColorStop(1, skinBot);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(x, y-10, rx, ry, 0, 0, Math.PI*2); ctx.fill();

  // jawline (slightly angled)
  ctx.fillStyle = 'rgba(0,0,0,0.03)'; ctx.beginPath(); ctx.moveTo(x-60,y+40); ctx.quadraticCurveTo(x,y+80,x+60,y+40); ctx.fill();

  // cheeks
  ctx.fillStyle = 'rgba(255,190,190,0.45)'; ctx.beginPath(); ctx.ellipse(x-42,y+6,20,12,-0.18,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.ellipse(x+42,y+6,20,12,0.18,0,Math.PI*2); ctx.fill();
}

function drawHairBack(x,y){
  ctx.save();
  const hairBase = variant===0? '#f4d86a' : '#c0894a';
  const hairShade = variant===0? '#d9b84a' : '#8b5a34';
  const hg = ctx.createLinearGradient(x-140,y-220,x+140,y+30);
  hg.addColorStop(0,hairBase); hg.addColorStop(1,hairShade);
  ctx.fillStyle = hg;
  // larger but tucked behind head (so head no longer dominates)
  ctx.beginPath();
  ctx.moveTo(x-160,y-80);
  ctx.bezierCurveTo(x-220,y+20,x-200,y+220,x-120,y+300);
  ctx.lineTo(x+120,y+300);
  ctx.bezierCurveTo(x+200,y+220,x+220,y+20,x+160,y-80);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawHairFront(x,y){
  ctx.save();
  const hairShade = variant===0? '#d9b84a' : '#8b5a34';
  ctx.fillStyle = hairShade;
  // bangs with sharper shapes
  ctx.beginPath(); ctx.moveTo(x-110,y-60); ctx.quadraticCurveTo(x-40,y-140,x,y-120); ctx.quadraticCurveTo(x+40,y-140,x+110,y-60); ctx.closePath(); ctx.fill();
  // side locks
  ctx.beginPath(); ctx.moveTo(x-120,y-40); ctx.quadraticCurveTo(x-180,y+40,x-140,y+150); ctx.lineTo(x-110,y+120); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x+120,y-40); ctx.quadraticCurveTo(x+180,y+40,x+140,y+150); ctx.lineTo(x+110,y+120); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function drawEyes(x,y){
  const eyeY = y-30; const eyeDX = 42;
  drawEye(x-eyeDX, eyeY, variant===0? '#2fbfa6' : '#3a6a7d');
  drawEye(x+eyeDX, eyeY, variant===0? '#2fbfa6' : '#3a6a7d');
}

function drawEye(cx,cy,irisColor){
  // white
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(cx,cy,26,16,0,0,Math.PI*2); ctx.fill();
  // iris gradient
  const ig = ctx.createLinearGradient(cx-8,cy-6,cx+8,cy+6); ig.addColorStop(0,'#fff'); ig.addColorStop(0.2, irisColor); ig.addColorStop(1,'#06323a');
  ctx.fillStyle = ig; ctx.beginPath(); ctx.ellipse(cx,cy,12,10,0,0,Math.PI*2); ctx.fill();
  // pupil
  ctx.fillStyle='#07111a'; ctx.beginPath(); ctx.arc(cx,cy,4,0,Math.PI*2); ctx.fill();
  // highlights
  ctx.fillStyle='rgba(255,255,255,0.98)'; ctx.beginPath(); ctx.arc(cx-5,cy-5,2.6,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(cx+4,cy+2,1.2,0,Math.PI*2); ctx.fill();
  // lashes (upper)
  ctx.strokeStyle='rgba(0,0,0,0.5)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(cx,cy-2,26,Math.PI*1.05,Math.PI*1.95); ctx.stroke();
  // subtle lower lash
  ctx.strokeStyle='rgba(0,0,0,0.12)'; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(cx,cy+4,16,Math.PI*1.05,Math.PI*1.95); ctx.stroke();
}

function drawNose(x,y){
  ctx.fillStyle='rgba(0,0,0,0.06)'; ctx.beginPath(); ctx.ellipse(x, y-4, 6, 4, 0, 0, Math.PI*2); ctx.fill();
  // bridge highlight
  ctx.strokeStyle='rgba(255,255,255,0.6)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(x-4,y-18); ctx.quadraticCurveTo(x,y-14,x+4,y-18); ctx.stroke();
}

function drawMouth(x,y){
  ctx.fillStyle='rgba(190,80,100,0.95)'; ctx.beginPath(); ctx.ellipse(x, y-14, 14, 8, 0, 0, Math.PI); ctx.fill();
  ctx.fillStyle='rgba(255,220,220,0.95)'; ctx.beginPath(); ctx.ellipse(x, y-16, 8, 4, 0, 0, Math.PI); ctx.fill();
}

function drawAccessories(x,y){
  // leaf earring left (more defined)
  ctx.save(); ctx.translate(0,0);
  ctx.fillStyle = '#8fe0b3'; ctx.beginPath(); ctx.ellipse(x-84,y-36,9,16, -0.5,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,0.08)'; ctx.lineWidth=1; ctx.stroke();
  // tiara metal band
  ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.ellipse(x, y-86, 24, 12, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#9fe1c9'; ctx.beginPath(); ctx.arc(x, y-86,6,0,Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawClothes(x,y){
  ctx.save();
  const color = variant===0? '#4aa3ff' : '#d17a3f';
  // neckline piece with clearer separation and ornament
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(x-120,y-240); ctx.quadraticCurveTo(x, y-320, x+120, y-240); ctx.lineTo(x+120,y+20); ctx.quadraticCurveTo(x, y+110, x-120, y+20); ctx.closePath(); ctx.fill();
  // decorative trim
  ctx.strokeStyle='rgba(255,255,255,0.12)'; ctx.lineWidth=3; ctx.stroke();
  // small pendant
  ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.ellipse(x,y-80,8,10,0,0,Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawEdgeLighting(x,y){
  // rim light to separate hair/face
  ctx.save(); ctx.globalCompositeOperation='lighter';
  const g = ctx.createLinearGradient(x-160,y-180,x+160,y+180);
  g.addColorStop(0,'rgba(255,245,200,0.06)'); g.addColorStop(0.5,'rgba(255,245,200,0)'); g.addColorStop(1,'rgba(255,245,200,0.06)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x,y-20,170,210,0,0,Math.PI*2); ctx.fill();
  ctx.restore();
}

// export
document.getElementById('exportBtn').addEventListener('click', ()=>{
  const data = canvas.toDataURL('image/png');
  const a = document.createElement('a'); a.href = data; a.download = 'elf_archer_portrait.png'; a.click();
});

// variant switch
document.getElementById('variantBtn').addEventListener('click', ()=>{
  variant = (variant+1)%2; document.getElementById('variantBtn').textContent = variant===0? '切换风格：清新 / 暗金' : '切换风格：暗金 / 清新'; drawPortrait();
});

// initial render
drawPortrait();
