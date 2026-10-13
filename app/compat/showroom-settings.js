(function(){
 'use strict';
 if(location.protocol!=='file:'||!window.RetroSettings||window.__retroShowroomSettings)return;
 window.__retroShowroomSettings=true;
 function install(){
  var toolbar=document.getElementById('retro-showroom-options');if(!toolbar){setTimeout(install,100);return;}
  var R=RetroSettings,main=document.querySelector('main');
  Array.from(toolbar.querySelectorAll('button')).forEach(function(b){if(/^Start app:/.test(b.textContent))b.remove();});
  var launch=document.createElement('button');launch.type='button';launch.id='retro-global-settings-button';launch.textContent='Global settings';launch.style.cssText='padding:10px 16px;border:2px solid #af9672;border-radius:5px;color:#f5e7ce;background:#27372e;font:17px Arial;cursor:pointer';toolbar.appendChild(launch);
  var style=document.createElement('style');style.textContent='#retro-showroom-settings{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:rgba(8,14,11,.85);font:20px Arial;color:#f5e7ce}#retro-showroom-settings[hidden]{display:none}#retro-showroom-settings .settings-dialog{width:78vw;max-width:1400px;max-height:90vh;overflow:auto;padding:32px 38px;border:2px solid #bba172;border-radius:14px;background:#25372d}#retro-showroom-settings h2{margin:0 0 10px;font-size:36px;font-weight:normal}#retro-showroom-settings p{margin:0 0 20px;color:#bfcbb9;font-size:19px}#retro-showroom-settings h3{margin:22px 0 14px;font-size:20px;color:#e5ca98}#retro-showroom-settings .settings-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}#retro-showroom-settings button{font:20px Arial;text-align:left;padding:16px 20px;border:2px solid #65755f;border-radius:7px;background:#34483a;color:#f5e7ce;cursor:pointer}#retro-showroom-settings button:focus,#retro-showroom-settings button:hover{outline:4px solid #f4c77c;outline-offset:2px;background:#48593e}#retro-showroom-settings button[aria-pressed=true]{border-color:#b8ae78}#retro-showroom-settings .settings-close{margin-top:22px}#retro-showroom-settings .settings-note{margin:18px 0 0;font-size:17px}';document.head.appendChild(style);
  var overlay=document.createElement('div');overlay.id='retro-showroom-settings';overlay.hidden=true;
  overlay.innerHTML='<section class="settings-dialog" role="dialog" aria-modal="true" aria-labelledby="retro-global-title"><h2 id="retro-global-title">Global settings</h2><p>Saved automatically and applied to every decade.</p><h3>Playback &amp; startup</h3><div class="settings-grid" data-group="playback"></div><h3>Picture &amp; effects</h3><div class="settings-grid" data-group="picture"></div><p class="settings-note">Picture sizing is automatic. Arrows + OK select. Back closes this menu.</p><button class="settings-close" type="button">Done</button></section>';
  document.body.appendChild(overlay);var buttons=[];
  function add(group,key,label,next){var b=document.createElement('button');b.type='button';b.dataset.setting=key;b._label=label;b.addEventListener('click',function(){var patch={};patch[key]=next(R.state[key]);R.set(patch);});overlay.querySelector('[data-group='+group+']').appendChild(b);buttons.push(b);}
  function bool(v){return !v;}
  add('playback','autoChannel','Auto change channel',bool);
  add('playback','shuffle','Shuffle',bool);
  add('playback','playlist','Playlist mode',bool);
  add('playback','startup','Start app',function(v){return v==='resume'?'showroom':'resume';});
  add('picture','fullscreenEnabled','Open decades in fullscreen',bool);
  add('picture','fullscreen','Fullscreen surround',function(v){return v==='none'?'frame':'none';});
  add('picture','sfx','Sound effects',bool);
  add('picture','glow','Tube glow',bool);
  add('picture','staticOverlay','Static overlay',bool);
  add('picture','noise','Picture noise',function(v){return (v+1)%5;});
  function render(){buttons.forEach(function(b){var v=R.state[b.dataset.setting],value;if(b.dataset.setting==='startup')value=v==='resume'?'Resume watching':'Showroom';else if(b.dataset.setting==='fullscreen')value=v==='none'?'No TV frame':'TV frame';else if(b.dataset.setting==='noise')value=v?'On · '+v+'/4':'Off';else value=v?'On':'Off';b.textContent=b._label+': '+value;if(typeof v==='boolean')b.setAttribute('aria-pressed',String(v));});}
  function open(){render();overlay.hidden=false;main.inert=true;main.setAttribute('aria-hidden','true');launch.setAttribute('aria-expanded','true');buttons[0].focus();}
  function close(){overlay.hidden=true;main.inert=false;main.removeAttribute('aria-hidden');launch.setAttribute('aria-expanded','false');launch.focus();}
  window.__retroCloseGlobalSettings=close;
  launch.setAttribute('aria-haspopup','dialog');launch.setAttribute('aria-expanded','false');launch.addEventListener('click',open);
  overlay.querySelector('.settings-close').addEventListener('click',close);overlay.addEventListener('click',function(e){if(e.target===overlay)close();});document.addEventListener('retroSettingsChange',render);
  window.addEventListener('keydown',function(e){var code=e.which||e.keyCode;if(code===403){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)overlay.hidden?open():close();return;}if(overlay.hidden)return;
   if([37,38,39,40,9].indexOf(code)<0)return;e.preventDefault();e.stopImmediatePropagation();var choices=Array.from(overlay.querySelectorAll('button')),current=document.activeElement;
   if(code===9){var i=choices.indexOf(current);choices[(i+(e.shiftKey?-1:1)+choices.length)%choices.length].focus();return;}
   var rect=current.getBoundingClientRect(),cx=rect.left+rect.width/2,cy=rect.top+rect.height/2,best=null,score=Infinity;
   choices.forEach(function(b){if(b===current)return;var r=b.getBoundingClientRect(),dx=r.left+r.width/2-cx,dy=r.top+r.height/2-cy;var valid=code===37?dx<-5:code===39?dx>5:code===38?dy<-5:dy>5;if(!valid)return;var s=(code===37||code===39?Math.abs(dx)+Math.abs(dy)*4:Math.abs(dy)+Math.abs(dx)*4);if(s<score){score=s;best=b;}});if(best){best.focus();best.scrollIntoView({block:'nearest'});}
  },true);
  render();
 }
 install();
}());
