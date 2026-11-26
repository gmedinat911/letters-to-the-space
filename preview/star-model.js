/* Shared lifecycle schema for the public Space and Observatory. */
(function(root){
  'use strict';
  const defaults = {
  "memory": {
    "farAwayAfter": null,
    "destination": "far-far-away",
    "position": [
      8,
      8
    ],
    "light": "#e7bfdc"
  },
  "the-raffle": {
    "farAwayAfter": null,
    "destination": "far-far-away",
    "position": [
      37,
      9
    ],
    "light": "#fff3df"
  },
  "golden": {
    "farAwayAfter": null,
    "destination": "far-away",
    "position": [
      70,
      8
    ],
    "light": "#ffe5ae"
  },
  "for-all-the-people-i-couldnt-keep": {
    "farAwayAfter": null,
    "destination": "far-far-away",
    "position": [
      91,
      43
    ],
    "light": "#d2ebff"
  },
  "someone-who-remembers": {
    "farAwayAfter": null,
    "destination": "far-far-away",
    "position": [
      8,
      32
    ],
    "light": "#f7faff"
  },
  "stilllight": {
    "farAwayAfter": null,
    "destination": "far-away",
    "position": [
      28,
      37
    ],
    "light": "#cbdcff"
  },
  "ordinary": {
    "farAwayAfter": null,
    "destination": "far-far-away",
    "position": [
      70,
      46
    ],
    "light": "#f0c08a"
  },
  "too-much": {
    "farAwayAfter": null,
    "destination": "far-far-away",
    "position": [
      12,
      59
    ],
    "light": "#fff1be"
  },
  "going-rogue": {
    "farAwayAfter": null,
    "destination": "far-far-away",
    "position": [
      90,
      61
    ],
    "light": "#ffd5a6"
  },
  "for-the-people-who-stayed": {
    "farAwayAfter": null,
    "destination": "far-far-away",
    "position": [
      45,
      76
    ],
    "light": "#ffceae"
  },
  "born-again": {
    "farAwayAfter": null,
    "destination": "far-far-away",
    "position": [
      68,
      84
    ],
    "light": "#fff0c8"
  },
  "75-minutes": {
    "farAwayAfter": "2026-09-06T23:59:59-04:00",
    "destination": "far-far-away"
  },
  "afterlight": {
    "farAwayAfter": "2026-11-20T00:00:00-05:00",
    "destination": "far-away"
  }
};
  const keys = Object.keys(defaults);
  const titles = {
    'memory':'A Memory','the-raffle':'The Raffle','golden':'Golden',
    'for-all-the-people-i-couldnt-keep':'For All the People I Couldn’t Keep',
    'someone-who-remembers':'Someone Who Remembers','stilllight':'Stilllight',
    'ordinary':'Ordinary','too-much':'Too Much','going-rogue':'Going Rogue',
    'for-the-people-who-stayed':'For the People Who Stayed','born-again':'Born Again',
    '75-minutes':'75 Minutes','afterlight':'Afterlight'
  };
  const copy = value => JSON.parse(JSON.stringify(value));
  const validDate = value => value === null || (typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/i.test(value) &&
    Number.isFinite(Date.parse(value)));
  function validate(input){
    if (!input || typeof input !== 'object' || Array.isArray(input) ||
        Object.keys(input).length !== keys.length || !keys.every(key=>Object.hasOwn(input,key))) {
      throw Error('The schedule does not match the current universe.');
    }
    const result = {};
    for(const key of keys){
      const row=input[key], base=defaults[key];
      if(!row || typeof row !== 'object' || !validDate(row.farAwayAfter) ||
        !['far-away','far-far-away'].includes(row.destination)) throw Error('Invalid lifecycle for '+titles[key]+'.');
      const item={farAwayAfter:row.farAwayAfter,destination:row.destination};
      if(base.position){
        if(!Array.isArray(row.position) || row.position.length!==2 ||
           !row.position.every(n=>Number.isFinite(n)&&n>=6&&n<=94)) throw Error('Invalid distant position for '+titles[key]+'.');
        item.position=[...row.position];item.light=base.light;
      }
      result[key]=item;
    }
    return result;
  }
  function state(row, now=Date.now()){
    if(row.farAwayAfter===null)return 'active';
    return Date.parse(row.farAwayAfter)<=now?row.destination:'scheduled';
  }
  root.LTTSStarModel = Object.freeze({keys:Object.freeze(keys),titles:Object.freeze(titles),
    defaults:()=>copy(defaults),validate,state});
})(window);
