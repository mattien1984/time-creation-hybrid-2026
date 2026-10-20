// The publisher embeds one atomic release here. No second script request can
// leave Safari activating a worker with a different manifest than its gate.
const config = {"version":"7e1cc207d6a5ea010d07","base":"/time-creation-hybrid-2026/","salt":"0fRTOnJLhob6FevU7r9JvnijsbkpP4Y6mtcPspBRULw=","iterations":210000,"files":{"assets/index-BHKmnEWd.js":{"file":"6eab1524ed0e52c1f62b2c9534588fa9.bin","iv":"IQPMj4CRBQnbbfw3","type":"text/javascript; charset=utf-8"},"assets/index-SyYcaNqt.css":{"file":"c451e2354c1f0ec3fd105b1fc6b0f18b.bin","iv":"jjJhueqEXR3IMkbf","type":"text/css; charset=utf-8"},"assets/logos/existence.svg":{"file":"cd03f6b2a94650df55473a6877823d0e.bin","iv":"TW5RwdOc7y2E2gyq","type":"image/svg+xml"},"assets/logos/time-creation-project.svg":{"file":"39b7b83001490ab237f39a7aaba9f245.bin","iv":"0dqmePdvS/mceYtt","type":"image/svg+xml"},"assets/logos/time-creationism.svg":{"file":"763e77e6daeec6a6de0065a40fd5c0ef.bin","iv":"RoV9A/QZUZnO+JQe","type":"image/svg+xml"},"assets/photography/existence-grid-background.png":{"file":"8ccc4108cb1ed3e3a59c4674d349f3c7.bin","iv":"KjxiQikqOKgFL8pO","type":"image/png"},"assets/photography/time-creation-project-sun.jpg":{"file":"5c312ff9aab0fa5512667a962556a93d.bin","iv":"xG0ZheQ24nvDZQW4","type":"image/jpeg"},"assets/photography/time-creationism-moon.jpg":{"file":"a38cdb5db548f74453fd2b5b31dc54b4.bin","iv":"wyPWv+XbEIYZqfX5","type":"image/jpeg"},"assets/roobert-regular-CKbHlquu.otf":{"file":"63cead5b2921ac720e1f633d6b9267ea.bin","iv":"dFzmMghkBkCQecen","type":"font/otf"},"assets/roobert-semi-mono-QbCfJD7F.otf":{"file":"298928f43a16421158fc9e7611bd59ca.bin","iv":"abNsGEm/UTEFAXo7","type":"font/otf"},"assets/season-mix-regular-NhvEiWzX.otf":{"file":"b6ccaebbd33da76959649f2d614e1514.bin","iv":"szt/AQ7+heMqa7Oq","type":"font/otf"},"assets/video/intro-515931397.mp4":{"file":"e8b7deb74f2ae4401fc3649811aca7cd.bin","iv":"ltnfxG+aHcQ3wM5V","type":"video/mp4"},"assets/video/intro-sunset-poster.jpg":{"file":"dd9a64e453782d2edd394fd87e224227.bin","iv":"2VU1rWEb/W2muHOC","type":"image/jpeg"},"favicon.svg":{"file":"09fefce87a530d3090f381a44a3f588c.bin","iv":"zS8KuvERCGnRTY6v","type":"image/svg+xml"},"index.html":{"file":"8556b9d463d8a004c9e6d1fcadc91156.bin","iv":"BoHYi781SATyjIb9","type":"text/html; charset=utf-8"}}};
const databaseName = 'time-creation-preview:'+config.base;
let session, unlocked=false;
const decrypted = new Map();
const decode = text => Uint8Array.from(atob(text), c=>c.charCodeAt(0));

async function database() {
  return new Promise((resolve,reject) => {
    let finished=false;
    const timer=setTimeout(()=>{finished=true;reject(new Error('Preview storage took too long.'));},3000);
    const request=indexedDB.open(databaseName,1);
    request.onupgradeneeded=()=>request.result.createObjectStore('session');
    request.onsuccess=()=>{clearTimeout(timer);if(finished)request.result.close();else resolve(request.result);};
    request.onerror=()=>{clearTimeout(timer);reject(request.error);};
    request.onblocked=()=>{clearTimeout(timer);finished=true;reject(new Error('Preview storage is busy.'));};
  });
}
function storageTimeout(promise) {
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('Preview storage took too long.')),3000);
    promise.then(value=>{clearTimeout(timer);resolve(value);},error=>{clearTimeout(timer);reject(error);});
  });
}
async function readSession() {
  const db=await database();
  try { return await storageTimeout(new Promise((resolve,reject)=>{const request=db.transaction('session').objectStore('session').get(config.version);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);})); }
  finally {db.close();}
}
async function saveSession(value) {
  const db=await database();
  try {await storageTimeout(new Promise((resolve,reject)=>{const transaction=db.transaction('session','readwrite');transaction.objectStore('session').clear();transaction.objectStore('session').put(value,config.version);transaction.oncomplete=resolve;transaction.onerror=()=>reject(transaction.error);transaction.onabort=()=>reject(transaction.error);}));}
  finally {db.close();}
}
const restored=readSession().then(value=>{if(!unlocked&&value?.expires>Date.now())session=value;}).catch(()=>{});
function boundedOperation(promise,milliseconds,message) {
  let timer;
  return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(message)),milliseconds);})]).finally(()=>clearTimeout(timer));
}
async function decryptFile(path,key) {
  const item=config.files[path];
  const ciphertext=await boundedNetwork(async signal=>{
    let response;
    try {response=await fetch(new URL(config.base+'.sealed/'+item.file,self.location.origin),{cache:'force-cache',signal});}
    catch {throw new Error('Preview asset could not connect. Please retry. [NET]');}
    if(!response.ok)throw new Error('Preview asset could not download. Please reload. [NET]');
    return response.arrayBuffer();
  },15000,'Preview asset download took too long. Please retry. [NET]').catch(error=>{
    if(error.message.includes('[NET]'))throw error;
    throw new Error('Preview asset download was interrupted. Please retry. [NET]');
  });
  return boundedOperation(crypto.subtle.decrypt({name:'AES-GCM',iv:decode(item.iv)},key,ciphertext),8000,'Preview asset could not finish opening. Please retry. [CRYPTO]');
}
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('message',event=>{
  if(!event.ports[0])return;
  if(event.data?.type==='ping'){event.ports[0].postMessage({ok:true,version:config.version});return;}
  if(event.data?.type!=='unlock')return;
  event.waitUntil((async()=>{
    try {
      if(event.data.version && event.data.version!==config.version)throw new Error('The preview has been updated. Reload this page and enter the password again. [VERSION]');
      let key=event.data.key,index;
      if(event.data.keyBytes) {
        const bytes=new Uint8Array(event.data.keyBytes);
        try {
          if(bytes.byteLength!==32||!event.data.ciphertext?.byteLength)throw new Error('Preview key transfer was incomplete. Please retry. [OPEN]');
          key=await boundedOperation(crypto.subtle.importKey('raw',bytes,{name:'AES-GCM'},false,['decrypt']),3000,'Preview key transfer took too long. Please retry. [KEY]');
        } finally {bytes.fill(0);}
        // The page has already downloaded and validated this encrypted entry.
        // Validate it here too, without a second network request or key cloning.
        index=await boundedOperation(crypto.subtle.decrypt({name:'AES-GCM',iv:decode(config.files['index.html'].iv)},key,event.data.ciphertext),5000,'Preview entry could not finish opening. Please retry. [CRYPTO]');
      } else index=await decryptFile('index.html',key); // Existing unlocked tabs/tests.
      const activeSession={key,expires:Date.now()+12*60*60*1000};
      unlocked=true;session=activeSession;
      decrypted.clear();decrypted.set('index.html',Promise.resolve(index));
      event.ports[0].postMessage({ok:true,version:config.version});
      // Storage is optional for this visit. Keep the worker alive for a bounded
      // save, but never make a phone wait for IndexedDB before opening the site.
      await saveSession(activeSession).catch(()=>{});
    } catch(error) {
      const password=error.name==='OperationError';
      const code=password?'PASSWORD':/\[([A-Z]+)\]$/.exec(error.message)?.[1]||'OPEN';
      event.ports[0].postMessage({ok:false,code,error:password?'That password didn’t match. Please try again.':error.message.replace(/\s*\[[A-Z]+\]$/,'')});
    }
  })());
});
// Re-check only document navigations. A cached, unlocked old shell must not
// keep requesting ciphertext removed by a newer deployment.
let releaseProbe, checkedAt=0, checkedToken, newerRelease=false;
async function boundedNetwork(task, milliseconds=2500, message='Preview network timed out.') {
  const controller=new AbortController();let timer;
  try {return await Promise.race([task(controller.signal),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(message)),milliseconds);})]);}
  finally {clearTimeout(timer);controller.abort();}
}
async function hasNewRelease(url) {
  if(newerRelease)return true;
  const token=new URL(url).searchParams.get('v')||'';
  if(!releaseProbe&&(Date.now()-checkedAt>30000||checkedToken!==token)) {
    releaseProbe=boundedNetwork(async signal=>{
      const response=await fetch(config.base+'vault-config.js?check='+Date.now(),{cache:'no-store',signal});
      if(!response.ok)throw new Error('Manifest unavailable');
      const source=await response.text();
      const match=/^self\.VAULT\s*=\s*(\{[\s\S]*\})\s*;?\s*$/.exec(source);
      if(!match)throw new Error('Invalid manifest');
      const latest=JSON.parse(match[1]);
      if(typeof latest.version!=='string'||latest.base!==config.base)throw new Error('Invalid release');
      newerRelease=latest.version!==config.version;checkedAt=Date.now();checkedToken=token;
    }).catch(()=>{}).finally(()=>{releaseProbe=undefined;});
  }
  await releaseProbe;
  return newerRelease;
}
async function passwordPage() {
  try {return await boundedNetwork(async signal=>{
    const response=await fetch(config.base+'gate.html',{cache:'no-store',signal});
    return new Response(await response.arrayBuffer(),{status:response.status,headers:response.headers});
  },5000);}
  catch {return new Response('The preview could not connect. Please reload to try again.',{status:503,headers:{'Content-Type':'text/plain','Cache-Control':'no-store'}});}
}
async function respond(request,path) {
  if(!session)await restored;
  if(!session||session.expires<=Date.now()) {
    session=undefined;decrypted.clear();
    if(request.mode==='navigate') return passwordPage();
    return new Response('Preview password required',{status:401,headers:{'Cache-Control':'no-store'}});
  }
  if(request.mode==='navigate'&&await hasNewRelease(request.url))return passwordPage();
  if(path===''||path==='index.html'||(request.mode==='navigate'&&!config.files[path]))path='index.html';
  const item=config.files[path];
  if(!item)return new Response('Not found',{status:404});
  try {
    if(!decrypted.has(path))decrypted.set(path,decryptFile(path,session.key).catch(error=>{decrypted.delete(path);throw error;}));
    const buffer=await decrypted.get(path);
    const headers={'Content-Type':item.type,'Content-Length':String(buffer.byteLength),'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes'};
    const range=request.headers.get('Range');
    if(range) {
      const match=/^bytes=(\d*)-(\d*)$/.exec(range);
      if(!match||(!match[1]&&!match[2]))return new Response(null,{status:416,headers:{'Content-Range':`bytes */${buffer.byteLength}`}});
      const start=match[1]?Number(match[1]):Math.max(0,buffer.byteLength-Number(match[2]));
      const end=match[1]&&match[2]?Math.min(Number(match[2]),buffer.byteLength-1):buffer.byteLength-1;
      if(start>end||start>=buffer.byteLength)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${buffer.byteLength}`}});
      headers['Content-Range']=`bytes ${start}-${end}/${buffer.byteLength}`;
      headers['Content-Length']=String(end-start+1);
      return new Response(request.method==='HEAD'?null:buffer.slice(start,end+1),{status:206,headers});
    }
    return new Response(request.method==='HEAD'?null:buffer,{headers});
  } catch {return new Response('Unable to load preview asset. Please reload.',{status:503});}
}
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin||!url.pathname.startsWith(config.base))return;
  const path=decodeURIComponent(url.pathname.slice(config.base.length));
  if(['gate.html','gate.js','sw.js','vault-config.js'].includes(path)||path.startsWith('.sealed/'))return;
  if(!['GET','HEAD'].includes(event.request.method))return;
  event.respondWith(respond(event.request,path));
});
