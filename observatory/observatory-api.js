/* GitHub persistence: no credentials in URLs, browser storage, or the repo. */
(function(root){
  'use strict';
  const repo='https://api.github.com/repos/gmedinat911/letters-to-the-space';
  const file=repo+'/contents/preview/star-lifecycles.json';
  const branch='main';
  class RequestError extends Error{
    constructor(status){super('GitHub request failed');this.status=status;}
  }
  function encode(value){const bytes=new TextEncoder().encode(value);let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);return btoa(binary);}
  function decode(value){const binary=atob(value.replace(/\s/g,''));return new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(binary,ch=>ch.charCodeAt(0)));}
  function connect(token){
    // Enforce fine-grained PATs, rather than accepting broad classic tokens.
    if(typeof token!=='string'||!/^github_pat_[A-Za-z0-9_]+$/.test(token))throw Error('Use a fine-grained GitHub token.');
    const controller=new AbortController();
    async function request(url,method='GET',body){
      if(controller.signal.aborted)throw Error('Session locked');
      const response=await fetch(url,{method,redirect:'error',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',
        signal:controller.signal,headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json',
        'X-GitHub-Api-Version':'2022-11-28',...(body?{'Content-Type':'application/json'}:{})},
        ...(body?{body:JSON.stringify(body)}:{})});
      if(!response.ok)throw new RequestError(response.status);
      return response.json();
    }
    return Object.freeze({
      async authenticate(){
        const info=await request(repo);
        if(info.full_name.toLowerCase()!=='gmedinat911/letters-to-the-space'||!info.permissions?.push)throw Error('Repository write access required.');
        return {owner:info.full_name,branch};
      },
      async load(){
        const data=await request(file+'?ref='+branch);
        if(data.type!=='file'||data.encoding!=='base64'||!(/^[a-f0-9]{40}$/i.test(data.sha)))throw Error('Unexpected schedule response.');
        return {sha:data.sha,schedule:root.LTTSStarModel.validate(JSON.parse(decode(data.content)))};
      },
      async publish(schedule,sha){
        const clean=root.LTTSStarModel.validate(schedule);
        if(!/^[a-f0-9]{40}$/i.test(sha))throw Error('Reload the schedule first.');
        const data=await request(file,'PUT',{message:'Observatory: update star lifecycles',content:encode(JSON.stringify(clean,null,2)+'\n'),sha,branch});
        if(!data?.content?.sha||!data?.commit?.sha)throw Error('Commit confirmation unavailable. Reload from GitHub before retrying.');
        return {sha:data.content.sha,commit:data.commit.sha};
      },
      lock(){controller.abort();token='';}
    });
  }
  root.LTTSObservatoryAPI=Object.freeze({connect,RequestError});
})(window);
