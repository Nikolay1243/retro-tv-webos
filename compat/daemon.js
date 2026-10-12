'use strict';
const http=require('http'),fs=require('fs'),CDP=require('./cdp');
const file=__dirname+'/settings.json';
const defaults={fullscreen:'frame',fullscreenEnabled:false,autoChannel:false,staticOverlay:true,sfx:true,glow:true,noise:1,shuffle:false,playlist:false,startup:'showroom',categories:['c','s','a','d','g','k','e','m','n','o','z','p','r','t','f'],last:null};
let needsMigration=!fs.existsSync(file);
let settings;try{settings={...defaults,...JSON.parse(fs.readFileSync(file,'utf8'))};}catch(e){settings={...defaults};}
const modules=['shared','controls','display','pointer','auto-channel','frameless','categories','experience','back','showroom-settings'].map(n=>fs.readFileSync(__dirname+'/'+n+'.js','utf8')).join('\n');
const frameBack=`(function(){if(window.__retroFrameBack)return;window.__retroFrameBack=true;window.addEventListener('keydown',function(e){var code=e.keyCode||e.which;if(code===461||code===27||e.key==='BrowserBack'||e.key==='GoBack'){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat&&typeof retroBack==='function')retroBack('');}},true);})();`+'\n'+fs.readFileSync(__dirname+'/player-style.js','utf8');
const clients=new Map();
function source(){return 'window.__retroSettingsSeed='+JSON.stringify(settings)+';\n'+modules;}
function validPatch(p){let clean={};for(const [k,v] of Object.entries(p||{})){
 if(['fullscreenEnabled','autoChannel','staticOverlay','sfx','glow','shuffle','playlist'].includes(k)&&typeof v==='boolean')clean[k]=v;
 if(k==='fullscreen'&&['frame','none'].includes(v))clean[k]=v;
 if(k==='startup'&&['showroom','resume'].includes(v))clean[k]=v;
 if(k==='noise'&&Number.isInteger(v)&&v>=0&&v<=4)clean[k]=v;
 if(k==='categories'&&Array.isArray(v)&&v.length&&v.every(c=>['c','s','a','d','g','k','e','m','n','o','z','p','r','t','f'].includes(c)))clean.categories=[...new Set(v)];
 if(k==='last'&&v&&['50s','60s','70s','80s','90s','00s'].includes(v.era)&&/^[\w-]{11}$/.test(v.video)&&Number.isFinite(v.time))clean.last={era:v.era,video:v.video,time:Math.max(0,Math.min(v.time,86400))};
}return clean;}
async function refreshScript(entry){if(entry.updating){entry.again=true;return;}entry.updating=true;try{do{entry.again=false;if(entry.script)await entry.c.call('Page.removeScriptToEvaluateOnNewDocument',{identifier:entry.script});entry.script=(await entry.c.call('Page.addScriptToEvaluateOnNewDocument',{source:source()})).identifier;}while(entry.again);}finally{entry.updating=false;}}
function save(patch){const p=validPatch(patch);if(!Object.keys(p).length)return;Object.assign(settings,p);fs.writeFileSync(file+'.tmp',JSON.stringify(settings,null,2));fs.renameSync(file+'.tmp',file);for(const entry of clients.values())if(entry.owned)refreshScript(entry).catch(()=>{});}
async function aspect(entry){if(!entry.owned||entry.sizing)return;entry.sizing=true;try{
 for(const [id,ctx] of entry.contexts){if(!/^https:\/\/(www\.)?youtube(-nocookie)?\.com$/.test(ctx.origin))continue;
  const data=await entry.c.call('Runtime.evaluate',{contextId:id,expression:'(function(){var v=document.querySelector("video");return v&&v.videoWidth&&v.videoHeight?{w:v.videoWidth,h:v.videoHeight}:null;})()',returnByValue:true});
  const dimensions=data.result&&data.result.value;if(dimensions){const key=dimensions.w+'x'+dimensions.h;if(key!==entry.ratio){entry.ratio=key;await entry.c.call('Runtime.evaluate',{expression:'window.__retroApplyVideoRatio&&window.__retroApplyVideoRatio('+dimensions.w+','+dimensions.h+')'});}break;}
 }
}catch(e){}finally{entry.sizing=false;}}
function scan(){const request=http.get('http://127.0.0.1:9998/json/list',res=>{let body='';res.on('data',d=>body+=d);res.on('end',()=>{let targets;try{targets=JSON.parse(body);}catch(e){return;}
 for(const target of targets){if(target.type!=='page'||!target.webSocketDebuggerUrl||clients.has(target.id))continue;const u=new URL(target.webSocketDebuggerUrl);if(!['localhost','127.0.0.1'].includes(u.hostname))continue;
 const c=new CDP(target.webSocketDebuggerUrl),entry={c,owned:false,contexts:new Map(),ratio:null};clients.set(target.id,entry);
 const forget=()=>clients.delete(target.id);c.on('closed',forget);c.on('failure',()=>{c.close();forget();});
 c.on('event',async e=>{try{
  if(entry.owned&&e.method==='Page.frameNavigated'&&!e.params.frame.parentId){entry.ratio=null;setTimeout(async()=>{try{const id=await c.call('Runtime.evaluate',{expression:'typeof PalmSystem!=="undefined"?PalmSystem.identifier:""',returnByValue:true});if(id.result.value==='com.retro.decades.tv')await c.call('Runtime.evaluate',{expression:source()});}catch(err){}},300);}
  if(e.method==='Runtime.executionContextCreated'){entry.contexts.set(e.params.context.id,e.params.context);entry.ratio=null;if(entry.owned&&/^https:\/\/(www\.)?youtube(-nocookie)?\.com$/.test(e.params.context.origin))c.call('Runtime.evaluate',{contextId:e.params.context.id,expression:frameBack}).catch(()=>{});}
  if(e.method==='Runtime.executionContextDestroyed')entry.contexts.delete(e.params.executionContextId);
  if(e.method==='Runtime.executionContextsCleared'){entry.contexts.clear();entry.ratio=null;}
  if(!entry.owned||e.method!=='Runtime.bindingCalled')return;
  const context=entry.contexts.get(e.params.executionContextId);
  if(e.params.name==='retroBack'){if(context&&/^https:\/\/(www\.)?youtube(-nocookie)?\.com$/.test(context.origin))await c.call('Runtime.evaluate',{expression:'window.__retroHandleBack&&window.__retroHandleBack()'});return;}
if(context&&!/^https:\/\/(50s|60s|70s|80s|90s|00s)\.myretrotvs\.com$/.test(context.origin)&&context.origin!=='file://'&&context.origin!=='file://com.retro.decades.tv-webos'&&context.origin!=='')return;
  if(e.params.name==='retroSaveSettings'){save(JSON.parse(e.params.payload));}
  if(e.params.name==='retroReturnShowroom')await c.call('Page.navigate',{url:'file:///media/developer/apps/usr/palm/applications/com.retro.decades.tv/index.html?showroom=1'});
  if(e.params.name==='retroRequestFullscreen')await c.call('Runtime.evaluate',{expression:'document.documentElement.requestFullscreen()',userGesture:true});
 }catch(err){console.log('Compatibility event:',err.message);}});
 c.on('ready',async()=>{try{const identity=await c.call('Runtime.evaluate',{expression:'typeof PalmSystem!=="undefined"?PalmSystem.identifier:""',returnByValue:true});if(identity.result.value!=='com.retro.decades.tv'){c.close();return;}entry.owned=true;
 if(needsMigration){needsMigration=false;try{const old=await c.call('Runtime.evaluate',{expression:`(function(){var p=window.YT&&YT.get&&YT.get('myytplayer'),d=p&&p.getVideoData&&p.getVideoData(),era=(location.hostname.match(/^(50s|60s|70s|80s|90s|00s)\\./)||[])[1];return {fullscreen:localStorage.getItem('retro-fullscreen-surround')==='none'?'none':'frame',fullscreenEnabled:!!document.fullscreenElement,autoChannel:localStorage.getItem('retro-auto-channel')==='true',last:d&&era?{era:era,video:d.video_id,time:p.getCurrentTime()||0}:null};})()`,returnByValue:true});save(old.result.value);}catch(e){}}
 await c.call('Page.enable');await c.call('Runtime.enable');await c.call('Runtime.addBinding',{name:'retroSaveSettings'});await c.call('Runtime.addBinding',{name:'retroRequestFullscreen'});await c.call('Runtime.addBinding',{name:'retroBack'});await c.call('Runtime.addBinding',{name:'retroReturnShowroom'});for(const [id,ctx]of entry.contexts)if(/^https:\/\/(www\.)?youtube(-nocookie)?\.com$/.test(ctx.origin))await c.call('Runtime.evaluate',{contextId:id,expression:frameBack});await refreshScript(entry);await c.call('Runtime.evaluate',{expression:source()});console.log('Shared TV experience attached');
 }catch(e){console.log('Attach retry:',e.message);c.close();}});
 }
 });});request.setTimeout(2500,()=>request.destroy());request.on('error',()=>{});}
scan();setInterval(scan,3000);setInterval(()=>{for(const entry of clients.values())aspect(entry);},1200);
