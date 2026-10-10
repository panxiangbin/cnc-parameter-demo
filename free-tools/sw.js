/* Free tools offline shell: cache same-origin files only, never store form inputs or upload data. */
const CACHE="cnc-free-tools-mobile-v3";
const ROOT=self.registration.scope;
const FILES=["./","./index.html","./tools/tolerance.html","./tools/handover.html","./tools/thermal.html","./mobile.js","./integrity-manifest.js","./download/CNC_3_Free_Tools.zip","./manifest.webmanifest","./icon.svg"];
self.addEventListener("install",event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await cache.addAll(FILES.map(p=>new URL(p,ROOT)));
  await self.skipWaiting();
 })());
});
self.addEventListener("activate",event=>{
 event.waitUntil((async()=>{
  for(const key of await caches.keys())if(key.startsWith("cnc-free-tools-")&&key!==CACHE)await caches.delete(key);
  await self.clients.claim();
 })());
});
self.addEventListener("fetch",event=>{
 const req=event.request;
 if(req.method!=="GET")return;
 const url=new URL(req.url);
 if(url.origin!==self.location.origin||!url.href.startsWith(ROOT))return;
 event.respondWith((async()=>{
  const hit=await caches.match(req,{ignoreSearch:true});
  if(hit)return hit;
  try{
   const response=await fetch(req);
   if(response.ok&&response.type==="basic"){
    const copy=response.clone();
    const cache=await caches.open(CACHE);
    await cache.put(req,copy);
   }
   return response;
  }catch{
   if(req.mode==="navigate"){
    const fallback=await caches.match(new URL("./index.html",ROOT));
    if(fallback)return fallback;
   }
   return Response.error();
  }
 })());
});
