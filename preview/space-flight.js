/* One quiet, reversible journey. The veil covers the exact instant the realm changes. */
(function(root){
  'use strict';
  const clamp=x=>Math.max(0,Math.min(1,x));
  const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
  const duration=kind=>kind==='deep'?2850:kind==='return'?2450:2250;
  const rng=seed=>()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const seed=rng(76281);
  const stars=Array.from({length:186},()=>({x:seed()*2-1,y:seed()*2-1,z:.45+seed()*.85,r:.35+Math.pow(seed(),3)*1.5,a:.25+seed()*.65,h:seed()}));
  function draw(ctx,w,h,p,kind,point={x:.5,y:.5}){
    p=clamp(p);ctx.clearRect(0,0,w,h);
    if(p===0||p===1)return;
    const deep=kind==='deep',returning=kind==='return',mid=.51;
    const veil=p<mid?smooth(p/.43):1-smooth((p-.59)/.41);
    ctx.fillStyle='rgba(4,5,13,'+veil+')';ctx.fillRect(0,0,w,h);
    const pulse=Math.sin(Math.PI*p),cx=w*(.5+(clamp(point.x)-.5)*.24),cy=h*(.5+(clamp(point.y)-.5)*.24);
    const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(w,h)*.68);
    const rgb=deep?'65,72,107':returning?'157,104,116':'90,117,173';
    glow.addColorStop(0,'rgba('+rgb+','+(pulse*(deep?.028:.085))+')');
    glow.addColorStop(.42,'rgba('+rgb+','+(pulse*(deep?.055:.13))+')');
    glow.addColorStop(1,'rgba('+rgb+',0)');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
    const outbound=p<mid, q=outbound?p/mid:(p-mid)/(1-mid);
    const radius=outbound?1-.82*smooth(q):.18+.82*smooth(q);
    const velocity=Math.sin(Math.PI*q)*(.11+(.07*(returning?1:0)));
    const count=w<550?92:deep?112:186;
    for(let i=0;i<count;i++){
      const s=stars[i],factor=radius*s.z;
      const x=cx+s.x*w*.87*factor,y=cy+s.y*h*.87*factor;
      const trailing=outbound?factor+velocity*s.z:factor-velocity*s.z;
      const tx=cx+s.x*w*.87*trailing,ty=cy+s.y*h*.87*trailing;
      const alpha=s.a*pulse*(deep?.42:.76)*(1-.46*Math.exp(-Math.pow((p-.51)/.11,2)));
      const color=s.h>.86&&returning?'255,214,180':s.h<.27?'159,190,235':'224,222,244';
      ctx.strokeStyle='rgba('+color+','+(alpha*.42)+')';ctx.lineWidth=Math.max(.45,s.r*.7);
      ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(x,y);ctx.stroke();
      ctx.fillStyle='rgba('+color+','+alpha+')';ctx.beginPath();ctx.arc(x,y,Math.max(.4,s.r*(.45+.55*radius)),0,Math.PI*2);ctx.fill();
    }
  }
  function play({kind,point,swap,done}){
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduced){swap();done?.();return()=>{};}
    const canvas=document.createElement('canvas');canvas.className='realm-flight-overlay';canvas.setAttribute('aria-hidden','true');document.body.append(canvas);
    const ctx=canvas.getContext('2d',{alpha:true});
    let raf=0,closed=false,swapped=false,start=null,last=-Infinity,w=0,h=0;
    const length=duration(kind),interval=matchMedia('(pointer:coarse)').matches?32:15;
    function close(){if(closed)return;closed=true;cancelAnimationFrame(raf);canvas.remove();document.documentElement.classList.remove('realm-in-flight');done?.();}
    document.documentElement.classList.add('realm-in-flight');
    if(!ctx){swap();close();return close;}
    function tick(now){
      if(closed)return;
      if(start===null)start=now;
      const p=clamp((now-start)/length);
      if(p>=.51&&!swapped){swapped=true;if(swap()===false){close();return;}}
      if(now-last>=interval||p===1){
        const nw=canvas.clientWidth,nh=canvas.clientHeight,dpr=Math.min(devicePixelRatio||1,1.6);
        if(nw!==w||nh!==h){w=nw;h=nh;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
        draw(ctx,w,h,p,kind,point);last=now;
      }
      if(p===1){close();return;}
      raf=requestAnimationFrame(tick);
    }
    raf=requestAnimationFrame(tick);return close;
  }
  root.LTTSFlight=Object.freeze({draw,play,duration});
})(window);
