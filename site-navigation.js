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
      if(p==='/space-view.html'){
        const realm=u.searchParams.get('realm');
        p=realm==='far-away'||realm==='far-far-away'?'/'+realm+'/':'/';
        u.searchParams.delete('realm');
      }
      if(!p.endsWith('/')&&!/\.[a-z0-9]+$/i.test(p))p+='/';
      if(p==='/constellations/the-slow-goodbye/')p='/constellations/almost/';
      if(!['/','/far-away/','/far-far-away/'].includes(p)&&p!=='/a-tale-of-the-author/'&&!/^\/(?:letters|constellations|archive)\/(?:[a-z0-9-]+\/)?$/.test(p))return null;
      return p+u.search+u.hash;
    }catch{return null;}
  };
  const pathOf=route=>route.split(/[?#]/)[0];
  const realmPaths=['/','/far-away/','/far-far-away/'];
  const isRealm=route=>realmPaths.includes(pathOf(route));
  const realmKey=route=>pathOf(route)==='/'?'main':pathOf(route).slice(1,-1);
  const framePath=route=>{
    if(!isRealm(route))return route;
    const url=new URL(route,origin);
    if(realmKey(route)!=='main')url.searchParams.set('realm',realmKey(route));
    return '/space-view.html'+url.search+url.hash;
  };
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
  let current={route:initial,key:previous?.ltts&&previous.route===initial?previous.key:newKey(),returnRealm:isRealm(initial)?pathOf(initial):previous?.ltts&&previous.route===initial&&realmPaths.includes(previous.returnRealm)?previous.returnRealm:'/'};
  let frame=document.getElementById('space');
  let activeDoc=null,activeRoute=null,pending=null,timer=0,generation=0;
  const attached=new WeakSet();
  history.scrollRestoration='manual';
  history.replaceState({ltts:true,...current},'',current.route);
  // The soundtrack stays outside the reading frame and survives navigation.
  // Use the canonical playlist permalink, without share-tracking parameters.
  const soundcloudShare='https://soundcloud.com/user-480173754/sets/ltts-sounds';
  const spotifyFallback='https://open.spotify.com/playlist/2vusU3UUDPgrhDHlMw04nB';
  const sound=document.createElement('div');sound.id='ltts-sound';
  const ui=sound.attachShadow({mode:'open'});
  ui.innerHTML='<style>:host{font-family:Georgia,serif}*{box-sizing:border-box}aside{display:flex;flex-direction:column;align-items:flex-end;gap:10px}button{color:inherit;cursor:pointer}#toggle{width:44px;height:44px;border:1px solid #ffffff30;border-radius:50%;background:#11141de8;display:grid;place-items:center}#toggle:hover,#toggle:focus-visible{box-shadow:0 0 18px #b6caff40}#panel{width:min(320px,calc(100vw - 32px));max-height:calc(100dvh - 100px);overflow:auto;background:#11141df5;border:1px solid #ffffff24;border-radius:14px;padding:10px;box-shadow:0 12px 40px #0008}#panel[hidden],#status[hidden],#retry[hidden]{display:none}header{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;font:11px Georgia,serif;letter-spacing:1.4px;text-transform:uppercase}#close{background:none;border:0;font-size:22px}a{color:#c4c8d3;font:12px Georgia,serif}iframe{display:block;width:100%;border:0;border-radius:10px;background:#11141d}#status{font:13px/1.5 Georgia,serif;color:#c4c8d3;padding:8px 2px;margin:0}#retry{background:#252331;border:1px solid #ffffff24;border-radius:6px;padding:6px 10px;font:12px Georgia,serif;margin:0 0 8px}footer{display:flex;justify-content:space-between;gap:10px;padding-top:8px;flex-wrap:wrap}</style><aside aria-label="Soundtrack"><section id="panel" hidden><header>The Sound of the Space<button id="close" aria-label="Collapse music player">×</button></header><p id="status" role="status" hidden></p><div id="player"></div><button id="retry" hidden>Try again</button><footer><a id="soundcloud-link" target="_blank" rel="noopener noreferrer">Open in SoundCloud</a><a id="spotify-link" target="_blank" rel="noopener noreferrer">Spotify alternative</a></footer></section><button id="toggle" aria-label="Open soundtrack" aria-expanded="false" aria-controls="panel"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V6l10-2v12M9 9l10-2"/><ellipse cx="6" cy="18" rx="3" ry="2.4"/><ellipse cx="16" cy="16" rx="3" ry="2.4"/></svg></button></aside>';
  document.body.appendChild(sound);
  const panel=ui.getElementById('panel'),toggle=ui.getElementById('toggle'),player=ui.getElementById('player');
  const status=ui.getElementById('status'),retry=ui.getElementById('retry');
  ui.getElementById('soundcloud-link').href=soundcloudShare;
  ui.getElementById('spotify-link').href=spotifyFallback;
  let musicLoaded=false,musicLoading=false;
  function mountSound(widget){
    widget.protocol='https:';
    for(const [key,value] of Object.entries({auto_play:'false',visual:'false',show_artwork:'false',show_comments:'false',show_playcount:'false',buying:'false',download:'false',color:'#b7a7ca'}))widget.searchParams.set(key,value);
    const music=document.createElement('iframe');
    music.title='SoundCloud soundtrack';music.src=widget.href;
    music.height='300';music.setAttribute('scrolling','no');music.allow='autoplay; encrypted-media';
    player.replaceChildren(music);
    musicLoaded=true;
  }
  async function loadSound(){
    if(musicLoaded||musicLoading)return;
    musicLoading=true;retry.hidden=true;status.hidden=false;status.textContent='Finding the soundtrack…';
    const abort=new AbortController();
    const timeout=setTimeout(()=>abort.abort(),5000);
    try{
      const endpoint=new URL('https://soundcloud.com/oembed');
      endpoint.search=new URLSearchParams({format:'json',url:soundcloudShare,maxheight:'300',color:'b7a7ca',auto_play:'false',show_comments:'false'});
      const response=await fetch(endpoint.href,{signal:abort.signal,credentials:'omit'});
      if(!response.ok)throw Error('SoundCloud lookup failed');
      const data=await response.json();
      const source=new DOMParser().parseFromString(String(data.html||''),'text/html').querySelector('iframe[src]')?.getAttribute('src');
      if(!source)throw Error('SoundCloud did not return a player');
      const widget=new URL(source,'https://w.soundcloud.com');
      if(widget.hostname!=='w.soundcloud.com'||widget.port||widget.username||widget.password||widget.pathname!=='/player/'||!widget.searchParams.has('url')||!['https:','http:'].includes(widget.protocol))throw Error('Unexpected embed URL');
      mountSound(widget);
      status.hidden=true;
    }catch{
      // If the metadata request is blocked, try the official widget with the
      // canonical playlist permalink. The external link remains available.
      const widget=new URL('https://w.soundcloud.com/player/');
      widget.searchParams.set('url',soundcloudShare);
      mountSound(widget);
      status.textContent='If the player does not load, open the playlist in SoundCloud or try again.';
      retry.hidden=false;
    }finally{clearTimeout(timeout);musicLoading=false;}
  }
  function showSound(open){
    panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Collapse soundtrack':'Open soundtrack');
    if(open)loadSound();
  }
  retry.addEventListener('click',()=>{if(musicLoading)return;musicLoaded=false;player.replaceChildren();loadSound();});
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
    if(star&&isRealm(current.route)){
      pos.star=routeOf(star.href);pos.offset=star.getBoundingClientRect().top;pos.keyboard=keyboard;
    }else if(isRealm(current.route)&&last[current.route]?.star&&Math.abs(last[current.route].y-pos.y)<8){
      Object.assign(pos,{star:last[current.route].star,offset:last[current.route].offset,keyboard:last[current.route].keyboard});
    }
    entries[current.key]=pos;last[current.route]=pos;if(isRealm(current.route))last[pathOf(current.route)]=pos;
    persist();
  }
  function restore(doc,pos){
    if(!pos||!doc.defaultView)return;
    const win=doc.defaultView;
    let y=Number(pos.y)||0,star=null;
    if(pos.star&&isRealm(current.route)){
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
      // On touch, living-universe.js prevents the first discovery tap before
      // this listener runs. The second tap follows the same route as a mouse.
      if(isRealm(current.route)&&activeDoc===doc&&doc.defaultView?.LTTSRealm?.openStar(a,{keyboard:event.detail===0}))return;
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
        current={...current,route:actual,returnRealm:isRealm(actual)?pathOf(actual):current.returnRealm};
        history.replaceState({ltts:true,...current},'',actual);
      }
      finish(doc,actual,actual===request.route?request.pos:null);
    }else{
      if(actual!==current.route){
        current={...current,route:actual,returnRealm:isRealm(actual)?pathOf(actual):current.returnRealm};
        history.replaceState({ltts:true,...current},'',actual);
      }
      finish(doc,actual,isRealm(actual)?entries[current.key]||last[pathOf(actual)]:entries[current.key]);
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
    if(options.sourceDoc&&options.sourceDoc!==activeDoc)return false;
    let route=routeOf(value);
    if(!route)return false;
    if(options.returning&&pathOf(route)==='/'&&!isRealm(current.route)&&realmPaths.includes(current.returnRealm))route=current.returnRealm;
    if(pending)return true;
    if(route===current.route)return true;
    snapshot(options.source,options.keyboard);
    const pos=isRealm(route)?last[pathOf(route)]:options.returning?last[route]:null;
    current={route,key:newKey(),returnRealm:isRealm(route)?pathOf(route):isRealm(current.route)?pathOf(current.route):current.returnRealm};
    history.pushState({ltts:true,...current},'',route);
    load(route,pos);
    return true;
  }
  // Keep the same realm document and soundtrack alive through the cinematic swap.
  function travelRealm(value,sourceDoc,options={}){
    const route=routeOf(value);
    if(!route||!isRealm(route)||!isRealm(current.route)||pending||!activeDoc||sourceDoc!==activeDoc)return false;
    if(route===current.route)return false;
    const realm=activeDoc.defaultView?.LTTSRealm;
    if(!realm?.setRealm)return false;
    snapshot(options.source,options.keyboard);
    current={route,key:newKey(),returnRealm:pathOf(route)};
    history.pushState({ltts:true,...current},'',route);
    realm.setRealm(realmKey(route));activeRoute=route;
    restore(activeDoc,last[pathOf(route)]||{y:0});
    return true;
  }
  window.LTTSNavigation={navigate,travelRealm};
  window.addEventListener('popstate',event=>{
    activeDoc?.defaultView?.LTTSRealm?.cancelFlight();
    snapshot();
    const route=routeOf(location.href);if(!route)return;
    const previousRealm=isRealm(current.route);
    current={route,key:event.state?.key||newKey(),returnRealm:isRealm(route)?pathOf(route):realmPaths.includes(event.state?.returnRealm)?event.state.returnRealm:'/'};
    const pos=entries[current.key]||(isRealm(route)?last[pathOf(route)]:null);
    if(!pending&&previousRealm&&isRealm(route)&&activeDoc?.defaultView?.LTTSRealm){
      const realm=activeDoc.defaultView.LTTSRealm;realm.setRealm(realmKey(route));activeRoute=route;
      restore(activeDoc,pos||{y:0});return;
    }
    load(route,pos,false);
  });
  window.addEventListener('pagehide',()=>snapshot());
  if(frame){
    observeFrame(frame);
    try{if(frame.contentDocument?.readyState==='complete'&&routeOf(frame.contentWindow.location.href))frameLoaded(frame);}catch{}
  }else{
    finish(document,initial,previous?.ltts?entries[current.key]:null);
  }
})();
