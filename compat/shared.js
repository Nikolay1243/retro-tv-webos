(function(){
 'use strict';
 if(!/^https:\/\/(50s|60s|70s|80s|90s|00s)\.myretrotvs\.com$/.test(location.origin)&&!(location.protocol==='file:'&&location.pathname.indexOf('/com.retro.decades.tv/index.html')>=0))return;
 if(window.RetroSettings)return;
 var state=Object.assign({fullscreen:'frame',fullscreenEnabled:false,autoChannel:false,staticOverlay:true,sfx:true,glow:true,noise:1,shuffle:false,playlist:false,startup:'showroom',categories:['c','s','a','d','g','k','e','m','n','o','z','p','r','t','f'],last:null},window.__retroSettingsSeed||{});
 var storageKeys={'retro-fullscreen-surround':'fullscreen','retro-auto-channel':'autoChannel'};
 var rawSet=Storage.prototype.setItem;
 function seed(){try{rawSet.call(localStorage,'retro-fullscreen-surround',state.fullscreen);rawSet.call(localStorage,'retro-auto-channel',String(state.autoChannel));}catch(e){}}
 function save(patch){Object.assign(state,patch);seed();if(typeof window.retroSaveSettings==='function')window.retroSaveSettings(JSON.stringify(patch));document.dispatchEvent(new CustomEvent('retroSettingsChange',{detail:patch}));}
 seed();
 Storage.prototype.setItem=function(k,v){rawSet.call(this,k,v);if(this===localStorage&&storageKeys[k]){var p={};p[storageKeys[k]]=k==='retro-auto-channel'?v==='true':v;save(p);}};
 window.RetroSettings={state:state,set:save,key:function(code){var e=new KeyboardEvent('keydown',{bubbles:true,cancelable:true,keyCode:code,which:code});if(e.which!==code)Object.defineProperty(e,'which',{get:function(){return code;}});if(e.keyCode!==code)Object.defineProperty(e,'keyCode',{get:function(){return code;}});document.dispatchEvent(e);},player:function(){return window.YT&&YT.get&&YT.get('myytplayer');}};
}());
