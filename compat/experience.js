(function(){
 'use strict';
 if(window.__retroExperience||!window.RetroSettings)return;
 window.__retroExperience=true;
 var R=RetroSettings,state=R.state,era=(location.hostname.match(/^(50s|60s|70s|80s|90s|00s)\./)||[])[1];
 var showroom='file:///media/developer/apps/usr/palm/applications/com.retro.decades.tv/index.html';
 var numberEra={48:'00s',53:'50s',54:'60s',55:'70s',56:'80s',57:'90s',96:'00s',101:'50s',102:'60s',103:'70s',104:'80s',105:'90s'};
 var navigating=false,paused=false,ready=false,applying=false,lastSaved=0,lastVideo='',statusObserver;
 var labels={staticOverlay:'Static overlay',shuffle:'Shuffle',sfx:'Sound effects',glow:'Tube glow',noise:'Picture noise',playlist:'Playlist mode'};
 var codes={79:'staticOverlay',83:'shuffle',77:'sfx',71:'glow',78:'noise',80:'playlist'};
 var originals={staticOverlay:'Toggle static overlay',shuffle:'Toggle shuffle mode',sfx:'Toggle sound effects',glow:'Toggle tube glow',noise:'Change picture noise',playlist:'Toggle playlist mode'};
 var settingButtons={};
 function render(){Object.keys(settingButtons).forEach(function(k){var b=settingButtons[k];b.textContent=labels[k]+': '+(k==='noise'?(state[k]?'On · '+state[k]+'/4':'Off'):(state[k]?'On':'Off'));b.setAttribute('aria-pressed',String(!!state[k]));});}
 function note(text){var s=document.querySelector('#retro-controls-status');if(s)s.textContent=text;}
 function remember(){if(!era||!ready)return;var p=R.player();if(!p)return;var data=p.getVideoData&&p.getVideoData(),video=data&&data.video_id;if(!video||!/^[\w-]{11}$/.test(video))return;var now=Date.now();if(video===lastVideo&&now-lastSaved<10000)return;lastVideo=video;lastSaved=now;R.set({last:{era:era,video:video,time:Math.max(0,Math.floor(p.getCurrentTime()||0))}});}
 function switchEra(next,resume){remember();paused=false;navigating=true;location.href='https://'+next+'.myretrotvs.com/'+(resume&&state.last&&state.last.era===next?'#'+state.last.video:'');}
 function closePanel(){var b=document.querySelector('#retro-controls-close');if(b)b.click();}
 function back(){var panel=document.querySelector('#retro-controls-panel');if(panel&&!panel.hidden){closePanel();return;}if(document.fullscreenElement){document.exitFullscreen();return;}if(era){remember();sessionStorage.setItem('retro-back-to-showroom','true');navigating=true;location.href=showroom+'?showroom=1';}else window.close();}
 function playPause(action){var p=R.player();if(!p||!ready){note('Player is still loading');return;}var play=action==='play'||(action==='toggle'&&p.getPlayerState()!==1);paused=!play;if(play)p.playVideo();else p.pauseVideo();note(play?'Playing':'Paused');}
 document.addEventListener('keydown',function(e){
  var code=e.keyCode||e.which;
  // Real remote numbers select decades; synthetic number shortcuts still select years.
  if(e.isTrusted&&numberEra[code]){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)switchEra(numberEra[code],false);return;}
  if(code===461||code===27){e.preventDefault();e.stopImmediatePropagation();back();return;}
  if(era&&[427,428,415,19,413,179,403].indexOf(code)>=0){e.preventDefault();e.stopImmediatePropagation();if(code===427||code===428){paused=false;R.key(code===427?39:37);}else if(code===403){R.key(72);}else playPause(code===415?'play':code===19||code===413?'pause':'toggle');return;}
 },true);
 // Observe all shortcut-driven native setting changes, including the site's controls.
 document.addEventListener('keydown',function(e){var name=codes[e.which||e.keyCode];if(!name||applying||!ready)return;var patch={};patch[name]=name==='noise'?(state.noise+1)%5:!state[name];R.set(patch);render();},true);
 document.addEventListener('retroSettingsChange',render);
 if(!era){
  function menu(){var nav=document.querySelector('#decades');if(!nav){setTimeout(menu,100);return;}
   var toolbar=document.createElement('div');toolbar.id='retro-showroom-options';toolbar.style.cssText='display:flex;gap:16px;align-items:center;margin:10px 30px;font:17px Arial';
   var resume=document.createElement('button');resume.type='button';resume.textContent='Resume watching';resume.disabled=!state.last;resume.addEventListener('click',function(){switchEra(state.last.era,true);});
   var startup=document.createElement('button');startup.type='button';function label(){startup.textContent='Start app: '+(state.startup==='resume'?'Resume watching':'Showroom');}label();startup.addEventListener('click',function(){R.set({startup:state.startup==='resume'?'showroom':'resume'});label();});
   [resume,startup].forEach(function(b){b.style.cssText='padding:10px 16px;border:2px solid #af9672;border-radius:5px;color:#f5e7ce;background:#27372e;font:17px Arial;cursor:pointer';toolbar.appendChild(b);});
   document.querySelector('footer').before(toolbar);
   if(state.startup==='resume'&&state.last&&location.search.indexOf('showroom=1')<0&&performance.getEntriesByType('navigation')[0]?.type!=='back_forward')switchEra(state.last.era,true);
  }
  menu();return;
 }
 // Pausing must not reach the site's onVideoPausedCallback, which otherwise reloads a clip.
 window.addEventListener('message',function(e){var iframe=document.querySelector('#myytplayer');if(!iframe||e.source!==iframe.contentWindow||!/^https:\/\/(www\.)?youtube(-nocookie)?\.com$/.test(e.origin))return;var m;try{m=typeof e.data==='string'?JSON.parse(e.data):e.data;}catch(err){return;}
  if(m&&m.event==='onStateChange'&&m.info===2){e.stopImmediatePropagation();return;}
  if(m&&m.event==='onStateChange'&&m.info===0&&paused)e.stopImmediatePropagation();
 },true);
 document.addEventListener('fullscreenchange',function(){if(!navigating)R.set({fullscreenEnabled:!!document.fullscreenElement});});
 function nativeReady(){
  var p=R.player(),power=document.querySelector('#tvknob'),panel=document.querySelector('#retro-controls-panel');
  if(!p||typeof p.getPlayerState!=='function'||!panel||document.querySelector('.wrapper')?.classList.contains('noclicky')){setTimeout(nativeReady,300);return;}
  // The API interface is only available after onReady; controls also need the native channel catalog.
  if(!p.getVideoData||!document.querySelector('#lcdbar')){setTimeout(nativeReady,300);return;}
  var grid=panel.querySelector('.retro-grid');
  Object.keys(originals).forEach(function(k){settingButtons[k]=Array.from(grid.querySelectorAll('button')).find(function(b){return b.textContent===originals[k];});if(!settingButtons[k])delete settingButtons[k];});
  applying=true;
  if(!state.staticOverlay)R.key(79);if(!state.sfx)R.key(77);if(!state.glow)R.key(71);if(state.shuffle)R.key(83);if(state.playlist)R.key(80);
  var defaultNoise=Number(new URLSearchParams(location.search).get('noiseMode')||1);for(var i=0;i<(state.noise-defaultNoise+5)%5;i++)R.key(78);
  applying=false;ready=true;render();
  // Replace manual aspect selection with dimensions reported by the live player.
  grid.querySelectorAll('[data-retro-aspect]').forEach(function(b){b.remove();});
  var sizing=document.createElement('div');sizing.id='retro-auto-sizing';sizing.style.cssText='grid-column:1/-1;padding:8px;color:#d2ccb9;font-size:17px';sizing.textContent='Picture sizing: Auto · waiting for video';grid.appendChild(sizing);
  document.querySelector('#retro-controls-title').textContent='TV settings · all decades';
  var startup=document.createElement('button');startup.type='button';function startupLabel(){startup.textContent='Start app: '+(state.startup==='resume'?'Resume watching':'Showroom');}startupLabel();startup.addEventListener('click',function(){R.set({startup:state.startup==='resume'?'showroom':'resume'});startupLabel();});grid.appendChild(startup);
  var pause=document.createElement('button');pause.type='button';pause.textContent='Play / pause';pause.addEventListener('click',function(){playPause('toggle');});grid.appendChild(pause);
  var home=document.createElement('button');home.type='button';home.textContent='Return to showroom';home.addEventListener('click',function(){remember();navigating=true;location.href=showroom+'?showroom=1';});grid.appendChild(home);
  document.querySelector('#retro-controls-panel p').textContent='Arrows + OK select · Red opens settings · Back closes · 5–9 / 0 switch decades';
  if(window.__retroApplyCategories)window.__retroApplyCategories();
  // Power is initially off on fresh site navigation. Already-playing pages remain on.
  if(getComputedStyle(document.querySelector('#myytplayer')).visibility==='hidden'||!location.hash)R.key(32);
  if(state.fullscreenEnabled&&typeof window.retroRequestFullscreen==='function')window.retroRequestFullscreen('');
  if(location.hash&&state.last&&state.last.era===era&&location.hash.slice(1)===state.last.video&&state.last.time>0){var resumeTime=state.last.time;setTimeout(function(){var player=R.player();if(player&&player.getVideoData().video_id===state.last.video)player.seekTo(resumeTime,true);},1800);}
  setInterval(remember,2000);window.addEventListener('pagehide',remember);window.addEventListener('hashchange',function(){paused=false;setTimeout(remember,600);});
  // Read native status messages, including changes made using the physical TV knobs.
  var status=document.querySelector('#statusbar');if(status){statusObserver=new MutationObserver(function(){var text=status.textContent,patch={};if(/Static transition (overlay|sound) is now/i.test(text))patch.staticOverlay=/enabled/i.test(text);if(/Shuffle mode/i.test(text))patch.shuffle=/mode is on/i.test(text);if(/Sound effects are now/i.test(text))patch.sfx=/enabled/i.test(text);if(/Tube glow effect is now/i.test(text))patch.glow=/enabled/i.test(text);if(/Vintage picture noise is now/i.test(text))patch.noise=/disabled/i.test(text)?0:Number((text.match(/\((\d)x\)/)||[])[1]||state.noise);if(/Playlist mode is/i.test(text))patch.playlist=/mode is on/i.test(text);if(Object.keys(patch).length){R.set(patch);render();}});statusObserver.observe(status,{childList:true,subtree:true,characterData:true});}
 }
 nativeReady();
 window.__retroApplyVideoRatio=function(w,h){if(!w||!h)return;var ratio=w/h;if(ratio<0.3||ratio>4)return;window.__retroDetectedAspect=ratio;if(window.__retroDisplaySetAspect)window.__retroDisplaySetAspect(ratio);document.dispatchEvent(new Event('retroAspectChange'));var label=document.querySelector('#retro-auto-sizing');if(label)label.textContent='Picture sizing: Auto · '+w+' × '+h;};
}());
