(function(){
 'use strict';
 if(!window.RetroSettings||window.__retroBackInstalled)return;
 window.__retroBackInstalled=true;
 var last=0;
 window.__retroHandleBack=function(){
  var now=Date.now();if(now-last<350)return;last=now;
  var globalMenu=document.getElementById('retro-showroom-settings');if(globalMenu&&!globalMenu.hidden){window.__retroCloseGlobalSettings();return;}
  var panel=document.querySelector('#retro-controls-panel');
  if(panel&&!panel.hidden){var close=document.querySelector('#retro-controls-close');if(close)close.click();return;}
  if(location.protocol==='file:'){window.close();return;}
  try{var p=RetroSettings.player(),data=p&&p.getVideoData(),era=location.hostname.slice(0,3);if(data&&/^[\w-]{11}$/.test(data.video_id))RetroSettings.set({last:{era:era,video:data.video_id,time:p.getCurrentTime()||0}});}catch(e){}
  // Debugger navigation can safely return from an HTTPS page to the app's local entry.
  if(typeof window.retroReturnShowroom==='function')window.retroReturnShowroom('');
  else history.back();
 };
 window.addEventListener('keydown',function(e){var code=e.keyCode||e.which;if(code!==461&&code!==27&&e.key!=='BrowserBack'&&e.key!=='GoBack')return;e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)window.__retroHandleBack();},true);
}());
