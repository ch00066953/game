const canvas = document.getElementById('pvCanvas');
const ctx = canvas.getContext('2d');
let last = performance.now();
let side = 'player'; // 'player' or 'enemy'
let animState = 'idle'; // 'idle' | 'draw' | 'release'
let particles = [];

const archer = {
  x: 220, y: 200, age: 0, drawProgress:0
};

function resize() {
  // keep fixed size for preview
}

function clear() { ctx.clearRect(0,0,canvas.width,canvas.height); }

function drawBackground(){
  // simple battlefield
  ctx.fillStyle = '#9ed8ff'; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#7bd36c'; ctx.fillRect(0,canvas.height*0.6,canvas.width,canvas.height*0.4);
}

function spawnParticle(x,y,dx,dy,color,life){ particles.push({x,y,dx,dy,color,life,age:0}); }

function updateParticles(dt){
  for (let p of particles){ p.x+=p.dx*dt; p.y+=p.dy*dt; p.age+=dt; }
  particles = particles.filter(p=>p.age<p.life);
}

function drawParticles(){
  for (let p of particles){
    ctx.globalAlpha = 1 - p.age/p.life;
    ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x,p.y,3,0,Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawArcherHighRes(ctx, a){
  const x = a.x, y = a.y; const isPlayer = side === 'player';
  const bob = Math.sin(a.age * 2.6) * 1.6;
  const yy = y + bob;

  // subtle ground shadow
  ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.beginPath(); ctx.ellipse(x, yy + 30, 36, 12, 0, 0, Math.PI * 2); ctx.fill();

  // legs (more shaped)
  ctx.fillStyle = '#2e3440';
  ctx.beginPath(); ctx.roundRect(x - 10, yy + 18, 8, 18, 3); ctx.fill();
  ctx.beginPath(); ctx.roundRect(x + 2, yy + 18, 8, 18, 3); ctx.fill();

  // torso with slight bust and waist
  const tunicColor = isPlayer ? '#4a9fff' : '#ff6f5a';
  ctx.fillStyle = tunicColor;
  ctx.beginPath();
  ctx.moveTo(x - 20, yy + 4);
  ctx.quadraticCurveTo(x, yy - 6, x + 20, yy + 4);
  ctx.lineTo(x + 14, yy + 28);
  ctx.quadraticCurveTo(x, yy + 34, x - 14, yy + 28);
  ctx.closePath(); ctx.fill();

  // decorative belt
  ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(x - 18, yy + 16, 36, 6);

  // cape/hood behind
  ctx.fillStyle = isPlayer ? '#c8f0ff' : '#d6b8b2';
  ctx.beginPath(); ctx.moveTo(x - 18, yy - 4); ctx.quadraticCurveTo(x - 38, yy - 12, x - 22, yy + 26); ctx.lineTo(x - 8, yy + 20); ctx.closePath(); ctx.fill();

  // neck & collarbone
  ctx.fillStyle = isPlayer ? '#ffe8cc' : '#e6d4c8';
  ctx.beginPath(); ctx.roundRect(x - 6, yy - 6, 12, 10, 3); ctx.fill();

  // head (slightly smaller, more oval)
  const headGrad = ctx.createLinearGradient(x, yy - 34, x, yy - 6);
  headGrad.addColorStop(0, isPlayer ? '#fff6e8' : '#f1e9e0');
  headGrad.addColorStop(1, isPlayer ? '#ffe8cc' : '#e6d4c8');
  ctx.fillStyle = headGrad;
  ctx.beginPath(); ctx.ellipse(x, yy - 22, 16, 18, 0, 0, Math.PI * 2); ctx.fill();

  // hair block with highlights
  ctx.fillStyle = isPlayer ? '#f3cf5a' : '#a57d63';
  ctx.beginPath(); ctx.ellipse(x - 2, yy - 28, 14, 12, -0.2, Math.PI * 0.1, Math.PI * 0.9); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath(); ctx.ellipse(x + 2, yy - 30, 6, 4, -0.2, 0, Math.PI * 2); ctx.fill();

  // bangs & hair strands (more layered)
  ctx.fillStyle = isPlayer ? '#f0c94a' : '#8f6a4f';
  ctx.beginPath(); ctx.moveTo(x - 14, yy - 20); ctx.quadraticCurveTo(x - 2, yy - 12, x + 14, yy - 20); ctx.fill();
  ctx.fillStyle = isPlayer ? '#f6d86a' : '#a07a58';
  ctx.beginPath(); ctx.moveTo(x - 10, yy - 24); ctx.quadraticCurveTo(x - 2, yy - 18, x - 6, yy - 14); ctx.fill();

  // ears with slight angle
  ctx.fillStyle = isPlayer ? '#ffdcb7' : '#efdccf';
  ctx.beginPath(); ctx.moveTo(x - 24, yy - 24); ctx.lineTo(x - 32, yy - 18); ctx.lineTo(x - 20, yy - 16); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + 24, yy - 24); ctx.lineTo(x + 32, yy - 18); ctx.lineTo(x + 20, yy - 16); ctx.closePath(); ctx.fill();

  // refined eyes (lid, iris, pupil) and subtle eyebrow
  const irisColor = isPlayer ? '#2fbfa6' : '#2b6b7f';
  // left eye
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(x - 6, yy - 22, 4.2, 3.0, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = irisColor; ctx.beginPath(); ctx.ellipse(x - 6, yy - 22, 2.1, 1.6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0c0c0c'; ctx.beginPath(); ctx.arc(x - 6, yy - 22, 0.7, 0, Math.PI * 2); ctx.fill();
  // right eye
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(x + 6, yy - 22, 4.2, 3.0, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = irisColor; ctx.beginPath(); ctx.ellipse(x + 6, yy - 22, 2.1, 1.6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0c0c0c'; ctx.beginPath(); ctx.arc(x + 6, yy - 22, 0.7, 0, Math.PI * 2); ctx.fill();
  // eyelashes / eyebrow lines
  ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(x - 11, yy - 25); ctx.quadraticCurveTo(x - 6, yy - 26, x - 1, yy - 25); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 1, yy - 25); ctx.quadraticCurveTo(x + 6, yy - 26, x + 11, yy - 25); ctx.stroke();

  // nose
  ctx.fillStyle = 'rgba(0,0,0,0.06)'; ctx.beginPath(); ctx.moveTo(x - 1, yy - 18); ctx.lineTo(x + 1, yy - 18); ctx.lineTo(x, yy - 16); ctx.closePath(); ctx.fill();

  // mouth (soft smile with lip shading)
  ctx.fillStyle = 'rgba(178,94,102,0.9)'; ctx.beginPath(); ctx.ellipse(x, yy - 14, 3.2, 1.6, 0, 0, Math.PI); ctx.fill();
  ctx.fillStyle = 'rgba(255,220,220,0.9)'; ctx.beginPath(); ctx.ellipse(x, yy - 14.4, 1.8, 0.7, 0, 0, Math.PI); ctx.fill();

  // blush for player
  if (isPlayer) { ctx.fillStyle = 'rgba(245,176,181,0.9)'; ctx.beginPath(); ctx.ellipse(x - 8, yy - 16, 4.4, 2.8, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(x + 8, yy - 16, 4.4, 2.8, 0, 0, Math.PI * 2); ctx.fill(); }

  // arms and bow
  const draw = a.drawProgress; // 0..1
  const armBaseX = x + 18; const armBaseY = yy - 2;
  // forearm (holding bow)
  ctx.fillStyle = '#ffdcb7'; ctx.beginPath(); ctx.roundRect(armBaseX - 6, armBaseY - 6, 10, 6, 3); ctx.fill();
  // pulling arm (string side)
  ctx.beginPath(); ctx.roundRect(armBaseX - 26 - 20 * draw, armBaseY - 6, 10, 6, 3); ctx.fill();

  // stylized heart-bow with thicker silhouette and inner fill
  ctx.lineWidth = 3; ctx.strokeStyle = isPlayer ? '#7a4d2a' : '#6d4a3f';
  ctx.beginPath(); ctx.moveTo(armBaseX + 6, armBaseY - 12); ctx.bezierCurveTo(armBaseX - 0, armBaseY - 28, armBaseX + 28, armBaseY - 30, armBaseX + 6, armBaseY - 2); ctx.stroke();
  ctx.fillStyle = isPlayer ? '#8f5a3a' : '#7a4f44'; ctx.globalAlpha = 0.12; ctx.beginPath(); ctx.arc(armBaseX + 6, armBaseY - 6, 12, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;

  // string (pulled by draw)
  ctx.strokeStyle = '#f3f8ff'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(armBaseX + 6, armBaseY - 18); ctx.lineTo(armBaseX + 6, armBaseY + 18); ctx.stroke();

  // arrow (position depends on draw)
  const ax = armBaseX + 6 - 26 * draw; const ay = armBaseY + Math.sin(a.age * 8) * 0.8;
  ctx.strokeStyle = '#222'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ax - 28, ay); ctx.lineTo(ax + 16, ay); ctx.stroke();
  ctx.fillStyle = '#333'; ctx.beginPath(); ctx.moveTo(ax + 16, ay); ctx.lineTo(ax + 8, ay - 5); ctx.lineTo(ax + 8, ay + 5); ctx.closePath(); ctx.fill();

  // sparkle when fully drawn
  if (draw > 0.98 && isPlayer) {
    ctx.fillStyle = '#fff7d6'; ctx.beginPath(); ctx.arc(x + 4, yy - 38, 5 + Math.random() * 2, 0, Math.PI * 2); ctx.fill();
  }
}

function step(ts){
  const dt = Math.min((ts-last)/1000,0.05); last=ts;
  archer.age += dt;
  // animation logic
  if(animState==='idle'){
    archer.drawProgress = Math.max(0, archer.drawProgress - dt*2);
  } else if(animState==='draw'){
    archer.drawProgress = Math.min(1, archer.drawProgress + dt*3);
  } else if(animState==='release'){
    // spawn particles and release arrow visual
    for(let i=0;i<12;i++){ spawnParticle(archer.x+200,archer.y-20+Math.random()*10-5, (Math.random()*120+60)*0.8*Math.sign(Math.random()-0.3), (Math.random()*-80), side==='player'? '#fff7d6' : '#ffb3b3', 0.6+Math.random()*0.4); }
    animState='idle';
    archer.drawProgress=0;
  }

  updateParticles(dt);
  clear(); drawBackground(); drawParticles(); drawArcherHighRes(ctx, archer);
  requestAnimationFrame(step);
}

// controls
const toggleSide = document.getElementById('toggleSide');
const toggleAnim = document.getElementById('toggleAnim');
const shootBtn = document.getElementById('shootBtn');

toggleSide.addEventListener('click', ()=>{
  side = (side==='player')? 'enemy':'player';
  toggleSide.textContent = `切换为：${side==='player'?'我方（金发）':'敌方（凶萌）'}`;
});

toggleAnim.addEventListener('click', ()=>{
  if(animState==='idle'){ animState='draw'; toggleAnim.textContent='切换动画：拉弓'; }
  else if(animState==='draw'){ animState='idle'; toggleAnim.textContent='切换动画：待机'; }
});

shootBtn.addEventListener('click', ()=>{ if(animState!=='draw'){ animState='draw'; setTimeout(()=>{ animState='release'; }, 600); } });

requestAnimationFrame(step);
