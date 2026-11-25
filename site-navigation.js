/* LTTS: real browser URLs, a persistent soundtrack, and a way back to each star. */
(() => {
  'use strict';
  if(window.top!==window)return;
  const origin=location.origin;
  const routeOf=value=>{
    try{
      const u=new URL(value,origin);
      if(u.origin!==origin)return null;
      let p=u.pathname.replace(/\/index\.html$/,'/');
      if(p==='/space-view.html')p='/';
      if(!p.endsWith('/')&&!/\.[a-z0-9]+$/i.test(p))p+='/';
      if(p==='/constellations/the-slow-goodbye/')p='/constellations/almost/';
      if(p!=='/'&&p!=='/a-tale-of-the-author/'&&!/^\/(?:letters|constellations|archive)\/(?:[a-z0-9-]+\/)?$/.test(p))return null;
      return p+u.search+u.hash;
    }catch{return null;}
  };
  const isHome=route=>route.split(/[?#]/)[0]==='/';
  const framePath=route=>isHome(route)?'/space-view.html'+route.slice(1):route;
  const initial=routeOf(location.href);
  if(!initial)return;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const storageKey='ltts.navigation.v2';
  let saved={last:{},entries:{}};
  try{
    const data=JSON.parse(sessionStorage.getItem(storageKey)||'{}');
    saved={last:data.last||{},entries:data.entries||{}};
  }catch{}
  const {last,entries}=saved;
  let serial=0;
  const newKey=()=>Date.now().toString(36)+'-'+(++serial);
  const previous=history.state;
  let current={route:initial,key:previous?.ltts&&previous.route===initial?previous.key:newKey()};
  let frame=document.getElementById('space');
  let activeDoc=null,activeRoute=null,pending=null,timer=0,generation=0;
  const attached=new WeakSet();
  history.scrollRestoration='manual';
  history.replaceState({ltts:true,...current},'',current.route);
  // The soundtrack stays outside the reading frame and survives navigation.
  const sound=document.createElement('div');sound.id='ltts-sound';
  const ui=sound.attachShadow({mode:'open'});
  ui.innerHTML='<style>:host{font-family:Georgia,serif}*{box-sizing:border-box}aside{display:flex;flex-direction:column;align-items:flex-end;gap:10px}button{color:inherit;cursor:pointer}#toggle{width:44px;height:44px;border:1px solid #ffffff30;border-radius:50%;background:#11141de8;display:grid;place-items:center}#toggle:hover,#toggle:focus-visible{box-shadow:0 0 18px #b6caff40}#panel{width:min(300px,calc(100vw - 32px));background:#11141df5;border:1px solid #ffffff24;border-radius:14px;padding:10px;box-shadow:0 12px 40px #0008}#panel[hidden]{display:none}header{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;font:11px Georgia,serif;letter-spacing:1.4px;text-transform:uppercase}#close{background:none;border:0;font-size:22px}a{color:#c4c8d3;font:12px Georgia,serif}iframe{display:block;width:100%;border:0;border-radius:10px}</style><aside aria-label="Soundtrack"><section id="panel" hidden><header>The Sound of the Space<button id="close" aria-label="Collapse music player">×</button></header><div id="player"></div><a href="https://open.spotify.com/playlist/2vusU3UUDPgrhDHlMw04nB" target="_blank" rel="noopener noreferrer">Open in Spotify</a></section><button id="toggle" aria-label="Open soundtrack" aria-expanded="false" aria-controls="panel"><svg width="23" height="23" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M6 9 Q12 6 18 10 M7 12 Q12 9.5 17 13 M8 15 Q12 13 16 16" stroke="#11141d" stroke-width="1.6" stroke-linecap="round" fill="none"/></svg></button></aside>';
  document.body.appendChild(sound);
  const panel=ui.getElementById('panel'),toggle=ui.getElementById('toggle'),player=ui.getElementById('player');
  let musicLoaded=false;
  function showSound(open){
    if(open&&!musicLoaded){
      const music=document.createElement('iframe');
      music.title='Spotify soundtrack';music.src='https://open.spotify.com/embed/playlist/2vusU3UUDPgrhDHlMw04nB?theme=0';
      music.height='152';music.allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
      player.append(music);musicLoaded=true;
    }
    panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Collapse soundtrack':'Open soundtrack');
  }
  toggle.addEventListener('click',()=>showSound(panel.hidden));
  ui.getElementById('close').addEventListener('click',()=>{showSound(false);toggle.focus();});
  function escapeSound(event){if(event.key==='Escape'&&!panel.hidden){showSound(false);toggle.focus();}}
  document.addEventListener('keydown',escapeSound);
  function persist(){
    try{
      const keys=Object.keys(entries);
      for(const k of keys.slice(0,Math.max(0,keys.length-100)))delete entries[k];
      sessionStorage.setItem(storageKey,JSON.stringify(saved));
    }catch{}
  }
  function snapshot(source,keyboard=false){
    if(!activeDoc||activeRoute!==current.route||!activeDoc.defaultView)return;
    const win=activeDoc.defaultView;
    const pos={y:win.scrollY||0};
    const star=source?.closest?.('a.celestial[href]');
    if(star&&isHome(current.route)){
      pos.star=routeOf(star.href);pos.offset=star.getBoundingClientRect().top;pos.keyboard=keyboard;
    }else if(isHome(current.route)&&last['/']?.star&&Math.abs(last['/'].y-pos.y)<8){
      Object.assign(pos,{star:last['/'].star,offset:last['/'].offset,keyboard:last['/'].keyboard});
    }
    entries[current.key]=pos;last[current.route]=pos;if(isHome(current.route))last['/']=pos;
    persist();
  }
  function restore(doc,pos){
    if(!pos||!doc.defaultView)return;
    const win=doc.defaultView;
    let y=Number(pos.y)||0,star=null;
    if(pos.star&&isHome(current.route)){
      star=[...doc.querySelectorAll('a.celestial[href]')].find(a=>routeOf(a.href)===pos.star);
      if(star&&win.getComputedStyle(star).position!=='fixed')y=win.scrollY+star.getBoundingClientRect().top-(Number(pos.offset)||0);
    }
    const html=doc.documentElement,old=html.style.scrollBehavior;
    html.style.scrollBehavior='auto';
    win.scrollTo(0,Math.max(0,y));
    html.style.scrollBehavior=old;
    if(star&&pos.keyboard)star.focus({preventScroll:true});
  }
  function attach(doc){
    if(attached.has(doc))return;
    attached.add(doc);
    doc.addEventListener('click',event=>{
      if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      const a=event.target.closest?.('a[href]');
      if(!a||a.hasAttribute('download')||(a.target&&a.target!=='_self'))return;
      const route=routeOf(a.href);
      if(!route)return;
      event.preventDefault();
      navigate(route,{source:a,keyboard:event.detail===0,returning:a.matches('.back,.return-present')});
    });
    if(doc!==document)doc.addEventListener('keydown',escapeSound);
  }
  function reveal(){
    if(frame){frame.setAttribute('aria-busy','false');const visible=frame;requestAnimationFrame(()=>{if(frame===visible)visible.classList.remove('ltts-changing');});}
    document.body.classList.remove('ltts-leaving');
  }
  function finish(doc,route,pos){
    activeDoc=doc;activeRoute=route;pending=null;
    attach(doc);
    document.title=doc.title||'Letters to the Space';
    if(frame)frame.title=document.title;
    restore(doc,pos);
    reveal();
  }
  function frameLoaded(candidate){
    if(candidate!==frame)return;
    let doc,actual;try{doc=candidate.contentDocument;actual=routeOf(candidate.contentWindow.location.href);}catch{return;}
    if(!doc||!actual)return;
    if(pending){
      const request=pending;
      if(request.token!==generation||request.frame!==candidate)return;
      if(actual!==request.route){
        current={route:actual,key:current.key};
        history.replaceState({ltts:true,...current},'',actual);
      }
      finish(doc,actual,actual===request.route?request.pos:null);
    }else{
      if(actual!==current.route){
        current={route:actual,key:current.key};
        history.replaceState({ltts:true,...current},'',actual);
      }
      finish(doc,actual,isHome(actual)?last['/']:entries[current.key]);
    }
  }
  function observeFrame(candidate){candidate.addEventListener('load',()=>frameLoaded(candidate));}
  function mount(route,token){
    if(token!==generation||!pending)return;
    const next=document.createElement('iframe');
    next.id='space';next.title='Letters to the Space';next.setAttribute('aria-busy','true');
    if(!motion.matches)next.classList.add('ltts-changing');
    next.src=framePath(route);observeFrame(next);
    pending.frame=next;
    activeDoc=null;activeRoute=null;
    if(frame){
      const old=frame;frame=next;old.replaceWith(next);
    }else{
      // A shared letter is readable native HTML on first load; preserve the
      // soundtrack when promoting it into the persistent shell on navigation.
      document.dispatchEvent(new Event('ltts:detach'));
      document.documentElement.classList.add('ltts-shell');
      document.body.classList.remove('ltts-leaving');
      for(const child of [...document.body.children])if(child!==sound)child.remove();
      frame=next;document.body.insertBefore(next,sound);
    }
  }
  function load(route,pos,animate=true){
    clearTimeout(timer);const token=++generation;
    pending={route,pos,token,frame:null};
    if(activeDoc&&activeRoute===route){finish(activeDoc,route,pos);return;}
    const fade=animate&&!motion.matches&&Boolean(activeDoc);
    if(fade){if(frame)frame.classList.add('ltts-changing');else document.body.classList.add('ltts-leaving');}
    if(frame)frame.setAttribute('aria-busy','true');
    if(fade)timer=setTimeout(()=>mount(route,token),150);else mount(route,token);
  }
  function navigate(value,options={}){
    const route=routeOf(value);
    if(!route)return false;
    if(pending)return true;
    if(route===current.route)return true;
    snapshot(options.source,options.keyboard);
    const pos=isHome(route)?last['/']:options.returning?last[route]:null;
    current={route,key:newKey()};
    history.pushState({ltts:true,...current},'',route);
    load(route,pos);
    return true;
  }
  window.LTTSNavigation={navigate};
  window.addEventListener('popstate',event=>{
    snapshot();
    const route=routeOf(location.href);if(!route)return;
    current={route,key:event.state?.key||newKey()};
    load(route,entries[current.key]||(isHome(route)?last['/']:null),false);
  });
  window.addEventListener('pagehide',()=>snapshot());
  if(frame){
    observeFrame(frame);
    try{if(frame.contentDocument?.readyState==='complete'&&routeOf(frame.contentWindow.location.href))frameLoaded(frame);}catch{}
  }else{
    finish(document,initial,previous?.ltts?entries[current.key]:null);
  }
})();
