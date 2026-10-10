/* 数控小潘免费工具｜手机领取、下载和本地SHA-256校验，无后端与用户数据上传 */
(()=>{
"use strict";
const $=id=>document.getElementById(id);
const pack=window.CNC_FREE_PACK;
const downloadButton=$("bundle-download");
const downloadStatus=$("download-status");
const verifyFile=$("verify-file");
const verifyStatus=$("verify-status");
const copyButton=$("copy-link");
const copyStatus=$("copy-status");
const offlineStatus=$("offline-status");
const officialUrl="https://panxiangbin.github.io/cnc-parameter-demo/free-tools/";
const files=Array.isArray(pack?.files)?pack.files:[];

function status(node,msg,isError=false){
 if(!node)return;
 node.textContent=msg;
 node.dataset.level=isError?"error":"info";
}
function hex(arrayBuffer){
 return [...new Uint8Array(arrayBuffer)].map(v=>v.toString(16).padStart(2,"0")).join("");
}
if(downloadButton){
 downloadButton.addEventListener("click",event=>{
  if(!pack?.archiveSha256||downloadButton.getAttribute("href")!=="./download/CNC_3_Free_Tools.zip"){
   event.preventDefault();
   status(downloadStatus,"下载信息暂不可用，请先点上方“在线使用”。",true);
   return;
  }
  status(downloadStatus,"已向浏览器请求下载 "+pack.archiveBytes.toLocaleString()+" 字节的ZIP。请先到手机“下载”或“文件”里确认保存完成，再返回这里上传文件做SHA-256校验。");
 });
}
if(verifyFile){
 verifyFile.addEventListener("change",async()=>{
  const file=verifyFile.files?.[0];
  if(!file)return;
  if(file.size>2*1024*1024){
   status(verifyStatus,"当前只检查本站的小型HTML或ZIP（最大2MB）。你选择的文件不需要上传。",true);
   verifyFile.value="";
   return;
  }
  if(!crypto?.subtle?.digest){
   status(verifyStatus,"当前浏览器不支持本地SHA-256校验。仍可在线使用；建议换最新Chrome或Safari。",true);
   verifyFile.value="";
   return;
  }
  try{
   status(verifyStatus,"正在手机本地核对文件完整性，不会上传到服务器……");
   const digest=hex(await crypto.subtle.digest("SHA-256",await file.arrayBuffer()));
   const bundleOk=digest===pack.archiveSha256&&file.size===pack.archiveBytes;
   const matched=files.find(x=>digest===x.sha256&&file.size===x.bytes);
   if(bundleOk){
    status(verifyStatus,"✓ 校验通过：完整的3款工具ZIP离线包（"+file.size.toLocaleString()+"字节）。这个文件确实保存在你设备上，且与本站提供的原始文件一致。可以到“文件/下载”里解压使用。");
    verifyStatus.dataset.state="pass";
   }else if(matched){
    status(verifyStatus,"✓ 校验通过："+matched.label+"的HTML文件完整（"+file.size.toLocaleString()+"字节）。离线打开是否支持取决于手机浏览器，也可继续在线使用。");
    verifyStatus.dataset.state="pass";
   }else{
    status(verifyStatus,"✕ 文件校验不匹配：可能选错了文件、文件经过修改或下载未完成。请重新下载本站离线包，再选择文件核验。",true);
    verifyStatus.dataset.state="fail";
   }
  }catch(e){
   status(verifyStatus,"文件检查失败："+String(e.message||e)+"；文件不会发送到网站。",true);
   verifyStatus.dataset.state="fail";
  }finally{verifyFile.value="";}
 });
}
if(copyButton){
 copyButton.addEventListener("click",async()=>{
  try{
   await navigator.clipboard.writeText(officialUrl);
   status(copyStatus,"领取网址已复制，可以转发给需要的同行。");
  }catch{
   const a=$("share-url");
   if(a){a.focus();a.select();}
   status(copyStatus,"已选中下面的网址；如未自动复制，可长按选择“复制”。");
  }
 });
}
async function offlineReady(){
 if(!offlineStatus)return;
 if(!("serviceWorker" in navigator)||!("caches" in window)){
  status(offlineStatus,"当前浏览器不支持离线网页缓存。可下载ZIP或使用在线工具。");
  return;
 }
 if(!window.isSecureContext){
  status(offlineStatus,"离线网页缓存需要HTTPS；当前可使用在线计算和文件下载。");
  return;
 }
 try{
  const reg=await navigator.serviceWorker.register("./sw.js",{scope:"./"});
  await navigator.serviceWorker.ready; // only after install/activate and precache complete
  const cache=await caches.open("cnc-free-tools-mobile-v3");
  const items=["./index.html","./tools/tolerance.html","./tools/handover.html","./tools/thermal.html"];
  const found=await Promise.all(items.map(p=>cache.match(new URL(p,location.href))));
  if(found.every(Boolean)){
   status(offlineStatus,"✓ 已缓存首页及3款工具。现在可以尝试断网后从本页历史记录或主屏幕再次打开。真正的离线体验仍要以你的手机测试为准。");
   offlineStatus.dataset.state="ready";
  }else{
   status(offlineStatus,"离线缓存正在准备中，可先在线使用。");
  }
  if(reg.installing)reg.installing.addEventListener("statechange",()=>{if(reg.installing?.state==="activated")offlineReady()},{once:true});
 }catch(e){
  status(offlineStatus,"离线缓存暂不可用；可在线使用或下载ZIP。");
 }
}
offlineReady();
})();
