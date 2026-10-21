// The publisher embeds one atomic release here. No second script request can
// leave Safari activating a worker with a different manifest than its gate.
const config = {"version":"bde61e8071645de52250","base":"/time-creation-hybrid-2026/","salt":"ZjAzXiwJ7qk6swO/z0FCedXP3jLvnjJpZD/2u+4lcDE=","iterations":210000,"files":{"assets/index-Bw-azUdT.css":{"file":"50466fc846b4dd47112b1056b825d33d.bin","iv":"nPAFduPNcJfSz7gA","type":"text/css; charset=utf-8"},"assets/index-CIRrDB3T.js":{"file":"75ee499e84336ffa39e661772d0b6a69.bin","iv":"aYJAEF/4p2r7jklB","type":"text/javascript; charset=utf-8"},"assets/logos/existence.svg":{"file":"a75fa4c94afad8da9a66adbb28360308.bin","iv":"U/Aen51UwhDBFg+C","type":"image/svg+xml"},"assets/logos/time-creation-project.svg":{"file":"00c67579e85690a2f6b125b1bfb4f3a4.bin","iv":"YrCeE8+p2JDoL1eH","type":"image/svg+xml"},"assets/logos/time-creationism.svg":{"file":"b0334c1b27f37511e47d288b74dc6416.bin","iv":"mchFWo22FEjTr5Ho","type":"image/svg+xml"},"assets/photography/existence-grid-background.png":{"file":"0ec80d6dc374379b6dcb1f840fcdedff.bin","iv":"63GgBeMkIKpVtmPP","type":"image/png"},"assets/photography/time-creation-project-sun.jpg":{"file":"604737e60b57e3880c669a22a333ee5d.bin","iv":"N2usEufOHE0aBgCV","type":"image/jpeg"},"assets/photography/time-creationism-moon.jpg":{"file":"12a942307428ff8b7f5beb93eabf5226.bin","iv":"svi/o4IvfUxMP9Q6","type":"image/jpeg"},"assets/roobert-regular-CKbHlquu.otf":{"file":"2135ef95626a4fa3eaaa20c5813103f2.bin","iv":"YiTgnbbiZXSkZnVI","type":"font/otf"},"assets/roobert-semi-mono-QbCfJD7F.otf":{"file":"c5e3442dd5e17fce928a336dbf690a94.bin","iv":"8L7fguhCDZPAja3F","type":"font/otf"},"assets/season-mix-regular-NhvEiWzX.otf":{"file":"8065d4f2d7ad643f07cfb3baeac6d9c3.bin","iv":"N5t0Y//DQq/91sBY","type":"font/otf"},"assets/video/intro-515931397.mp4":{"file":"d69c98941244fa08a8595c532cbd4d95.bin","iv":"jts29n+Qux0JYBUC","type":"video/mp4"},"assets/video/intro-sunset-poster.jpg":{"file":"e1de8db87619abacbd4e9719f09ef71c.bin","iv":"STTja9ngu5T+6Fx8","type":"image/jpeg"},"favicon.svg":{"file":"3dc04cb9a94fc523e697866c0032fc5f.bin","iv":"5rknXRzlkG60KBs2","type":"image/svg+xml"},"index.html":{"file":"4996bf8341733b7fd1bea9a541f516cc.bin","iv":"ciXPBJad3HP6eeP4","type":"text/html; charset=utf-8"}}};
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
