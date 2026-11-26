/* A hidden long press, never a wheel/swipe handler. */
(() => {
  'use strict';
  const html=document.documentElement;
  const routes={'main':'/','far-away':'/far-away/','far-far-away':'/far-far-away/'};
  const nextRealm={'main':'far-away','far-away':'far-far-away','far-far-away':'main'};
  const artwork={'main':'/preview/art/cosmic-hero.webp','far-away':'/preview/art/far-away.svg','far-far-away':'/preview/art/far-far-away.svg'};
  let press=null,busy=false,stopFlight=null,suppressClick=false,dead=false;
  const cache=new Map();
  const realm=()=>html.dataset.realm||'main';
  function warm(key){
    if(cache.has(key))return;
    const img=new Image();img.src=artwork[key];cache.set(key,img);img.decode?.().catch(()=>{});
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
  function cancelFlight(){clearPress();stopFlight?.();stopFlight=null;busy=false;}
  window.LTTSRealm={setRealm,cancelFlight,current:realm};
  const blocked='a,button,input,select,textarea,label,[role="button"],[contenteditable],h1,h2,h3,p,small,footer,.object-label,svg';
  function empty(target){return target?.nodeType===1&&!target.closest(blocked);}
  function go(point){
    if(dead||busy)return;
    const from=realm(),to=nextRealm[from],kind=to==='main'?'return':to==='far-far-away'?'deep':'away';
    warm(to);busy=true;suppressClick=true;
    const swap=()=>{
      if(dead||realm()!==from)return false;
      try{
        const router=window.top===window?window.LTTSNavigation:window.parent.LTTSNavigation;
        if(router?.travelRealm)return router.travelRealm(routes[to],document);
      }catch{}
      if(window.top===window){location.assign(routes[to]);return true;}
      return false;
    };
    stopFlight=window.LTTSFlight.play({kind,point,swap,done:()=>{busy=false;stopFlight=null;}});
  }
  function down(e){
    if(press){clearPress();return;} // A second finger/pointer cancels the hold.
    if(busy||dead)return;
    suppressClick=false;
    if(e.button!==0||!e.isPrimary||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||!empty(e.target))return;
    const hold={id:e.pointerId,x:e.clientX,y:e.clientY,touch:e.pointerType==='touch'};
    hold.warm=setTimeout(()=>warm(nextRealm[realm()]),300);
    hold.timer=setTimeout(()=>{
      if(press!==hold)return;
      clearPress();go({x:hold.x/Math.max(1,innerWidth),y:hold.y/Math.max(1,innerHeight)});
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
  document.addEventListener('click',e=>{if(busy||suppressClick){e.preventDefault();e.stopImmediatePropagation();suppressClick=false;}},true);
  document.addEventListener('keydown',e=>{
    if(e.code==='Space'&&e.altKey&&e.shiftKey&&!e.repeat&&empty(document.activeElement)){e.preventDefault();go({x:.5,y:.5});}
  });
  document.addEventListener('ltts:detach',()=>{dead=true;cancelFlight();},{once:true});
})();
