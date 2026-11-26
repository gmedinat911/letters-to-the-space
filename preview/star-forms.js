/* Shared miniature renderings. Reuse the original sky CSS in an isolated shadow tree,
 * so the generic distant dot rules cannot erase the original core, orbit or cloud.
 * The catalog comes from the foreground markup in space-view.html. */
(() => {
  'use strict';
  const catalog={
  "memory": {
    "classes": "celestial memory-portal",
    "parts": [
      "memory-ring",
      "light"
    ]
  },
  "the-raffle": {
    "classes": "celestial grace",
    "parts": [
      "light"
    ]
  },
  "golden": {
    "classes": "celestial golden",
    "parts": [
      "light"
    ]
  },
  "for-all-the-people-i-couldnt-keep": {
    "classes": "celestial bluegiant",
    "parts": [
      "light"
    ]
  },
  "someone-who-remembers": {
    "classes": "celestial rememberer",
    "parts": [
      "light"
    ]
  },
  "stilllight": {
    "classes": "celestial stilllight",
    "parts": [
      "light"
    ]
  },
  "ordinary": {
    "classes": "celestial ordinary",
    "parts": [
      "light"
    ]
  },
  "too-much": {
    "classes": "celestial pulsar",
    "parts": [
      "light"
    ]
  },
  "going-rogue": {
    "classes": "celestial dwarf",
    "parts": [
      "orbit",
      "light"
    ]
  },
  "for-the-people-who-stayed": {
    "classes": "celestial giant",
    "parts": [
      "light"
    ]
  },
  "born-again": {
    "classes": "celestial protostar",
    "parts": [
      "birth-cloud",
      "light"
    ]
  }
};
  function mount(container,key,source){
    if(!container||container.querySelector(':scope > .ltts-star-form'))return false;
    const entry=catalog[key];
    if(!entry&&!source)return false;
    if(!Element.prototype.attachShadow)return false;
    const host=document.createElement('span');host.className='ltts-star-form';
    host.setAttribute('aria-hidden','true');host.inert=true;
    const shadow=host.attachShadow({mode:'open'});
    const stage=document.createElement('span');stage.className='star-form-stage';
    const visual=document.createElement('span');
    visual.className=source?source.className:entry.classes;
    if(source){
      for(const node of source.children){
        if(!node.matches('.object-label,.ltts-star-form'))visual.append(node.cloneNode(true));
      }
    }else{
      for(const part of entry.parts){const node=document.createElement('span');node.className=part;visual.append(node);}
    }
    stage.append(visual);
    // Keep the generic dot until both sheets have loaded successfully.
    let loaded=0;
    for(const href of ['/preview/living-universe.css','/preview/star-forms.css']){
      const link=document.createElement('link');link.rel='stylesheet';link.href=href;
      link.addEventListener('load',()=>{if(++loaded===2)container.classList.add('has-preserved-form');},{once:true});
      shadow.append(link);
    }
    shadow.append(stage);container.append(host);
    return true;
  }
  window.LTTSStarForms=Object.freeze({mount,has:key=>Object.hasOwn(catalog,key)});
})();
