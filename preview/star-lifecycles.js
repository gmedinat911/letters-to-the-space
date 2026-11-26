/* A star's distance changes, not its meaning.
 * The Observatory publishes preview/star-lifecycles.json.
 * Retired anchors are always direct children of a viewport-fixed layer.
 * The visual miniature is optional; a failed render cannot prevent relocation.
 */
(() => {
  'use strict';
  const model=window.LTTSStarModel,layer=document.getElementById('far-away-layer');
  if(!model||!layer||!layer.isConnected)return;
  const cacheKey='ltts.lifecycle.last-valid.v1';
  let schedule=model.defaults();
  try {
    const cached=sessionStorage.getItem(cacheKey);
    if(cached)schedule=model.validate(JSON.parse(cached));
  } catch {}
  const special={
    '75-minutes':{active:'celestial lifecycle-active-seventy-five',distant:'celestial far-away-star seventy-five-star'},
    'afterlight':{active:'celestial afterlight lifecycle-active-lighthouse',distant:'celestial far-away-star distant-afterlight'}
  };
  const records=[];
  for(const anchor of document.querySelectorAll('a.celestial[data-star-key]')){
    const key=anchor.dataset.starKey;
    if(!Object.hasOwn(schedule,key))continue;
    const custom=special[key];
    let home=custom?document.querySelector('[data-star-home="'+key+'"]'):null;
    if(!home&&!custom){home=document.createComment('star-home:'+key);anchor.before(home);}
    if(!home)continue;
    records.push({anchor,key,home,custom,
      activeClasses:custom?custom.active:anchor.className,
      distantClasses:custom?custom.distant:'celestial far-away-star lifecycle-distant',
      state:null});
  }
  function apply(record,next,animate){
    const {anchor,key,home,custom,activeClasses,distantClasses}=record;
    const active=next==='active',classes=active?activeClasses:distantClasses;
    const parent=active?home.parentNode:layer;
    const changed=record.state!==next;
    const focused=document.activeElement===anchor;
    // The state and physical parent are authoritative, not a visual class or
    // whether an optional miniature has loaded.
    if(changed||anchor.parentNode!==parent||!classes.split(' ').every(c=>anchor.classList.contains(c))){
      const preserved=anchor.classList.contains('has-preserved-form');
      anchor.className=classes;
      if(preserved)anchor.classList.add('has-preserved-form');
      if(anchor.parentNode!==parent){
        if(active)home.after(anchor);else layer.appendChild(anchor);
      }
      if(focused)anchor.focus({preventScroll:true});
    }
    anchor.dataset.lifecycleState=next;
    record.state=next;
    if(!active&&!custom&&!anchor.querySelector(':scope > .ltts-star-form')){
      try {
        // Use the original catalog rather than relying on a scrolling class.
        // Relocation has already completed even if a browser rejects Shadow DOM.
        window.LTTSStarForms?.mount(anchor,key);
      } catch(error){console.warn('LTTS: using the distant marker for',key,error);}
    }
    if(changed&&animate&&!active&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
      anchor.classList.add('lifecycle-arrival');
      anchor.addEventListener('animationend',()=>anchor.classList.remove('lifecycle-arrival'),{once:true});
    }
  }
  let deadlineTimer=0,pollTimer=0,stopped=false,inFlight=null,lastRequest=0;
  function refresh(animate=false){
    clearTimeout(deadlineTimer);
    if(stopped||!layer.isConnected)return;
    const now=Date.now();let nearest=Infinity;
    for(const record of records){
      const config=schedule[record.key];
      if(!record.custom){
        const [x,y]=config.position;
        record.anchor.style.setProperty('--distant-x',x+'%');
        record.anchor.style.setProperty('--distant-y',y+'%');
        record.anchor.style.setProperty('--hidden-light',config.light||'#d7dcef');
        record.anchor.dataset.distantEdge=x<=15?'left':x>=85?'right':'center';
        record.anchor.dataset.distantVertical=y>=80?'above':'below';
      }
      const deadline=config.farAwayAfter===null?Infinity:Date.parse(config.farAwayAfter);
      const expired=now>=deadline;
      apply(record,expired?config.destination:'active',animate);
      if(!expired)nearest=Math.min(nearest,deadline);
    }
    if(!document.hidden&&Number.isFinite(nearest)){
      deadlineTimer=setTimeout(()=>refresh(true),Math.max(1,Math.min(nearest-now,3600000)));
    }
  }
  function schedulePoll(delay=60000){
    clearTimeout(pollTimer);
    if(!stopped&&!document.hidden&&layer.isConnected)pollTimer=setTimeout(()=>load(),delay);
  }
  async function load(force=false){
    if(stopped||!layer.isConnected||document.hidden)return;
    if(inFlight)return;
    if(!force&&Date.now()-lastRequest<5000){schedulePoll();return;}
    const controller=new AbortController();inFlight=controller;lastRequest=Date.now();
    const limit=setTimeout(()=>controller.abort(),3500);
    let success=false;
    try{
      // A unique URL and no-store prevent stale browser/proxy copies of the
      // Observatory schedule. Keep the last validated state on network failure.
      const response=await fetch('/preview/star-lifecycles.json?v='+lastRequest,{cache:'no-store',signal:controller.signal});
      if(!response.ok)throw Error('Schedule unavailable');
      const next=model.validate(await response.json());
      if(stopped||!layer.isConnected)return;
      const changed=JSON.stringify(schedule)!==JSON.stringify(next);
      schedule=next;
      try{sessionStorage.setItem(cacheKey,JSON.stringify(next));}catch{}
      refresh(changed);
      success=true;
    }catch(error){
      if(!stopped)console.warn('LTTS: retaining last valid star schedule',error);
    }finally{
      clearTimeout(limit);
      if(inFlight===controller)inFlight=null;
      schedulePoll(success?60000:15000);
    }
  }
  function wake(){
    refresh(false);
    if(!document.hidden)load();else clearTimeout(pollTimer);
  }
  document.addEventListener('visibilitychange',wake);
  document.addEventListener('ltts:realmchange',wake);
  window.addEventListener('pageshow',wake);
  window.addEventListener('focus',wake);
  document.addEventListener('ltts:detach',()=>{
    stopped=true;clearTimeout(deadlineTimer);clearTimeout(pollTimer);inFlight?.abort();
    document.removeEventListener('visibilitychange',wake);
    document.removeEventListener('ltts:realmchange',wake);
    window.removeEventListener('pageshow',wake);window.removeEventListener('focus',wake);
  },{once:true});
  // Apply a known valid snapshot immediately, then reconcile with live data.
  refresh(false);load(true);
})();
