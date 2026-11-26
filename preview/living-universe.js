/* Prewarm artwork when a visitor shows interest in its star. */
(()=>{
  const cache=new Map();
  function warm(el){const url=el?.dataset.art;if(!url||cache.has(url))return;const img=new Image();cache.set(url,img);img.src=url;img.decode?.().catch(()=>{});}
  for(const event of ['pointerover','focusin','pointerdown'])document.addEventListener(event,e=>warm(e.target.closest?.('[data-art]')),{passive:true});
})();
(()=>{
  const artwork=new Image();
  artwork.onload=()=>document.body.classList.add('has-painted-cosmos');
  artwork.src='/preview/cosmic-hero.webp';
})();
(()=>{
  'use strict';
  const canvas=document.getElementById('cosmos'),ctx=canvas?.getContext('2d',{alpha:true});
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width:900px),(pointer:coarse)'),touch=matchMedia('(hover:none)');
  document.querySelectorAll('.celestial').forEach(link=>link.addEventListener('click',e=>{
    if(!touch.matches||e.detail===0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    if(!link.classList.contains('is-discovered')){
      e.preventDefault();document.querySelectorAll('.celestial.is-discovered').forEach(el=>el.classList.remove('is-discovered'));link.classList.add('is-discovered');
    }
  }));
  document.addEventListener('pointerdown',e=>{if(!e.target.closest?.('.celestial'))document.querySelectorAll('.celestial.is-discovered').forEach(el=>el.classList.remove('is-discovered'));});
  if(!ctx)return;
  const still=document.createElement('canvas'),staticCtx=still.getContext('2d',{alpha:true});
  if(!staticCtx)return;
  let w=0,h=0,dpr=0,paintedRealm='',twinkling=[],raf=0,lastFrame=-Infinity,dead=false;
  const realm=()=>document.documentElement.dataset.realm||'main';
  const seedRand=()=>{let s=234872;return()=>{s=(Math.imul(1664525,s)+1013904223)>>>0;return s/4294967296;};};
  function dot(target,s,a){
    target.fillStyle=s.hue>.92?'rgba(255,206,174,'+a+')':s.hue<.14?'rgba(181,205,255,'+a+')':'rgba(239,231,255,'+a+')';
    target.beginPath();target.arc(s.x,s.y,s.r,0,Math.PI*2);target.fill();
    if(s.r>1.3){
      target.strokeStyle='rgba(219,208,251,'+(a*.1)+')';target.beginPath();
      target.moveTo(s.x-5,s.y);target.lineTo(s.x+5,s.y);target.moveTo(s.x,s.y-5);target.lineTo(s.x,s.y+5);target.stroke();
    }
  }
  function render(now=0){
    ctx.clearRect(0,0,w,h);ctx.drawImage(still,0,0,still.width,still.height,0,0,w,h);
    for(const s of twinkling)dot(ctx,s,s.a*(reduced.matches?1:.87+.13*Math.sin(now*.00036*(realm()==='main'?1:.55)*s.speed+s.phase)));
  }
  function resize(){
    if(dead)return;
    const nw=Math.max(1,Math.round(canvas.clientWidth||innerWidth)),nh=Math.max(1,Math.round(canvas.clientHeight||innerHeight));
    const nd=Math.min(devicePixelRatio||1,mobile.matches?1.5:2);
    if(nw===w&&nh===h&&nd===dpr&&paintedRealm===realm())return;
    paintedRealm=realm();const density=paintedRealm==='far-away'?.46:paintedRealm==='far-far-away'?.18:1;
    w=nw;h=nh;dpr=nd;canvas.width=still.width=Math.round(w*dpr);canvas.height=still.height=Math.round(h*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);staticCtx.setTransform(dpr,0,0,dpr,0,0);
    const rand=seedRand();
    const stars=Array.from({length:Math.min(mobile.matches?480:900,Math.floor(w*h/1050*density))},()=>({x:rand()*w,y:rand()*h,r:.2+Math.pow(rand(),3)*1.7,a:.12+rand()*.7,phase:rand()*6.28,speed:.12+rand()*.8,hue:rand()}));
    const dust=Array.from({length:Math.min(mobile.matches?100:220,Math.floor(w*h/3300*density))},()=>({x:rand()*w,y:rand()*h,r:1+rand()*2.8,a:.018+rand()*.038}));
    for(const d of dust){staticCtx.fillStyle='rgba(172,150,213,'+d.a+')';staticCtx.beginPath();staticCtx.arc(d.x,d.y,d.r,0,Math.PI*2);staticCtx.fill();}
    twinkling=[];
    stars.forEach((s,i)=>{if(s.r>.7&&i%(mobile.matches?4:2)===0)twinkling.push(s);else dot(staticCtx,s,s.a*.87);});
    render(performance.now());
  }
  function stop(){if(raf)cancelAnimationFrame(raf);raf=0;}
  function tick(now){
    raf=0;if(dead||document.hidden||reduced.matches)return;
    if(now-lastFrame>=1000/(mobile.matches?24:40)){render(now);lastFrame=now;}
    raf=requestAnimationFrame(tick);
  }
  function start(){if(!dead&&!document.hidden&&!reduced.matches&&!raf){lastFrame=-Infinity;raf=requestAnimationFrame(tick);}}
  function visibility(){if(document.hidden)stop();else start();}
  function motionChanged(){stop();render(performance.now());start();}
  function viewportChanged(){resize();start();}
  const observer=typeof ResizeObserver==='function'?new ResizeObserver(viewportChanged):null;
  observer?.observe(canvas);addEventListener('resize',viewportChanged,{passive:true});
  document.addEventListener('visibilitychange',visibility);
  document.addEventListener('ltts:realmchange',viewportChanged);
  reduced.addEventListener?.('change',motionChanged);mobile.addEventListener?.('change',viewportChanged);
  document.addEventListener('ltts:detach',()=>{dead=true;stop();observer?.disconnect();removeEventListener('resize',viewportChanged);document.removeEventListener('visibilitychange',visibility);document.removeEventListener('ltts:realmchange',viewportChanged);reduced.removeEventListener?.('change',motionChanged);mobile.removeEventListener?.('change',viewportChanged);},{once:true});
  resize();start();
})();
