(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const model=window.LTTSStarModel,api=window.LTTSObservatoryAPI;
  const login=$('login'),dashboard=$('dashboard'),tokenInput=$('token'),connect=$('connect');
  const labels={active:'Active',scheduled:'Scheduled','far-away':'Far Away','far-far-away':'Far, Far Away',permanent:'Permanent Easter egg'};
  let session=null,epoch=0,busy=false,draft=null,baseline=null,sha=null,layout='desktop',idle=0,clock=0,notice='';
  const cards=new Map();
  // Never accept credentials on a third-party preview URL, or inside an iframe.
  const trusted=location.protocol==='https:'&&['letterstothespace.com','www.letterstothespace.com'].includes(location.hostname)&&window.top===window;
  function message(node,text,error=false){node.textContent=text;node.classList.toggle('error',error);}
  function describe(error){
    if(error instanceof api.RequestError){
      if(error.status===401)return 'GitHub rejected the credential. Check that your token is current.';
      if(error.status===403)return 'GitHub denied this operation. Check the repository selection, Contents permission, or branch rules.';
      if(error.status===404)return 'GitHub could not find the schedule or the token cannot access it. Confirm the Observatory PR is merged.';
      if(error.status===409||error.status===422)return 'GitHub rejected the update. Another change or a branch rule may be involved. Reload the latest schedule before trying again.';
      if(error.status===429)return 'GitHub rate limit reached. Try again later.';
      return 'GitHub returned an error ('+error.status+'). No successful update was confirmed.';
    }
    if(error instanceof TypeError)return 'Could not reach GitHub. Check your connection.';
    // Never display a raw API response or anything that could include a credential.
    return 'The operation could not be completed. Check the token and schedule, then try again.';
  }
  function create(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
  function button(text,fn){const b=create('button','secondary',text);b.type='button';b.addEventListener('click',fn);return b;}
  function label(text,input){const l=create('label','',text);l.append(input);return l;}
  function isoLocal(value){
    if(!value)return '';
    const date=new Date(value);if(!Number.isFinite(date.getTime()))return '';
    const pad=n=>String(n).padStart(2,'0');
    return date.getFullYear()+'-'+pad(date.getMonth()+1)+'-'+pad(date.getDate())+'T'+pad(date.getHours())+':'+pad(date.getMinutes());
  }
  function localDate(value){
    const d=new Date(value);
    if(!Number.isFinite(d.getTime())||isoLocal(d.toISOString())!==value)return null;
    return d.toISOString();
  }
  const serialize=value=>JSON.stringify(value);
  const dirty=()=>!!draft&&serialize(draft)!==serialize(baseline);
  function touch(){
    if(!session)return;
    clearTimeout(idle);
    idle=setTimeout(()=>lock(false,'Session locked after 30 minutes of inactivity.'),30*60*1000);
  }
  function lock(ask=true,text='Observatory locked.'){
    if(ask&&dirty()&&!confirm('Lock the Observatory and discard unpublished changes?'))return;
    ++epoch;clearTimeout(idle);clearInterval(clock);
    session?.lock();session=null;busy=false;draft=null;baseline=null;sha=null;notice='';
    cards.clear();$('star-list').replaceChildren();$('sky').replaceChildren();
    dashboard.hidden=true;login.hidden=false;tokenInput.value='';connect.disabled=!trusted;
    message($('save-status'),'');message($('login-status'),text);if(trusted)tokenInput.focus();
  }
  function updateControls(){
    $('publish').disabled=busy||!dirty();$('reload').disabled=busy;
    $('lock').disabled=busy;
    for(const c of cards.values())for(const control of c.controls)control.disabled=busy;
  }
  function stateText(row,s){
    if(s==='scheduled')return 'Active until '+new Date(row.farAwayAfter).toLocaleString();
    if(row.farAwayAfter===null)return 'No timer · stays close';
    return 'Distant since '+new Date(row.farAwayAfter).toLocaleString();
  }
  function markChanged(){notice='';refresh();touch();}
  function refresh(){
    if(!draft)return;
    const counts={active:0,scheduled:0,distant:0};
    const filter=$('filter').value;
    for(const key of model.keys){
      const row=draft[key],s=model.state(row),c=cards.get(key);if(!c)continue;
      c.card.dataset.state=s;c.state.textContent=labels[s]+' · '+stateText(row,s);
      const group=(s==='far-away'||s==='far-far-away')?'distant':s;
      counts[group]++;c.card.hidden=filter!=='all'&&filter!==group;
    }
    if(cards.has('a-tale-of-the-author'))cards.get('a-tale-of-the-author').card.hidden=filter!=='all'&&filter!=='distant';
    $('active-count').textContent=counts.active;$('scheduled-count').textContent=counts.scheduled;$('distant-count').textContent=counts.distant;
    const changed=model.keys.filter(k=>serialize(draft[k])!==serialize(baseline[k])).length;
    $('dirty-status').textContent=changed?changed+' star'+(changed===1?'':'s')+' with unpublished changes.':'No unpublished changes.';
    if(!busy&&notice==='')message($('save-status'),'');
    updateControls();drawSky();
  }
  function build(){
    cards.clear();$('star-list').replaceChildren();
    for(const key of model.keys){
      const row=draft[key],card=create('section','star-card'),head=create('div','star-head');
      const dot=create('span','star-symbol');dot.setAttribute('aria-hidden','true');dot.style.setProperty('--star-color',row.light||(key==='afterlight'?'#d7dcef':'#d8d0ee'));
      const desc=create('div');desc.append(create('h3','',model.titles[key]));const state=create('div','state');desc.append(state);head.append(dot,desc);card.append(head);
      const fields=create('div','card-fields');
      const destination=create('select');
      for(const value of ['far-away','far-far-away']){const opt=create('option','',labels[value]);opt.value=value;destination.append(opt);}
      destination.value=row.destination;
      destination.addEventListener('change',()=>{row.destination=destination.value;markChanged();});
      const date=create('input');date.type='datetime-local';date.step='60';date.value=isoLocal(row.farAwayAfter);
      date.addEventListener('change',()=>{
        if(!date.value){row.farAwayAfter=null;markChanged();return;}
        const value=localDate(date.value);
        if(!value){date.value=isoLocal(row.farAwayAfter);notice='Invalid local time. Choose another date and time.';message($('save-status'),notice,true);return;}
        row.farAwayAfter=value;markChanged();
      });
      fields.append(label('Distant state',destination),label('Move at (local date and time)',date));card.append(fields);
      const actions=create('div','card-actions');
      const move=button('Move now',()=>{row.farAwayAfter=new Date().toISOString();date.value=isoLocal(row.farAwayAfter);markChanged();});
      const reset=button('Keep active / clear timer',()=>{row.farAwayAfter=null;date.value='';markChanged();});
      actions.append(move,reset);card.append(actions);
      const controls=[destination,date,move,reset];
      const position=create('div','position-row');
      if(row.position){
        ['X (%)','Y (%)'].forEach((text,i)=>{
          const input=create('input');input.type='number';input.min='6';input.max='94';input.step='1';input.value=String(row.position[i]);
          input.addEventListener('change',()=>{
            const n=Number(input.value);
            if(input.value===''||!Number.isFinite(n)||n<6||n>94){input.value=String(row.position[i]);return;}
            row.position[i]=n;markChanged();
          });
          position.append(label(text,input));controls.push(input);
        });
        position.append(create('span','position-note','Reserved background position; applies after the timer.'));
      }else position.append(create('span','position-note','Original custom background position is preserved.'));
      card.append(position);$('star-list').append(card);cards.set(key,{card,state,controls});
    }
    const permanent=create('section','star-card');permanent.dataset.state='permanent';
    const heading=create('div','star-head'),dot=create('span','star-symbol'),desc=create('div');dot.setAttribute('aria-hidden','true');desc.append(create('h3','','A Tale of the Author'),create('div','state','Permanent Easter egg · independent of the timers'));heading.append(dot,desc);permanent.append(heading);$('star-list').append(permanent);cards.set('a-tale-of-the-author',{card:permanent,controls:[]});
    refresh();
  }
  function lighthouse(){
    const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 54 48');svg.setAttribute('aria-hidden','true');
    for(const [x,y] of [[6,42],[23,42],[10.25,28],[18.75,28],[8.55,21.7],[20.45,21.7],[14.5,16.8],[14.5,11.4],[34.9,8.4],[47.65,5]]){
      const c=document.createElementNS(ns,'circle');c.setAttribute('cx',x);c.setAttribute('cy',y);c.setAttribute('r',1.5);svg.append(c);
    }
    return svg;
  }
  function drawSky(){
    if(!draft)return;
    const sky=$('sky');sky.replaceChildren();sky.classList.toggle('mobile',layout==='mobile');
    $('desktop-view').setAttribute('aria-pressed',String(layout==='desktop'));$('mobile-view').setAttribute('aria-pressed',String(layout==='mobile'));
    for(const key of [...model.keys,'a-tale-of-the-author']){
      const permanent=key==='a-tale-of-the-author',row=draft[key],s=permanent?'permanent':model.state(row);
      if(s==='active')continue;
      const position=permanent?[91,25]:key==='afterlight'?(layout==='mobile'?[54,19]:[24,18]):key==='75-minutes'?[5,86]:row.position;
      const dot=create('button','sky-point'+(key==='afterlight'?' lighthouse':''));
      dot.type='button';dot.dataset.state=s;dot.style.setProperty('--x',position[0]+'%');dot.style.setProperty('--y',position[1]+'%');dot.style.setProperty('--star-color',row?.light||'#d7dcef');
      const name=(permanent?'A Tale of the Author':model.titles[key])+' — '+labels[s];
      dot.title=name;dot.setAttribute('aria-label',name);
      if(key==='afterlight')dot.append(lighthouse());
      dot.addEventListener('click',()=>{$('filter').value='all';refresh();cards.get(key)?.card.scrollIntoView({block:'center',behavior:'auto'});});
      sky.append(dot);
    }
  }
  async function load(){
    const generation=epoch;
    busy=true;updateControls();
    try{
      const latest=await session.load();
      if(generation!==epoch)return false;
      draft=latest.schedule;baseline=JSON.parse(serialize(draft));sha=latest.sha;notice='';
      build();return true;
    }finally{if(generation===epoch){busy=false;updateControls();}}
  }
  $('connect-form').addEventListener('submit',async event=>{
    event.preventDefault();
    if(!trusted||session)return;
    const secret=tokenInput.value.trim();tokenInput.value='';
    if(!/^github_pat_[A-Za-z0-9_]+$/.test(secret)){message($('login-status'),'Use a fine-grained GitHub personal access token.',true);return;}
    const generation=++epoch;connect.disabled=true;message($('login-status'),'Connecting to GitHub…');
    try{
      session=api.connect(secret);
      const info=await session.authenticate();
      if(generation!==epoch)return;
      await load();
      if(generation!==epoch||!draft)return;
      $('identity').textContent=info.owner+' / '+info.branch;
      $('timezone').textContent=Intl.DateTimeFormat().resolvedOptions().timeZone||'device local time';
      login.hidden=true;dashboard.hidden=false;touch();clock=setInterval(refresh,30000);
      message($('login-status'),'');$('lock').focus();
    }catch(error){
      if(generation!==epoch)return;
      session?.lock();session=null;draft=null;baseline=null;sha=null;connect.disabled=false;message($('login-status'),describe(error),true);
    }
  });
  $('publish').addEventListener('click',async()=>{
    if(!session||busy||!dirty())return;
    const count=model.keys.filter(k=>serialize(draft[k])!==serialize(baseline[k])).length;
    if(!confirm('Publish '+count+' star lifecycle change'+(count===1?'':'s')+' to main? This creates a GitHub commit.'))return;
    const generation=epoch;busy=true;updateControls();notice='Publishing…';message($('save-status'),notice);
    try{
      const result=await session.publish(draft,sha);
      if(generation!==epoch)return;
      sha=result.sha;baseline=JSON.parse(serialize(draft));
      notice='Published commit '+result.commit.slice(0,7)+'. Your hosting deployment must finish before readers see the changes.';
      message($('save-status'),notice);
    }catch(error){
      if(generation!==epoch)return;
      notice=describe(error);message($('save-status'),notice,true);
    }finally{if(generation===epoch){busy=false;refresh();touch();}}
  });
  $('reload').addEventListener('click',async()=>{
    if(!session||busy)return;
    if(dirty()&&!confirm('Discard unpublished changes and load the current GitHub schedule?'))return;
    try{if(await load()){notice='Loaded the latest schedule.';message($('save-status'),notice);}}
    catch(error){notice=describe(error);message($('save-status'),notice,true);}
  });
  $('lock').addEventListener('click',()=>lock());
  $('filter').addEventListener('change',refresh);
  $('desktop-view').addEventListener('click',()=>{layout='desktop';drawSky();});
  $('mobile-view').addEventListener('click',()=>{layout='mobile';drawSky();});
  for(const name of ['pointerdown','keydown','input'])document.addEventListener(name,touch,{passive:true});
  window.addEventListener('beforeunload',e=>{if(dirty()){e.preventDefault();e.returnValue='';}});
  window.addEventListener('pagehide',()=>{if(session)lock(false);else tokenInput.value='';});
  if(!trusted){connect.disabled=true;tokenInput.disabled=true;message($('login-status'),'For credential safety, sign in only at https://letterstothespace.com/observatory/ in its own tab.',true);}
})();
