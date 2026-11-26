/* A hidden long press, never a wheel/swipe handler. */
(() => {
  'use strict';
  const html=document.documentElement;
  const routes={'main':'/','far-away':'/far-away/','far-far-away':'/far-far-away/'};
  const realmOrder=['main','far-away','far-far-away'];
  // The screen halves are intentionally invisible. Both directions wrap around.
  function destination(from,point){
    const i=realmOrder.indexOf(from);
    const step=point.y<.5?1:-1;
    return realmOrder[(i+step+realmOrder.length)%realmOrder.length];
  }
  function flightKind(from,to){
    return realmOrder.indexOf(to)<realmOrder.indexOf(from)?'return':to==='far-far-away'?'deep':'away';
  }
  const artwork={'main':'/preview/art/cosmic-hero.webp','far-away':'/preview/art/far-away.webp','far-far-away':'/preview/art/far-far-away.webp'};
  let press=null,busy=false,stopFlight=null,suppressClick=false,dead=false,flightSequence=0;
  const cache=new Map();
  const realm=()=>html.dataset.realm||'main';
  function warm(key){
    if(cache.has(key))return;
    const img=new Image();cache.set(key,img);
    if(key!=='main')img.addEventListener('error',()=>{if(img.src.endsWith('.webp'))img.src='/preview/art/'+key+'.svg';},{once:true});
    img.src=artwork[key];img.decode?.().catch(()=>{});
  }
  function setRealm(key){
    if(!Object.hasOwn(routes,key))return false;
    html.dataset.realm=key;
    document.querySelectorAll('.celestial.is-discovered').forEach(a=>a.classList.remove('is-discovered'));
    if(window.top!==window&&location.pathname==='/space-view.html'){
      const url=new URL(location.href);
      if(key==='main')url.searchParams.delete('realm');else url.searchParams.set('realm',key);
      // Replace the child frame's entry; the outer shell owns Back/Forward.
      try{history.replaceState(history.state,'',url.href);}catch{}
    }
    if(key!=='main')window.scrollTo({top:0,behavior:'instant'});
    document.dispatchEvent(new CustomEvent('ltts:realmchange',{detail:key}));
    return true;
  }
  function clearPress(){if(press){clearTimeout(press.timer);clearTimeout(press.warm);press=null;}}
  function cancelFlight(){
    // Invalidate the completion callback before closing the overlay. Back or
    // Forward during a star journey must never open its queued letter.
    ++flightSequence;clearPress();const stop=stopFlight;stopFlight=null;busy=false;suppressClick=false;stop?.();
  }
  window.LTTSRealm={setRealm,cancelFlight,current:realm,openStar};
  const blocked='a,button,input,select,textarea,label,[role="button"],[contenteditable],h1,h2,h3,p,small,footer,.object-label,svg';
  function empty(target){return target?.nodeType===1&&!target.closest(blocked);}
  function getRouter(){
    try{return window.top===window?window.LTTSNavigation:window.parent.LTTSNavigation;}catch{return null;}
  }
  function go(point,{targetRealm=destination(realm(),point),source=null,keyboard=false,openHref=null,held=false}={}){
    if(dead||busy||!Object.hasOwn(routes,targetRealm))return false;
    const from=realm(),to=targetRealm;
    if(from===to)return false;
    const router=getRouter();
    if(!router?.travelRealm||!window.LTTSFlight?.play)return false;
    const kind=flightKind(from,to),token=++flightSequence;
    let arrived=false,finished=false;
    warm(to);busy=true;
    if(held)suppressClick=true;
    const swap=()=>{
      if(dead||token!==flightSequence||realm()!==from)return false;
      arrived=router.travelRealm(routes[to],document,{source,keyboard})===true;
      return arrived;
    };
    const done=()=>{
      finished=true;
      if(token!==flightSequence)return;
      busy=false;stopFlight=null;
      // Open the original link only after a successful arrival. Its return
      // destination will then be this realm, rather than the main Space.
      if(arrived&&!dead&&realm()===to&&openHref){
        router.navigate(openHref,{source,keyboard,sourceDoc:document});
      }
    };
    const stop=window.LTTSFlight.play({kind,point,swap,done});
    if(!finished&&token===flightSequence)stopFlight=stop;
    return true;
  }
  function openStar(anchor,{keyboard=false}={}){
    if(realm()!=='main'||!anchor?.matches('a.celestial[href]'))return false;
    const to=anchor.dataset.lifecycleState;
    if(to!=='far-away'&&to!=='far-far-away')return false;
    // Clicking a distant light is a shortcut to its own realm, not a
    // requirement to rediscover the light there before reading.
    const rect=anchor.getBoundingClientRect();
    return go({x:(rect.left+rect.width/2)/Math.max(1,innerWidth),
      y:(rect.top+rect.height/2)/Math.max(1,innerHeight)},
      {targetRealm:to,source:anchor,keyboard,openHref:anchor.href});
  }
  function down(e){
    if(press){clearPress();return;} // A second finger/pointer cancels the hold.
    if(busy||dead)return;
    suppressClick=false;
    if(e.button!==0||!e.isPrimary||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||!empty(e.target))return;
    const hold={id:e.pointerId,x:e.clientX,y:e.clientY,touch:e.pointerType==='touch'};
    const point={x:hold.x/Math.max(1,innerWidth),y:hold.y/Math.max(1,innerHeight)};
    hold.warm=setTimeout(()=>warm(destination(realm(),point)),300);
    hold.timer=setTimeout(()=>{
      if(press!==hold)return;
      clearPress();go(point,{held:true});
    },1500);
    press=hold;
  }
  function move(e){if(press&&e.pointerId===press.id&&Math.hypot(e.clientX-press.x,e.clientY-press.y)>12)clearPress();}
  function up(e){if(press&&e.pointerId===press.id)clearPress();}
  document.addEventListener('pointerdown',down,{passive:true});
  document.addEventListener('pointermove',move,{passive:true});
  document.addEventListener('pointerup',up,{passive:true});
  document.addEventListener('pointercancel',up,{passive:true});
  window.addEventListener('scroll',clearPress,{passive:true,capture:true});
  window.addEventListener('blur',clearPress);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clearPress();});
  document.addEventListener('contextmenu',e=>{if(empty(e.target)&&(press?.touch||suppressClick)&&e.button!==2)e.preventDefault();});
  document.addEventListener('click',e=>{if(busy||(suppressClick&&e.detail!==0)){e.preventDefault();e.stopImmediatePropagation();suppressClick=false;}},true);
  document.addEventListener('keydown',e=>{
    if(e.altKey&&e.shiftKey&&!e.repeat&&empty(document.activeElement)&&['Space','ArrowUp','ArrowDown'].includes(e.code)){
      e.preventDefault();go({x:.5,y:e.code==='ArrowDown'?.75:.25});
    }
  });
  document.addEventListener('ltts:detach',()=>{dead=true;cancelFlight();},{once:true});
})();
